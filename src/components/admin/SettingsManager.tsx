import React, { useState } from 'react';
import { Settings, Save, Check, ShieldAlert, Building, CreditCard, PhoneCall } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');
  const [rtRw, setRtRw] = useState('RT 02 / RW 05');
  const [address, setAddress] = useState('Jl. Taman Sejahtera Utama No. 1, Jakarta Selatan');
  const [monthlyFee, setMonthlyFee] = useState('750000');
  const [dueDay, setDueDay] = useState('10');
  const [bankName, setBankName] = useState('BCA (Bank Central Asia)');
  const [bankAccount, setBankAccount] = useState('8830-1928-33');
  const [accountHolder, setAccountHolder] = useState('PENGURUS KOMPLEK TAMAN SEJAHTERA');
  const [securityPhone, setSecurityPhone] = useState('0811-9988-7766');
  const [rwHeadPhone, setRwHeadPhone] = useState('0812-3456-7890');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName,
          rtRw,
          address,
          monthlyRate: Number(monthlyFee),
          bankName,
          bankAccount,
          accountHolder,
          securityPhone,
          rwHeadPhone,
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Pengaturan & Profil Komplek</h1>
        <p className="text-sm text-ink-muted mt-1">
          Konfigurasi identitas perumahan, rekening bank resmi iuran, dan kontak darurat satpam 24 jam.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Section 1: Profil Lingkungan */}
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-sm text-ink">Identitas & Wilayah Lingkungan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-ink block mb-1">Nama Komplek / Perumahan</label>
              <input
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
              />
            </div>
            <div>
              <label className="font-bold text-ink block mb-1">Rukun Tetangga / RW</label>
              <input
                type="text"
                value={rtRw}
                onChange={(e) => setRtRw(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-ink block mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
            />
          </div>
        </div>

        {/* Section 2: Keuangan & Rekening Iuran */}
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CreditCard className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-sm text-ink">Tarif Iuran Bulanan & Rekening Penampung</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-ink block mb-1">Nominal Iuran Bulanan (Rp)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
              />
            </div>
            <div>
              <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo Bulanan</label>
              <input
                type="number"
                min="1"
                max="28"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-ink block mb-1">Nama Bank Resmi</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
              />
            </div>
            <div>
              <label className="font-bold text-ink block mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-ink block mb-1">Nama Pemilik Rekening (Atas Nama)</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              required
              className="w-full p-2.5 bg-canvas border border-border rounded-xl font-semibold text-ink"
            />
          </div>
        </div>

        {/* Section 3: Kontak Darurat */}
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <PhoneCall className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-sm text-ink">Hotline & Kontak Darurat 24 Jam</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-ink block mb-1">Hotline Pos Satpam Utama (24 Jam)</label>
              <input
                type="tel"
                value={securityPhone}
                onChange={(e) => setSecurityPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
              />
            </div>
            <div>
              <label className="font-bold text-ink block mb-1">Kontak Hotline Ketua Pengurus</label>
              <input
                type="tel"
                value={rwHeadPhone}
                onChange={(e) => setRwHeadPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Check className="w-4 h-4" /> Pengaturan berhasil disimpan ke Neon PostgreSQL!
            </span>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};
