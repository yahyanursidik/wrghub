/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeftRight, ArrowUpRight, ClipboardList, Copy, Globe2, PencilLine, Plus, ShieldCheck, Wallet } from 'lucide-react';
import { downloadFinanceCsv, financeDate, financePath } from '../../lib/billing-data';
import { cashRupiah, financeMonth } from '../../lib/cash-data';
import { budgetRows, percentText, rate, roundCash, type BudgetAllocation, type BudgetPlan, type BudgetTab, type BudgetWorkspace, type ReserveFund } from '../../lib/planning-data';
import type { FinanceAccount } from '../../services/finance.service';
import { FinanceDialog, FinanceEmpty, FinanceHeader, FinanceSummary, FinanceTabLinks, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';

const menus=[
  {id:'budget_matrix',label:'Pagu & realisasi',icon:ClipboardList},{id:'sinking_fund',label:'Dana cadangan',icon:Wallet},
  {id:'public_transparency',label:'Transparansi',icon:Globe2},{id:'manual_form',label:'Susun pagu',icon:PencilLine},
] as const;
const link='inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline';
const field=financeField+' min-w-0';
const budgetHref=(month:string,tab:BudgetTab,extra:Record<string,string|undefined>={})=>financePath('/admin/budget',{tab,month,...extra});
const journalHref=(month:string,category:string)=>financePath('/admin/ledger',{month,source:'expense',category});
const str=(form:FormData,name:string)=>String(form.get(name) || '').trim();
const amount=(form:FormData,name:string)=>Number(str(form,name));
type Modal={type:'edit'|'archive';allocation:BudgetAllocation} | {type:'approve'|'reopen'} |
  {type:'fund';fund?:ReserveFund} | {type:'archiveFund';fund:ReserveFund} |
  {type:'move';fund:ReserveFund;direction:'DEPOSIT'|'WITHDRAW';requestId:string};
interface Props {
  budget:BudgetWorkspace;funds:ReserveFund[];accounts:FinanceAccount[];tab:BudgetTab;
  category:string;fundFocus:string;moved:string;canWrite:boolean;canApprove:boolean;today:string;
}

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}
function Badge({children,tone='mint'}:{children:ReactNode;tone?:'mint'|'amber'|'rose'|'slate'}) {
  const colors={mint:'bg-primary-50 text-primary-900',amber:'bg-amber-50 text-amber-900',rose:'bg-rose-50 text-rose-900',slate:'bg-slate-100 text-slate-800'};
  return <span className={colors[tone]+' inline-flex w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold'}>{children}</span>;
}
function Meter({used,limit}:{used:number;limit:number}) {
  const percent=rate(used,limit) || 0;
  return <div className="h-2 overflow-hidden rounded-full bg-primary-50" role="meter" aria-label="Porsi terhadap target" aria-valuemin={0} aria-valuemax={100}
    aria-valuenow={Math.max(0,Math.min(100,percent))} aria-valuetext={percentText(percent)}>
    <div className={'h-full rounded-full '+(percent>100?'bg-rose-600':percent>=85?'bg-amber-500':'bg-primary-600')}
      style={{width:Math.max(0,Math.min(100,percent))+'%'}} />
  </div>;
}

export function BudgetManager({budget,funds,accounts,tab,category,fundFocus,moved,canWrite,canApprove,today}:Props) {
  const {month,categories,annual,billingPeriodId,cash}=budget;
  const [plan,setPlan]=useState(budget.plan);
  const [modal,setModal]=useState<Modal|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [legacy,setLegacy]=useState<Record<string,unknown>|null>(null);
  const editing=modal?.type==='edit'?modal.allocation:undefined;
  const fundEditor=modal?.type==='fund'?modal.fund:undefined;
  const editable=canWrite && plan.state==='DRAFT';
  const source={...budget,plan};
  const rows=budgetRows(source).filter(item=>!category || category===item.id);
  const planned=roundCash(rows.reduce((sum,item)=>sum+(item.allocation?.amount || 0),0));
  const actual=roundCash(rows.reduce((sum,item)=>sum+item.actual,0));
  const plannedActual=roundCash(rows.filter(item=>item.allocation).reduce((sum,item)=>sum+item.actual,0));
  const unplannedCount=rows.filter(item=>!item.allocation).length;
  const selectedFund=funds.find(item=>item.id===fundFocus || item.accountId===fundFocus);
  const fundRows=selectedFund?[selectedFund]:funds;
  const visibleFunds=funds.filter(item=>!item.archivedAt);
  const publicPath='/transparency/'+month.replace('-','/');
  const reportPath=financePath('/admin/ledger',{tab:'financial_reports',month});
  const moveAccount=modal?.type==='move' && modal.direction==='WITHDRAW'?'Rekening tujuan':'Rekening asal';
  const reserveNames:Record<string,string>={fund:fundEditor?'Ubah dana cadangan':'Dana cadangan baru',archiveFund:'Arsipkan dana cadangan',move:modal?.type==='move'&&modal.direction==='WITHDRAW'?'Tarik dana cadangan':'Setor dana cadangan'};
  const title=modal?.type==='edit'?'Ubah pos pagu':modal?.type==='archive'?'Arsipkan pos pagu':modal?.type==='approve'?'Sahkan pagu bulanan':
    modal?.type==='reopen'?'Buka revisi pagu':modal?reserveNames[modal.type]:'Anggaran';

  useEffect(()=>{
    if(!canWrite || tab!=='manual_form') return;
    try {
      const values=Object.fromEntries(['wargahub_budget_items','wargahub_sinking_funds'].flatMap(key=>{
        const value=localStorage.getItem(key);
        if(!value) return [];
        const parsed:unknown=JSON.parse(value);
        return Array.isArray(parsed) && parsed.length?[[key,parsed]]:[];
      }));
      if(Object.keys(values).length) setLegacy(values);
    } catch {}
  },[canWrite,tab]);

  const open=(value:Modal)=>{setError('');setNotice('');setModal(value);};
  const fields=(allocation?:BudgetAllocation)=>({
    available:categories.filter(item=>item.id===allocation?.categoryId || !plan.items.some(pos=>pos.categoryId===item.id)),
    selected:allocation?.categoryId || (categories.some(item=>item.id===category && !plan.items.some(pos=>pos.categoryId===category))?category:''),
  });
  const allocationFields=(allocation?:BudgetAllocation)=>{
    const {available,selected}=fields(allocation);
    return <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <Field label="Kategori pengeluaran"><select className={field} name="categoryId" required defaultValue={selected}>
        <option value="" disabled>Pilih kategori</option>{available.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
      </select></Field>
      <Field label="Pagu (Rp)"><input className={field} name="amount" type="number" min="0.01" step="0.01" required defaultValue={allocation?.amount} /></Field>
      <Field label="Penanggung jawab (opsional)"><input className={field} name="pic" maxLength={100} defaultValue={allocation?.pic} /></Field>
      <Field label="Catatan (opsional)"><textarea className={field} name="notes" maxLength={500} rows={2} defaultValue={allocation?.notes} /></Field>
    </div>;
  };
  const fail=(value:unknown)=>setError(value instanceof Error?value.message:'Perubahan belum tersimpan.');
  const planPayload={month,expectedVersion:plan.version};
  async function submitAllocation(event:FormEvent<HTMLFormElement>,id?:string) {
    event.preventDefault();
    if(busy || !editable) return;
    const form=new FormData(event.currentTarget);
    const target=event.currentTarget;
    setError('');setNotice('');setBusy(true);
    try {
      setPlan(await financePost<BudgetPlan>('/api/budget/'+(id?'update':'create'),{...planPayload,id,categoryId:str(form,'categoryId'),
        amount:amount(form,'amount'),pic:str(form,'pic'),notes:str(form,'notes')}));
      if(id) setModal(null); else target.reset();
      setNotice('Pos pagu tersimpan.');
    } catch(value) {fail(value);}
    finally {setBusy(false);}
  }
  async function applyAnnual(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy || !editable) return;
    const form=new FormData(event.currentTarget);
    setBusy(true);setError('');setNotice('');
    try {
      setPlan(await financePost<BudgetPlan>('/api/budget/plan',{...planPayload,action:'apply_annual',annualId:str(form,'annualId')}));
      setNotice('Acuan tahunan ditambahkan ke draf.');
    } catch(value){fail(value);}
    finally{setBusy(false);}
  }
  async function submitDialog(event:FormEvent<HTMLFormElement>) {
    if(modal?.type==='edit') return submitAllocation(event,modal.allocation.id);
    event.preventDefault();
    if(!modal || busy) return;
    const form=new FormData(event.currentTarget);
    setBusy(true);setError('');setNotice('');
    try {
      if(modal.type==='archive' || modal.type==='approve' || modal.type==='reopen'){
        if(modal.type==='archive') {
          setPlan(await financePost<BudgetPlan>('/api/budget/delete',{...planPayload,id:modal.allocation.id,reason:str(form,'reason')}));
          setNotice('Pos pagu diarsipkan.');
        } else {
          setPlan(await financePost<BudgetPlan>('/api/budget/plan',{...planPayload,action:modal.type,...(modal.type==='reopen'?{reason:str(form,'reason')}:{} )}));
          setNotice(modal.type==='approve'?'Pagu disahkan.':'Pagu dibuka untuk revisi.');
        }
        setModal(null);
      } else {
        if(modal.type==='fund') {
          await financePost('/api/budget/reserves',{action:modal.fund?'update':'create',id:modal.fund?.id,name:str(form,'name'),target:amount(form,'target'),
            targetMonth:str(form,'targetMonth'),purpose:str(form,'purpose')});
          window.location.assign(budgetHref(month,'sinking_fund',modal.fund?{fund:modal.fund.id}:{}));
        } else if(modal.type==='archiveFund') {
          await financePost('/api/budget/reserves',{action:'archive',id:modal.fund.id,reason:str(form,'reason')});
          window.location.assign(budgetHref(month,'sinking_fund'));
        } else if(modal.type==='move') {
          const data=await financePost<{transferId:string}>('/api/budget/reserves',{action:'move',id:modal.fund.id,direction:modal.direction,
            requestId:modal.requestId,accountId:str(form,'accountId'),amount:amount(form,'amount'),date:str(form,'date'),note:str(form,'note')});
          window.location.assign(budgetHref(month,'sinking_fund',{fund:modal.fund.id,moved:data.transferId}));
        }
      }
    } catch(value){fail(value);}
    finally{setBusy(false);}
  }
  async function copyReport() {
    try {await navigator.clipboard.writeText(new URL(publicPath,location.origin).href);setNotice('Tautan laporan disalin.');}
    catch {setNotice('Buka laporan warga untuk menyalin alamatnya.');}
  }
  function saveLegacy() {
    if(!legacy) return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(legacy,null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='anggaran-browser-lama.json';anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportApproval() {
    if(!plan.approved) return;
    downloadFinanceCsv('pagu-disahkan-'+month+'.csv',[
      ['Periode',financeMonth(month)],['Disahkan oleh',plan.approved.by],['Tanggal',financeDate(plan.approved.at)],['Versi',plan.version],[],
      ['Kategori','Pagu (Rp)','Penanggung jawab'],...plan.items.map(item=>[categories.find(cat=>cat.id===item.categoryId)?.name || 'Kategori lama',item.amount,item.pic]),
    ]);
  }

  return <div className="workspace">
    <FinanceHeader area="budget" title="Anggaran" month={month}>
      {tab==='budget_matrix' && editable && <a className={financePrimary} href={budgetHref(month,'manual_form',{category})}><Plus className="size-4" aria-hidden="true" />Susun pagu</a>}
      {tab==='budget_matrix' && rows.length>0 && <a data-astro-reload className={financeButton} href={'/api/budget?'+new URLSearchParams({month,format:'csv',...(category?{category}:{})})}><ArrowDownToLine className="size-4" aria-hidden="true" />CSV</a>}
      {tab==='sinking_fund' && canWrite && <button className={financePrimary} type="button" onClick={()=>open({type:'fund'})}><Plus className="size-4" aria-hidden="true" />Dana baru</button>}
      {tab==='public_transparency' && <a className={financePrimary} href={publicPath}>Laporan warga <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
    </FinanceHeader>
    <FinanceTabLinks tabs={menus.map(item=>({...item,href:budgetHref(month,item.id)}))} active={tab} label="Menu anggaran" />
    {tab!=='sinking_fund' && <form action="/admin/budget" className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="tab" value={tab} />{category && <input type="hidden" name="category" value={category} />}
      <Field label="Periode"><input className={field} name="month" type="month" min="1900-01" max="2199-12" defaultValue={month} required /></Field>
      <button className={financeButton} type="submit">Tampilkan</button>
      {category && <a className={link+' px-2'} href={budgetHref(month,tab)}>Hapus filter</a>}
    </form>}
    {notice && <p className="rounded-lg bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900" role="status">{notice}</p>}
    {!modal && error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">{error}</p>}
    {tab==='budget_matrix' && <>
      <FinanceSummary items={[
        {label:'Pagu '+(plan.state==='APPROVED'?'disahkan':'draf'),value:cashRupiah(planned),detail:financeMonth(month),tone:'sky'},
        {label:'Realisasi belanja',value:cashRupiah(actual),detail:unplannedCount?unplannedCount+' kategori tanpa pagu':'Setelah pembatalan',tone:'rose'},
        {label:'Sisa pagu',value:cashRupiah(roundCash(planned-plannedActual)),detail:'Kategori yang dianggarkan',tone:'mint'},
      ]} />
      <section className="workspace-panel grid gap-3" id="realisasi-buku-kas" aria-label="Realisasi Buku Kas">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="!mb-0">Pagu & realisasi Buku Kas</h2><p className="mt-1 text-sm text-ink-muted">Per kategori, termasuk pembatalan.</p></div>
          <Badge tone={plan.state==='APPROVED'?'mint':'amber'}>{plan.state==='APPROVED'?'Disahkan':'Draf'}</Badge>
        </header>
        {plan.approved && <p className="text-sm text-ink-muted">Disahkan oleh <strong>{plan.approved.by}</strong> · {financeDate(plan.approved.at)} · Versi {plan.version}</p>}
        {plan.revision && <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">Revisi: {plan.revision}</p>}
        {!rows.length ? <FinanceEmpty action={editable && <a className={financeButton} href={budgetHref(month,'manual_form',{category})}>Susun pagu</a>}>Belum ada pagu atau jurnal pengeluaran pada pilihan ini.</FinanceEmpty> :
          <ul className="divide-y divide-border">{rows.map(item=>{
            const quota=item.allocation;
            const percent=quota?rate(item.actual,quota.amount):null;
            return <li key={item.id} className="grid min-w-0 gap-2 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0"><p className="font-semibold [overflow-wrap:anywhere]">{item.name}</p>
                <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{quota?[quota.pic,quota.notes].filter(Boolean).join(' · ') || 'Pos bulanan':'Belanja tanpa pagu'}</p></div>
              <div className="grid min-w-0 gap-1">
                <p className="text-sm"><strong className="tabular-nums">{cashRupiah(item.actual)}</strong>{quota?' / '+cashRupiah(quota.amount):''}</p>
                {quota && <><Meter used={item.actual} limit={quota.amount} /><p className={'text-xs '+((percent || 0)>100?'font-semibold text-rose-800':'text-ink-muted')}>{percentText(percent)} dari pagu{(percent || 0)>100?' · Melampaui':''}</p></>}
              </div>
              <div className="flex flex-wrap items-center gap-x-3">
                {item.count>0 && <a className={link} href={journalHref(month,item.id)}>Lihat jurnal <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                {editable && quota && <><button className={link} type="button" onClick={()=>open({type:'edit',allocation:quota})}>Ubah</button>
                  <button className={link+' !text-rose-800'} type="button" onClick={()=>open({type:'archive',allocation:quota})}>Arsipkan</button></>}
                {editable && !quota && categories.some(cat=>cat.id===item.id) && <a className={link} href={budgetHref(month,'manual_form',{category:item.id})}>Beri pagu</a>}
              </div>
            </li>;
          })}</ul>}
        <div className="flex flex-wrap gap-2">
          {canApprove && plan.state==='DRAFT' && plan.items.length>0 && <button type="button" className={financePrimary} onClick={()=>open({type:'approve'})}><ShieldCheck className="size-4" aria-hidden="true" />Sahkan pagu</button>}
          {canApprove && plan.state==='APPROVED' && <button type="button" className={financeButton} onClick={()=>open({type:'reopen'})}>Buka revisi</button>}
          {plan.approved && <button type="button" className={financeButton} onClick={exportApproval}>Unduh pengesahan</button>}
          <a className={financeButton} href={reportPath}>Laporan kas</a>
        </div>
      </section>
    </>}
    {tab==='manual_form' && <section className="workspace-panel grid gap-4" aria-label="Susun pagu">
      <div><h2 className="!mb-0">Susun pagu · {financeMonth(month)}</h2><p className="mt-1 text-sm text-ink-muted">Realisasi akan mengikuti Buku Kas.</p></div>
      {!editable ? <FinanceEmpty action={<a className={financeButton} href={budgetHref(month,'budget_matrix')}>Lihat pagu</a>}>{plan.state==='APPROVED'?'Pagu sudah disahkan. Buka revisi dari Pagu & realisasi.':'Akun ini memiliki akses baca.'}</FinanceEmpty> :
        fields().available.length ? <form className="grid gap-3" onSubmit={submitAllocation}>
          {allocationFields()}<div className="flex flex-wrap gap-2"><button type="submit" className={financePrimary} disabled={busy}>Simpan pos</button>
            <a className={financeButton} href={budgetHref(month,'budget_matrix')}>Lihat pagu</a></div>
        </form> : <FinanceEmpty action={<a className={financeButton} href="/admin/expenses">Kelola kategori</a>}>Semua kategori sudah mempunyai pagu atau belum ada kategori pengeluaran.</FinanceEmpty>}
      {editable && annual.length>0 && <form className="grid gap-2 rounded-xl bg-sky-50 p-3 text-sky-900 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={applyAnnual}>
        <Field label="Acuan tahunan"><select className={field} name="annualId" required>{annual.map(item=><option key={item.id} value={item.id}>{item.name} · {item.count} kategori</option>)}</select></Field>
        <button type="submit" className={financeButton} disabled={busy}>Ambil kategori baru</button>
        <p className="text-sm sm:col-span-2">Pagu yang sudah ada tetap dipertahankan.</p>
      </form>}
      {legacy && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
        <p>Data anggaran lama di browser bisa diunduh untuk ditinjau.</p><button className={link} type="button" onClick={saveLegacy}>Unduh data lama</button>
      </div>}
    </section>}
    {tab==='sinking_fund' && <section className="grid min-w-0 gap-4" aria-label="Dana cadangan">
      <FinanceSummary items={[
        {label:'Saldo dicadangkan',value:cashRupiah(visibleFunds.reduce((sum,item)=>sum+item.balance,0)),detail:'Saldo Buku Kas saat ini',tone:'mint'},
        {label:'Target dana aktif',value:cashRupiah(visibleFunds.reduce((sum,item)=>sum+item.target,0)),tone:'sky'},
        {label:'Dana aktif',value:visibleFunds.length,tone:'amber'},
      ]} />
      {/^transfer-[a-f\d-]{36}$/.test(moved) && <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-900">
        <span>Mutasi dana tercatat.</span><a className={link} href={financePath('/admin/ledger',{transfer:moved})}>Lihat pasangan jurnal <ArrowUpRight className="size-3" aria-hidden="true" /></a>
      </div>}
      <header className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">Dana cadangan</h2><p className="text-sm text-ink-muted">Setor dan tarik melalui mutasi Buku Kas.</p></div>
        {selectedFund && <a className={link} href={budgetHref(month,'sinking_fund')}>Semua dana</a>}</header>
      {canWrite && !accounts.length && <p className="text-sm text-amber-900"><a className={link} href="/admin/ledger?tab=accounts_manage">Siapkan rekening kas</a> untuk menyetor atau menarik dana.</p>}
      {!fundRows.length ? <FinanceEmpty>Belum ada dana cadangan.</FinanceEmpty> : <div className="grid gap-3 lg:grid-cols-2">{fundRows.map(item=><article className="workspace-panel grid gap-3" key={item.id} data-fund-id={item.id}>
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="font-bold [overflow-wrap:anywhere]">{item.name}</h3>
          {(item.purpose || item.targetMonth) && <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[item.purpose,item.targetMonth?'Target '+financeMonth(item.targetMonth):''].filter(Boolean).join(' · ')}</p>}</div>
          {item.archivedAt && <Badge tone="slate">Diarsipkan</Badge>}</div>
        <p className="text-sm tabular-nums"><strong className="text-xl">{cashRupiah(item.balance)}</strong> / {cashRupiah(item.target)}</p>
        <Meter used={item.balance} limit={item.target} />
        <div className="flex flex-wrap items-center gap-2">
          <a className={financeButton} href={financePath('/admin/ledger',{account:item.accountId})}>Jurnal dana</a>
          {canWrite && !item.archivedAt && <>
            {accounts.length>0 && <><button type="button" className={financePrimary} onClick={()=>open({type:'move',fund:item,direction:'DEPOSIT',requestId:crypto.randomUUID()})}>Setor</button>
              {item.balance>0 && <button type="button" className={financeButton} onClick={()=>open({type:'move',fund:item,direction:'WITHDRAW',requestId:crypto.randomUUID()})}>Tarik</button>}</>}
            <button type="button" className={link+' px-1'} onClick={()=>open({type:'fund',fund:item})}>Ubah</button>
            {item.balance===0 && <button type="button" className={link+' !text-rose-800'} onClick={()=>open({type:'archiveFund',fund:item})}>Arsipkan</button>}
          </>}
        </div>
      </article>)}</div>}
    </section>}
    {tab==='public_transparency' && <section className="grid min-w-0 gap-4" aria-label="Transparansi anggaran">
      <FinanceSummary items={[
        {label:'Saldo akhir',value:cashRupiah(cash.closing),detail:financeMonth(month),tone:'mint'},
        {label:'Pemasukan bersih',value:cashRupiah(cash.income),tone:'sky'},
        {label:'Pengeluaran bersih',value:cashRupiah(cash.outgoing),tone:'rose'},
      ]} />
      <div className="workspace-panel grid gap-3">
        <div><h2 className="!mb-0">Laporan untuk warga</h2><p className="mt-1 text-sm text-ink-muted">Ringkasan kas dari jurnal. Catatan pagu dan bukti belanja tetap untuk pengurus.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <a className={financePrimary} href={publicPath}>Buka laporan warga <ArrowUpRight className="size-4" aria-hidden="true" /></a>
          <button className={financeButton} type="button" onClick={()=>void copyReport()}><Copy className="size-4" aria-hidden="true" />Salin tautan</button>
          {billingPeriodId && <a className={financeButton} href={financePath('/rekap-iuran',{period:billingPeriodId})}>Rekap iuran warga</a>}
          <a className={financeButton} href={reportPath}>{canWrite?'Laporan kas & WA':'Laporan kas'}</a>
        </div>
      </div>
    </section>}
    {modal && <FinanceDialog open title={title} close={()=>setModal(null)} busy={busy} error={error}>
      <form className="grid min-w-0 gap-3" onSubmit={submitDialog}>
        {modal.type==='edit' ? allocationFields(editing) : modal.type==='approve' ? <p className="text-sm">{plan.items.length} pos untuk {financeMonth(month)} akan dikunci setelah disahkan.</p> :
          modal.type==='archive' || modal.type==='reopen' || modal.type==='archiveFund' ?
            <Field label="Alasan"><textarea className={field} name="reason" required minLength={5} maxLength={400} /></Field> :
          modal.type==='fund' ? <>
            <Field label="Nama dana"><input className={field} name="name" minLength={2} maxLength={90} defaultValue={fundEditor?.name} required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Target (Rp)"><input className={field} name="target" type="number" min="0.01" step="0.01" defaultValue={fundEditor?.target} required /></Field>
              <Field label="Target bulan (opsional)"><input className={field} name="targetMonth" type="month" defaultValue={fundEditor?.targetMonth} /></Field>
            </div>
            <Field label="Tujuan (opsional)"><textarea className={field} name="purpose" maxLength={400} defaultValue={fundEditor?.purpose} /></Field>
          </> : modal.type==='move' ? <>
            <p className="flex items-center gap-2 text-sm font-semibold"><ArrowLeftRight className="size-4 shrink-0" aria-hidden="true" />{modal.fund.name} · {cashRupiah(modal.fund.balance)}</p>
            <Field label={moveAccount}><select className={field} name="accountId" required defaultValue=""><option value="" disabled>Pilih rekening kas</option>
              {accounts.map(item=><option key={item.id} value={item.id}>{item.name} · {cashRupiah(item.balance)}</option>)}</select></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nominal (Rp)"><input className={field} type="number" name="amount" min="0.01" step="0.01" max={modal.direction==='WITHDRAW'?modal.fund.balance:undefined} required /></Field>
              <Field label="Tanggal mutasi"><input className={field} type="date" name="date" max={today} defaultValue={today} required /></Field>
            </div>
            <Field label="Catatan (opsional)"><input className={field} name="note" maxLength={160} /></Field>
          </> : null}
        <div className="flex flex-wrap justify-end gap-2"><button className={financeButton} type="button" disabled={busy} onClick={()=>setModal(null)}>Tutup</button>
          <button className={financePrimary} type="submit" disabled={busy}>{busy?'Menyimpan…':modal.type==='approve'?'Sahkan':modal.type==='move'?'Catat mutasi':'Simpan'}</button></div>
      </form>
    </FinanceDialog>}
  </div>;
}
