import React, { useState } from 'react';
import { PORTAL_ACCOUNTS, type DemoAccountInfo } from '../../types/auth';
import { Building2, ShieldCheck, Home, KeyRound, User, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, BarChart3 } from 'lucide-react';

interface UnifiedLoginViewProps {
  initialPortal?: 'resident' | 'admin';
}

export const UnifiedLoginView: React.FC<UnifiedLoginViewProps> = ({ initialPortal = 'resident' }) => {
  const [activePortal, setActivePortal] = useState<'resident' | 'admin'>(initialPortal);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Harap isi username/no. rumah dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, portal: activePortal }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error?.message || 'Login gagal. Periksa kembali data Anda.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.data?.message || 'Berhasil masuk!');
      setTimeout(() => {
        window.location.href = data.data?.redirectUrl || (activePortal === 'admin' ? '/admin' : '/warga');
      }, 500);
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server autentikasi.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc: DemoAccountInfo) => {
    setIdentifier(acc.username);
    setPassword(acc.defaultPassword);
    setActivePortal(acc.targetPortal);
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: acc.username, password: acc.defaultPassword, portal: acc.targetPortal }),
      });
      const data = await res.json();
      if (res.ok && data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      } else {
        setErrorMsg(data.error?.message || 'Gagal masuk.');
        setLoading(false);
      }
    } catch (e) {
      setErrorMsg('Koneksi gagal.');
      setLoading(false);
    }
  };

  const accountsList = Object.values(PORTAL_ACCOUNTS);
  const residentAccounts = accountsList.filter(a => a.targetPortal === 'resident');
  const adminAccounts = accountsList.filter(a => a.targetPortal === 'admin');

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-surface shadow-md mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Warga<span className="text-primary-600">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sistem Tata Kelola & Transparansi Komplek Taman Sejahtera
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-surface border border-border rounded-2xl shadow-xs mb-6">
          <button
            type="button"
            onClick={() => {
              setActivePortal('resident');
              setErrorMsg('');
              setIdentifier('warga_a17');
              setPassword('warga123');
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePortal === 'resident'
                ? 'bg-primary-600 text-surface shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <Home className="w-4 h-4" />
            Portal Warga
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMsg('');
              setIdentifier('ketua');
              setPassword('admin123');
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePortal === 'admin'
                ? 'bg-primary-600 text-surface shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Portal Pengurus & Admin
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-surface py-8 px-6 sm:px-10 border border-border rounded-3xl shadow-card space-y-6">
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
                  {activePortal === 'resident' ? 'Akses Warga Mandiri' : 'Akses Backoffice Pengurus'}
                </span>
                <h2 className="text-xl font-bold text-ink mt-1.5">
                  {activePortal === 'resident' ? 'Masuk ke Portal Warga' : 'Masuk Dashboard Pengurus'}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center text-primary-700">
                {activePortal === 'resident' ? <Home className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              {activePortal === 'resident'
                ? 'Gunakan nomor rumah (misal: A-17) atau username warga Anda.'
                : 'Khusus Ketua Komplek, Bendahara, Sekretaris, dan Petugas.'}
            </p>
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
                {activePortal === 'resident' ? 'Nomor Rumah / Username' : 'Username / Email Pengurus'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={activePortal === 'resident' ? 'Contoh: A-17 atau warga_a17' : 'Contoh: ketua atau bendahara'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Password / PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password atau PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-border rounded-xl text-sm font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Akun Demo Cepat (1-Klik Masuk):
              </span>
              <span className="text-[11px] text-ink-muted">Klik untuk langsung masuk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(activePortal === 'resident' ? residentAccounts : adminAccounts).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="p-3 bg-canvas hover:bg-primary-50 border border-border hover:border-primary-300 rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={acc.avatarUrl}
                      alt={acc.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-border"
                    />
                    <div>
                      <p className="text-xs font-bold text-ink group-hover:text-primary-700 leading-tight">
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-ink-muted">{acc.roleTitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-ink-muted group-hover:bg-primary-600 group-hover:text-surface group-hover:border-primary-600 transition-colors">
                    {acc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Public Transparency Direct Link */}
          <div className="p-3.5 bg-primary-50/60 rounded-xl border border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-primary-900 font-medium">
              <BarChart3 className="w-4 h-4 text-primary-700" />
              <span>Ingin melihat Laporan Keuangan Publik?</span>
            </div>
            <a
              href="/transparency"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 hover:underline flex items-center gap-1"
            >
              Buka Publik <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
