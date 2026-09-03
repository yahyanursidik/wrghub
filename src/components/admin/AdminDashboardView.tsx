import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Wallet,
  Hourglass,
  Headphones,
  ChevronRight,
  FileText,
  BarChart2,
  Calendar,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Wrench,
  Megaphone,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  AlertCircle,
  Building,
  Car,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Shield,
  Truck,
  DollarSign,
  Send,
  UserCheck,
  Building2,
  Vote,
  Layers,
  PhoneCall,
  BellRing,
  Check,
  Lock,
  RefreshCw,
  AlertTriangle,
  Volume2,
  QrCode,
  Receipt,
  Inbox,
  Filter,
  CheckCircle,
  XCircle,
  Banknote,
  Eye,
  BookOpen,
  FileCheck,
  UserCircle2,
  ArrowRight,
  X,
  FileSpreadsheet,
  UploadCloud,
  Search,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-react';
import { DEMO_USERS, type UserRole, type UserSession } from '../../types/auth';
import { formatRupiah, formatRupiahShort } from '../../lib/format';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface AdminDashboardViewProps {
  stats: {
    totalProperties: number;
    occupiedProperties: number;
    vacantProperties: number;
    occupiedPercentage: string;
    vacantPercentage: string;
    paidCount: number;
    unpaidCount: number;
    paidPercentage: number;
    paidAmount: number;
    unpaidAmount: number;
    monthlyRate: number;
    cashBalance: number;
    pendingPaymentsCount: number;
    openComplaintsCount: number;
    needingRepairCount: number;
  };
  currentUser?: UserSession;
}

interface PendingPayment {
  id: string;
  house: string;
  name: string;
  amount: number;
  method: string;
  time: string;
  note: string;
  proofUrl?: string;
  refNumber: string;
}

interface VisitorItem {
  id: string;
  name: string;
  unit: string;
  plate: string;
  category: string;
  inTime: string;
  status: 'Di Dalam' | 'Sudah Keluar';
}

const AdminDashboardInner: React.FC<AdminDashboardViewProps> = ({ stats: initialStats, currentUser }) => {
  // Live stats with optimistic mutability
  const [stats, setStats] = useState(initialStats);
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2026');
  const [activityFilter, setActivityFilter] = useState<'all' | 'finance' | 'complaint' | 'security' | 'facility'>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [budgetCategoryFilter, setBudgetCategoryFilter] = useState('ALL');

  // Active user session state
  const [activeUser, setActiveUser] = useState<UserSession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {}
    }
    return currentUser || DEMO_USERS.ketua;
  });

  // Dynamic dashboard role filter (defaults to active user role)
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(() => {
    return activeUser?.role || currentUser?.role || 'CHAIRMAN';
  });

  // Dynamic dashboard title & subtitle from settings
  const [dashHeading, setDashHeading] = useState('Dashboard Eksekutif Komplek');
  const [dashSubheading, setDashSubheading] = useState('Pusat Kendali Operasional, Keuangan Kas & Layanan Warga Komplek.');
  const [communityName, setCommunityName] = useState('Komplek Perumahan Taman Sejahtera');

  // Security gate live state
  const [gate1Open, setGate1Open] = useState(false);
  const [gate2Open, setGate2Open] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ================= MODAL STATES =================
  const [showIssueInvoiceModal, setShowIssueInvoiceModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [showPaymentReviewModal, setShowPaymentReviewModal] = useState(false);
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<PendingPayment | null>(null);
  const [selectedBlockDrilldown, setSelectedBlockDrilldown] = useState<string | null>(null);

  // Form: Terbitkan Invoice Tagihan IPL
  const [invPeriod, setInvPeriod] = useState('September 2026');
  const [invBlockTarget, setInvBlockTarget] = useState('ALL');
  const [invRate, setInvRate] = useState(750000);
  const [invDueDate, setInvDueDate] = useState('2026-09-10');
  const [invSendWa, setInvSendWa] = useState(true);
  const [invNotes, setInvNotes] = useState('Iuran Pengelolaan Lingkungan (Keamanan, Kebersihan TPS3R & Fasum)');

  // Form: Siaran Pengumuman & WhatsApp Broadcast
  const [bcTitle, setBcTitle] = useState('');
  const [bcCategory, setBcCategory] = useState('AGENDA_WARGA');
  const [bcTarget, setBcTarget] = useState('ALL');
  const [bcContent, setBcContent] = useState('');
  const [bcSendWa, setBcSendWa] = useState(true);

  // Form: Catat Pengeluaran Kas Keluar
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('OPERASIONAL');
  const [expAmount, setExpAmount] = useState<number>(500000);
  const [expRecipient, setExpRecipient] = useState('');
  const [expMethod, setExpMethod] = useState<'TRANSFER' | 'CASH'>('TRANSFER');
  const [expNotes, setExpNotes] = useState('');

  // Form: Registrasi Tamu Baru Pos Satpam
  const [visName, setVisName] = useState('');
  const [visPlate, setVisPlate] = useState('');
  const [visCategory, setVisCategory] = useState('Keluarga / Tamu');
  const [visHouse, setVisHouse] = useState('A-04');
  const [visPurpose, setVisPurpose] = useState('Kunjungan keluarga silaturahmi');

  // Reason for reject payment
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Treasurer quick verification state
  const [pendingList, setPendingList] = useState<PendingPayment[]>([
    { id: 'pay-01', house: 'B-12', name: 'Hendra Wijaya', amount: 750000, method: 'Transfer Bank BCA', time: '10 mnt lalu', note: 'Iuran IPL Agt 2026', refNumber: 'TRX-BCA-987112', proofUrl: '/proof-bca.jpg' },
    { id: 'pay-02', house: 'A-04', name: 'Ridwan Fauzi', amount: 750000, method: 'QRIS Mandiri', time: '25 mnt lalu', note: 'Iuran IPL + Fasum', refNumber: 'QRIS-MND-445102', proofUrl: '/proof-qris.jpg' },
    { id: 'pay-03', house: 'C-09', name: 'Dewi Lestari', amount: 1500000, method: 'Transfer Bank BCA', time: '1 jam lalu', note: 'Iuran 2 Bulan (Agt-Sep)', refNumber: 'TRX-BCA-661908', proofUrl: '/proof-bca2.jpg' },
  ]);

  // Live Visitors List
  const [visitors, setVisitors] = useState<VisitorItem[]>([
    { id: 'v-1', name: 'Ridwan Fauzi (Tamu Keluarga)', unit: 'A-04', plate: 'B 1234 SAK', category: 'Keluarga', inTime: '08:30 WIB', status: 'Di Dalam' },
    { id: 'v-2', name: 'Kurir J&T Express (Antar Paket)', unit: 'B-07, B-12', plate: 'B 4567 TUV', category: 'Kurir Logistik', inTime: '09:15 WIB', status: 'Di Dalam' },
    { id: 'v-3', name: 'GrabFood Delivery', unit: 'C-03', plate: 'B 8899 XYZ', category: 'Ojol Makanan', inTime: '09:40 WIB', status: 'Di Dalam' },
    { id: 'v-4', name: 'Teknisi Servis AC Daikin', unit: 'A-17', plate: 'B 3344 KLM', category: 'Teknisi/Servis', inTime: '07:50 WIB', status: 'Sudah Keluar' },
  ]);

  useEffect(() => {
    try {
      const savedHead = localStorage.getItem('wargahub_set_dash_heading');
      const savedSub = localStorage.getItem('wargahub_set_dash_subheading');
      const savedComm = localStorage.getItem('wargahub_set_comm_name');
      const savedUser = localStorage.getItem('wargahub_user');
      if (savedHead) setDashHeading(JSON.parse(savedHead));
      if (savedSub) setDashSubheading(JSON.parse(savedSub));
      if (savedComm) setCommunityName(JSON.parse(savedComm));
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setActiveUser(parsed);
        setActiveRoleView(parsed.role || 'CHAIRMAN');
      }
    } catch (e) {}

    const handleUserChanged = (e: any) => {
      const newUser = e.detail;
      if (newUser) {
        setActiveUser(newUser);
        setActiveRoleView(newUser.role || 'CHAIRMAN');
      }
    };

    window.addEventListener('wargahub_user_changed', handleUserChanged);
    return () => window.removeEventListener('wargahub_user_changed', handleUserChanged);
  }, []);

  // Budget comparison table data
  const [budgetRows, setBudgetRows] = useState([
    {
      id: 'b-1',
      category: 'PEMASUKAN',
      keterangan: 'Pemasukan (Iuran Lingkungan & IPL)',
      anggaran: 90000000,
      realisasi: 64500000,
      selisih: -25500000,
      isPositive: false,
      pct: 71.7,
      status: 'On Track',
    },
    {
      id: 'b-2',
      category: 'OPERASIONAL',
      keterangan: 'Gaji & Operasional Satpam/Kebersihan',
      anggaran: 45000000,
      realisasi: 28350000,
      selisih: 16650000,
      isPositive: true,
      pct: 63.0,
      status: 'Hemat 37%',
    },
    {
      id: 'b-3',
      category: 'PEMELIHARAAN',
      keterangan: 'Pemeliharaan Fasum, PJU & Pompa Air',
      anggaran: 20000000,
      realisasi: 12600000,
      selisih: 7400000,
      isPositive: true,
      pct: 63.0,
      status: 'Terkendali',
    },
    {
      id: 'b-4',
      category: 'CADANGAN',
      keterangan: 'Kas Cadangan & Pembangunan Fasilitas',
      anggaran: 25000000,
      realisasi: 23550000,
      selisih: -1450000,
      isPositive: false,
      pct: 94.2,
      status: 'Hampir Penuh',
    },
  ]);

  const filteredBudgetData = budgetRows.filter(b => {
    const matchSearch = b.keterangan.toLowerCase().includes(budgetSearch.toLowerCase());
    const matchCat = budgetCategoryFilter === 'ALL' || b.category === budgetCategoryFilter;
    return matchSearch && matchCat;
  });

  // Block compliance data
  const blockStats = [
    {
      block: 'Blok A (Boulevard Utama)',
      code: 'A',
      total: 32,
      paid: 31,
      pct: 96.8,
      color: 'bg-emerald-500',
      note: '1 unit proses verifikasi',
      houses: [
        { no: 'A-01', name: 'Bpk. Hendrawan', status: 'Lunas', phone: '081234567801' },
        { no: 'A-04', name: 'Bpk. Ridwan Fauzi', status: 'Verifikasi', phone: '081234567804' },
        { no: 'A-17', name: 'Bpk. Budi Santoso', status: 'Lunas', phone: '081234567817' },
        { no: 'A-22', name: 'Ibu Rina Saptari', status: 'Lunas', phone: '081234567822' },
      ]
    },
    {
      block: 'Blok B (Taman Barat)',
      code: 'B',
      total: 30,
      paid: 28,
      pct: 93.3,
      color: 'bg-emerald-500',
      note: '2 unit jatuh tempo 25 Agt',
      houses: [
        { no: 'B-03', name: 'Bpk. Antonius', status: 'Lunas', phone: '081234567903' },
        { no: 'B-07', name: 'Ibu Siti Khadijah', status: 'Tertunggak', phone: '081234567907' },
        { no: 'B-12', name: 'Bpk. Hendra Wijaya', status: 'Verifikasi', phone: '081234567912' },
      ]
    },
    {
      block: 'Blok C (Taman Timur)',
      code: 'C',
      total: 31,
      paid: 30,
      pct: 96.7,
      color: 'bg-emerald-500',
      note: '1 unit kosong',
      houses: [
        { no: 'C-01', name: 'Bpk. Gunawan', status: 'Lunas', phone: '081234568101' },
        { no: 'C-09', name: 'Ibu Dewi Lestari', status: 'Verifikasi', phone: '081234568109' },
        { no: 'C-15', name: 'Unit Kosong (Pemilik Luar Kota)', status: 'Kosong', phone: '-' },
      ]
    },
    {
      block: 'Blok D (Taman Selatan)',
      code: 'D',
      total: 30,
      paid: 28,
      pct: 93.3,
      color: 'bg-emerald-500',
      note: '2 unit konfirmasi transfer',
      houses: [
        { no: 'D-02', name: 'Bpk. Fajar Ramadhan', status: 'Lunas', phone: '081234568202' },
        { no: 'D-08', name: 'Ibu Maya Melati', status: 'Tertunggak', phone: '081234568208' },
      ]
    },
  ];

  // Activities list
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      type: 'finance',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      category: 'finance',
      title: 'Pembayaran IPL Rumah A-17 Terverifikasi',
      detail: 'Bpk. Budi Santoso membayar Rp 750.000 via Transfer BCA',
      time: '12 menit lalu',
      link: '/admin/payments',
    },
    {
      id: 'act-2',
      type: 'security',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-200',
      category: 'security',
      title: 'Tamu Masuk: Kurir Ekspedisi J&T',
      detail: 'Tujuan Rumah B-07 (Telah diverifikasi Satpam Pos 1)',
      time: '28 menit lalu',
      link: '/admin/security-gate',
    },
    {
      id: 'act-3',
      type: 'complaint',
      icon: Headphones,
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200',
      category: 'complaint',
      title: 'Aduan Warga: PJU Blok C Mati',
      detail: 'Dilaporkan oleh warga C-12, teknisi ditugaskan untuk survei',
      time: '1 jam lalu',
      link: '/admin/complaints',
    },
    {
      id: 'act-4',
      type: 'facility',
      icon: Truck,
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200',
      category: 'facility',
      title: 'Rute Sampah Pagi Selesai (Viar Tossa 01)',
      detail: 'Pengangkutan door-to-door Blok A & B telah dituntaskan',
      time: 'Pukul 09:30 WIB',
      link: '/admin/cleaning-staff',
    },
  ]);

  const filteredActivities = activities.filter((act) => {
    const matchCat = activityFilter === 'all' || act.category === activityFilter;
    const matchSearch = act.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
                        act.detail.toLowerCase().includes(activitySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ================= ACTION HANDLERS =================
  // 1. Submit Terbitkan Invoice
  const handleIssueInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = invBlockTarget === 'ALL' ? stats.totalProperties : 30;
    showToast(`✓ Berhasil menerbitkan ${count} invoice tagihan IPL untuk periode ${invPeriod}!`);
    setShowIssueInvoiceModal(false);
  };

  // 2. Submit Broadcast Pengumuman
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle || !bcContent) return;
    const newAct = {
      id: `act-${Date.now()}`,
      type: 'broadcast',
      icon: Megaphone,
      iconBg: 'bg-purple-50 text-purple-700 border border-purple-200',
      category: 'facility',
      title: `Siaran Edaran: ${bcTitle}`,
      detail: bcContent.slice(0, 75) + '...',
      time: 'Baru saja',
      link: '/admin/announcements',
    };
    setActivities([newAct, ...activities]);
    showToast(`✓ Pengumuman "${bcTitle}" berhasil disiarkan ke ${bcTarget === 'ALL' ? '342 Jiwa Warga' : 'Blok Terpilih'}!`);
    setShowBroadcastModal(false);
    setBcTitle('');
    setBcContent('');
  };

  // 3. Submit Kas Keluar
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    setStats(prev => ({
      ...prev,
      cashBalance: prev.cashBalance - Number(expAmount),
    }));
    // Update budget rows
    setBudgetRows(prev => prev.map(r => {
      if (r.category === expCategory) {
        const newReal = r.realisasi + Number(expAmount);
        return {
          ...r,
          realisasi: newReal,
          selisih: r.anggaran - newReal,
          pct: Number(((newReal / r.anggaran) * 100).toFixed(1))
        };
      }
      return r;
    }));
    showToast(`✓ Pengeluaran kas senilai ${formatRupiah(expAmount)} berhasil dicatat!`);
    setShowAddExpenseModal(false);
    setExpTitle('');
    setExpAmount(500000);
    setExpRecipient('');
    setExpNotes('');
  };

  // 4. Submit Registrasi Tamu Baru
  const handleAddVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPlate) return;
    const newVis: VisitorItem = {
      id: `vis-${Date.now()}`,
      name: visName,
      unit: visHouse,
      plate: visPlate.toUpperCase(),
      category: visCategory,
      inTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'Di Dalam',
    };
    setVisitors([newVis, ...visitors]);
    showToast(`✓ Tamu ${visName} (Tujuan Rumah ${visHouse}) berhasil dicatat di buku tamu pos.`);
    setShowAddVisitorModal(false);
    setVisName('');
    setVisPlate('');
  };

  // 5. Tandai Tamu Keluar
  const handleMarkVisitorExited = (id: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'Sudah Keluar' } : v));
    showToast('✓ Tamu berhasil ditandai keluar dari komplek.');
  };

  // 6. Handle Approve / Reject Payment
  const handleApprovePayment = (id: string) => {
    const item = pendingList.find(p => p.id === id);
    if (item) {
      setPendingList(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({
        ...prev,
        paidCount: prev.paidCount + 1,
        unpaidCount: Math.max(0, prev.unpaidCount - 1),
        paidAmount: prev.paidAmount + item.amount,
        unpaidAmount: Math.max(0, prev.unpaidAmount - item.amount),
        cashBalance: prev.cashBalance + item.amount,
        pendingPaymentsCount: Math.max(0, prev.pendingPaymentsCount - 1),
      }));
      showToast(`✓ Pembayaran ${item.house} (${item.name}) senilai ${formatRupiah(item.amount)} disetujui & kuitansi terbit.`);
      setShowPaymentReviewModal(false);
    }
  };

  const handleRejectPayment = () => {
    if (!selectedPendingPayment) return;
    const item = selectedPendingPayment;
    setPendingList(prev => prev.filter(p => p.id !== item.id));
    setStats(prev => ({
      ...prev,
      pendingPaymentsCount: Math.max(0, prev.pendingPaymentsCount - 1),
    }));
    showToast(`Pembayaran ${item.house} ditolak: "${rejectReason || 'Bukti transfer tidak valid'}".`);
    setShowPaymentReviewModal(false);
    setShowRejectInput(false);
    setRejectReason('');
  };

  // Switch gate relay
  const triggerGate = (gate: 1 | 2) => {
    if (gate === 1) {
      setGate1Open(true);
      showToast('⚡ Palang Gerbang 1 (Pintu Masuk) DIBUKA (Relay 8 Detik)');
      setTimeout(() => setGate1Open(false), 8000);
    } else {
      setGate2Open(true);
      showToast('⚡ Palang Gerbang 2 (Pintu Keluar) DIBUKA (Relay 8 Detik)');
      setTimeout(() => setGate2Open(false), 8000);
    }
  };

  // Export APB data to CSV
  const handleExportBudgetCSV = () => {
    const header = "Pos Anggaran,Target Pagu (Rp),Realisasi Riil (Rp),Selisih (Rp),Persentase (%),Status\n";
    const body = filteredBudgetData.map(r => 
      `"${r.keterangan}",${r.anggaran},${r.realisasi},${r.selisih},${r.pct}%,"${r.status}"`
    ).join("\n");
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_APB_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Laporan APB berhasil di-export ke CSV!');
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP SEGMENTED ROLE CONTROLLER ================= */}
      <div className="bg-surface rounded-3xl p-4 sm:p-5 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SISTEM AKTIF ONLINE
            </span>
            <span className="text-[11px] text-ink-muted font-medium font-mono">
              RT 02 / RW 05 • {communityName}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
            <span>Pusat Kendali Peran:</span>
            <span className="text-primary-700 font-extrabold">
              {activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN'
                ? 'Ketua Paguyuban'
                : activeRoleView === 'TREASURER'
                ? 'Bendahara Keuangan'
                : activeRoleView === 'SECRETARY'
                ? 'Sekretaris Paguyuban'
                : activeRoleView === 'SECURITY'
                ? 'Satpam Pos Gerbang'
                : activeRoleView === 'MAINTENANCE'
                ? 'Tim Kebersihan & Teknisi'
                : 'Warga Komplek'}
            </span>
          </h2>
        </div>

        {/* Role Selector Segmented Controller */}
        <div className="flex items-center gap-1 p-1 bg-canvas border border-border/80 rounded-2xl overflow-x-auto no-scrollbar text-[11px]">
          {[
            { role: 'CHAIRMAN' as UserRole, label: 'Ketua', count: null },
            { role: 'TREASURER' as UserRole, label: 'Bendahara', count: pendingList.length > 0 ? `${pendingList.length}` : null },
            { role: 'SECRETARY' as UserRole, label: 'Sekretaris', count: null },
            { role: 'SECURITY' as UserRole, label: 'Satpam', count: `${visitors.filter(v => v.status === 'Di Dalam').length} Tamu` },
            { role: 'MAINTENANCE' as UserRole, label: 'Kebersihan', count: null },
            { role: 'HOUSEHOLD_HEAD' as UserRole, label: 'Warga', count: null },
          ].map((tab) => {
            const isActive = activeRoleView === tab.role;
            return (
              <button
                key={tab.role}
                type="button"
                onClick={() => setActiveRoleView(tab.role)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap active:scale-[0.98] flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD KETUA KOMPLEK / SUPER ADMIN (SWISS BENTO GRID)              */}
      {/* ========================================================================= */}
      {(activeRoleView === 'CHAIRMAN' || activeRoleView === 'SUPER_ADMIN' || activeRoleView === 'RESIDENT_ADMIN') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Header Banner */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  EXECUTIVE SUMMARY
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  TAHUN ANGGARAN 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {dashHeading}
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                {dashSubheading}
              </p>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowIssueInvoiceModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Terbitkan Tagihan IPL</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <Megaphone className="w-4 h-4 text-primary-400" />
                <span>Siaran Edaran Warga</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-300 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>Catat Beban Kas</span>
              </button>
            </div>
          </div>

          {/* SWISS BENTO GRID: Core Financial & Operational Anchors */}
          <div className="grid grid-cols-12 gap-4">
            {/* 1. Primary Anchor: Kas Operasional BCA */}
            <div className="col-span-12 lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between group hover:border-border transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Saldo Kas Perbendaharaan
                      </span>
                      <h4 className="font-bold text-ink text-sm">Rekening Operasional Bank BCA</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                    TERVERIFIKASI
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-ink-muted">Total Likuiditas Kas Aktif:</span>
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-ink tabular-nums mt-0.5">
                    {formatRupiah(stats.cashBalance)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-canvas border border-border/70 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-ink-muted text-[10px] uppercase font-bold block">Pemasukan Bulan Ini:</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">+{formatRupiah(stats.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted text-[10px] uppercase font-bold block">Tunggakan Tertunda:</span>
                    <span className="font-mono font-bold text-rose-600 tabular-nums">{formatRupiah(stats.unpaidAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
                <a href="/admin/ledger" className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 group-hover:underline">
                  <span>Buka Buku Kas & Rekonsiliasi</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
                <span className="text-[10px] font-mono text-ink-muted">Bank ID: 731-0988-221</span>
              </div>
            </div>

            {/* 2. Secondary Anchor: Kepatuhan IPL & Kolektibilitas */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Kepatuhan Warga
                      </span>
                      <h4 className="font-bold text-ink text-sm">Kolektibilitas Iuran IPL</h4>
                    </div>
                  </div>
                  <span className="font-mono font-black text-base text-primary-700">
                    {stats.paidPercentage}%
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-black font-mono text-ink tabular-nums">
                      {stats.paidCount} / {stats.totalProperties}
                    </span>
                    <span className="text-ink-muted font-bold text-[11px]">Unit Lunas</span>
                  </div>
                  
                  {/* Visual Segmented Progress Bar */}
                  <div className="w-full bg-canvas h-3 rounded-full overflow-hidden border border-border/70 p-0.5">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.paidPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between text-ink-muted">
                    <span>Target Tagihan Bulanan:</span>
                    <span className="font-mono font-bold text-ink">{formatRupiah(stats.totalProperties * stats.monthlyRate)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Sisa Tunggakan:</span>
                    <span className="font-mono font-bold text-rose-600">{stats.unpaidCount} Rumah</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowIssueInvoiceModal(true)}
                  className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 active:scale-[0.98]"
                >
                  <span>+ Terbitkan Tagihan Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-ink-muted">{selectedMonth}</span>
              </div>
            </div>

            {/* 3. Third Anchor: Demografi Hunian Komplek */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface rounded-3xl p-6 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-ink-muted block">
                        Inventaris Hunian
                      </span>
                      <h4 className="font-bold text-ink text-sm">Okupansi Rumah</h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-mono font-bold">
                    {stats.occupiedPercentage}%
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-canvas rounded-xl border border-border/70 flex items-center justify-between">
                    <span className="text-ink font-bold">Rumah Dihuni:</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">{stats.occupiedProperties} Unit</span>
                  </div>
                  <div className="p-2.5 bg-canvas rounded-xl border border-border/70 flex items-center justify-between">
                    <span className="text-ink font-bold">Rumah Kosong / Renov:</span>
                    <span className="font-mono font-black text-ink-muted text-sm">{stats.vacantProperties} Unit</span>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted">
                  Estimasi populasi warga aktif tercatat: <strong className="text-ink font-mono font-bold">342 Jiwa</strong> (117 Kepala Keluarga).
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <a href="/admin/properties" className="font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                  <span>Data Blok Rumah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] font-mono text-ink-muted">4 Blok Aktif</span>
              </div>
            </div>
          </div>

          {/* OPERATIONAL STATUS TILES (Tactile 4-Column Strip) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Antrean Verifikasi */}
            <div
              onClick={() => {
                if (pendingList.length > 0) {
                  setSelectedPendingPayment(pendingList[0]);
                  setShowPaymentReviewModal(true);
                }
              }}
              className="p-4 bg-surface rounded-2xl border border-border hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Antrean Verifikasi</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">{pendingList.length} Pembayaran</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">Review →</span>
            </div>

            {/* Tile 2: Tiket Aduan Warga */}
            <a href="/admin/complaints" className="p-4 bg-surface rounded-2xl border border-border hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between group active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Aduan Lingkungan</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">{stats.openComplaintsCount} Tiket Aktif</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform">Pantau →</span>
            </a>

            {/* Tile 3: Keamanan Pos Gerbang */}
            <a href="/admin/security-gate" className="p-4 bg-surface rounded-2xl border border-border hover:border-purple-400 hover:shadow-xs transition-all flex items-center justify-between group active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Pos Satpam 24 Jam</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">4 Regu Aktif</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">Gerbang →</span>
            </a>

            {/* Tile 4: Armada Kebersihan */}
            <a href="/admin/cleaning-staff" className="p-4 bg-surface rounded-2xl border border-border hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between group active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">Armada Viar Tossa</span>
                  <p className="text-lg font-black font-mono text-ink tabular-nums">Rute Pagi Beres</p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform">Jadwal →</span>
            </a>
          </div>

          {/* REALISASI APB & BLOK MATRIX (2-Column Dense Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: APB Ledger Realization Table */}
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Realisasi Anggaran Pendapatan & Belanja (APB)</h3>
                  <p className="text-ink-muted text-[11px]">Rencana pagu vs pengeluaran riil per {selectedMonth}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportBudgetCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-surface border border-border rounded-xl text-[11px] font-bold text-ink active:scale-[0.98] transition-all shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(true)}
                    className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-[11px] active:scale-[0.98] transition-all"
                  >
                    + Beban Kas
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari pos anggaran APB..."
                    value={budgetSearch}
                    onChange={(e) => setBudgetSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-border rounded-xl text-[11px] font-medium text-ink focus:outline-none focus:border-primary-500"
                  />
                </div>
                <select
                  value={budgetCategoryFilter}
                  onChange={(e) => setBudgetCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-canvas border border-border rounded-xl text-[11px] font-bold text-ink focus:outline-none"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="PEMASUKAN">Pemasukan</option>
                  <option value="OPERASIONAL">Operasional</option>
                  <option value="PEMELIHARAAN">Pemeliharaan</option>
                  <option value="CADANGAN">Kas Cadangan</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-ink-muted font-mono uppercase text-[10px]">
                      <th className="pb-2.5 font-bold">Pos Anggaran</th>
                      <th className="pb-2.5 text-right font-bold">Target Pagu</th>
                      <th className="pb-2.5 text-right font-bold">Realisasi Riil</th>
                      <th className="pb-2.5 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredBudgetData.map((row) => (
                      <tr key={row.id} className="text-ink hover:bg-canvas/50 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-bold text-xs">{row.keterangan}</p>
                          <div className="w-36 bg-canvas h-1.5 rounded-full overflow-hidden border border-border/50 mt-1">
                            <div className={`h-full rounded-full ${row.pct > 80 ? 'bg-primary-600' : 'bg-emerald-500'}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right tabular-nums font-mono text-ink-muted">{formatRupiah(row.anggaran)}</td>
                        <td className="py-3 px-2 text-right tabular-nums font-mono font-bold text-ink">{formatRupiah(row.realisasi)}</td>
                        <td className="py-3 pl-2 text-right">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            row.isPositive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Block Compliance Matrix */}
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Kepatuhan Iuran per Blok</h3>
                  <p className="text-ink-muted text-[11px]">Klik blok untuk melihat rincian unit rumah</p>
                </div>
                <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {stats.paidPercentage}% LUNAS
                </span>
              </div>

              <div className="space-y-3">
                {blockStats.map((b) => (
                  <div
                    key={b.block}
                    onClick={() => setSelectedBlockDrilldown(b.code)}
                    className="p-3.5 bg-canvas hover:bg-surface rounded-2xl border border-border/70 hover:border-primary-400 hover:shadow-xs cursor-pointer transition-all space-y-2 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-ink block">{b.block}</span>
                        <span className="text-[10px] text-ink-muted">{b.note}</span>
                      </div>
                      <span className="font-mono font-black text-primary-700">
                        {b.paid}/{b.total} Unit ({b.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/60">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-100 flex items-center justify-between text-xs">
                <span className="text-primary-900 font-bold">Kirim pesan siaran tagihan:</span>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(true)}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  Kirim Pesan
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVITY STREAM & SYSTEM AUDIT LOG TABLE */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <div>
                  <h3 className="text-sm font-black text-ink">Log Aktivitas & Jejak Operasional Real-Time</h3>
                  <p className="text-ink-muted text-[11px]">Rekaman transaksi, gerbang satpam, dan laporan lingkungan</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="px-2.5 py-1.5 bg-canvas border border-border rounded-xl text-[11px] font-medium text-ink w-36 sm:w-44 focus:outline-none"
                />
                <select
                  value={activityFilter}
                  onChange={(e: any) => setActivityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-canvas border border-border rounded-xl text-[11px] font-bold text-ink focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="finance">Keuangan</option>
                  <option value="security">Keamanan</option>
                  <option value="complaint">Aduan Warga</option>
                  <option value="facility">Fasilitas</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {filteredActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3 hover:bg-canvas/40 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${act.iconBg} flex items-center justify-center font-bold shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs">{act.title}</p>
                        <p className="text-[11px] text-ink-muted">{act.detail}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-ink-muted font-mono block">{act.time}</span>
                      <a href={act.link} className="text-[10px] font-bold text-primary-700 hover:underline">
                        Periksa →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DASHBOARD BENDAHARA KEAUANGAN                                         */}
      {/* ========================================================================= */}
      {activeRoleView === 'TREASURER' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-blue-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  TREASURY & AUDIT
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  BENDAHARA KEUANGAN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Manajemen Kas & Rekonsiliasi Iuran Warga
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Verifikasi bukti pembayaran warga secara real-time, pencatatan kas keluar operasional, dan laporan transparansi publik.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (pendingList.length > 0) {
                    setSelectedPendingPayment(pendingList[0]);
                    setShowPaymentReviewModal(true);
                  } else {
                    showToast('Tidak ada antrean verifikasi saat ini.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 rounded-xl font-bold shadow-xs transition-all"
              >
                <Hourglass className="w-4 h-4" />
                <span>Antrean Verifikasi ({pendingList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 rounded-xl font-bold transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Catat Kas Keluar</span>
              </button>
            </div>
          </div>

          {/* Quick Payment Verification Table */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-black text-ink">Antrean Verifikasi Bukti Bayar Warga ({pendingList.length})</h3>
              </div>
              <span className="text-xs text-ink-muted">Klik baris transaksi untuk pratinjau bukti transfer</span>
            </div>

            {pendingList.length === 0 ? (
              <div className="p-10 text-center text-ink-muted space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-ink">Semua pembayaran warga telah selesai diverifikasi!</p>
                <p className="text-xs">Kas telah disesuaikan dan kuitansi digital telah diterbitkan.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {pendingList.map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/50 p-2 rounded-2xl transition-colors">
                    <div
                      onClick={() => {
                        setSelectedPendingPayment(item);
                        setShowPaymentReviewModal(true);
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-black font-mono text-xs shrink-0">
                        {item.house}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink text-xs">{item.name}</p>
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-mono text-[9px] font-bold rounded">
                            {item.refNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted">{item.note} • {item.method} ({item.time})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="font-black font-mono text-ink text-sm tabular-nums">{formatRupiah(item.amount)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPendingPayment(item);
                            setShowPaymentReviewModal(true);
                          }}
                          className="px-3 py-1.5 bg-canvas hover:bg-surface border border-border text-ink rounded-xl text-[11px] font-bold active:scale-[0.98] transition-all"
                        >
                          Lihat Bukti
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(item.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold active:scale-[0.98] shadow-2xs transition-all"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DASHBOARD SATPAM / POS GERBANG                                         */}
      {/* ========================================================================= */}
      {activeRoleView === 'SECURITY' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                  SECURITY COMMAND
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  POS GERBANG SATPAM 24 JAM
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Kontrol Gerbang Palang, Buku Tamu & Sirene
              </h1>
              <p className="text-xs text-slate-300/90 leading-relaxed">
                Kendali barrier gate utama, pemantauan tamu masuk komplek secara real-time, penerimaan laporan SOS darurat, dan koordinasi keamanan 24 jam.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddVisitorModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 rounded-xl font-bold shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Tamu Baru</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSirenActive(!sirenActive);
                  showToast(!sirenActive ? '🚨 SIRENE DARURAT DIAKTIFKAN!' : 'Sirene Darurat Dimatikan');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xs active:scale-[0.98] ${
                  sirenActive ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{sirenActive ? '🚨 SIRENE AKTIF' : 'Tes Sirene Darurat'}</span>
              </button>
            </div>
          </div>

          {/* Quick Remote Gate Control & Visitor Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-sm font-black text-ink border-b border-border pb-3 flex items-center justify-between">
                <span>⚡ Kontrol Remote Palang Gerbang</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Relay Otomatis 8 Detik</span>
              </h3>

              <div className="space-y-3">
                {/* Gate 1 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 1 (Masuk Boulevard)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate1Open ? 'text-emerald-700 font-bold font-mono' : 'text-slate-700 font-bold font-mono'}>
                        {gate1Open ? '🟢 TERBUKA (8s Relay)' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(1)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>

                {/* Gate 2 */}
                <div className="p-4 bg-canvas rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink text-xs">Gerbang 2 (Keluar / Timur)</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Status: <span className={gate2Open ? 'text-emerald-700 font-bold font-mono' : 'text-slate-700 font-bold font-mono'}>
                        {gate2Open ? '🟢 TERBUKA (8s Relay)' : '🔴 TERTUTUP'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerGate(2)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    Buka Palang
                  </button>
                </div>
              </div>
            </div>

            {/* Live Visitor Feed Table */}
            <div className="lg:col-span-7 bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-ink">Buku Tamu Digital Terkini di Komplek</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVisitorModal(true)}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg active:scale-[0.98] transition-all"
                >
                  + Tambah Tamu
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {visitors.map((guest) => (
                  <div key={guest.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs">{guest.name}</p>
                        <p className="text-[11px] text-ink-muted">Rumah {guest.unit} • Plat: {guest.plate} ({guest.category}) • {guest.inTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                        guest.status === 'Di Dalam' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {guest.status}
                      </span>
                      {guest.status === 'Di Dalam' && (
                        <button
                          type="button"
                          onClick={() => handleMarkVisitorExited(guest.id)}
                          className="px-2 py-1 bg-canvas hover:bg-surface border border-border text-ink rounded-lg font-bold text-[10px] active:scale-[0.98] transition-all"
                        >
                          Keluar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. QUICK ACCESS SHORTCUTS DIRECTORY ================= */}
      <div className="bg-surface rounded-3xl p-6 border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-black text-ink">Akses Cepat Seluruh Modul WargaHub</h3>
          </div>
          <span className="text-ink-muted text-[11px] font-mono">12 MODUL TERSEDIA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { title: 'Data Rumah', url: '/admin/properties', icon: Home, color: 'text-blue-700 bg-blue-50 border border-blue-200' },
            { title: 'Penghuni & KK', url: '/admin/properties?tab=occupants', icon: Users, color: 'text-indigo-700 bg-indigo-50 border border-indigo-200' },
            { title: 'Billing & Iuran', url: '/admin/billing', icon: CreditCard, color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
            { title: 'Kas & Ledger', url: '/admin/ledger', icon: Wallet, color: 'text-teal-700 bg-teal-50 border border-teal-200' },
            { title: 'Kasbon Staf', url: '/admin/staff-loans', icon: DollarSign, color: 'text-amber-700 bg-amber-50 border border-amber-200' },
            { title: 'Pos Satpam', url: '/admin/security-gate', icon: ShieldCheck, color: 'text-purple-700 bg-purple-50 border border-purple-200' },
            { title: 'Tim Kebersihan', url: '/admin/cleaning-staff', icon: Truck, color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
            { title: 'Sarana Fasum', url: '/admin/facilities', icon: Building2, color: 'text-sky-700 bg-sky-50 border border-sky-200' },
            { title: 'Aduan Warga', url: '/admin/complaints', icon: Headphones, color: 'text-rose-700 bg-rose-50 border border-rose-200' },
            { title: 'E-Voting & Poll', url: '/admin/voting', icon: Vote, color: 'text-violet-700 bg-violet-50 border border-violet-200' },
            { title: 'Siaran Broadcast', url: '/admin/announcements', icon: Megaphone, color: 'text-amber-700 bg-amber-50 border border-amber-200' },
            { title: 'Master Settings', url: '/admin/settings', icon: Sparkles, color: 'text-primary-700 bg-primary-50 border border-primary-200' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                className="p-3.5 bg-canvas hover:bg-surface rounded-2xl border border-border/80 hover:border-primary-400 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center font-bold group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-ink text-xs group-hover:text-primary-700 transition-colors">
                  {item.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span>© 2026 WargaHub Enterprise. Standar Desain Anti-Slop Swiss Grid.</span>
        <div className="flex items-center gap-3 font-bold text-ink">
          <span>{communityName}</span>
          <span>•</span>
          <span className="text-emerald-700 font-mono">Sistem Terintegrasi Online</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM TERBITKAN TAGIHAN IPL MASSAL                                */}
      {/* ========================================================================= */}
      {showIssueInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary-600" />
                <h3 className="font-black text-base text-ink">Terbitkan Tagihan IPL Warga</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueInvoiceModal(false)}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueInvoiceSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Periode Tagihan</label>
                <input
                  type="text"
                  required
                  value={invPeriod}
                  onChange={(e) => setInvPeriod(e.target.value)}
                  placeholder="Misal: September 2026"
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Target Blok Rumah</label>
                  <select
                    value={invBlockTarget}
                    onChange={(e) => setInvBlockTarget(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="ALL">Semua Blok (123 Unit)</option>
                    <option value="A">Blok A Saja (32 Unit)</option>
                    <option value="B">Blok B Saja (30 Unit)</option>
                    <option value="C">Blok C Saja (31 Unit)</option>
                    <option value="D">Blok D Saja (30 Unit)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tarif Iuran per Unit</label>
                  <input
                    type="number"
                    required
                    value={invRate}
                    onChange={(e) => setInvRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keterangan Tagihan</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink"
                />
              </div>

              <div className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink block">Kirim Pengingat WhatsApp</span>
                  <span className="text-[11px] text-ink-muted">Otomatis kirim tagihan ke nomor WA kepala keluarga</span>
                </div>
                <input
                  type="checkbox"
                  checked={invSendWa}
                  onChange={(e) => setInvSendWa(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowIssueInvoiceModal(false)}
                  className="px-4 py-2 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  Terbitkan Tagihan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM SIARAN PENGUMUMAN & BROADCAST WA                            */}
      {/* ========================================================================= */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base text-ink">Siaran Pengumuman & Broadcast Warga</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Rapat Warga Koordinasi Keamanan & Kas"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori</label>
                  <select
                    value={bcCategory}
                    onChange={(e) => setBcCategory(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="AGENDA_WARGA">Agenda Warga</option>
                    <option value="KEAMANAN">Keamanan & Pos</option>
                    <option value="KEBERSIHAN">Kebersihan & TPS3R</option>
                    <option value="KEUANGAN">Keuangan & Kas</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Target Penerima</label>
                  <select
                    value={bcTarget}
                    onChange={(e) => setBcTarget(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="ALL">Seluruh Warga (342 Jiwa)</option>
                    <option value="KK">Kepala Keluarga Saja (117 KK)</option>
                    <option value="A">Khusus Blok A</option>
                    <option value="B">Khusus Blok B</option>
                    <option value="C">Khusus Blok C</option>
                    <option value="D">Khusus Blok D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Isi Pesan Siaran</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan isi pengumuman atau edaran lengkap di sini..."
                  value={bcContent}
                  onChange={(e) => setBcContent(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink leading-relaxed"
                />
              </div>

              <div className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink block">Kirim via Simulator WhatsApp Bot</span>
                  <span className="text-[11px] text-ink-muted">Terdistribusi ke nomor WhatsApp aktif warga</span>
                </div>
                <input
                  type="checkbox"
                  checked={bcSendWa}
                  onChange={(e) => setBcSendWa(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  Siarkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORM CATAT PENGELUARAN KAS KELUAR                                */}
      {/* ========================================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-base text-ink">Catat Kas Keluar (Voucher Pengeluaran)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Judul / Keperluan Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pembelian Solar Genset Pompa & Bahan Bakar Viar Tossa"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Pos APB</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="OPERASIONAL">Gaji & Operasional Satpam/Kebersihan</option>
                    <option value="PEMELIHARAAN">Pemeliharaan Fasum, PJU & Pompa Air</option>
                    <option value="CADANGAN">Kas Cadangan & Pembangunan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Penerima Dana / Vendor</label>
                  <input
                    type="text"
                    placeholder="Misal: Koordinator Satpam / Toko Listrik"
                    value={expRecipient}
                    onChange={(e) => setExpRecipient(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Metode Pembayaran</label>
                  <select
                    value={expMethod}
                    onChange={(e: any) => setExpMethod(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="TRANSFER">Transfer Bank BCA</option>
                    <option value="CASH">Kas Tunai (Petty Cash)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan nota, kuitansi, atau persetujuan pengurus..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-xs transition-all"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REVIEW & VERIFIKASI BUKTI BAYAR                                   */}
      {/* ========================================================================= */}
      {showPaymentReviewModal && selectedPendingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-ink">Verifikasi Bukti Transfer Warga</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentReviewModal(false);
                  setShowRejectInput(false);
                }}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Mock Transfer Receipt Visualizer */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                  <span>TRANSFER BERHASIL</span>
                  <span>{selectedPendingPayment.time}</span>
                </div>
                <div className="text-center py-1">
                  <span className="text-[11px] text-slate-400 block">Jumlah Transfer:</span>
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">
                    {formatRupiah(selectedPendingPayment.amount)}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] border-t border-slate-800 pt-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dari:</span>
                    <span className="font-bold">{selectedPendingPayment.name} (Rumah {selectedPendingPayment.house})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode:</span>
                    <span>{selectedPendingPayment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Ref:</span>
                    <span>{selectedPendingPayment.refNumber}</span>
                  </div>
                </div>
              </div>

              {showRejectInput ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="font-bold text-rose-700 block">Alasan Penolakan Pembayaran:</label>
                  <input
                    type="text"
                    placeholder="Misal: Bukti buram atau nominal tidak sesuai tagihan"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 bg-canvas border border-rose-300 rounded-xl text-xs text-ink"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1 bg-canvas hover:bg-surface border border-border text-ink rounded-lg font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPayment}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                    >
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold active:scale-[0.98]"
                  >
                    Tolak Pembayaran
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprovePayment(selectedPendingPayment.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold active:scale-[0.98] shadow-xs"
                  >
                    ✓ Setujui & Terbitkan Kuitansi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REGISTRASI TAMU BARU POS SATPAM                                   */}
      {/* ========================================================================= */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-base text-ink">Catat Tamu Masuk Gerbang</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitorModal(false)}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitorSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap Tamu / Driver</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kurir SiCepat / Bpk. Yanto"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Plat Kendaraan</label>
                  <input
                    type="text"
                    required
                    placeholder="B 1234 SAK"
                    value={visPlate}
                    onChange={(e) => setVisPlate(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-mono font-bold text-ink uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Rumah Tujuan</label>
                  <select
                    value={visHouse}
                    onChange={(e) => setVisHouse(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                  >
                    <option value="A-04">Rumah A-04 (Ridwan Fauzi)</option>
                    <option value="A-17">Rumah A-17 (Budi Santoso)</option>
                    <option value="B-07">Rumah B-07 (Siti Khadijah)</option>
                    <option value="B-12">Rumah B-12 (Hendra Wijaya)</option>
                    <option value="C-03">Rumah C-03 (Bambang)</option>
                    <option value="C-09">Rumah C-09 (Dewi Lestari)</option>
                    <option value="D-02">Rumah D-02 (Fajar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kategori Kunjungan</label>
                <select
                  value={visCategory}
                  onChange={(e) => setVisCategory(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
                >
                  <option value="Keluarga / Kerabat">Keluarga / Kerabat</option>
                  <option value="Kurir Logistik / Paket">Kurir Logistik / Paket</option>
                  <option value="Ojek Online / Makanan">Ojek Online / Makanan</option>
                  <option value="Teknisi / Renovasi">Teknisi / Servis Rumah</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keperluan Singkat</label>
                <input
                  type="text"
                  placeholder="Kunjungan keluarga / Antar paket"
                  value={visPurpose}
                  onChange={(e) => setVisPurpose(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddVisitorModal(false)}
                  className="px-4 py-2 bg-canvas hover:bg-surface border border-border text-ink rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold active:scale-[0.98] shadow-xs"
                >
                  Catat Masuk & Buka Gerbang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DRILLDOWN RINCIAN KEPATUHAN BLOK                                  */}
      {/* ========================================================================= */}
      {selectedBlockDrilldown && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink">
                  Rincian Unit Blok {selectedBlockDrilldown}
                </h3>
                <p className="text-xs text-ink-muted">Status pembayaran dan kontak warga</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlockDrilldown(null)}
                className="p-1 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {blockStats.find(b => b.code === selectedBlockDrilldown)?.houses.map((h) => (
                <div key={h.no} className="p-3 bg-canvas rounded-2xl border border-border/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-ink text-xs font-mono">{h.no}</span>
                      <span className="text-xs font-bold text-ink">{h.name}</span>
                    </div>
                    <span className="text-[11px] text-ink-muted">Telp: {h.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                      h.status === 'Lunas' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      h.status === 'Verifikasi' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      h.status === 'Kosong' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {h.status}
                    </span>
                    {h.status === 'Tertunggak' && (
                      <a
                        href={`https://wa.me/?text=Halo%20${h.name},%20mengingatkan%20iuran%20IPL%20komplek%20untuk%20Rumah%20${h.no}`}
                        target="_blank"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        WA Tagihan
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedBlockDrilldown(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
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

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Kendala Memuat Dashboard Admin">
      <AdminDashboardInner {...props} />
    </ErrorBoundary>
  );
};
