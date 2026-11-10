/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowDownToLine, ArrowLeftRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, ChevronLeft, ChevronRight, ClipboardCheck, MessageCircle, Plus, WalletCards } from 'lucide-react';
import { downloadFinanceCsv, financeDate, financePath, jakartaDate } from '../../lib/billing-data';
import { cashRupiah, currentFinanceMonth, financeMonth, isEditableJournal, isInternalTransfer, ledgerSources, type CashJournalRow, type CashPeriodSummary, type CashReconciliation, type LedgerScope, type LedgerSubTab } from '../../lib/cash-data';
import type { FinanceWhatsAppProfile } from '../../lib/finance-whatsapp';
import { RESERVE_ACCOUNT } from '../../lib/planning-data';
import type { FinanceAccount } from '../../services/finance.service';
import { WhatsAppDuesReportModal } from '../shared/WhatsAppDuesReportModal';
import { FinanceDialog, FinanceEmpty, FinanceHeader, FinanceStatus, FinanceSummary, FinanceTabLinks, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';

const path = (params:Record<string,string|undefined>={})=>financePath('/admin/ledger',params);
const link = 'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline';
const menus = [
  {id:'ledger_list',label:'Jurnal',icon:BookOpen},{id:'accounts_manage',label:'Rekening',icon:WalletCards},
  {id:'bank_reconciliation',label:'Rekonsiliasi',icon:ClipboardCheck},{id:'financial_reports',label:'Laporan kas',icon:ChartNoAxesCombined},
] as const;
const accountTypes:Record<string,string> = {BANK:'Bank',CASH:'Kas tunai',SAVINGS:'Tabungan',PETTY_CASH:'Kas kecil',RESERVE:'Dana cadangan'};
const sourceFilters = {expense:'Pengeluaran',payment:'Iuran',transfer:'Mutasi internal',manual:'Jurnal dan sumber lain'};
const noticeLabels:Record<string,string> = {journal:'Jurnal tersimpan.',transfer:'Mutasi tersimpan pada kedua rekening.',account:'Rekening tersimpan.',delete:'Pembatalan tersimpan.'};
const sourceHeadings = {payment:'Jurnal pembayaran',expense:'Jurnal pengeluaran',transfer:'Pasangan mutasi'};
const str = (data:FormData,key:string)=>String(data.get(key) || '').trim();
const amount = (data:FormData,key:string)=>Number(str(data,key));
type WorkspaceLedger = {entries:CashJournalRow[];summary:CashPeriodSummary;total:number;page:number};
type Modal = {type:'journal'|'delete';row?:CashJournalRow} | {type:'account';account?:FinanceAccount} | {type:'transfer'};
interface Props {
  accounts:FinanceAccount[];accountId:string;ledger:WorkspaceLedger|null;reconciliation:CashReconciliation|null;
  initialTab:LedgerSubTab;canWrite:boolean;month:string;search:string;source:string;scope?:LedgerScope;journalPageSize:number;initialNotice:string;
  shareProfile:FinanceWhatsAppProfile|null;today:string;
  category:string;categoryLabel:string;
}

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}
function AccountSelect({accounts,value,name='account',all,required}:{accounts:FinanceAccount[];value:string;name?:string;all?:boolean;required?:boolean}) {
  return <select name={name} defaultValue={value} required={required} className={financeField}>
    <option value="" disabled={!all}>{all?'Semua rekening':'Pilih rekening'}</option>
    {accounts.map(account=><option key={account.id} value={account.id}>{account.name}</option>)}
  </select>;
}
function sourceHref(row:CashJournalRow,canWrite:boolean) {
  if (!row.sourceId) return null;
  if (['PAYMENT','PAYMENT_REVERSAL'].includes(row.sourceType)) return canWrite?financePath('/admin/payments',{tab:'history',payment:row.sourceId}):path({payment:row.sourceId});
  if (['EXPENSE','EXPENSE_REVERSAL'].includes(row.sourceType)) return financePath('/admin/expenses',{expense:row.sourceId});
  if (isInternalTransfer(row.sourceType)) return path({transfer:row.sourceId});
  return null;
}
function CashSummary({summary,month}:{summary:CashPeriodSummary;month:string}) {
  return <FinanceSummary items={[
    {label:'Saldo akhir',value:cashRupiah(summary.closing),detail:financeMonth(month),tone:'mint'},
    {label:'Pemasukan bersih',value:cashRupiah(summary.income),detail:'Setelah pembalikan',tone:'sky'},
    {label:'Pengeluaran bersih',value:cashRupiah(summary.outgoing),detail:'Setelah pembatalan',tone:'rose'},
  ]} />;
}

function ReconciliationPanel({initial,canWrite}:{initial:CashReconciliation;canWrite:boolean}) {
  const [data,setData] = useState(initial);
  const [statement,setStatement] = useState(initial.saved ? String(initial.saved.statementBalance) : '');
  const [note,setNote] = useState(initial.saved?.note || '');
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState('');
  const [error,setError] = useState('');
  const difference = statement.trim() && Number.isFinite(Number(statement)) ? Math.round((Number(statement)-data.summary.closing)*100)/100 : null;
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');setFeedback('');
    try {
      setData(await financePost<CashReconciliation>('/api/ledger/reconciliation',{accountId:data.accountId,month:data.month,expectedVersion:data.fingerprint,statementBalance:Number(statement),note}));
      setFeedback('Rekonsiliasi tersimpan.');
    } catch(error) {setError(error instanceof Error?error.message:'Rekonsiliasi belum tersimpan.');}
    finally {setBusy(false);}
  }
  function download() {
    if (!data.saved) return;
    const record = data.saved;
    downloadFinanceCsv('rekonsiliasi-'+data.month+'.csv',[['Periode','Rekening','Saldo buku saat diperiksa','Saldo pembanding','Selisih','Pemeriksa','Tanggal','Status','Catatan'],
      [data.month,data.accountId,record.bookBalance,record.statementBalance,Math.round((record.statementBalance-record.bookBalance)*100)/100,record.by,record.at,
        data.status==='STALE'?'Perlu cek ulang':data.status==='MATCHED'?'Cocok':'Ada selisih',record.note]]);
  }
  return <section className="workspace-panel grid min-w-0 gap-3" aria-label="Rekonsiliasi rekening">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="!mb-0 text-lg font-bold">Cocokkan saldo</h2>
      <FinanceStatus value={data.status} />
    </header>
    <div className="grid gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-900 sm:grid-cols-2 sm:items-center">
      <p>Saldo buku akhir periode <strong className="block text-lg tabular-nums">{cashRupiah(data.summary.closing)}</strong></p>
      <a href={path({month:data.month,account:data.accountId})} className={link+' sm:justify-self-end'}>Periksa jurnal periode ini <ArrowUpRight className="size-4" aria-hidden="true" /></a>
    </div>
    {data.saved && <div className="grid min-w-0 gap-1 border-b border-border pb-3 text-sm">
      <p>Terakhir diperiksa {financeDate(data.saved.at)} oleh <strong>{data.saved.by}</strong>.</p>
      <p className="text-ink-muted [overflow-wrap:anywhere]">Saldo pembanding {cashRupiah(data.saved.statementBalance)}{data.saved.note?' · '+data.saved.note:''}</p>
      <button type="button" className={link+' justify-self-start'} onClick={download}><ArrowDownToLine className="size-4" aria-hidden="true" />Unduh hasil</button>
    </div>}
    {data.status==='STALE' && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Jurnal berubah sejak pemeriksaan terakhir. Cocokkan kembali dengan bukti saldo.</p>}
    {canWrite && data.month<=currentFinanceMonth() && <form className="grid gap-3" onSubmit={save}>
      <Field label="Saldo akhir rekening koran atau kas fisik (Rp)"><input className={financeField} type="number" step="0.01" inputMode="decimal" required
        value={statement} placeholder="Masukkan saldo pembanding" onChange={event=>setStatement(event.target.value)} /></Field>
      {difference!==null && <p role="status" className={'text-sm font-semibold '+(difference===0?'text-primary-800':'text-rose-800')}>Selisih {cashRupiah(difference)}</p>}
      <Field label={difference!==null && difference!==0?'Catatan selisih':'Referensi atau catatan (opsional)'}>
        <textarea className={financeField} maxLength={500} minLength={difference!==null && difference!==0?5:undefined} required={difference!==null && difference!==0}
          value={note} onChange={event=>setNote(event.target.value)} placeholder="Misalnya tanggal rekening koran" />
      </Field>
      {feedback && <p role="status" className="text-sm font-semibold text-primary-800">{feedback}</p>}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      <button type="submit" className={financePrimary+' justify-self-start'} disabled={busy}>{busy?'Menyimpan…':'Simpan rekonsiliasi'}</button>
    </form>}
  </section>;
}

export function LedgerManager({accounts,accountId,ledger,reconciliation,initialTab:tab,canWrite,month,search,source,scope,journalPageSize,initialNotice,shareProfile,today,category,categoryLabel}:Props) {
  const [modal,setModal] = useState<Modal|null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [accountType,setAccountType] = useState('BANK');
  const [showReport,setShowReport] = useState(false);
  const shareBank = canWrite && tab==='accounts_manage';
  const shareCash = canWrite && tab==='financial_reports' && !accountId && Boolean(ledger);
  const account = accounts.find(item=>item.id===accountId);
  const operating=accounts.filter(item=>item.isActive && item.type!==RESERVE_ACCOUNT);
  const operatingId=operating.find(item=>item.id===accountId)?.id || operating[0]?.id || '';
  const actionRow = modal && 'row' in modal ? modal.row : undefined;
  const actionAccount = modal?.type==='account' ? modal.account : undefined;
  const query = scope ? {[scope.type]:scope.id} : {month,account:accountId,q:search,source,category};
  const selectedTitle = scope ? sourceHeadings[scope.type] : 'Buku kas';
  const back = scope?.type==='payment' && canWrite ? financePath('/admin/payments',{tab:'history',payment:scope.id}) :
    scope?.type==='expense' ? financePath('/admin/expenses',{expense:scope.id}) : '';
  const title = modal?.type==='transfer'?'Pindah saldo antar rekening':modal?.type==='account'?(actionAccount?'Ubah rekening':'Rekening baru'):
    modal?.type==='delete'?(actionRow && isInternalTransfer(actionRow.sourceType)?'Batalkan mutasi':'Batalkan jurnal'):actionRow?'Ubah jurnal':'Catat jurnal manual';
  const open = (value:Modal)=>{
    setError('');if(value.type==='account') setAccountType(value.account?.type || 'BANK');setModal(value);
  };

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal || busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);setError('');
    try {
      if (modal.type==='journal') {
        const result = await financePost<{id:string}>('/api/ledger/'+(actionRow?'update':'create'),{ledgerId:actionRow?.id,accountId:str(data,'accountId'),
          entryDate:str(data,'entryDate'),direction:str(data,'direction'),amount:amount(data,'amount'),description:str(data,'description'),referenceNo:str(data,'referenceNo')});
        window.location.assign(path({q:result.id,saved:'journal'}));
      } else if (modal.type==='transfer') {
        const result = await financePost<{transferId:string}>('/api/ledger/transfer',{fromAccountId:str(data,'fromAccountId'),toAccountId:str(data,'toAccountId'),
          amount:amount(data,'amount'),description:str(data,'description'),entryDate:str(data,'entryDate')});
        window.location.assign(path({transfer:result.transferId,saved:'transfer'}));
      } else if (modal.type==='account') {
        await financePost('/api/accounts/save',{id:actionAccount?.id,name:str(data,'name'),code:str(data,'code'),type:accountType,bankName:str(data,'bankName'),
          accountNumber:str(data,'accountNumber'),balance:actionAccount?0:amount(data,'balance')});
        window.location.assign(path({tab:'accounts_manage',saved:'account'}));
      } else if (modal.type==='delete' && actionRow) {
        await financePost('/api/ledger/delete',{ledgerId:actionRow.id,reason:str(data,'reason')});
        window.location.assign(path({month,account:accountId,saved:'delete'}));
      }
    } catch(error) {setError(error instanceof Error?error.message:'Perubahan belum tersimpan.');setBusy(false);}
  }

  const monthAccount = (mode:'bank_reconciliation'|'financial_reports')=><form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end" action="/admin/ledger">
    <input type="hidden" name="tab" value={mode} />
    <Field label="Periode"><input className={financeField+' min-w-0'} name="month" type="month" defaultValue={month} max={mode==='bank_reconciliation'?currentFinanceMonth():undefined} required /></Field>
    <Field label="Rekening"><AccountSelect accounts={mode==='financial_reports'?accounts:operating} value={accountId} all={mode==='financial_reports'} required={mode==='bank_reconciliation'} /></Field>
    <button type="submit" className={financeButton}>Tampilkan</button>
  </form>;

  return <section className="workspace">
    <FinanceHeader area="ledger" title={selectedTitle} canViewPayments={canWrite}>
      {back && <a className={financePrimary} href={back}>{scope?.type==='payment'?'Lihat pembayaran':'Lihat pengeluaran'} <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
      {!scope && canWrite && tab==='ledger_list' && operating.length>0 && account?.type!==RESERVE_ACCOUNT && <button type="button" className={financePrimary} onClick={()=>open({type:'journal'})}>
        <Plus className="size-4" aria-hidden="true" />Catat jurnal</button>}
      {canWrite && tab==='accounts_manage' && <button type="button" className={financePrimary} onClick={()=>open({type:'account'})}><Plus className="size-4" aria-hidden="true" />Rekening baru</button>}
      {(shareBank || shareCash) && <button type="button" className={financeButton} onClick={()=>setShowReport(true)}>
        <MessageCircle className="size-4" aria-hidden="true" />{shareBank?'Siaran rekening WA':'Laporan WA (wa.me)'}
      </button>}
      {!scope && canWrite && operating.length>1 && account?.type!==RESERVE_ACCOUNT && ['ledger_list','accounts_manage'].includes(tab) && <button type="button" className={financeButton} onClick={()=>open({type:'transfer'})}>
        <ArrowLeftRight className="size-4" aria-hidden="true" />Pindah saldo</button>}
    </FinanceHeader>
    <FinanceTabLinks tabs={menus.map(item=>({...item,href:path({tab:item.id,month:item.id!=='accounts_manage'?month:undefined,account:item.id!=='accounts_manage'?accountId:undefined})}))} active={tab} label="Menu buku kas" />
    {Object.hasOwn(noticeLabels,initialNotice) && <p role="status" className="rounded-xl bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{noticeLabels[initialNotice]}</p>}
    {tab==='ledger_list' && ledger && <>
      {scope ? <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm text-sky-900">
        <p className="min-w-0 font-medium [overflow-wrap:anywhere]">{scope.id}</p><a href={path()} className={link}>Semua jurnal</a>
      </div> : category ? <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm text-sky-900">
        <p className="min-w-0 font-medium [overflow-wrap:anywhere]">{categoryLabel} · {financeMonth(month)}</p><a className={link} href={path({month,account:accountId})}>Hapus kategori</a>
      </div> : <CashSummary summary={ledger.summary} month={month} />}
      <section aria-label="Jurnal kas" className="min-w-0 rounded-2xl border border-border bg-surface">
        {!scope && <form className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[minmax(9rem,1.5fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_auto] lg:items-end" action="/admin/ledger">
          {category && <><input type="hidden" name="category" value={category} /><input type="hidden" name="source" value="expense" /></>}
          <Field label="Cari jurnal"><input className={financeField} name="q" defaultValue={search} placeholder="Deskripsi atau nomor" maxLength={100} /></Field>
          <Field label="Periode"><input className={financeField+' min-w-0'} name="month" type="month" defaultValue={month} /></Field>
          <Field label="Rekening"><AccountSelect accounts={accounts} value={accountId} all /></Field>
          <Field label="Sumber"><select className={financeField} name="source" defaultValue={source} disabled={Boolean(category)}><option value="">Semua sumber</option>
            {Object.entries(sourceFilters).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field>
          <button type="submit" className={financeButton}>Tampilkan</button>
        </form>}
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <h2 className="font-bold">{scope?'Transaksi terkait':'Transaksi kas'}</h2>
          <div className="flex flex-wrap items-center gap-3">
            {!scope && (month || accountId || search || source) && <a className={link} href={path()}>Reset filter</a>}
            {ledger.total>0 && <a className={link} data-astro-reload href={path({...query,download:'csv'})}><ArrowDownToLine className="size-4" aria-hidden="true" />CSV</a>}
          </div>
        </header>
        {!ledger.entries.length ? <div className="p-4"><FinanceEmpty>{ledger.total?'Halaman ini tidak memiliki transaksi.':scope?'Jurnal terkait belum ditemukan.':'Tidak ada jurnal yang cocok.'}</FinanceEmpty></div> :
          <ul className="divide-y divide-border px-4">
            {ledger.entries.map(row=>{
              const destination = sourceHref(row,canWrite);
              const incoming = row.direction==='IN';
              const transfer = row.sourceType==='INTERNAL_TRANSFER';
              const edit = isEditableJournal(row.sourceType);
              return <li key={row.id} data-journal-id={row.id} className="grid min-w-0 gap-x-4 gap-y-2 py-3 md:grid-cols-[minmax(0,1.65fr)_minmax(0,0.9fr)_minmax(0,1fr)] md:items-start">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className={'mt-0.5 rounded-lg p-2 '+(incoming?'bg-primary-50 text-primary-800':'bg-rose-50 text-rose-800')}>
                    {incoming?<ArrowDownLeft className="size-4" aria-hidden="true" />:<ArrowUpRight className="size-4" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0"><p className="font-semibold [overflow-wrap:anywhere]">{row.description}</p>
                    <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[financeDate(row.entryDate),row.accountName || 'Tanpa rekening',ledgerSources[row.sourceType] || row.sourceType].join(' · ')}</p>
                    {scope && <p className="mt-0.5 text-xs text-ink-muted [overflow-wrap:anywhere]">{row.id}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-start">
                  <p className={'font-bold tabular-nums [overflow-wrap:anywhere] '+(incoming?'text-primary-800':'text-rose-800')}>{incoming?'+':'−'}{cashRupiah(row.amount)}</p>
                  <p className="text-xs tabular-nums text-ink-muted">Saldo setelah {cashRupiah(row.runningBalance)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 md:justify-end">
                  {destination && !(scope?.type==='transfer' && isInternalTransfer(row.sourceType)) && !(scope?.type==='payment' && !canWrite) && <a className={link} href={destination}>{isInternalTransfer(row.sourceType)?'Lihat pasangan':'Lihat sumber'} <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                  {canWrite && edit && <button className={link} type="button" onClick={()=>open({type:'journal',row})}>Ubah</button>}
                  {canWrite && (edit || transfer) && <button className={link+' !text-rose-800'} type="button" onClick={()=>open({type:'delete',row})}>Batalkan</button>}
                </div>
              </li>;
            })}
          </ul>}
        {ledger.total>journalPageSize && <nav aria-label="Halaman jurnal" className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-sm text-ink-muted">
          <p>{ledger.entries.length?((ledger.page-1)*journalPageSize+1)+'–'+Math.min(ledger.page*journalPageSize,ledger.total)+' dari ':''}{ledger.total} transaksi</p>
          <div className="flex gap-2">
            {ledger.page>1 && <a className="icon-button" href={path({...query,page:String(ledger.page-1)})} aria-label="Halaman sebelumnya"><ChevronLeft className="size-5" /></a>}
            {ledger.page*journalPageSize<ledger.total && <a className="icon-button" href={path({...query,page:String(ledger.page+1)})} aria-label="Halaman berikutnya"><ChevronRight className="size-5" /></a>}
          </div>
        </nav>}
      </section>
    </>}
    {tab==='accounts_manage' && <section className="grid gap-4" aria-label="Rekening kas">
      <FinanceSummary items={[
        {label:'Saldo kas aktif',value:cashRupiah(accounts.reduce((sum,item)=>sum+item.balance,0)),detail:accounts.some(item=>item.type===RESERVE_ACCOUNT)?'Termasuk dana cadangan':undefined,tone:'mint'},
        {label:'Rekening bank & tabungan',value:accounts.filter(item=>['BANK','SAVINGS'].includes(item.type)).length,tone:'sky'},
        {label:'Kas tunai & kas kecil',value:accounts.filter(item=>['CASH','PETTY_CASH'].includes(item.type)).length,tone:'amber'},
      ]} />
      {!accounts.length ? <FinanceEmpty>Belum ada rekening kas.</FinanceEmpty> : <div className="grid gap-3 lg:grid-cols-2">
        {accounts.map(item=><article key={item.id} className="workspace-panel grid gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <WalletCards className="size-10 shrink-0 rounded-lg bg-primary-50 p-2 text-primary-800" aria-hidden="true" />
            <div className="min-w-0"><h2 className="!mb-0 [overflow-wrap:anywhere]">{item.name}</h2>
              <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[accountTypes[item.type] || item.type,item.bankName,item.accountNumber?'•••• '+item.accountNumber.slice(-4):null,item.code].filter(Boolean).join(' · ')}</p></div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{cashRupiah(item.balance)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <a href={path({account:item.id})} className={financeButton}>Lihat jurnal</a>
            {item.type===RESERVE_ACCOUNT ? <a href={financePath('/admin/budget',{tab:'sinking_fund',fund:item.id})} className={financeButton}>Buka dana</a> : <>
              <a href={path({tab:'bank_reconciliation',account:item.id})} className={financeButton}>Rekonsiliasi</a>
              {canWrite && <button className={link+' px-1'} type="button" onClick={()=>open({type:'account',account:item})}>Ubah rekening</button>}
            </>}
          </div>
        </article>)}
      </div>}
    </section>}
    {tab==='bank_reconciliation' && (reconciliation ? <div className="grid gap-4">
      {monthAccount('bank_reconciliation')}
      <ReconciliationPanel key={reconciliation.accountId+'|'+reconciliation.month} initial={reconciliation} canWrite={canWrite} />
    </div> : <FinanceEmpty action={<a href={path({tab:'accounts_manage'})} className={financeButton}>Lihat rekening</a>}>Siapkan rekening untuk mulai rekonsiliasi.</FinanceEmpty>)}
    {tab==='financial_reports' && ledger && <section className="grid gap-4" aria-label="Laporan kas">
      {monthAccount('financial_reports')}
      <CashSummary summary={ledger.summary} month={month} />
      <section className="workspace-panel grid gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="!mb-0">Pergerakan saldo · {financeMonth(month)}</h2>
          <span className="text-sm text-ink-muted [overflow-wrap:anywhere]">{account?.name || 'Semua rekening'}</span></header>
        <dl className="divide-y divide-border text-sm">
          {([['Saldo awal',ledger.summary.opening],['Pemasukan bersih',ledger.summary.income],['Pengeluaran bersih',-ledger.summary.outgoing],
            ['Saldo awal rekening baru',ledger.summary.openingEntries],['Mutasi internal bersih',ledger.summary.transfers],['Saldo akhir',ledger.summary.closing]] as [string,number][]).map(([label,value])=><div key={label} className="flex min-h-11 flex-wrap items-center justify-between gap-2 py-1.5">
            <dt>{label}</dt><dd className="font-semibold tabular-nums">{cashRupiah(value)}</dd>
          </div>)}
        </dl>
        <div className="flex flex-wrap gap-2">
          <a href={path({month,account:accountId})} className={financeButton}>Lihat {ledger.summary.count} jurnal</a>
          {ledger.summary.count>0 && <a data-astro-reload href={path({month,account:accountId,download:'csv'})} className={financeButton}><ArrowDownToLine className="size-4" aria-hidden="true" />Unduh CSV</a>}
          {!accountId && <a href={financePath('/admin/analytics',{month})} className={financeButton}>Lihat tren</a>}
          {!accountId && month && <a href={'/transparency/'+month.replace('-','/')} className={financeButton}>Laporan warga <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
        </div>
      </section>
    </section>}
    {showReport && shareBank && <WhatsAppDuesReportModal mode="bank" today={today} profile={shareProfile} onClose={()=>setShowReport(false)} />}
    {showReport && shareCash && ledger && <WhatsAppDuesReportModal mode="cash" month={month} summary={ledger.summary}
      today={today} profile={shareProfile} onClose={()=>setShowReport(false)} />}
    <FinanceDialog open={Boolean(modal)} title={title} close={()=>setModal(null)} busy={busy} error={error}>
      {modal && <form className="grid gap-3" onSubmit={submit} key={modal.type+(actionRow?.id || actionAccount?.id || '')}>
        {modal.type==='account' ? <>
          <Field label="Nama rekening"><input className={financeField} name="name" minLength={2} maxLength={120} required defaultValue={actionAccount?.name} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kode rekening"><input className={financeField} name="code" pattern="[A-Za-z0-9_\-]{2,40}" maxLength={40} required defaultValue={actionAccount?.code} /></Field>
            <Field label="Jenis rekening"><select className={financeField} value={accountType} onChange={event=>setAccountType(event.target.value)}>
              {Object.entries(accountTypes).filter(([value])=>value!==RESERVE_ACCOUNT).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field>
            {['BANK','SAVINGS'].includes(accountType) && <>
              <Field label="Nama bank (opsional)"><input className={financeField} name="bankName" maxLength={100} defaultValue={actionAccount?.bankName || ''} /></Field>
              <Field label="Nomor rekening (opsional)"><input className={financeField} name="accountNumber" inputMode="numeric" maxLength={100} defaultValue={actionAccount?.accountNumber || ''} /></Field>
            </>}
          </div>
          {!actionAccount && <Field label="Saldo awal (Rp)"><input className={financeField} name="balance" type="number" min="0" step="0.01" required defaultValue={0} /></Field>}
        </> : modal.type==='delete' ? <>
          <p className="text-sm">{actionRow?.description}. {actionRow && isInternalTransfer(actionRow.sourceType)?'Kedua jurnal mutasi dibatalkan dan saldo dua rekening disesuaikan.':'Saldo rekening disesuaikan dan tindakan masuk ke riwayat audit.'}</p>
          <Field label="Alasan pembatalan"><textarea className={financeField} name="reason" required minLength={5} maxLength={500} /></Field>
        </> : <>
          <div className="grid gap-3 sm:grid-cols-2">
            {modal.type==='transfer' ? <>
              <Field label="Rekening asal"><AccountSelect accounts={operating} name="fromAccountId" value={operatingId} required /></Field>
              <Field label="Rekening tujuan"><AccountSelect accounts={operating} name="toAccountId" value="" required /></Field>
            </> : <>
              <Field label="Rekening"><AccountSelect accounts={operating} name="accountId" value={actionRow?.accountId || operatingId} required /></Field>
              <Field label="Arus kas"><select className={financeField} name="direction" defaultValue={actionRow?.direction || 'IN'}><option value="IN">Masuk</option><option value="OUT">Keluar</option></select></Field>
            </>}
            <Field label="Tanggal transaksi"><input className={financeField+' min-w-0'} name="entryDate" type="date" max={jakartaDate()} required defaultValue={actionRow?.entryDate || jakartaDate()} /></Field>
            <Field label="Nominal (Rp)"><input className={financeField} name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={actionRow?.amount} /></Field>
          </div>
          <Field label="Deskripsi"><input className={financeField} name="description" required minLength={3} maxLength={500} defaultValue={actionRow?.description} /></Field>
          {modal.type==='journal' && <Field label="Nomor referensi (opsional)"><input className={financeField} name="referenceNo" maxLength={64} defaultValue={actionRow?.sourceId || ''} /></Field>}
          {modal.type==='journal' && !actionRow && <p className="text-sm text-ink-muted">Untuk iuran atau belanja, gunakan menu <a className="font-semibold text-primary-800 underline" href="/admin/payments">Pembayaran</a> atau <a className="font-semibold text-primary-800 underline" href="/admin/expenses">Pengeluaran</a>.</p>}
        </>}
        <footer className="flex flex-wrap justify-end gap-2">
          <button type="button" className={financeButton} disabled={busy} onClick={()=>setModal(null)}>Tutup</button>
          <button type="submit" className={modal.type==='delete'?'inline-flex min-h-11 items-center rounded-lg bg-rose-700 px-4 font-semibold text-white hover:bg-rose-800':financePrimary} disabled={busy}>{busy?'Menyimpan…':modal.type==='delete'?'Batalkan transaksi':'Simpan'}</button>
        </footer>
      </form>}
    </FinanceDialog>
  </section>;
}
