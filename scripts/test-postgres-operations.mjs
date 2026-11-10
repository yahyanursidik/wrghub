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
  return {status:response.status,payload,cookie:response.headers.getSetCookie().map(item=>item.split(';')[0]).join('; ')};
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
  const hashed=hashPassword(loginPassword);
  for (const [id,role,house,code] of [['chair','CHAIRMAN',null,null],['super','SUPER_ADMIN',null,null],['secretary','SECRETARY',null,null],['treasurer','TREASURER',null,null],['cleaner','MAINTENANCE',null,null],
    ['owner','HOUSE_OWNER','fixture-house-1','U-01'],['neighbor','HOUSE_OWNER','fixture-house-2','U-02']]) {
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
  const installment={loanId:loan.id,installmentAmount:200000,paymentMethod:'POTONG_GAJI',installmentDate:'2026-10-05',requestId:'fixture-installment'};
  assert.equal((await call('/api/expenses/loans',treasurer2)).find(item=>item.id===loan.id).status,'PENDING_APPROVAL');
  await call('/api/expenses/loans/installment',treasurer,installment,409);
  await call('/api/expenses/loans/decision',chair,{loanId:loan.id,decision:'APPROVE'});
  const saved = await call('/api/expenses/loans/installment',treasurer,installment,201);
  const repeated = await call('/api/expenses/loans/installment',treasurer2,installment,201);
  assert.equal(repeated.installment.id,saved.installment.id);
  assert.equal((await call('/api/expenses/loans',treasurer2)).find(item=>item.id===loan.id).remainingBalance,200000);
  await call('/api/expenses/loans/installment',treasurer2,{...installment,requestId:'fixture-over',installmentAmount:200001},409);
  assert.ok((await invoke('/admin/staff-loans',treasurer2)).payload.includes(loan.id));

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
  assert.equal(publicBill.status,200);
  assert.ok(publicBill.payload.includes('U-01') && !publicBill.payload.includes('FIXTURE-FIRST') && !publicBill.payload.includes(payment.proofFileUrl));
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
  await call('/api/ledger/delete',treasurer,{ledgerId:paid.ledgerId},400);
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
