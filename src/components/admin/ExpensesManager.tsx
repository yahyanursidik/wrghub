/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpRight, ClipboardList, FileMinus, Hammer, HeartHandshake, Plus, Repeat, Search, Wallet } from 'lucide-react';
import { downloadFinanceCsv, financeDate, financePath, jakartaDate } from '../../lib/billing-data';
import { aidTypes, cashRupiah, financeMonthPattern, projectStatuses, projectTypes, proofMaxBytes, proofMimes, type ExpenseCategory, type ExpenseRow, type ExpenseTab, type FacilityProject, type RecurringExpenseConfigItem } from '../../lib/cash-data';
import type { FinanceAccount } from '../../services/finance.service';
import { FinanceDialog, FinanceEmpty, FinanceHeader, FinancePager, FinanceStatus, FinanceSummary, FinanceTabLinks, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';
import { RecurringExpensesManager } from './RecurringExpensesManager';

const expenseHref = (params:Record<string,string|undefined>={}) => financePath('/admin/expenses',params);
const ledgerHref = (params:Record<string,string|undefined>={}) => financePath('/admin/ledger',params);
const tabs = [
  {id:'expenses_list',label:'Daftar pengeluaran',icon:ClipboardList},
  {id:'recurring_expenses',label:'Pengeluaran rutin',icon:Repeat},
  {id:'social_aid',label:'Bantuan sosial',icon:HeartHandshake},
  {id:'fasum_projects',label:'Proyek fasum',icon:Hammer},
] as const;
const pageSize = 12;
const noticeLabels:Record<string,string> = {expense:'Pengeluaran tersimpan.',project:'Proyek tersimpan.',book:'Pengeluaran dibukukan.',cancel:'Pengeluaran dibatalkan.',category:'Kategori tersimpan.'};
const cellLink = 'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline';
const get = (data:FormData,key:string) => String(data.get(key) || '').trim();
const money = (data:FormData,key:string) => Number(get(data,key));
type Form = {type:'expense'|'social';record?:ExpenseRow;project?:FacilityProject} |
  {type:'project';project?:FacilityProject} | {type:'book'|'cancel';record:ExpenseRow} | {type:'category'};
type Facility = {id:string;name:string};
interface Props {
  expenses:ExpenseRow[]; accounts:FinanceAccount[]; categories:ExpenseCategory[]; projects:FacilityProject[]; facilities:Facility[];
  recurring:{items:RecurringExpenseConfigItem[];version:string}|null; initialTab:ExpenseTab; initialExpense:string; initialMonth:string;
  initialCategory:string; initialProject:string; initialNotice:string; canWrite:boolean; canViewFacilities:boolean;
}
function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}
async function proofInput(value:FormDataEntryValue|null,remove:boolean) {
  if (!(value instanceof File) || !value.size) return remove ? null : undefined;
  if (!Object.hasOwn(proofMimes,value.type) || value.size>proofMaxBytes) throw new Error('Pilih JPG, PNG, WebP, atau PDF maksimal 1,5 MB.');
  return await new Promise<string>((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('File bukti belum bisa dibaca.'));
    reader.readAsDataURL(value);
  });
}

export function ExpensesManager({expenses,accounts,categories,projects,facilities,recurring,initialTab:tab,initialExpense,
  initialMonth,initialCategory,initialProject,initialNotice,canWrite,canViewFacilities}:Props) {
  const [query,setQuery] = useState('');
  const [month,setMonth] = useState(financeMonthPattern.test(initialMonth)?initialMonth:'');
  const [category,setCategory] = useState(categories.some(item=>item.id===initialCategory)?initialCategory:'');
  const [status,setStatus] = useState('');
  const [page,setPage] = useState(1);
  const [form,setForm] = useState<Form|null>(null);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [saved,setSaved] = useState(Object.hasOwn(noticeLabels,initialNotice)?noticeLabels[initialNotice]:'');
  const exact = Boolean(initialExpense);
  const project = projects.find(item=>item.id===initialProject);
  const social = tab==='social_aid';
  const base = expenses.filter(item=>(!social || item.details.aidType) && (!initialProject || item.details.projectId===initialProject));
  const rows = base.filter(item=>(!month || item.expenseDate.startsWith(month)) && (!category || item.categoryId===category) &&
    (!status || item.status===status) && (!query.trim() || [item.title,item.categoryName,item.accountName,item.details.vendor,item.details.recipientName,item.id]
      .some(value=>value?.toLowerCase().includes(query.trim().toLowerCase()))));
  const booked = rows.filter(item=>item.status==='APPROVED' && item.journalMatches);
  const drafts = rows.filter(item=>item.status==='PENDING');
  const unlinked = rows.filter(item=>item.status==='APPROVED' && !item.journalMatches);
  const activeBalance = accounts.reduce((sum,item)=>sum+item.balance,0);
  const open = (value:Form)=>{setError('');setForm(value);};
  const canRecord = canWrite && accounts.length>0 && categories.length>0;
  const filtered = Boolean(month || category || status || query);
  const reset = ()=>{setMonth('');setCategory('');setStatus('');setQuery('');setPage(1);};
  const record = form && 'record' in form ? form.record : undefined;
  const projectForm = form?.type==='project' ? form.project : undefined;
  const projectExpense = form?.type==='expense' ? form.project : undefined;
  const title = form?.type==='category' ? 'Kategori pengeluaran' : form?.type==='project' ? (projectForm?'Ubah proyek':'Proyek baru') :
    form?.type==='cancel' ? 'Batalkan pengeluaran' : form?.type==='book' ? 'Bukukan pembayaran' :
    form?.type==='social' ? (record?'Ubah bantuan sosial':'Catat bantuan sosial') : record?'Ubah pengeluaran':'Catat pengeluaran';

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || busy) return;
    setError('');setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      if (form.type==='category') {
        await financePost('/api/expenses/categories',{name:get(data,'name')});
        window.location.assign(expenseHref({tab,saved:'category'}));
      } else if (form.type==='project') {
        await financePost('/api/expenses/projects/create',{id:form.project?.id,projectName:get(data,'projectName'),projectType:get(data,'projectType'),
          budgetAmount:money(data,'budgetAmount'),vendorOrContractor:get(data,'vendorOrContractor'),startDate:get(data,'startDate'),
          targetCompletionDate:get(data,'targetCompletionDate') || undefined,status:get(data,'projectStatus'),facilityId:get(data,'facilityId') || undefined});
        window.location.assign(expenseHref({tab:'fasum_projects',saved:'project'}));
      } else if (form.type==='book' || form.type==='cancel') {
        await financePost('/api/expenses/'+(form.type==='book'?'book':'delete'),{id:form.record.id,reason:get(data,'reason') || undefined});
        window.location.assign(expenseHref({tab:social?'social_aid':undefined,expense:form.record.id,saved:form.type}));
      } else {
        const isSocial = form.type==='social';
        const receiptFile = await proofInput(data.get('receiptFile'),data.has('removeProof'));
        const date = get(data,'expenseDate');
        const description = get(data,'description');
        const fields = {amount:money(data,'amount'),categoryId:get(data,'categoryId'),accountId:get(data,'accountId'),receiptFile};
        const formRecord = 'record' in form ? form.record : undefined;
        const id = formRecord?.id;
        const bookNow = get(data,'bookNow')!=='draft';
        const payload = id ? {...fields,id,expenseDate:date,...(isSocial ? {
          recipientName:get(data,'recipientName'),aidType:get(data,'aidType'),memo:description,
        } : {title:get(data,'title'),description,vendor:get(data,'vendor')})} :
        isSocial ? {...fields,aidDate:date,recipientName:get(data,'recipientName'),aidType:get(data,'aidType'),description,bookNow} :
        {...fields,expenseDate:date,title:get(data,'title'),description,vendor:get(data,'vendor'),projectId:projectExpense?.id,bookNow};
        const result = await financePost<{id:string;status:string}>(id?'/api/expenses/update':isSocial?'/api/expenses/social/create':'/api/expenses/create',payload);
        window.location.assign(expenseHref({tab:isSocial?'social_aid':undefined,expense:result.id,saved:'expense'}));
      }
    } catch (failure) {setError(failure instanceof Error?failure.message:'Perubahan belum tersimpan.');setBusy(false);}
  }
  function exportRows() {
    downloadFinanceCsv('pengeluaran-wargahub.csv',[
      ['Tanggal','Pengeluaran','Kategori','Rekening','Nominal','Status','ID'],
      ...rows.map(row=>[row.expenseDate,row.title,row.categoryName || '',row.accountName || '',row.amount,
        row.status==='PENDING'?'Draf':row.status==='APPROVED'?(row.journalMatches?'Dibukukan':'Perlu cek jurnal'):row.status==='CANCELLED'?'Dibatalkan':row.status,row.id]),
    ]);
    setSaved('CSV diunduh.');
  }

  const summary = <FinanceSummary items={[
    {label:social?'Bantuan dibukukan':'Dibukukan',value:cashRupiah(booked.reduce((sum,item)=>sum+item.amount,0)),detail:booked.length+' transaksi',tone:'rose'},
    {label:'Draf',value:drafts.length,detail:unlinked.length?unlinked.length+' perlu cek jurnal':undefined,tone:'amber'},
    {label:'Saldo kas aktif',value:cashRupiah(activeBalance),detail:<a href={ledgerHref({tab:'accounts_manage'})} className="inline-flex min-h-8 items-center gap-1 font-semibold hover:underline">Lihat rekening <ArrowUpRight className="size-3" aria-hidden="true" /></a>,tone:'mint'},
  ]} />;
  const filterBar = <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1.6fr)_repeat(3,minmax(8rem,1fr))] sm:p-4">
    <Field label={social?'Cari bantuan':'Cari pengeluaran'}><span className="relative block">
      <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-ink-muted" aria-hidden="true" />
      <input className={financeField+' pl-9'} value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} placeholder={social?'Nama penerima atau jenis':'Nama, kategori, atau rekening'} />
    </span></Field>
    <Field label="Periode"><input className={financeField+' min-w-0'} type="month" value={month} onChange={event=>{setMonth(event.target.value);setPage(1);}} /></Field>
    <Field label="Kategori"><select className={financeField} value={category} onChange={event=>{setCategory(event.target.value);setPage(1);}}>
      <option value="">Semua kategori</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
    </select></Field>
    <Field label="Status"><select className={financeField} value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}>
      <option value="">Semua status</option><option value="APPROVED">Dibukukan</option><option value="PENDING">Draf</option><option value="CANCELLED">Dibatalkan</option>
    </select></Field>
    {filtered && <button type="button" className={cellLink+' justify-self-start'} onClick={reset}>Reset filter</button>}
  </div>;

  return <section className="workspace">
    <FinanceHeader area="expenses" title="Pengeluaran" canViewPayments={canWrite}>
      {canRecord && (tab==='expenses_list' || social) && <button type="button" onClick={()=>open(social?{type:'social'}:{type:'expense',project})} className={financePrimary}>
        <Plus className="size-4" aria-hidden="true" />{social?'Catat bantuan':'Catat pengeluaran'}
      </button>}
      {canWrite && tab==='fasum_projects' && <button className={financePrimary} type="button" onClick={()=>open({type:'project'})}><Plus className="size-4" aria-hidden="true" />Proyek baru</button>}
      {canWrite && tab==='expenses_list' && <button className={financeButton} type="button" onClick={()=>open({type:'category'})}>Kategori</button>}
    </FinanceHeader>
    <FinanceTabLinks tabs={tabs.map(item=>({...item,href:expenseHref({tab:item.id})}))} active={tab} label="Menu pengeluaran" />
    <p role="status" className={saved?'rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-900':'sr-only'}>{saved}</p>
    {canWrite && !canRecord && tab!=='fasum_projects' && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <span>{accounts.length?'Kategori pengeluaran belum tersedia.':'Siapkan rekening kas sebelum mencatat pengeluaran.'}</span>
      {!accounts.length ? <a href={ledgerHref({tab:'accounts_manage'})} className={cellLink}>Kelola rekening <ArrowUpRight className="size-4" aria-hidden="true" /></a> :
        <button type="button" className={cellLink} onClick={()=>open({type:'category'})}>Tambah kategori</button>}
    </div>}
    {tab==='recurring_expenses' && recurring && <RecurringExpensesManager config={recurring} accounts={accounts} categories={categories} canWrite={canWrite} />}
    {tab==='fasum_projects' && <section className="grid gap-3" aria-label="Proyek fasum">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Anggaran dan realisasi proyek</h2>
        {canViewFacilities && <a href="/admin/facilities?tab=facilities" className={cellLink}>Katalog fasilitas <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
      </div>
      {!projects.length && <FinanceEmpty>Belum ada proyek fasum.</FinanceEmpty>}
      <div className="grid gap-3 lg:grid-cols-2">
        {projects.map(item=>{
          const facility = facilities.find(row=>row.id===item.facilityId);
          const percentage = item.budgetAmount>0 ? Math.round(100*item.actualSpent/item.budgetAmount) : 0;
          return <article key={item.id} className="workspace-panel grid min-w-0 gap-3">
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0"><p className="text-xs font-semibold text-primary-800">{projectTypes[item.projectType]}</p>
                <h3 className="mt-1 text-lg font-bold [overflow-wrap:anywhere]">{item.projectName}</h3></div><FinanceStatus value={item.status} />
            </header>
            <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{[facility?.name,item.vendorOrContractor,financeDate(item.startDate)+(item.targetCompletionDate?' – '+financeDate(item.targetCompletionDate):'')].filter(Boolean).join(' · ')}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-ink-muted">Anggaran</dt><dd className="font-bold tabular-nums">{cashRupiah(item.budgetAmount)}</dd></div>
              <div><dt className="text-ink-muted">Dibukukan</dt><dd className={'font-bold tabular-nums '+(percentage>100?'text-rose-800':'text-primary-800')}>{cashRupiah(item.actualSpent)}</dd></div>
            </dl>
            <div className="h-2 overflow-hidden rounded-full bg-primary-100" role="meter" aria-label="Pemakaian anggaran" aria-valuenow={Math.min(100,percentage)} aria-valuetext={percentage+' persen'}>
              <div className={'h-full rounded-full '+(percentage>100?'bg-rose-600':'bg-primary-600')} style={{width:Math.min(100,percentage)+'%'}} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href={expenseHref({tab:'expenses_list',project:item.id})} className={financeButton}>Lihat biaya</a>
              {canRecord && <button type="button" className={financeButton} onClick={()=>open({type:'expense',project:item})}><Plus className="size-4" aria-hidden="true" />Catat biaya</button>}
              {canWrite && <button type="button" className={cellLink+' px-2'} onClick={()=>open({type:'project',project:item})}>Ubah proyek</button>}
            </div>
          </article>;
        })}
      </div>
    </section>}
    {(tab==='expenses_list' || social) && <div className="grid gap-4">
      {(exact || initialProject) && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm text-sky-900">
        <span className="font-semibold [overflow-wrap:anywhere]">{project?'Biaya proyek: '+project.projectName:'Detail pengeluaran'}</span>
        <a href={expenseHref({tab:project?'fasum_projects':tab})} className={cellLink}>{project?'Kembali ke proyek':'Lihat semua'}</a>
      </div>}
      {!exact && summary}
      <section className="min-w-0 rounded-2xl border border-border bg-surface" aria-label={social?'Riwayat bantuan sosial':'Transaksi pengeluaran'}>
        {!exact && filterBar}
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <h2 className="text-base font-bold">{social?'Riwayat bantuan':exact?'Rincian transaksi':'Transaksi'}</h2>
          {rows.length>0 && <button className={cellLink} type="button" onClick={exportRows}><ArrowDownToLine className="size-4" aria-hidden="true" />CSV</button>}
        </header>
        {!rows.length ? <div className="p-4"><FinanceEmpty>{exact?'Pengeluaran tidak ditemukan.':filtered?'Tidak ada pengeluaran yang cocok.':project?'Belum ada biaya yang dicatat untuk proyek ini.':social?'Belum ada bantuan sosial.':'Belum ada transaksi pengeluaran.'}</FinanceEmpty></div>
          : <ul className="divide-y divide-border px-4">
            {rows.slice((page-1)*pageSize,page*pageSize).map(item=>{
              const linkedProject = projects.find(row=>row.id===item.details.projectId);
              const editable = canWrite && !item.payrollLinked && (item.status==='PENDING' || (item.status==='APPROVED' && item.journalCount===1));
              return <li key={item.id} data-expense-id={item.id} className="grid min-w-0 gap-x-4 gap-y-2 py-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.85fr)_minmax(0,1fr)] md:items-start">
                <div className="min-w-0">
                  <p className="font-semibold [overflow-wrap:anywhere]">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted [overflow-wrap:anywhere]">{[financeDate(item.expenseDate),item.categoryName,item.accountName].filter(Boolean).join(' · ')}</p>
                  {item.details.recipientName && <p className="mt-1 text-sm font-medium [overflow-wrap:anywhere]">{item.details.recipientName}</p>}
                  {(item.description || item.details.memo || item.details.vendor) && <p className="mt-1 text-sm text-ink-muted [overflow-wrap:anywhere]">{[item.details.vendor,item.details.memo || item.description].filter(Boolean).join(' · ')}</p>}
                  {linkedProject && <a className={cellLink} href={expenseHref({tab:'expenses_list',project:linkedProject.id})}>Biaya proyek <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2 md:flex-col md:items-start">
                  <p className="font-bold tabular-nums [overflow-wrap:anywhere]">{cashRupiah(item.amount)}</p>
                  <FinanceStatus value={item.status==='PENDING'?'DRAFT':item.status==='APPROVED' && !item.journalMatches?'UNLINKED':item.status} />
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 md:justify-end">
                  {item.journalCount>0 && <a className={cellLink} href={ledgerHref({expense:item.id})}>Buku kas <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                  {item.payrollLinked && <a className={cellLink} href={'/admin/staff-loans?'+new URLSearchParams({tab:'repayment_history',expense:item.id})}>Potongan gaji <ArrowUpRight className="size-3" aria-hidden="true" /></a>}
                  {item.hasProof && <a className={cellLink} href={'/api/expenses/proof?'+new URLSearchParams({expense:item.id})} download rel="noreferrer" data-astro-reload>Bukti <ArrowDownToLine className="size-3" aria-hidden="true" /></a>}
                  {editable && <button className={cellLink} type="button" onClick={()=>open({type:item.details.aidType?'social':'expense',record:item})}>Ubah</button>}
                  {editable && item.status==='PENDING' && <button className={cellLink} type="button" onClick={()=>open({type:'book',record:item})}>Bukukan</button>}
                  {editable && <button className={cellLink+' !text-rose-800'} type="button" onClick={()=>open({type:'cancel',record:item})}>Batalkan</button>}
                </div>
              </li>;
            })}
          </ul>}
        {!exact && <FinancePager total={rows.length} page={page} pageSize={pageSize} onChange={setPage} label="pengeluaran" />}
      </section>
      {canWrite && <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        <a className={cellLink} href={financePath('/admin/budget',{tab:'budget_matrix',month,category})}><Wallet className="size-4" aria-hidden="true" />Lihat anggaran dan realisasi <ArrowUpRight className="size-3" aria-hidden="true" /></a>
        <a className={cellLink} href="/admin/staff-loans">Kasbon petugas <ArrowUpRight className="size-3" aria-hidden="true" /></a>
      </div>}
    </div>}
    <FinanceDialog open={Boolean(form)} title={title} close={()=>setForm(null)} busy={busy} error={error}>
      {form && <form className="grid gap-3" onSubmit={submit} key={form.type+(record?.id || projectForm?.id || '')}>
        {(form.type==='cancel' || form.type==='book') ? <>
          <p className="text-sm text-ink-muted">{form.record.title} · <strong>{cashRupiah(form.record.amount)}</strong></p>
          {form.type==='book' ? <p className="text-sm">Pastikan pembayaran sudah terjadi. Nominal akan dicatat sebagai kas keluar.</p> :
            <><p className="text-sm">{form.record.status==='APPROVED'?'Buku kas akan mencatat pembalikan. Riwayat transaksi tetap tersedia.':'Draf dibatalkan tanpa mengubah saldo.'}</p>
              <Field label="Alasan pembatalan"><textarea className={financeField} name="reason" required minLength={5} maxLength={500} /></Field></>}
        </> : form.type==='category' ? <>
          {categories.length>0 && <ul className="flex flex-wrap gap-1.5" aria-label="Kategori yang tersedia">{categories.map(item=><li key={item.id} className="rounded-full bg-primary-50 px-2.5 py-1 text-sm text-primary-900 [overflow-wrap:anywhere]">{item.name}</li>)}</ul>}
          <Field label="Nama kategori baru"><input className={financeField} name="name" minLength={2} maxLength={100} required /></Field>
        </> : form.type==='project' ? <>
          <Field label="Nama proyek"><input className={financeField} name="projectName" required maxLength={200} defaultValue={projectForm?.projectName} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jenis proyek"><select className={financeField} name="projectType" defaultValue={projectForm?.projectType}>{Object.entries(projectTypes).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="Status"><select className={financeField} name="projectStatus" defaultValue={projectForm?.status}>{Object.entries(projectStatuses).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="Anggaran (Rp)"><input className={financeField} name="budgetAmount" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={projectForm?.budgetAmount} /></Field>
            <Field label="Fasilitas (opsional)"><select className={financeField} name="facilityId" defaultValue={projectForm?.facilityId || ''}>
              <option value="">Pilih dari katalog</option>{facilities.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select></Field>
            <Field label="Tanggal mulai"><input className={financeField+' min-w-0'} type="date" name="startDate" required defaultValue={projectForm?.startDate || jakartaDate()} /></Field>
            <Field label="Target selesai (opsional)"><input className={financeField+' min-w-0'} type="date" name="targetCompletionDate" defaultValue={projectForm?.targetCompletionDate} /></Field>
          </div>
          <Field label="Pelaksana (opsional)"><input className={financeField} name="vendorOrContractor" maxLength={160} defaultValue={projectForm?.vendorOrContractor} /></Field>
        </> : <>
          {projectExpense && <p className="text-sm font-semibold text-primary-800">{projectExpense.projectName}</p>}
          {form.type==='social' ? <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama penerima (internal)"><input className={financeField} name="recipientName" required maxLength={200} defaultValue={record?.details.recipientName} /></Field>
            <Field label="Jenis bantuan"><select className={financeField} name="aidType" defaultValue={record?.details.aidType}>{Object.entries(aidTypes).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
          </div> : <Field label="Nama pengeluaran (tampil di laporan warga)"><input className={financeField} name="title" required minLength={2} maxLength={200} defaultValue={record?.title} placeholder={projectExpense?'Contoh: Termin pertama':'Contoh: Servis pompa air'} /></Field>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nominal (Rp)"><input className={financeField} name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={record?.amount} /></Field>
            <Field label="Tanggal transaksi"><input className={financeField+' min-w-0'} name="expenseDate" type="date" required defaultValue={record?.expenseDate || jakartaDate()} /></Field>
            <Field label="Kategori"><select className={financeField} name="categoryId" required defaultValue={record?.categoryId || (form.type==='social'?categories.find(item=>/sosial|kesehatan/i.test(item.name))?.id:projectExpense?categories.find(item=>/pemeliharaan/i.test(item.name))?.id:undefined) || ''}>
              <option value="" disabled>Pilih kategori</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select></Field>
            <Field label="Rekening"><select className={financeField} name="accountId" required defaultValue={record?.accountId || accounts[0]?.id || ''}>
              <option value="" disabled>Pilih rekening</option>{accounts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select></Field>
          </div>
          {form.type==='expense' && <Field label="Penerima / vendor (opsional)"><input className={financeField} name="vendor" maxLength={160} defaultValue={record?.details.vendor} /></Field>}
          <Field label="Catatan internal (opsional)"><textarea className={financeField} name="description" maxLength={1500} defaultValue={record?.details.memo || record?.description || ''} /></Field>
          <Field label={record?.hasProof?'Ganti bukti (opsional)':'Bukti belanja (opsional)'}>
            <input className={financeField+' file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-2 file:py-1 file:font-semibold file:text-primary-800'} type="file" name="receiptFile" accept={Object.keys(proofMimes).join(',')} />
            <span className="mt-1 block text-xs font-normal text-ink-muted">JPG, PNG, WebP, atau PDF · maks. 1,5 MB</span>
          </Field>
          {record?.hasProof && <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input name="removeProof" type="checkbox" />Hapus bukti lama</label>}
          {!record && <Field label="Status pembayaran"><select className={financeField} name="bookNow" defaultValue="book"><option value="book">Sudah dibayar · bukukan</option><option value="draft">Belum dibayar · simpan draf</option></select></Field>}
        </>}
        <footer className="flex flex-wrap justify-end gap-2 pt-1">
          <button className={financeButton} disabled={busy} type="button" onClick={()=>setForm(null)}>Tutup</button>
          <button className={form.type==='cancel'?'inline-flex min-h-11 items-center rounded-lg bg-rose-700 px-4 font-semibold text-white hover:bg-rose-800':financePrimary} disabled={busy} type="submit">
            {busy?'Menyimpan…':form.type==='cancel'?'Batalkan transaksi':form.type==='book'?'Bukukan':'Simpan'}
          </button>
        </footer>
      </form>}
    </FinanceDialog>
  </section>;
}
