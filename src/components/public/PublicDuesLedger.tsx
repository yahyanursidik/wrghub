/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useState } from 'react';
import { Download, ExternalLink, MessageCircle } from 'lucide-react';
import { downloadFinanceCsv } from '../../lib/billing-data';
import { formatRupiah } from '../../lib/format';
import { FinanceEmpty, FinancePager, FinanceStatus, FinanceSummary, financeButton, financeField } from '../admin/FinanceWorkspace';

interface Props {
  periods: {id:string;name:string}[];
  selectedId: string;
  rows: {code:string;total:number;collected:number;remaining:number;status:string}[];
  bank: {bankName:string;accountNumber:string;accountHolder:string;qrisNmid?:string} | null;
}

const pageSize=16;

export function PublicDuesLedger({periods,selectedId,rows,bank}:Props) {
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('');
  const [page,setPage]=useState(1);
  const period=periods.find(item=>item.id===selectedId);
  const billed=rows.reduce((sum,item)=>sum+item.total,0);
  const collected=rows.reduce((sum,item)=>sum+item.collected,0);
  const remaining=rows.reduce((sum,item)=>sum+item.remaining,0);
  const filtered=rows.filter(item=>item.code.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!filter || (filter==='outstanding' ? item.remaining>0 : item.status===filter)));
  const safePage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)));
  const shown=filtered.slice((safePage-1)*pageSize,safePage*pageSize);
  const wa=['Rekap iuran WargaHub · '+(period?.name || ''),'Total tagihan '+formatRupiah(billed),
    'Sudah diterima '+formatRupiah(collected),'Sisa '+formatRupiah(remaining)].join('\n');
  return <section aria-label="Halaman rekap" className="workspace mx-auto max-w-5xl px-4 py-6 sm:px-6">
    <header className="workspace-heading">
      <h1>Rekap iuran</h1>
      <div className="flex flex-wrap gap-2">
        <a className={financeButton} href="/warga">Portal warga <ExternalLink className="size-4" aria-hidden="true" /></a>
        <a className={financeButton} href="/kuitansi">Periksa kuitansi</a>
      </div>
    </header>
    <form method="GET" action="/rekap-iuran" className="flex min-w-0 flex-wrap items-end gap-2">
      <label className="block w-full max-w-xs text-sm font-semibold">Periode
        <select name="period" defaultValue={selectedId} disabled={!periods.length} className={financeField}>
          {!periods.length && <option value="">Belum ada periode</option>}
          {periods.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <button type="submit" className={financeButton} disabled={!periods.length}>Terapkan</button>
    </form>
    {!period ? <FinanceEmpty>Belum ada periode iuran yang diterbitkan.</FinanceEmpty> : <>
      <FinanceSummary items={[
        {label:'Total tagihan',value:formatRupiah(billed),tone:'sky'},
        {label:'Sudah diterima',value:formatRupiah(collected),tone:'mint'},
        {label:'Sisa tagihan',value:formatRupiah(remaining),tone:'amber'},
      ]} />
      <div className="grid min-w-0 gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="min-w-0 text-sm font-semibold">Cari rumah<input type="search" className={financeField} value={search}
          onChange={event=>{setSearch(event.target.value);setPage(1);}} /></label>
        <label className="min-w-0 text-sm font-semibold">Status<select className={financeField} value={filter} onChange={event=>{setFilter(event.target.value);setPage(1);}}>
          <option value="">Semua status</option><option value="PAID">Lunas</option><option value="outstanding">Belum lunas</option><option value="UNBILLED">Belum terbit</option>
        </select></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={financeButton} disabled={!filtered.length} onClick={()=>downloadFinanceCsv('rekap-iuran-'+selectedId+'.csv',[
            ['Rumah','Total','Diterima','Sisa','Status'],...filtered.map(item=>[item.code,item.total,item.collected,item.remaining,item.status]),
          ])}><Download className="size-4" aria-hidden="true" />CSV</button>
          <a href={'https://wa.me/?text='+encodeURIComponent(wa)} target="_blank" rel="noopener noreferrer" className={financeButton}>
            <MessageCircle className="size-4" aria-hidden="true" />Bagikan
          </a>
        </div>
      </div>
      {shown.length ? <div className="rounded-xl border border-border bg-surface">
        <ul className="divide-y divide-border">
          {shown.map((item,index)=><li key={item.code+'-'+index} className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0"><p className="font-semibold [overflow-wrap:anywhere]">{item.code}</p>
              {item.remaining>0 && <p className="text-sm tabular-nums text-ink-muted">Sisa {formatRupiah(item.remaining)}</p>}
            </div>
            {item.status==='UNBILLED' ? <span className="whitespace-nowrap rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink-muted">Belum terbit</span> : <FinanceStatus value={item.status} />}
          </li>)}
        </ul>
        <FinancePager total={filtered.length} page={safePage} pageSize={pageSize} onChange={setPage} label="rekap" />
      </div> : <FinanceEmpty>Tidak ada rumah yang cocok.</FinanceEmpty>}
    </>}
    {bank?.accountNumber && <section className="workspace-panel">
      <h2>Rekening penerima iuran</h2>
      <p className="text-sm [overflow-wrap:anywhere]">{[bank.bankName,bank.accountNumber,bank.accountHolder].filter(Boolean).join(' · ')}</p>
    </section>}
  </section>;
}
