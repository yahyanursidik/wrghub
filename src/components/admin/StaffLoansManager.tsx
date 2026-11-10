/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpRight, Banknote, ClipboardList, Plus, Receipt, SlidersHorizontal, Wallet } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';
import { downloadFinanceCsv, financeDate, financePath } from '../../lib/billing-data';
import { cashRupiah, financeMonth } from '../../lib/cash-data';
import { financeWhatsAppLink, financeWhatsAppNumber } from '../../lib/finance-whatsapp';
import { isCashAccount, isRepayable, loanMethods, loanPath, loanReceiptNumber, loanStatuses, loanTypes, staffRoles,
  type InstallmentRecord, type LoanAccount, type LoanMethod, type LoanPolicyConfig, type PayrollExpense, type StaffLoan, type StaffLoanSubTab } from '../../lib/staff-loan-data';
import { FinanceDialog, FinanceEmpty, FinanceHeader, FinancePager, FinanceSummary, FinanceTabLinks, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';

const tabs=[
  {id:'active_loans',label:'Daftar kasbon',icon:Banknote},{id:'new_requests',label:'Pengajuan',icon:ClipboardList},
  {id:'payroll_deductions',label:'Potong gaji',icon:Wallet},{id:'repayment_history',label:'Riwayat',icon:Receipt},
  {id:'loan_policies',label:'Kebijakan',icon:SlidersHorizontal},
] as const;
const link='inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary-800 hover:underline';
const wrap='[overflow-wrap:anywhere]';
const figure='font-bold tabular-nums '+wrap;
const container='min-w-0 rounded-xl border border-border bg-surface';
const rowClass='grid min-w-0 gap-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center';
const tone:Record<StaffLoan['status'],string>={PENDING_APPROVAL:'bg-amber-100 text-amber-900',AWAITING_DISBURSEMENT:'bg-sky-50 text-sky-900',
  ACTIVE_INSTALLMENT:'bg-primary-50 text-primary-900',OVERDUE:'bg-rose-50 text-rose-900',PAID_OFF:'bg-primary-50 text-primary-900',
  REJECTED:'bg-rose-50 text-rose-900',ARCHIVED:'bg-slate-100 text-slate-800',CANCELLED:'bg-slate-100 text-slate-800'};
const api='/api/expenses/loans/';
const str=(data:FormData,key:string)=>String(data.get(key) || '').trim();
const num=(data:FormData,key:string)=>Number(str(data,key));
const ledger=(p:Record<string,string>)=>financePath('/admin/ledger',p);
const expenses=(p:Record<string,string>)=>financePath('/admin/expenses',p);
const detail=(loan:StaffLoan)=>loanPath({loan:loan.id});
const source=(item:InstallmentRecord)=>item.expenseId?expenses({expense:item.expenseId}):item.journalId?ledger({installment:item.id}):'';
type History={loan:StaffLoan;item:InstallmentRecord};
type Action={type:'request';loan?:StaffLoan}|{type:'decision';loan:StaffLoan;decision:'APPROVE'|'REJECT'}|
  {type:'disburse'|'repay'|'withdraw';loan:StaffLoan}|{type:'reverse';loan:StaffLoan;item?:InstallmentRecord}|({type:'receipt'} & History);
interface Props {tab:StaffLoanSubTab;initialLoans:StaffLoan[];initialPolicy:LoanPolicyConfig;accounts:LoanAccount[];today:string;month:string;
  canWrite:boolean;canSetPolicy:boolean;loanId:string;installmentId:string;expenseId:string;initialNotice:string}

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}
function Head({title,children}:{title:string;children?:ReactNode}) {
  return <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3"><h2 className="text-lg font-bold tracking-tight">{title}</h2>{children}</div>;
}
function Accounts({accounts,value,optional=false}:{accounts:LoanAccount[];value?:string;optional?:boolean}) {
  return <select name="account" className={financeField} required={!optional} defaultValue={accounts.some(item=>item.id===value)?value:''}>
    <option value="" disabled={!optional}>{optional?'Pilih saat pencairan':'Pilih rekening'}</option>
    {accounts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
  </select>;
}
function Rows<T>({items,label,empty,render}:{items:T[];label:string;empty:string;render:(item:T)=>ReactNode}) {
  const [page,setPage]=useState(1);
  const size=12,current=Math.min(page,Math.max(1,Math.ceil(items.length/size)));
  return items.length?<><ul className="divide-y divide-border">{items.slice((current-1)*size,current*size).map(render)}</ul>
    <FinancePager label={label} total={items.length} page={current} pageSize={size} onChange={setPage} /></>:
    <div className="p-4"><FinanceEmpty>{empty}</FinanceEmpty></div>;
}
function Jump({href,children}:{href:string;children:ReactNode}) {
  return <a className={link} href={href}>{children}<ArrowUpRight className="size-3" aria-hidden="true" /></a>;
}
export function LoanReceiptBody({loan,item}:{loan:StaffLoan;item:InstallmentRecord}) {
  return <article className="grid min-w-0 gap-3 rounded-xl border border-border p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div>
      <p className="text-sm font-semibold text-ink-muted">Nomor kuitansi</p><p className={'text-lg font-bold '+wrap}>{loanReceiptNumber(item.id)}</p>
    </div>{item.reversal && <strong className="rounded-md bg-rose-50 px-2 py-1 text-sm text-rose-800">DIBALIK</strong>}</div>
    <p className={'rounded-lg bg-primary-50 p-3 text-xl text-primary-900 '+figure}>{cashRupiah(item.amount)}</p>
    <dl className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 text-sm">
      {[['Petugas',loan.staffName],['Angsuran ke',item.installmentNo],['Tanggal',financeDate(item.paymentDate)],['Metode',loanMethods[item.paymentMethod]],
        ['Dicatat oleh',item.receivedBy],...(item.accountName?[['Rekening',item.accountName]]:[])].map(([label,value])=>
        <div key={label} className="contents"><dt className="text-ink-muted">{label}</dt><dd className={'font-semibold '+wrap}>{value}</dd></div>)}
    </dl>
    {item.expenseId && <p className="text-sm text-ink-muted">Potongan tertaut ke jurnal gaji bersih.</p>}
    {item.legacy && <p className="text-sm text-amber-900">Catatan lama belum tertaut ke jurnal.</p>}
    {item.reversal && <p className={'text-sm text-rose-800 '+wrap}>Dibalik oleh {item.reversal.by}: {item.reversal.reason}</p>}
  </article>;
}


export function StaffLoansManager({tab,initialLoans,initialPolicy,accounts,today,month,canWrite,canSetPolicy,loanId,installmentId,expenseId,initialNotice}:Props) {
  const [loans,setLoans]=useState(initialLoans),[policy,setPolicy]=useState(initialPolicy);
  const [action,setAction]=useState<Action|null>(null),[payrollOnly,setPayrollOnly]=useState(false);
  const [search,setSearch]=useState(''),[filter,setFilter]=useState(''),[notice,setNotice]=useState(initialNotice);
  const canApprove=canSetPolicy || (canWrite && policy.approvalMode==='FINANCE');
  const active=loans.filter(isRepayable),awaiting=loans.filter(loan=>loan.status==='AWAITING_DISBURSEMENT');
  const focus=loanId?loans.find(loan=>loan.id===loanId):undefined;
  const payrollMonth=tab==='payroll_deductions'?month:today.slice(0,7);
  const history=loans.flatMap(loan=>loan.installments.map(item=>({loan,item}))).sort((a,b)=>b.item.paymentDate.localeCompare(a.item.paymentDate)||b.item.installmentNo-a.item.installmentNo);
  const paidPayroll=new Map(history.filter(({item})=>item.paymentMethod==='POTONG_GAJI' && item.paymentDate.startsWith(payrollMonth) && !item.reversal)
    .map(row=>[row.loan.id,row.item]));
  const matches=(loan:StaffLoan)=>(loan.staffName+' '+staffRoles[loan.staffRole]+' '+loan.id).toLowerCase().includes(search.trim().toLowerCase());
  const loanRows=(loanId?(focus?[focus]:[]):[...awaiting,...active]).filter(loan=>matches(loan) && (!filter || loan.status===filter));
  const requests=loans.filter(loan=>loan.status==='PENDING_APPROVAL' && matches(loan));
  const archives=loans.filter(loan=>['PAID_OFF','REJECTED','ARCHIVED','CANCELLED'].includes(loan.status) && matches(loan));
  const repayments=history.filter(({loan,item})=>matches(loan) && (!month || item.paymentDate.startsWith(month)) && (!filter || item.paymentMethod===filter) &&
    (!installmentId || installmentId===item.id) && (!expenseId || item.expenseId===expenseId));
  const payroll=loans.filter(loan=>matches(loan) && (paidPayroll.has(loan.id) || (isRepayable(loan) && (loan.disbursement?.date || loan.loanDate).slice(0,7)<=payrollMonth)));
  function open(next:Action,payroll=false) {setPayrollOnly(payroll);setAction(next);}
  function saved(loan:StaffLoan,item?:InstallmentRecord) {
    setLoans(rows=>rows.some(row=>row.id===loan.id)?rows.map(row=>row.id===loan.id?loan:row):[loan,...rows]);
    const verb=action?.type;
    setNotice(verb==='decision'?(loan.status==='REJECTED'?'Penolakan tercatat.':'Disetujui. Lanjutkan ke pencairan.'):
      verb==='disburse'?'Pencairan tercatat di Buku Kas.':verb==='repay'?'Angsuran tercatat.':verb==='reverse'?'Pembalikan tercatat.':
      verb==='withdraw'?'Pengajuan ditarik.':'Pengajuan tersimpan.');
    if(verb==='request' && !action?.loan && tab!=='new_requests') {window.location.assign(loanPath({tab:'new_requests',saved:'request'}));return;}
    setAction(item?{type:'receipt',loan,item}:null);
  }
  const exportRows=(name:string,rows:(string|number)[][],enabled:boolean)=>enabled?<button type="button" className={financeButton}
    onClick={()=>downloadFinanceCsv(name+'.csv',rows)}><ArrowDownToLine className="size-4" aria-hidden="true" />Unduh CSV</button>:null;
  const loanExport=(rows:StaffLoan[])=>exportRows('daftar-kasbon',[
    ['ID','Petugas','Jenis','Tanggal','Pokok (Rp)','Sisa setelah cair (Rp)','Status'],
    ...rows.map(loan=>[loan.id,loan.staffName,loanTypes[loan.loanType],loan.loanDate,loan.totalLoanAmount,isRepayable(loan)?loan.remainingBalance:'',loanStatuses[loan.status]])],rows.length>0);
  const searchField=<Field label="Cari petugas"><input className={financeField} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nama atau peran" /></Field>;
  const monthField=(label:string,required:boolean)=><form action="/admin/staff-loans" className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
    <input type="hidden" name="tab" value={tab} /><Field label={label}><input className={financeField} type="month" name="month" min="1900-01" max={today.slice(0,7)} defaultValue={month} required={required} /></Field>
    <button className={financeButton}>Tampilkan</button></form>;

  function loanRow(loan:StaffLoan) {
    return <li key={loan.id} className={rowClass}>
      <div className="grid min-w-0 gap-1"><a className={'w-fit font-bold hover:underline '+wrap} href={detail(loan)}>{loan.staffName}</a>
        <p className="text-xs text-ink-muted">{staffRoles[loan.staffRole]} · {loanTypes[loan.loanType]}</p>
        <span className={'w-fit rounded-full px-2.5 py-1 text-xs font-semibold '+tone[loan.status]}>{loanStatuses[loan.status]}</span></div>
      <div className="min-w-0"><p className={figure}>{cashRupiah(isRepayable(loan)?loan.remainingBalance:loan.totalLoanAmount)}</p>
        <p className="text-xs text-ink-muted">{isRepayable(loan)?'Sisa · jatuh tempo '+financeDate(loan.dueDate):'Pokok · '+financeDate(loan.loanDate)}</p></div>
      <div className="flex flex-wrap items-center gap-x-3 md:justify-end">
        {canApprove && loan.status==='PENDING_APPROVAL' && <><button type="button" className={link} onClick={()=>open({type:'decision',loan,decision:'APPROVE'})}>Setujui</button>
          <button type="button" className={link+' !text-rose-800'} onClick={()=>open({type:'decision',loan,decision:'REJECT'})}>Tolak</button></>}
        {canWrite && loan.status==='PENDING_APPROVAL' && <><button type="button" className={link} onClick={()=>open({type:'request',loan})}>Ubah</button><button type="button" className={link} onClick={()=>open({type:'withdraw',loan})}>Tarik</button></>}
        {canWrite && loan.status==='AWAITING_DISBURSEMENT' && <button type="button" className={financePrimary} onClick={()=>open({type:'disburse',loan})}>Cairkan</button>}
        {canApprove && loan.status==='AWAITING_DISBURSEMENT' && <button type="button" className={link} onClick={()=>open({type:'withdraw',loan})}>Tarik</button>}
        {canWrite && isRepayable(loan) && <button type="button" className={financeButton} onClick={()=>open({type:'repay',loan})}>Catat angsuran</button>}
        {loan.disbursement && <Jump href={ledger({loan:loan.id})}>Jurnal</Jump>}
      </div>
    </li>;
  }
  function paymentRow({loan,item}:History) {
    return <li key={item.id} className={rowClass}>
      <div className="min-w-0"><a href={detail(loan)} className={'font-bold hover:underline '+wrap}>{loan.staffName}</a>
        <p className="text-xs text-ink-muted">{financeDate(item.paymentDate)} · {loanMethods[item.paymentMethod]}</p></div>
      <div className="min-w-0"><p className={figure}>{cashRupiah(item.amount)}</p><p className="text-xs text-ink-muted">{item.reversal?'Dibalik':item.legacy?'Catatan lama':'Tercatat'}</p></div>
      <div className="flex flex-wrap gap-x-3 md:justify-end">
        <button type="button" className={link} onClick={()=>open({type:'receipt',loan,item})}>Kuitansi</button>
        {source(item) && <Jump href={source(item)}>{item.expenseId?'Jurnal gaji':'Jurnal'}</Jump>}
        {canWrite && !item.reversal && !item.legacy && <button type="button" className={link+' !text-rose-800'} onClick={()=>open({type:'reverse',loan,item})}>Balik</button>}
      </div>
    </li>;
  }
  return <div className="grid min-w-0 gap-4">
    <FinanceHeader area="staff-loans" title="Kasbon petugas">{canWrite && <button type="button" className={financePrimary}
      onClick={()=>open({type:'request'})}><Plus className="size-4" aria-hidden="true" />Ajukan kasbon</button>}</FinanceHeader>
    <FinanceTabLinks tabs={tabs.map(item=>({...item,href:loanPath({tab:item.id,month:['payroll_deductions','repayment_history'].includes(item.id)?month:undefined})}))} active={tab} label="Menu kasbon petugas" />
    {notice && <p role="status" className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{notice}</p>}
    {tab==='active_loans' && <section className="grid min-w-0 gap-4" aria-label="Daftar kasbon">
      {!loanId && <FinanceSummary items={[
        {label:'Sisa pokok aktif',value:cashRupiah(active.reduce((sum,loan)=>sum+loan.remainingBalance,0)),detail:active.length+' kasbon berjalan',tone:'mint'},
        {label:'Siap dicairkan',value:awaiting.length,detail:cashRupiah(awaiting.reduce((sum,loan)=>sum+loan.totalLoanAmount,0)),tone:'sky'},
        {label:'Lewat jatuh tempo',value:active.filter(loan=>loan.status==='OVERDUE').length,detail:'Dari kasbon berjalan',tone:'rose'},
      ]} />}
      {focus && <div className="workspace-panel grid min-w-0 gap-2">
        <h2 className="text-lg font-bold">Detail kasbon</h2>
        <p className={'text-sm '+wrap}>{cashRupiah(focus.totalLoanAmount)} · {focus.tenorMonths} bulan · {cashRupiah(focus.monthlyDeduction)} per bulan</p>
        {focus.purpose && <p className={'text-sm text-ink-muted '+wrap}>{focus.purpose}</p>}
        {focus.decision && <p className={'text-sm text-ink-muted '+wrap}>Keputusan: {focus.decision.by}{focus.decision.reason?' · '+focus.decision.reason:''}</p>}
        {focus.archived && <p className={'text-sm text-ink-muted '+wrap}>Ditarik oleh {focus.archived.by} · {focus.archived.reason}</p>}
        {focus.legacyDisbursement && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Pencairan lama belum tertaut. Cocokkan dengan Buku Kas sebelum mencatat ulang.</p>}
        {focus.disbursement && <p className={'text-sm '+wrap}>{focus.disbursement.reversal?'Pencairan dibalik':'Dicairkan'} · {financeDate(focus.disbursement.date)} · {focus.disbursement.accountName}</p>}
        {canWrite && focus.disbursement && !focus.disbursement.reversal && focus.installments.every(item=>item.reversal) &&
          <button className={link+' w-fit !text-rose-800'} type="button" onClick={()=>open({type:'reverse',loan:focus})}>Balik pencairan</button>}
      </div>}
      <div className={container}><Head title={loanId?'Status kasbon':'Kasbon berjalan'}>{loanId?<Jump href={loanPath()}>Lihat semua</Jump>:loanExport(loanRows)}</Head>
        {!loanId && <div className="grid gap-2 p-4 sm:grid-cols-2">{searchField}<Field label="Status"><select className={financeField} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">Semua status</option>{(['AWAITING_DISBURSEMENT','ACTIVE_INSTALLMENT','OVERDUE'] as const).map(id=><option key={id} value={id}>{loanStatuses[id]}</option>)}
        </select></Field></div>}
        <Rows key={search+filter} items={loanRows} label="kasbon" empty={loanId?'Kasbon tidak ditemukan.':'Tidak ada kasbon berjalan untuk pilihan ini.'} render={loanRow} />
      </div>
      {Boolean(focus?.installments.length) && <div className={container}><Head title="Angsuran kasbon" />
        <Rows items={history.filter(row=>row.loan.id===focus!.id)} label="angsuran" empty="Belum ada angsuran." render={paymentRow} /></div>}
    </section>}
    {tab==='new_requests' && <section className={container} aria-label="Pengajuan kasbon">
      <Head title="Menunggu persetujuan">{loanExport(requests)}</Head>
      <div className="grid gap-2 p-4 sm:grid-cols-2 sm:items-end">{searchField}{!canApprove && <p className="text-sm text-ink-muted">Persetujuan mengikuti peran pada kebijakan kasbon.</p>}</div>
      <Rows key={search} items={requests} label="pengajuan" empty="Tidak ada pengajuan menunggu." render={loanRow} />
      {awaiting.length>0 && <div className="border-t border-border px-4"><Jump href={loanPath()}>{awaiting.length} siap dicairkan</Jump></div>}
    </section>}


    {tab==='payroll_deductions' && <section className={container} aria-label="Potong gaji">
      <Head title="Potong gaji">{exportRows('potong-gaji-'+payrollMonth,[['Bulan','Petugas','Kasbon','Rencana (Rp)','Tercatat (Rp)','Jurnal gaji'],
        ...payroll.map(loan=>[payrollMonth,loan.staffName,loan.id,paidPayroll.has(loan.id)?'':Math.min(loan.monthlyDeduction,loan.remainingBalance),
          paidPayroll.get(loan.id)?.amount??'',paidPayroll.get(loan.id)?.expenseId||''])],payroll.length>0)}</Head>
      <div className="grid gap-2 px-4 py-3 sm:grid-cols-2 sm:items-end">{monthField('Bulan gaji',true)}{searchField}</div>
      <p className="px-4 pb-2 text-sm text-ink-muted">Potongan mengikuti pengeluaran gaji bersih yang sudah dibukukan.</p>
      <Rows key={search} items={payroll} label="potongan" empty="Tidak ada potongan untuk bulan ini." render={loan=>{
        const item=paidPayroll.get(loan.id);
        return <li key={loan.id} className={rowClass}>
          <div className="min-w-0"><a className={'font-bold hover:underline '+wrap} href={detail(loan)}>{loan.staffName}</a><p className="text-xs text-ink-muted">{staffRoles[loan.staffRole]}</p></div>
          <div><p className={figure}>{cashRupiah(item?.amount??Math.min(loan.monthlyDeduction,loan.remainingBalance))}</p>
            <p className="text-xs text-ink-muted">{item?(item.legacy?'Catatan lama':'Tercatat'):'Rencana potongan'}</p></div>
          <div className="flex flex-wrap gap-x-3 md:justify-end">{item?<><Jump href={loanPath({tab:'repayment_history',installment:item.id})}>Lihat angsuran</Jump>
            {item.expenseId && <Jump href={source(item)}>Jurnal gaji</Jump>}</>:
            canWrite && <button type="button" className={financeButton} onClick={()=>open({type:'repay',loan},true)}>Catat potongan</button>}</div>
        </li>;
      }} />
      <div className="border-t border-border px-4"><Jump href={expenses({month:payrollMonth})}>Buka pengeluaran</Jump></div>
    </section>}
    {tab==='repayment_history' && <section className="grid min-w-0 gap-4" aria-label="Riwayat angsuran">
      <div className={container}><Head title="Riwayat angsuran">{exportRows('riwayat-angsuran-kasbon',[
        ['Kuitansi','Petugas','Tanggal','Metode','Jumlah (Rp)','Status','Jurnal','Pengeluaran gaji'],
        ...repayments.map(({loan,item})=>[loanReceiptNumber(item.id),loan.staffName,item.paymentDate,loanMethods[item.paymentMethod],item.amount,
          item.reversal?'Dibalik':item.legacy?'Catatan lama':'Tercatat',item.journalId||'',item.expenseId||''])],repayments.length>0)}</Head>
        {installmentId || expenseId?<div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 px-4 text-sm text-sky-900">
          {expenseId?'Angsuran terkait jurnal gaji':'Angsuran terpilih'}<Jump href={loanPath({tab:'repayment_history'})}>Lihat semua</Jump></div>:
          <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3 xl:items-end">{searchField}<Field label="Metode">
            <select className={financeField} value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Semua metode</option>
              {Object.entries(loanMethods).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Field>{monthField('Bulan angsuran',false)}</div>}
        <Rows key={search+filter} items={repayments} label="angsuran" empty="Tidak ada angsuran untuk pilihan ini." render={paymentRow} />
      </div>
      {!installmentId && !expenseId && <div className={container}><Head title="Arsip kasbon" />
        <Rows items={archives} label="arsip" empty="Belum ada kasbon selesai, ditolak, atau ditarik." render={loanRow} /></div>}
    </section>}
    {tab==='loan_policies' && <Policy policy={policy} accounts={accounts} editable={canSetPolicy} saved={value=>{setPolicy(value);setNotice('Kebijakan tersimpan.');}} />}
    {action && <ActionDialog action={action} close={()=>setAction(null)} saved={saved} canWrite={canWrite}
      policy={policy} accounts={accounts} today={today} payrollMonth={payrollMonth} payrollOnly={payrollOnly} />}
  </div>;
}

function Policy({policy,accounts,editable,saved}:{policy:LoanPolicyConfig;accounts:LoanAccount[];editable:boolean;saved:(value:LoanPolicyConfig)=>void}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!editable || busy) return;
    const data=new FormData(event.currentTarget);
    setBusy(true);setError('');
    try { saved(await financePost<LoanPolicyConfig>(api+'policy',{maxLoanRatio:num(data,'ratio'),maxTenorMonths:num(data,'tenor'),minWorkingMonths:num(data,'service'),
      approvalMode:str(data,'approval'),defaultAccountId:str(data,'account'),repaymentNotes:str(data,'notes')})); }
    catch(error) {setError(error instanceof Error?error.message:'Kebijakan belum tersimpan.');}
    finally {setBusy(false);}
  }
  return <section className="workspace-panel grid min-w-0 gap-3" aria-label="Kebijakan kasbon">
    <h2 className="text-lg font-bold">Kebijakan kasbon</h2>
    {!editable && <p className="text-sm text-ink-muted">Hanya Ketua atau Admin yang dapat mengubah kebijakan.</p>}
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    <form onSubmit={submit} className="grid gap-3">
      <fieldset disabled={!editable || busy} className="grid min-w-0 gap-3 sm:grid-cols-2">
        <Field label="Batas dari gaji (%)"><input className={financeField} name="ratio" type="number" min={0} max={100} step="any" required defaultValue={policy.maxLoanRatio} /></Field>
        <Field label="Tenor maksimal (bulan)"><input className={financeField} name="tenor" type="number" min={1} max={60} required defaultValue={policy.maxTenorMonths} /></Field>
        <Field label="Masa kerja minimal (bulan)"><input className={financeField} name="service" type="number" min={0} max={600} required defaultValue={policy.minWorkingMonths} /></Field>
        <Field label="Pemberi persetujuan"><select className={financeField} name="approval" defaultValue={policy.approvalMode}>
          <option value="LEADERSHIP">Ketua atau Admin</option><option value="FINANCE">Ketua, Admin, atau Bendahara</option></select></Field>
        {accounts.length>0 && <Field label="Rekening pencairan bawaan"><Accounts accounts={accounts} value={policy.defaultAccountId} optional /></Field>}
        <div className="sm:col-span-2"><Field label="Ketentuan tambahan"><textarea className={financeField} name="notes" maxLength={3000} rows={3} defaultValue={policy.repaymentNotes} /></Field></div>
      </fieldset>
      {editable && <button disabled={busy} className={financePrimary+' w-fit'}>{busy?'Menyimpan…':'Simpan kebijakan'}</button>}
    </form>
  </section>;
}


function ActionDialog({action,close,saved,canWrite,policy,accounts,today,payrollMonth,payrollOnly}:{
  action:Action;close:()=>void;saved:(loan:StaffLoan,item?:InstallmentRecord)=>void;canWrite:boolean;policy:LoanPolicyConfig;accounts:LoanAccount[];
  today:string;payrollMonth:string;payrollOnly:boolean;
}) {
  const loan=action.loan;
  const [method,setMethod]=useState<LoanMethod>(payrollOnly?'POTONG_GAJI':accounts.some(item=>!isCashAccount(item.type))?'TRANSFER_BANK':'TUNAI_CASH');
  const [requestId]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [payroll,setPayroll]=useState<PayrollExpense[]|null>(null),[payrollError,setPayrollError]=useState('');
  useEffect(()=>{
    if(action.type!=='repay'||method!=='POTONG_GAJI') return;
    const controller=new AbortController();
    setPayroll(null);setPayrollError('');
    apiFetch(api+'payroll?'+new URLSearchParams({month:payrollMonth}),{signal:controller.signal}).then(async res=>{
      const body=await res.json();if(!controller.signal.aborted) setPayroll(body.data);
    }).catch(err=>{if(!controller.signal.aborted) setPayrollError(err instanceof Error?err.message:'Jurnal belum dapat dimuat.');});
    return ()=>controller.abort();
  },[action.type,method,payrollMonth]);
  const available=accounts.filter(account=>(method==='TUNAI_CASH')===isCashAccount(account.type));
  const first=loan?.disbursement?.date || loan?.loanDate;
  const options=payroll?.filter(row=>!first || row.date>=first) || [];
  const titles={request:loan?'Ubah pengajuan':'Ajukan kasbon',decision:action.type==='decision'&&action.decision==='REJECT'?'Tolak pengajuan':'Setujui pengajuan',
    disburse:'Catat pencairan',repay:'Catat angsuran',withdraw:'Tarik pengajuan',reverse:action.type==='reverse'&&action.item?'Balik angsuran':'Balik pencairan',receipt:'Kuitansi angsuran'};
  const date=(value:string,min?:string)=><input className={financeField} type="date" name="date" required min={min} max={today} defaultValue={value} />;
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!canWrite || busy || action.type==='receipt') return;
    const data=new FormData(event.currentTarget);
    setBusy(true);setError('');
    try {
      if(action.type==='request') {
        const fields={staffName:str(data,'name'),staffRole:str(data,'role'),staffPhone:str(data,'phone'),staffSince:str(data,'since'),baseSalary:num(data,'salary'),
          loanType:str(data,'kind'),totalLoanAmount:num(data,'principal'),monthlyDeduction:num(data,'monthly'),tenorMonths:num(data,'tenor'),loanDate:str(data,'date'),purpose:str(data,'purpose'),notes:str(data,'notes')};
        saved(await financePost<StaffLoan>(api+(loan?'update':'create'),loan?{...fields,loanId:loan.id}:{...fields,requestId}));return;
      }
      const loanId=action.loan.id;
      if(action.type==='repay') {
        const selected=options.find(item=>item.id===str(data,'expense'));
        const result=await financePost<{loan:StaffLoan;installment:InstallmentRecord}>(api+'installment',{
          loanId,requestId,installmentAmount:num(data,'amount'),paymentMethod:method,notes:str(data,'notes'),...(method==='POTONG_GAJI'?
            {expenseId:selected?.id,installmentDate:selected?.date,netPayrollConfirmed:data.has('net')}:{installmentDate:str(data,'date'),accountId:str(data,'account')})});
        saved(result.loan,result.installment);return;
      }
      const reason=str(data,'reason');
      const [operation,payload]=action.type==='decision'?['decision',{loanId,decision:action.decision,notes:reason}]:
        action.type==='disburse'?['disburse',{loanId,accountId:str(data,'account'),date:str(data,'date')}]:
        action.type==='withdraw'?['delete',{loanId,reason}]:['reverse',{loanId,installmentId:action.type==='reverse'?action.item?.id:undefined,reason}];
      saved((await financePost<{loan:StaffLoan}>(api+operation,payload)).loan);
    } catch(err) {setError(err instanceof Error?err.message:'Perubahan belum tersimpan.');}
    finally {setBusy(false);}
  }
  const wa=action.type==='receipt' && canWrite && !action.item.reversal && financeWhatsAppNumber(action.loan.staffPhone) ? financeWhatsAppLink(
    ['Kuitansi angsuran '+loanReceiptNumber(action.item.id),action.loan.staffName,cashRupiah(action.item.amount)+' · '+financeDate(action.item.paymentDate)].join('\n'),action.loan.staffPhone) : null;
  return <FinanceDialog open title={titles[action.type]} close={close} busy={busy} error={error}>
    {action.type==='receipt'?<>
      <LoanReceiptBody loan={action.loan} item={action.item} />
      <div className="flex flex-wrap gap-2">
        <a href={loanPath({receipt:action.item.id})} className={financePrimary} data-astro-reload>Cetak kuitansi</a>
        {source(action.item) && <Jump href={source(action.item)}>{action.item.expenseId?'Jurnal gaji':'Buku kas'}</Jump>}
        {wa && <a className={financeButton} href={wa} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
      </div>
    </>:<form className="grid min-w-0 gap-3" onSubmit={submit}>
      {action.type==='request'?<>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          <Field label="Nama petugas"><input className={financeField} name="name" minLength={2} maxLength={255} required defaultValue={loan?.staffName} /></Field>
          <Field label="Peran"><select className={financeField} name="role" defaultValue={loan?.staffRole || 'SATPAM'}>{Object.entries(staffRoles).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Field>
          <Field label="WhatsApp (opsional)"><input className={financeField} type="tel" name="phone" maxLength={50} defaultValue={loan?.staffPhone} /></Field>
          <Field label={policy.minWorkingMonths?'Mulai bekerja':'Mulai bekerja (opsional)'}><input className={financeField} type="date" name="since" max={today} required={policy.minWorkingMonths>0} defaultValue={loan?.staffSince} /></Field>
          <Field label="Jenis"><select className={financeField} name="kind" defaultValue={loan?.loanType || 'KASBON_CICILAN'}>{Object.entries(loanTypes).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Field>
          <Field label="Tanggal pengajuan">{date(loan?.loanDate || today)}</Field>
          <Field label="Gaji pokok (Rp)"><input className={financeField} name="salary" type="number" min={1} required defaultValue={loan?.baseSalary || undefined} /></Field>
          <Field label="Pokok kasbon (Rp)"><input className={financeField} name="principal" type="number" min={1} required defaultValue={loan?.totalLoanAmount} /></Field>
          <Field label="Angsuran per bulan (Rp)"><input className={financeField} name="monthly" type="number" min={1} required defaultValue={loan?.monthlyDeduction} /></Field>
          <Field label="Tenor (bulan)"><input className={financeField} name="tenor" type="number" min={1} max={policy.maxTenorMonths} required defaultValue={loan?.tenorMonths} /></Field>
        </div>
        <Field label="Tujuan"><input className={financeField} name="purpose" minLength={3} maxLength={1000} required defaultValue={loan?.purpose} /></Field>
        <Field label="Catatan (opsional)"><textarea className={financeField} name="notes" maxLength={2000} rows={2} defaultValue={loan?.notes} /></Field>
        <p className="text-xs text-ink-muted">Maksimal {policy.maxLoanRatio}% dari gaji pokok, tenor {policy.maxTenorMonths} bulan.</p>
      </>:<>
        <p className={'text-sm font-semibold '+wrap}>{action.loan.staffName} · {cashRupiah(action.type==='repay'?action.loan.remainingBalance:action.loan.totalLoanAmount)}</p>
        {action.type==='disburse' && <>
          <p className="text-sm text-ink-muted">Catat setelah dana diserahkan. Saldo berkurang sesuai pokok kasbon.</p>
          {accounts.length?<><Field label="Rekening sumber"><Accounts accounts={accounts} value={policy.defaultAccountId} /></Field><Field label="Tanggal pencairan">{date(today,action.loan.loanDate)}</Field></>:
            <FinanceEmpty action={<Jump href={ledger({tab:'accounts_manage'})}>Siapkan rekening</Jump>}>Belum ada rekening kas aktif.</FinanceEmpty>}
        </>}
        {action.type==='repay' && <>
          <Field label="Jumlah angsuran (Rp)"><input className={financeField} name="amount" type="number" min={1} required
            max={method==='POTONG_GAJI'?Math.min(action.loan.monthlyDeduction,action.loan.remainingBalance):action.loan.remainingBalance}
            defaultValue={Math.min(action.loan.monthlyDeduction,action.loan.remainingBalance)} /></Field>
          {!payrollOnly && <Field label="Metode"><select className={financeField} name="method" value={method} onChange={e=>setMethod(e.target.value as LoanMethod)}>
            {Object.entries(loanMethods).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></Field>}
          {method==='POTONG_GAJI'?<>
            <p className="text-sm text-ink-muted">{financeMonth(payrollMonth)} · Saldo kas mengikuti jurnal gaji bersih.</p>
            {payrollError?<p role="alert" className="text-sm text-rose-800">{payrollError}</p>:!payroll?<p role="status" className="text-sm text-ink-muted">Memuat jurnal…</p>:
              options.length?<><Field label="Pengeluaran gaji bersih"><select name="expense" className={financeField} required defaultValue="">
                <option value="" disabled>Pilih jurnal gaji</option>{options.map(item=><option key={item.id} value={item.id}>{financeDate(item.date)} · {item.title} · {cashRupiah(item.amount)}</option>)}</select></Field>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input name="net" type="checkbox" required />Potongan sudah dikurangi dari gaji yang dibayar.</label></>:
              <FinanceEmpty action={<Jump href={expenses({month:payrollMonth})}>Buka pengeluaran</Jump>}>Belum ada jurnal yang bisa ditautkan.</FinanceEmpty>}
          </>:<>
            {available.length?<Field label="Rekening penerima"><Accounts key={method} accounts={available} value={policy.defaultAccountId} /></Field>:
              <FinanceEmpty action={<Jump href={ledger({tab:'accounts_manage'})}>Buka rekening</Jump>}>Belum ada rekening yang sesuai metode.</FinanceEmpty>}
            <Field label="Tanggal angsuran">{date(today,first)}</Field>
          </>}
          <Field label="Catatan (opsional)"><input className={financeField} name="notes" maxLength={1000} /></Field>
        </>}
        {(action.type==='decision' || action.type==='withdraw' || action.type==='reverse') && <>
          {action.type==='reverse' && <p className="text-sm text-ink-muted">{action.item?.expenseId?'Potongan dilepas dari jurnal gaji; saldo kas tetap.':'Catat pembalikan setelah dana dikoreksi.'}</p>}
          {action.type==='decision' && action.decision==='APPROVE' && <p className="text-sm text-ink-muted">Kasbon masuk antrean pencairan setelah disetujui.</p>}
          <Field label={action.type==='decision'&&action.decision==='APPROVE'?'Catatan (opsional)':'Alasan'}><textarea className={financeField} name="reason" rows={2} maxLength={1000}
            required={action.type!=='decision'||action.decision==='REJECT'} minLength={action.type==='decision'&&action.decision==='APPROVE'?0:3} /></Field>
        </>}
      </>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={financePrimary} disabled={busy || (action.type==='disburse'&&!accounts.length) ||
          (action.type==='repay' && (method==='POTONG_GAJI'?!options.length:!available.length))}>
          {busy?'Menyimpan…':action.type==='decision'?(action.decision==='APPROVE'?'Setujui':'Tolak'):action.type==='reverse'?'Catat pembalikan':'Simpan'}
        </button><button type="button" className={financeButton} disabled={busy} onClick={close}>Tutup</button>
      </div>
    </form>}
  </FinanceDialog>;
}
