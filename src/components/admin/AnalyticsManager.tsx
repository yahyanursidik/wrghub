/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { Archive, ArrowDownToLine, ArrowUpRight, BarChart3, ClipboardList, Clock3, Droplets, ShieldCheck, Users } from 'lucide-react';
import { downloadFinanceCsv, financeDate, financePath } from '../../lib/billing-data';
import { cashRupiah, financeMonth } from '../../lib/cash-data';
import { ARCHIVE_PAGE_SIZE, decimalText, percentText, reportRanges, reportTargets, roundCash, UNCATEGORIZED, type AnalyticsFilters, type AnalyticsSnapshot, type AnalyticsTab, type AnalyticsWorkspace,
  type CashTrend, type ServiceReport } from '../../lib/planning-data';
import { FinanceDialog, FinanceEmpty, FinanceHeader, FinanceSummary, FinanceTabLinks, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';

const menus=[
  {id:'financial_trends',label:'Tren kas',icon:BarChart3},{id:'block_compliance',label:'Iuran per blok',icon:Users},
  {id:'utility_efficiency',label:'Utilitas',icon:Droplets},{id:'security_sla',label:'Keamanan & aduan',icon:ShieldCheck},
] as const;
const link='inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline';
const field=financeField+' min-w-0';
const paramsFor=(filters:AnalyticsFilters)=>({tab:filters.tab,month:filters.month,range:String(filters.range),target:String(filters.target)});
const analyticsHref=(filters:AnalyticsFilters,tab:AnalyticsTab=filters.tab,month=filters.month)=>financePath('/admin/analytics',{...paramsFor(filters),tab,month});
const cashHref=(month:string)=>financePath('/admin/ledger',{tab:'financial_reports',month});
const publicHref=(month:string)=>'/transparency/'+month.replace('-','/');
const unitText=(value:number|null,unit:string)=>value===null?'—':decimalText(value)+' '+unit;

interface Props {
  data:AnalyticsWorkspace;canWrite:boolean;todayMonth:string;
  canOpenUtilities:boolean;canOpenComplaints:boolean;canOpenPatrol:boolean;
}
type Dialog={type:'capture'|'summary'} | {type:'archive';item:AnalyticsSnapshot};

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}
function RateBar({value,label}:{value:number|null;label:string}) {
  if(value===null) return <span className="text-xs text-ink-muted">Belum ada pembanding</span>;
  return <div className="h-2 overflow-hidden rounded-full bg-primary-50" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div className="h-full rounded-full bg-primary-600" style={{width:value+'%'}} />
  </div>;
}
function InfoRows({rows}:{rows:[string,ReactNode][]}) {
  return <dl className="divide-y divide-border text-sm">
    {rows.map(([label,value])=><div key={label} className="flex min-h-11 min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
      <dt className="text-ink-muted">{label}</dt><dd className="min-w-0 font-semibold tabular-nums [overflow-wrap:anywhere]">{value}</dd>
    </div>)}
  </dl>;
}

function TrendChart({trends,filters}:{trends:CashTrend[];filters:AnalyticsFilters}) {
  const max=Math.max(1,...trends.flatMap(row=>[Math.abs(row.income),Math.abs(row.outgoing)]));
  return <section className="workspace-panel grid gap-3" aria-label="Grafik arus kas">
    <header className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 className="!mb-0">Arus kas bulanan</h2><p className="mt-1 text-sm text-ink-muted">Sesudah pembalikan, tanpa mutasi internal.</p></div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary-700" aria-hidden="true" />Pemasukan</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-600" aria-hidden="true" />Pengeluaran</span>
      </div>
    </header>
    {!trends.some(row=>row.count) ? <FinanceEmpty>Belum ada jurnal dalam rentang ini.</FinanceEmpty> :
      <ul className="divide-y divide-border">{[...trends].reverse().map(row=><li key={row.month} data-report-month={row.month}
        className="grid min-w-0 gap-1 py-2.5 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-center md:gap-4">
        <div className="flex flex-wrap items-center gap-x-2"><a href={analyticsHref(filters,'financial_trends',row.month)} className={link} aria-current={row.month===filters.month?'date':undefined}>{financeMonth(row.month)}</a>
          {row.month===filters.month && <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-semibold text-primary-900">Dipilih</span>}</div>
        {row.count ? <div className="grid min-w-0 gap-1">
          <div className="flex min-w-0 items-center justify-between gap-2 text-xs"><span className="text-ink-muted">Masuk</span><strong className="tabular-nums text-primary-900">{cashRupiah(row.income)}</strong></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true"><div className="h-full rounded-full bg-primary-700" style={{width:Math.abs(row.income)/max*100+'%'}} /></div>
          <div className="flex min-w-0 items-center justify-between gap-2 text-xs"><span className="text-ink-muted">Keluar</span><strong className="tabular-nums text-rose-900">{cashRupiah(row.outgoing)}</strong></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true"><div className="h-full rounded-full bg-rose-600" style={{width:Math.abs(row.outgoing)/max*100+'%'}} /></div>
        </div> : <p className="text-sm text-ink-muted">Belum ada jurnal</p>}
        {row.count>0 && <a href={cashHref(row.month)} className={link}>Buku Kas <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
      </li>)}</ul>}
  </section>;
}

function ServicePanel({title,stats,target}:{title:string;stats:ServiceReport;target:number}) {
  return <section className="workspace-panel grid gap-3">
    <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="!mb-0">{title}</h2>
      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">Target {target} jam</span></header>
    <InfoRows rows={[
      ['Aduan masuk',stats.total],['Masih terbuka',stats.open],['Selesai atau ditutup',stats.done],
      ['Rata-rata penyelesaian',unitText(stats.avgHours,'jam')],['Sesuai target',stats.targetRate===null?'—':stats.onTime+'/'+stats.measured+' ('+percentText(stats.targetRate)+')'],
    ]} />
    <RateBar value={stats.targetRate} label="Persentase sesuai target" />
    <p className="text-xs text-ink-muted">{stats.measured} aduan selesai dengan waktu penyelesaian yang dapat dihitung.</p>
  </section>;
}

export function AnalyticsManager({data,canWrite,todayMonth,canOpenUtilities,canOpenComplaints,canOpenPatrol}:Props) {
  const {filters,trends,cash,compliance,utilities,security,budget}=data;
  const {month,tab,range,target,archivePage}=filters;
  const [archives,setArchives]=useState(data.snapshots);
  const [moreArchives,setMoreArchives]=useState(data.moreSnapshots);
  const [dialog,setDialog]=useState<Dialog|null>(null);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const open=(value:Dialog)=>{setError('');setNotice('');setDialog(value);};
  const csvHref='/api/analytics/export?'+new URLSearchParams({...paramsFor(filters),format:'csv'});
  const jsonHref='/api/analytics/export?'+new URLSearchParams(paramsFor(filters));
  const archiveHref=(page:number)=>financePath('/admin/analytics',{...paramsFor(filters),archivePage:page>1?String(page):undefined})+'#arsip-laporan';
  const summary=dialog?.type==='archive'?dialog.item:{cash,compliance,utilities,security,budget,target};
  const title=dialog?.type==='capture'?'Simpan arsip laporan':dialog?.type==='archive'?'Arsip laporan':'Ringkasan laporan';
  const postedMonth=month<=todayMonth;
  const currentMonthActivities=cash.count>0 || compliance.issued>0 || security.complaints.total>0 || security.patrols>0 || budget.planned>0;

  async function capture(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy || !canWrite) return;
    const fields=new FormData(event.currentTarget);
    setBusy(true);setError('');
    try {
      const saved=await financePost<AnalyticsSnapshot>('/api/analytics/snapshot',{month,target,notes:String(fields.get('notes') || '')});
      if(archivePage!==1){window.location.assign(archiveHref(1));return;}
      if(archives.length>=ARCHIVE_PAGE_SIZE) setMoreArchives(true);
      setArchives(items=>[saved,...items].slice(0,ARCHIVE_PAGE_SIZE));setDialog(null);setNotice('Arsip laporan tersimpan.');
    } catch(failure){setError(failure instanceof Error?failure.message:'Arsip belum tersimpan.');}
    finally{setBusy(false);}
  }
  function exportSnapshot(item:AnalyticsSnapshot) {
    downloadFinanceCsv('arsip-'+item.month+'-'+item.id.slice(-8)+'.csv',[
      ['Periode','Tanggal arsip','Disimpan oleh','Catatan'],[item.month,item.at,item.by,item.notes],[],
       ['Indikator','Nilai'],['Saldo akhir menurut buku kas (Rp)',item.cash.closing],['Pemasukan bersih (Rp)',item.cash.income],['Pengeluaran bersih (Rp)',item.cash.outgoing],
      ['Pagu (Rp)',item.budget.planned],['Realisasi (Rp)',item.budget.actual],['Rumah ditagih',item.compliance.issued],['Rumah lunas',item.compliance.paid],
      ['Kepatuhan (%)',item.compliance.rate ?? ''],['Selisih meter saat diarsipkan (m³)',item.utilities.waterUsage ?? ''],
      ['Aduan masuk',item.security.complaints.total],['Rata-rata penyelesaian (jam)',item.security.complaints.avgHours ?? ''],['Target (jam)',item.target],
      ['Aduan sesuai target',item.security.complaints.onTime],['Aduan terukur',item.security.complaints.measured],['Patroli tercatat',item.security.patrols],
    ]);
  }

  return <div className="workspace">
    <FinanceHeader area="analytics" title="Laporan & tren" month={month}>
      <a className={financeButton} data-astro-reload href={csvHref}><ArrowDownToLine className="size-4" aria-hidden="true" />CSV</a>
      <button type="button" className={financeButton} onClick={()=>open({type:'summary'})}><ClipboardList className="size-4" aria-hidden="true" />Ringkasan</button>
      {canWrite && postedMonth && <button type="button" className={financePrimary} onClick={()=>open({type:'capture'})}><Archive className="size-4" aria-hidden="true" />Simpan arsip</button>}
    </FinanceHeader>
    <FinanceTabLinks tabs={menus.map(item=>({...item,href:analyticsHref(filters,item.id)}))} active={tab} label="Menu laporan" />
    <form action="/admin/analytics" className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="tab" value={tab} />
      <Field label="Periode"><input className={field} type="month" name="month" min="1900-01" max={month>todayMonth?month:todayMonth} defaultValue={month} required /></Field>
      {tab==='financial_trends' ? <Field label="Rentang"><select className={field} name="range" defaultValue={range}>{reportRanges.map(item=><option key={item} value={item}>{item} bulan</option>)}</select></Field> :
        <input type="hidden" name="range" value={range} />}
      {tab==='security_sla' ? <Field label="Target penyelesaian"><select className={field} name="target" defaultValue={target}>{reportTargets.map(item=><option key={item} value={item}>{item} jam</option>)}</select></Field> :
        <input type="hidden" name="target" value={target} />}
      <button className={financeButton} type="submit">Tampilkan</button>
    </form>
    {notice && <p role="status" className="rounded-lg bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">{notice}</p>}
    {tab==='financial_trends' && <section className="grid min-w-0 gap-4" aria-label="Tren kas">
      <FinanceSummary items={[
         {label:'Saldo akhir buku kas',value:cashRupiah(cash.closing),detail:financeMonth(month),tone:'mint'},
        {label:'Pemasukan bersih',value:cashRupiah(cash.income),detail:cash.count+' jurnal periode ini',tone:'sky'},
        {label:'Pengeluaran bersih',value:cashRupiah(cash.outgoing),detail:'Setelah pembatalan',tone:'rose'},
       ]} />
       <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Angka kas mengikuti transaksi yang tercatat, bukan saldo bank/kas terverifikasi. Pastikan pengeluaran bulanan lengkap sebelum memakai laporan ini.</p>
      <TrendChart trends={trends} filters={filters} />
      <section className="workspace-panel grid gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="!mb-0">Anggaran periode ini</h2>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">{budget.state==='APPROVED'?'Pagu disahkan':'Pagu draf'}</span></header>
        <InfoRows rows={[[ 'Pagu',cashRupiah(budget.planned)],['Realisasi pengeluaran',cashRupiah(budget.actual)],['Arus kas bersih',cashRupiah(roundCash(cash.income-cash.outgoing))]]} />
        <div className="flex flex-wrap gap-2">
          <a className={financeButton} href={financePath('/admin/budget',{month})}>Lihat anggaran</a>
          <a className={financeButton} href={cashHref(month)}>{canWrite?'Laporan kas & WA':'Laporan kas'}</a>
          <a className={financeButton} href={publicHref(month)}>Laporan warga</a>
        </div>
      </section>
    </section>}
    {tab==='block_compliance' && <section className="grid min-w-0 gap-4" aria-label="Iuran per blok">
      <FinanceSummary items={[
        {label:'Kepatuhan iuran',value:percentText(compliance.rate),detail:compliance.issued?compliance.paid+' dari '+compliance.issued+' rumah ditagih':'Belum ada tagihan aktif',tone:'mint'},
        {label:'Iuran terbayar',value:cashRupiah(compliance.received),detail:'Termasuk pembayaran sebagian',tone:'sky'},
        {label:'Sisa tagihan',value:cashRupiah(compliance.remaining),detail:compliance.pending+' rumah menunggu verifikasi',tone:'amber'},
      ]} />
      <section className="workspace-panel grid gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="!mb-0">Status per blok</h2>
          <p className="mt-1 text-sm text-ink-muted">Hunian terkini: {compliance.houses} rumah aktif · {compliance.occupied} dihuni</p></div>
          {compliance.periodId && <a className={financeButton} href={financePath('/admin/billing',{period:compliance.periodId})}>Tagihan periode ini</a>}</header>
        {!compliance.blocks.length ? <FinanceEmpty>Belum ada rumah aktif.</FinanceEmpty> : <ul className="divide-y divide-border">
          {compliance.blocks.map(item=><li key={item.block} className="grid min-w-0 gap-2 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-center md:gap-4">
            <div className="min-w-0"><p className="font-bold [overflow-wrap:anywhere]">{item.block}</p>
              <p className="text-sm text-ink-muted">{item.houses} rumah · {item.occupied} dihuni</p></div>
            <div className="grid min-w-0 gap-1">
              <p className="text-sm"><strong>{item.paid} lunas</strong> · {item.issued-item.paid} belum lunas · {item.houses-item.issued} tanpa tagihan aktif</p>
              <RateBar value={item.rate} label={'Kepatuhan '+item.block} />
              <p className="text-xs text-ink-muted">{item.pending>0?item.pending+' menunggu cek · ':''}Sisa {cashRupiah(item.remaining)}</p>
            </div>
            {compliance.periodId && item.issued>0 && <a className={link} href={financePath('/admin/billing',{period:compliance.periodId,block:item.block})}>Lihat tagihan <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
          </li>)}</ul>}
      </section>
    </section>}
    {tab==='utility_efficiency' && <section className="grid min-w-0 gap-4" aria-label="Utilitas">
      <div className="grid items-start gap-3 lg:grid-cols-2">
        <section className="workspace-panel grid gap-3">
          <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="!mb-0">Meter rumah terkini</h2>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">{utilities.records}/{utilities.houses} rumah tercatat</span></header>
          <div className="rounded-xl bg-sky-50 px-4 py-3 text-sky-900">
            <p className="text-sm font-semibold">Selisih bacaan air terakhir</p><p className="mt-1 text-2xl font-bold tabular-nums">{unitText(utilities.waterUsage,'m³')}</p>
            <p className="mt-1 text-xs">{utilities.usableReadings} pasangan bacaan valid</p>
          </div>
          <InfoRows rows={[[ 'PLN tercatat',utilities.electricity],['Meter air tercatat',utilities.waterMeters],['Bacaan perlu dicek',utilities.invalidReadings],
            ['Panel surya',utilities.solar],['Biopori',utilities.biopori]]} />
          {canOpenUtilities && <a className={link+' justify-self-start'} href="/admin/properties?tab=utilities">Buka utilitas rumah <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
        </section>
        <section className="workspace-panel grid gap-3">
          <div><h2 className="!mb-0">Biaya utilitas · {financeMonth(month)}</h2><p className="mt-1 text-sm text-ink-muted">Jurnal dari kategori listrik, air, dan utilitas.</p></div>
          {utilities.costs.length ? <ul className="divide-y divide-border">{utilities.costs.map(item=><li key={item.id} className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 py-1">
            <a className={link} href={financePath('/admin/ledger',{month,source:'expense',category:item.id || UNCATEGORIZED})}>{item.name}</a>
            <strong className="text-sm tabular-nums">{cashRupiah(item.amount)}</strong></li>)}</ul> :
            <FinanceEmpty>Belum ada jurnal dengan kategori utilitas pada periode ini.</FinanceEmpty>}
          <a className={link+' justify-self-start'} href={financePath('/admin/expenses',{month})}>Buka pengeluaran <ArrowUpRight className="size-3" aria-hidden="true" /></a>
        </section>
      </div>
    </section>}
    {tab==='security_sla' && <section className="grid min-w-0 gap-4" aria-label="Keamanan dan aduan">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">Aduan yang masuk pada {financeMonth(month)}.</p>
        <div className="flex flex-wrap gap-2">
          {canOpenComplaints && <a className={financeButton} href="/admin/complaints">Buka aduan</a>}
          {canOpenPatrol && <a className={financeButton} href={'/admin/security-gate?'+new URLSearchParams({tab:'patrol',month})}>Buka patroli</a>}
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2"><ServicePanel title="Seluruh aduan" stats={security.complaints} target={target} />
        <ServicePanel title="Aduan keamanan" stats={security.security} target={target} /></div>
      <section className="workspace-panel grid gap-3"><header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="!mb-0">Kategori aduan</h2><span className="rounded-full bg-primary-50 px-2.5 py-1 text-sm font-semibold text-primary-900">{security.patrols} patroli tercatat</span></header>
        {!security.categories.length ? <FinanceEmpty>Belum ada aduan pada periode ini.</FinanceEmpty> : <InfoRows rows={security.categories.map(item=>
          [item.name.toLowerCase().replaceAll('_',' '),<span key={item.name} className="capitalize">{item.total} masuk · {item.open} terbuka</span>])} />}
      </section>
    </section>}
    <section className="workspace-panel grid gap-3" id="arsip-laporan" aria-label="Arsip laporan">
      <header className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="!mb-0">Arsip laporan</h2>
        <p className="mt-1 text-sm text-ink-muted">{financeMonth(month)} · Angka saat arsip dibuat</p></div></header>
      {!archives.length ? <FinanceEmpty>Belum ada arsip untuk periode ini.</FinanceEmpty> : <ul className="divide-y divide-border">{archives.map(item=><li key={item.id}
        className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2" data-snapshot-id={item.id}>
        <div className="min-w-0"><p className="text-sm font-semibold">{financeDate(item.at)} · {item.by}</p>
          {item.notes && <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{item.notes}</p>}</div>
        <div className="flex flex-wrap gap-2"><button type="button" className={link} onClick={()=>open({type:'archive',item})}>Lihat arsip</button>
          <button type="button" className={link} onClick={()=>exportSnapshot(item)}>CSV</button></div>
      </li>)}</ul>}
      {(archivePage>1 || moreArchives) && <nav aria-label="Halaman arsip" className="flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
        <span>Halaman {archivePage}</span>{archivePage>1 && <a className={link} href={archiveHref(archivePage-1)}>Sebelumnya</a>}
        {moreArchives && <a className={link} href={archiveHref(archivePage+1)}>Berikutnya</a>}
      </nav>}
    </section>
    {dialog && <FinanceDialog open title={title} close={()=>setDialog(null)} busy={busy} error={error}>
      {dialog.type==='capture' ? <form className="grid gap-3" onSubmit={capture}>
        <p className="text-sm">{financeMonth(month)} · Target aduan {target} jam. Angka dihitung ulang saat disimpan.</p>
        {!currentMonthActivities && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Periode ini belum memiliki aktivitas yang tercatat.</p>}
        <Field label="Catatan (opsional)"><textarea name="notes" className={field} rows={3} maxLength={500} /></Field>
        <button type="submit" className={financePrimary+' justify-self-start'} disabled={busy}>{busy?'Menyimpan…':'Simpan laporan'}</button>
      </form> : <>
        <p className="text-sm text-ink-muted">{financeMonth(month)}{dialog.type==='archive'?' · Disimpan '+financeDate(dialog.item.at)+' oleh '+dialog.item.by:''}</p>
        <InfoRows rows={[
          ['Saldo akhir',cashRupiah(summary.cash.closing)],['Pengeluaran bersih',cashRupiah(summary.cash.outgoing)],
          ['Pagu',cashRupiah(summary.budget.planned)],['Realisasi pengeluaran',cashRupiah(summary.budget.actual)],
          ['Rumah lunas',summary.compliance.paid+' / '+summary.compliance.issued],['Air · bacaan terakhir',unitText(summary.utilities.waterUsage,'m³')],
          ['Rata-rata waktu penyelesaian',unitText(summary.security.complaints.avgHours,'jam')],['Patroli tercatat',summary.security.patrols],
        ]} />
        {dialog.type==='archive' ? <>
          {dialog.item.notes && <p className="rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">{dialog.item.notes}</p>}
          <button type="button" className={financeButton+' justify-self-start'} onClick={()=>exportSnapshot(dialog.item)}>Unduh arsip CSV</button>
        </> : <div className="flex flex-wrap gap-2">
          <a className={financeButton} href={csvHref} data-astro-reload>Unduh CSV</a>
          <a className={financeButton} href={jsonHref} data-astro-reload download={'laporan-'+month+'.json'}>Unduh JSON</a>
        </div>}
      </>}
    </FinanceDialog>}
  </div>;
}
