import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { hashPassword } from '../src/lib/passwords.ts';
import postgres from 'postgres';
import { inspectAdmin, recoverAdmin } from './recover-admin.ts';

const modulePath = process.env.WARGAHUB_PG_MODULE;
const vercelEntry = process.env.WARGAHUB_TEST_VERCEL_ENTRY;
const nodeEntry = process.env.WARGAHUB_TEST_NODE_ENTRY || 'dist/server/entry.mjs';
const { default: EmbeddedPostgres } = modulePath
  ? await import(pathToFileURL(path.resolve(modulePath)).href) : await import('embedded-postgres');
await mkdir('scratch', { recursive:true });
const directory = await mkdtemp(path.resolve('scratch/postgres-operations-'));
async function freePort() {
  const socket = net.createServer();
  socket.listen(0,'127.0.0.1');
  await once(socket,'listening');
  const port = socket.address().port;
  await new Promise((resolve,reject)=>socket.close(error=>error?reject(error):resolve()));
  return port;
}
const pgPort = await freePort();
let appPort;
do { appPort = await freePort(); } while (appPort === pgPort);
const password = randomBytes(20).toString('hex');
const loginPassword = randomBytes(24).toString('hex');
const username = 'wargahub_fixture';
const db = new EmbeddedPostgres({databaseDir:path.join(directory,'pg'),port:pgPort,user:username,password,persistent:true,
  initdbFlags:['--locale=C','--encoding=UTF8'],postgresFlags:['-h','127.0.0.1'],onLog:()=>{}});
const env = {...process.env,DATABASE_URL:`postgresql://${username}:${password}@127.0.0.1:${pgPort}/postgres?sslmode=disable`,
  WARGAHUB_DATA_DIR:path.join(directory,'app'),HOST:'127.0.0.1',PORT:String(appPort),NODE_ENV:'production'};
const base = vercelEntry ? 'https://wargahub.fixture.invalid' : 'http://127.0.0.1:' + appPort;
let appFetch = fetch;
const run = async args => {
  const process = spawn(globalThis.process.execPath,args,{env,stdio:['ignore','ignore','pipe']});
  let errors = '';
  process.stderr.on('data',chunk=>{errors+=chunk;});
  const [code] = await once(process,'exit');
  assert.equal(code,0,args.join(' ') + ': ' + errors.replaceAll(password,'[redacted]'));
};
const invoke = async (route, cookie, body) => {
  const response = await appFetch(base+route,{redirect:'manual',method:body?'POST':'GET',
    headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:base}:{})},
    body:body?JSON.stringify(body):undefined});
  const raw = await response.text();
  let payload; try { payload=JSON.parse(raw); } catch { payload=raw; }
  return {status:response.status,payload,location:response.headers.get('location'),cookie:response.headers.getSetCookie().map(item=>item.split(';')[0]).join('; ')};
};
const call = async (route,cookie,body,status=200) => {
  const res=await invoke(route,cookie,body);
  assert.equal(res.status,status,route+' '+JSON.stringify(res.payload).slice(0,250));
  return res.payload?.data ?? res.payload;
};
const login = async identifier => {
  const res=await invoke('/api/auth/login',null,{identifier,password:loginPassword});
  assert.equal(res.status,200,identifier+' could not log in: '+JSON.stringify(res.payload));
  return res.cookie;
};

let app,client,started=false,logs='';
try {
  await db.initialise(); await db.start(); started=true;
  await run(['--import','tsx','scripts/migrate-neon.ts']);
  for (let i=0;i<2;i++) await run(['--import','tsx','scripts/migrate-operations.ts','--postgres']);
  client=db.getPgClient(); await client.connect();
  const sql=async (statement,values=[]) => (await client.query(statement,values)).rows;
  const [version] = await sql("SELECT current_setting('server_version') AS version");
  console.log('PostgreSQL '+version.version+'; skema baru dan migrasi idempoten.');
  await sql("INSERT INTO communities (id,code,name,address,city) VALUES ('comm-01','FIXTURE','Lingkungan Uji','Alamat Uji','Bandung')");
  await sql("INSERT INTO properties (id,community_id,code,number,address) VALUES ('fixture-house-1','comm-01','U-01','01','Rumah Uji Satu'),('fixture-house-2','comm-01','U-02','02','Rumah Uji Dua')");
  await sql("INSERT INTO accounts (id,community_id,code,name,type,balance) VALUES ('acc-main','comm-01','MAIN','Kas Uji','BANK',1000000)");
  await sql("INSERT INTO expense_categories (id,community_id,name,code) VALUES ('cat-pemeliharaan','comm-01','Pemeliharaan','PEMELIHARAAN'),('cat-dana-kesehatan','comm-01','Bantuan Sosial','SOSIAL')");
  const hashed=hashPassword(loginPassword);
  for (const [id,role,house,code] of [['chair','CHAIRMAN',null,null],['super','SUPER_ADMIN',null,null],['secretary','SECRETARY',null,null],['treasurer','TREASURER',null,null],['cleaner','MAINTENANCE',null,null],
    ['owner','HOUSE_OWNER','fixture-house-1','U-01'],['neighbor','HOUSE_OWNER','fixture-house-2','U-02'],['auditor','AUDITOR',null,null]]) {
    await sql('INSERT INTO users (id,username,email,full_name,role,password_hash,property_id,property_code) VALUES ($1,$1,$2,$3,$4,$5,$6,$7)',
      [id,id+'@fixture.invalid','Uji '+id,role,hashed,house,code]);
  }
  if (vercelEntry) {
    Object.assign(process.env, {DATABASE_URL:env.DATABASE_URL,WARGAHUB_DATA_DIR:env.WARGAHUB_DATA_DIR,NODE_ENV:env.NODE_ENV});
    const { default: handler } = await import(pathToFileURL(path.resolve(vercelEntry)).href);
    appFetch = (url, options) => handler.fetch(new Request(url,options));
    assert.equal((await call('/api/health')).database.status,'CONNECTED_HEALTHY');
  } else {
    app=spawn(process.execPath,[nodeEntry],{env,stdio:['ignore','pipe','pipe']});
    app.stdout.on('data',chunk=>{logs+=chunk;}); app.stderr.on('data',chunk=>{logs+=chunk;});
    const deadline=Date.now()+20000;
    while (!(await fetch(base+'/api/health').then(res=>res.ok).catch(()=>false))) {
      if (Date.now()>deadline || app.exitCode!==null) throw Error('Aplikasi uji gagal dimulai.');
      await delay(150);
    }
  }
  const [chair,chair2,owner,owner2,neighbor,treasurer,treasurer2,cleaner] = await Promise.all(
    ['chair','chair','owner','owner','neighbor','treasurer','treasurer','cleaner'].map(login));
  assert.notEqual(owner,owner2); assert.notEqual(treasurer,treasurer2);
  if (vercelEntry) {
    const loggedOut = await login('super');
    const sessionId = loggedOut.match(/(?:^|; )astro-session=([^;]+)/)?.[1];
    assert.ok(sessionId);
    const readSession = async () => (await sql('SELECT data FROM wargahub_sessions WHERE session_id=$1',[sessionId]))[0];
    assert.ok((await readSession()).data);
    await call('/api/properties',loggedOut);
    await call('/api/auth/logout',loggedOut,{});
    assert.equal((await readSession()).data,null);
    await call('/api/properties',loggedOut,undefined,401);
    console.log('PASS sesi Vercel: login membuat sesi PostgreSQL, permintaan berikutnya membacanya, dan logout mencabutnya.');
  }
  const overview = cookie => call('/api/resident/overview',cookie);
  assert.equal((await overview(owner)).property.id,'fixture-house-1');

  const occupantFields={propertyId:'fixture-house-1',fullName:'Penghuni Pengujian',relation:'ANAK',idCardNumber:'0000000000001234'};
  await call('/api/properties/occupants/create',neighbor,occupantFields,403);
  const occupant=await call('/api/properties/occupants/create',owner,occupantFields,201);
  assert.ok((await call('/api/properties/occupants',chair)).some(item=>item.id===occupant.id));
  assert.equal((await overview(owner2)).occupants.find(item=>item.id===occupant.id).idCardNumber,'••••1234');
  assert.ok(!(await overview(neighbor)).occupants.some(item=>item.id===occupant.id));
  await call('/api/properties/occupants/create',chair,{...occupantFields,id:occupant.id,fullName:'Penghuni Diperbarui'},201);
  assert.equal((await overview(owner2)).occupants.find(item=>item.id===occupant.id).fullName,'Penghuni Diperbarui');
  assert.ok((await invoke('/admin/properties?tab=residents',chair2)).payload.includes('Penghuni Diperbarui'));
  await call('/api/properties/occupants/delete',owner,{id:occupant.id,propertyId:'fixture-house-1'});
  assert.ok(!(await overview(owner2)).occupants.some(item=>item.id===occupant.id));

  const permit=await call('/api/properties/permits/create',owner,{propertyId:'fixture-house-1',workType:'Pengecatan',contractorName:'Vendor Uji',
    workersCount:2,startDate:'2099-01-02',endDate:'2099-01-05',description:'Cat ruang bersama.'},201);
  assert.ok((await call('/api/properties/permits',chair)).some(item=>item.id===permit.id));
  const decision={id:permit.id,expectedStatus:'PENDING_REVIEW',status:'APPROVED'};
  await call('/api/properties/permits/status',owner,decision,403);
  await call('/api/properties/permits/status',chair,decision);
  await call('/api/properties/permits/status',chair2,decision,409);
  assert.equal((await overview(owner2)).permits.find(item=>item.id===permit.id).status,'APPROVED');
  assert.ok((await invoke('/warga?tab=rumah&section=permits',owner2)).payload.includes('Vendor Uji'));
  assert.ok(!(await overview(neighbor)).permits.some(item=>item.id===permit.id));

  const loan=await call('/api/expenses/loans/create',treasurer,{staffName:'Petugas Uji',staffRole:'SATPAM',baseSalary:2000000,totalLoanAmount:400000,
    monthlyDeduction:200000,tenorMonths:2,loanDate:'2026-10-01',purpose:'Uji persetujuan kasbon.'},201);
  const installment={loanId:loan.id,installmentAmount:200000,paymentMethod:'TRANSFER_BANK',accountId:'acc-main',installmentDate:'2026-10-05',requestId:'fixture-installment'};
  assert.equal((await call('/api/expenses/loans',treasurer2)).find(item=>item.id===loan.id).status,'PENDING_APPROVAL');
  await call('/api/expenses/loans/installment',treasurer,installment,409);
  await call('/api/expenses/loans/decision',chair,{loanId:loan.id,decision:'APPROVE'});
  assert.equal((await call('/api/expenses/loans',treasurer2)).find(item=>item.id===loan.id).status,'AWAITING_DISBURSEMENT');
  await call('/api/expenses/loans/installment',treasurer2,installment,409);
  assert.ok((await invoke('/admin/staff-loans',treasurer2)).payload.includes(loan.id));
  await call('/api/expenses/loans/delete',treasurer,{loanId:loan.id,reason:'Belum dicairkan'},403);
  assert.equal((await call('/api/expenses/loans/delete',chair,{loanId:loan.id,reason:'Pengajuan batal sebelum pencairan'})).loan.status,'ARCHIVED');
  assert.match((await invoke('/admin/staff-loans?tab=repayment_history',treasurer2)).payload,/Ditarik/);

  const task=await call('/api/cleaning/tasks/create',cleaner,{taskName:'Sapu jalan uji',category:'SAPU_JALAN',location:'Blok Uji',assignedTo:'Petugas Uji'},201);
  assert.ok((await call('/api/cleaning/tasks',chair)).some(item=>item.id===task.id && !item.isCompleted));
  await call('/api/cleaning/tasks/update',chair2,{id:task.id,expectedCompleted:false,isCompleted:true});
  assert.ok((await call('/api/cleaning/tasks',cleaner)).some(item=>item.id===task.id && item.isCompleted && item.completedAt));
  await call('/api/cleaning/tasks/update',chair,{id:task.id,expectedCompleted:false,isCompleted:true},409);
  assert.ok((await invoke('/admin/cleaning-staff?tab=daily_checklist',cleaner)).payload.includes('Sapu jalan uji'));

  const facility=await call('/api/facilities/create',chair,{name:'Balai Uji',code:'F-UJI',category:'BALAI_WARGA',location:'Blok Uji',capacity:30,hourlyRate:20000},201);
  assert.equal((await call('/api/facilities',cleaner)).find(item=>item.id===facility.id).capacity,30);
  assert.ok((await overview(owner2)).facilities.some(item=>item.id===facility.id));
  assert.ok((await invoke('/admin/facilities',chair2)).payload.includes('Balai Uji'));
  const booking={facilityId:facility.id,propertyId:'fixture-house-1',date:'2099-01-03',startTime:'09:00',endTime:'10:00',purpose:'Uji reservasi'};
  await call('/api/facilities/update',cleaner,{id:facility.id,condition:'NEEDS_REPAIR'});
  await call('/api/facilities/book',owner,booking,409);
  await call('/api/facilities/update',chair2,{id:facility.id,condition:'GOOD'});
  const reservation=await call('/api/facilities/book',owner,booking,201);
  await call('/api/facilities/delete',chair,{id:facility.id},409);
  await call('/api/facilities/booking-status',chair,{id:reservation.id,status:'REJECTED'});
  await call('/api/facilities/delete',chair,{id:facility.id});
  await call('/api/facilities/book',owner,booking,404);
  assert.ok(!(await overview(owner2)).facilities.some(item=>item.id===facility.id));
  console.log('PASS 5 modul: dua sesi independen, batas antar rumah, serta fasilitas dan reservasi.');

  const tariff={components:[{name:'Keamanan uji',amount:150000},{name:'Kebersihan uji',amount:100000}],dueDay:19,note:'Tarif lintas sesi'};
  await call('/api/billing/tariff',owner,tariff,403);
  assert.equal((await call('/api/billing/tariff',treasurer,tariff)).total,250000);
  const savedTariff=await call('/api/billing/tariff',treasurer2);
  assert.deepEqual(savedTariff.components,tariff.components);
  assert.equal(savedTariff.dueDay,19);
  const batch={year:2026,month:11,name:'November 2026',dueDate:'2026-11-30',expectedTariffTotal:250000};
  await call('/api/billing/generate-batch',treasurer,{...batch,expectedTariffTotal:260000},409);
  const published = await call('/api/billing/generate-batch',treasurer,batch,201);
  assert.equal(published.newlyGenerated,2);
  assert.equal((await call('/api/billing/generate-batch',treasurer2,batch,201)).newlyGenerated,0);
  const invoice=(await overview(owner2)).invoices.find(item=>item.billingPeriodId===published.periodId);
  const otherInvoice=(await overview(neighbor)).invoices.find(item=>item.billingPeriodId===published.periodId);
  assert.equal(invoice.remaining,250000);
  assert.deepEqual(invoice.items.map(item=>[item.name,item.amount]).sort(),tariff.components.map(item=>[item.name,item.amount]).sort());
  await call('/api/billing/tariff',treasurer,{...tariff,components:[{name:'Tarif baru',amount:275000}]});
  assert.equal((await call('/api/settings/profile')).profile.monthlyRate,275000);
  assert.equal((await overview(owner2)).invoices.find(item=>item.id===invoice.id).items.length,2);
  const payment={propertyId:'fixture-house-1',billingPeriodId:published.periodId,invoiceId:invoice.id,amount:100000,method:'TRANSFER',reference:'FIXTURE-FIRST',proofFileUrl:'https://proof.example.invalid/fixture'};
  await call('/api/payments/submit',owner,{...payment,invoiceId:otherInvoice.id},400);
  const first=await call('/api/payments/submit',owner,payment,201);
  assert.equal((await overview(owner2)).invoices.find(item=>item.id===invoice.id).awaitingVerification,true);
  const billPage=await invoke('/admin/billing?period='+published.periodId+'&invoice='+invoice.id,treasurer2);
  assert.equal(billPage.status,200);
  assert.ok(billPage.payload.includes('payment='+first.id));
  const publicBill=await invoke('/rekap-iuran?period='+published.periodId);
  assert.equal(publicBill.status,302);
  assert.equal(publicBill.location,'/transparency/2026/11?tab=dues_breakdown');
  const aggregateBill=await invoke(publicBill.location);
  assert.equal(aggregateBill.status,200);
  assert.match(aggregateBill.payload,/Rekap iuran/);
  assert.doesNotMatch(aggregateBill.payload,/U-01|FIXTURE-FIRST|proof\.example\.invalid/);
  const receiptRoute=id=>'/api/receipts/verify?q='+encodeURIComponent('KW-'+id.toUpperCase());
  await call(receiptRoute(first.id),null,undefined,404);
  await call('/api/payments/verify',owner,{paymentId:first.id},403);
  await call('/api/payments/verify',treasurer,{paymentId:first.id,accountId:'missing-account'},409);
  assert.equal(Number((await sql("SELECT balance FROM accounts WHERE id='acc-main'"))[0].balance),1000000);
  const verified=await Promise.all([treasurer,treasurer2].map(cookie=>invoke('/api/payments/verify',cookie,{paymentId:first.id})));
  assert.deepEqual(verified.map(res=>res.status).sort(),[200,409]);
  assert.equal(verified.find(res=>res.status===200).payload.data.invoiceStatus,'PARTIAL');
  const afterPartial=(await overview(owner2)).invoices.find(item=>item.id===invoice.id);
  assert.equal(afterPartial.remaining,150000);
  assert.equal(afterPartial.awaitingVerification,false);
  assert.equal(afterPartial.receipts[0].amount,100000);
  assert.equal((await call(receiptRoute(first.id))).amount,100000);
  const second=await call('/api/payments/submit',owner2,{...payment,amount:150000,reference:'FIXTURE-SECOND'},201);
  const paid=await call('/api/payments/verify',treasurer2,{paymentId:second.id});
  assert.equal(paid.invoiceStatus,'PAID');
  const complete=(await overview(owner)).invoices.find(item=>item.id===invoice.id);
  assert.equal(complete.remaining,0);
  assert.equal(complete.status,'paid');
  assert.deepEqual(complete.receipts.map(item=>item.amount).sort(),[100000,150000]);
  assert.equal((await call(receiptRoute(second.id))).amount,150000);
  const ledger=await sql("SELECT source_id,amount,direction,account_id FROM ledger_entries WHERE source_type='PAYMENT' ORDER BY amount");
  assert.deepEqual(ledger.map(row=>[row.source_id,Number(row.amount),row.direction,row.account_id]),[[first.id,100000,'IN','acc-main'],[second.id,150000,'IN','acc-main']]);
  assert.equal(Number((await sql("SELECT balance FROM accounts WHERE id='acc-main'"))[0].balance),1250000);
  assert.deepEqual((await sql('SELECT payment_id,invoice_id,amount FROM payment_allocations ORDER BY amount')).map(row=>[row.payment_id,row.invoice_id,Number(row.amount)]),
    [[first.id,invoice.id,100000],[second.id,invoice.id,150000]]);
  assert.deepEqual((await sql("SELECT DISTINCT actor_user_id FROM audit_logs WHERE action='payment.verify'")).map(row=>row.actor_user_id),['treasurer']);
  await call('/api/billing/invoices/update',treasurer,{invoiceId:invoice.id,status:'UNPAID'},409);
  await call('/api/billing/invoices/delete',treasurer,{invoiceId:invoice.id},409);
  await call('/api/payments/delete',treasurer,{paymentId:first.id},409);
  await call('/api/ledger/delete',treasurer,{ledgerId:paid.ledgerId,reason:'Jurnal dari pembayaran'},400);
  const ledgerPage=await invoke('/admin/ledger',treasurer);
  assert.equal(ledgerPage.status,200);
  assert.ok(ledgerPage.payload.includes(paid.ledgerId));
  const history = await invoke('/admin/payments?tab=history&search=U-01&period=November%202026',treasurer2);
  assert.equal(history.status,200);
  assert.ok(history.payload.includes(first.id) && history.payload.includes(second.id));
  const cash = await call('/api/billing/invoices/create',treasurer,{propertyCode:'U-02',periodName:'Desember 2026',
    total:125000,dueDate:'2026-12-10',paidAt:'2026-12-01',status:'PAID',paymentMethod:'CASH'},201);
  assert.equal(cash.status,'PAID');
  assert.equal((await call(receiptRoute(cash.payment.id))).amount,125000);
  assert.equal((await sql('SELECT entry_date FROM ledger_entries WHERE id=$1',[cash.payment.ledgerId]))[0].entry_date,'2026-12-01');
  assert.equal(Number((await sql("SELECT balance FROM accounts WHERE id='acc-main'"))[0].balance),1375000);
  const unpaid = await call('/api/billing/invoices/create',treasurer,{propertyCode:'U-01',periodName:'Desember 2026',total:30000,dueDate:'2026-12-10'},201);
  const edited = await call('/api/billing/invoices/update',treasurer,{invoiceId:unpaid.id,total:35000});
  assert.equal(edited.total,35000);
  await call('/api/billing/invoices/delete',treasurer,{invoiceId:unpaid.id});
  assert.ok(!(await overview(owner)).invoices.some(item=>item.id===unpaid.id));
  const [superAdmin,secretary]=await Promise.all(['super','secretary'].map(login));
  const newHouse=await call('/api/properties/create',chair,{code:'R-10',address:'Jalan Audit 10',ownerName:'Pemilik Audit',
    occupantName:'Kepala Audit',buildingType:'Tipe audit',landArea:88,occupancyStatus:'RENTED'},201);
  assert.equal(newHouse.legalOwner,'Pemilik Audit'); assert.equal(newHouse.headName,'Kepala Audit');
  assert.equal(newHouse.residentCount,1); assert.equal(newHouse.landArea,88);
  await call('/api/properties/create',chair2,{code:'r-10',address:'Alamat duplikat'},409);
  const head=(await call('/api/properties/occupants',chair2)).find(item=>item.propertyId===newHouse.id);
  assert.equal(head.relation,'KEPALA_KELUARGA');
  const updatedHouse=await call('/api/properties/update',chair,{id:newHouse.id,code:'R-10',ownerName:'Pemilik Baru',occupantName:'Kepala Diperbarui'});
  assert.equal(updatedHouse.legalOwner,'Pemilik Baru');
  assert.equal((await call('/api/properties/occupants',chair)).find(item=>item.id===head.id).fullName,'Kepala Diperbarui');
  assert.equal((await sql('SELECT count(*) AS count FROM property_ownerships WHERE property_id=$1 AND is_active=false',[newHouse.id]))[0].count,'1');
  await call('/api/properties/update',chair,{id:newHouse.id,occupancyStatus:'VACANT'},409);
  await call('/api/properties/delete',chair,{id:newHouse.id},409);
  await call('/api/properties/occupants/delete',chair,{id:head.id});
  assert.equal((await call('/api/properties/update',chair,{id:newHouse.id,occupancyStatus:'VACANT'})).occupancyStatus,'VACANT');
  await call('/api/properties/delete',chair,{id:newHouse.id});
  assert.ok(!(await call('/api/properties',chair2)).some(item=>item.id===newHouse.id));
  const spec=await call('/api/properties/update',owner,{id:'fixture-house-1',buildingType:'Tipe renovasi',landArea:72});
  assert.equal(spec.buildingType,'Tipe renovasi'); assert.equal((await overview(owner2)).property.landArea,72);
  await call('/api/properties/update',owner,{id:'fixture-house-1',occupancyStatus:'VACANT'},403);
  const meter={propertyId:'fixture-house-1',plnCapacity:'2200 VA',pamMeterNo:'UJI-010',pamReadingLastMonth:120,pamReadingThisMonth:135};
  const utility=await call('/api/properties/utilities/create',chair,{...meter,paymentStatus:'LUNAS'},201);
  assert.equal(utility.paymentStatus,'BELUM_ADA_TAGIHAN'); assert.equal(utility.monthlyIplFee,null); assert.equal(utility.pamUsage,15);
  assert.equal((await overview(owner2)).property.pamMeterNo,'UJI-010');
  await call('/api/properties/utilities/create',chair,{...meter,pamReadingThisMonth:119},400);
  const paidUtility=await call('/api/properties/utilities/create',chair,{...meter,propertyId:'fixture-house-2'},201);
  assert.equal(paidUtility.paymentStatus,'LUNAS'); assert.equal(paidUtility.monthlyIplFee,125000);
  assert.equal((await call('/api/properties/utilities',secretary)).find(item=>item.id===paidUtility.id).paymentStatus,'TERBATAS');
  await call('/api/properties/utilities/delete',chair,{utilityId:utility.id});
  assert.ok(!(await call('/api/properties/utilities',chair2)).some(item=>item.id===utility.id));
  const adminHouse=await invoke('/admin/properties?tab=analytics&house=U-02',chair2);
  assert.equal(adminHouse.status,200); assert.ok(adminHouse.payload.includes('Desember 2026'));
  await sql("INSERT INTO accounts (id,community_id,code,name,type,balance) VALUES ('acc-fixture-cash','comm-01','FIXTURE-CASH','Kas tunai uji','CASH',0)");
  const manual={invoiceId:otherInvoice.id,amount:50000,paidAt:'2026-11-03',method:'CASH',reference:'FIXTURE-CASH-01',accountId:'acc-fixture-cash'};
  await call('/api/payments/create',treasurer,{...manual,propertyCode:'U-01'},400);
  const manualPaid=await call('/api/payments/create',treasurer,manual,201);
  assert.equal(manualPaid.propertyCode,'U-02');
  assert.equal(manualPaid.billingPeriodId,published.periodId);
  assert.equal(manualPaid.accountBalance,50000);
  await call('/api/payments/create',treasurer2,manual,409);
  const linked=await invoke('/admin/ledger?tab=ledger_list&payment='+manualPaid.id,treasurer2);
  assert.equal(linked.status,200);
  assert.ok(linked.payload.includes(manualPaid.ledgerId) && linked.payload.includes('Kas tunai uji') && !linked.payload.includes(paid.ledgerId));
  assert.ok(linked.payload.includes('/admin/payments?tab=history&amp;payment='+manualPaid.id));
  await call('/api/settings/update',chair,{communityName:'Lingkungan uji',rtRw:'RT 01',address:'Alamat uji',securityPhone:'',rwHeadPhone:'',balance:42},409);

  const reverse={paymentId:second.id,reason:'Koreksi transaksi ganda uji'};
  await call('/api/payments/reverse',chair,reverse,403);
  const reversals=await Promise.all([treasurer,treasurer2].map(cookie=>invoke('/api/payments/reverse',cookie,reverse)));
  assert.deepEqual(reversals.map(item=>item.status).sort(),[200,409]);
  const reversed=reversals.find(item=>item.status===200).payload.data;
  assert.equal(reversed.accountBalance,1225000);
  const restored=(await overview(owner2)).invoices.find(item=>item.id===invoice.id);
  assert.equal(restored.remaining,150000);
  assert.deepEqual(restored.receipts.map(item=>item.id),[first.id]);
  await call(receiptRoute(second.id),null,undefined,404);
  await call('/api/payments/delete',treasurer,{paymentId:second.id},409);
  const correction=await invoke('/admin/ledger?payment='+second.id,treasurer);
  assert.ok(correction.payload.includes(paid.ledgerId) && correction.payload.includes(reversed.reversalLedgerId));
  assert.deepEqual((await sql('SELECT direction,source_type,amount FROM ledger_entries WHERE source_id=$1 ORDER BY source_type',[second.id]))
    .map(item=>[item.direction,item.source_type,Number(item.amount)]),[['IN','PAYMENT',150000],['OUT','PAYMENT_REVERSAL',150000]]);
  console.log('PASS tarif lintas sesi, bukti dan tautan tagihan, kas tunai sesuai rekening, tanggal jurnal, pembalikan atomik, dan kuitansi dibatalkan.');

  const auditor=await login('auditor');
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const month=today.slice(0,7);
  const balance=async id=>Number((await sql('SELECT balance FROM accounts WHERE id=$1',[id]))[0].balance);
  const expenseJournal=async id=>sql("SELECT id,source_type,account_id,direction,amount,entry_date,created_by FROM ledger_entries WHERE source_id=$1 ORDER BY source_type",[id]);
  const proof='data:application/pdf;base64,'+Buffer.from('%PDF-1.4\n%%EOF').toString('base64');
  const draftInput={categoryId:'cat-pemeliharaan',accountId:'acc-main',title:'Pengecatan lorong uji',amount:120000,expenseDate:today,bookNow:false,receiptFile:proof};
  await call('/api/expenses/categories',auditor,{name:'Perlengkapan Uji'},403);
  const category=await call('/api/expenses/categories',treasurer,{name:'Perlengkapan Uji'},201);
  await call('/api/expenses/categories',treasurer2,{name:'perlengkapan uji'},409);
  assert.ok((await invoke('/admin/expenses',treasurer2)).payload.includes(category.name));
  await call('/api/expenses/create',auditor,draftInput,403);
  await call('/api/expenses/create',treasurer,{...draftInput,categoryId:'missing-category'},400);
  const invalid=await invoke('/api/expenses/create',treasurer,{...draftInput,bookNow:true,amount:9_000_000});
  assert.equal(invalid.status,409);
  const initialBalance=await balance('acc-main');
  const draft=await call('/api/expenses/create',treasurer,draftInput,201);
  assert.equal(draft.status,'PENDING');
  assert.equal((await expenseJournal(draft.id)).length,0);
  assert.equal(await balance('acc-main'),initialBalance);
  assert.ok((await invoke('/admin/expenses?expense='+draft.id,auditor)).payload.includes('Pengecatan lorong uji'));
  const proofRoute='/api/expenses/proof?expense='+draft.id;
  await call(proofRoute,null,undefined,401);
  await call(proofRoute,owner,undefined,403);
  assert.match(await call(proofRoute,auditor),/^%PDF-1\.4/);
  const books=await Promise.all([treasurer,treasurer2].map(cookie=>invoke('/api/expenses/book',cookie,{id:draft.id})));
  assert.deepEqual(books.map(item=>item.status).sort(),[200,409]);
  const [postedExpense]=await expenseJournal(draft.id);
  assert.deepEqual([postedExpense.account_id,postedExpense.direction,Number(postedExpense.amount),postedExpense.created_by],['acc-main','OUT',120000,'treasurer']);
  const createdAccount=await call('/api/accounts/save',treasurer,{name:'Rekening kerja uji',code:'WORK',type:'CASH',balance:300000},201);
  await call('/api/accounts/save',treasurer,{id:createdAccount.id,name:'Rekening kerja uji',code:'WORK',type:'CASH',balance:99999});
  assert.equal(await balance(createdAccount.id),300000);
  await call('/api/expenses/update',treasurer2,{id:draft.id,accountId:createdAccount.id,title:'Pengecatan lorong revisi',amount:130000,expenseDate:today});
  const [updatedExpense]=await expenseJournal(draft.id);
  assert.deepEqual([updatedExpense.id,updatedExpense.account_id,Number(updatedExpense.amount)],[postedExpense.id,createdAccount.id,130000]);
  assert.equal(await balance('acc-main'),initialBalance);
  assert.equal(await balance(createdAccount.id),170000);
  const expenseScope=await invoke('/admin/ledger?expense='+draft.id,treasurer2);
  assert.equal(expenseScope.status,200);
  assert.ok(expenseScope.payload.includes(postedExpense.id) && !expenseScope.payload.includes(paid.ledgerId) && expenseScope.payload.includes('/admin/expenses?expense='+draft.id));
  await call('/api/ledger/update',treasurer,{ledgerId:postedExpense.id,amount:1},400);
  const canceled=await Promise.all([treasurer,treasurer2].map(cookie=>invoke('/api/expenses/delete',cookie,{id:draft.id,reason:'Salah pencatatan uji'})));
  assert.deepEqual(canceled.map(item=>item.status).sort(),[200,409]);
  assert.equal(await balance(createdAccount.id),300000);
  const expenseRows=await expenseJournal(draft.id);
  assert.deepEqual(expenseRows.map(row=>[row.source_type,row.direction,Number(row.amount)]),[['EXPENSE','OUT',130000],['EXPENSE_REVERSAL','IN',130000]]);
  assert.ok((await invoke('/admin/ledger?expense='+draft.id,treasurer2)).payload.includes(expenseRows[1].id));
  await call('/api/ledger/delete',treasurer,{ledgerId:expenseRows[1].id,reason:'Jurnal dari pengeluaran'},400);

  const aid=await call('/api/expenses/social/create',treasurer,{...draftInput,receiptFile:undefined,amount:27000,bookNow:true,aidDate:today,categoryId:'cat-dana-kesehatan',
    recipientName:'PENERIMA-UJI-PRIVAT',aidType:'SANTUNAN_DUKA_CITA',description:'CATATAN-UJI-PRIVAT'},201);
  assert.equal((await expenseJournal(aid.id)).length,1);
  assert.ok((await invoke('/admin/expenses?tab=social_aid',treasurer2)).payload.includes('PENERIMA-UJI-PRIVAT'));
  const siteReport=await invoke('/transparency/'+month.replace('-','/')+'?tab=public_ledger',null);
  assert.equal(siteReport.status,200);
  assert.ok(siteReport.payload.includes('Bantuan sosial'));
  assert.doesNotMatch(siteReport.payload,/PENERIMA-UJI-PRIVAT|CATATAN-UJI-PRIVAT|data:application\/pdf/);
  const activeFacility=await call('/api/facilities/create',chair,{name:'Balai Fasum Uji',code:'F-CASH-UJI',category:'BALAI_WARGA',location:'Blok Uji'},201);
  const project=await call('/api/expenses/projects/create',treasurer,{projectName:'Perawatan Balai Uji',projectType:'PERBAIKAN_PERALATAN',budgetAmount:90000,
    vendorOrContractor:'Vendor Uji',startDate:today,status:'IN_PROGRESS',facilityId:activeFacility.id},201);
  const projectExpense=await call('/api/expenses/create',treasurer,{...draftInput,receiptFile:undefined,projectId:project.id,bookNow:true,amount:49000},201);
  assert.ok((await invoke('/admin/expenses?tab=fasum_projects',treasurer2)).payload.includes('Rp49.000'));
  assert.ok((await invoke('/admin/expenses?project='+project.id,treasurer2)).payload.includes(projectExpense.id));
  assert.ok((await invoke('/admin/budget?month='+month,treasurer2)).payload.includes('Rp49.000'));

  const recurringRoute='/api/expenses/recurring';
  const config=await call(recurringRoute+'/config',treasurer2);
  const recurringMonth='2025-02';
  const recurringItem={id:'rec-fixture',title:'Biaya rutin uji',amount:15000,categoryId:'cat-pemeliharaan',accountId:createdAccount.id,executionDay:31,isActive:true};
  const savedConfig=await call(recurringRoute+'/config',treasurer,{items:[recurringItem],expectedVersion:config.version});
  await call(recurringRoute+'/config',treasurer2,{items:[],expectedVersion:config.version},409);
  const preview=await call(recurringRoute+'/process?month='+recurringMonth,treasurer2);
  assert.deepEqual(preview.rows.map(row=>[row.state,row.date]),[['READY','2025-02-28']]);
  const recurringRequest={month:recurringMonth,itemIds:[recurringItem.id],expectedVersion:preview.version};
  const generated=await Promise.all([treasurer,treasurer2].map(cookie=>invoke(recurringRoute+'/process',cookie,recurringRequest)));
  assert.deepEqual(generated.map(item=>item.status).sort(),[201,409]);
  assert.deepEqual((await call(recurringRoute+'/process?month='+recurringMonth,treasurer2)).rows.map(row=>row.state),['BOOKED']);
  assert.equal((await expenseJournal(generated.find(item=>item.status===201).payload.data.ids[0])).length,1);
  await call(recurringRoute+'/config',treasurer,{items:[],expectedVersion:savedConfig.version});
  assert.deepEqual((await call(recurringRoute+'/config',treasurer2)).items,[]);

  const transfer=await call('/api/ledger/transfer',treasurer,{fromAccountId:'acc-main',toAccountId:createdAccount.id,amount:10000,description:'Mutasi rekening uji',entryDate:today},201);
  const pair=await invoke('/admin/ledger?transfer='+transfer.transferId,treasurer2);
  assert.ok(pair.payload.includes(transfer.outEntry.id) && pair.payload.includes(transfer.inEntry.id));
  const reconPath='/api/ledger/reconciliation';
  const reconQuery=reconPath+'?account='+createdAccount.id+'&month='+month;
  const recon=await call(reconQuery,auditor);
  assert.equal(recon.summary.closing,await balance(createdAccount.id));
  assert.equal(recon.summary.transfers,10000);
  assert.equal(recon.summary.outgoing,0);
  assert.equal(recon.status,'UNREVIEWED');
  const reconWrite={accountId:createdAccount.id,month,expectedVersion:recon.fingerprint,statementBalance:recon.summary.closing};
  await call(reconPath,auditor,reconWrite,403);
  await call(reconPath,treasurer,{...reconWrite,statementBalance:recon.summary.closing+1},400);
  assert.equal((await call(reconPath,treasurer,reconWrite)).status,'MATCHED');
  assert.equal((await call(reconQuery,treasurer2)).saved.by,'Uji treasurer');
  assert.equal((await call(reconQuery,treasurer2)).status,'MATCHED');
  await call('/api/ledger/create',treasurer,{accountId:createdAccount.id,direction:'IN',amount:1,description:'Jurnal uji',entryDate:today,sourceType:'PAYMENT_REVERSAL'},400);
  const edit=await call('/api/ledger/create',treasurer,{accountId:createdAccount.id,direction:'IN',amount:1234,description:'Penyesuaian uji',entryDate:today},201);
  assert.equal((await call(reconQuery,treasurer2)).status,'STALE');
  await call(reconPath,treasurer,reconWrite,409);
  const csv=await invoke('/admin/ledger?account='+createdAccount.id+'&q='+edit.id+'&download=csv',auditor);
  assert.equal(csv.status,200);
  assert.ok(csv.payload.includes(edit.id) && csv.payload.includes('Saldo setelah') && !csv.payload.includes(transfer.inEntry.id));
  const pagedAccount=await call('/api/accounts/save',treasurer,{name:'Rekening arsip uji',code:'ARSIP',type:'CASH',balance:0},201);
  await sql(`INSERT INTO ledger_entries (id,account_id,entry_date,direction,amount,source_type,description,created_at)
    SELECT 'led-pager-'||LPAD(n::text,3,'0'),$1,$2,'IN',10,'MANUAL_JOURNAL','Arsip uji',TIMESTAMPTZ '2025-03-01 00:00:00Z'+n*INTERVAL '1 second'
    FROM generate_series(1,505) AS n`,[pagedAccount.id,today]);
  await sql('UPDATE accounts SET balance=5050 WHERE id=$1',[pagedAccount.id]);
  const older=await invoke('/admin/ledger?account='+pagedAccount.id+'&page=26',auditor);
  assert.equal(older.status,200);
  assert.match(older.payload,/led-pager-001/);
  assert.doesNotMatch(older.payload,/led-pager-505/);
  const accurate=await invoke('/admin/ledger?account='+pagedAccount.id+'&q=led-pager-005&download=csv',auditor);
  assert.match(accurate.payload,/,"50","led-pager-005"/);
  const marker=(await sql("SELECT COUNT(*) AS count FROM audit_logs WHERE actor_user_id='treasurer' AND action IN ('expense.book','expense.update','expense.cancel','ledger.reconcile')"))[0];
  assert.equal(Number(marker.count),4);
  console.log('PASS pengeluaran draf → buku kas → koreksi rekening → pembatalan; bukti privat, proyek fasum, laporan warga, pos rutin idempoten, dan rekonsiliasi lintas sesi.');

  const budgetApi='/api/budget';
  const monthQuery='?month='+month;
  await sql("INSERT INTO expense_categories (id,community_id,name,code) VALUES ('cat-listrik-report','comm-01','Listrik Fasum','LISTRIK')");
  await sql("INSERT INTO budgets (id,community_id,year,name,total_amount) VALUES ('budget-annual-fixture','comm-01',$1,'Rencana tahunan uji',540000)",[Number(month.slice(0,4))]);
  await sql("INSERT INTO budget_items (id,budget_id,category_id,name,monthly_budget) VALUES ('budget-annual-fixture-light','budget-annual-fixture','cat-listrik-report','Lampu',45000),('budget-annual-fixture-maint','budget-annual-fixture','cat-pemeliharaan','Pemeliharaan',22000)");
  const budgetInitial=await call(budgetApi+monthQuery,auditor);
  assert.equal(budgetInitial.plan.version,0);
  assert.equal(budgetInitial.actual.find(item=>item.id==='cat-pemeliharaan').amount,49000);
  await call(budgetApi+monthQuery,owner,undefined,403);
  const allocation={month,expectedVersion:0,categoryId:'cat-pemeliharaan',amount:100000,pic:'Bendahara uji',notes:'Pemeliharaan disepakati'};
  await call(budgetApi+'/create',auditor,allocation,403);
  await call(budgetApi+'/create',treasurer,{...allocation,actualAmount:999999},400);
  const draftedPlan=await call(budgetApi+'/create',treasurer,allocation,201);
  await call(budgetApi+'/create',treasurer2,{...allocation,amount:110000},409);
  const plannedItem=draftedPlan.items[0];
  const annualPlan=await call(budgetApi+'/plan',treasurer2,{month,expectedVersion:draftedPlan.version,action:'apply_annual',annualId:'budget-annual-fixture'});
  assert.deepEqual(annualPlan.items.map(item=>[item.categoryId,item.amount]).sort(),[['cat-listrik-report',45000],['cat-pemeliharaan',100000]]);
  const approve={month,expectedVersion:annualPlan.version,action:'approve'};
  await call(budgetApi+'/plan',treasurer,approve,403);
  const approvedPlan=await call(budgetApi+'/plan',chair,approve);
  assert.equal(approvedPlan.state,'APPROVED');
  assert.equal(approvedPlan.approved.by,'Uji chair');
  const revisedItem={...allocation,id:plannedItem.id,amount:120000,expectedVersion:approvedPlan.version};
  await call(budgetApi+'/update',treasurer2,revisedItem,409);
  const reopenedPlan=await call(budgetApi+'/plan',chair2,{month,action:'reopen',expectedVersion:approvedPlan.version,reason:'Sesuaikan penawaran vendor uji'});
  const revisedPlan=await call(budgetApi+'/update',treasurer2,{...revisedItem,expectedVersion:reopenedPlan.version});
  const finalPlan=await call(budgetApi+'/plan',chair,{month,action:'approve',expectedVersion:revisedPlan.version});
  assert.equal((await call(budgetApi+monthQuery,auditor)).plan.version,finalPlan.version);
  const budgetPage=await invoke('/admin/budget'+monthQuery,auditor);
  assert.equal(budgetPage.status,200);
  assert.match(budgetPage.payload,/Disahkan oleh/);
  assert.match(budgetPage.payload,/cat-pemeliharaan/);
  const budgetCsv=await call(budgetApi+monthQuery+'&format=csv&category=cat-pemeliharaan',auditor);
  assert.match(budgetCsv,/"Pemeliharaan","Disahkan","120000","49000","71000"/);
  assert.doesNotMatch(budgetCsv,/Bantuan Sosial|Listrik Fasum/);
  const scopedBudgetJournal=await call('/admin/ledger'+monthQuery+'&category=cat-pemeliharaan&download=csv',auditor);
  assert.match(scopedBudgetJournal,new RegExp(projectExpense.id));
  assert.doesNotMatch(scopedBudgetJournal,/Bantuan sosial/);

  const analyticsApi='/api/analytics/export';
  const fundsApi=budgetApi+'/reserves';
  const monthReport=()=>call(analyticsApi+monthQuery+'&range=3',auditor);
  const beforeReserve=await monthReport();
  assert.ok(beforeReserve.cash.count>500,'Tren harus menghitung seluruh jurnal periode, termasuk entri yang lebih lama.');
  const mainBeforeReserve=await balance('acc-main');
  const reserve=await call(fundsApi,treasurer,{action:'create',name:'Dana drainase uji',target:500000,targetMonth:month,purpose:'Pembersihan saluran'},201);
  assert.ok(!(await call('/api/accounts',treasurer2)).some(item=>item.id===reserve.accountId));
  const depositReserve={action:'move',id:reserve.id,requestId:'de305d54-75b4-431b-adb2-eb6b9e546014',direction:'DEPOSIT',accountId:'acc-main',amount:70000,date:today};
  await call(fundsApi,auditor,depositReserve,403);
  const repeatedReserve=await Promise.all([treasurer,treasurer2].map(cookie=>call(fundsApi,cookie,depositReserve)));
  assert.equal(repeatedReserve[0].transferId,repeatedReserve[1].transferId);
  assert.equal(await balance('acc-main'),mainBeforeReserve-70000);
  assert.equal((await call(fundsApi,auditor)).find(item=>item.id===reserve.id).balance,70000);
  const reserveRows=await expenseJournal(repeatedReserve[0].transferId);
  assert.deepEqual(reserveRows.map(item=>[item.account_id,item.direction,item.source_type,Number(item.amount)]).sort(),
    [['acc-main','OUT','RESERVE_TRANSFER',70000],[reserve.accountId,'IN','RESERVE_TRANSFER',70000]].sort());
  const reservePair=await invoke('/admin/ledger?transfer='+repeatedReserve[0].transferId,auditor);
  assert.ok(reserveRows.every(item=>reservePair.payload.includes(item.id)));
  const afterReserve=await monthReport();
  for(const key of ['closing','income','outgoing','transfers']) assert.equal(afterReserve.cash[key],beforeReserve.cash[key],key);
  assert.equal(afterReserve.cash.count,beforeReserve.cash.count+2);
  await call('/api/ledger/transfer',treasurer,{fromAccountId:'acc-main',toAccountId:reserve.accountId,amount:1,description:'Percobaan jalur lain',entryDate:today},409);
  await call('/api/ledger/create',treasurer,{accountId:reserve.accountId,direction:'IN',amount:1,description:'Percobaan jurnal cadangan',entryDate:today},409);
  await call('/api/expenses/create',treasurer,{...draftInput,receiptFile:undefined,accountId:reserve.accountId,bookNow:true},409);
  await call(fundsApi,treasurer,{action:'archive',id:reserve.id,reason:'Saldo belum dikembalikan'},409);
  await call(fundsApi,treasurer,{...depositReserve,requestId:'de305d54-75b4-431b-adb2-eb6b9e546015',direction:'WITHDRAW'});
  assert.equal(await balance('acc-main'),mainBeforeReserve);
  await call(fundsApi,treasurer,{action:'archive',id:reserve.id,reason:'Target dana uji selesai'});
  const historicalReserve=await invoke('/admin/ledger?account='+reserve.accountId,auditor);
  assert.ok(historicalReserve.payload.includes('Tarik cadangan') && historicalReserve.payload.includes('Setor cadangan'));

  await sql("INSERT INTO blocks (id,community_id,code,name) VALUES ('report-block-a','comm-01','R-A','Blok Anggaran'),('report-block-b','comm-01','R-B','Blok Lain')");
  await sql("UPDATE properties SET block_id='report-block-a',occupancy_status='OWNER_OCCUPIED' WHERE id='fixture-house-1'");
  await sql("UPDATE properties SET block_id='report-block-b',occupancy_status='RENTED' WHERE id='fixture-house-2'");
  const billingReport=await call(analyticsApi+'?month=2026-11&tab=block_compliance',auditor);
  assert.equal(billingReport.compliance.periodId,published.periodId);
  assert.equal(billingReport.compliance.occupied,2);
  assert.equal(billingReport.compliance.blocks.find(item=>item.block==='Blok Anggaran').remaining,150000);
  assert.match(await call(analyticsApi+'?month=2026-11&tab=block_compliance&format=csv',auditor),/Blok Anggaran/);
  const billBlock=await invoke('/admin/analytics?month=2026-11&tab=block_compliance',auditor);
  assert.match(billBlock.payload,/block=Blok\+Anggaran/);

  const patrolEntry=await call('/api/security/patrol/create',chair,{checkpointName:'Gerbang uji laporan',checkpointCode:'CP-01',guardName:'Petugas fixture',condition:'AMAN_KONDUSIF'},201);
  const patrolPage=await invoke('/admin/security-gate?tab=patrol&month='+month,chair2);
  assert.equal(patrolPage.status,200);
  assert.match(patrolPage.payload,new RegExp(patrolEntry.id));
  const boundary=new Date(month+'-01T00:00:00+07:00').getTime();
  const stamp=hours=>new Date(boundary+hours*3600000).toISOString();
  await sql("INSERT INTO complaints (id,title,description,category,status,created_at,resolved_at) VALUES ('report-sla-1','Aduan waktu uji','Catatan privat fixture','KEAMANAN','RESOLVED',$1,$2),('report-sla-2','Aduan tutup uji','Catatan privat fixture','KEAMANAN','CLOSED',$3,NULL),('report-sla-3','Aduan lama','Catatan privat fixture','KEAMANAN','RESOLVED',$4,$5)",
    [stamp(1),stamp(13),stamp(2),stamp(-1),stamp(1)]);
  const report=await call(analyticsApi+monthQuery+'&tab=security_sla&target=24',auditor);
  assert.deepEqual(report.security.security,{total:2,open:0,done:2,measured:1,onTime:1,avgHours:12,targetRate:100});
  assert.equal(report.security.patrols,1);
  assert.ok(report.utilities.usableReadings>0 && report.utilities.waterUsage>0);
  const serviceCsv=await call(analyticsApi+monthQuery+'&tab=security_sla&target=24&format=csv',auditor);
  assert.match(serviceCsv,/"Keamanan","2","0","2","1","12","24","1","100"/);
  assert.doesNotMatch(serviceCsv,/Catatan privat fixture|Petugas fixture/);
  const cashCsv=await call(analyticsApi+monthQuery+'&range=3&format=csv',auditor);
  const lastCsvLine=cashCsv.trim().split(/\r?\n/).at(-1);
  assert.ok(lastCsvLine.startsWith([month,report.cash.opening,report.cash.income,report.cash.outgoing].map(value=>'"'+value+'"').join(',')));

  const snapshotApi='/api/analytics/snapshot';
  const snapshotRequest={month,target:24,notes:'Arsip verifikasi PostgreSQL'};
  await call(snapshotApi,auditor,snapshotRequest,403);
  await call(snapshotApi,treasurer,{...snapshotRequest,totalIncome:999999999},400);
  const archive=await call(snapshotApi,treasurer,snapshotRequest,201);
  assert.deepEqual(archive.cash,report.cash);
  assert.equal(archive.budget.state,'APPROVED');
  assert.equal(archive.by,'Uji treasurer');
  await call('/api/ledger/create',treasurer,{accountId:'acc-main',direction:'IN',amount:4321,description:'Setelah arsip uji',entryDate:today},201);
  assert.equal((await monthReport()).cash.income,archive.cash.income+4321);
  const [storedArchive]=await sql('SELECT value FROM settings WHERE key=$1',['analytics-archive:'+month+':'+archive.id]);
  assert.equal(JSON.parse(storedArchive.value).cash.income,archive.cash.income);
  const archivePage=await invoke('/admin/analytics'+monthQuery,auditor);
  assert.ok(archivePage.payload.includes(archive.id) && archivePage.payload.includes('Arsip verifikasi PostgreSQL'));
  for(let index=1;index<=12;index++) {
    const id='archive-page-fixture-'+index;
    const at='2025-01-'+String(index).padStart(2,'0')+'T00:00:00Z';
    await sql('INSERT INTO settings (id,community_id,key,value,updated_at) VALUES ($1,\'comm-01\',$2,$3,$4)',
      [id,'analytics-archive:'+month+':'+id,JSON.stringify({...archive,id,at,notes:'Arsip lama halaman '+index}),at]);
  }
  const firstArchives=await invoke('/admin/analytics'+monthQuery,auditor);
  assert.match(firstArchives.payload,/archivePage=2/);
  const earlierArchives=await invoke('/admin/analytics'+monthQuery+'&archivePage=2',auditor);
  assert.ok(earlierArchives.payload.includes('archive-page-fixture-1') && !earlierArchives.payload.includes(archive.id));
  assert.ok((await sql("SELECT actor_user_id FROM audit_logs WHERE action='budget.approve' AND entity_id=$1",[month])).every(row=>row.actor_user_id==='chair'));
  console.log('PASS Anggaran dan Laporan PostgreSQL: pengesahan & revisi, pagu lintas sesi, mutasi cadangan berpasangan/idempoten, CSV sesuai jurnal, blok & SLA terukur, serta arsip tetap setelah data berubah.');

  const loanApi='/api/expenses/loans';
  await sql("INSERT INTO accounts (id,community_id,code,name,type,balance) VALUES ('acc-loan-test','comm-01','LOAN-TEST','Bank kasbon uji','BANK',2000000)");
  const rules={maxLoanRatio:25,maxTenorMonths:3,minWorkingMonths:2,approvalMode:'LEADERSHIP',defaultAccountId:'acc-loan-test',repaymentNotes:'Tinjau setiap bulan'};
  await call(loanApi+'/policy',treasurer,rules,403);
  await call(loanApi+'/policy',chair,rules);
  const request={requestId:'staff-loan-pg',staffName:'PETUGAS-UJI-PRIVAT',staffRole:'SATPAM',staffPhone:'081298765409',
    staffSince:'2020-01-01',baseSalary:2000000,totalLoanAmount:400000,monthlyDeduction:200000,tenorMonths:2,loanDate:today,purpose:'TUJUAN-UJI-PRIVAT'};
  await call(loanApi+'/create',treasurer,{...request,staffSince:today},409);
  await call(loanApi+'/create',treasurer,{...request,totalLoanAmount:600000},409);
  const requests=await Promise.all([treasurer,treasurer2].map(cookie=>call(loanApi+'/create',cookie,request,201)));
  const staffLoan=requests[0];
  assert.equal(requests[1].id,staffLoan.id);
  await call(loanApi+'/decision',treasurer,{loanId:staffLoan.id,decision:'APPROVE'},403);
  const payout={loanId:staffLoan.id,accountId:'acc-loan-test',date:today};
  await call(loanApi+'/disburse',treasurer,payout,409);
  const approvals=await Promise.all([chair,chair2].map(cookie=>invoke(loanApi+'/decision',cookie,{loanId:staffLoan.id,decision:'APPROVE'})));
  assert.deepEqual(approvals.map(item=>item.status).sort(),[200,409]);
  assert.equal(await balance('acc-loan-test'),2000000);
  const payouts=await Promise.all([treasurer,treasurer2].map(cookie=>call(loanApi+'/disburse',cookie,payout)));
  assert.equal(payouts[0].loan.disbursement.journalId,payouts[1].loan.disbursement.journalId);
  assert.equal(await balance('acc-loan-test'),1600000);
  const bankRepay={loanId:staffLoan.id,installmentAmount:150000,paymentMethod:'TRANSFER_BANK',accountId:'acc-loan-test',installmentDate:today,requestId:'staff-loan-transfer'};
  await call(loanApi+'/installment',treasurer,{...bankRepay,paymentMethod:'TUNAI_CASH'},400);
  const payments=await Promise.all([treasurer,treasurer2].map(cookie=>call(loanApi+'/installment',cookie,bankRepay,201)));
  const staffReceipt=payments[0].installment;
  assert.equal(staffReceipt.journalId,payments[1].installment.journalId);
  assert.equal(await balance('acc-loan-test'),1750000);
  const scopedJournal=await invoke('/admin/ledger?loan='+staffLoan.id,treasurer2);
  assert.match(scopedJournal.payload,new RegExp(staffReceipt.journalId));
  assert.ok(scopedJournal.payload.includes('/admin/staff-loans?loan='+staffLoan.id));
  const receiptPage=await invoke('/admin/staff-loans?receipt='+staffReceipt.id,treasurer2);
  assert.equal(receiptPage.status,200);
  assert.match(receiptPage.payload,/Kuitansi angsuran/);
  assert.equal((await invoke('/admin/staff-loans?receipt='+staffReceipt.id,owner2)).status,302);

  const salary=await call('/api/expenses/create',treasurer,{categoryId:'cat-pemeliharaan',accountId:'acc-loan-test',
    title:'JURNAL-GAJI-UJI-PRIVAT',amount:700000,expenseDate:today,bookNow:true},201);
  assert.ok((await call(loanApi+'/payroll?month='+month,treasurer)).some(item=>item.id===salary.id));
  const deduction={loanId:staffLoan.id,installmentAmount:200000,paymentMethod:'POTONG_GAJI',installmentDate:today,requestId:'staff-loan-payroll',expenseId:salary.id,netPayrollConfirmed:true};
  await call(loanApi+'/installment',treasurer,{...deduction,expenseId:undefined},400);
  const beforeDeduction=await balance('acc-loan-test');
  const withheld=await call(loanApi+'/installment',treasurer2,deduction,201);
  assert.equal(withheld.loan.remainingBalance,50000);
  assert.equal(withheld.installment.expenseId,salary.id);
  assert.equal(withheld.installment.journalId,undefined);
  assert.equal(await balance('acc-loan-test'),beforeDeduction);
  await call(loanApi+'/installment',treasurer2,{...deduction,requestId:'staff-loan-duplicate',installmentAmount:1000},409);
  assert.match((await invoke('/admin/expenses?expense='+salary.id,treasurer2)).payload,/Potongan gaji/);
  await call('/api/expenses/delete',treasurer,{id:salary.id,reason:'Tidak bisa sebelum pembalikan'},409);
  await call(loanApi+'/reverse',treasurer,{loanId:staffLoan.id,reason:'Masih ada angsuran'},409);
  await call(loanApi+'/reverse',treasurer,{loanId:staffLoan.id,installmentId:withheld.installment.id,reason:'Koreksi potongan'});
  assert.equal(await balance('acc-loan-test'),beforeDeduction);
  await call(loanApi+'/reverse',treasurer,{loanId:staffLoan.id,installmentId:staffReceipt.id,reason:'Koreksi transfer'});
  assert.equal(await balance('acc-loan-test'),beforeDeduction-150000);
  await call(loanApi+'/reverse',treasurer,{loanId:staffLoan.id,reason:'Dana pencairan kembali'});
  assert.equal(await balance('acc-loan-test'),1300000);
  assert.match((await invoke('/admin/staff-loans?receipt='+staffReceipt.id,treasurer2)).payload,/DIBALIK/);
  const auditCookie=await login('auditor');
  const auditLoan=(await call(loanApi,auditCookie)).find(item=>item.id===staffLoan.id);
  assert.equal(auditLoan.baseSalary,null); assert.equal(auditLoan.staffPhone,'');
  await call(loanApi+'/payroll?month='+month,auditCookie,undefined,403);

  const publicPath='/transparency/'+month.replace('-','/');
  const summary=await invoke(publicPath+'?tab=cashflow_summary',null);
  const publicJournal=await invoke(publicPath+'?tab=public_ledger&category=STAFF_LOAN&download=csv',null);
  const publicDues=await invoke(publicPath+'?tab=dues_breakdown',null);
  assert.deepEqual([summary.status,publicJournal.status,publicDues.status],[200,200,200]);
  const cashClosing=Number((await sql(`SELECT (SELECT SUM(balance) FROM accounts)-COALESCE(SUM(CASE WHEN direction='IN' THEN amount ELSE -amount END),0) AS balance
    FROM ledger_entries WHERE entry_date>=CAST((CAST($1 AS DATE)+INTERVAL '1 month')::date AS TEXT)`,[month+'-01']))[0].balance);
  const rupiah=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:2,minimumFractionDigits:0}).format(cashClosing).replace(/\s+/g,'');
  assert.ok(summary.payload.includes(rupiah));
  assert.match(publicJournal.payload,/Pencairan kasbon/); assert.match(publicJournal.payload,/Pembalikan pelunasan kasbon/);
  assert.equal(publicJournal.payload.trim().split('\n').length,5);
  for(const page of [summary,publicDues,publicJournal,await invoke(publicPath+'?tab=public_ledger',null)])
    assert.doesNotMatch(page.payload,/PETUGAS-UJI-PRIVAT|TUJUAN-UJI-PRIVAT|JURNAL-GAJI-UJI-PRIVAT|081298765409|U-01|U-02/);
  assert.ok((await invoke(publicPath+'?tab=public_ledger&page=2',null)).payload.includes('Halaman sebelumnya'));
  await sql("INSERT INTO settings(id,key,value) VALUES ('fixture-duty','security_shift_roster',$1)",
    [JSON.stringify({rotationStartDate:'2025-01-01',handoverTime:'07:30',shifts:[{staffName:'NAMA-JAGA-PRIVAT',phone:'085500001234'},{staffName:'PETUGAS-CADANGAN-PRIVAT'}]})]);
  const helpReport=await invoke(publicPath+'?tab=audit_faq',null);
  assert.equal(helpReport.status,200);
  assert.ok(/serah terima 07:30 WIB/.test(helpReport.payload.replace(/<!--[\s\S]*?-->/g,'')),'Public roster must show the configured WIB handover.');
  assert.doesNotMatch(helpReport.payload,/NAMA-JAGA-PRIVAT|085500001234|PETUGAS-CADANGAN-PRIVAT/);
  const currentPublic=await invoke('/transparency/current?tab=public_ledger',null);
  assert.equal(currentPublic.location,publicPath+'?tab=public_ledger');
  const anonymousDues=await invoke('/warga?tab=iuran&month='+month,null);
  assert.equal(anonymousDues.location,'/login?portal=resident&tujuan=iuran&month='+month);
  assert.equal((await invoke('/warga?tab=info&info=complaints',null)).location,'/login?portal=resident&tujuan=aduan');
  const ownDues=await invoke('/warga?tab=iuran&month='+month,owner2);
  assert.equal(ownDues.status,200);
  assert.match(ownDues.payload,/Portal Warga/);
  console.log('PASS Kasbon dan Transparansi PostgreSQL: kebijakan dan peran, pencairan, angsuran idempoten, potong gaji tanpa arus ganda, pembalikan, kuitansi privat, saldo dan CSV publik.');

  await call('/api/users/recovery-code',treasurer,{userId:'chair',identityVerified:true},403);
  await call('/api/users/recovery-code',chair,{userId:'treasurer',identityVerified:true},403);
  const superseded=await call('/api/users/recovery-code',superAdmin,{userId:'chair',identityVerified:true},201);
  const recovery=await call('/api/users/recovery-code',superAdmin,{userId:'chair',identityVerified:true},201);
  const newPassword='A fresh PostgreSQL fixture phrase';
  await call('/api/auth/recover',null,{code:superseded.code,newPassword},400);
  assert.equal((await sql('SELECT token_hash FROM account_recovery_tokens WHERE user_id=$1',['chair']))[0].token_hash.length,64);
  const reset=await Promise.all([1,2].map(()=>invoke('/api/auth/recover',null,{code:recovery.code,newPassword})));
  assert.deepEqual(reset.map(item=>item.status).sort(),[200,400]);
  await call('/api/properties',chair2,undefined,401);
  await call('/api/auth/login',null,{identifier:'chair',password:loginPassword},401);
  await call('/api/auth/login',null,{identifier:'chair',password:newPassword});
  const operator=postgres(env.DATABASE_URL,{ssl:false,max:1});
  try {
    await assert.rejects(()=>inspectAdmin(operator,'owner'));
    await recoverAdmin(operator,await inspectAdmin(operator,'chair'),'Only the fixture operator phrase');
  } finally {await operator.end();}
  await call('/api/auth/login',null,{identifier:'chair',password:'Only the fixture operator phrase'});
  assert.equal((await sql("SELECT count(*) AS count FROM audit_logs WHERE action='user.operator_recovery' AND entity_id='chair'"))[0].count,'1');
  console.log('PASS Rumah & Warga dan pemulihan akun: pemilik/penghuni, utilitas terhubung iuran, izin peran, kode sekali pakai, pencabutan sesi, dan pemulihan operator.');
  await sql('UPDATE accounts SET is_active=false');

  const noAccount = await invoke('/admin/payments',treasurer2);
  assert.equal(noAccount.status,200);
  assert.ok(noAccount.payload.includes('Belum ada rekening kas'));
  console.log('PASS iuran → pembayaran → buku kas → kuitansi: Rp100.000 + Rp150.000; dua alokasi, dua jurnal, saldo Rp1.250.000; verifikasi ganda tidak menggandakan jurnal.');
} catch (error) {
  if (logs) console.error(logs.replaceAll(password,'[redacted]').slice(-7000));
  throw error;
} finally {
  if (app && app.exitCode===null) { const exited=once(app,'exit'); app.kill(); await exited; }
  if (client) await client.end();
  if (started) await db.stop();
}
