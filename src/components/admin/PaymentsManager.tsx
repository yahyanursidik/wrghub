/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Banknote, Check, Download, ExternalLink, FileCheck2, Filter, MessageCircle, Plus, Receipt, Wallet } from 'lucide-react';
import {
  downloadFinanceCsv, financeDate, financePath, invoiceRemaining, jakartaDate, PAYMENT_METHODS, paymentMethodLabel, proofLink,
} from '../../lib/billing-data';
import { formatRupiah } from '../../lib/format';
import type { FinanceWhatsAppProfile } from '../../lib/finance-whatsapp';
import { receiptNumber } from '../../lib/receipt-number';
import { useUrlTab } from '../../lib/use-url-tab';
import type { BillingInvoice, BillingPeriod } from '../../services/billing.service';
import type { FinanceAccount } from '../../services/finance.service';
import type { PaymentListItem } from '../../services/payment.service';
import { ReceiptModal, type ReceiptModalData } from '../shared/ReceiptModal';
import { WhatsAppDuesReportModal } from '../shared/WhatsAppDuesReportModal';
import {
  FinanceDialog, FinanceEmpty, FinanceHeader, FinancePager, FinanceScope, FinanceStatus, FinanceSummary, FinanceTabs,
  financeButton, financeField, financePost, financePrimary,
} from './FinanceWorkspace';

const tabs = [
  {id:'verification',label:'Verifikasi',icon:FileCheck2},
  {id:'history',label:'Kuitansi',icon:Receipt},
  {id:'manual_counter',label:'Catat',icon:Banknote},
] as const;
const tabIds=tabs.map(item=>item.id);
type Tab=typeof tabIds[number];
const pageSize=12;
const visibleStatuses=['PENDING','VERIFIED','REJECTED','REVERSED'];
const unbooked=(status:string)=>['PENDING','REJECTED'].includes(status);
const cashMethod=(method:string)=>/^(cash(?:_|$)|tunai\b)/i.test(method);
const cashAccount=(account:FinanceAccount)=>['CASH','PETTY_CASH','KAS_TUNAI'].includes(account.type);
const accountsFor=(accounts:FinanceAccount[],method:string)=>accounts.filter(account=>cashAccount(account)===cashMethod(method));
const errText=(error:unknown)=>error instanceof Error?error.message:'Perubahan belum tersimpan.';
const receiptPath=(id:string)=>financePath('/kuitansi',{q:receiptNumber('','',id)});
const journalPath=(id:string)=>financePath('/admin/ledger',{tab:'ledger_list',payment:id});
const invoicePath=(item:PaymentListItem)=>financePath('/admin/billing',{period:item.billingPeriodId || item.periodName,invoice:item.invoiceId,house:item.invoiceId?undefined:item.propertyCode});

type Invoice = Pick<BillingInvoice,'id'|'invoiceNumber'|'propertyCode'|'propertyId'|'billingPeriodId'|'billingPeriodName'|'residentName'|'total'|'paidAmount'|'status'|'pendingPaymentId'>;
type PaymentResult = Partial<PaymentListItem> & {id:string;status:string;invoiceStatus?:string;paidAmount?:number;accountBalance?:number};
type RecordInput = {invoiceId:string;amount:number;method:string;reference:string;paidAt:string;status:string;accountId?:string;notes?:string;proofFileUrl?:string};
type Action = {kind:'detail'|'verify'|'reject'|'edit'|'reverse'|'remove';paymentId:string} | {kind:'verifyMany'|'removeMany';ids:string[]};
type Feedback={kind:'success'|'error';message:string;receiptId?:string};
interface Props {
  payments:PaymentListItem[];accounts:FinanceAccount[];periods:BillingPeriod[];invoices:Invoice[];
  today:string;initialTab?:string;initialHouse:string;initialPeriod:string;initialInvoice:string;
  initialPayment:string;initialStatus:string;canReverse:boolean;
  shareProfile:FinanceWhatsAppProfile|null;
}

function defaultStatus(tab?:string,status?:string,focused?:string) {
  if(status==='ALL') return '';
  if(status && visibleStatuses.includes(status)) return status;
  return tab==='history' || focused ? '' : 'PENDING';
}

export function PaymentsManager({
  payments:initialPayments,accounts:initialAccounts,periods,invoices:initialInvoices,today,shareProfile,
  initialTab,initialHouse,initialPeriod,initialInvoice,initialPayment,initialStatus,canReverse,
}:Props) {
  const [tab,setTab]=useUrlTab(tabIds,'verification','tab',{},initialTab);
  const [payments,setPayments]=useState(initialPayments);
  const [invoices,setInvoices]=useState(initialInvoices);
  const [accounts,setAccounts]=useState(initialAccounts);
  const [period,setPeriod]=useState(initialPeriod);
  const [search,setSearch]=useState(initialHouse);
  const [status,setStatus]=useState(defaultStatus(initialTab,initialStatus,initialPayment));
  const [method,setMethod]=useState('');
  const [sort,setSort]=useState('date');
  const [showFilters,setShowFilters]=useState(false);
  const [focusInvoice,setFocusInvoice]=useState(initialInvoice);
  const [focusPayment,setFocusPayment]=useState(initialPayment);
  const [selected,setSelected]=useState<string[]>([]);
  const [page,setPage]=useState(1);
  const [action,setAction]=useState<Action|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [feedback,setFeedback]=useState<Feedback|null>(null);
  const [receipt,setReceipt]=useState<ReceiptModalData|null>(null);
  const [showReport,setShowReport]=useState(false);

  useEffect(()=>{
    const restore=()=>{
      const params=new URLSearchParams(window.location.search);
      const requested=params.get('period') || '';
      setPeriod(periods.find(item=>item.id===requested || item.name.toLowerCase()===requested.toLowerCase())?.id || requested);
      setSearch(params.get('search') || '');
      setStatus(defaultStatus(params.get('tab') || undefined,params.get('status') || undefined,params.get('payment') || undefined));
      setFocusInvoice(params.get('invoice') || '');setFocusPayment(params.get('payment') || '');
      setMethod('');setPage(1);setSelected([]);
    };
    window.addEventListener('popstate',restore);
    return ()=>window.removeEventListener('popstate',restore);
  },[periods]);

  const scoped=useMemo(()=>payments.filter(item=>(!focusPayment || item.id===focusPayment) &&
    (!focusInvoice || item.invoiceId===focusInvoice) && (!period || item.billingPeriodId===period || item.periodName===period)),
    [payments,focusPayment,focusInvoice,period]);
  const invoiceById=new Map(invoices.map(item=>[item.id,item]));
  const pendingCount=scoped.filter(item=>item.status==='PENDING').length;
  const verified=scoped.filter(item=>item.status==='VERIFIED');
  const verifiedAmount=verified.reduce((sum,item)=>sum+item.amount,0);
  const rejectedCount=scoped.filter(item=>item.status==='REJECTED' || item.status==='REVERSED').length;
  const methods=[...new Set(scoped.map(item=>item.method).filter(Boolean))].sort((a,b)=>paymentMethodLabel(a).localeCompare(paymentMethodLabel(b),'id'));
  const focusedInvoice=invoiceById.get(focusInvoice);
  const focusedPayment=payments.find(item=>item.id===focusPayment);
  const query=search.trim().toLowerCase();
  const visible=scoped.filter(item=>{
    if(tab==='history' && !['VERIFIED','REVERSED'].includes(item.status)) return false;
    if(status && item.status!==status) return false;
    if(method && item.method!==method) return false;
    return !query || [item.propertyCode,item.invoiceNumber,item.reference,receiptNumber('','',item.id),invoiceById.get(item.invoiceId || '')?.residentName]
      .some(value=>value?.toLowerCase().includes(query));
  }).sort((a,b)=>sort==='amount'?b.amount-a.amount:sort==='house'?a.propertyCode.localeCompare(b.propertyCode,'id',{numeric:true}):b.paidAt.localeCompare(a.paidAt));
  const safePage=Math.min(page,Math.max(1,Math.ceil(visible.length/pageSize)));
  const paged=visible.slice((safePage-1)*pageSize,safePage*pageSize);
  const selectedRows=visible.filter(item=>selected.includes(item.id) && unbooked(item.status));
  const currentSelection=paged.filter(item=>unbooked(item.status));
  const actionIds=action && ('ids' in action ? action.ids : [action.paymentId]);
  const actionRows=actionIds ? actionIds.map(id=>payments.find(item=>item.id===id)).filter((item):item is PaymentListItem=>Boolean(item)) : [];
  const current=actionRows[0];
  const mixedMethods=actionRows.some(item=>cashMethod(item.method)!==cashMethod(current.method));
  const verificationAccounts=current && !mixedMethods ? accountsFor(accounts,current.method) : [];

  function updateUrl(nextTab:Tab, params:Record<string,string>={}) {
    window.history.replaceState(window.history.state,'',financePath('/admin/payments',{tab:nextTab,...params}));
  }

  function chooseTab(next:Tab) {
    setTab(next);setStatus(defaultStatus(next,undefined,focusPayment));setMethod('');setPage(1);setSelected([]);
    updateUrl(next,{period,search,invoice:focusInvoice,payment:focusPayment});
  }

  function clearScope() {
    setFocusInvoice('');setFocusPayment('');setPeriod('');setSearch('');setStatus(defaultStatus(tab));setMethod('');setPage(1);setSelected([]);
    updateUrl(tab);
  }

  function openAction(next:Action) {
    setError('');setFeedback(null);setAction(next);
  }

  function showReceipt(payment:PaymentListItem) {
    const invoice=invoiceById.get(payment.invoiceId || '');
    setReceipt({
      receiptNumber:receiptNumber('','',payment.id),invoiceNumber:payment.invoiceNumber || invoice?.invoiceNumber || '—',
      periodName:payment.periodName || invoice?.billingPeriodName || '—',propertyCode:payment.propertyCode,
      residentName:invoice?.residentName || 'Rumah '+payment.propertyCode,
      amount:payment.amount,paidAt:payment.paidAt,paymentMethod:paymentMethodLabel(payment.method),referenceNumber:payment.reference || undefined,
      status:'VERIFIED',accountName:payment.accountName || undefined,items:[{name:'Pembayaran iuran',amount:payment.amount}],
    });
  }

  function shareReceipt(payment:PaymentListItem) {
    const body=['Kuitansi pembayaran iuran WargaHub',receiptNumber('','',payment.id),'Rumah '+payment.propertyCode,
      payment.periodName || '',formatRupiah(payment.amount)+' · '+paymentMethodLabel(payment.method),
      'Verifikasi '+window.location.origin+receiptPath(payment.id)].filter(Boolean).join('\n');
    window.open('https://wa.me/?text='+encodeURIComponent(body),'_blank','noopener,noreferrer');
  }

  function storeResult(result:PaymentResult, original?:PaymentListItem) {
    const merged={...original,...result} as PaymentListItem;
    setPayments(items=>items.some(item=>item.id===result.id)
      ? items.map(item=>item.id===result.id?{...item,...result}:item) : [merged,...items]);
    const invoiceId=result.invoiceId || original?.invoiceId;
    if(invoiceId) setInvoices(items=>items.map(item=>{
      if(item.id!==invoiceId) return item;
      return {...item,status:result.invoiceStatus || item.status,paidAmount:result.paidAmount ?? item.paidAmount,
        pendingPaymentId:result.status==='PENDING' ? result.id : item.pendingPaymentId===result.id ? null : item.pendingPaymentId};
    }));
    if(result.accountId && typeof result.accountBalance==='number')
      setAccounts(items=>items.map(item=>item.id===result.accountId?{...item,balance:result.accountBalance!}:item));
    return merged;
  }

  async function record(input:RecordInput) {
    setBusy(true);setError('');setFeedback(null);
    try {
      const data=await financePost<PaymentListItem & PaymentResult>('/api/payments/create',input);
      const payment=storeResult(data);
      if(payment.status==='VERIFIED') showReceipt(payment);
      setFeedback({kind:'success',message:payment.status==='VERIFIED'?'Pembayaran masuk buku kas.':'Pembayaran masuk antrean verifikasi.',
        receiptId:payment.status==='VERIFIED'?payment.id:undefined});
      return true;
    } catch(error) {setError(errText(error));return false;}
    finally {setBusy(false);}
  }

  async function submitAction(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!action || !actionRows.length || busy) return;
    const values=new FormData(event.currentTarget);
    const field=(name:string)=>String(values.get(name) || '').trim();
    const paymentId=current.id;
    setBusy(true);setError('');
    try {
      if(action.kind==='verify' || action.kind==='verifyMany') {
        const failed:string[]=[];
        let firstError='';
        for(const payment of actionRows) {
          try {
            storeResult(await financePost<PaymentResult>('/api/payments/verify',{paymentId:payment.id,accountId:field('accountId')}),payment);
          } catch(error) {failed.push(payment.id);firstError ||= errText(error);}
        }
        const done=actionRows.length-failed.length;
        if(!done) throw new Error(firstError || 'Verifikasi gagal.');
        setSelected(failed);
        setFeedback(failed.length?{kind:'error',message:done+' berhasil, '+failed.length+' gagal. '+firstError}:
          {kind:'success',message:done+' pembayaran masuk buku kas.',receiptId:actionRows.length===1?paymentId:undefined});
      } else if(action.kind==='remove' || action.kind==='removeMany') {
        const {ids}=await financePost<{ids:string[]}>('/api/payments/delete',{ids:actionRows.map(item=>item.id),reason:field('reason')});
        setPayments(items=>items.filter(item=>!ids.includes(item.id)));
        setInvoices(items=>items.map(item=>item.pendingPaymentId && ids.includes(item.pendingPaymentId)?{...item,pendingPaymentId:null}:item));
        setSelected(items=>items.filter(id=>!ids.includes(id)));
        setFeedback({kind:'success',message:ids.length+' pembayaran yang belum dibukukan dihapus.'});
      } else if(action.kind==='edit') {
        const data=await financePost<PaymentListItem>('/api/payments/update',{
          paymentId,amount:Number(field('amount')),method:field('method'),reference:field('reference') || undefined,
          paidAt:field('paidAt'),notes:field('notes'),proofFileUrl:field('proofFileUrl') || undefined,
        });
        storeResult(data,current);setFeedback({kind:'success',message:'Pembayaran diperbarui.'});
      } else if(action.kind==='reject') {
        const reason=field('reason');
        const data=await financePost<PaymentResult>('/api/payments/reject',{paymentId,reason});
        storeResult({...data,rejectionReason:reason},current);setFeedback({kind:'success',message:'Pembayaran ditolak.'});
      } else if(action.kind==='reverse') {
        const data=await financePost<PaymentResult>('/api/payments/reverse',{paymentId,reason:field('reason')});
        storeResult(data,current);setFeedback({kind:'success',message:'Jurnal pembalik tercatat dan sisa tagihan diperbarui.'});
      }
      setAction(null);
    } catch(error) {setError(errText(error));}
    finally {setBusy(false);}
  }

  const latestReceipt=payments.find(item=>item.id===feedback?.receiptId && item.status==='VERIFIED');
  const clearFilters=()=>{setSelected([]);setPage(1);};
  return <div className="workspace">
    <FinanceHeader area="payments" title="Pembayaran">
      <a href="/admin/ledger?tab=accounts_manage" className={financeButton}><Wallet className="size-4" aria-hidden="true" />Rekening kas</a>
      <button type="button" className={financeButton} onClick={()=>setShowReport(true)}><MessageCircle className="size-4" aria-hidden="true" />Laporan WA (wa.me)</button>
      {tab!=='manual_counter' && <button type="button" className={financePrimary} onClick={()=>chooseTab('manual_counter')}>
        <Plus className="size-4" aria-hidden="true" />Catat pembayaran
      </button>}
    </FinanceHeader>
    <FinanceTabs tabs={tabs.map(item=>({...item,count:item.id==='verification'?pendingCount:undefined}))} active={tab} change={chooseTab} label="Submenu pembayaran" />
    {feedback && <div role={feedback.kind==='error'?'alert':'status'} className={'flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm '+(feedback.kind==='error'?'bg-rose-50 text-rose-900':'bg-primary-50 text-primary-900')}>
      <p>{feedback.message}</p>
      {latestReceipt && <div className="flex flex-wrap gap-2">
        <button className={financeButton} type="button" onClick={()=>showReceipt(latestReceipt)}>Buka kuitansi</button>
        <a className={financeButton} href={journalPath(latestReceipt.id)}>Buku kas</a>
      </div>}
    </div>}
    {(focusInvoice || focusPayment) && <FinanceScope clear={clearScope}>{
      focusedInvoice ? 'Tagihan '+focusedInvoice.invoiceNumber : focusedPayment ? 'Pembayaran rumah '+focusedPayment.propertyCode : 'Transaksi dari tautan'
    }</FinanceScope>}
    {!accounts.length && <FinanceEmpty action={<a className={financeButton} href="/admin/ledger?tab=accounts_manage">Kelola rekening</a>}>
      Belum ada rekening kas aktif.
    </FinanceEmpty>}

    {tab==='manual_counter' ? <ManualPaymentForm key={focusInvoice+'|'+focusPayment} invoices={invoices} accounts={accounts} periods={periods}
      focusInvoice={focusInvoice} initialHouse={search} initialPeriod={period} today={today} busy={busy} error={action?undefined:error} save={record} />
    : <section className="grid min-w-0 gap-4" aria-label={tab==='history'?'Riwayat kuitansi':'Verifikasi pembayaran'}>
      <FinanceSummary items={[
        {label:'Menunggu verifikasi',value:pendingCount,tone:'amber'},
        {label:'Pembayaran sah',value:formatRupiah(verifiedAmount),detail:verified.length+' transaksi',tone:'mint'},
        {label:'Ditolak atau dibalik',value:rejectedCount,tone:'slate'},
      ]} />
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
        <label className="min-w-0 text-sm font-semibold">Cari pembayaran<input className={financeField} type="search" placeholder="Rumah atau referensi" value={search}
          onChange={event=>{setSearch(event.target.value);clearFilters();}} /></label>
        <button className={financeButton+' sm:hidden'} type="button" aria-expanded={showFilters} aria-controls="payment-filters" onClick={()=>setShowFilters(value=>!value)}>
          <Filter className="size-4" aria-hidden="true" />Filter
        </button>
        <div id="payment-filters" className={(showFilters?'grid':'hidden')+' col-span-2 min-w-0 gap-3 sm:contents'}>
        <label className="min-w-0 text-sm font-semibold">Periode<select className={financeField} value={period} onChange={event=>{setPeriod(event.target.value);clearFilters();}}>
          <option value="">Semua periode</option>
          {periods.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          {period && !periods.some(item=>item.id===period) && <option value={period}>{period}</option>}
        </select></label>
        <label className="min-w-0 text-sm font-semibold">Status<select className={financeField} value={status} onChange={event=>{setStatus(event.target.value);clearFilters();}}>
          <option value="">Semua status</option>{tab!=='history' && <option value="PENDING">Menunggu</option>}
          <option value="VERIFIED">Terverifikasi</option>{tab!=='history' && <option value="REJECTED">Ditolak</option>}<option value="REVERSED">Dibalik</option>
        </select></label>
        <label className="min-w-0 text-sm font-semibold">Metode<select className={financeField} value={method} onChange={event=>{setMethod(event.target.value);clearFilters();}}>
          <option value="">Semua metode</option>{methods.map(item=><option key={item} value={item}>{paymentMethodLabel(item)}</option>)}
        </select></label>
        <label className="min-w-0 text-sm font-semibold">Urutkan<select className={financeField} value={sort} onChange={event=>{setSort(event.target.value);clearFilters();}}>
          <option value="date">Terbaru</option><option value="amount">Nominal terbesar</option><option value="house">Kode rumah</option>
        </select></label>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        {currentSelection.length>0 && <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={currentSelection.every(item=>selected.includes(item.id))}
            onChange={event=>setSelected(items=>event.target.checked?[...new Set([...items,...currentSelection.map(item=>item.id)])]:
              items.filter(id=>!currentSelection.some(item=>item.id===id)))} />Pilih halaman
        </label>}
        <div className="flex flex-wrap gap-2">
          {selectedRows.length>0 && <>
            {selectedRows.every(item=>item.status==='PENDING') && <button type="button" className={financePrimary}
              onClick={()=>openAction({kind:'verifyMany',ids:selectedRows.map(item=>item.id)})}>Verifikasi ({selectedRows.length})</button>}
            <button type="button" className={financeButton}
              onClick={()=>openAction({kind:'removeMany',ids:selectedRows.slice(0,100).map(item=>item.id)})}
              disabled={selectedRows.length>100}>Hapus ({selectedRows.length})</button>
          </>}
          <button className={financeButton} type="button" disabled={!visible.length} onClick={()=>downloadFinanceCsv('pembayaran.csv',[
            ['ID pembayaran','Rumah','Periode','Nominal','Metode','Referensi','Tanggal','Status','Rekening','Kuitansi'],
            ...visible.map(item=>[item.id,item.propertyCode,item.periodName || '',item.amount,paymentMethodLabel(item.method),
              item.reference || '',financeDate(item.paidAt),item.status,item.accountName || '',item.status==='VERIFIED'?receiptNumber('','',item.id):'']),
          ])}><Download className="size-4" aria-hidden="true" />CSV</button>
        </div>
      </div>
      {paged.length ? <div className="min-w-0 rounded-xl border border-border bg-surface">
        <div aria-hidden="true" className="hidden gap-3 rounded-t-xl bg-canvas px-4 py-2.5 text-xs font-semibold text-ink-muted xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <span>Rumah dan pembayaran</span><span>Nominal</span><span>Status</span><span>Tindakan</span>
        </div>
        <ul className="divide-y divide-border">
          {paged.map(item=><li key={item.id} className="grid min-w-0 gap-x-3 gap-y-2 px-3 py-3 min-[420px]:grid-cols-2 sm:px-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,1.4fr)]">
            <div className="flex min-w-0 items-start gap-2">
              {unbooked(item.status) && <label className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-canvas">
                <input type="checkbox" checked={selected.includes(item.id)} aria-label={'Pilih pembayaran '+item.propertyCode}
                  onChange={event=>setSelected(ids=>event.target.checked?[...ids,item.id]:ids.filter(id=>id!==item.id))} />
              </label>}
              <div className="min-w-0">
                <p className="font-bold [overflow-wrap:anywhere]">{item.propertyCode}<span className="ml-2 text-sm font-normal text-ink-muted">{item.periodName || '—'}</span></p>
                <p className="mt-1 text-xs text-ink-muted [overflow-wrap:anywhere]">{tab==='history'?receiptNumber('','',item.id):item.reference || item.invoiceNumber || item.id}</p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tabular-nums">{formatRupiah(item.amount)}</p>
              <p className="text-xs text-ink-muted">{paymentMethodLabel(item.method)} · {financeDate(item.paidAt)}</p>
            </div>
            <div className="min-w-0"><FinanceStatus value={item.status} />
              {item.accountName && <p className="mt-1 text-xs text-ink-muted [overflow-wrap:anywhere]">{item.accountName}</p>}
            </div>
            <div className="flex min-w-0 flex-wrap items-start gap-1.5">
              <button className={item.status==='PENDING'?financePrimary:financeButton} type="button" onClick={()=>openAction({kind:'detail',paymentId:item.id})}>
                {item.status==='PENDING'?'Cek bukti':'Rincian'}
              </button>
              {item.status==='VERIFIED' && <button type="button" className={financeButton} onClick={()=>showReceipt(item)}>Kuitansi</button>}
              {(item.ledgerId || item.reversalLedgerId) && <a className={financeButton} href={journalPath(item.id)}>Buku kas</a>}
            </div>
          </li>)}
        </ul>
        <FinancePager total={visible.length} page={safePage} pageSize={pageSize} onChange={setPage} label="pembayaran" />
      </div> : <FinanceEmpty>{tab==='history'?'Tidak ada kuitansi yang cocok.':status==='PENDING'?'Tidak ada pembayaran yang menunggu verifikasi.':'Tidak ada pembayaran yang cocok.'}</FinanceEmpty>}
    </section>}

    <FinanceDialog open={Boolean(action && current)} title={actionTitle(action)} close={()=>setAction(null)} busy={busy} error={error}>
      {action && current && (action.kind==='detail' ? <PaymentDetail payment={current} canReverse={canReverse}
        onAction={kind=>openAction({kind,paymentId:current.id})}
        onReceipt={()=>{setAction(null);showReceipt(current);}} onShare={()=>shareReceipt(current)} />
      : <PaymentActionForm key={action.kind} kind={action.kind} payments={actionRows} accounts={verificationAccounts} mixedMethods={mixedMethods}
        maxAmount={current.invoiceId ? invoiceById.get(current.invoiceId) && invoiceRemaining(invoiceById.get(current.invoiceId)!) : undefined}
        today={today} busy={busy} onSubmit={submitAction} />)}
    </FinanceDialog>
    {showReport && <WhatsAppDuesReportModal mode="dues" periods={periods} invoices={invoices}
      initialPeriodId={period || focusedInvoice?.billingPeriodId || focusedPayment?.billingPeriodId || ''}
      today={today} profile={shareProfile} onClose={()=>setShowReport(false)} />}
    {receipt && <ReceiptModal isOpen data={receipt} onClose={()=>setReceipt(null)} />}
  </div>;
}

const actionLabels: Record<Action['kind'],string> = {
  detail:'Rincian pembayaran', verify:'Verifikasi pembayaran', verifyMany:'Verifikasi pilihan',
  reject:'Tolak pembayaran', edit:'Ubah pembayaran', remove:'Hapus pembayaran', removeMany:'Hapus pilihan', reverse:'Balik transaksi',
};
const actionTitle=(action:Action|null)=>action ? actionLabels[action.kind] : 'Pembayaran';

function PaymentDetail({payment,canReverse,onAction,onReceipt,onShare}: {
  payment:PaymentListItem;canReverse:boolean;
  onAction:(kind:'verify'|'reject'|'edit'|'reverse'|'remove')=>void;onReceipt:()=>void;onShare:()=>void;
}) {
  const proof=proofLink(payment.proofFileUrl);
  return <div className="grid min-w-0 gap-4">
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
      <div><p className="text-sm text-ink-muted">{payment.propertyCode} · {payment.periodName || '—'}</p>
        <p className="mt-1 text-xl font-bold tabular-nums">{formatRupiah(payment.amount)}</p>
      </div>
      <FinanceStatus value={payment.status} />
    </div>
    <dl className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg bg-canvas p-3 text-sm">
      <dt>Metode</dt><dd className="font-semibold [overflow-wrap:anywhere]">{paymentMethodLabel(payment.method)}</dd>
      <dt>Tanggal bayar</dt><dd>{financeDate(payment.paidAt)}</dd>
      <dt>Referensi</dt><dd className="[overflow-wrap:anywhere]">{payment.reference || '—'}</dd>
      {payment.accountName && <><dt>Rekening</dt><dd className="[overflow-wrap:anywhere]">{payment.accountName}</dd></>}
      {payment.verifiedAt && <><dt>Verifikasi</dt><dd>{financeDate(payment.verifiedAt)}</dd></>}
      {payment.notes && <><dt>Catatan</dt><dd className="whitespace-pre-wrap [overflow-wrap:anywhere]">{payment.notes}</dd></>}
      {payment.rejectionReason && <><dt>Alasan ditolak</dt><dd className="[overflow-wrap:anywhere]">{payment.rejectionReason}</dd></>}
      {payment.reversalReason && <><dt>Alasan dibalik</dt><dd className="[overflow-wrap:anywhere]">{payment.reversalReason}</dd></>}
    </dl>
    <div className="flex flex-wrap gap-2">
      {proof && <a className={financeButton} href={proof} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="size-4" aria-hidden="true" />Buka bukti
      </a>}
      {(payment.invoiceId || payment.billingPeriodId) && <a className={financeButton} href={invoicePath(payment)}>Lihat tagihan</a>}
      {(payment.ledgerId || payment.reversalLedgerId) && <a className={financeButton} href={journalPath(payment.id)}>Lihat jurnal</a>}
      {payment.status==='VERIFIED' && <>
        <button className={financeButton} type="button" onClick={onReceipt}>Cetak kuitansi</button>
        <button className={financeButton} type="button" onClick={onShare}><MessageCircle className="size-4" aria-hidden="true" />Bagikan</button>
        <a className={financeButton} href={receiptPath(payment.id)} target="_blank" rel="noopener noreferrer">Periksa kuitansi</a>
      </>}
    </div>
    {!proof && payment.status==='PENDING' && <p className="text-sm text-ink-muted">Belum ada bukti terlampir.</p>}
    <div className="flex flex-wrap gap-2">
      {payment.status==='PENDING' && <>
        <button type="button" className={financePrimary} onClick={()=>onAction('verify')}><Check className="size-4" aria-hidden="true" />Verifikasi</button>
        <button type="button" className={financeButton} onClick={()=>onAction('edit')}>Ubah</button>
        <button type="button" className={financeButton+' text-rose-800'} onClick={()=>onAction('reject')}>Tolak</button>
      </>}
      {unbooked(payment.status) && <button type="button" className={financeButton+' text-rose-800'} onClick={()=>onAction('remove')}>Hapus</button>}
      {canReverse && payment.status==='VERIFIED' && payment.ledgerId && <button type="button" className={financeButton+' text-rose-800'} onClick={()=>onAction('reverse')}>Balik transaksi</button>}
    </div>
  </div>;
}

function PaymentActionForm({kind,payments,accounts,mixedMethods,maxAmount,today,busy,onSubmit}: {
  kind:Exclude<Action['kind'],'detail'>;payments:PaymentListItem[];accounts:FinanceAccount[];mixedMethods:boolean;maxAmount?:number;
  today:string;busy:boolean;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;
}) {
  const first=payments[0];
  const verification=kind==='verify' || kind==='verifyMany';
  const editing=kind==='edit';
  const reasonRequired=kind==='reverse' || kind==='reject' || kind==='remove' || kind==='removeMany';
  const dangerous=kind==='reverse' || kind==='remove' || kind==='removeMany';
  return <form onSubmit={onSubmit} className="grid min-w-0 gap-3">
    <p className="text-sm text-ink-muted">{payments.length===1
      ? first.propertyCode+' · '+(first.periodName || '—')+' · '+formatRupiah(first.amount)
      : payments.length+' pembayaran · '+formatRupiah(payments.reduce((sum,item)=>sum+item.amount,0))}</p>
    {verification && <>
      {mixedMethods ? <p role="alert" className="text-sm text-rose-800">Pisahkan pembayaran tunai dan non-tunai sebelum verifikasi massal.</p> :
        <label className="min-w-0 text-sm font-semibold">Rekening penerima
          <select name="accountId" className={financeField} required defaultValue={accounts.length===1?accounts[0].id:''}>
            <option value="">Pilih rekening</option>{accounts.map(account=><option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>}
      {!mixedMethods && !accounts.length && <a href="/admin/ledger?tab=accounts_manage" className="min-h-11 text-sm font-semibold text-primary-800 underline">Siapkan rekening di Buku kas</a>}
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" required />Saya sudah mencocokkan pembayaran.</label>
    </>}
    {editing && <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <label className="min-w-0 text-sm font-semibold">Nominal (Rp)<input name="amount" type="number" min={1} max={maxAmount ?? 1e12} step={1} defaultValue={first.amount} required className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold">Metode<input name="method" defaultValue={first.method} maxLength={40} required className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold">Tanggal bayar<input name="paidAt" type="date" defaultValue={jakartaDate(first.paidAt) || today} required className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold">Referensi<input name="reference" defaultValue={first.reference || ''} maxLength={100} className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold sm:col-span-2">Tautan bukti<input name="proofFileUrl" defaultValue={proofLink(first.proofFileUrl)} maxLength={1500} className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold sm:col-span-2">Catatan<textarea name="notes" defaultValue={first.notes || ''} maxLength={2000} rows={2} className={financeField} /></label>
    </div>}
    {kind==='reverse' && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
      Saldo rekening asal berkurang, tagihan dibuka kembali, dan kuitansi ini kehilangan status sah.
    </p>}
    {reasonRequired && <label className="text-sm font-semibold">Alasan<textarea name="reason" required minLength={kind==='reverse'?5:3} maxLength={500} rows={2} className={financeField} /></label>}
    <button className={dangerous?'min-h-11 justify-self-start whitespace-nowrap rounded-lg bg-rose-800 px-3 text-sm font-semibold text-white hover:bg-rose-900 disabled:opacity-60':financePrimary+' justify-self-start'}
      disabled={busy || (verification && (mixedMethods || !accounts.length))}>
      {busy?'Memproses…':editing?'Simpan perubahan':actionLabels[kind]}
    </button>
  </form>;
}

function ManualPaymentForm({invoices,accounts,periods,focusInvoice,initialHouse,initialPeriod,today,busy,error,save}: {
  invoices:Invoice[];accounts:FinanceAccount[];periods:BillingPeriod[];focusInvoice:string;initialHouse:string;initialPeriod:string;
  today:string;busy:boolean;error?:string;save:(input:RecordInput)=>Promise<boolean>;
}) {
  const billable=invoices.filter(item=>item.propertyId && invoiceRemaining(item)>0 && !item.pendingPaymentId);
  const fromLink=invoices.find(item=>item.id===focusInvoice);
  const houseOptions=[...new Map(billable.map(item=>[item.propertyId,item.propertyCode])).entries()]
    .sort((a,b)=>a[1].localeCompare(b[1],'id',{numeric:true}));
  const startHouse=fromLink?.propertyId || houseOptions.find(([,code])=>code.toLowerCase()===initialHouse.trim().toLowerCase())?.[0] || '';
  const startPeriod=fromLink?.billingPeriodId || initialPeriod;
  const [house,setHouse]=useState(startHouse);
  const [period,setPeriod]=useState(startPeriod);
  const [invoiceId,setInvoiceId]=useState(()=>{
    const eligible=billable.filter(item=>(!focusInvoice || item.id===focusInvoice) &&
      (!startHouse || item.propertyId===startHouse) && (!startPeriod || item.billingPeriodId===startPeriod));
    return (focusInvoice || startHouse || startPeriod) && eligible.length===1 ? eligible[0].id : '';
  });
  const [amount,setAmount]=useState(()=>invoiceId?invoiceRemaining(billable.find(item=>item.id===invoiceId)!):0);
  const [method,setMethod]=useState('CASH');
  const [verified,setVerified]=useState(true);
  const [accountId,setAccountId]=useState('');
  const requestRef=useRef<{invoiceId:string;key:string}|null>(null);
  const choices=billable.filter(item=>(!focusInvoice || item.id===focusInvoice) && (!house || item.propertyId===house) && (!period || item.billingPeriodId===period));
  const selected=choices.find(item=>item.id===invoiceId);
  const eligibleAccounts=accountsFor(accounts,method);
  const receivingId=accountId || (eligibleAccounts.length===1?eligibleAccounts[0].id:'');

  function chooseInvoice(value:string) {
    setInvoiceId(value);
    const invoice=billable.find(item=>item.id===value);
    setAmount(invoice?invoiceRemaining(invoice):0);
  }

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!selected || busy) return;
    const form=event.currentTarget;
    const data=new FormData(form);
    const field=(name:string)=>String(data.get(name) || '').trim();
    if(requestRef.current?.invoiceId!==selected.id) requestRef.current={invoiceId:selected.id,key:'ADM-'+crypto.randomUUID()};
    const result=await save({
      invoiceId:selected.id,amount,method:method==='OTHER'?field('customMethod'):method,
      reference:field('reference') || requestRef.current.key,paidAt:field('paidAt'),
      status:verified?'VERIFIED':'PENDING',accountId:verified?receivingId:undefined,
      proofFileUrl:field('proofFileUrl') || undefined,
      notes:[field('collector') && 'Penerima '+field('collector'),field('notes')].filter(Boolean).join(' · ') || undefined,
    });
    if(result) {
      requestRef.current=null;
      form.reset();
      const remaining=invoiceRemaining(selected)-amount;
      if(remaining>0 && verified) setAmount(remaining);
      else chooseInvoice('');
    }
  }

  return <section className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" aria-label="Catat pembayaran">
    <form onSubmit={submit} className="workspace-panel grid min-w-0 gap-3">
      <h2>Catat pembayaran warga</h2>
      {!focusInvoice && <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-semibold">Rumah<select value={house} className={financeField} onChange={event=>{setHouse(event.target.value);chooseInvoice('');}}>
          <option value="">Semua rumah</option>{houseOptions.map(([id,code])=><option key={id} value={id}>{code}</option>)}
          {house && !houseOptions.some(([id])=>id===house) && <option value={house}>Rumah dari tautan</option>}
        </select></label>
        <label className="min-w-0 text-sm font-semibold">Periode<select value={period} className={financeField} onChange={event=>{setPeriod(event.target.value);chooseInvoice('');}}>
          <option value="">Semua periode</option>{periods.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
        </select></label>
      </div>}
      <label className="min-w-0 text-sm font-semibold">Tagihan
        <select value={selected?.id || ''} className={financeField} required onChange={event=>chooseInvoice(event.target.value)}>
          <option value="">Pilih tagihan</option>
          {choices.map(item=><option key={item.id} value={item.id}>{item.propertyCode} · {item.billingPeriodName} · {formatRupiah(invoiceRemaining(item))}</option>)}
        </select>
      </label>
      {!choices.length && <FinanceEmpty action={fromLink?.pendingPaymentId
        ? <a className={financeButton} href={financePath('/admin/payments',{tab:'verification',payment:fromLink.pendingPaymentId,invoice:fromLink.id})}>Periksa bukti</a>
        : <a className={financeButton} href={financePath('/admin/billing',{period:fromLink?.billingPeriodId || period,invoice:fromLink?.id})}>Buka tagihan</a>}>
        {fromLink?.pendingPaymentId?'Tagihan ini menunggu verifikasi.':fromLink && !invoiceRemaining(fromLink)?'Tagihan ini sudah selesai.':'Tidak ada tagihan yang bisa dibayar pada pilihan ini.'}
      </FinanceEmpty>}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-semibold">Nominal (Rp)<input type="number" min={1} max={selected?invoiceRemaining(selected):undefined} step={1} required
          value={amount || ''} className={financeField} onChange={event=>setAmount(Number(event.target.value))} /></label>
        <label className="min-w-0 text-sm font-semibold">Metode<select value={method} className={financeField}
          onChange={event=>{setMethod(event.target.value);setAccountId('');}}>
          {Object.entries(PAYMENT_METHODS).map(([value,label])=><option key={value} value={value}>{label}</option>)}
          <option value="OTHER">Lainnya</option>
        </select></label>
        {method==='OTHER' && <label className="min-w-0 text-sm font-semibold sm:col-span-2">Nama metode
          <input name="customMethod" required maxLength={40} className={financeField} /></label>}
        <label className="min-w-0 text-sm font-semibold">Tanggal bayar<input name="paidAt" type="date" defaultValue={today} required className={financeField} /></label>
        <label className="min-w-0 text-sm font-semibold">Referensi<input name="reference" className={financeField} maxLength={100} placeholder="Opsional" /></label>
      </div>
      <label className="min-w-0 text-sm font-semibold">Tindakan
        <select className={financeField} value={verified?'verified':'pending'} onChange={event=>setVerified(event.target.value==='verified')}>
          <option value="verified">Verifikasi dan catat ke Buku kas</option><option value="pending">Simpan untuk verifikasi</option>
        </select>
      </label>
      {verified && <label className="min-w-0 text-sm font-semibold">Rekening penerima
        <select className={financeField} value={receivingId} required onChange={event=>setAccountId(event.target.value)}>
          <option value="">Pilih rekening</option>{eligibleAccounts.map(account=><option key={account.id} value={account.id}>{account.name}</option>)}
        </select>
      </label>}
      {verified && !eligibleAccounts.length && <a href="/admin/ledger?tab=accounts_manage" className="min-h-11 text-sm font-semibold text-primary-800 underline">Siapkan rekening untuk metode ini</a>}
      <details className="rounded-lg border border-border px-3 py-1">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Bukti dan catatan</summary>
        <div className="grid gap-3 pb-3">
          {cashMethod(method) && <label className="text-sm font-semibold">Petugas penerima<input name="collector" className={financeField} maxLength={150} /></label>}
          <label className="text-sm font-semibold">Tautan bukti<input name="proofFileUrl" className={financeField} maxLength={1500} /></label>
          <label className="text-sm font-semibold">Catatan<textarea name="notes" className={financeField} maxLength={1800} rows={2} /></label>
        </div>
      </details>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      <button className={financePrimary+' justify-self-start'} disabled={busy || !selected || (verified && !receivingId)}>
        {busy?'Menyimpan…':verified?'Catat pembayaran':'Simpan untuk cek'}
      </button>
    </form>
    <aside className="grid gap-3 rounded-xl bg-primary-50 p-4 text-primary-900" aria-label="Ringkasan tagihan">
      <h2 className="font-bold">Ringkasan tagihan</h2>
      {selected ? <>
        <p className="text-sm [overflow-wrap:anywhere]">{selected.propertyCode} · {selected.billingPeriodName} · {selected.invoiceNumber}</p>
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm tabular-nums">
          <dt>Nominal tagihan</dt><dd className="font-semibold">{formatRupiah(selected.total)}</dd>
          <dt>Sisa sebelum pembayaran</dt><dd className="font-semibold">{formatRupiah(invoiceRemaining(selected))}</dd>
          <dt>{verified?'Sisa setelah pembayaran':'Sisa setelah diverifikasi'}</dt><dd className="font-semibold">{formatRupiah(Math.max(0,invoiceRemaining(selected)-amount))}</dd>
        </dl>
        <a className={financeButton+' justify-self-start'} href={financePath('/admin/billing',{period:selected.billingPeriodId,invoice:selected.id})}>Lihat tagihan</a>
      </> : <p className="text-sm">Pilih tagihan untuk melihat sisa pembayarannya.</p>}
    </aside>
  </section>;
}
