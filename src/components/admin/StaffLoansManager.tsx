import React, { useState, useMemo } from 'react';
import {
  Banknote,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Printer,
  Edit3,
  Trash2,
  Eye,
  CreditCard,
  FileText,
  Calendar,
  Phone,
  Shield,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface InstallmentRecord {
  id: string;
  installmentNo: number;
  amount: number;
  paymentDate: string;
  paymentMethod: 'POTONG_GAJI' | 'TUNAI_CASH' | 'TRANSFER_BCA';
  receivedBy: string;
  notes?: string;
}

export interface StaffLoan {
  id: string;
  staffName: string;
  staffRole: 'SATPAM' | 'PETUGAS_KEBERSIHAN' | 'PETUGAS_TAMAN' | 'TEKNISI';
  staffPhone: string;
  baseSalary: number;
  loanType: 'KASBON_CICILAN' | 'GAJI_DI_AWAL' | 'DANA_DARURAT';
  totalLoanAmount: number;
  paidAmount: number;
  remainingBalance: number;
  monthlyDeduction: number;
  tenorMonths: number;
  remainingTenorMonths: number;
  loanDate: string;
  dueDate: string;
  purpose: string;
  approvedBy: string;
  status: 'ACTIVE_INSTALLMENT' | 'PAID_OFF' | 'PENDING_APPROVAL' | 'OVERDUE';
  disbursementSource: string;
  installments: InstallmentRecord[];
  notes?: string;
}

export const StaffLoansManager: React.FC = () => {
  // Helper storage persistence
  const getPersisted = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const savePersisted = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to persist storage:', e);
    }
  };

  const addDeletedIds = (key: string, ids: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      const updated = Array.from(new Set([...list, ...ids]));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save deleted IDs:', e);
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Staff Loans Data
  const initialLoans: StaffLoan[] = [
    {
      id: 'LOAN-001',
      staffName: 'Pak Joko Sutrisno',
      staffRole: 'SATPAM',
      staffPhone: '0812-3344-5566',
      baseSalary: 4500000,
      loanType: 'KASBON_CICILAN',
      totalLoanAmount: 1500000,
      paidAmount: 1000000,
      remainingBalance: 500000,
      monthlyDeduction: 500000,
      tenorMonths: 3,
      remainingTenorMonths: 1,
      loanDate: '2026-06-10',
      dueDate: '2026-09-10',
      purpose: 'Biaya Masuk Sekolah Anak (SMP)',
      approvedBy: 'Ketua RW & Bendahara',
      status: 'ACTIVE_INSTALLMENT',
      disbursementSource: 'Kas Operasional BCA',
      installments: [
        { id: 'inst-1', installmentNo: 1, amount: 500000, paymentDate: '2026-07-01', paymentMethod: 'POTONG_GAJI', receivedBy: 'Hendra Wijaya (Bendahara)', notes: 'Potongan gaji Juli 2026' },
        { id: 'inst-2', installmentNo: 2, amount: 500000, paymentDate: '2026-08-01', paymentMethod: 'POTONG_GAJI', receivedBy: 'Hendra Wijaya (Bendahara)', notes: 'Potongan gaji Agustus 2026' },
      ],
      notes: 'Disetujui untuk pemotongan gaji 3 bulan berturut-turut.'
    },
    {
      id: 'LOAN-002',
      staffName: 'Pak Slamet Riyadi',
      staffRole: 'PETUGAS_KEBERSIHAN',
      staffPhone: '0813-7788-9900',
      baseSalary: 3800000,
      loanType: 'KASBON_CICILAN',
      totalLoanAmount: 1000000,
      paidAmount: 250000,
      remainingBalance: 750000,
      monthlyDeduction: 250000,
      tenorMonths: 4,
      remainingTenorMonths: 3,
      loanDate: '2026-08-05',
      dueDate: '2026-12-05',
      purpose: 'Perbaikan Motor Operasional Sampah',
      approvedBy: 'Bendahara Paguyuban',
      status: 'ACTIVE_INSTALLMENT',
      disbursementSource: 'Kas Tunai Bendahara',
      installments: [
        { id: 'inst-3', installmentNo: 1, amount: 250000, paymentDate: '2026-08-25', paymentMethod: 'TUNAI_CASH', receivedBy: 'Hendra Wijaya (Bendahara)', notes: 'Setoran tunai cicilan ke-1' },
      ],
      notes: 'Motor inventaris butuh ganti ban dan kampas rem.'
    },
    {
      id: 'LOAN-003',
      staffName: 'Pak Dedi Supriyadi',
      staffRole: 'SATPAM',
      staffPhone: '0819-2233-4455',
      baseSalary: 4300000,
      loanType: 'KASBON_CICILAN',
      totalLoanAmount: 800000,
      paidAmount: 800000,
      remainingBalance: 0,
      monthlyDeduction: 400000,
      tenorMonths: 2,
      remainingTenorMonths: 0,
      loanDate: '2026-05-15',
      dueDate: '2026-07-15',
      purpose: 'Penggantian Kacamata & Cek Mata',
      approvedBy: 'Bendahara Paguyuban',
      status: 'PAID_OFF',
      disbursementSource: 'Kas Operasional BCA',
      installments: [
        { id: 'inst-4', installmentNo: 1, amount: 400000, paymentDate: '2026-06-01', paymentMethod: 'POTONG_GAJI', receivedBy: 'Hendra Wijaya', notes: 'Potongan gaji Juni' },
        { id: 'inst-5', installmentNo: 2, amount: 400000, paymentDate: '2026-07-01', paymentMethod: 'POTONG_GAJI', receivedBy: 'Hendra Wijaya', notes: 'Potongan gaji Juli (LUNAS)' },
      ],
      notes: 'Sudah lunas per Juli 2026.'
    },
    {
      id: 'LOAN-004',
      staffName: 'Pak Ujang Suhendra',
      staffRole: 'PETUGAS_TAMAN',
      staffPhone: '0813-7766-5544',
      baseSalary: 3800000,
      loanType: 'GAJI_DI_AWAL',
      totalLoanAmount: 500000,
      paidAmount: 0,
      remainingBalance: 500000,
      monthlyDeduction: 500000,
      tenorMonths: 1,
      remainingTenorMonths: 1,
      loanDate: '2026-08-28',
      dueDate: '2026-09-01',
      purpose: 'Tarik Gaji di Awal (Beli Obat Anak Sakit Panas)',
      approvedBy: 'Ketua RW',
      status: 'ACTIVE_INSTALLMENT',
      disbursementSource: 'Kas Tunai Bendahara',
      installments: [],
      notes: 'Tarik gaji awal 1x potong penuh pada gajian September.'
    },
    {
      id: 'LOAN-005',
      staffName: 'Bambang Sudiro',
      staffRole: 'SATPAM',
      staffPhone: '0812-3456-7801',
      baseSalary: 5200000,
      loanType: 'GAJI_DI_AWAL',
      totalLoanAmount: 1000000,
      paidAmount: 0,
      remainingBalance: 1000000,
      monthlyDeduction: 1000000,
      tenorMonths: 1,
      remainingTenorMonths: 1,
      loanDate: '2026-08-31',
      dueDate: '2026-09-05',
      purpose: 'Pengajuan Gaji di Awal (Perbaikan Genteng Bocor)',
      approvedBy: 'Menunggu Persetujuan',
      status: 'PENDING_APPROVAL',
      disbursementSource: 'Kas Operasional BCA',
      installments: [],
      notes: 'Pengajuan baru, menunggu verifikasi bendahara.'
    }
  ];

  const [loans, setLoans] = useState<StaffLoan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_staff_loans');
        const deletedStr = localStorage.getItem('wargahub_deleted_loans');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((l: any) => !deletedIds.includes(l.id));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return initialLoans;
  });

  // State Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount' | 'remaining'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<StaffLoan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<StaffLoan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit Loan
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [fStaffName, setFStaffName] = useState('Pak Joko Sutrisno');
  const [fStaffRole, setFStaffRole] = useState<StaffLoan['staffRole']>('SATPAM');
  const [fStaffPhone, setFStaffPhone] = useState('0812-3344-5566');
  const [fBaseSalary, setFBaseSalary] = useState(4500000);
  const [fLoanType, setFLoanType] = useState<StaffLoan['loanType']>('KASBON_CICILAN');
  const [fTotalAmount, setFTotalAmount] = useState(1000000);
  const [fMonthlyDeduction, setFMonthlyDeduction] = useState(500000);
  const [fTenorMonths, setFTenorMonths] = useState(2);
  const [fLoanDate, setFLoanDate] = useState(new Date().toISOString().slice(0, 10));
  const [fPurpose, setFPurpose] = useState('Keperluan Mendesak Keluarga');
  const [fDisbursementSource, setFDisbursementSource] = useState('Kas Operasional BCA');
  const [fNotes, setFNotes] = useState('');

  // Form State for Installment
  const [instAmount, setInstAmount] = useState<number>(500000);
  const [instMethod, setInstMethod] = useState<'POTONG_GAJI' | 'TUNAI_CASH' | 'TRANSFER_BCA'>('POTONG_GAJI');
  const [instDate, setInstDate] = useState(new Date().toISOString().slice(0, 10));
  const [instNotes, setInstNotes] = useState('Potongan gaji bulan berjalan');

  // Staff Directory Presets
  const staffPresets = [
    { name: 'Bambang Sudiro', role: 'SATPAM', salary: 5200000, phone: '0812-3456-7801' },
    { name: 'Agus Setiawan', role: 'SATPAM', salary: 4300000, phone: '0812-3456-7802' },
    { name: 'Dedi Kurniawan', role: 'SATPAM', salary: 4500000, phone: '0812-3456-7803' },
    { name: 'Slamet Riyadi', role: 'SATPAM', salary: 5200000, phone: '0812-3456-7804' },
    { name: 'Hendro Siswanto', role: 'TEKNISI', salary: 4500000, phone: '0812-3456-7805' },
    { name: 'Rudi Hartono', role: 'PETUGAS_KEBERSIHAN', salary: 4400000, phone: '0812-3456-7806' },
    { name: 'Wawan Gunawan', role: 'SATPAM', salary: 5200000, phone: '0812-3456-7807' },
    { name: 'Tri Handoko', role: 'SATPAM', salary: 4300000, phone: '0812-3456-7808' },
    { name: 'Pak Ujang Suhendra', role: 'PETUGAS_TAMAN', salary: 3800000, phone: '0813-7766-5544' },
    { name: 'Pak Joko Sutrisno', role: 'SATPAM', salary: 4500000, phone: '0812-3344-5566' },
  ];

  // Calculations & KPIs
  const totalActiveRemaining = loans
    .filter(l => l.status === 'ACTIVE_INSTALLMENT' || l.status === 'OVERDUE')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalPaidOff = loans
    .reduce((sum, l) => sum + l.paidAmount, 0);

  const pendingApprovalCount = loans
    .filter(l => l.status === 'PENDING_APPROVAL')
    .length;

  const totalActiveStaffCount = Array.from(new Set(
    loans.filter(l => l.status === 'ACTIVE_INSTALLMENT').map(l => l.staffName)
  )).length;

  // Filtered & Sorted Loans
  const filteredLoans = useMemo(() => {
    let list = loans.filter(l => {
      const matchSearch =
        l.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.staffPhone.includes(searchQuery);

      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchRole = roleFilter === 'ALL' || l.staffRole === roleFilter;
      const matchType = typeFilter === 'ALL' || l.loanType === typeFilter;

      return matchSearch && matchStatus && matchRole && matchType;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'date') comp = a.loanDate.localeCompare(b.loanDate);
      else if (sortBy === 'name') comp = a.staffName.localeCompare(b.staffName);
      else if (sortBy === 'amount') comp = a.totalLoanAmount - b.totalLoanAmount;
      else if (sortBy === 'remaining') comp = a.remainingBalance - b.remainingBalance;

      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [loans, searchQuery, statusFilter, roleFilter, typeFilter, sortBy, sortOrder]);

  // Handlers
  const handleOpenAdd = (type: StaffLoan['loanType'] = 'KASBON_CICILAN') => {
    setEditingLoanId(null);
    setFStaffName('Bambang Sudiro');
    setFStaffRole('SATPAM');
    setFStaffPhone('0812-3456-7801');
    setFBaseSalary(5200000);
    setFLoanType(type);
    if (type === 'GAJI_DI_AWAL') {
      setFTotalAmount(1000000);
      setFMonthlyDeduction(1000000);
      setFTenorMonths(1);
    } else {
      setFTotalAmount(1500000);
      setFMonthlyDeduction(500000);
      setFTenorMonths(3);
    }
    setFLoanDate(new Date().toISOString().slice(0, 10));
    setFPurpose('Keperluan Mendesak Keluarga');
    setFDisbursementSource('Kas Operasional BCA');
    setFNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (l: StaffLoan) => {
    setEditingLoanId(l.id);
    setFStaffName(l.staffName);
    setFStaffRole(l.staffRole);
    setFStaffPhone(l.staffPhone);
    setFBaseSalary(l.baseSalary);
    setFLoanType(l.loanType);
    setFTotalAmount(l.totalLoanAmount);
    setFMonthlyDeduction(l.monthlyDeduction);
    setFTenorMonths(l.tenorMonths);
    setFLoanDate(l.loanDate);
    setFPurpose(l.purpose);
    setFDisbursementSource(l.disbursementSource);
    setFNotes(l.notes || '');
    setShowAddModal(true);
  };

  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingLoanId) {
        const res = await fetch('/api/expenses/loans/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loanId: editingLoanId,
            staffName: fStaffName,
            staffRole: fStaffRole,
            totalLoanAmount: Number(fTotalAmount),
            monthlyDeduction: Number(fMonthlyDeduction),
            tenorMonths: Number(fTenorMonths),
            purpose: fPurpose,
            notes: fNotes,
          })
        });

        if (res.ok) {
          const updated = loans.map(l => {
            if (l.id === editingLoanId) {
              const diff = Number(fTotalAmount) - l.paidAmount;
              return {
                ...l,
                staffName: fStaffName,
                staffRole: fStaffRole,
                staffPhone: fStaffPhone,
                baseSalary: Number(fBaseSalary),
                loanType: fLoanType,
                totalLoanAmount: Number(fTotalAmount),
                remainingBalance: Math.max(0, diff),
                monthlyDeduction: Number(fMonthlyDeduction),
                tenorMonths: Number(fTenorMonths),
                loanDate: fLoanDate,
                purpose: fPurpose,
                disbursementSource: fDisbursementSource,
                notes: fNotes,
              };
            }
            return l;
          });
          setLoans(updated);
          savePersisted('wargahub_staff_loans', updated);
          showToast(`Data kasbon untuk ${fStaffName} berhasil diperbarui.`);
          setShowAddModal(false);
        }
      } else {
        const res = await fetch('/api/expenses/loans/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffName: fStaffName,
            staffRole: fStaffRole,
            staffPhone: fStaffPhone,
            totalLoanAmount: Number(fTotalAmount),
            monthlyDeduction: Number(fMonthlyDeduction),
            tenorMonths: Number(fTenorMonths),
            loanDate: fLoanDate,
            purpose: fPurpose,
          })
        });

        if (res.ok) {
          const newId = `LOAN-${Date.now().toString().slice(-4)}`;
          const newLoan: StaffLoan = {
            id: newId,
            staffName: fStaffName,
            staffRole: fStaffRole,
            staffPhone: fStaffPhone,
            baseSalary: Number(fBaseSalary),
            loanType: fLoanType,
            totalLoanAmount: Number(fTotalAmount),
            paidAmount: 0,
            remainingBalance: Number(fTotalAmount),
            monthlyDeduction: Number(fMonthlyDeduction),
            tenorMonths: Number(fTenorMonths),
            remainingTenorMonths: Number(fTenorMonths),
            loanDate: fLoanDate,
            dueDate: new Date(Date.now() + Number(fTenorMonths) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            purpose: fPurpose,
            approvedBy: 'Ketua RW & Bendahara',
            status: 'ACTIVE_INSTALLMENT',
            disbursementSource: fDisbursementSource,
            installments: [],
            notes: fNotes,
          };
          const updated = [newLoan, ...loans];
          setLoans(updated);
          savePersisted('wargahub_staff_loans', updated);
          showToast(`Kasbon baru ${formatRupiah(fTotalAmount)} untuk ${fStaffName} berhasil disetujui & dicatat.`);
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses data kasbon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprovePendingLoan = (loanId: string) => {
    const updated = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'ACTIVE_INSTALLMENT' as const,
          approvedBy: 'Ketua RW & Bendahara (Disetujui)'
        };
      }
      return l;
    });
    setLoans(updated);
    savePersisted('wargahub_staff_loans', updated);
    showToast('Pengajuan kasbon/gaji awal telah disetujui.');
  };

  const handleOpenInstallment = (l: StaffLoan) => {
    setSelectedLoan(l);
    setInstAmount(Math.min(l.monthlyDeduction, l.remainingBalance));
    setInstMethod('POTONG_GAJI');
    setInstDate(new Date().toISOString().slice(0, 10));
    setInstNotes(`Potongan cicilan ${l.staffName}`);
    setShowInstallmentModal(true);
  };

  const handleSaveInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/expenses/loans/installment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoan.id,
          staffName: selectedLoan.staffName,
          installmentAmount: Number(instAmount),
          paymentMethod: instMethod,
          installmentDate: instDate,
          notes: instNotes,
        })
      });

      if (res.ok) {
        const newInstallment: InstallmentRecord = {
          id: `inst-${Date.now()}`,
          installmentNo: selectedLoan.installments.length + 1,
          amount: Number(instAmount),
          paymentDate: instDate,
          paymentMethod: instMethod,
          receivedBy: 'Hendra Wijaya (Bendahara)',
          notes: instNotes,
        };

        const updated = loans.map(l => {
          if (l.id === selectedLoan.id) {
            const nextPaid = l.paidAmount + Number(instAmount);
            const nextRemaining = Math.max(0, l.totalLoanAmount - nextPaid);
            const nextStatus = nextRemaining === 0 ? 'PAID_OFF' as const : 'ACTIVE_INSTALLMENT' as const;
            return {
              ...l,
              paidAmount: nextPaid,
              remainingBalance: nextRemaining,
              remainingTenorMonths: Math.max(0, l.remainingTenorMonths - 1),
              status: nextStatus,
              installments: [...l.installments, newInstallment],
            };
          }
          return l;
        });

        setLoans(updated);
        savePersisted('wargahub_staff_loans', updated);
        showToast(`Pembayaran angsuran ${formatRupiah(instAmount)} untuk ${selectedLoan.staffName} berhasil dicatat.`);
        setShowInstallmentModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat pembayaran angsuran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!loanToDelete) return;
    try {
      const res = await fetch('/api/expenses/loans/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId: loanToDelete.id, staffName: loanToDelete.staffName })
      });

      if (res.ok) {
        const updated = loans.filter(l => l.id !== loanToDelete.id);
        setLoans(updated);
        savePersisted('wargahub_staff_loans', updated);
        addDeletedIds('wargahub_deleted_loans', [loanToDelete.id]);
        showToast(`Data kasbon ${loanToDelete.staffName} berhasil dihapus.`);
        setLoanToDelete(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data kasbon.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No Kasbon', 'Nama Petugas', 'Jabatan', 'Jenis Kasbon', 'Total Pinjaman', 'Sudah Dibayar', 'Sisa Hutang', 'Cicilan / Bln', 'Tenor', 'Tanggal Pinjam', 'Jatuh Tempo', 'Keperluan', 'Status'];
    const rows = loans.map(l => [
      l.id,
      `"${l.staffName}"`,
      l.staffRole,
      l.loanType,
      l.totalLoanAmount,
      l.paidAmount,
      l.remainingBalance,
      l.monthlyDeduction,
      `${l.tenorMonths} Bulan`,
      l.loanDate,
      l.dueDate,
      `"${l.purpose}"`,
      l.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BUKU_KASBON_PETUGAS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data buku kasbon petugas berhasil diekspor ke CSV.');
  };

  const getStatusBadge = (status: StaffLoan['status']) => {
    switch (status) {
      case 'PAID_OFF':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">✓ LUNAS</span>;
      case 'ACTIVE_INSTALLMENT':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">SEDANG DICICIL</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px] border border-indigo-200 animate-pulse">MENUNGGU APPROVAL</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] border border-rose-200">JATUH TEMPO</span>;
    }
  };

  const getRoleBadge = (role: StaffLoan['staffRole']) => {
    switch (role) {
      case 'SATPAM':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-[10px] border border-blue-200">🛡️ Satpam</span>;
      case 'PETUGAS_KEBERSIHAN':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold text-[10px] border border-teal-200">🧹 Kebersihan / Sampah</span>;
      case 'PETUGAS_TAMAN':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">🌿 Perawatan Taman</span>;
      case 'TEKNISI':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px] border border-amber-200">🔧 Teknisi Sarana</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-600" />
            Kasbon, Pinjaman & Gaji di Awal Petugas
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Manajemen terpusat kasbon darurat, penarikan gaji di awal, jadwal cicilan potong payroll gaji, dan riwayat pelunasan hutang satpam & tim kebersihan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('GAJI_DI_AWAL')}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Tarik Gaji di Awal</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('KASBON_CICILAN')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Kasbon Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Sisa Kasbon Belum Lunas</span>
          <p className="text-2xl font-black text-rose-700 mt-1 tabular-nums">{formatRupiah(totalActiveRemaining)}</p>
          <span className="text-[10px] text-rose-600 font-bold">Piutang Aktif Kas Paguyuban</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Kasbon Sudah Terbayar Lunas</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{formatRupiah(totalPaidOff)}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Kembali ke Kas Paguyuban</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Petugas Punya Kasbon</span>
          <p className="text-2xl font-black text-primary-700 mt-1 tabular-nums">
            {totalActiveStaffCount} <span className="text-xs font-normal text-ink-muted">Petugas</span>
          </p>
          <span className="text-[10px] text-primary-600 font-bold">Satpam & Tim Kebersihan</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Pengajuan Gaji di Awal</span>
          <p className="text-2xl font-black text-indigo-700 mt-1 tabular-nums">
            {pendingApprovalCount} <span className="text-xs font-normal text-ink-muted">Pengajuan</span>
          </p>
          <span className="text-[10px] text-indigo-600 font-bold">Menunggu Persetujuan</span>
        </div>
      </div>

      {/* Search & Filter Suite */}
      <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama satpam/kebersihan, No kasbon, keperluan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="ALL">Semua Status ({loans.length})</option>
            <option value="ACTIVE_INSTALLMENT">Sedang Dicicil (Belum Lunas)</option>
            <option value="PAID_OFF">Sudah Lunas</option>
            <option value="PENDING_APPROVAL">Menunggu Approval</option>
            <option value="OVERDUE">Jatuh Tempo</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="ALL">Semua Jabatan</option>
            <option value="SATPAM">Satpam (Security)</option>
            <option value="PETUGAS_KEBERSIHAN">Petugas Kebersihan</option>
            <option value="PETUGAS_TAMAN">Petugas Taman</option>
            <option value="TEKNISI">Teknisi Sarana</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="KASBON_CICILAN">Kasbon Cicilan Tenor</option>
            <option value="GAJI_DI_AWAL">Gaji di Awal (1x Potong)</option>
            <option value="DANA_DARURAT">Dana Darurat</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
          >
            <option value="date">Urut Tanggal</option>
            <option value="name">Urut Nama</option>
            <option value="amount">Urut Nominal Kasbon</option>
            <option value="remaining">Urut Sisa Hutang</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
            title={`Urutan: ${sortOrder === 'asc' ? 'Menaik' : 'Menurun'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Loans Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                <th className="py-3.5 px-4">No. Kasbon & Tanggal</th>
                <th className="py-3.5 px-4">Nama Petugas & Jabatan</th>
                <th className="py-3.5 px-4">Jenis & Keperluan</th>
                <th className="py-3.5 px-4">Total Kasbon</th>
                <th className="py-3.5 px-4">Sudah Dibayar</th>
                <th className="py-3.5 px-4">Sisa Hutang</th>
                <th className="py-3.5 px-4">Cicilan / Bulan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-ink-muted font-medium">
                    Tidak ada data kasbon/pinjaman yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => {
                  const percentPaid = Math.round((l.paidAmount / l.totalLoanAmount) * 100);
                  const isPaidOff = l.status === 'PAID_OFF';
                  const isPending = l.status === 'PENDING_APPROVAL';

                  return (
                    <tr key={l.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary-700 block">{l.id}</span>
                        <span className="text-[10px] text-ink-muted">{l.loanDate}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-ink block">{l.staffName}</span>
                        <div className="mt-0.5">{getRoleBadge(l.staffRole)}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-[9px] rounded uppercase mr-1">
                          {l.loanType.replace(/_/g, ' ')}
                        </span>
                        <p className="text-ink font-medium truncate mt-0.5" title={l.purpose}>
                          {l.purpose}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-black font-mono text-ink">
                        {formatRupiah(l.totalLoanAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black font-mono text-emerald-700 block">{formatRupiah(l.paidAmount)}</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentPaid}%` }} />
                        </div>
                        <span className="text-[9px] text-ink-muted font-mono">{percentPaid}% Lunas</span>
                      </td>

                      <td className="py-3.5 px-4 font-black font-mono text-rose-700">
                        {formatRupiah(l.remainingBalance)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold font-mono text-ink block">{formatRupiah(l.monthlyDeduction)}</span>
                        <span className="text-[10px] text-ink-muted">Tenor: {l.tenorMonths} Bulan</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(l.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleApprovePendingLoan(l.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Setujui</span>
                            </button>
                          ) : !isPaidOff ? (
                            <button
                              type="button"
                              onClick={() => handleOpenInstallment(l)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-2xs"
                              title="Bayar Cicilan Potong Gaji"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Bayar Cicilan</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLoan(l);
                              setShowHistoryModal(true);
                            }}
                            className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold"
                            title="Riwayat Angsuran"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const content = `SURAT TANDA TERIMA KASBON PETUGAS - WARGAHUB\n==============================================\nNo. Kasbon: ${l.id}\nNama Petugas: ${l.staffName}\nJabatan: ${l.staffRole}\nTotal Pinjaman: ${formatRupiah(l.totalLoanAmount)}\nSudah Dibayar: ${formatRupiah(l.paidAmount)}\nSisa Hutang: ${formatRupiah(l.remainingBalance)}\nPotongan per Bulan: ${formatRupiah(l.monthlyDeduction)}\nTenor: ${l.tenorMonths} Bulan\nTanggal Pengajuan: ${l.loanDate}\nKeperluan: ${l.purpose}\nStatus: ${l.status}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nBendahara Paguyuban Komplek`;
                              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `SLIP_KASBON_${l.id}_${l.staffName.replace(/\s+/g, '_')}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                              showToast(`Slip kasbon ${l.staffName} berhasil diunduh.`);
                            }}
                            className="p-1.5 hover:bg-canvas text-ink-muted rounded-lg font-bold"
                            title="Cetak Slip Kasbon"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(l)}
                            className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold"
                            title="Edit Data Kasbon"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setLoanToDelete(l)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold"
                            title="Hapus Kasbon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: TAMBAH / EDIT KASBON ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>{editingLoanId ? 'Edit Data Kasbon Petugas' : 'Catat Kasbon / Gaji di Awal Baru'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Pilih Nama Petugas / Staf *</label>
                <select
                  value={fStaffName}
                  onChange={(e) => {
                    const found = staffPresets.find(s => s.name === e.target.value);
                    if (found) {
                      setFStaffName(found.name);
                      setFStaffRole(found.role as any);
                      setFBaseSalary(found.salary);
                      setFStaffPhone(found.phone);
                    }
                  }}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {staffPresets.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} ({s.role} - Gaji: {formatRupiah(s.salary)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Pinjaman *</label>
                  <select
                    value={fLoanType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setFLoanType(t);
                      if (t === 'GAJI_DI_AWAL') {
                        setFTenorMonths(1);
                        setFMonthlyDeduction(fTotalAmount);
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KASBON_CICILAN">Kasbon Cicilan Tenor</option>
                    <option value="GAJI_DI_AWAL">Gaji di Awal (1x Potong Bulan Ini)</option>
                    <option value="DANA_DARURAT">Dana Darurat</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Total Nominal Kasbon (Rp) *</label>
                  <input
                    type="number"
                    value={fTotalAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFTotalAmount(val);
                      if (fLoanType === 'GAJI_DI_AWAL') setFMonthlyDeduction(val);
                      else setFMonthlyDeduction(Math.round(val / fTenorMonths));
                    }}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tenor Pelunasan (Bulan) *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={fTenorMonths}
                    onChange={(e) => {
                      const t = Math.max(1, Number(e.target.value));
                      setFTenorMonths(t);
                      setFMonthlyDeduction(Math.round(fTotalAmount / t));
                    }}
                    required
                    disabled={fLoanType === 'GAJI_DI_AWAL'}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Potongan per Bulan (Rp) *</label>
                  <input
                    type="number"
                    value={fMonthlyDeduction}
                    onChange={(e) => setFMonthlyDeduction(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Pengajuan *</label>
                  <input
                    type="date"
                    value={fLoanDate}
                    onChange={(e) => setFLoanDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Sumber Kas Pencairan</label>
                  <select
                    value={fDisbursementSource}
                    onChange={(e) => setFDisbursementSource(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Kas Operasional BCA">Kas Operasional BCA</option>
                    <option value="Kas Tunai Bendahara">Kas Tunai Bendahara</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keperluan / Alasan Pinjaman *</label>
                <input
                  type="text"
                  placeholder="Contoh: Biaya berobat anak / Masuk sekolah / Servis motor"
                  value={fPurpose}
                  onChange={(e) => setFPurpose(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              {/* Payroll Simulation Preview */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                <span className="font-bold text-emerald-950 block text-[11px]">Simulasi Penggajian Petugas:</span>
                <div className="flex justify-between text-emerald-900">
                  <span>Gaji Pokok:</span>
                  <span className="font-mono font-bold">{formatRupiah(fBaseSalary)}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Potongan Kasbon Bulanan:</span>
                  <span className="font-mono font-bold">- {formatRupiah(fMonthlyDeduction)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-950 pt-1 border-t border-emerald-200">
                  <span>Gaji Bersih Diterima (Take-Home Pay):</span>
                  <span className="font-mono">{formatRupiah(Math.max(0, fBaseSalary - fMonthlyDeduction))}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan & Setujui Kasbon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BAYAR ANGSURAN CICILAN ================= */}
      {showInstallmentModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span>Bayar Angsuran Kasbon</span>
              </h3>
              <button onClick={() => setShowInstallmentModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1 text-xs">
              <div className="flex justify-between font-bold text-ink">
                <span>Nama Petugas:</span>
                <span>{selectedLoan.staffName} ({selectedLoan.staffRole})</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Total Pinjaman:</span>
                <span className="font-mono font-bold text-ink">{formatRupiah(selectedLoan.totalLoanAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold">
                <span>Sisa Hutang Saat Ini:</span>
                <span className="font-mono">{formatRupiah(selectedLoan.remainingBalance)}</span>
              </div>
            </div>

            <form onSubmit={handleSaveInstallment} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nominal Angsuran yang Dibayar (Rp) *</label>
                <input
                  type="number"
                  max={selectedLoan.remainingBalance}
                  value={instAmount}
                  onChange={(e) => setInstAmount(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Metode Pembayaran Angsuran *</label>
                <select
                  value={instMethod}
                  onChange={(e) => setInstMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="POTONG_GAJI">Potong Payroll Gaji Bulanan</option>
                  <option value="TUNAI_CASH">Tunai / Cash Langsung ke Bendahara</option>
                  <option value="TRANSFER_BCA">Transfer ke Rekening Kas BCA</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tanggal Pembayaran *</label>
                <input
                  type="date"
                  value={instDate}
                  onChange={(e) => setInstDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Potongan gaji bulan September 2026"
                  value={instNotes}
                  onChange={(e) => setInstNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInstallmentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Memproses...' : 'Simpan Pembayaran Angsuran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RIWAYAT ANGSURAN ================= */}
      {showHistoryModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary-600" />
                  Riwayat Angsuran Kasbon: {selectedLoan.staffName}
                </h3>
                <p className="text-[11px] text-ink-muted">No. Pinjaman: {selectedLoan.id}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-ink-muted block text-[10px]">Total Kasbon:</span>
                <span className="font-black font-mono text-ink">{formatRupiah(selectedLoan.totalLoanAmount)}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px]">Sudah Dibayar:</span>
                <span className="font-black font-mono text-emerald-700">{formatRupiah(selectedLoan.paidAmount)}</span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px]">Sisa Pokok:</span>
                <span className="font-black font-mono text-rose-700">{formatRupiah(selectedLoan.remainingBalance)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-ink block">Log Pembayaran Cicilan:</span>
              {selectedLoan.installments.length === 0 ? (
                <p className="text-ink-muted italic py-4 text-center">Belum ada catatan cicilan yang masuk.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {selectedLoan.installments.map((inst) => (
                    <div key={inst.id} className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">Cicilan ke-{inst.installmentNo}</span>
                        <span className="text-[10px] text-ink-muted font-mono">{inst.paymentDate} • {inst.paymentMethod.replace(/_/g, ' ')}</span>
                        {inst.notes && <p className="text-[10px] text-ink-muted italic mt-0.5">{inst.notes}</p>}
                      </div>
                      <span className="font-black font-mono text-emerald-700 text-sm">
                        + {formatRupiah(inst.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-surface border border-border text-ink font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
      {loanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Data Kasbon {loanToDelete.staffName}?</h3>
              <p className="text-ink-muted">
                Catatan kasbon sebesar <strong>{formatRupiah(loanToDelete.totalLoanAmount)}</strong> akan dihapus permanen dari buku kasbon paguyuban.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLoanToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
