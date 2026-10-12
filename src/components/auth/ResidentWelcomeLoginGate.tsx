import React, { useState } from 'react';
import {
  Building2,
  Home,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  Receipt,
  FileText
} from 'lucide-react';

export const ResidentWelcomeLoginGate: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!identifier.trim() || !password) {
      setErrorMsg('Harap isi nomor rumah / username dan password / PIN.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password, portal: 'resident' }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || 'Login gagal. Periksa kembali nomor rumah / PIN Anda.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.data?.message || 'Berhasil masuk. Membuka portal warga…');
      if (typeof window !== 'undefined' && data.data?.user) {
        localStorage.setItem('wargahub_user', JSON.stringify(data.data.user));
        window.dispatchEvent(new CustomEvent('wargahub_user_changed', { detail: data.data.user }));
      }
      setTimeout(() => {
        window.location.href = data.data?.redirectUrl || '/warga';
      }, 400);
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi.');
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-[100dvh] bg-canvas flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Complex Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Warga<span className="text-primary-600">Hub</span>
          </h1>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
          Komplek Grand Sariwangi
        </p>
      </div>

      <div className="mt-7 mx-auto w-full max-w-md">
        {/* Main Card */}
        <div className="bg-surface py-7 px-6 sm:px-8 border border-border rounded-2xl shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Masuk portal warga
              </h2>
              <p className="text-sm text-ink-muted mt-2">Cek iuran dan urus kebutuhan rumah Anda.</p>
            </div>
          </div>

          {errorMsg && (
            <div id="resident-login-error" role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div role="status" className="p-3.5 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" aria-busy={loading}>
            <div>
              <label htmlFor="resident-identifier" className="block text-sm font-medium text-ink mb-2">
                Nomor rumah, username, atau HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="resident-identifier"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby={errorMsg ? 'resident-login-error' : undefined}
                  placeholder="Contoh: Kav A atau 0812…"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-dark rounded-xl text-sm text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="resident-password" className="block text-sm font-medium text-ink mb-2">
                Kata sandi atau PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="resident-password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-border-dark rounded-xl text-sm text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-ink-muted hover:text-ink rounded-r-xl"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span role="status">Memeriksa akun…</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration & Assistance Note */}
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              Belum punya akun?
            </span>
            <a
              href="/login?tab=resident_register"
              className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
            >
              Daftar hunian
            </a>
          </div>

          {/* Public Transparency & Dues Links */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/rekap-iuran"
              className="p-3 rounded-xl bg-canvas hover:bg-primary-50 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-700" />
                <span className="font-semibold text-ink">Rekap iuran</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-primary-700" />
            </a>

            <a
              href="/transparency"
              className="p-3 rounded-xl bg-canvas hover:bg-primary-50 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary-700" />
                <span className="font-semibold text-ink">Laporan kas</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-primary-700" />
            </a>
          </div>

          {/* Admin Switcher */}
          <details className="text-sm text-ink-muted"><summary className="cursor-pointer py-2">Lupa kata sandi atau butuh bantuan?</summary><p className="pt-2 leading-relaxed">Hubungi pengurus komplek untuk memulihkan akses akun Anda.</p><a href="/login?tab=security_faq" className="inline-block py-3 text-primary-700 font-semibold">Panduan akses akun</a></details>
          <div className="pt-2 text-center">
            <a
              href="/login?portal=admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-ink-muted" />
              Masuk sebagai pengurus
            </a>
            <a href="/login?portal=security&tab=guard_terminal" className="block text-xs text-ink-muted hover:text-primary-700 mt-3 py-2">Akses petugas keamanan</a>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-border/80 text-center text-[11px] text-ink-muted">
            <span>Dikembangkan oleh </span>
            <a
              href="https://yahyanursidik.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
            >
              Yahya Nursidik
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
