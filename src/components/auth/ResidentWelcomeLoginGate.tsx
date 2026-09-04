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
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
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
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), portal: 'resident' }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || 'Login gagal. Periksa kembali nomor rumah / PIN Anda.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.data?.message || 'Berhasil masuk ke Portal Warga!');
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
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Complex Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-600 text-white shadow-md mb-3">
          <Building2 className="w-9 h-9" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Warga<span className="text-primary-600">Hub</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200">
            PORTAL WARGA
          </span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
          Layanan Mandiri Warga Komplek Taman Sejahtera • Iuran Digital, E-Voting, Izin Kerja, dan Aduan Lingkungan
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Main Card */}
        <div className="bg-surface py-7 px-6 sm:px-10 border border-border rounded-3xl shadow-card space-y-6">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
                Autentikasi Warga
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-ink mt-1">
                Masuk ke Portal Warga
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Nomor Rumah / Username / No. HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: A-17, warga_a17, atau 08123456789"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-xs sm:text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Password / PIN Warga
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password atau PIN akun Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-border rounded-xl text-xs sm:text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary-600 focus:ring-primary-500"
                />
                <span className="text-ink-muted font-medium">Ingat Saya</span>
              </label>
              <span className="text-[11px] text-ink-muted flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                SSL 256-Bit
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Portal Warga</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration & Assistance Note */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              Warga Baru Belum Terdaftar?
            </span>
            <a
              href="/login?tab=resident_register"
              className="font-bold text-primary-700 hover:text-primary-800 hover:underline"
            >
              Registrasi Hunian →
            </a>
          </div>

          {/* Public Transparency & Dues Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <a
              href="/rekap-iuran"
              className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950">Rekap Iuran Warga</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </a>

            <a
              href="/transparency"
              className="p-3 rounded-xl bg-primary-50/70 border border-primary-200 hover:bg-primary-100/70 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary-700" />
                <span className="font-bold text-primary-950">Laporan Kas Terbuka</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-primary-700" />
            </a>
          </div>

          {/* Admin Switcher */}
          <div className="pt-2 text-center">
            <a
              href="/login?portal=admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-ink-muted" />
              Anda Pengurus / Pengelola Komplek? Masuk ke Portal Admin
            </a>
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
    </div>
  );
};
