/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useState } from 'react';
import { ArrowDownLeft, ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronLeft, ChevronRight, CircleHelp, Copy, Receipt, Share2, Wallet } from 'lucide-react';
import { billingMonthKey, billingMonthLabel, financeDate } from '../../lib/billing-data';
import { cashRupiah, financeMonth } from '../../lib/cash-data';
import { PUBLIC_CSV_LIMIT, PUBLIC_JOURNAL_PAGE_SIZE, publicCashCategories, publicJournalParams, publicReportPath,
  type PublicDuesMonth, type PublicExpenseReport, type PublicReportFilters, type PublicTransparencyData, type TransparencySubTab } from '../../lib/transparency-data';
import { ModalDialog } from '../shared/ModalDialog';

const tabs = [
  {id:'cashflow_summary',label:'Ringkasan kas',icon:Wallet},{id:'public_ledger',label:'Jurnal publik',icon:BookOpen},
  {id:'dues_breakdown',label:'Rekap iuran',icon:Receipt},{id:'citizen_confirm',label:'Cek iuran saya',icon:Check},
  {id:'audit_faq',label:'Bantuan',icon:CircleHelp},
] as const;
const button='btn-secondary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';
const primary='btn-primary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';
const field='min-h-11 min-w-0 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink';
const link='inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary-800 hover:underline';
const panel='min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5';
const number='tabular-nums [overflow-wrap:anywhere]';

function CashLine({label,amount,tone='text-ink'}:{label:string;amount:number;tone?:string}) {
  return <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-border py-2.5 last:border-0">
    <dt className="text-sm font-medium text-ink-muted">{label}</dt><dd className={'text-sm font-bold '+tone+' '+number}>{cashRupiah(amount)}</dd>
  </div>;
}
function DuesAmounts({dues}:{dues:PublicDuesMonth}) {
  return <dl className="grid min-w-0 gap-2 sm:grid-cols-3" aria-label="Nominal tagihan">
    {([['Total tagihan',dues.billedAmount],['Sudah diterima',dues.received],['Sisa tagihan',dues.remaining]] as const).map(([label,amount])=>
      <div key={label} className="min-w-0 rounded-xl bg-canvas p-3"><dt className="text-sm font-medium text-ink-muted">{label}</dt>
        <dd className={'mt-1 text-lg font-bold '+number}>{cashRupiah(amount)}</dd></div>)}
  </dl>;
}
function ExpenseCard({report,month,periodLabel}:{report:PublicExpenseReport|null;month:string;periodLabel:string}) {
  const archived=Boolean(report && report.month!==month);
  return <article className={panel+' grid content-start gap-3'} aria-label="Pengeluaran yang dibukukan">
    <h2 className="text-xl font-bold tracking-tight">Pengeluaran {periodLabel}</h2>
    {(!report || archived) && <p className="text-sm text-ink-muted">Belum ada pengeluaran yang dibukukan pada periode ini.</p>}
    {report && <div className={'grid min-w-0 gap-2 '+(archived?'rounded-xl border border-border bg-canvas p-3':'')}>
      {archived && <h3 className="text-sm font-semibold">Terakhir dibukukan: {financeMonth(report.month)}</h3>}
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-1" aria-label="Total pengeluaran tercatat">
        <p className={'text-xl font-bold text-rose-800 '+number}>{cashRupiah(report.net)}</p>
        <p className="text-xs text-ink-muted">{report.total} entri · bersih setelah pembalikan</p>
      </div>
      <ul className="divide-y divide-border" aria-label="Rincian pengeluaran">
        {report.recent.map(row=><li key={row.reference} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2">
          <div className="min-w-0"><p className="text-sm font-semibold [overflow-wrap:anywhere]">{publicCashCategories[row.category]}</p>
            <p className="text-xs text-ink-muted">{financeDate(row.date)}{row.reversal?' · Pembalikan':''}</p></div>
          <p className={'text-right text-sm font-semibold '+number}>{row.reversal?'−':''}{cashRupiah(row.amount)}</p>
        </li>)}
      </ul>
      <a href={publicReportPath(report.month,'public_ledger',{scope:'expenses'})} className={link+' w-fit'}>Semua pengeluaran <ArrowRight className="size-4" aria-hidden="true" /></a>
    </div>}
  </article>;
}
export function TransparencyView({data,filters}:{data:PublicTransparencyData;filters:PublicReportFilters}) {
  const [share,setShare]=useState(false);
  const [copied,setCopied]=useState('');
  const [feedback,setFeedback]=useState('');
  const {tab}=filters;
  const key=billingMonthKey(data.period.year,data.period.month);
  const path=(section:TransparencySubTab=tab,params:Record<string,string|number|undefined>={})=>publicReportPath(data.period,section,params);
  const journalParams=publicJournalParams(filters);
  const monthParams:Record<string,string>=tab==='public_ledger'?journalParams:{};
  const dues=data.dues.at(-1)!;
  const notPaid=dues.billed-dues.paid;
  const unbilled=Math.max(0,data.homes-dues.billed);
  const outgoingPositive=data.outgoing.reduce((sum,item)=>sum+Math.max(0,item.amount),0);
  const canDownload=data.journal.total>0 && data.journal.total<=PUBLIC_CSV_LIMIT;
  const wargaDues='/warga?'+new URLSearchParams({tab:'iuran',month:key});
  const help='/warga?tab=info&info=complaints';
  const shareWa='https://wa.me/?'+new URLSearchParams({text:'Laporan warga · '+data.periodLabel+'\n'+data.shareUrl});
  async function copy(value:string,which:string) {
    try { await navigator.clipboard.writeText(value); setCopied(which); setFeedback('Disalin.'); }
    catch { setFeedback('Tidak bisa menyalin otomatis. Salin teks yang ditampilkan.'); }
  }
  return <div className="grid min-w-0 gap-5 sm:gap-6">
    <header className="grid min-w-0 gap-4">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary-800 [overflow-wrap:anywhere]">{data.communityName}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink [overflow-wrap:anywhere] sm:text-4xl">Transparansi warga</h1>
        </div>
        <button type="button" className={button} onClick={()=>{setFeedback('');setCopied('');setShare(true);}}><Share2 className="size-4" aria-hidden="true" />Bagikan</button>
      </div>
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-surface p-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          {data.previousMonth && <a className="icon-button" aria-label="Bulan sebelumnya" href={publicReportPath(data.previousMonth,tab,monthParams)}><ChevronLeft className="size-5" aria-hidden="true" /></a>}
          <div className="min-w-0 px-1"><p className="text-xs font-medium text-ink-muted">Periode laporan</p><p className="text-base font-bold">{data.periodLabel}</p></div>
          {data.nextMonth && <a className="icon-button" aria-label="Bulan berikutnya" href={publicReportPath(data.nextMonth,tab,monthParams)}><ChevronRight className="size-5" aria-hidden="true" /></a>}
        </div>
        <form action="/transparency" className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 max-sm:w-full">
          <input type="hidden" name="tab" value={tab} />
          {Object.entries(monthParams).filter(([,value])=>value).map(([name,value])=><input key={name} type="hidden" name={name} value={value} />)}
          <label className="block min-w-0 text-xs font-semibold">Pilih bulan
            <input aria-label="Pilih bulan" type="month" name="period" min="1900-01" max={data.currentMonth} defaultValue={key} required className={field+' mt-1'} />
          </label>
          <button type="submit" className={button}>Tampilkan</button>
        </form>
      </div>
    </header>

    <nav aria-label="Menu transparansi" className="grid grid-cols-2 gap-1 border-b border-border pb-2 sm:flex sm:flex-wrap">
      {tabs.map(({id,label,icon:Icon})=><a key={id} href={path(id)} aria-current={tab===id?'page':undefined}
        className={'inline-flex min-h-11 min-w-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold sm:px-3 '+(tab===id?'bg-primary-700 text-white':'text-ink-muted hover:bg-surface hover:text-ink')}>
        <Icon className="hidden size-4 shrink-0 min-[375px]:block" aria-hidden="true" />{label}
      </a>)}
    </nav>

    {tab==='cashflow_summary' && <section className="grid min-w-0 gap-4" aria-label="Ringkasan arus kas">
      <div className="grid min-w-0 items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <article className="grid min-w-0 content-start gap-3 rounded-2xl bg-primary-900 px-5 py-5 text-white sm:p-6" aria-label="Target dan penerimaan iuran">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><Receipt className="size-5 shrink-0 text-primary-100" aria-hidden="true" />Iuran {data.periodLabel}</h2>
          {dues.billed>0 ? <>
            <p className="text-sm text-primary-100">Total yang harus diterima <strong className={'text-white '+number}>{cashRupiah(dues.billedAmount)}</strong>.</p>
            <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong className={'text-3xl tracking-tight sm:text-4xl '+number}>{cashRupiah(dues.received)}</strong>
              <span className="text-sm font-medium text-primary-100">sudah diterima</span>
            </p>
            <p className="text-sm text-primary-100">Sisa tagihan <strong className={'text-white '+number}>{cashRupiah(dues.remaining)}</strong>.</p>
            {dues.billedAmount>0 && <progress className="public-report-progress h-2 w-full" value={dues.received} max={dues.billedAmount} aria-label="Penerimaan iuran dari total tagihan" />}
            <p className="text-sm text-primary-100">{dues.paid} dari {dues.billed} rumah yang ditagih sudah lunas.</p>
          </> : <p className="text-sm text-primary-100">Belum ada tagihan iuran yang terbit pada periode ini.</p>}
          <div className="flex flex-wrap gap-x-4">
            <a href={path('dues_breakdown')} className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold hover:underline">Rekap iuran <ArrowRight className="size-4" aria-hidden="true" /></a>
            <a href={path('citizen_confirm')} className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold hover:underline">Cek iuran saya <ArrowRight className="size-4" aria-hidden="true" /></a>
          </div>
        </article>
        <ExpenseCard report={data.expenses} month={key} periodLabel={data.periodLabel} />
      </div>
      <article className={panel+' grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'} aria-label="Saldo dan arus kas menurut buku">
        <div className="grid min-w-0 content-start gap-2">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><Wallet className="size-5 shrink-0 text-primary-800" aria-hidden="true" />Saldo menurut Buku Kas</h2>
          <p className={'text-2xl font-bold '+number} data-cash-value={data.cashReconciled?'closing':undefined}>{cashRupiah(data.cash.closing)}</p>
          <span className={'w-fit rounded-lg px-2.5 py-1 text-xs font-semibold '+(data.cashReconciled?'bg-primary-50 text-primary-900':'bg-amber-50 text-amber-900')}>
            {data.cashReconciled?'Sudah dicocokkan':'Belum terverifikasi'}
          </span>
          {!data.cashReconciled && <p className="text-sm text-ink-muted">Saldo ini belum dicocokkan dengan rekening atau kas fisik.</p>}
          <a href={path('public_ledger')} className={link+' w-fit'}>Buka jurnal <ArrowRight className="size-4" aria-hidden="true" /></a>
        </div>
        <div className="min-w-0">
          <dl>
            <CashLine label="Saldo awal" amount={data.cash.opening} />
            <CashLine label="Kas masuk bersih" amount={data.cash.income} tone="text-primary-800" />
            <CashLine label="Kas keluar bersih" amount={data.cash.outgoing} tone="text-rose-800" />
            {data.cash.openingEntries!==0 && <CashLine label="Saldo awal rekening baru" amount={data.cash.openingEntries} />}
            {data.cash.transfers!==0 && <CashLine label="Mutasi internal bersih" amount={data.cash.transfers} />}
          </dl>
          {!data.cash.count && <p className="text-sm text-ink-muted">Belum ada jurnal pada periode ini.</p>}
          {data.duesCash!==dues.received && <p className="mt-2 text-sm text-ink-muted">
            Kas iuran pada periode ini <strong className={number}>{cashRupiah(data.duesCash)}</strong>. Kas mengikuti tanggal pembayaran, sedangkan rekap iuran mengikuti bulan tagihan.
          </p>}
        </div>
      </article>
      {(data.outgoing.length>0 || data.loanCashIn!==0 || data.loanCashOut!==0) && <details className={panel}>
          <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold">Kas keluar per kategori</summary>
          {data.outgoing.length>0 && <ul className="divide-y divide-border">
              {data.outgoing.map(item=><li key={item.category} className="grid min-w-0 gap-1.5 py-2.5">
                <a href={path('public_ledger',{category:item.category})} className="flex min-h-11 min-w-0 flex-wrap items-center justify-between gap-x-2 rounded-lg text-sm font-semibold hover:text-primary-800">
                  <span className="inline-flex min-w-0 items-center gap-1.5">{publicCashCategories[item.category]}<ArrowUpRight className="size-3 shrink-0 text-primary-700" aria-hidden="true" /></span>
                  <span className={number}>{cashRupiah(item.amount)}</span>
                </a>
                {item.amount>0 && <progress className="public-report-progress h-1.5 w-full" value={item.amount} max={outgoingPositive} aria-label={'Porsi '+publicCashCategories[item.category]} />}
              </li>)}
            </ul>}
          {(data.loanCashIn!==0 || data.loanCashOut!==0) && <p className="mt-3 text-xs text-ink-muted">Pokok kasbon: {cashRupiah(data.loanCashOut)} dicairkan, {cashRupiah(data.loanCashIn)} kembali ke kas, setelah pembalikan.</p>}
      </details>}
    </section>}

    {tab==='public_ledger' && <section className={panel+' grid gap-3'} aria-label="Jurnal publik">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-xl font-bold tracking-tight">{filters.scope==='expenses'?'Jurnal pengeluaran':'Jurnal publik'}</h2><p className="text-sm text-ink-muted">Uraian pribadi tidak ditampilkan.</p></div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {filters.scope==='expenses' && <a className={link} href={path('public_ledger')}>Semua jurnal</a>}
          {canDownload && <a className={button} href={path('public_ledger',{...journalParams,download:'csv'})} download data-astro-reload><ArrowDownToLine className="size-4" aria-hidden="true" />Unduh CSV</a>}
        </div>
      </div>
      <form action={path('public_ledger').split('?')[0]} className="grid min-w-0 gap-2 rounded-xl bg-canvas p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end">
        <input type="hidden" name="tab" value="public_ledger" />
        {filters.scope && <input type="hidden" name="scope" value={filters.scope} />}
        <label className="grid min-w-0 gap-1 text-sm font-semibold">Arah
          <select name="direction" defaultValue={filters.direction} className={field}><option value="">Semua arah</option><option value="IN">Kas masuk</option><option value="OUT">Kas keluar</option></select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold">Kategori
          <select name="category" defaultValue={filters.category} className={field}><option value="">Semua kategori</option>{Object.entries(publicCashCategories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
        </label>
        <button type="submit" className={button}>Terapkan</button>
      </form>
      {data.journal.total>PUBLIC_CSV_LIMIT && <p className="text-sm text-ink-muted">Persempit filter untuk mengunduh CSV.</p>}
      {!data.journal.total?<p className="rounded-lg border border-dashed border-border p-4 text-sm text-ink-muted">Tidak ada jurnal untuk pilihan ini.</p>:
        <ul className="divide-y divide-border" aria-label="Entri jurnal">
          {data.journal.rows.map(row=><li key={row.reference} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 py-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,auto)] sm:gap-3">
            <span className={'grid size-9 place-items-center rounded-lg '+(row.direction==='IN'?'bg-primary-50 text-primary-800':'bg-rose-50 text-rose-800')}>
              {row.direction==='IN'?<ArrowDownLeft className="size-4" aria-hidden="true" />:<ArrowUpRight className="size-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0"><p className="text-sm font-semibold [overflow-wrap:anywhere]">{row.label}</p>
              <p className="text-xs text-ink-muted [overflow-wrap:anywhere]">{financeDate(row.date)} · {publicCashCategories[row.category]} · {row.reference}</p></div>
            <div className="col-start-2 min-w-0 sm:col-start-3 sm:text-right"><p className={'text-sm font-bold '+number}>{row.direction==='IN'?'+':'−'}{cashRupiah(row.amount)}</p>
              <p className={'text-xs text-ink-muted '+number}>Saldo buku {cashRupiah(row.balance)}</p></div>
          </li>)}
        </ul>}
      {data.journal.total>PUBLIC_JOURNAL_PAGE_SIZE && <nav aria-label="Halaman jurnal publik" className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
        <span>{(data.journal.page-1)*PUBLIC_JOURNAL_PAGE_SIZE+1}–{Math.min(data.journal.page*PUBLIC_JOURNAL_PAGE_SIZE,data.journal.total)} dari {data.journal.total}</span>
        <div className="flex items-center gap-1">
          {data.journal.page>1 && <a className="icon-button" aria-label="Halaman sebelumnya" href={path('public_ledger',{...journalParams,page:data.journal.page-1})}><ChevronLeft className="size-5" aria-hidden="true" /></a>}
          {data.journal.page*PUBLIC_JOURNAL_PAGE_SIZE<data.journal.total && <a className="icon-button" aria-label="Halaman berikutnya" href={path('public_ledger',{...journalParams,page:data.journal.page+1})}><ChevronRight className="size-5" aria-hidden="true" /></a>}
        </div>
      </nav>}
    </section>}

    {tab==='dues_breakdown' && <section className="grid min-w-0 gap-4" aria-label="Rekap iuran">
      <div className={panel+' grid gap-3'}>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-xl font-bold tracking-tight">Rekap iuran</h2><p className="text-sm text-ink-muted">Status tagihan {data.periodLabel} saat laporan dibuka.</p></div>
          <a href={path('citizen_confirm')} className={primary}>Cek iuran saya <ArrowRight className="size-4" aria-hidden="true" /></a>
        </div>
        <DuesAmounts dues={dues} />
        <dl className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Ditagih',dues.billed,'bg-sky-50 text-sky-900'],['Lunas',dues.paid,'bg-primary-50 text-primary-900'],
            ['Belum lunas',notPaid,'bg-amber-50 text-amber-900'],['Belum terbit',unbilled,'bg-slate-100 text-slate-800'],
          ].map(([label,value,tone])=><div key={label} className={'rounded-xl p-3 '+tone}><dt className="text-xs font-semibold">{label}</dt><dd className="text-xl font-bold tabular-nums">{value}</dd></div>)}
        </dl>
      </div>
      <div className={panel}>
        <h3 className="text-lg font-bold">Tagihan per bulan</h3>
        <ul className="mt-2 divide-y divide-border">
          {[...data.dues].reverse().map(item=><li key={item.month} className="grid min-w-0 gap-1.5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
            <a className={link} href={publicReportPath({year:data.period.year,month:item.month},'dues_breakdown')}>{billingMonthLabel(data.period.year,item.month)}</a>
            <p className="text-ink-muted">{item.billed?item.paid+' dari '+item.billed+' rumah lunas':'Belum terbit'}</p>
            <p className={'font-semibold '+number}>{item.billed?'Sisa '+cashRupiah(item.remaining):'—'}</p>
          </li>)}
        </ul>
      </div>
    </section>}

    {tab==='citizen_confirm' && <section className="grid min-w-0 gap-4 lg:grid-cols-2" aria-label="Cek iuran saya">
      <div className={panel+' grid content-start gap-3'}>
        <h2 className="text-xl font-bold tracking-tight">Cek iuran saya</h2>
        <p className="text-sm text-ink-muted">Masuk untuk melihat tagihan {data.periodLabel}, konfirmasi transfer, atau membuka kuitansi rumah Anda.</p>
        <a href={wargaDues} className={primary+' w-fit'}>Buka portal warga <ArrowRight className="size-4" aria-hidden="true" /></a>
      </div>
      <div className={panel+' grid content-start gap-3'}>
        <h2 className="text-xl font-bold tracking-tight">Rekening iuran</h2>
        {data.bank?<><p className="text-sm font-semibold [overflow-wrap:anywhere]">{data.bank.name}{data.bank.holder?' · '+data.bank.holder:''}</p>
          <p className={'text-lg font-bold '+number}>{data.bank.number}</p>
          <button className={button+' w-fit'} type="button" onClick={()=>void copy(data.bank!.number,'account')}><Copy className="size-4" aria-hidden="true" />{copied==='account'?'Disalin':'Salin rekening'}</button>
          {!share && feedback && <p role="status" className="text-sm text-ink-muted">{feedback}</p>}</>:<p className="text-sm text-ink-muted">Rekening iuran belum ditampilkan. Periksa petunjuk pada tagihan Anda.</p>}
      </div>
    </section>}

    {tab==='audit_faq' && <section className={panel} aria-label="Bantuan laporan">
      <h2 className="text-xl font-bold tracking-tight">Bantuan laporan</h2>
      <div className="mt-2 divide-y divide-border">
        <details className="py-2"><summary className="min-h-11 cursor-pointer py-2.5 font-semibold">Dari mana angka saldo berasal?</summary>
          <p className="pb-2 text-sm text-ink-muted">Saldo menurut buku kas berasal dari saldo rekening yang tersimpan, disesuaikan dengan jurnal hingga akhir bulan laporan. Kas masuk dan keluar memperhitungkan pembalikan; mutasi antar rekening tidak menambah kas lingkungan. Pengeluaran yang belum dicatat tidak mengurangi saldo buku. Untuk memastikan saldo riil, pengurus perlu mencatat semua pengeluaran dan mencocokkan saldo buku dengan rekening koran serta kas fisik.</p>
          <a href={path('public_ledger')} className={link}>Buka jurnal publik <ArrowRight className="size-4" aria-hidden="true" /></a></details>
        <details className="py-2"><summary className="min-h-11 cursor-pointer py-2.5 font-semibold">Mengapa iuran berbeda dari kas masuk?</summary>
          <p className="pb-2 text-sm text-ink-muted">Kas masuk mencakup iuran dan penerimaan lain. Rekap iuran mengikuti bulan tagihan, sedangkan arus kas mengikuti tanggal transaksi.</p></details>
        <details className="py-2"><summary className="min-h-11 cursor-pointer py-2.5 font-semibold">Bagaimana bila pembayaran belum tercatat?</summary>
          <p className="text-sm text-ink-muted">Lihat status verifikasi di akun rumah Anda. Jika sudah diverifikasi dan masih ada selisih, hubungi pengurus lewat aduan warga.</p>
          <div className="flex flex-wrap gap-x-4"><a href={wargaDues} className={link}>Cek iuran saya <ArrowRight className="size-4" aria-hidden="true" /></a><a href={help} className={link}>Buka aduan <ArrowRight className="size-4" aria-hidden="true" /></a></div></details>
        <details id="jadwal-jaga" className="py-2"><summary className="min-h-11 cursor-pointer py-2.5 font-semibold">Jadwal jaga</summary>
          {data.duty?<><p className="text-sm text-ink-muted">Giliran {data.duty.current} sedang bertugas · serah terima {data.duty.handover} WIB.</p>
            <ul className="my-2 grid gap-1 text-sm">{data.duty.upcoming.map(item=><li key={item.date}>{financeDate(item.date)} · Giliran {item.turn}</li>)}</ul></>:
            <p className="text-sm text-ink-muted">Jadwal jaga belum tersedia di laporan publik.</p>}
          <a href={help} className={link}>Layanan warga <ArrowRight className="size-4" aria-hidden="true" /></a></details>
      </div>
    </section>}

    <ModalDialog open={share} onClose={()=>setShare(false)} label="Bagikan laporan" className="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="grid gap-3 p-4 sm:p-5">
        <h2 className="text-xl font-bold">Bagikan laporan</h2>
        <p className="text-sm text-ink-muted">{data.periodLabel}</p>
        {data.qrCode && <img src={data.qrCode} width={180} height={180} alt={'Kode QR laporan '+data.periodLabel} className="max-w-full rounded-lg" />}
        <label className="grid min-w-0 gap-1 text-sm font-semibold">Tautan laporan<input className={field} value={data.shareUrl} readOnly onFocus={e=>e.currentTarget.select()} /></label>
        <div className="flex flex-wrap gap-2">
          <button className={button} type="button" onClick={()=>void copy(data.shareUrl,'share')}><Copy className="size-4" aria-hidden="true" />{copied==='share'?'Disalin':'Salin tautan'}</button>
          <a className={primary} href={shareWa} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" /></a>
          <button className={button} type="button" onClick={()=>setShare(false)}>Tutup</button>
        </div>
        {feedback && <p role="status" className="text-sm text-ink-muted">{feedback}</p>}
      </div>
    </ModalDialog>
  </div>;
}
