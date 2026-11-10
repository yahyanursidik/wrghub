/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Copy, KeyRound, Plus, X } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';
import { isResidentRole } from '../../lib/access-policy';
import { mayManageCredential, minimumNewPassword } from '../../lib/account-recovery';
import { roleLabels } from '../../lib/navigation';
import type { UserRole } from '../../types/auth';
import { ModalDialog } from '../shared/ModalDialog';

type UserItem={id:string;username:string;fullName:string;role:UserRole;propertyCode?:string|null;isActive:boolean};
type Props={actor:{id:string;role:UserRole};initialHouse?:string;houses:{id:string;code:string}[]};
type Issued={code:string;expiresAt:string;username:string};
const field='mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm';
const choices = Object.keys(roleLabels) as UserRole[];

export function UserPasswordSettingsTab({actor,initialHouse='',houses}:Props) {
  const [users,setUsers]=useState<UserItem[]>([]);
  const [search,setSearch]=useState(initialHouse);
  const [onlyHouse,setOnlyHouse]=useState(Boolean(initialHouse));
  const [group,setGroup]=useState('all');
  const [pending,setPending]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [target,setTarget]=useState<UserItem|null>(null);
  const [issued,setIssued]=useState<Issued|null>(null);
  const [pinMode,setPinMode]=useState(false);
  const [creating,setCreating]=useState(false);
  const [newRole,setNewRole]=useState<UserRole>('HOUSEHOLD_HEAD');
  const [busy,setBusy]=useState(false);
  const [modalError,setModalError]=useState('');
  const [notice,setNotice]=useState('');
  const canEdit=actor.role==='SUPER_ADMIN' || actor.role==='CHAIRMAN';

  const load=useCallback(async()=>{
    setPending(true); setLoadError('');
    try { const response=await apiFetch('/api/users'); setUsers((await response.json()).data); }
    catch(error) { setLoadError(error instanceof Error ? error.message : 'Daftar akun belum dapat dimuat.'); }
    finally { setPending(false); }
  },[]);
  useEffect(()=>{void load();},[load]);
  const visible=users.filter(item=>{
    if(onlyHouse && item.propertyCode?.toLowerCase()!==initialHouse.toLowerCase()) return false;
    if(group==='residents' && !isResidentRole(item.role)) return false;
    if(group==='staff' && isResidentRole(item.role)) return false;
    return [item.fullName,item.username,item.propertyCode].some(value=>value?.toLowerCase().includes(search.trim().toLowerCase()));
  });
  function close() { if(busy) return; setTarget(null); setIssued(null); setModalError(''); setNotice(''); setCreating(false); setPinMode(false); }
  async function issue(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!target || busy || !new FormData(event.currentTarget).has('verified')) return;
    setBusy(true); setModalError('');
    try {
      const response=await apiFetch('/api/users/recovery-code',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId:target.id,identityVerified:true})});
      setIssued((await response.json()).data);
    } catch(error) {setModalError(error instanceof Error ? error.message : 'Kode belum dapat dibuat.');}
    finally {setBusy(false);}
  }
  async function changePin(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!target || busy) return;
    const pin=String(new FormData(event.currentTarget).get('pin') || '');
    setBusy(true);setModalError('');
    try {
      await apiFetch('/api/users/update-password',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId:target.id,newPassword:pin,reason:'Pengaturan PIN pos oleh pengurus'})});
      setTarget(null);setPinMode(false);setNotice('PIN pos diperbarui.');
    } catch(error) {setModalError(error instanceof Error ? error.message : 'PIN belum dapat disimpan.');}
    finally {setBusy(false);}
  }
  async function create(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy) return;
    setBusy(true);setModalError('');
    const form=event.currentTarget;
    try {
      await apiFetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...Object.fromEntries(new FormData(form)),role:newRole})});
      form.reset();setCreating(false);void load();
    } catch(error) {setModalError(error instanceof Error ? error.message : 'Akun belum dapat dibuat.');}
    finally {setBusy(false);}
  }

  return <section className="space-y-4" aria-label="Direktori akun">
    {initialHouse && <a href={'/admin/properties?tab=units&house='+encodeURIComponent(initialHouse)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-800">
      <ArrowLeft className="h-4 w-4" aria-hidden /> Rumah {initialHouse}
    </a>}
    <div className="grid min-w-0 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
      <label className="block min-w-0 text-sm font-semibold">Cari akun
        <input type="search" value={search} onChange={event=>{setSearch(event.target.value);setOnlyHouse(false);}} placeholder="Nama, username, atau rumah" className={field} />
      </label>
      <label className="block text-sm font-semibold">Kelompok
        <select value={group} onChange={event=>setGroup(event.target.value)} className={field}>
          <option value="all">Semua akun</option><option value="residents">Warga</option><option value="staff">Pengurus dan petugas</option>
        </select>
      </label>
      {canEdit && <button type="button" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap" onClick={()=>{setNewRole('HOUSEHOLD_HEAD');setCreating(true);}}>
        <Plus className="h-4 w-4" aria-hidden /> Tambah akun
      </button>}
    </div>
    {notice && !target && <p role="status" className="rounded-lg bg-primary-50 p-3 text-sm text-primary-800">{notice}</p>}
    {pending && <p role="status" className="rounded-xl border border-border p-4 text-sm text-ink-muted">Memuat akun…</p>}
    {loadError && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{loadError} <button type="button" onClick={load} className="font-semibold underline">Coba lagi</button></p>}
    {!pending && !loadError && !visible.length && <p className="rounded-xl border border-border p-4 text-sm text-ink-muted">{onlyHouse ? 'Belum ada akun untuk rumah ini.' : 'Tidak ada akun yang cocok.'}</p>}
    {!pending && !loadError && visible.length>0 && <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {visible.map(item=><li key={item.id} className="grid min-w-0 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-semibold [overflow-wrap:anywhere]">{item.fullName}</p>
          <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">{item.username} · {roleLabels[item.role] || item.role}{item.propertyCode ? ' · '+item.propertyCode : ''}</p>
        </div>
        {item.isActive && mayManageCredential(actor,item) ? <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setTarget(item)} className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap">
          <KeyRound className="h-4 w-4" aria-hidden /> Kode pemulihan
        </button>{item.role==='SECURITY' && <button type="button" className="btn-secondary min-h-11" onClick={()=>{setPinMode(true);setTarget(item);}}>Setel PIN</button>}</div> : <span className="text-xs font-semibold text-ink-muted">{item.isActive ? 'Aktif' : 'Nonaktif'}</span>}
      </li>)}
    </ul>}
    <ModalDialog open={Boolean(target)} onClose={close} label={pinMode?"Setel PIN pos":"Kode pemulihan"} className="w-[min(32rem,calc(100vw-2rem))]">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{pinMode?"Setel PIN pos":"Kode pemulihan"}</h2><button type="button" aria-label="Tutup" onClick={close} disabled={busy} className="min-h-11 min-w-11"><X className="mx-auto h-5 w-5" /></button></div>
        {target && <p className="break-words text-sm text-ink-muted">{target.fullName} · {target.username}</p>}
        {pinMode ? <form onSubmit={changePin} className="space-y-3">
          <label className="block text-sm font-semibold">PIN baru<input name="pin" type="password" inputMode="numeric" pattern="[0-9]{6}" required maxLength={6} autoComplete="new-password" className={field} /></label>
          <button type="submit" className="btn-primary min-h-11" disabled={busy}>{busy?'Menyimpan…':'Simpan PIN'}</button>
        </form> : issued ? <div className="space-y-3">
          <p className="text-sm">Bagikan secara pribadi kepada pemilik akun. Kode hanya ditampilkan di sini.</p>
          <code className="block rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">{issued.code}</code>
          <p className="text-xs text-ink-muted">Berlaku sampai {new Date(issued.expiresAt).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})} WIB.</p>
          <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(issued.code);setNotice('Kode disalin.');}catch{setNotice('Salin kode secara manual.');}}} className="btn-secondary inline-flex min-h-11 items-center gap-2"><Copy className="h-4 w-4" aria-hidden /> Salin kode</button>
          {notice && <p role="status" className="text-xs">{notice}</p>}
        </div> : <form onSubmit={issue} className="space-y-3">
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="verified" required /> Saya sudah memeriksa identitas pemilik akun.</label>
          <button type="submit" className="btn-primary min-h-11 disabled:opacity-60" disabled={busy}>{busy?'Menyiapkan…':'Buat kode'}</button>
        </form>}
        {modalError && <p role="alert" className="text-sm text-rose-800">{modalError}</p>}
      </div>
    </ModalDialog>
    <ModalDialog open={creating} onClose={close} label="Tambah akun" className="w-[min(32rem,calc(100vw-2rem))]">
      <form className="space-y-3 p-5" onSubmit={create}>
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">Tambah akun</h2><button type="button" aria-label="Tutup" onClick={close} disabled={busy} className="min-h-11 min-w-11"><X className="mx-auto h-5 w-5" /></button></div>
        <label className="block text-sm font-semibold">Nama lengkap<input name="fullName" className={field} required maxLength={150} /></label>
        <label className="block text-sm font-semibold">Username<input name="username" className={field} autoComplete="off" required minLength={2} maxLength={60} /></label>
        <label className="block text-sm font-semibold">Peran<select className={field} value={newRole} onChange={event=>setNewRole(event.target.value as UserRole)}>
          {choices.filter(role=>mayManageCredential(actor,{id:'new',role})).map(role=><option key={role} value={role}>{roleLabels[role]}</option>)}
        </select></label>
        <label className="block text-sm font-semibold">Rumah<select key={isResidentRole(newRole)?'resident':'staff'} name="propertyCode" defaultValue={initialHouse} required={isResidentRole(newRole)} className={field}>
          <option value="">Pilih rumah</option>{houses.map(house=><option key={house.id} value={house.code}>{house.code}</option>)}
        </select></label>
        <label className="block text-sm font-semibold">{newRole==='SECURITY'?'PIN pos 6 digit atau kata sandi':'Kata sandi awal'}<input name="password" type="password" autoComplete="new-password" required minLength={newRole==='SECURITY'?6:minimumNewPassword} maxLength={1024} className={field} /></label>
        {modalError && <p role="alert" className="text-sm text-rose-800">{modalError}</p>}
        <button type="submit" className="btn-primary min-h-11 disabled:opacity-60" disabled={busy}>{busy?'Menyimpan…':'Buat akun'}</button>
      </form>
    </ModalDialog>
  </section>;
}
