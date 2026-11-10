/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, Download, ExternalLink, Filter, Layers3, MessageCircle, Plus, Receipt, Settings2 } from 'lucide-react';
import {
  BILLING_MONTHS, billingMonthKey, billingMonthLabel, defaultInvoiceDueDate, downloadFinanceCsv, financeDate, financePath,
  invoiceCollected, invoiceRemaining, invoiceState, PAYMENT_METHODS, selectReceivingBank, type BillingTariff, type TariffComponent,
} from '../../lib/billing-data';
import { formatRupiah } from '../../lib/format';
import type { FinanceWhatsAppProfile } from '../../lib/finance-whatsapp';
import { useUrlTab } from '../../lib/use-url-tab';
import type { BillingInvoice, BillingPeriod } from '../../services/billing.service';
import type { FinanceAccount } from '../../services/finance.service';
import { ReceiptModal, type ReceiptModalData } from '../shared/ReceiptModal';
import { WhatsAppDuesReportModal } from '../shared/WhatsAppDuesReportModal';
import {
  FinanceDialog, FinanceEmpty, FinanceHeader, FinancePager, FinanceScope, FinanceStatus, FinanceSummary, FinanceTabs,
  financeButton, financeField, financePost, financePrimary, type FinanceHouse,
} from './FinanceWorkspace';

const tabs = [
  { id:'invoices', label:'Daftar', icon:Receipt },
  { id:'annual_matrix', label:'Rekap tahunan', icon:CalendarDays },
  { id:'tariffs', label:'Tarif', icon:Settings2 },
  { id:'batch', label:'Terbitkan massal', icon:Layers3 },
] as const;
const tabIds = tabs.map(item=>item.id);
const pageSize = 12;
const cancelled = (status:string) => ['CANCELLED','VOID','WAIVED'].includes(status);
const errText = (error:unknown) => error instanceof Error ? error.message : 'Perubahan belum tersimpan.';
const waLink = (text:string) => 'https://wa.me/?text='+encodeURIComponent(text);
const cashAccount = (account:FinanceAccount) => ['CASH','PETTY_CASH','KAS_TUNAI'].includes(account.type);

interface Props {
  periods: BillingPeriod[];
  invoices: BillingInvoice[];
  houses: FinanceHouse[];
  accounts: FinanceAccount[];
  tariff: BillingTariff;
  billableIds: string[];
  shareProfile: FinanceWhatsAppProfile|null;
  today: string;
  canManage: boolean;
  initialTab?: string;
  initialHouse: string;
  initialPeriodId: string;
  initialInvoiceId: string;
  unknownPeriod: boolean;
}
type InvoiceAction = {kind:'create'} | {kind:'edit'|'cancel';invoice:BillingInvoice};
type BatchResult = {periodId:string;newlyGenerated:number;alreadyExisting:number;message:string};
const statusFilters = [
  ['','Semua status'],['outstanding','Belum lunas'],['PENDING_VERIFICATION','Menunggu cek'],['OVERDUE','Jatuh tempo'],
  ['PARTIAL','Sebagian'],['PAID','Lunas'],['closed','Dibatalkan / bebas'],
];
const occupancyFilters = [['','Semua hunian'],['occupied','Dihuni'],['RENTED','Disewa'],['VACANT','Kosong']];

export function BillingManager({
  periods,invoices:initialInvoices,houses,accounts,tariff:initialTariff,billableIds,shareProfile,today,canManage,
  initialTab,initialHouse,initialPeriodId,initialInvoiceId,unknownPeriod,
}: Props) {
  const [tab,setTab]=useUrlTab(tabIds,'invoices','tab',{},initialTab);
  const [periodId,setPeriodId]=useState(initialPeriodId);
  const [focusId,setFocusId]=useState(initialInvoiceId);
  const [search,setSearch]=useState(initialHouse);
  const [status,setStatus]=useState('');
  const [occupancy,setOccupancy]=useState('');
  const [order,setOrder]=useState('house');
  const [showFilters,setShowFilters]=useState(false);
  const [page,setPage]=useState(1);
  const [invoices,setInvoices]=useState(initialInvoices);
  const [tariff,setTariff]=useState(initialTariff);
  const [action,setAction]=useState<InvoiceAction|null>(null);
  const [invoiceDocument,setDocument]=useState<ReceiptModalData|null>(null);
  const [editingTariff,setEditingTariff]=useState(false);
  const [showReport,setShowReport]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [showUnknownPeriod,setShowUnknownPeriod]=useState(unknownPeriod);

  useEffect(()=>{
    const restore=()=>{
      const params=new URLSearchParams(window.location.search);
      const wanted=params.get('period');
      const id=params.get('invoice') || '';
      setFocusId(id);
      setSearch(params.get('house') || '');
      setPeriodId(invoices.find(item=>item.id===id)?.billingPeriodId ||
        periods.find(item=>item.id===wanted || item.name===wanted)?.id || initialPeriodId);
      setStatus('');setOccupancy('');setPage(1);
    };
    window.addEventListener('popstate',restore);
    return ()=>window.removeEventListener('popstate',restore);
  },[initialPeriodId,invoices,periods]);

  const activePeriod=periods.find(item=>item.id===periodId);
  const periodInvoices=useMemo(()=>periodId ? invoices.filter(item=>item.billingPeriodId===periodId) : [],[invoices,periodId]);
  const collectible=periodInvoices.filter(item=>!cancelled(item.status));
  const paidCount=collectible.filter(item=>item.status==='PAID').length;
  const billed=collectible.reduce((sum,item)=>sum+item.total,0);
  const received=collectible.reduce((sum,item)=>sum+invoiceCollected(item),0);
  const remaining=collectible.reduce((sum,item)=>sum+invoiceRemaining(item),0);
  const pendingCount=periodInvoices.filter(item=>Boolean(item.pendingPaymentId)).length;
  const bank=selectReceivingBank(accounts);
  const bankText=bank ? [bank.bankName || bank.name,bank.accountNumber].join(' · ') : '';

  const visible=useMemo(()=>{
    const query=search.trim().toLowerCase();
    return periodInvoices.filter(item=>{
      const state=invoiceState(item,today);
      const matchesSearch=!query || [item.propertyCode,item.invoiceNumber,item.residentName,item.areaLabel].some(value=>value.toLowerCase().includes(query));
      const matchesStatus=!status || (status==='outstanding' ? invoiceRemaining(item)>0 : status==='closed' ? cancelled(item.status) : state===status);
      const matchesOccupancy=!occupancy || (occupancy==='occupied' ? !['VACANT','RENTED'].includes(item.occupancyStatus) : item.occupancyStatus===occupancy);
      return (!focusId || item.id===focusId) && matchesSearch && matchesStatus && matchesOccupancy;
    }).sort((a,b)=>{
      if(order==='due') return a.dueDate.localeCompare(b.dueDate);
      if(order==='balance') return invoiceRemaining(b)-invoiceRemaining(a);
      return a.propertyCode.localeCompare(b.propertyCode,'id',{numeric:true});
    });
  },[periodInvoices,focusId,search,status,occupancy,order,today]);
  const safePage=Math.min(page,Math.max(1,Math.ceil(visible.length/pageSize)));
  const paged=visible.slice((safePage-1)*pageSize,safePage*pageSize);
  const focused=periodInvoices.find(item=>item.id===focusId);

  function choosePeriod(value:string) {
    setPeriodId(value);setFocusId('');setSearch('');setStatus('');setOccupancy('');setShowUnknownPeriod(false);setPage(1);
    window.history.pushState(window.history.state,'',financePath('/admin/billing',{tab,period:value}));
  }

  function openAction(value:InvoiceAction) {
    setError('');setNotice('');setAction(value);
  }

  function openDocument(invoice:BillingInvoice) {
    setDocument({
      invoiceNumber:invoice.invoiceNumber,periodName:invoice.billingPeriodName,propertyCode:invoice.propertyCode,
      residentName:invoice.residentName || 'Rumah '+invoice.propertyCode,amount:invoice.total,paidAt:invoice.paidAt,dueDate:invoice.dueDate,
      status:invoice.status,isInvoice:true,items:invoice.items,paidAmount:invoiceCollected(invoice),remaining:invoiceRemaining(invoice),
      bankInfo:bank && bank.accountNumber ? {bankName:bank.bankName || bank.name,accountNumber:bank.accountNumber} : undefined,
      notes:invoice.notes || undefined,
    });
  }

  function remind(invoice:BillingInvoice) {
    const lines=['Pengingat iuran WargaHub','Rumah '+invoice.propertyCode+' · '+invoice.billingPeriodName,
      'Tagihan '+invoice.invoiceNumber,'Sisa '+formatRupiah(invoiceRemaining(invoice)),'Jatuh tempo '+financeDate(invoice.dueDate),
      ...(bankText ? ['Rekening '+bankText] : []),'Konfirmasi pembayaran di '+window.location.origin+'/warga'];
    window.open(waLink(lines.join('\n')),'_blank','noopener,noreferrer');
  }

  async function submitInvoice(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!action || busy) return;
    setBusy(true);setError('');
    const fields=new FormData(event.currentTarget);
    const get=(key:string)=>String(fields.get(key) || '').trim();
    const total=Number(get('total')), dueDate=get('dueDate'), notes=get('notes');
    try {
      if(action.kind==='cancel') {
        await financePost('/api/billing/invoices/delete',{invoiceId:action.invoice.id,reason:get('reason')});
        setInvoices(items=>items.map(item=>item.id===action.invoice.id?{...item,status:'CANCELLED'}:item));
        setNotice('Tagihan dibatalkan. Riwayatnya tetap tercatat.');
      } else if(action.kind==='edit') {
        await financePost('/api/billing/invoices/update',{invoiceId:action.invoice.id,total,dueDate,notes});
        setInvoices(items=>items.map(item=>item.id===action.invoice.id?{
          ...item,total,dueDate,notes,items:total===item.total?item.items:[{name:'Iuran lingkungan',amount:total}],
        }:item));
        setNotice('Tagihan diperbarui.');
      } else {
        const house=houses.find(item=>item.id===get('propertyId'));
        const [year,month]=get('month').split('-').map(Number);
        const period=periods.find(item=>item.year===year && item.month===month);
        if(!house || !year || !month) throw new Error('Pilih rumah dan bulan tagihan.');
        const paid=fields.has('markPaid');
        const saved=await financePost<{id:string;billingPeriodId:string}>('/api/billing/invoices/create',{
          propertyId:house.id,propertyCode:house.code,periodId:period?.id,periodName:period?.name || billingMonthLabel(year,month),
          total,dueDate,notes,status:paid?'PAID':'UNPAID',expectedTariffTotal:total===tariff.total?tariff.total:undefined,
          ...(paid?{paymentMethod:get('method'),paidAt:get('paidAt'),accountId:get('accountId')}:{}),
        });
        window.location.assign(financePath('/admin/billing',{period:saved.billingPeriodId,invoice:saved.id}));
      }
      setAction(null);
    } catch(error) {setError(errText(error));}
    finally {setBusy(false);}
  }

  return <div className="workspace">
    <FinanceHeader area="billing" title="Tagihan iuran" canViewPayments={canManage}>
      <a className={financeButton} href={financePath('/rekap-iuran',{period:periodId})} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="size-4" aria-hidden="true" />Rekap publik
      </a>
      {canManage && <button type="button" className={financeButton} onClick={()=>setShowReport(true)}>
        <MessageCircle className="size-4" aria-hidden="true" />Laporan WA (wa.me)
      </button>}
      {canManage && <button type="button" onClick={()=>openAction({kind:'create'})} className={financePrimary}><Plus className="size-4" aria-hidden="true" />Buat tagihan</button>}
    </FinanceHeader>
    <FinanceTabs tabs={tabs} active={tab} change={setTab} label="Submenu tagihan" />
    {notice && <p role="status" className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-900">{notice}</p>}

    {tab==='invoices' && <section className="grid min-w-0 gap-4" aria-label="Daftar tagihan">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <label className="block w-full min-w-0 max-w-xs text-sm font-semibold">Periode
          <select value={periodId} onChange={event=>choosePeriod(event.target.value)} className={financeField} disabled={!periods.length}>
            {!periods.length && <option value="">Belum ada periode</option>}
            {periods.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={financeButton} disabled={!visible.length} onClick={()=>downloadFinanceCsv('tagihan-'+(periodId || 'iuran')+'.csv',[
            ['Nomor tagihan','Rumah','Penghuni','Periode','Total','Diterima','Sisa','Status','Jatuh tempo'],
            ...visible.map(item=>[item.invoiceNumber,item.propertyCode,item.residentName,item.billingPeriodName,item.total,invoiceCollected(item),invoiceRemaining(item),invoiceState(item,today),item.dueDate]),
          ])}><Download className="size-4" aria-hidden="true" />CSV</button>
        </div>
      </div>
      {showUnknownPeriod && <p role="status" className="text-sm text-ink-muted">Periode dari tautan tidak ditemukan. Periode yang tersedia ditampilkan.</p>}
      <FinanceSummary items={[
        {label:'Total tagihan',value:formatRupiah(billed),detail:collectible.length+' tagihan aktif',tone:'sky'},
        {label:'Sudah diterima',value:formatRupiah(received),detail:paidCount+' tagihan lunas',tone:'mint'},
        {label:'Sisa tagihan',value:formatRupiah(remaining),detail:pendingCount+' pembayaran menunggu cek',tone:'amber'},
      ]} />
      {focusId && <FinanceScope clear={()=>choosePeriod(periodId)}>{focused ? 'Tagihan '+focused.invoiceNumber : 'Tagihan dari tautan'}</FinanceScope>}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <label className="min-w-0 text-sm font-semibold">Cari tagihan<input type="search" className={financeField} value={search} placeholder="Rumah, nama, nomor" onChange={event=>{setSearch(event.target.value);setPage(1);}} /></label>
        <button className={financeButton+' sm:hidden'} type="button" aria-expanded={showFilters} aria-controls="billing-filters" onClick={()=>setShowFilters(value=>!value)}>
          <Filter className="size-4" aria-hidden="true" />Filter{[status,occupancy].filter(Boolean).length>0 && <span>({[status,occupancy].filter(Boolean).length})</span>}
        </button>
        <div id="billing-filters" className={(showFilters?'grid':'hidden')+' col-span-2 min-w-0 gap-3 sm:contents'}>
          <label className="min-w-0 text-sm font-semibold">Status<select className={financeField} value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}>
            {statusFilters.map(([id,name])=><option key={id} value={id}>{name}</option>)}
          </select></label>
          <label className="min-w-0 text-sm font-semibold">Hunian<select className={financeField} value={occupancy} onChange={event=>{setOccupancy(event.target.value);setPage(1);}}>
            {occupancyFilters.map(([id,name])=><option key={id} value={id}>{name}</option>)}
          </select></label>
          <label className="min-w-0 text-sm font-semibold">Urutkan<select className={financeField} value={order} onChange={event=>{setOrder(event.target.value);setPage(1);}}>
            <option value="house">Kode rumah</option><option value="due">Jatuh tempo</option><option value="balance">Sisa terbesar</option>
          </select></label>
        </div>
      </div>
      {!paged.length ? <FinanceEmpty action={canManage && !focusId && !periodInvoices.length &&
        <button type="button" className={financeButton} onClick={()=>setTab('batch')}>Terbitkan tagihan</button>}>
        {focusId ? 'Tagihan ini tidak ditemukan pada pilihan sekarang.' : periodInvoices.length ? 'Tidak ada tagihan yang cocok.' : 'Belum ada tagihan pada periode ini.'}
      </FinanceEmpty> : <div className="min-w-0 rounded-xl border border-border bg-surface">
        <div aria-hidden="true" className="hidden gap-3 rounded-t-xl bg-canvas px-4 py-2.5 text-xs font-semibold text-ink-muted xl:grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.4fr)]">
          <span>Rumah dan tagihan</span><span>Nilai dan sisa</span><span>Status</span><span>Tindakan</span>
        </div>
        <ul className="divide-y divide-border">
          {paged.map(invoice=>{
            const state=invoiceState(invoice,today), left=invoiceRemaining(invoice);
            const pending=Boolean(invoice.pendingPaymentId);
            const editable=canManage && left>0 && !pending && !invoice.paidAmount && ['UNPAID','OVERDUE'].includes(invoice.status);
            const context={invoice:invoice.id,period:invoice.billingPeriodId,search:invoice.propertyCode};
            return <li key={invoice.id} className="grid min-w-0 gap-x-3 gap-y-2 px-3 py-3 min-[420px]:grid-cols-2 sm:px-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.4fr)] xl:items-start">
              <div className="min-w-0">
                <p className="font-bold [overflow-wrap:anywhere]">{invoice.propertyCode}{invoice.residentName && <span className="ml-2 text-sm font-normal text-ink-muted">{invoice.residentName}</span>}</p>
                <p className="mt-1 text-xs text-ink-muted [overflow-wrap:anywhere]">{invoice.invoiceNumber}</p>
              </div>
              <div className="min-w-0 tabular-nums">
                <p className="text-sm font-semibold [overflow-wrap:anywhere]">{formatRupiah(invoice.total)}</p>
                {left>0 && <p className="mt-1 text-xs text-ink-muted">Sisa {formatRupiah(left)}</p>}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 xl:block">
                <FinanceStatus value={state} /><p className="text-xs text-ink-muted xl:mt-1">{financeDate(invoice.dueDate)}</p>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <button type="button" onClick={()=>openDocument(invoice)} className={financeButton}>Rincian</button>
                {canManage && pending && <a className={financePrimary} href={financePath('/admin/payments',{...context,tab:'verification',payment:invoice.pendingPaymentId})}>Cek bukti</a>}
                {canManage && left>0 && !pending && <a className={financePrimary} href={financePath('/admin/payments',{...context,tab:'manual_counter'})}>Catat bayar</a>}
                {canManage && invoiceCollected(invoice)>0 && <a className={financeButton} href={financePath('/admin/payments',{...context,tab:'history'})}>Kuitansi</a>}
                {editable && <details className="group relative">
                  <summary className={financeButton+' cursor-pointer list-none'}>Lainnya</summary>
                  <div className="mt-1 flex flex-col items-start rounded-lg border border-border bg-surface p-1 text-sm shadow-card">
                    <button type="button" onClick={()=>openAction({kind:'edit',invoice})} className="min-h-11 whitespace-nowrap rounded px-2 text-primary-800 hover:bg-canvas">Ubah tagihan</button>
                    <button type="button" onClick={()=>openAction({kind:'cancel',invoice})} className="min-h-11 whitespace-nowrap rounded px-2 text-rose-800 hover:bg-rose-50">Batalkan</button>
                  </div>
                </details>}
                {canManage && left>0 && !pending && <button type="button" className="icon-button" aria-label={'Pengingat WhatsApp rumah '+invoice.propertyCode} onClick={()=>remind(invoice)}>
                  <MessageCircle className="size-4" aria-hidden="true" />
                </button>}
              </div>
            </li>;
          })}
        </ul>
        <FinancePager total={visible.length} page={safePage} pageSize={pageSize} onChange={setPage} label="tagihan" />
      </div>}
    </section>}

    {tab==='annual_matrix' && <AnnualRecap invoices={invoices} houses={houses} periods={periods} today={today} year={activePeriod?.year || Number(today.slice(0,4))} canManage={canManage} />}
    {tab==='tariffs' && <section className="workspace-panel grid gap-4" aria-label="Tarif iuran">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-bold">Tarif aktif per rumah</h2><p className="text-2xl font-bold tabular-nums text-primary-800">{formatRupiah(tariff.total)}</p></div>
        {canManage && <button type="button" className={financePrimary} onClick={()=>{setError('');setNotice('');setEditingTariff(true);}}>Ubah tarif</button>}
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {tariff.components.map((part,index)=><li key={index} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 text-sm">
          <span className="[overflow-wrap:anywhere]">{part.name}</span><strong className="tabular-nums">{formatRupiah(part.amount)}</strong>
        </li>)}
      </ul>
      {tariff.note && <p className="text-sm text-ink-muted">{tariff.note}</p>}
      <p className="text-sm text-ink-muted">Jatuh tempo standar tanggal {tariff.dueDay}. Berlaku untuk tagihan baru.</p>
      {canManage && <button type="button" className={financeButton+' justify-self-start'} onClick={()=>setTab('batch')}>Terbitkan massal</button>}
    </section>}
    {tab==='batch' && (canManage
      ? <BatchForm tariff={tariff} periods={periods} invoices={invoices} eligibleIds={billableIds} today={today} onTariff={()=>setTab('tariffs')} />
      : <FinanceEmpty>Penerbitan tagihan tersedia untuk pengurus keuangan.</FinanceEmpty>)}

    <FinanceDialog open={Boolean(action)} title={action?.kind==='edit'?'Ubah tagihan':action?.kind==='cancel'?'Batalkan tagihan':'Buat tagihan'}
      close={()=>setAction(null)} busy={busy} error={error}>
      {action?.kind==='cancel' ? <form onSubmit={submitInvoice} className="grid gap-3">
        <p className="text-sm text-ink-muted">{action.invoice.propertyCode} · {action.invoice.invoiceNumber}</p>
        <label className="text-sm font-semibold">Alasan pembatalan<textarea name="reason" maxLength={500} minLength={3} required className={financeField} rows={2} /></label>
        <button className="min-h-11 justify-self-start whitespace-nowrap rounded-lg bg-rose-800 px-3 text-sm font-semibold text-white hover:bg-rose-900 disabled:opacity-60" disabled={busy}>
          {busy?'Membatalkan…':'Batalkan tagihan'}
        </button>
      </form> : action && <InvoiceForm original={action.kind==='edit'?action.invoice:undefined} houses={houses} accounts={accounts} periods={periods}
        tariff={tariff} today={today} current={activePeriod} houseId={houses.find(item=>item.code.toLowerCase()===search.trim().toLowerCase())?.id} busy={busy} submit={submitInvoice} />}
    </FinanceDialog>
    <FinanceDialog open={editingTariff} title="Ubah tarif" close={()=>setEditingTariff(false)} busy={busy} error={error}>
      {editingTariff && <TariffForm tariff={tariff} busy={busy} save={async input=>{
        setBusy(true);setError('');
        try {
          setTariff(await financePost<BillingTariff>('/api/billing/tariff',input));
          setEditingTariff(false);setNotice('Tarif baru tersimpan.');
        } catch(error) {setError(errText(error));}
        finally {setBusy(false);}
      }} />}
    </FinanceDialog>
    {canManage && showReport && <WhatsAppDuesReportModal mode="dues" periods={periods} invoices={invoices} initialPeriodId={periodId}
      today={today} profile={shareProfile} onClose={()=>setShowReport(false)} />}
    {invoiceDocument && <ReceiptModal data={invoiceDocument} isOpen onClose={()=>setDocument(null)} />}
  </div>;
}

function InvoiceForm({original,houses,accounts,periods,tariff,today,current,houseId,busy,submit}: {
  original?:BillingInvoice;houses:FinanceHouse[];accounts:FinanceAccount[];periods:BillingPeriod[];
  tariff:BillingTariff;today:string;current?:BillingPeriod;houseId?:string;busy:boolean;submit:(event:FormEvent<HTMLFormElement>)=>void;
}) {
  const [month,setMonth]=useState(current?billingMonthKey(current.year,current.month):today.slice(0,7));
  const [dueDate,setDueDate]=useState(original?.dueDate.slice(0,10) || current?.dueDate.slice(0,10) || defaultInvoiceDueDate(month,tariff.dueDay));
  const [paid,setPaid]=useState(false);
  const [method,setMethod]=useState('CASH');
  const isCash=method.startsWith('CASH');
  const eligible=accounts.filter(item=>cashAccount(item)===isCash);
  const closed=periods.some(item=>billingMonthKey(item.year,item.month)===month && item.status!=='OPEN');
  return <form onSubmit={submit} className="grid min-w-0 gap-3">
    {original ? <p className="text-sm text-ink-muted">{original.propertyCode} · {original.billingPeriodName}</p> : <>
      <label className="min-w-0 text-sm font-semibold">Rumah
        <select name="propertyId" className={financeField} defaultValue={houseId || ''} required>
          <option value="">Pilih rumah</option>
          {houses.map(item=><option key={item.id} value={item.id}>{item.code}{item.name?' · '+item.name:''}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-sm font-semibold">Bulan tagihan
        <input name="month" type="month" value={month} min="2025-01" max="2100-12" required className={financeField}
          onChange={event=>{const next=event.target.value;setMonth(next);setDueDate(periods.find(item=>billingMonthKey(item.year,item.month)===next)?.dueDate.slice(0,10) || defaultInvoiceDueDate(next,tariff.dueDay));}} />
      </label>
      {closed && <p role="status" className="text-sm text-rose-800">Periode ini sudah ditutup.</p>}
    </>}
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <label className="min-w-0 text-sm font-semibold">Nominal (Rp)
        <input name="total" type="number" inputMode="numeric" min={1} max={1e9} step={1} required className={financeField} defaultValue={original?.total ?? tariff.total} />
      </label>
      <label className="min-w-0 text-sm font-semibold">Jatuh tempo
        <input name="dueDate" type="date" value={dueDate} min={original?.issuedAt.slice(0,10) || (month?month+'-01':undefined)} required className={financeField} onChange={event=>setDueDate(event.target.value)} />
      </label>
    </div>
    {!original && <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
      <input name="markPaid" type="checkbox" checked={paid} onChange={event=>setPaid(event.target.checked)} />Sudah dibayar
    </label>}
    {paid && <div className="grid min-w-0 gap-3 rounded-lg bg-primary-50 p-3 sm:grid-cols-2">
      <label className="min-w-0 text-sm font-semibold">Metode
        <select name="method" value={method} onChange={event=>setMethod(event.target.value)} className={financeField}>
          {Object.entries(PAYMENT_METHODS).map(([key,label])=><option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-sm font-semibold">Tanggal bayar<input name="paidAt" type="date" defaultValue={today} required className={financeField} /></label>
      <label className="min-w-0 text-sm font-semibold sm:col-span-2">Rekening penerima
        <select name="accountId" key={String(isCash)} required className={financeField} defaultValue="">
          <option value="">Pilih rekening</option>{eligible.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      {!eligible.length && <a href="/admin/ledger?tab=accounts_manage" className="min-h-11 self-center text-sm font-semibold text-primary-800 underline sm:col-span-2">Siapkan rekening di Buku kas</a>}
    </div>}
    <label className="text-sm font-semibold">Catatan<textarea name="notes" className={financeField} defaultValue={original?.notes || ''} maxLength={2000} rows={2} /></label>
    <button className={financePrimary+' justify-self-start'} disabled={busy || (!original && (closed || !houses.length || (paid && !eligible.length)))}>
      {busy?'Menyimpan…':original?'Simpan perubahan':'Terbitkan tagihan'}
    </button>
  </form>;
}

function TariffForm({tariff,busy,save}: {tariff:BillingTariff;busy:boolean;save:(input:{components:TariffComponent[];note:string;dueDay:number})=>void}) {
  const [parts,setParts]=useState(tariff.components);
  const total=parts.reduce((sum,part)=>sum+part.amount,0);
  return <form className="grid gap-3" onSubmit={event=>{
    event.preventDefault();
    const values=new FormData(event.currentTarget);
    save({components:parts,note:String(values.get('note') || ''),dueDay:Number(values.get('dueDay'))});
  }}>
    {parts.map((part,index)=><fieldset key={index} className="grid min-w-0 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <legend className="px-1 text-xs font-semibold text-ink-muted">{'Pos '+(index+1)}</legend>
      <label className="min-w-0 text-sm font-semibold">Nama pos<input value={part.name} minLength={2} maxLength={120} required className={financeField}
        onChange={event=>setParts(items=>items.map((item,i)=>i===index?{...item,name:event.target.value}:item))} /></label>
      <label className="min-w-0 text-sm font-semibold">Nominal (Rp)<input type="number" min={1} max={1e9} step={1} required className={financeField} value={part.amount || ''}
        onChange={event=>setParts(items=>items.map((item,i)=>i===index?{...item,amount:Number(event.target.value)}:item))} /></label>
      {parts.length>1 && <button type="button" className="min-h-11 justify-self-start text-sm font-semibold text-rose-800 hover:underline"
        aria-label={'Hapus pos '+(index+1)} onClick={()=>setParts(items=>items.filter((_,i)=>i!==index))}>Hapus pos</button>}
    </fieldset>)}
    <button type="button" className={financeButton+' justify-self-start'} disabled={parts.length>=12}
      onClick={()=>setParts(items=>[...items,{name:'',amount:0}])}><Plus className="size-4" aria-hidden="true" />Tambah pos</button>
    <label className="text-sm font-semibold">Tanggal jatuh tempo standar<input name="dueDay" type="number" min={1} max={28} step={1} required defaultValue={tariff.dueDay} className={financeField} /></label>
    <label className="text-sm font-semibold">Catatan<textarea name="note" defaultValue={tariff.note} maxLength={500} rows={2} className={financeField} /></label>
    <p className="text-sm font-semibold tabular-nums">Total {formatRupiah(total)}</p>
    <button className={financePrimary+' justify-self-start'} disabled={busy || total<1 || total>1e9}>{busy?'Menyimpan…':'Simpan tarif'}</button>
  </form>;
}

function BatchForm({tariff,periods,invoices,eligibleIds,today,onTariff}: {
  tariff:BillingTariff;periods:BillingPeriod[];invoices:BillingInvoice[];eligibleIds:string[];today:string;onTariff:()=>void;
}) {
  const [month,setMonth]=useState(today.slice(0,7));
  const [date,setDate]=useState(defaultInvoiceDueDate(today.slice(0,7),tariff.dueDay));
  const [custom,setCustom]=useState(false);
  const [fee,setFee]=useState(tariff.total);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [result,setResult]=useState<BatchResult|null>(null);
  const period=periods.find(item=>billingMonthKey(item.year,item.month)===month);
  const activeIds=new Set(eligibleIds);
  const existing=new Set(invoices.filter(item=>item.billingPeriodId===period?.id && activeIds.has(item.propertyId)).map(item=>item.propertyId)).size;
  const before=eligibleIds.length-existing;
  const amount=custom?fee:tariff.total;
  async function issue(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy) return;
    setBusy(true);setError('');
    try {
      const [year,number]=month.split('-').map(Number);
      const issued=await financePost<BatchResult>('/api/billing/generate-batch',{
        year,month:number,name:billingMonthLabel(year,number),dueDate:period?.dueDate.slice(0,10) || date,
        ...(custom?{feeAmount:fee}:{expectedTariffTotal:tariff.total}),
      });
      if(issued.newlyGenerated>0) window.location.assign(financePath('/admin/billing',{period:issued.periodId}));
      else setResult(issued);
    } catch(error) {setError(errText(error));}
    finally {setBusy(false);}
  }
  return <section className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-label="Penerbitan massal">
    <form className="workspace-panel grid min-w-0 gap-3" onSubmit={issue}>
      <h2>Terbitkan tagihan untuk rumah aktif</h2>
      <label className="text-sm font-semibold">Bulan tagihan
        <input type="month" className={financeField} value={month} required min="2025-01" max="2100-12"
          onChange={event=>{setMonth(event.target.value);setDate(defaultInvoiceDueDate(event.target.value,tariff.dueDay));setResult(null);setError('');}} />
      </label>
      <label className="text-sm font-semibold">Jatuh tempo
        <input type="date" className={financeField} value={period?.dueDate.slice(0,10) || date} min={month?month+'-01':undefined}
          readOnly={Boolean(period?.dueDate)} required onChange={event=>setDate(event.target.value)} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-primary-50 px-3 py-1">
        <p className="text-sm font-semibold">Tarif aktif {formatRupiah(tariff.total)}</p>
        <button className="min-h-11 whitespace-nowrap text-sm font-semibold text-primary-800 hover:underline" type="button" onClick={onTariff}>Lihat tarif</button>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={custom} onChange={event=>setCustom(event.target.checked)} />Nominal khusus untuk periode ini</label>
      {custom && <label className="text-sm font-semibold">Nominal per rumah (Rp)
        <input className={financeField} type="number" min={1} max={1e9} step={1} required value={fee || ''} onChange={event=>setFee(Number(event.target.value))} />
      </label>}
      {period && period.status!=='OPEN' && <p role="alert" className="text-sm text-rose-800">Periode ini sudah ditutup.</p>}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      <button className={financePrimary+' justify-self-start'} disabled={busy || !before || !month || Boolean(result) || Boolean(period && period.status!=='OPEN')}>
        {busy?'Menerbitkan…':'Terbitkan '+before+' tagihan'}
      </button>
    </form>
    <aside className="grid gap-3 rounded-xl bg-sky-50 p-4 text-sky-950" aria-label="Pratinjau penerbitan">
      <h2 className="font-bold">Pratinjau</h2>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm tabular-nums">
        <dt>Rumah yang memenuhi syarat</dt><dd className="font-semibold">{eligibleIds.length}</dd>
        <dt>Sudah punya tagihan</dt><dd className="font-semibold">{result?.alreadyExisting ?? existing}</dd>
        <dt>{result?'Tagihan terbit':'Tagihan baru'}</dt><dd className="font-semibold">{result?.newlyGenerated ?? before}</dd>
        {!result && <><dt>Total tagihan baru</dt><dd className="font-semibold">{formatRupiah(before*amount)}</dd></>}
      </dl>
      {result && <><p role="status" className="text-sm">{result.message}</p>
        <a className={financeButton+' justify-self-start'} href={financePath('/admin/billing',{period:result.periodId})}>Buka daftar tagihan</a></>}
    </aside>
  </section>;
}

const monthTiles: Record<string,[string,string]> = {
  PAID:['Lunas','bg-primary-50 text-primary-900'], OVERDUE:['Tempo','bg-rose-50 text-rose-900'],
  WAIVED:['Bebas','bg-slate-100 text-slate-800'], CANCELLED:['Batal','bg-slate-100 text-slate-800'],
  VOID:['Batal','bg-slate-100 text-slate-800'], UNPAID:['Tagih','bg-amber-50 text-amber-900'],
  PARTIAL:['Cicil','bg-sky-50 text-sky-900'], PENDING_VERIFICATION:['Cek','bg-sky-50 text-sky-900'],
};
const emptyMonths=()=>Array.from({length:12},()=>[] as BillingInvoice[]);

function AnnualRecap({invoices,houses,periods,today,year,canManage}: {
  invoices:BillingInvoice[];houses:FinanceHouse[];periods:BillingPeriod[];today:string;year:number;canManage:boolean;
}) {
  const [selectedYear,setYear]=useState(year);
  const [search,setSearch]=useState('');
  const years=[...new Set([year,Number(today.slice(0,4)),...periods.map(item=>item.year)])].sort((a,b)=>b-a);
  const periodMap=new Map(periods.filter(item=>item.year===selectedYear).map(item=>[item.id,item]));
  const houseMap=new Map(houses.map(item=>[item.id,item]));
  const matrix=new Map<string,BillingInvoice[][]>();
  for(const invoice of invoices) {
    const period=periodMap.get(invoice.billingPeriodId);
    if(!period || !invoice.propertyId || period.month<1 || period.month>12) continue;
    if(!houseMap.has(invoice.propertyId)) houseMap.set(invoice.propertyId,{id:invoice.propertyId,code:invoice.propertyCode,name:invoice.residentName,block:invoice.areaLabel,occupancy:invoice.occupancyStatus});
    const months=matrix.get(invoice.propertyId) || emptyMonths();
    months[period.month-1].push(invoice);
    matrix.set(invoice.propertyId,months);
  }
  const query=search.trim().toLowerCase();
  const rows=[...houseMap.values()].filter(item=>[item.code,item.name || '',item.block].some(value=>value.toLowerCase().includes(query)))
    .sort((a,b)=>a.code.localeCompare(b.code,'id',{numeric:true}));
  return <section className="grid min-w-0 gap-4" aria-label="Rekap tahunan">
    <div className="grid min-w-0 gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
      <label className="min-w-0 text-sm font-semibold">Cari rumah<input className={financeField} type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Kode atau nama" /></label>
      <label className="text-sm font-semibold">Tahun<select className={financeField} value={selectedYear} onChange={event=>setYear(Number(event.target.value))}>
        {years.map(item=><option key={item} value={item}>{item}</option>)}
      </select></label>
      <button type="button" className={financeButton} disabled={!rows.length} onClick={()=>downloadFinanceCsv('rekap-iuran-'+selectedYear+'.csv',[
        ['Rumah','Nama',...BILLING_MONTHS,'Diterima','Sisa'],
        ...rows.map(row=>{
          const months=matrix.get(row.id) || emptyMonths();
          const records=months.flat();
          return [row.code,row.name || '',...months.map(items=>items.length?items.map(item=>invoiceState(item,today)).join(' / '):'Belum terbit'),
            records.filter(item=>!cancelled(item.status)).reduce((sum,item)=>sum+invoiceCollected(item),0),
            records.reduce((sum,item)=>sum+invoiceRemaining(item),0)];
        }),
      ])}><Download className="size-4" aria-hidden="true" />CSV</button>
    </div>
    <p className="text-sm text-ink-muted">Tanda — berarti belum ada tagihan yang terbit.</p>
    {rows.length ? <ul className="grid min-w-0 gap-3">
      {rows.map(row=>{
        const months=matrix.get(row.id) || emptyMonths();
        const records=months.flat();
        const remaining=records.reduce((sum,item)=>sum+invoiceRemaining(item),0);
        const due=records.filter(item=>invoiceRemaining(item)>0 && invoiceState(item,today)==='OVERDUE');
        return <li key={row.id} className="grid min-w-0 gap-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <p className="font-bold [overflow-wrap:anywhere]">{row.code}{row.name && <span className="ml-2 text-sm font-normal text-ink-muted">{row.name}</span>}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tabular-nums">Sisa {formatRupiah(remaining)}</p>
              {canManage && due.length>0 && <a className="icon-button" aria-label={'Pengingat tunggakan '+row.code} href={waLink([
                'Pengingat tunggakan iuran '+selectedYear,'Rumah '+row.code,
                ...due.map(item=>item.billingPeriodName+' · '+formatRupiah(invoiceRemaining(item))),
              ].join('\n'))} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden="true" /></a>}
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-4 gap-1.5 sm:grid-cols-6 xl:grid-cols-12">
            {months.map((items,index)=>{
              const month=BILLING_MONTHS[index];
              if(!items.length) return <span key={month} title={month+' · Belum terbit'} data-month-status="unissued"
                className="grid min-h-11 place-content-center rounded-md bg-canvas px-1 py-1 text-center text-xs text-ink-muted">
                <span>{month.slice(0,3)}</span><span aria-label="Belum terbit">—</span>
              </span>;
              const invoice=items[0];
              const state=invoiceState(invoice,today);
              const cell=items.length>1 ? monthTiles.PENDING_VERIFICATION : monthTiles[state] || monthTiles.UNPAID;
              const label=month+' · '+cell[0]+(items.length>1?' · '+items.length+' tagihan':'');
              return <a key={month} data-month-status={state.toLowerCase()} aria-label={label} title={label}
                className={'grid min-h-11 place-content-center whitespace-nowrap rounded-md px-1 py-1 text-center text-xs hover:underline '+cell[1]}
                href={financePath('/admin/billing',{period:invoice.billingPeriodId,invoice:items.length===1?invoice.id:undefined,house:items.length===1?undefined:row.code})}>
                <span className="font-semibold">{month.slice(0,3)}</span><span>{cell[0]}</span>
              </a>;
            })}
          </div>
        </li>;
      })}
    </ul> : <FinanceEmpty>Tidak ada rumah yang cocok.</FinanceEmpty>}
  </section>;
}
