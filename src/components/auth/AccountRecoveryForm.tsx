import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { minimumNewPassword, recoveryCodePattern } from '../../lib/account-recovery';

export function AccountRecoveryForm({ loginHref }: {loginHref:string}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [done,setDone]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form=event.currentTarget;
    const fields=new FormData(form);
    const code=String(fields.get('code') || '').trim();
    const newPassword=String(fields.get('password') || '');
    if (!recoveryCodePattern.test(code)) return setError('Salin kode pemulihan lengkap dari pengurus.');
    if (newPassword !== fields.get('confirmation')) return setError('Ulangi kata sandi yang sama.');
    setBusy(true);
    try {
      const response=await fetch('/api/auth/recover',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({code,newPassword})});
      const result=await response.json();
      if (!response.ok) { setError(result.error?.message || 'Pemulihan belum bisa diselesaikan.'); return; }
      form.reset();
      setDone(true);
    } catch { setError('Koneksi terputus. Coba lagi.'); }
    finally { setBusy(false); }
  }
  if(done) return <div className="space-y-4" role="status">
    <CheckCircle2 className="h-7 w-7 text-primary-700" aria-hidden />
    <h2 className="text-xl font-bold text-ink">Kata sandi diperbarui</h2>
    <p className="text-sm text-ink-muted">Masuk kembali dengan kata sandi baru.</p>
    <a className="btn-primary inline-flex min-h-11 items-center" href={loginHref}>Masuk</a>
  </div>;
  return <form className="space-y-4" onSubmit={submit}>
    <label className="block text-sm font-semibold text-ink">Kode pemulihan
      <input name="code" required autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={64}
        className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 font-mono focus-visible:outline-2 focus-visible:outline-primary-700" />
    </label>
    <label className="block text-sm font-semibold text-ink">Kata sandi baru
      <input name="password" type="password" required minLength={minimumNewPassword} maxLength={1024} autoComplete="new-password"
        className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-primary-700" />
    </label>
    <label className="block text-sm font-semibold text-ink">Ulangi kata sandi
      <input name="confirmation" type="password" required minLength={minimumNewPassword} maxLength={1024} autoComplete="new-password"
        className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 focus-visible:outline-2 focus-visible:outline-primary-700" />
    </label>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    <div className="flex flex-wrap items-center gap-2">
      <button type="submit" disabled={busy} className="btn-primary inline-flex min-h-11 items-center gap-2 disabled:opacity-60">
        <KeyRound className="h-4 w-4" aria-hidden /> {busy?'Menyimpan…':'Atur kata sandi'}
      </button>
      <a href={loginHref} className="btn-secondary inline-flex min-h-11 items-center gap-2"><ArrowLeft className="h-4 w-4" aria-hidden /> Kembali</a>
    </div>
  </form>;
}
