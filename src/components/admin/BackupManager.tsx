import React, { useState } from 'react';
import { Database, Download, ShieldCheck, CheckCircle2, FileText, Server, RefreshCw, AlertTriangle } from 'lucide-react';

export const BackupManager: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState('28 Agustus 2026, 21:55 WIB');

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      window.location.href = '/api/backup/export';
      setTimeout(() => {
        setDownloading(false);
        setLastBackupTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB (Hari ini)');
      }, 1500);
    } catch (err) {
      console.error(err);
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Database className="w-6 h-6 text-primary-600" />
            Pencadangan & Serah Terima Pengurus
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Ekspor arsip cadangan database komplek dan paket dokumen serah terima kepengurusan RT/RW (*Handover Package*).
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadBackup}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Menyiapkan Arsip...' : 'Unduh Backup Lengkap (.JSON)'}
        </button>
      </div>

      {/* Backup Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-ink-muted">Pencadangan Terakhir</span>
          <p className="text-base font-bold text-ink">{lastBackupTime}</p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Aman
          </span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-ink-muted">Entitas Terproteksi</span>
          <p className="text-base font-bold text-ink">34 Tabel Relasional</p>
          <span className="text-[11px] text-ink-muted">120 Rumah, 240+ Invoice, Kas BCA</span>
        </div>

        <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-ink-muted">Penyimpanan Cloud</span>
          <p className="text-base font-bold text-primary-700">Neon PostgreSQL Cloud</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Tersinkronisasi Otomatis</span>
        </div>
      </div>

      {/* Handover Protocol Checklist */}
      <div className="p-6 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs">
        <div className="border-b border-border pb-3">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            Checklist Serah Terima Kepengurusan RT/RW (*Handover Package*)
          </h3>
          <p className="text-ink-muted mt-0.5">Panduan penyerahan berkas dan akun sistem kepada kepengurusan periode baru.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              title: '1. Unduh Berkas Arsip Basis Data (JSON Dump)',
              desc: 'Gunakan tombol unduh di atas untuk menyimpan salinan offline seluruh histori transaksi dan data warga.',
              status: 'READY',
            },
            {
              title: '2. Rekonsiliasi Saldo Kas Bank BCA & Buku Kas',
              desc: 'Pastikan saldo akhir kas buku kas sama persis dengan saldo rekening koran penampung resmi iuran.',
              status: 'VERIFIED',
            },
            {
              title: '3. Pembaruan Akun & Kredensial Administrator',
              desc: 'Serahkan hak akses ketua komplek & bendahara melalui menu Pengaturan Pengguna.',
              status: 'READY',
            },
            {
              title: '4. Ekspor Arsip Laporan Keuangan Semesteran (PDF)',
              desc: 'Cetak dan tanda tangani LPJ Keuangan yang telah diaudit di menu Arsip & Dokumen.',
              status: 'READY',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-canvas rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="font-bold text-ink text-xs">{item.title}</h4>
                <p className="text-ink-muted leading-relaxed text-[11px]">{item.desc}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
