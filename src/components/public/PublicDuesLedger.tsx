import React, { useState, useMemo } from 'react';
import {
  Home,
  CheckCircle2,
  Hourglass,
  Search,
  Filter,
  Share2,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Building,
  ShieldCheck,
  Receipt,
  Calendar,
  Send,
  Eye,
  CreditCard,
  QrCode,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

interface PropertyDuesItem {
  code: string;
  number: string;
  block: string;
  ownerName: string;
  phone?: string;
  monthlyRate: number;
  status: 'PAID' | 'UNPAID';
  paidAt?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

export const PublicDuesLedger: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState('Agustus 2026');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'code' | 'owner' | 'amount' | 'status'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Feedback
  const [selectedReceipt, setSelectedReceipt] = useState<PropertyDuesItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate All 123 Complex Properties (Blok A-D, Kavling, and Jl. Sariwangi Indah)
  const propertiesData: PropertyDuesItem[] = useMemo(() => {
    const list: PropertyDuesItem[] = [];

    // Blok A (30 Units)
    for (let i = 1; i <= 30; i++) {
      const isPaid = i !== 12 && i !== 24; // 28 Paid, 2 Unpaid
      list.push({
        code: `A-${i.toString().padStart(2, '0')}`,
        number: `${i}`,
        block: 'Blok A',
        ownerName: i === 17 ? 'Budi Santoso' : `Warga Blok A No. ${i}`,
        monthlyRate: 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(10 + (i % 12)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? (i % 3 === 0 ? 'TUNAI_BENDAHARA' : 'BCA_TRANSFER') : undefined,
        receiptNumber: isPaid ? `KWT-202608-A${i}` : undefined,
      });
    }

    // Blok B (30 Units)
    for (let i = 1; i <= 30; i++) {
      const isPaid = i !== 5 && i !== 18 && i !== 29; // 27 Paid, 3 Unpaid
      list.push({
        code: `B-${i.toString().padStart(2, '0')}`,
        number: `${i}`,
        block: 'Blok B',
        ownerName: `Warga Blok B No. ${i}`,
        monthlyRate: 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(12 + (i % 10)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-B${i}` : undefined,
      });
    }

    // Blok C (30 Units)
    for (let i = 1; i <= 30; i++) {
      const isPaid = i !== 7 && i !== 22; // 28 Paid, 2 Unpaid
      list.push({
        code: `C-${i.toString().padStart(2, '0')}`,
        number: `${i}`,
        block: 'Blok C',
        ownerName: `Warga Blok C No. ${i}`,
        monthlyRate: 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(14 + (i % 8)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'QRIS_DINAMIS' : undefined,
        receiptNumber: isPaid ? `KWT-202608-C${i}` : undefined,
      });
    }

    // Blok D (30 Units)
    for (let i = 1; i <= 30; i++) {
      const isPaid = i !== 14; // 29 Paid, 1 Unpaid
      list.push({
        code: `D-${i.toString().padStart(2, '0')}`,
        number: `${i}`,
        block: 'Blok D',
        ownerName: `Warga Blok D No. ${i}`,
        monthlyRate: 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(11 + (i % 11)).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-D${i}` : undefined,
      });
    }

    // Kavling Mandiri (10 Units)
    for (let i = 1; i <= 10; i++) {
      const isPaid = i !== 4; // 9 Paid, 1 Unpaid
      list.push({
        code: `KAV-${i.toString().padStart(2, '0')}`,
        number: `${i}`,
        block: 'Kavling Mandiri',
        ownerName: `Pemilik Kavling ${i}`,
        monthlyRate: 750000,
        status: isPaid ? 'PAID' : 'UNPAID',
        paidAt: isPaid ? `2026-08-${(15 + i).toString().padStart(2, '0')}` : undefined,
        paymentMethod: isPaid ? 'BCA_TRANSFER' : undefined,
        receiptNumber: isPaid ? `KWT-202608-KAV${i}` : undefined,
      });
    }

    // Jl. Sariwangi Indah 1 & 2 (13 Units)
    for (let i = 1; i <= 13; i++) {
      const streetName = i <= 6 ? 'Jl. Sariwangi Indah 1' : 'Jl. Sariwangi Indah 2';
      list.push({
        code: i <= 6 ? `SW1-${i.toString().padStart(2, '0')}` : `SW2-${(i - 6).toString().padStart(2, '0')}`,
        number: `${i}`,
        block: streetName,
        ownerName: `Warga ${streetName} No. ${i}`,
        monthlyRate: 750000,
        status: 'PAID',
        paidAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, '0')}`,
        paymentMethod: 'BCA_TRANSFER',
        receiptNumber: `KWT-202608-SW${i}`,
      });
    }

    return list;
  }, []);

  // Metrics
  const totalUnits = propertiesData.length;
  const paidCount = propertiesData.filter((p) => p.status === 'PAID').length;
  const unpaidCount = propertiesData.filter((p) => p.status === 'UNPAID').length;
  const paidPercentage = totalUnits > 0 ? (paidCount / totalUnits) * 100 : 0;
  const totalCollected = paidCount * 750000;
  const totalUnpaidAmount = unpaidCount * 750000;

  // Filter & Sort
  const filteredAndSortedProperties = useMemo(() => {
    const list = propertiesData.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchBlock = blockFilter === 'ALL' || p.block === blockFilter;
      const matchSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.block.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchBlock && matchSearch;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      else if (sortBy === 'owner') comparison = a.ownerName.localeCompare(b.ownerName);
      else if (sortBy === 'amount') comparison = a.monthlyRate - b.monthlyRate;
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [propertiesData, statusFilter, blockFilter, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalFiltered = filteredAndSortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, endIndex);

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Tautan rekapitulasi iuran warga berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Kode Rumah / Unit', 'Blok / Jalan', 'Nama Pemilik', 'Nominal Iuran (Rp)', 'Status Pembayaran', 'Tanggal Bayar', 'Metode Bayar', 'No. Kuitansi'];
    const rows = filteredAndSortedProperties.map((p) => [
      p.code,
      `"${p.block}"`,
      `"${p.ownerName}"`,
      p.monthlyRate,
      p.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS',
      p.paidAt || '-',
      p.paymentMethod || '-',
      p.receiptNumber || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAPITULASI_IURAN_WARGAHUB_${activePeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data rekapitulasi iuran warga berhasil diunduh (CSV).');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header & Period */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 font-black rounded-xl text-xs border border-primary-200">
                🌐 PORTAL REKAPITULASI PUBLIK
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-black rounded-xl text-xs border border-emerald-200">
                {activePeriod} (Bulan Aktif)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mt-2">
              Daftar Rekapitulasi Iuran Warga Komplek
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed max-w-2xl">
              Halaman publik terbuka untuk memantau status pembayaran iuran warga (Blok A, B, C, D, Kavling Mandiri, dan Jl. Sariwangi Indah). Warga dapat memeriksa status dan mengunduh kuitansi digital resmi ber-QR Code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-white hover:bg-canvas text-ink font-bold text-xs rounded-xl border border-border shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              {copiedLink ? 'Tersalin!' : 'Salin Tautan'}
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `📢 Rekapitulasi Iuran Warga Bulan ${activePeriod}\n\n• Tingkat Kelunasan: ${paidCount} dari ${totalUnits} Rumah (${paidPercentage.toFixed(1)}%)\n• Terkumpul: Rp ${totalCollected.toLocaleString('id-ID')}\n• Belum Bayar: ${unpaidCount} Rumah (Rp ${totalUnpaidAmount.toLocaleString('id-ID')})\n\nPeriksa status unit dan download kuitansi pembayaran di:\nhttp://localhost:4321/rekap-iuran`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Bagikan ke Grup WhatsApp
            </a>
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2.5 bg-surface hover:bg-canvas text-ink-muted hover:text-ink rounded-xl border border-border"
              title="Unduh CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Participation Bar */}
        <div className="p-5 bg-canvas rounded-2xl border border-border/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xl sm:text-2xl font-black text-ink">
                {paidCount} dari {totalUnits} Rumah ({paidPercentage.toFixed(1)}%) Telah Lunas
              </span>
              <p className="text-xs text-ink-muted mt-0.5">
                Total Dana Terkumpul: <strong className="text-emerald-700 font-mono">{formatRupiah(totalCollected)}</strong> • Sisa Piutang: <strong className="text-rose-700 font-mono">{formatRupiah(totalUnpaidAmount)}</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black self-start sm:self-center">
              ✓ Arus Kas Sangat Tertib
            </span>
          </div>

          <div className="w-full bg-surface rounded-full h-3.5 overflow-hidden border border-border">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* 4 Summary Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
            <span className="text-ink-muted font-medium block">Total Rumah</span>
            <span className="text-xl font-black text-ink font-mono mt-1 block">{totalUnits} Unit</span>
          </div>
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-emerald-900 font-medium block">Sudah Lunas</span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">{paidCount} Unit ({formatRupiah(totalCollected)})</span>
          </div>
          <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200 shadow-xs">
            <span className="text-rose-900 font-medium block">Menunggu Bayar</span>
            <span className="text-xl font-black text-rose-700 font-mono mt-1 block">{unpaidCount} Unit ({formatRupiah(totalUnpaidAmount)})</span>
          </div>
          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 shadow-xs">
            <span className="text-indigo-900 font-medium block">Iuran per Rumah</span>
            <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">Rp 750.000 / bln</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-4 rounded-3xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-canvas text-ink-muted hover:text-ink border border-border'
            }`}
          >
            Semua Rumah ({totalUnits})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('PAID');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-canvas text-emerald-800 hover:bg-emerald-50 border border-border'
            }`}
          >
            ✓ Sudah Lunas ({paidCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('UNPAID');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors ${
              statusFilter === 'UNPAID'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-canvas text-rose-800 hover:bg-rose-50 border border-border'
            }`}
          >
            ⏳ Belum Bayar ({unpaidCount})
          </button>
        </div>

        {/* Search & Area Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari no. rumah / nama..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink"
            />
          </div>

          <select
            value={blockFilter}
            onChange={(e) => {
              setBlockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="ALL">Semua Wilayah</option>
            <option value="Blok A">Blok A</option>
            <option value="Blok B">Blok B</option>
            <option value="Blok C">Blok C</option>
            <option value="Blok D">Blok D</option>
            <option value="Kavling Mandiri">Kavling Mandiri</option>
            <option value="Jl. Sariwangi Indah 1">Jl. Sariwangi Indah 1</option>
            <option value="Jl. Sariwangi Indah 2">Jl. Sariwangi Indah 2</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="code">Urut No. Unit</option>
            <option value="owner">Urut Nama</option>
            <option value="status">Urut Status</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dues Table with Pagination */}
      <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-canvas border-b border-border text-ink-muted font-bold">
              <tr>
                <th className="py-4 px-4">No. Unit & Rumah</th>
                <th className="py-4 px-4">Wilayah / Blok</th>
                <th className="py-4 px-4">Nama Pemilik</th>
                <th className="py-4 px-4 text-right">Nominal Iuran</th>
                <th className="py-4 px-4 text-center">Status Pembayaran</th>
                <th className="py-4 px-4 text-center">Tanggal & Metode</th>
                <th className="py-4 px-4 text-right">Kuitansi Resmi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-ink-muted font-medium">
                    Tidak ada unit rumah yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((p) => {
                  const isPaid = p.status === 'PAID';
                  return (
                    <tr key={p.code} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-ink text-sm">
                        {p.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink-muted">
                        {p.block}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink">
                        {p.ownerName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-ink">
                        {formatRupiah(p.monthlyRate)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            ✓ LUNAS (VERIFIED)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-black border border-rose-300">
                            ⏳ BELUM LUNAS
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <div>
                            <span className="font-mono text-ink font-bold block">{p.paidAt}</span>
                            <span className="text-[10px] text-ink-muted">{p.paymentMethod?.replace('_', ' ')}</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-xl font-bold inline-flex items-center gap-1.5 text-xs shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Lihat Kuitansi
                          </button>
                        ) : (
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                              `Halo Bapak/Ibu ${p.ownerName} (${p.code}), mohon izin mengingatkan untuk iuran paguyuban periode ${activePeriod} sebesar ${formatRupiah(p.monthlyRate)}. Pembayaran dapat ditransfer ke Rekening BCA: 7720-192-881 an Paguyuban WargaHub. Terima kasih.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-ink-muted hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                            title="Kirim Pengingat WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" /> Ingatkan
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-ink-muted">
              Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalFiltered}</strong> rumah
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-ink-muted">Baris:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-surface border border-border rounded-lg font-bold text-ink"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={120}>120</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Awal"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = safeCurrentPage - 2 + i;
                if (pageNum < 1) pageNum = i + 1;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      safeCurrentPage === pageNum
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-surface border border-border text-ink hover:bg-canvas'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
              title="Akhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: KUITANSI PEMBAYARAN DIGITAL RESMI BER-QR CODE */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Tanda Terima & Kuitansi Digital Resmi</h3>
                <p className="text-[11px] text-ink-muted">No: {selectedReceipt.receiptNumber}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Unit Rumah:</span>
                <span className="font-black text-ink font-mono">{selectedReceipt.code} ({selectedReceipt.block})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Nama Warga / Pemilik:</span>
                <span className="font-bold text-ink">{selectedReceipt.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Periode Iuran:</span>
                <span className="font-bold text-primary-700">{activePeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Setor:</span>
                <span className="font-mono text-ink">{selectedReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode Pembayaran:</span>
                <span className="font-semibold text-ink">{selectedReceipt.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Jumlah Dibayarkan:</span>
                <span className="font-black text-base text-emerald-700 font-mono">{formatRupiah(selectedReceipt.monthlyRate)}</span>
              </div>
            </div>

            {/* QR Code & Verified Stamp */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-black text-emerald-950 text-xs">LUNAS & TERVERIFIKASI</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Rekening BCA: 7720-192-881 an Paguyuban WargaHub
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl border border-emerald-300 p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-emerald-800" />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak Kuitansi (PDF)
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 border border-border text-ink font-bold rounded-xl hover:bg-canvas"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
