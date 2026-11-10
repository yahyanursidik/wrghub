/* Hallmark · shared finance controls */
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CalendarCheck2, Plus, Repeat } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';
import { financeDate, financePath } from '../../lib/billing-data';
import { cashRupiah, currentFinanceMonth, financeMonth, type ExpenseCategory, type RecurringExpenseConfigItem, type RecurringPreviewRow } from '../../lib/cash-data';
import type { FinanceAccount } from '../../services/finance.service';
import { FinanceDialog, FinanceEmpty, FinanceStatus, financeButton, financeField, financePost, financePrimary } from './FinanceWorkspace';

interface Config {items:RecurringExpenseConfigItem[];version:string}
interface Preview {month:string;version:string;rows:RecurringPreviewRow[]}
interface Props {config:Config;accounts:FinanceAccount[];categories:ExpenseCategory[];canWrite:boolean}
const link = 'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline';
const str = (data:FormData,key:string)=>String(data.get(key) || '').trim();

export function RecurringExpensesManager({config,accounts,categories,canWrite}:Props) {
  const [stored,setStored] = useState(config);
  const [month,setMonth] = useState(currentFinanceMonth);
  const [preview,setPreview] = useState<Preview|null>(null);
  const [selected,setSelected] = useState<string[]>([]);
  const [editor,setEditor] = useState<RecurringExpenseConfigItem|'new'|null>(null);
  const [remove,setRemove] = useState<RecurringExpenseConfigItem|null>(null);
  const [confirm,setConfirm] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [posted,setPosted] = useState<string[]>([]);
  const [annual,setAnnual] = useState(false);
  const edit = typeof editor==='object' ? editor : null;
  const canConfigure = canWrite && accounts.length>0 && categories.length>0;
  const selectedRows = preview?.rows.filter(row=>selected.includes(row.itemId) && row.state==='READY') || [];
  const selectedTotal = selectedRows.reduce((total,row)=>total+row.amount,0);
  const failure = (error:unknown) => error instanceof Error ? error.message : 'Perubahan belum tersimpan.';
  const open = (item:RecurringExpenseConfigItem|'new')=>{
    setError('');setNotice('');setAnnual(item!=='new' && Boolean(item.frequency && item.frequency!=='MONTHLY'));setEditor(item);
  };
  async function store(next:RecurringExpenseConfigItem[]) {
    setBusy(true);setError('');setNotice('');
    try {
      const saved = await financePost<Config>('/api/expenses/recurring/config',{items:next,expectedVersion:stored.version});
      setStored(saved);setPreview(null);setSelected([]);setEditor(null);setRemove(null);setNotice('Rencana pengeluaran tersimpan.');
    } catch (error) {setError(failure(error));}
    finally {setBusy(false);}
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const categoryId = str(data,'category');
    const next = {id:edit?.id || 'rec-'+crypto.randomUUID(),title:str(data,'title'),amount:Number(str(data,'amount')),accountId:str(data,'account'),
      categoryId,categoryName:categories.find(item=>item.id===categoryId)?.name,executionDay:Number(str(data,'day')),frequency:annual?'YEARLY' as const:'MONTHLY' as const,
      executionMonth:annual?Number(str(data,'annualMonth')):undefined,vendor:str(data,'vendor') || undefined,
      description:edit?.description,isActive:data.has('active')};
    void store(edit?stored.items.map(item=>item.id===edit.id?next:item):[...stored.items,next]);
  }
  async function loadPreview(target:string) {
    const response = await apiFetch('/api/expenses/recurring/process?'+new URLSearchParams({month:target}));
    return (await response.json()).data as Preview;
  }
  async function showPreview(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');setNotice('');setPosted([]);setPreview(null);setSelected([]);
    try {
      const next = await loadPreview(month);
      setPreview(next);setSelected(next.rows.filter(row=>row.state==='READY').map(row=>row.itemId));
    } catch(error) {setError(failure(error));}
    finally {setBusy(false);}
  }
  async function post() {
    if (!preview || busy || !selectedRows.length) return;
    setBusy(true);setError('');
    try {
      const result = await financePost<{ids:string[];count:number;total:number}>('/api/expenses/recurring/process',
        {month:preview.month,expectedVersion:preview.version,itemIds:selectedRows.map(row=>row.itemId)});
      setPosted(result.ids);setSelected([]);setConfirm(false);
      setNotice(result.count+' pos dibukukan · '+cashRupiah(result.total));
      try {setPreview(await loadPreview(preview.month));}
      catch {setPreview(null);}
    } catch (error) {setError(failure(error));}
    finally {setBusy(false);}
  }
  const hasDialog = Boolean(editor || remove || confirm);
  return <div className="grid min-w-0 gap-4">
    {notice && <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-900">
      <span>{notice}</span>{posted.length>0 && <a className={link} href={financePath('/admin/expenses',{month})}>Lihat pengeluaran <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
    </div>}
    {error && !hasDialog && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    <section className="workspace-panel grid min-w-0 gap-3" aria-label="Rencana rutin">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="!mb-0 flex items-center gap-2"><Repeat className="size-5 text-primary-700" aria-hidden="true" /> Rencana rutin</h2>
          <p className="mt-1 text-sm text-ink-muted">{stored.items.filter(item=>item.isActive).length} pos aktif</p></div>
        {canConfigure && <button type="button" className={financePrimary} onClick={()=>open('new')}><Plus className="size-4" aria-hidden="true" />Tambah pos</button>}
      </header>
      {!stored.items.length ? <FinanceEmpty>Belum ada rencana pengeluaran rutin.</FinanceEmpty> : <ul className="divide-y divide-border">
        {stored.items.map(item=><li key={item.id} className="grid min-w-0 items-center gap-2 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="min-w-0">
            <p className="font-semibold [overflow-wrap:anywhere]">{item.title}</p>
            <p className="mt-1 text-sm text-ink-muted [overflow-wrap:anywhere]">
              Tanggal {item.executionDay} · {item.frequency && item.frequency!=='MONTHLY' && item.executionMonth?financeMonth('2000-'+String(item.executionMonth).padStart(2,'0')).replace(' 2000','')+' setiap tahun':'Setiap bulan'} · {accounts.find(account=>account.id===item.accountId)?.name || 'Rekening tidak aktif'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="font-bold tabular-nums">{cashRupiah(item.amount)}</span>
            {!item.isActive && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">Nonaktif</span>}
          </div>
          {canWrite && <div className="flex gap-3 sm:pl-2">
            {canConfigure && <button type="button" className={link} onClick={()=>open(item)}>Ubah</button>}
            <button type="button" className={link+' !text-rose-800'} onClick={()=>{setError('');setRemove(item);}}>Hapus rencana</button>
          </div>}
        </li>)}
      </ul>}
    </section>
    <section className="workspace-panel grid min-w-0 gap-3">
      <div><h2 className="!mb-0 flex items-center gap-2"><CalendarCheck2 className="size-5 text-primary-700" aria-hidden="true" /> Pembukuan per bulan</h2>
        <p className="mt-1 text-sm text-ink-muted">Pilih pos yang sudah dibayar.</p></div>
      <form className="flex flex-wrap items-end gap-2" onSubmit={showPreview}>
        <label className="min-w-0 text-sm font-semibold">Periode<input className={financeField} type="month" max={currentFinanceMonth()} required value={month}
          onChange={event=>{setMonth(event.target.value);setPreview(null);setSelected([]);setPosted([]);setNotice('');}} /></label>
        <button type="submit" className={financeButton} disabled={busy}>Tinjau pos</button>
      </form>
      {preview && (preview.rows.length ? <ul className="divide-y divide-border">
        {preview.rows.map(row=><li className="grid min-w-0 items-center gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto]" key={row.id}>
          <div className="flex min-w-0 items-center gap-3">
            {canWrite && row.state==='READY' && <label className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border">
              <input type="checkbox" aria-label={'Pilih '+row.title} checked={selected.includes(row.itemId)} onChange={event=>setSelected(event.target.checked?[...selected,row.itemId]:selected.filter(id=>id!==row.itemId))} />
            </label>}
            <div className="min-w-0">
              <p className="font-semibold [overflow-wrap:anywhere]">{row.title}</p>
              <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{financeDate(row.date)} · {row.accountName}</p>
              {row.expenseId && <a href={financePath('/admin/expenses',{expense:row.expenseId})} className={link}>Lihat catatan <ArrowUpRight className="size-4" aria-hidden="true" /></a>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="font-bold tabular-nums">{cashRupiah(row.amount)}</span><FinanceStatus value={row.state} /></div>
        </li>)}
      </ul> : <FinanceEmpty>Tidak ada pos untuk periode ini.</FinanceEmpty>)}
      {canWrite && selectedRows.length>0 && <button type="button" disabled={busy} className={financePrimary+' justify-self-start'} onClick={()=>{setError('');setConfirm(true);}}>
        Bukukan {selectedRows.length} pos · {cashRupiah(selectedTotal)}
      </button>}
    </section>
    <FinanceDialog open={Boolean(editor)} title={edit?'Ubah rencana rutin':'Tambah rencana rutin'} close={()=>setEditor(null)} busy={busy} error={error}>
      {editor && <form className="grid gap-3" onSubmit={submit} key={edit?.id || 'new'}>
        <label className="text-sm font-semibold">Nama pengeluaran<input className={financeField} name="title" minLength={2} maxLength={200} required defaultValue={edit?.title} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Nominal (Rp)<input className={financeField} name="amount" type="number" min="0.01" step="0.01" required defaultValue={edit?.amount} /></label>
          <label className="text-sm font-semibold">Tanggal setiap periode<input className={financeField} name="day" type="number" min="1" max="31" step="1" required defaultValue={edit?.executionDay || 1} /></label>
          <label className="text-sm font-semibold">Kategori<select className={financeField} name="category" required defaultValue={edit?.categoryId || ''}>
            <option value="" disabled>Pilih kategori</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <label className="text-sm font-semibold">Rekening<select className={financeField} name="account" required defaultValue={edit?.accountId || accounts[0]?.id}>
            {accounts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <label className="text-sm font-semibold">Frekuensi<select className={financeField} value={annual?'yearly':'monthly'} onChange={event=>setAnnual(event.target.value==='yearly')}>
            <option value="monthly">Bulanan</option><option value="yearly">Tahunan</option>
          </select></label>
          {annual && <label className="text-sm font-semibold">Bulan<select className={financeField} name="annualMonth" defaultValue={edit?.executionMonth || 1}>
            {Array.from({length:12},(_,index)=><option key={index} value={index+1}>{financeMonth('2000-'+String(index+1).padStart(2,'0')).replace(' 2000','')}</option>)}
          </select></label>}
        </div>
        <label className="text-sm font-semibold">Vendor (opsional)<input className={financeField} name="vendor" maxLength={160} defaultValue={edit?.vendor} /></label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={edit?.isActive ?? true} />Aktif</label>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} className={financeButton} onClick={()=>setEditor(null)}>Tutup</button>
          <button type="submit" disabled={busy} className={financePrimary}>{busy?'Menyimpan…':'Simpan rencana'}</button></div>
      </form>}
    </FinanceDialog>
    <FinanceDialog open={Boolean(remove)} title="Hapus rencana rutin" close={()=>setRemove(null)} busy={busy} error={error}>
      <p className="text-sm">{remove?.title}. Riwayat yang sudah dibukukan tetap tersedia.</p>
      <div className="flex flex-wrap justify-end gap-2"><button type="button" className={financeButton} onClick={()=>setRemove(null)} disabled={busy}>Tutup</button>
        <button type="button" className={financePrimary} disabled={busy} onClick={()=>void store(stored.items.filter(item=>item.id!==remove?.id))}>Hapus rencana</button></div>
    </FinanceDialog>
    <FinanceDialog open={confirm} title="Bukukan pengeluaran rutin" close={()=>setConfirm(false)} busy={busy} error={error}>
      <p className="text-sm">{selectedRows.length} pembayaran senilai <strong>{cashRupiah(selectedTotal)}</strong> akan dicatat ke Buku Kas.</p>
      <div className="flex flex-wrap justify-end gap-2"><button type="button" className={financeButton} onClick={()=>setConfirm(false)} disabled={busy}>Tutup</button>
        <button type="button" className={financePrimary} disabled={busy} onClick={()=>void post()}>{busy?'Membukukan…':'Bukukan pembayaran'}</button></div>
    </FinanceDialog>
  </div>;
}
