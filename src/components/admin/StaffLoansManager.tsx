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
  Calendar,
  Phone,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Wallet,
  Check,
  Receipt,
  Sliders,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export type StaffLoanSubTab =
  | 'active_loans'
  | 'new_requests'
  | 'payroll_deductions'
  | 'repayment_history'
  | 'loan_policies';

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

export interface LoanPolicyConfig {
  maxLoanRatio: number;
  maxTenorMonths: number;
  minWorkingMonths: number;
  requiredApprovers: string;
  defaultDisbursementSource: string;
  repaymentNotes: string;
}

export interface StaffLoansManagerProps {
  initialTab?: StaffLoanSubTab;
}

export const StaffLoansManager: React.FC<StaffLoansManagerProps> = ({ initialTab = 'active_loans' }) => {
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

  // Staff Loans Data State (dynamic, non-demo)

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
    return [];
  });

  // Subtab State with URL synchronization
  const [activeSubTab, setActiveSubTab] = useState<StaffLoanSubTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as StaffLoanSubTab;
      if (
        tabParam &&
        ['active_loans', 'new_requests', 'payroll_deductions', 'repayment_history', 'loan_policies'].includes(
          tabParam
        )
      ) {
        return tabParam;
      }
    }
    return initialTab;
  });

  const handleTabChange = (tab: StaffLoanSubTab) => {
    setActiveSubTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // State Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount' | 'remaining'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State for Active Loans
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    loan: StaffLoan;
    installment: InstallmentRecord;
  } | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<StaffLoan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<StaffLoan | null>(null);
  const [loanForApproval, setLoanForApproval] = useState<StaffLoan | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit Loan
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [fStaffName, setFStaffName] = useState('');
  const [fStaffRole, setFStaffRole] = useState<StaffLoan['staffRole']>('SATPAM');
  const [fStaffPhone, setFStaffPhone] = useState('');
  const [fBaseSalary, setFBaseSalary] = useState(4500000);
  const [fLoanType, setFLoanType] = useState<StaffLoan['loanType']>('KASBON_CICILAN');
  const [fTotalAmount, setFTTotalAmount] = useState(500000);
  const [fMonthlyDeduction, setFMonthlyDeduction] = useState(250000);
  const [fTenorMonths, setFTenorMonths] = useState(2);
  const [fLoanDate, setFLoanDate] = useState(new Date().toISOString().slice(0, 10));
  const [fPurpose, setFPurpose] = useState('');
  const [fDisbursementSource, setFDisbursementSource] = useState('Kas Operasional BCA');
  const [fNotes, setFNotes] = useState('');

  // Form State for Installment
  const [instAmount, setInstAmount] = useState<number>(250000);
  const [instMethod, setInstMethod] = useState<'POTONG_GAJI' | 'TUNAI_CASH' | 'TRANSFER_BCA'>('POTONG_GAJI');
  const [instDate, setInstDate] = useState(new Date().toISOString().slice(0, 10));
  const [instNotes, setInstNotes] = useState('Potongan gaji bulan berjalan');

  // Subtab 3: Payroll Deduction State
  const [payrollMonth, setPayrollMonth] = useState('September 2026');
  const [processedDeductions, setProcessedDeductions] = useState<{ [staffName: string]: boolean }>({});

  // Subtab 4: Repayment History Filter
  const [historyMethodFilter, setHistoryMethodFilter] = useState<string>('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Subtab 5: Loan Policy State
  const [loanPolicy, setLoanPolicy] = useState<LoanPolicyConfig>(() => {
    return getPersisted<LoanPolicyConfig>('wargahub_loan_policies', {
      maxLoanRatio: 50,
      maxTenorMonths: 4,
      minWorkingMonths: 3,
      requiredApprovers: 'Ketua RW & Bendahara Paguyuban',
      defaultDisbursementSource: 'Kas Operasional BCA',
      repaymentNotes: 'Potongan payroll dilakukan otomatis pada awal bulan berjalan saat transfer gaji.',
    });
  });

  // Staff Directory Presets
  const staffPresets = [
    { name: 'Bambang Sudiro', role: 'SATPAM' as const, salary: 5200000, phone: '0812-3456-7801' },
    { name: 'Agus Setiawan', role: 'SATPAM' as const, salary: 4300000, phone: '0812-3456-7802' },
    { name: 'Dedi Kurniawan', role: 'SATPAM' as const, salary: 4500000, phone: '0812-3456-7803' },
    { name: 'Slamet Riyadi', role: 'PETUGAS_KEBERSIHAN' as const, salary: 3800000, phone: '0813-7788-9900' },
    { name: 'Hendro Siswanto', role: 'TEKNISI' as const, salary: 4500000, phone: '0812-3456-7805' },
    { name: 'Rudi Hartono', role: 'PETUGAS_KEBERSIHAN' as const, salary: 4400000, phone: '0812-3456-7806' },
    { name: 'Wawan Gunawan', role: 'SATPAM' as const, salary: 5200000, phone: '0812-3456-7807' },
    { name: 'Tri Handoko', role: 'SATPAM' as const, salary: 4300000, phone: '0812-3456-7808' },
    { name: 'Pak Ujang Suhendra', role: 'PETUGAS_TAMAN' as const, salary: 3800000, phone: '0813-7766-5544' },
    { name: 'Pak Joko Sutrisno', role: 'SATPAM' as const, salary: 4500000, phone: '0812-3344-5566' },
  ];

  // Calculations & KPIs
  const totalActiveRemaining = loans
    .filter((l) => l.status === 'ACTIVE_INSTALLMENT' || l.status === 'OVERDUE')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalPaidOff = loans.reduce((sum, l) => sum + l.paidAmount, 0);

  const pendingApprovalCount = loans.filter((l) => l.status === 'PENDING_APPROVAL').length;

  const totalActiveStaffCount = Array.from(
    new Set(loans.filter((l) => l.status === 'ACTIVE_INSTALLMENT').map((l) => l.staffName))
  ).length;

  // Filtered & Sorted Loans for Subtab 1
  const filteredLoans = useMemo(() => {
    let list = loans.filter((l) => {
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

  // Pagination calculation
  const totalFiltered = filteredLoans.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  // Subtab 2: Pending Loans
  const pendingLoans = useMemo(() => {
    return loans.filter((l) => l.status === 'PENDING_APPROVAL');
  }, [loans]);

  // Subtab 4: Aggregate Repayment History
  const allInstallments = useMemo(() => {
    const list: Array<{
      id: string;
      installmentNo: number;
      amount: number;
      paymentDate: string;
      paymentMethod: 'POTONG_GAJI' | 'TUNAI_CASH' | 'TRANSFER_BCA';
      receivedBy: string;
      notes?: string;
      loanId: string;
      staffName: string;
      staffRole: StaffLoan['staffRole'];
      parentLoan: StaffLoan;
    }> = [];

    loans.forEach((l) => {
      l.installments.forEach((inst) => {
        list.push({
          ...inst,
          loanId: l.id,
          staffName: l.staffName,
          staffRole: l.staffRole,
          parentLoan: l,
        });
      });
    });

    list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

    return list.filter((item) => {
      const matchMethod = historyMethodFilter === 'ALL' || item.paymentMethod === historyMethodFilter;
      const matchSearch =
        item.staffName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        item.loanId.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(historySearchQuery.toLowerCase()));
      return matchMethod && matchSearch;
    });
  }, [loans, historyMethodFilter, historySearchQuery]);

  const totalRepaymentsAmount = allInstallments.reduce((sum, item) => sum + item.amount, 0);

  // Handlers
  const handleOpenAdd = (type: StaffLoan['loanType'] = 'KASBON_CICILAN') => {
    setEditingLoanId(null);
    setFStaffName('Bambang Sudiro');
    setFStaffRole('SATPAM');
    setFStaffPhone('0812-3456-7801');
    setFBaseSalary(5200000);
    setFLoanType(type);
    if (type === 'GAJI_DI_AWAL') {
      setFTTotalAmount(1000000);
      setFMonthlyDeduction(1000000);
      setFTenorMonths(1);
    } else {
      setFTTotalAmount(1500000);
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
    setFTTotalAmount(l.totalLoanAmount);
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
          }),
        });

        if (res.ok) {
          const updated = loans.map((l) => {
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
          }),
        });

        const newId = `LOAN-${Date.now().toString().slice(-4)}`;
        const newRecord: StaffLoan = {
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
          dueDate: new Date(new Date(fLoanDate).setMonth(new Date(fLoanDate).getMonth() + Number(fTenorMonths)))
            .toISOString()
            .slice(0, 10),
          purpose: fPurpose,
          approvedBy: 'Ketua RW & Bendahara',
          status: 'ACTIVE_INSTALLMENT',
          disbursementSource: fDisbursementSource,
          installments: [],
          notes: fNotes,
        };

        const updated = [newRecord, ...loans];
        setLoans(updated);
        savePersisted('wargahub_staff_loans', updated);
        showToast(`Kasbon sebesar ${formatRupiah(Number(fTotalAmount))} untuk ${fStaffName} berhasil disetujui.`);
        setShowAddModal(false);
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan kasbon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInstallment = (l: StaffLoan) => {
    setSelectedLoan(l);
    setInstAmount(Math.min(l.monthlyDeduction, l.remainingBalance));
    setInstMethod('POTONG_GAJI');
    setInstDate(new Date().toISOString().slice(0, 10));
    setInstNotes(`Potongan payroll angsuran kasbon`);
    setShowInstallmentModal(true);
  };

  const handleSaveInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsSaving(true);
    try {
      await fetch('/api/expenses/loans/installment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: selectedLoan.id,
          staffName: selectedLoan.staffName,
          installmentAmount: Number(instAmount),
          paymentMethod: instMethod,
          installmentDate: instDate,
          notes: instNotes,
        }),
      });

      const newPaid = selectedLoan.paidAmount + Number(instAmount);
      const newRemaining = Math.max(0, selectedLoan.remainingBalance - Number(instAmount));
      const newStatus = newRemaining === 0 ? 'PAID_OFF' : 'ACTIVE_INSTALLMENT';

      const newInstRecord: InstallmentRecord = {
        id: `inst-${Date.now()}`,
        installmentNo: selectedLoan.installments.length + 1,
        amount: Number(instAmount),
        paymentDate: instDate,
        paymentMethod: instMethod,
        receivedBy: 'Hendra Wijaya (Bendahara)',
        notes: instNotes,
      };

      const updated = loans.map((l) => {
        if (l.id === selectedLoan.id) {
          return {
            ...l,
            paidAmount: newPaid,
            remainingBalance: newRemaining,
            status: newStatus as any,
            installments: [...l.installments, newInstRecord],
          };
        }
        return l;
      });

      setLoans(updated);
      savePersisted('wargahub_staff_loans', updated);
      showToast(`Pembayaran angsuran ${formatRupiah(Number(instAmount))} berhasil dicatat.`);
      setShowInstallmentModal(false);

      // Offer receipt preview
      setSelectedReceipt({
        loan: selectedLoan,
        installment: newInstRecord,
      });
      setShowReceiptModal(true);
    } catch (e) {
      console.error(e);
      showToast('Gagal memproses pembayaran angsuran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!loanToDelete) return;
    try {
      await fetch('/api/expenses/loans/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId: loanToDelete.id }),
      });

      const updated = loans.filter((l) => l.id !== loanToDelete.id);
      setLoans(updated);
      savePersisted('wargahub_staff_loans', updated);
      addDeletedIds('wargahub_deleted_loans', [loanToDelete.id]);
      showToast(`Data kasbon ${loanToDelete.staffName} berhasil dihapus.`);
      setLoanToDelete(null);
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus kasbon.');
    }
  };

  const handleApprovePendingLoan = async (loanId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      if (decision === 'APPROVE') {
        const updated = loans.map((l) => {
          if (l.id === loanId) {
            return {
              ...l,
              status: 'ACTIVE_INSTALLMENT' as const,
              approvedBy: 'Ketua RW 05 & Bendahara (Disetujui)',
            };
          }
          return l;
        });
        setLoans(updated);
        savePersisted('wargahub_staff_loans', updated);
        showToast('Pengajuan kasbon berhasil disetujui.');
      } else {
        const updated = loans.filter((l) => l.id !== loanId);
        setLoans(updated);
        savePersisted('wargahub_staff_loans', updated);
        addDeletedIds('wargahub_deleted_loans', [loanId]);
        showToast('Pengajuan kasbon telah ditolak dan diarsipkan.');
      }
      setLoanForApproval(null);
    } catch (e) {
      console.error(e);
      showToast('Gagal memproses persetujuan pengajuan.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No. Kasbon',
      'Nama Petugas',
      'Jabatan',
      'Jenis Pinjaman',
      'Total Pinjaman',
      'Sudah Dibayar',
      'Sisa Hutang',
      'Cicilan per Bulan',
      'Tenor',
      'Tanggal Pengajuan',
      'Jatuh Tempo',
      'Keperluan',
      'Status',
    ];
    const rows = loans.map((l) => [
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
      l.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BUKU_KASBON_PETUGAS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data buku kasbon petugas berhasil diekspor ke CSV.');
  };

  const handleExportPayrollCSV = () => {
    const headers = [
      'Nama Petugas',
      'Jabatan',
      'Gaji Pokok',
      'Sisa Kasbon Berjalan',
      'Potongan Kasbon Bulan Ini',
      'Take-Home Pay',
      'Status Potongan',
    ];

    const rows = staffPresets.map((s) => {
      const activeLoan = loans.find(
        (l) => l.staffName.toLowerCase() === s.name.toLowerCase() && l.remainingBalance > 0
      );
      const deduction = activeLoan ? Math.min(activeLoan.monthlyDeduction, activeLoan.remainingBalance) : 0;
      const netPay = s.salary - deduction;
      const isDeducted = processedDeductions[s.name] ? 'SUDAH DIPOTONG' : 'BELUM';
      return [
        `"${s.name}"`,
        s.role,
        s.salary,
        activeLoan ? activeLoan.remainingBalance : 0,
        deduction,
        netPay,
        isDeducted,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REKAP_PAYROLL_POTONGAN_${payrollMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Rekapitulasi payroll ${payrollMonth} berhasil diekspor.`);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    savePersisted('wargahub_loan_policies', loanPolicy);
    showToast('Kebijakan dan aturan kasbon paguyuban berhasil diperbarui.');
  };

  const getStatusBadge = (status: StaffLoan['status']) => {
    switch (status) {
      case 'PAID_OFF':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            ✓ LUNAS
          </span>
        );
      case 'ACTIVE_INSTALLMENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
            SEDANG DICICIL
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px] border border-indigo-200 animate-pulse">
            MENUNGGU APPROVAL
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] border border-rose-200">
            JATUH TEMPO
          </span>
        );
    }
  };

  const getRoleBadge = (role: StaffLoan['staffRole']) => {
    switch (role) {
      case 'SATPAM':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-[10px] border border-blue-200">
            🛡️ Satpam
          </span>
        );
      case 'PETUGAS_KEBERSIHAN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold text-[10px] border border-teal-200">
            🧹 Kebersihan / Sampah
          </span>
        );
      case 'PETUGAS_TAMAN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
            🌿 Perawatan Taman
          </span>
        );
      case 'TEKNISI':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px] border border-amber-200">
            🔧 Teknisi Sarana
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-600" />
            <span>Kasbon, Pinjaman & Gaji di Awal Petugas</span>
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Manajemen terpusat pinjaman darurat, penarikan gaji di awal, jadwal cicilan potong payroll gaji, dan riwayat
            pelunasan hutang staf komplek.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const content = `LAPORAN REKAPITULASI KASBON PETUGAS - WARGAHUB\n==============================================\nTanggal Cetak: ${new Date().toLocaleString(
                'id-ID'
              )}\nTotal Piutang Berjalan: ${formatRupiah(totalActiveRemaining)}\nTotal Terbayar Lunas: ${formatRupiah(
                totalPaidOff
              )}\nTotal Petugas Memiliki Kasbon: ${totalActiveStaffCount} Petugas\nPengajuan Menunggu Persetujuan: ${pendingApprovalCount}\n\nBendahara Paguyuban Komplek`;
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `REKAP_KASBON_${new Date().toISOString().slice(0, 10)}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showToast('Laporan kasbon berhasil diunduh dalam format .txt');
            }}
            className="px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            <span>Unduh Rekap (.txt)</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('GAJI_DI_AWAL')}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>+ Tarik Gaji di Awal</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('KASBON_CICILAN')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Kasbon Baru</span>
          </button>
        </div>
      </div>

      {/* 5-SubTab Segmented Pill Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-border/80">
        <button
          type="button"
          onClick={() => handleTabChange('active_loans')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'active_loans'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Buku Kasbon & Cicilan</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubTab === 'active_loans' ? 'bg-white/20 text-white' : 'bg-canvas text-ink'
            }`}
          >
            {loans.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('new_requests')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'new_requests'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pengajuan & Persetujuan</span>
          {pendingApprovalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-white font-bold animate-pulse">
              {pendingApprovalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('payroll_deductions')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'payroll_deductions'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Jadwal Potong Payroll</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('repayment_history')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'repayment_history'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Buku Kas Masuk Angsuran</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('loan_policies')}
          className={`px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            activeSubTab === 'loan_policies'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-surface text-ink-muted hover:text-ink hover:bg-canvas border border-border/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kebijakan & Batasan</span>
        </button>
      </div>

      {/* ================= SUBTAB 1: BUKU KASBON & CICILAN ================= */}
      {activeSubTab === 'active_loans' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Summary Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Sisa Kasbon Belum Lunas
              </span>
              <p className="text-2xl font-black font-mono text-rose-700 mt-0.5 tabular-nums">
                {formatRupiah(totalActiveRemaining)}
              </p>
              <span className="text-[10px] text-rose-600 font-bold font-mono mt-0.5 block">
                PIUTANG AKTIF PAGUYUBAN
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Kasbon Sudah Lunas
              </span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5 tabular-nums">
                {formatRupiah(totalPaidOff)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 block">
                KEMBALI KE BUKU KAS
              </span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Petugas Punya Kasbon
              </span>
              <p className="text-2xl font-black font-mono text-primary-700 mt-0.5 tabular-nums">
                {totalActiveStaffCount} <span className="text-xs font-normal text-ink-muted">Petugas</span>
              </p>
              <span className="text-[10px] text-primary-600 font-bold font-mono mt-0.5 block">SATPAM & KEBERSIHAN</span>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider block">
                Pengajuan Gaji di Awal
              </span>
              <p className="text-2xl font-black font-mono text-indigo-700 mt-0.5 tabular-nums">
                {pendingApprovalCount} <span className="text-xs font-normal text-ink-muted">Pengajuan</span>
              </p>
              <span className="text-[10px] text-indigo-600 font-bold font-mono mt-0.5 block">MENUNGGU APPROVAL</span>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink active:scale-[0.98] transition-all"
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
                  {paginatedLoans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-ink-muted font-medium">
                        Tidak ada data kasbon/pinjaman yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedLoans.map((l) => {
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
                            <span className="font-black font-mono text-emerald-700 block">
                              {formatRupiah(l.paidAmount)}
                            </span>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-ink-muted font-mono">{percentPaid}% Lunas</span>
                          </td>

                          <td className="py-3.5 px-4 font-black font-mono text-rose-700">
                            {formatRupiah(l.remainingBalance)}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold font-mono text-ink block">
                              {formatRupiah(l.monthlyDeduction)}
                            </span>
                            <span className="text-[10px] text-ink-muted">Tenor: {l.tenorMonths} Bulan</span>
                          </td>

                          <td className="py-3.5 px-4 text-center">{getStatusBadge(l.status)}</td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {isPending ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLoanForApproval(l);
                                    setApprovalDecision('APPROVE');
                                    setApprovalNotes('');
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 active:scale-[0.98] transition-all shadow-2xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Review</span>
                                </button>
                              ) : !isPaidOff ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInstallment(l)}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-2xs active:scale-[0.98] transition-all"
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
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Riwayat Angsuran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const content = `SURAT TANDA TERIMA KASBON PETUGAS - WARGAHUB\n==============================================\nNo. Kasbon: ${
                                    l.id
                                  }\nNama Petugas: ${l.staffName}\nJabatan: ${l.staffRole}\nTotal Pinjaman: ${formatRupiah(
                                    l.totalLoanAmount
                                  )}\nSudah Dibayar: ${formatRupiah(l.paidAmount)}\nSisa Hutang: ${formatRupiah(
                                    l.remainingBalance
                                  )}\nPotongan per Bulan: ${formatRupiah(l.monthlyDeduction)}\nTenor: ${
                                    l.tenorMonths
                                  } Bulan\nTanggal Pengajuan: ${l.loanDate}\nKeperluan: ${l.purpose}\nStatus: ${
                                    l.status
                                  }\n\nDicetak pada: ${new Date().toLocaleString(
                                    'id-ID'
                                  )}\nBendahara Paguyuban Komplek`;
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
                                className="p-1.5 hover:bg-canvas text-ink-muted rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Cetak Slip Kasbon"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(l)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Edit Data Kasbon"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setLoanToDelete(l)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold active:scale-[0.98] transition-all"
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

            {/* Complete Pagination Controls */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalFiltered === 0 ? 0 : startIndex + 1}</strong> -{' '}
                  <strong className="text-ink">{endIndex}</strong> dari{' '}
                  <strong className="text-ink">{totalFiltered}</strong> kasbon
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
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-mono font-bold text-ink bg-surface border border-border rounded-lg">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 active:scale-[0.98] transition-all"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: PENGAJUAN & APPROVAL ================= */}
      {activeSubTab === 'new_requests' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-black text-ink flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Daftar Pengajuan Kasbon & Gaji Awal Menunggu Persetujuan</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Evaluasi rasio pinjaman terhadap gaji bulanan dan berikan keputusan persetujuan bersama Ketua RW &
                  Bendahara.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAdd('GAJI_DI_AWAL')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Pengajuan Baru</span>
              </button>
            </div>

            {pendingLoans.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-ink">Tidak Ada Pengajuan Kasbon yang Menunggu</h4>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  Seluruh pengajuan kasbon dan permohonan penarikan gaji di awal telah selesai diverifikasi oleh pengurus
                  paguyuban.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {pendingLoans.map((l) => {
                  const ratio = Math.round((l.totalLoanAmount / l.baseSalary) * 100);
                  const isHighRisk = ratio > loanPolicy.maxLoanRatio;

                  return (
                    <div
                      key={l.id}
                      className="p-5 bg-canvas rounded-2xl border border-border shadow-xs space-y-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary-700">{l.id}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-bold text-[10px]">
                            {l.loanType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="font-mono text-ink-muted text-[11px]">{l.loanDate}</span>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-black text-base text-ink">{l.staffName}</h4>
                          <span className="text-xs text-ink-muted font-bold">{getRoleBadge(l.staffRole)}</span>
                        </div>
                        <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                          Keperluan: <strong className="text-ink">{l.purpose}</strong>
                        </p>
                      </div>

                      <div className="p-3 bg-surface rounded-xl border border-border grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-ink-muted block">Gaji Pokok Petugas:</span>
                          <span className="font-mono font-bold text-ink">{formatRupiah(l.baseSalary)}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted block">Nominal Diajukan:</span>
                          <span className="font-mono font-black text-rose-700">{formatRupiah(l.totalLoanAmount)}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted block">Skema Potongan:</span>
                          <span className="font-mono font-bold text-ink">
                            {formatRupiah(l.monthlyDeduction)} / bln ({l.tenorMonths}x)
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-muted block">Rasio terhadap Gaji:</span>
                          <span
                            className={`font-mono font-black ${
                              isHighRisk ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {ratio}% {isHighRisk ? '⚠️ MELEBIHI BATAS' : '✓ AMAN'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLoanForApproval(l);
                            setApprovalDecision('APPROVE');
                            setApprovalNotes('');
                          }}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui Kasbon</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoanForApproval(l);
                            setApprovalDecision('REJECT');
                            setApprovalNotes('');
                          }}
                          className="px-3.5 py-2 bg-surface hover:bg-red-50 border border-border text-red-600 font-bold rounded-xl active:scale-[0.98] transition-all"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: JADWAL POTONG PAYROLL ================= */}
      {activeSubTab === 'payroll_deductions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-600" />
                  <span>Jadwal Rekapitulasi Potongan Payroll Gaji Petugas</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Daftar pemotongan kasbon otomatis pada saat pencairan gaji berkala Satpam, Tim Kebersihan, dan Teknisi
                  Sarana.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-ink-muted font-medium">Bulan:</span>
                  <select
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="px-3 py-1.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Agustus 2026">Agustus 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="Oktober 2026">Oktober 2026</option>
                    <option value="November 2026">November 2026</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportPayrollCSV}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Ekspor Payroll (.csv)</span>
                </button>
              </div>
            </div>

            {/* 3 Summary KPIs for Payroll */}
            {(() => {
              const totalGrossSalary = staffPresets.reduce((sum, s) => sum + s.salary, 0);
              const totalDeductionsThisMonth = staffPresets.reduce((sum, s) => {
                const activeLoan = loans.find(
                  (l) => l.staffName.toLowerCase() === s.name.toLowerCase() && l.remainingBalance > 0
                );
                return (
                  sum + (activeLoan ? Math.min(activeLoan.monthlyDeduction, activeLoan.remainingBalance) : 0)
                );
              }, 0);
              const totalNetSalary = totalGrossSalary - totalDeductionsThisMonth;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                    <span className="text-ink-muted font-bold block text-[11px]">Total Gaji Bruto Petugas</span>
                    <p className="text-xl font-black font-mono text-ink tabular-nums">
                      {formatRupiah(totalGrossSalary)}
                    </p>
                    <span className="text-[10px] text-ink-muted block">10 Petugas (Satpam, Kebersihan, Teknisi)</span>
                  </div>

                  <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1">
                    <span className="text-rose-900 font-bold block text-[11px]">Total Potongan Kasbon Bulan Ini</span>
                    <p className="text-xl font-black font-mono text-rose-700 tabular-nums">
                      - {formatRupiah(totalDeductionsThisMonth)}
                    </p>
                    <span className="text-[10px] text-rose-700 block font-medium">
                      Otomatis dialihkan kembali ke kas
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-emerald-900 font-bold block text-[11px]">Gaji Bersih Ditransfer Paguyuban</span>
                    <p className="text-xl font-black font-mono text-emerald-800 tabular-nums">
                      {formatRupiah(totalNetSalary)}
                    </p>
                    <span className="text-[10px] text-emerald-700 block font-medium">Take-Home Pay total</span>
                  </div>
                </div>
              );
            })()}

            {/* Payroll Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                      <th className="py-3 px-4">Nama Petugas</th>
                      <th className="py-3 px-4">Gaji Pokok</th>
                      <th className="py-3 px-4">Sisa Hutang Kasbon</th>
                      <th className="py-3 px-4">Potongan Bulan Ini</th>
                      <th className="py-3 px-4">Take-Home Pay</th>
                      <th className="py-3 px-4 text-center">Status Potongan</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {staffPresets.map((s, idx) => {
                      const activeLoan = loans.find(
                        (l) => l.staffName.toLowerCase() === s.name.toLowerCase() && l.remainingBalance > 0
                      );
                      const deduction = activeLoan
                        ? Math.min(activeLoan.monthlyDeduction, activeLoan.remainingBalance)
                        : 0;
                      const takeHomePay = s.salary - deduction;
                      const isProcessed = processedDeductions[s.name] ?? false;

                      return (
                        <tr key={idx} className="hover:bg-canvas/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">{s.name}</span>
                            <span className="text-[10px] text-ink-muted block">{s.role}</span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-ink">{formatRupiah(s.salary)}</td>

                          <td className="py-3 px-4 font-mono text-ink">
                            {activeLoan ? (
                              <span className="text-rose-700 font-bold">{formatRupiah(activeLoan.remainingBalance)}</span>
                            ) : (
                              <span className="text-ink-muted">Rp 0</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono font-black text-rose-700">
                            {deduction > 0 ? `- ${formatRupiah(deduction)}` : 'Rp 0'}
                          </td>

                          <td className="py-3 px-4 font-mono font-black text-emerald-800 text-sm">
                            {formatRupiah(takeHomePay)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {deduction === 0 ? (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                TANPA KASBON
                              </span>
                            ) : isProcessed ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                                ✓ SUDAH DIPOTONG
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">
                                BELUM DIPOTONG
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {deduction > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProcessedDeductions((prev) => ({
                                      ...prev,
                                      [s.name]: !isProcessed,
                                    }));
                                    showToast(
                                      `Status potongan untuk ${s.name} diubah menjadi ${
                                        !isProcessed ? 'Sudah Dipotong' : 'Belum'
                                      }.`
                                    );
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-[0.98] ${
                                    isProcessed
                                      ? 'bg-canvas text-ink-muted border-border hover:text-ink'
                                      : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                  }`}
                                >
                                  {isProcessed ? 'Batal Potong' : 'Potong Gaji'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const content = `SLIP GAJI & POTONGAN KASBON PETUGAS - WARGAHUB\n==============================================\nPeriode: ${payrollMonth}\nNama Petugas: ${
                                    s.name
                                  }\nJabatan: ${s.role}\nNo. Telepon: ${
                                    s.phone
                                  }\n\nGaji Pokok (Gross): ${formatRupiah(
                                    s.salary
                                  )}\nPotongan Kasbon: - ${formatRupiah(
                                    deduction
                                  )}\nSisa Saldo Kasbon: ${formatRupiah(
                                    activeLoan ? activeLoan.remainingBalance : 0
                                  )}\n----------------------------------------------\nTake-Home Pay (Diterima): ${formatRupiah(
                                    takeHomePay
                                  )}\n\nStatus Pemotongan: ${
                                    isProcessed ? 'SUDAH DIPOTONG' : 'BELUM DIPOTONG'
                                  }\nDicetak pada: ${new Date().toLocaleString(
                                    'id-ID'
                                  )}\nBendahara Paguyuban Komplek`;
                                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `SLIP_GAJI_${s.name.replace(/\s+/g, '_')}_${payrollMonth.replace(
                                    /\s+/g,
                                    '_'
                                  )}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                  showToast(`Slip gaji ${s.name} berhasil diunduh.`);
                                }}
                                className="p-1.5 hover:bg-canvas text-ink-muted hover:text-ink rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Unduh Slip Gaji"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: BUKU KAS MASUK ANGSURAN ================= */}
      {activeSubTab === 'repayment_history' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span>Buku Kas Masuk Riwayat Angsuran & Pelunasan Kasbon</span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Rekapitulasi log mutasi kas masuk pelunasan angsuran pinjaman melalui potong gaji payroll maupun setoran
                  tunai.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={historyMethodFilter}
                  onChange={(e) => setHistoryMethodFilter(e.target.value)}
                  className="px-3 py-1.5 bg-canvas border border-border rounded-xl font-bold text-ink text-xs"
                >
                  <option value="ALL">Semua Metode Pembayaran</option>
                  <option value="POTONG_GAJI">Potong Gaji Bulanan</option>
                  <option value="TUNAI_CASH">Tunai / Cash</option>
                  <option value="TRANSFER_BCA">Transfer BCA</option>
                </select>
              </div>
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-emerald-900 font-bold block text-[11px]">Total Angsuran Masuk Kas</span>
                <p className="text-xl font-black font-mono text-emerald-800 tabular-nums">
                  {formatRupiah(totalRepaymentsAmount)}
                </p>
                <span className="text-[10px] text-emerald-700 block font-medium">Akumulasi pelunasan petugas</span>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                <span className="text-ink-muted font-bold block text-[11px]">Total Transaksi Pembayaran</span>
                <p className="text-xl font-black font-mono text-ink tabular-nums">
                  {allInstallments.length} <span className="text-xs font-normal text-ink-muted">Setoran</span>
                </p>
                <span className="text-[10px] text-ink-muted block">Tercatat di pembukuan kas</span>
              </div>

              <div className="p-4 bg-canvas rounded-2xl border border-border space-y-1">
                <span className="text-ink-muted font-bold block text-[11px]">Rata-rata Nominal Angsuran</span>
                <p className="text-xl font-black font-mono text-primary-700 tabular-nums">
                  {formatRupiah(
                    allInstallments.length > 0 ? Math.round(totalRepaymentsAmount / allInstallments.length) : 0
                  )}
                </p>
                <span className="text-[10px] text-primary-600 block font-medium">Rata-rata cicilan / setoran</span>
              </div>
            </div>

            {/* Installments Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                      <th className="py-3 px-4">Tanggal Setor</th>
                      <th className="py-3 px-4">No. Kasbon</th>
                      <th className="py-3 px-4">Nama Petugas</th>
                      <th className="py-3 px-4">Angsuran Ke-</th>
                      <th className="py-3 px-4">Nominal Angsuran</th>
                      <th className="py-3 px-4">Metode Pembayaran</th>
                      <th className="py-3 px-4">Penerima Kas</th>
                      <th className="py-3 px-4 text-right">Kuitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allInstallments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-ink-muted font-medium">
                          Belum ada catatan mutasi kas masuk angsuran kasbon.
                        </td>
                      </tr>
                    ) : (
                      allInstallments.map((inst, i) => (
                        <tr key={i} className="hover:bg-canvas/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-ink">{inst.paymentDate}</td>
                          <td className="py-3 px-4 font-mono font-bold text-primary-700">{inst.loanId}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">{inst.staffName}</span>
                            <span className="text-[10px] text-ink-muted">{inst.staffRole}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-ink">Cicilan #{inst.installmentNo}</td>
                          <td className="py-3 px-4 font-mono font-black text-emerald-700 text-sm">
                            + {formatRupiah(inst.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
                              {inst.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink-muted">{inst.receivedBy}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceipt({
                                  loan: inst.parentLoan,
                                  installment: inst,
                                });
                                setShowReceiptModal(true);
                              }}
                              className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border text-ink rounded-lg font-bold text-[10px] inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                            >
                              <Eye className="w-3 h-3 text-primary-600" />
                              <span>Lihat Slip</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: KEBIJAKAN & ATURAN KASBON ================= */}
      {activeSubTab === 'loan_policies' && (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
          <div className="p-6 bg-surface rounded-3xl border border-border shadow-card space-y-5 text-xs">
            <div className="border-b border-border pb-4">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary-600" />
                <span>Tata Tertib & Kebijakan Kasbon Paguyuban Komplek</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Konfigurasi batas maksimal peminjaman, tenor maksimal, dan tata cara persetujuan kasbon agar kesehatan
                arus kas paguyuban tetap terjaga.
              </p>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink block mb-1">Plafon Maksimal Pinjaman (% dari Gaji)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={loanPolicy.maxLoanRatio}
                      onChange={(e) =>
                        setLoanPolicy({ ...loanPolicy, maxLoanRatio: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-ink-muted">%</span>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Direkomendasikan maksimal 50% untuk menjaga gaji petugas tidak minus.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Tenor Maksimal Cicilan (Bulan)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={loanPolicy.maxTenorMonths}
                      onChange={(e) =>
                        setLoanPolicy({ ...loanPolicy, maxTenorMonths: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-ink-muted">Bulan</span>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Batas waktu maksimal pelunasan pinjaman kasbon.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-ink block mb-1">Masa Kerja Minimum Petugas (Bulan)</label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={loanPolicy.minWorkingMonths}
                    onChange={(e) =>
                      setLoanPolicy({ ...loanPolicy, minWorkingMonths: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Syarat masa pengabdian sebelum diperkenankan mengajukan kasbon cicilan.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Sumber Kas Pencairan Default</label>
                  <select
                    value={loanPolicy.defaultDisbursementSource}
                    onChange={(e) =>
                      setLoanPolicy({ ...loanPolicy, defaultDisbursementSource: e.target.value })
                    }
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Kas Operasional BCA">Kas Operasional BCA</option>
                    <option value="Kas Tunai Pos Satpam">Kas Tunai Pos Satpam</option>
                  </select>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    Rekening kas yang digunakan saat uang kasbon dicairkan ke staf.
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Otorisasi & Pihak yang Menyetujui</label>
                <input
                  type="text"
                  value={loanPolicy.requiredApprovers}
                  onChange={(e) =>
                    setLoanPolicy({ ...loanPolicy, requiredApprovers: e.target.value })
                  }
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keterangan & Catatan Tata Tertib</label>
                <textarea
                  rows={3}
                  value={loanPolicy.repaymentNotes}
                  onChange={(e) =>
                    setLoanPolicy({ ...loanPolicy, repaymentNotes: e.target.value })
                  }
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Kebijakan Paguyuban</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT KASBON ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>{editingLoanId ? 'Edit Data Kasbon Petugas' : 'Catat Kasbon / Gaji di Awal Baru'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Pilih Nama Petugas / Staf *</label>
                <select
                  value={fStaffName}
                  onChange={(e) => {
                    const found = staffPresets.find((s) => s.name === e.target.value);
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
                    <option key={idx} value={s.name}>
                      {s.name} ({s.role} - Gaji: {formatRupiah(s.salary)})
                    </option>
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
                      setFTTotalAmount(val);
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
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                <span className="font-bold text-emerald-950 block text-[11px]">
                  Simulasi Penggajian Petugas (Payroll):
                </span>
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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
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
              <button onClick={() => setShowInstallmentModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-ink">
                <span>Nama Petugas:</span>
                <span>
                  {selectedLoan.staffName} ({selectedLoan.staffRole})
                </span>
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
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
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
                  <span>Riwayat Angsuran Kasbon: {selectedLoan.staffName}</span>
                </h3>
                <p className="text-[11px] text-ink-muted">No. Pinjaman: {selectedLoan.id}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
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
                    <div
                      key={inst.id}
                      className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-ink block">Cicilan ke-{inst.installmentNo}</span>
                        <span className="text-[10px] text-ink-muted font-mono">
                          {inst.paymentDate} • {inst.paymentMethod.replace(/_/g, ' ')}
                        </span>
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
                className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KUITANSI TANDA TERIMA ANGSURAN ================= */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-sm text-ink">Bukti Kuitansi Angsuran Kasbon</h3>
                <p className="text-[11px] text-ink-muted font-mono">
                  No. Ref: {selectedReceipt.installment.id.toUpperCase()}
                </p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Petugas / Peminjam:</span>
                <span className="font-black text-ink">{selectedReceipt.loan.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Jabatan:</span>
                <span className="font-bold text-ink">{selectedReceipt.loan.staffRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Pembayaran:</span>
                <span className="font-bold text-ink">
                  Angsuran Ke-{selectedReceipt.installment.installmentNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Metode Pembayaran:</span>
                <span className="font-bold text-primary-700">
                  {selectedReceipt.installment.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tanggal Setor:</span>
                <span className="font-mono text-ink">{selectedReceipt.installment.paymentDate}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="font-bold text-ink">Nominal Diterima:</span>
                <span className="font-black text-base text-emerald-700 font-mono">
                  {formatRupiah(selectedReceipt.installment.amount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-[11px]">Telah Diterima Kas Paguyuban</p>
                <p className="text-emerald-800 text-[10px]">Oleh: Hendra Wijaya (Bendahara)</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 border border-border text-ink font-bold rounded-xl hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI APPROVAL ================= */}
      {loanForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink">
                {approvalDecision === 'APPROVE' ? 'Setujui Pengajuan Kasbon' : 'Tolak Pengajuan Kasbon'}
              </h3>
              <button onClick={() => setLoanForApproval(null)} className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-canvas rounded-2xl border border-border space-y-1.5">
              <div className="flex justify-between font-bold text-ink">
                <span>Nama Petugas:</span>
                <span>{loanForApproval.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Nominal:</span>
                <span className="font-mono font-black text-rose-700">
                  {formatRupiah(loanForApproval.totalLoanAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Keperluan:</span>
                <span className="font-bold text-ink">{loanForApproval.purpose}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-ink block mb-1">Catatan Persetujuan / Alasan Penolakan:</label>
              <input
                type="text"
                placeholder={
                  approvalDecision === 'APPROVE'
                    ? 'Contoh: Disetujui pemotongan payroll mulai bulan depan'
                    : 'Contoh: Melebihi plafon batas kasbon atau masa kerja belum mencukupi'
                }
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setLoanForApproval(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleApprovePendingLoan(loanForApproval.id, approvalDecision)}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-xs active:scale-[0.98] transition-all ${
                  approvalDecision === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalDecision === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
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
                Catatan kasbon sebesar <strong>{formatRupiah(loanToDelete.totalLoanAmount)}</strong> akan dihapus
                permanen dari buku kasbon paguyuban.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLoanToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
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
