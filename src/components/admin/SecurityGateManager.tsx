import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Search,
  Car,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Smartphone,
  Users,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Phone,
  Calendar,
  Radio,
  FileText,
  AlertTriangle,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Compass,
  Zap,
  Activity,
  HardHat,
  Shield,
  LifeBuoy,
  RefreshCw,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Sliders,
  Filter,
  Sun,
  Moon,
  Home
} from 'lucide-react';

export interface SecurityGuard {
  id: string;
  nip: string;
  fullName: string;
  role: string;
  dutyCategory: 'KEAMANAN_MURNI' | 'KEAMANAN_KEBERSIHAN' | 'KEBERSIHAN_TAMAN' | 'TEKNISI_FASUM';
  team: string;
  phone: string;
  emergencyContact: string;
  certification: string;
  regNumber: string;
  assignedPost: string;
  shift: string;
  salary: number;
  nightAllowance: number;
  status: 'AKTIF_BERTUGAS' | 'LEPAS_PIKET' | 'CUTI' | 'SAKIT' | 'NONAKTIF';
  joinDate: string;
  notes?: string;
}

export interface RosterSchedule {
  id: string;
  teamName: string;
  shiftType: 'SHIFT_PAGI' | 'SHIFT_SIANG' | 'SHIFT_MALAM' | 'SHIFT_FULL_DAY' | 'SHIFT_WEEKEND' | 'SHIFT_24_JAM';
  shiftLabel: string;
  shiftHours: string;
  dutyCategory: 'KEAMANAN_MURNI' | 'KEAMANAN_KEBERSIHAN' | 'KEBERSIHAN_TAMAN' | 'TEKNISI_FASUM';
  assignedGuards: {
    guardId: string;
    guardName: string;
    role: string;
    assignedArea: string;
    specialDuty?: string;
  }[];
  status: 'SEDANG_DINAS' | 'SIAGA_SIANG' | 'LEPAS_PIKET' | 'LIBUR_OFF';
  notes?: string;
  isSolo24Hour?: boolean;
  shiftDate?: string;
  handoverTime?: string;
  nextHandoverGuardName?: string;
}

export interface PatrolLog {
  id: string;
  checkpointName: string;
  checkpointCode: string;
  guardName: string;
  guardId: string;
  condition: 'AMAN_KONDUSIF' | 'LAMPU_PJU_MATI' | 'PORTAL_TERBUKA' | 'MENCURIGAKAN' | 'HEWAN_LIAR' | 'LAINNYA';
  notes: string;
  displayTime: string;
  displayDate: string;
}

export interface SecurityEquipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'BAIK' | 'PERLU_SERVIS' | 'RUSAK' | 'HILANG';
  location: string;
  lastChecked: string;
  personInCharge: string;
  notes?: string;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  vehiclePlate: string;
  destinationHouse: string;
  purpose: string;
  entryTime: string;
  status: 'INSIDE' | 'EXITED';
}

export interface DailyDutyItem {
  id: string;
  title: string;
  category: 'KEAMANAN' | 'KEBERSIHAN' | 'FASUM';
  timeSchedule: string;
  assignedTo: string;
  isCompleted: boolean;
  completedAt?: string;
}

export const DEFAULT_GUARDS: SecurityGuard[] = [
  {
    id: 'GUARD-001',
    nip: 'SEC.2026.2280',
    fullName: 'Pa Adri Harry',
    role: 'Satpam Tunggal 24 Jam (Piket Gerbang & Patroli)',
    dutyCategory: 'KEAMANAN_MURNI',
    team: 'Petugas Piket Gerbang',
    phone: '0812-2008-2240',
    emergencyContact: '-',
    certification: 'GADA_PRATAMA',
    regNumber: 'POL-REG-88201',
    assignedPost: 'Pos Gerbang Utama (Main Gate)',
    shift: 'SHIFT_24_JAM',
    salary: 4500000,
    nightAllowance: 500000,
    status: 'AKTIF_BERTUGAS',
    joinDate: '2024-01-10',
    notes: 'Piket tunggal pos gerbang & ronda berkala mandiri 14 kavling.',
  }
];

export const DEFAULT_DUTIES_24H: DailyDutyItem[] = [
  { id: 'DUTY-01', title: 'Serah Terima Piket 24 Jam & Inventaris HT/Kunci Gerbang', category: 'KEAMANAN', timeSchedule: '07:00 WIB', assignedTo: 'Satpam Bertugas', isCompleted: true, completedAt: '07:05 WIB' },
  { id: 'DUTY-02', title: 'Pemeriksaan Portal & Standby Tamu / Kurir Paket Pagi', category: 'KEAMANAN', timeSchedule: '08:00 - 12:00 WIB', assignedTo: 'Satpam Bertugas', isCompleted: true, completedAt: '09:30 WIB' },
  { id: 'DUTY-03', title: 'Patroli Siang Lingkungan Blok A - D & Pemeriksaan Fasum', category: 'KEAMANAN', timeSchedule: '13:00 - 14:00 WIB', assignedTo: 'Satpam Bertugas', isCompleted: true, completedAt: '13:45 WIB' },
  { id: 'DUTY-04', title: 'Nyalakan Lampu PJU Utama & Penerangan Taman Komplek', category: 'FASUM', timeSchedule: '17:45 - 18:00 WIB', assignedTo: 'Satpam Bertugas', isCompleted: false },
  { id: 'DUTY-05', title: 'Penutupan & Penguncian Portal Utama Komplek (Akses Satu Pintu)', category: 'KEAMANAN', timeSchedule: '21:00 WIB', assignedTo: 'Satpam Bertugas', isCompleted: false },
  { id: 'DUTY-06', title: 'Ronda Keliling Malam Sesi 1 & Cek Kendaraan Terparkir di Kavling', category: 'KEAMANAN', timeSchedule: '23:30 - 00:30 WIB', assignedTo: 'Satpam Bertugas', isCompleted: false },
  { id: 'DUTY-07', title: 'Ronda Keliling Dini Hari Sesi 2 & Pemeriksaan Pagar Keliling', category: 'KEAMANAN', timeSchedule: '02:30 - 03:30 WIB', assignedTo: 'Satpam Bertugas', isCompleted: false },
  { id: 'DUTY-08', title: 'Padamkan Lampu PJU, Buka Portal & Siapkan Buku Mutasi Pagi', category: 'FASUM', timeSchedule: '05:30 - 06:30 WIB', assignedTo: 'Satpam Bertugas', isCompleted: false },
];

export const DEFAULT_ROSTERS: RosterSchedule[] = [
  {
    id: 'ROSTER-SOLO-24H-TODAY',
    teamName: 'Piket Tunggal 24 Jam (Pagi s/d Pagi)',
    shiftType: 'SHIFT_24_JAM',
    shiftLabel: 'Shift 24 Jam (Pagi s/d Pagi)',
    shiftHours: '07:00 - 07:00 WIB (24 Jam Penuh)',
    dutyCategory: 'KEAMANAN_MURNI',
    assignedGuards: [
      {
        guardId: 'GUARD-001',
        guardName: 'Pa Adri Harry',
        role: 'Satpam Tunggal 24 Jam',
        assignedArea: 'Pos Gerbang Utama & Ronda 14 Kavling',
        specialDuty: 'Jaga Gerbang Pagi-Malam, Nyalakan PJU 18:00, Portal Tutup 21:00, Ronda Dini Hari'
      }
    ],
    status: 'SEDANG_DINAS',
    isSolo24Hour: true,
    shiftDate: new Date().toISOString().split('T')[0],
    handoverTime: '07:00 WIB',
    notes: 'Sistem operasional klaster 14 kavling: 1 satpam piket mandiri 24 jam penuh (Pa Adri Harry).'
  }
];

export interface SecurityGateManagerProps {
  initialProperties?: any[];
  initialVehicles?: any[];
}

export const SecurityGateManager: React.FC<SecurityGateManagerProps> = ({
  initialProperties = [],
  initialVehicles = [],
}) => {
  // Main Subtab State
  const [activeTab, setActiveTab] = useState<'guards' | 'roster' | 'patrol' | 'gate' | 'inventory' | 'emergency'>('guards');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper local persistence
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

  // ================= 1. SECURITY GUARDS STATE =================
  const [guards, setGuards] = useState<SecurityGuard[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_security_guards');
        const deletedStr = localStorage.getItem('wargahub_deleted_guards');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter((g: any) => 
              !deletedIds.includes(g.id) && 
              !deletedIds.includes(g.fullName) &&
              !g.fullName?.toLowerCase().includes('suparman') &&
              !g.fullName?.toLowerCase().includes('joko') &&
              !g.fullName?.toLowerCase().includes('bambang')
            );
            if (filtered.length > 0) return filtered;
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return DEFAULT_GUARDS;
  });

  // Teams List (Customizable)
  const initialTeams = ['Regu Piket 24 Jam', 'Regu A - Garuda', 'Regu B - Rajawali', 'Regu Cadangan & Fasum', 'Tim Kebersihan & Fasum'];
  const [teamsList, setTeamsList] = useState<string[]>(() =>
    getPersisted('wargahub_security_teams', initialTeams)
  );

  // Guards Search, Filter & Pagination
  const [guardSearch, setGuardSearch] = useState('');
  const [guardTeamFilter, setGuardTeamFilter] = useState('ALL');
  const [guardDutyFilter, setGuardDutyFilter] = useState('ALL');
  const [guardCertFilter, setGuardCertFilter] = useState('ALL');
  const [guardStatusFilter, setGuardStatusFilter] = useState('ALL');
  const [guardSortBy, setGuardSortBy] = useState<'fullName' | 'nip' | 'team' | 'role' | 'status'>('fullName');
  const [guardSortOrder, setGuardSortOrder] = useState<'asc' | 'desc'>('asc');
  const [guardPage, setGuardPage] = useState(1);
  const [guardPageSize, setGuardPageSize] = useState(8);

  // Bulk Selection for Guards
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);
  const [showBulkDeleteGuardModal, setShowBulkDeleteGuardModal] = useState(false);
  const [bulkDeletingGuard, setBulkDeletingGuard] = useState(false);

  // Modals for Guards
  const [activeGuardView, setActiveGuardView] = useState<SecurityGuard | null>(null);
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [editingGuardId, setEditingGuardId] = useState<string | null>(null);
  const [guardToDelete, setGuardToDelete] = useState<SecurityGuard | null>(null);
  const [guardSaving, setGuardSaving] = useState(false);

  // Guard Form Inputs
  const [gFullName, setGFullName] = useState('');
  const [gNip, setGNip] = useState('');
  const [gRole, setGRole] = useState('Satpam Tunggal 24 Jam');
  const [gCustomRole, setGCustomRole] = useState('');
  const [gDutyCategory, setGDutyCategory] = useState<SecurityGuard['dutyCategory']>('KEAMANAN_MURNI');
  const [gTeam, setGTeam] = useState('Regu Piket 24 Jam');
  const [gCustomTeam, setGCustomTeam] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gEmergency, setGEmergency] = useState('');
  const [gCertification, setGCertification] = useState('GADA_PRATAMA');
  const [gRegNumber, setGRegNumber] = useState('');
  const [gAssignedPost, setGAssignedPost] = useState('Pos Gerbang Utama (Main Gate)');
  const [gCustomPost, setGCustomPost] = useState('');
  const [gShift, setGShift] = useState('SHIFT_24_JAM');
  const [gSalary, setGSalary] = useState(4500000);
  const [gNightAllowance, setGNightAllowance] = useState(500000);
  const [gStatus, setGStatus] = useState<'AKTIF_BERTUGAS' | 'LEPAS_PIKET' | 'CUTI' | 'SAKIT' | 'NONAKTIF'>('AKTIF_BERTUGAS');
  const [gNotes, setGNotes] = useState('');

  // ================= 2. ROSTER & SHIFT MANAGEMENT STATE =================
  const [rosters, setRosters] = useState<RosterSchedule[]>(() => {
    const persisted = getPersisted<RosterSchedule[]>('wargahub_security_rosters', []);
    if (persisted && persisted.length > 0) {
      const clean = persisted.filter(r => 
        !r.assignedGuards?.some((g: any) => 
          g.guardName?.toLowerCase().includes('joko') || 
          g.guardName?.toLowerCase().includes('suparman') ||
          g.guardName?.toLowerCase().includes('bambang')
        )
      );
      if (clean.length > 0) return clean;
    }
    return DEFAULT_ROSTERS;
  });

  // Mode Operasional: Mode 1 Satpam 24 Jam (Pagi s/d Pagi) vs Multi-Shift Reguler
  const [rosterMode, setRosterMode] = useState<'SOLO_24H' | 'MULTI_SHIFT'>(() =>
    getPersisted<'SOLO_24H' | 'MULTI_SHIFT'>('wargahub_roster_mode', 'SOLO_24H')
  );

  const handleToggleRosterMode = (mode: 'SOLO_24H' | 'MULTI_SHIFT') => {
    setRosterMode(mode);
    savePersisted('wargahub_roster_mode', mode);
    showToast(`Mode operasional diubah: ${mode === 'SOLO_24H' ? 'Mode Komplek Kecil: 1 Satpam 24 Jam (Pagi s/d Pagi)' : 'Mode Multi-Shift Reguler'}`);
  };

  // Solo 24-Hour Roster Modal State
  const [showSolo24hModal, setShowSolo24hModal] = useState(false);
  const [soloGuardToday, setSoloGuardToday] = useState('');
  const [soloGuardTomorrow, setSoloGuardTomorrow] = useState('');
  const [soloHandoverTime, setSoloHandoverTime] = useState('07:00');
  const [soloNotes, setSoloNotes] = useState('Piket tunggal 24 jam klaster perumahan (14 unit kavling). Standby pos gerbang, verifikasi kurir/tamu, kontrol lampu PJU 18:00, gembok portal 21:00, ronda malam keliling.');

  // Roster Modals State
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string | null>(null);
  const [rTeamName, setRTeamName] = useState('Piket Tunggal 24 Jam');
  const [rShiftType, setRShiftType] = useState<RosterSchedule['shiftType']>('SHIFT_24_JAM');
  const [rShiftLabel, setRShiftLabel] = useState('Shift 24 Jam (Pagi s/d Pagi)');
  const [rShiftHours, setRShiftHours] = useState('07:00 - 07:00 WIB (24 Jam Penuh)');
  const [rDutyCategory, setRDutyCategory] = useState<RosterSchedule['dutyCategory']>('KEAMANAN_MURNI');
  const [rStatus, setRStatus] = useState<RosterSchedule['status']>('SEDANG_DINAS');
  const [rNotes, setRNotes] = useState('');
  const [rSelectedGuardIds, setRSelectedGuardIds] = useState<string[]>([]);

  // Swap Shift Modal State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapGuardFrom, setSwapGuardFrom] = useState('');
  const [swapGuardTo, setSwapGuardTo] = useState('');
  const [swapReason, setSwapReason] = useState('Izin Keperluan Keluarga / Sakit');

  // Daily Duty Checklist State
  const [dailyDuties, setDailyDuties] = useState<DailyDutyItem[]>(() => {
    const persisted = getPersisted<DailyDutyItem[]>('wargahub_security_duties', []);
    if (persisted && persisted.length > 0) return persisted;
    return DEFAULT_DUTIES_24H;
  });

  const toggleDutyCompleted = (id: string) => {
    const updated = dailyDuties.map(d => {
      if (d.id === id) {
        const nextState = !d.isCompleted;
        return {
          ...d,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : undefined
        };
      }
      return d;
    });
    setDailyDuties(updated);
    savePersisted('wargahub_security_duties', updated);
    showToast('Status tugas harian berhasil diperbarui.');
  };

  // ================= 3. PATROL LOGS STATE =================
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>(() =>
    getPersisted('wargahub_patrol_logs', [])
  );

  // Patrol Form Modal
  const [showAddPatrolModal, setShowAddPatrolModal] = useState(false);
  const [patCheckpoint, setPatCheckpoint] = useState('CP-01');
  const [patGuard, setPatGuard] = useState('');
  const [patCondition, setPatCondition] = useState<PatrolLog['condition']>('AMAN_KONDUSIF');
  const [patNotes, setPatNotes] = useState('');
  const [patrolSaving, setPatrolSaving] = useState(false);

  // ================= 4. SECURITY EQUIPMENT INVENTORY STATE =================
  const [equipmentList, setEquipmentList] = useState<SecurityEquipment[]>(() =>
    getPersisted('wargahub_security_equipment', [])
  );

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipId, setEditingEquipId] = useState<string | null>(null);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState('KOMUNIKASI');
  const [eqQty, setEqQty] = useState(1);
  const [eqCondition, setEqCondition] = useState<SecurityEquipment['condition']>('BAIK');
  const [eqLocation, setEqLocation] = useState('Pos Gerbang Utama');
  const [eqNotes, setEqNotes] = useState('');

  // ================= 5. VISITOR GATE & QR SCANNER STATE =================
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [searchingPlate, setSearchingPlate] = useState('');
  const [plateResult, setPlateResult] = useState<any>(null);

  // Barrier Gate Relay Control State
  const [gate1Open, setGate1Open] = useState(false);
  const [gate2Open, setGate2Open] = useState(false);
  const [gate1Countdown, setGate1Countdown] = useState<number | null>(null);
  const [gate2Countdown, setGate2Countdown] = useState<number | null>(null);
  const [sirenActive, setSirenActive] = useState(false);

  // Tactical Cockpit Clock (WIB)
  const [currentWibTime, setCurrentWibTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentWibTime(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Visitor Filter & Search
  const [visitorFilterStatus, setVisitorFilterStatus] = useState<'ALL' | 'INSIDE' | 'EXITED'>('ALL');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visCategory, setVisCategory] = useState('Keluarga / Tamu');

  // New Visitor Form State
  const [visName, setVisName] = useState('');
  const [visPlate, setVisPlate] = useState('');
  const [visHouse, setVisHouse] = useState((initialProperties && initialProperties[0]?.code) || 'Kav A');
  const [visPurpose, setVisPurpose] = useState('Kunjungan Keluarga');
  const [visitors, setVisitors] = useState<VisitorLog[]>(() =>
    getPersisted('wargahub_live_visitors', [])
  );

  useEffect(() => {
    savePersisted('wargahub_live_visitors', visitors);
  }, [visitors]);

  // ================= FILTERED GUARDS =================
  const filteredAndSortedGuards = useMemo(() => {
    let list = (guards || []).filter(g => {
      const matchSearch =
        g.fullName.toLowerCase().includes(guardSearch.toLowerCase()) ||
        g.nip.toLowerCase().includes(guardSearch.toLowerCase()) ||
        g.assignedPost.toLowerCase().includes(guardSearch.toLowerCase()) ||
        g.role.toLowerCase().includes(guardSearch.toLowerCase());

      const matchTeam = guardTeamFilter === 'ALL' || g.team === guardTeamFilter;
      const matchDuty = guardDutyFilter === 'ALL' || g.dutyCategory === guardDutyFilter;
      const matchCert = guardCertFilter === 'ALL' || g.certification === guardCertFilter;
      const matchStatus = guardStatusFilter === 'ALL' || g.status === guardStatusFilter;

      return matchSearch && matchTeam && matchDuty && matchCert && matchStatus;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (guardSortBy === 'fullName') comp = a.fullName.localeCompare(b.fullName);
      else if (guardSortBy === 'nip') comp = a.nip.localeCompare(b.nip);
      else if (guardSortBy === 'team') comp = a.team.localeCompare(b.team);
      else if (guardSortBy === 'role') comp = a.role.localeCompare(b.role);
      else if (guardSortBy === 'status') comp = a.status.localeCompare(b.status);

      return guardSortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [guards, guardSearch, guardTeamFilter, guardDutyFilter, guardCertFilter, guardStatusFilter, guardSortBy, guardSortOrder]);

  const totalGuards = filteredAndSortedGuards.length;
  const totalGuardPages = Math.max(1, Math.ceil(totalGuards / guardPageSize));
  const safeGuardPage = Math.min(guardPage, totalGuardPages);
  const guardStartIndex = (safeGuardPage - 1) * guardPageSize;
  const guardEndIndex = Math.min(guardStartIndex + guardPageSize, totalGuards);
  const paginatedGuards = filteredAndSortedGuards.slice(guardStartIndex, guardEndIndex);

  // ================= GUARD HANDLERS =================
  const handleOpenAddGuard = () => {
    setEditingGuardId(null);
    setGFullName('');
    setGNip(`SEC.2026.${Math.floor(1000 + Math.random() * 9000)}`);
    setGRole('Anggota Jaga Pos Utama & Gerbang');
    setGCustomRole('');
    setGDutyCategory('KEAMANAN_MURNI');
    setGTeam(teamsList[0] || 'Regu A - Garuda');
    setGCustomTeam('');
    setGPhone('');
    setGEmergency('');
    setGCertification('GADA_PRATAMA');
    setGRegNumber(`POL-REG-${Math.floor(100000 + Math.random() * 900000)}`);
    setGAssignedPost('Pos Gerbang Utama (Main Gate)');
    setGCustomPost('');
    setGShift('SHIFT_PAGI');
    setGSalary(4300000);
    setGNightAllowance(350000);
    setGStatus('AKTIF_BERTUGAS');
    setGNotes('');
    setShowGuardModal(true);
  };

  const handleOpenEditGuard = (g: SecurityGuard) => {
    setEditingGuardId(g.id);
    setGFullName(g.fullName);
    setGNip(g.nip);
    setGRole(g.role);
    setGCustomRole('');
    setGDutyCategory(g.dutyCategory || 'KEAMANAN_MURNI');
    if (teamsList.includes(g.team)) {
      setGTeam(g.team);
      setGCustomTeam('');
    } else {
      setGTeam('LAINNYA');
      setGCustomTeam(g.team);
    }
    setGPhone(g.phone);
    setGEmergency(g.emergencyContact);
    setGCertification(g.certification);
    setGRegNumber(g.regNumber);
    setGAssignedPost(g.assignedPost);
    setGCustomPost('');
    setGShift(g.shift);
    setGSalary(g.salary);
    setGNightAllowance(g.nightAllowance);
    setGStatus(g.status);
    setGNotes(g.notes || '');
    setShowGuardModal(true);
  };

  const handleSaveGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardSaving(true);
    try {
      const finalRole = gRole === 'LAINNYA' ? gCustomRole : gRole;
      const finalPost = gAssignedPost === 'LAINNYA' ? gCustomPost : gAssignedPost;
      const finalTeam = gTeam === 'LAINNYA' ? gCustomTeam.trim() : gTeam;

      if (gTeam === 'LAINNYA' && gCustomTeam.trim() && !teamsList.includes(gCustomTeam.trim())) {
        const nextTeams = [...teamsList, gCustomTeam.trim()];
        setTeamsList(nextTeams);
        savePersisted('wargahub_security_teams', nextTeams);
      }

      const payload = {
        id: editingGuardId || undefined,
        nip: gNip,
        fullName: gFullName,
        role: finalRole,
        dutyCategory: gDutyCategory,
        team: finalTeam,
        phone: gPhone,
        emergencyContact: gEmergency,
        certification: gCertification,
        regNumber: gRegNumber,
        assignedPost: finalPost,
        shift: gShift,
        salary: Number(gSalary),
        nightAllowance: Number(gNightAllowance),
        status: gStatus,
        notes: gNotes,
      };

      const res = await fetch('/api/security/guards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        const savedGuard: SecurityGuard = json.data;
        let nextGuards: SecurityGuard[];
        if (editingGuardId) {
          nextGuards = guards.map(g => g.id === editingGuardId ? savedGuard : g);
          showToast(`Data personel ${savedGuard.fullName} berhasil diperbarui.`);
        } else {
          nextGuards = [savedGuard, ...guards];
          showToast(`Personel baru ${savedGuard.fullName} berhasil ditambahkan.`);
        }
        setGuards(nextGuards);
        savePersisted('wargahub_security_guards', nextGuards);
        setShowGuardModal(false);
        setEditingGuardId(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menyimpan data personel satpam.');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyimpan data personel.');
    } finally {
      setGuardSaving(false);
    }
  };

  const handleConfirmDeleteGuard = async () => {
    if (!guardToDelete) return;
    try {
      const res = await fetch('/api/security/guards/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guardToDelete.id })
      });

      if (res.ok) {
        const nextGuards = guards.filter(g => g.id !== guardToDelete.id);
        setGuards(nextGuards);
        savePersisted('wargahub_security_guards', nextGuards);
        addDeletedIds('wargahub_deleted_guards', [guardToDelete.id, guardToDelete.fullName]);
        showToast(`Personel satpam ${guardToDelete.fullName} berhasil dinonaktifkan.`);
        setGuardToDelete(null);
        if (activeGuardView?.id === guardToDelete.id) setActiveGuardView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data personel satpam.');
    }
  };

  const handleToggleSelectAllGuards = () => {
    if (paginatedGuards.length > 0 && paginatedGuards.every(g => selectedGuardIds.includes(g.id))) {
      setSelectedGuardIds(prev => prev.filter(id => !paginatedGuards.some(g => g.id === id)));
    } else {
      const pageIds = paginatedGuards.map(g => g.id);
      setSelectedGuardIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOneGuard = (id: string) => {
    setSelectedGuardIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDeleteGuard = async () => {
    if (selectedGuardIds.length === 0) return;
    setBulkDeletingGuard(true);
    try {
      const selectedNames = guards.filter(g => selectedGuardIds.includes(g.id)).map(g => g.fullName);
      const res = await fetch('/api/security/guards/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedGuardIds,
          names: selectedNames,
          reason: `Penonaktifan massal ${selectedGuardIds.length} personel satpam`,
        })
      });

      if (res.ok) {
        const nextGuards = guards.filter(g => !selectedGuardIds.includes(g.id));
        setGuards(nextGuards);
        savePersisted('wargahub_security_guards', nextGuards);
        addDeletedIds('wargahub_deleted_guards', [...selectedGuardIds, ...selectedNames]);
        showToast(`${selectedGuardIds.length} personel satpam berhasil dinonaktifkan secara massal.`);
        setSelectedGuardIds([]);
        setShowBulkDeleteGuardModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses penonaktifan massal.');
    } finally {
      setBulkDeletingGuard(false);
    }
  };

  // ================= 24-HOUR SOLO GUARD HANDLERS =================
  const handleOpenSolo24hModal = () => {
    const activeSoloRoster = rosters.find(r => r.isSolo24Hour || r.shiftType === 'SHIFT_24_JAM');
    const currentGuardId = activeSoloRoster?.assignedGuards[0]?.guardId || guards[0]?.id || '';
    const nextCandidate = guards.find(g => g.id !== currentGuardId)?.id || guards[1]?.id || guards[0]?.id || '';
    
    setSoloGuardToday(currentGuardId);
    setSoloGuardTomorrow(nextCandidate);
    setSoloHandoverTime('07:00');
    setSoloNotes(activeSoloRoster?.notes || 'Piket tunggal 24 jam klaster perumahan (14 unit kavling). Standby pos gerbang, verifikasi tamu & kurir, kontrol lampu PJU 18:00, kunci portal 21:00, ronda dini hari.');
    setShowSolo24hModal(true);
  };

  const handleApplySolo24hRoster = (e: React.FormEvent) => {
    e.preventDefault();
    const todayGuard = guards.find(g => g.id === soloGuardToday) || guards[0];
    const tomorrowGuard = guards.find(g => g.id === soloGuardTomorrow) || guards[1] || guards[0];

    if (!todayGuard) {
      showToast('Pilih satpam yang bertugas hari ini.');
      return;
    }

    const newSoloRoster: RosterSchedule = {
      id: `ROSTER-SOLO-24H-${Date.now()}`,
      teamName: 'Piket Tunggal 24 Jam (Pagi s/d Pagi)',
      shiftType: 'SHIFT_24_JAM',
      shiftLabel: 'Shift 24 Jam (Pagi s/d Pagi)',
      shiftHours: `${soloHandoverTime || '07:00'} - ${soloHandoverTime || '07:00'} WIB (24 Jam Penuh)`,
      dutyCategory: 'KEAMANAN_MURNI',
      assignedGuards: [
        {
          guardId: todayGuard.id,
          guardName: todayGuard.fullName,
          role: todayGuard.role || 'Satpam Tunggal 24 Jam',
          assignedArea: todayGuard.assignedPost || 'Pos Gerbang Utama & Ronda 14 Kavling',
          specialDuty: 'Jaga Pos Pagi-Malam, Kontrol Lampu PJU 18:00, Gembok Portal 21:00, Ronda Dini Hari 02:30'
        }
      ],
      status: 'SEDANG_DINAS',
      notes: soloNotes,
      isSolo24Hour: true,
      shiftDate: new Date().toISOString().split('T')[0],
      handoverTime: `${soloHandoverTime || '07:00'} WIB`,
      nextHandoverGuardName: tomorrowGuard?.fullName || 'Petugas Pengganti'
    };

    const otherRosters = rosters.filter(r => !r.isSolo24Hour && r.shiftType !== 'SHIFT_24_JAM');
    const updatedRosters = [newSoloRoster, ...otherRosters];
    setRosters(updatedRosters);
    savePersisted('wargahub_security_rosters', updatedRosters);

    // Update guards statuses
    const updatedGuards = guards.map(g => {
      if (g.id === todayGuard.id) {
        return { ...g, status: 'AKTIF_BERTUGAS' as const, shift: 'SHIFT_24_JAM' };
      }
      if (tomorrowGuard && g.id === tomorrowGuard.id) {
        return { ...g, status: 'LEPAS_PIKET' as const, shift: 'SHIFT_24_JAM' };
      }
      return g;
    });
    setGuards(updatedGuards);
    savePersisted('wargahub_security_guards', updatedGuards);

    setShowSolo24hModal(false);
    showToast(`Roster 1 Satpam 24 Jam berhasil diaktifkan: ${todayGuard.fullName} bertugas hingga besok ${soloHandoverTime} WIB.`);
  };

  const handleQuickHandover24h = () => {
    const activeSoloRoster = rosters.find(r => r.isSolo24Hour || r.shiftType === 'SHIFT_24_JAM');
    const currentGuardId = activeSoloRoster?.assignedGuards[0]?.guardId;
    const currentGuard = guards.find(g => g.id === currentGuardId) || guards[0];
    
    const otherGuards = guards.filter(g => g.id !== currentGuard?.id);
    const incomingGuard = otherGuards.length > 0 ? otherGuards[0] : guards[0];
    const nextInLine = otherGuards.length > 1 ? otherGuards[1] : currentGuard;

    if (!incomingGuard || !currentGuard) {
      showToast('Data personel satpam tidak cukup untuk pergantian.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newSoloRoster: RosterSchedule = {
      id: `ROSTER-SOLO-24H-${Date.now()}`,
      teamName: 'Piket Tunggal 24 Jam (Pagi s/d Pagi)',
      shiftType: 'SHIFT_24_JAM',
      shiftLabel: 'Shift 24 Jam (Pagi s/d Pagi)',
      shiftHours: '07:00 - 07:00 WIB (24 Jam Penuh)',
      dutyCategory: 'KEAMANAN_MURNI',
      assignedGuards: [
        {
          guardId: incomingGuard.id,
          guardName: incomingGuard.fullName,
          role: incomingGuard.role || 'Satpam Tunggal 24 Jam',
          assignedArea: incomingGuard.assignedPost || 'Pos Gerbang Utama & Ronda 14 Kavling',
          specialDuty: `Serah terima piket pada ${nowStr}. Jaga pos, kontrol PJU & gembok portal malam`
        }
      ],
      status: 'SEDANG_DINAS',
      notes: `Serah terima piket 24 jam pagi dari ${currentGuard.fullName} ke ${incomingGuard.fullName}. Inventaris HT & kunci portal lengkap.`,
      isSolo24Hour: true,
      shiftDate: new Date().toISOString().split('T')[0],
      handoverTime: '07:00 WIB',
      nextHandoverGuardName: nextInLine?.fullName || currentGuard.fullName
    };

    const otherRosters = rosters.filter(r => !r.isSolo24Hour && r.shiftType !== 'SHIFT_24_JAM');
    const updatedRosters = [newSoloRoster, ...otherRosters];
    setRosters(updatedRosters);
    savePersisted('wargahub_security_rosters', updatedRosters);

    const updatedGuards = guards.map(g => {
      if (g.id === incomingGuard.id) {
        return { ...g, status: 'AKTIF_BERTUGAS' as const, shift: 'SHIFT_24_JAM' };
      }
      if (g.id === currentGuard.id) {
        return { ...g, status: 'LEPAS_PIKET' as const, shift: 'SHIFT_24_JAM' };
      }
      return g;
    });
    setGuards(updatedGuards);
    savePersisted('wargahub_security_guards', updatedGuards);

    const updatedDuties = dailyDuties.map(d => {
      if (d.id === 'DUTY-01' || d.title.toLowerCase().includes('serah terima')) {
        return { ...d, isCompleted: true, completedAt: nowStr };
      }
      return d;
    });
    setDailyDuties(updatedDuties);
    savePersisted('wargahub_security_duties', updatedDuties);

    const handoverLog: PatrolLog = {
      id: `PATROL-HANDOVER-${Date.now()}`,
      checkpointCode: 'CP-01',
      checkpointName: 'Pos Gerbang Utama (Main Gate)',
      guardName: `${incomingGuard.fullName} (Terima dari ${currentGuard.fullName})`,
      guardId: incomingGuard.id,
      condition: 'AMAN_KONDUSIF',
      notes: `Serah terima piket 24 jam (Pagi s/d Pagi). Kondisi pos, portal, kunci gerbang, dan HT dalam keadaan baik dan lengkap.`,
      displayTime: nowStr,
      displayDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const nextLogs = [handoverLog, ...patrolLogs];
    setPatrolLogs(nextLogs);
    savePersisted('wargahub_patrol_logs', nextLogs);

    showToast(`🔄 Serah terima piket 24 jam berhasil! ${incomingGuard.fullName} kini bertugas aktif hingga esok pagi.`);
  };

  // ================= ROSTER HANDLERS =================
  const handleOpenAddRoster = () => {
    setEditingRosterId(null);
    setRTeamName('Regu Baru — Khusus');
    setRShiftType('SHIFT_PAGI');
    setRShiftLabel('Shift Pagi');
    setRShiftHours('07:00 - 15:00 WIB');
    setRDutyCategory('KEAMANAN_MURNI');
    setRStatus('SEDANG_DINAS');
    setRNotes('');
    setRSelectedGuardIds(guards.slice(0, 3).map(g => g.id));
    setShowRosterModal(true);
  };

  const handleOpenEditRoster = (r: RosterSchedule) => {
    setEditingRosterId(r.id);
    setRTeamName(r.teamName);
    setRShiftType(r.shiftType);
    setRShiftLabel(r.shiftLabel);
    setRShiftHours(r.shiftHours);
    setRDutyCategory(r.dutyCategory);
    setRStatus(r.status);
    setRNotes(r.notes || '');
    setRSelectedGuardIds(r.assignedGuards.map(g => g.guardId));
    setShowRosterModal(true);
  };

  const handleSaveRoster = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = guards
      .filter(g => rSelectedGuardIds.includes(g.id))
      .map(g => ({
        guardId: g.id,
        guardName: g.fullName,
        role: g.role,
        assignedArea: g.assignedPost,
        specialDuty: g.notes || 'Patroli & Pengawasan Pos'
      }));

    if (assigned.length === 0) {
      showToast('Pilih minimal 1 personel satpam / staf untuk jadwal ini.');
      return;
    }

    const existingRoster = rosters.find(r => r.id === editingRosterId);
    const payload: RosterSchedule = {
      id: editingRosterId || `ROSTER-${Date.now()}`,
      teamName: rTeamName,
      shiftType: rShiftType,
      shiftLabel: rShiftLabel,
      shiftHours: rShiftHours,
      dutyCategory: rDutyCategory,
      assignedGuards: assigned,
      status: rStatus,
      notes: rNotes,
      isSolo24Hour: rShiftType === 'SHIFT_24_JAM' || existingRoster?.isSolo24Hour,
      shiftDate: existingRoster?.shiftDate || new Date().toISOString().split('T')[0],
      handoverTime: existingRoster?.handoverTime || '07:00 WIB',
      nextHandoverGuardName: existingRoster?.nextHandoverGuardName
    };

    let nextRosters: RosterSchedule[];
    if (editingRosterId) {
      nextRosters = rosters.map(r => r.id === editingRosterId ? payload : r);
      showToast(`Jadwal shift untuk ${payload.teamName} berhasil diperbarui.`);
    } else {
      nextRosters = [...rosters, payload];
      showToast(`Jadwal shift baru ${payload.teamName} berhasil ditambahkan.`);
    }

    setRosters(nextRosters);
    savePersisted('wargahub_security_rosters', nextRosters);
    setShowRosterModal(false);
  };

  const handleDeleteRoster = (id: string) => {
    const nextRosters = rosters.filter(r => r.id !== id);
    setRosters(nextRosters);
    savePersisted('wargahub_security_rosters', nextRosters);
    showToast('Jadwal shift berhasil dihapus.');
  };

  const handleExecuteSwapShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapGuardFrom || !swapGuardTo || swapGuardFrom === swapGuardTo) {
      showToast('Pilih dua personel satpam yang berbeda untuk pertukaran shift.');
      return;
    }

    const fromGuard = guards.find(g => g.id === swapGuardFrom);
    const toGuard = guards.find(g => g.id === swapGuardTo);

    if (!fromGuard || !toGuard) return;

    // Swap their shifts and teams
    const nextGuards = guards.map(g => {
      if (g.id === fromGuard.id) {
        return { ...g, shift: toGuard.shift, team: toGuard.team, assignedPost: toGuard.assignedPost };
      }
      if (g.id === toGuard.id) {
        return { ...g, shift: fromGuard.shift, team: fromGuard.team, assignedPost: fromGuard.assignedPost };
      }
      return g;
    });

    setGuards(nextGuards);
    savePersisted('wargahub_security_guards', nextGuards);
    setShowSwapModal(false);
    showToast(`Pertukaran jadwal jaga antara ${fromGuard.fullName} dan ${toGuard.fullName} berhasil diaplikasikan.`);
  };

  // ================= PATROL HANDLERS =================
  const handleSavePatrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatrolSaving(true);
    try {
      const checkpointsMap: Record<string, string> = {
        'CP-01': 'Pos Gerbang Utama (Main Gate)',
        'CP-02': 'Taman Utama & Jogging Track Blok A',
        'CP-03': 'Clubhouse & Kolam Renang Blok B',
        'CP-04': 'Gerbang Timur & Pintu Darurat Blok C',
        'CP-05': 'Lapangan & Area Kompos Blok D',
        'CP-06': 'Rumah Pompa PAM & Gardu Induk PLN',
      };

      const payload = {
        checkpointCode: patCheckpoint,
        checkpointName: checkpointsMap[patCheckpoint] || 'Titik Checkpoint Komplek',
        guardName: patGuard,
        condition: patCondition,
        notes: patNotes || 'Situasi aman terkendali.',
      };

      const res = await fetch('/api/security/patrol/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        const nextLogs = [json.data, ...patrolLogs];
        setPatrolLogs(nextLogs);
        savePersisted('wargahub_patrol_logs', nextLogs);
        showToast(`Catatan patroli di ${payload.checkpointName} berhasil direkam.`);
        setShowAddPatrolModal(false);
        setPatNotes('');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal merekam log patroli.');
    } finally {
      setPatrolSaving(false);
    }
  };

  // ================= INVENTORY HANDLERS =================
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingEquipId || undefined,
        name: eqName,
        category: eqCategory,
        quantity: Number(eqQty),
        condition: eqCondition,
        location: eqLocation,
        notes: eqNotes,
      };

      const res = await fetch('/api/security/inventory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        const savedItem: SecurityEquipment = json.data;
        let nextList: SecurityEquipment[];
        if (editingEquipId) {
          nextList = equipmentList.map(item => item.id === editingEquipId ? savedItem : item);
          showToast(`Alat keamanan ${savedItem.name} berhasil diperbarui.`);
        } else {
          nextList = [savedItem, ...equipmentList];
          showToast(`Alat baru ${savedItem.name} berhasil dicatat.`);
        }
        setEquipmentList(nextList);
        savePersisted('wargahub_security_equipment', nextList);
        setShowEquipmentModal(false);
        setEditingEquipId(null);
        setEqName('');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan inventaris alat.');
    }
  };

  // ================= GATE SCANNER & VISITOR HANDLERS =================
  const handleScanVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;
    setScanLoading(true);
    try {
      const res = await fetch('/api/security/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPayload: qrInput })
      });
      const json = await res.json();
      setScanResult(json.data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memverifikasi QR code.');
    } finally {
      setScanLoading(false);
    }
  };

  const handlePlateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchingPlate) return;
    const rawPlate = searchingPlate.trim();
    const cleanPlate = rawPlate.toUpperCase().replace(/[\s\-\.]/g, '');

    // Search in initialVehicles from real database
    const matched = (initialVehicles || []).find((v: any) => {
      const p = (v.plateNumber || v.plate_number || '').toUpperCase().replace(/[\s\-\.]/g, '');
      return p === cleanPlate || p.includes(cleanPlate) || cleanPlate.includes(p);
    });

    if (matched) {
      setPlateResult({
        found: true,
        plateNumber: matched.plateNumber || matched.plate_number || rawPlate.toUpperCase(),
        vehicle: `${matched.brand || ''} ${matched.model || ''} (${matched.color || '-'})`.trim(),
        owner: matched.ownerName || 'Warga Terdaftar',
        house: matched.propertyCode ? `Unit ${matched.propertyCode}` : 'Unit Terdaftar',
        status: 'WARGA RESMI (TERVERIFIKASI)',
        type: matched.type || 'Mobil',
        rfidTag: matched.rfidTag || `RFID-WH-${matched.id ? String(matched.id).replace(/\D/g, '').slice(-6) || '882910' : '882910'}`,
      });
    } else {
      setPlateResult({
        found: false,
        plateNumber: rawPlate.toUpperCase(),
        message: 'Plat nomor tidak terdaftar dalam database kendaraan tetap warga. Catat ke Buku Tamu.',
      });
    }
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPlate) return;
    const newVisitor: VisitorLog = {
      id: `vis-${Date.now()}`,
      visitorName: visName,
      vehiclePlate: visPlate.toUpperCase(),
      destinationHouse: visHouse.startsWith('Unit') || visHouse.startsWith('Rumah') ? visHouse : `Unit ${visHouse}`,
      purpose: visPurpose,
      entryTime: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'INSIDE',
    };
    setVisitors([newVisitor, ...visitors]);
    setVisName('');
    setVisPlate('');
    showToast(`Tamu ${newVisitor.visitorName} berhasil dicatat.`);
  };

  const handleMarkVisitorExited = (visitorId: string) => {
    setVisitors(prev => prev.map(v => v.id === visitorId ? {
      ...v,
      status: 'EXITED',
      exitTime: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB'
    } : v));
    showToast('Tamu berhasil ditandai keluar.');
  };

  const handleTriggerGate = (gateNo: 1 | 2) => {
    if (gateNo === 1) {
      setGate1Open(true);
      setGate1Countdown(5);
      showToast('⚡ Palang Gerbang 1 (Pintu Masuk) DIBUKA secara manual.');
      let c1 = 5;
      const t1 = setInterval(() => {
        c1 -= 1;
        if (c1 <= 0) {
          clearInterval(t1);
          setGate1Open(false);
          setGate1Countdown(null);
        } else {
          setGate1Countdown(c1);
        }
      }, 1000);
    } else {
      setGate2Open(true);
      setGate2Countdown(5);
      showToast('⚡ Palang Gerbang 2 (Pintu Keluar) DIBUKA secara manual.');
      let c2 = 5;
      const t2 = setInterval(() => {
        c2 -= 1;
        if (c2 <= 0) {
          clearInterval(t2);
          setGate2Open(false);
          setGate2Countdown(null);
        } else {
          setGate2Countdown(c2);
        }
      }, 1000);
    }
  };

  const handleToggleSiren = () => {
    const nextState = !sirenActive;
    setSirenActive(nextState);
    if (nextState) {
      showToast('🚨 SIAGA SATPAM DIAKTIFKAN: Notifikasi darurat disiarkan!');
    } else {
      showToast('Status siaga darurat dinonaktifkan.');
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const matchStatus = visitorFilterStatus === 'ALL' || v.status === visitorFilterStatus;
    const matchSearch =
      v.visitorName.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.vehiclePlate.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.destinationHouse.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.purpose.toLowerCase().includes(visitorSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // CSV Export for Guards
  const handleExportGuardsCSV = () => {
    const headers = ['NIP', 'Nama Lengkap', 'Jabatan', 'Kategori Tugas', 'Regu Tim', 'No Telepon', 'Kontak Darurat', 'Sertifikasi KTA', 'No KTA', 'Titik Pos Bertugas', 'Shift', 'Gaji Pokok', 'Tunjangan Malam', 'Status'];
    const rows = guards.map(g => [
      g.nip,
      `"${g.fullName}"`,
      `"${g.role}"`,
      g.dutyCategory,
      `"${g.team}"`,
      g.phone,
      `"${g.emergencyContact}"`,
      g.certification,
      g.regNumber,
      `"${g.assignedPost}"`,
      g.shift,
      g.salary,
      g.nightAllowance,
      g.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_SATPAM_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data personel satpam berhasil diekspor ke CSV.');
  };

  // Helper Badge Colors
  const getGuardStatusBadge = (status: SecurityGuard['status']) => {
    switch (status) {
      case 'AKTIF_BERTUGAS':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">Aktif Bertugas</span>;
      case 'LEPAS_PIKET':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">Lepas Piket</span>;
      case 'CUTI':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-200">Cuti Tahunan</span>;
      case 'SAKIT':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">Izin Sakit</span>;
      case 'NONAKTIF':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-300">Nonaktif</span>;
    }
  };

  const getDutyCategoryBadge = (cat?: SecurityGuard['dutyCategory']) => {
    switch (cat) {
      case 'KEAMANAN_KEBERSIHAN':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200 inline-flex items-center gap-1">🛡️🧹 Keamanan & Kebersihan</span>;
      case 'KEBERSIHAN_TAMAN':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-1">🧹🌿 Kebersihan & Taman</span>;
      case 'TEKNISI_FASUM':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200 inline-flex items-center gap-1">🔧 Teknisi & Fasum</span>;
      case 'KEAMANAN_MURNI':
      default:
        return <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold text-[10px] border border-sky-200 inline-flex items-center gap-1">🛡️ Keamanan Murni</span>;
    }
  };

  const getConditionBadge = (cond: PatrolLog['condition']) => {
    switch (cond) {
      case 'AMAN_KONDUSIF':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">Aman & Kondusif</span>;
      case 'LAMPU_PJU_MATI':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">Lampu PJU Mati</span>;
      case 'PORTAL_TERBUKA':
        return <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px]">Portal Terbuka</span>;
      case 'MENCURIGAKAN':
        return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[10px]">Mencurigakan</span>;
      case 'HEWAN_LIAR':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">Hewan Liar</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]">Catatan Khusus</span>;
    }
  };

  const completedDutiesCount = dailyDuties.filter(d => d.isCompleted).length;

  // Active Solo 24-Hour Roster and Next Guard In Line
  const activeSoloRoster = rosters.find(r => r.isSolo24Hour || r.shiftType === 'SHIFT_24_JAM') || rosters[0];
  const activeGuardId = activeSoloRoster?.assignedGuards[0]?.guardId;
  const activeSoloGuard = guards.find(g => g.id === activeGuardId) || guards[0];
  const nextSoloGuardName = activeSoloRoster?.nextHandoverGuardName || '';
  const nextSoloGuardObj = guards.find(g => g.id !== activeSoloGuard?.id);

  // 7-Day Solo Rotation Projection
  const soloWeekSchedule = useMemo(() => {
    const days = [];
    const now = new Date();
    const guardName = activeSoloGuard?.fullName || 'Pa Adri Harry';

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      days.push({
        index: i,
        dateLabel: dayName,
        isToday: i === 0,
        isTomorrow: i === 1,
        guardName: guardName,
        shiftHours: '07:00 - 07:00 WIB (24 Jam Mandiri)'
      });
    }
    return days;
  }, [activeSoloGuard?.fullName]);

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
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            Pos Satpam & Tata Kelola Keamanan Komplek
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Pusat komando terpadu personel satpam, tim kebersihan fasum, roster shift 24 jam, log patroli QR, dan pintu gerbang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportGuardsCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 text-primary-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddGuard}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Personel Baru</span>
          </button>
        </div>
      </div>

      {/* Tactical Telemetry Cockpit Bar (Industrial Precision) */}
      <div className="p-3.5 bg-surface rounded-2xl border border-border/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Real-time WIB Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas rounded-xl border border-border font-mono">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            <span className="font-bold text-ink tracking-tight">{currentWibTime || '00:00:00 WIB'}</span>
          </div>

          {/* Post Telemetry Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>POS UTAMA: SIAGA</span>
          </div>

          {/* Gate 1 & 2 Fast Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas rounded-xl border border-border text-[11px]">
            <span className="text-ink-muted">G1 (Masuk):</span>
            <span className={`font-mono font-black ${gate1Open ? 'text-emerald-600' : 'text-slate-700'}`}>
              {gate1Open ? `OPEN (${gate1Countdown ?? 5}s)` : 'LOCKED'}
            </span>
            <span className="text-border mx-1">|</span>
            <span className="text-ink-muted">G2 (Keluar):</span>
            <span className={`font-mono font-black ${gate2Open ? 'text-emerald-600' : 'text-slate-700'}`}>
              {gate2Open ? `OPEN (${gate2Countdown ?? 5}s)` : 'LOCKED'}
            </span>
          </div>

          {/* Registered Vehicles Count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-canvas rounded-xl border border-border text-[11px]">
            <Car className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold text-ink">{initialVehicles.length} Kendaraan Terdata</span>
          </div>

          {/* Visitors Inside */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{visitors.filter(v => v.status === 'INSIDE').length} Tamu di Dalam</span>
          </div>
        </div>

        {/* Tactical Emergency Siren Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSiren}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs border ${
              sirenActive
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-canvas hover:bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{sirenActive ? '🚨 MATIKAN SIRINE' : '🚨 TOMBOL SIAGA'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('guards')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] shrink-0 ${
            activeTab === 'guards'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personel & Tim Jaga ({guards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'roster'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Roster Shift & Jadwal Jaga ({rosters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patrol')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'patrol'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Log Patroli & QR Checkpoint ({patrolLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gate')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'gate'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pos Gerbang, Buku Tamu & QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Inventaris Peralatan Pos ({equipmentList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'emergency'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-canvas'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Hotline Darurat & SOP</span>
        </button>
      </div>

      {/* ================= SUBTAB 1: PERSONEL & REGU JAGA ================= */}
      {activeTab === 'guards' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* KPI Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-bold block">Total Personel Aktif</span>
              <p className="text-2xl font-black text-ink mt-0.5">
                {guards.filter(g => g.status === 'AKTIF_BERTUGAS').length} <span className="text-xs font-normal text-ink-muted">/ {guards.length} Staf</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Siap Bertugas</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-bold block">Tim Serbaguna / Bersih-bersih</span>
              <p className="text-2xl font-black text-teal-700 mt-0.5">
                {guards.filter(g => g.dutyCategory !== 'KEAMANAN_MURNI').length} <span className="text-xs font-normal text-ink-muted">Petugas</span>
              </p>
              <span className="text-[10px] text-teal-600 font-bold">Dual-Role & Kebersihan</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-bold block">Sertifikasi KTA POLRI</span>
              <p className="text-2xl font-black text-primary-700 mt-0.5">
                {guards.filter(g => g.certification.includes('GADA')).length} <span className="text-xs font-normal text-ink-muted">Tersertifikasi</span>
              </p>
              <span className="text-[10px] text-primary-600 font-bold">Gada Pratama / Madya</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-bold block">Regu Terdaftar</span>
              <p className="text-2xl font-black text-purple-700 mt-0.5">
                {Array.from(new Set(guards.map(g => g.team))).length} <span className="text-xs font-normal text-ink-muted">Regu</span>
              </p>
              <span className="text-[10px] text-purple-600 font-bold">Rotasi Shift 24 Jam</span>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedGuardIds.length > 0 && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedGuardIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedGuardIds.length} Personel Satpam Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk personel yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGuardIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteGuardModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus / Nonaktifkan ({selectedGuardIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama satpam, NIP, area tugas..."
                value={guardSearch}
                onChange={(e) => {
                  setGuardSearch(e.target.value);
                  setGuardPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={guardTeamFilter}
                onChange={(e) => {
                  setGuardTeamFilter(e.target.value);
                  setGuardPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Regu ({guards.length})</option>
                {teamsList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={guardDutyFilter}
                onChange={(e) => {
                  setGuardDutyFilter(e.target.value);
                  setGuardPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Jenis Tugas</option>
                <option value="KEAMANAN_MURNI">Keamanan Murni</option>
                <option value="KEAMANAN_KEBERSIHAN">Keamanan & Kebersihan</option>
                <option value="KEBERSIHAN_TAMAN">Kebersihan & Taman</option>
                <option value="TEKNISI_FASUM">Teknisi & Fasum</option>
              </select>

              <select
                value={guardStatusFilter}
                onChange={(e) => {
                  setGuardStatusFilter(e.target.value);
                  setGuardPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF_BERTUGAS">Aktif Bertugas</option>
                <option value="LEPAS_PIKET">Lepas Piket</option>
                <option value="CUTI">Cuti Tahunan</option>
                <option value="SAKIT">Izin Sakit</option>
              </select>
            </div>
          </div>

          {/* Guards Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedGuards.length > 0 && paginatedGuards.every(g => selectedGuardIds.includes(g.id))}
                        onChange={handleToggleSelectAllGuards}
                        className="rounded border-border text-primary-600"
                      />
                    </th>
                    <th className="py-3 px-4">Nama Personel & NIP</th>
                    <th className="py-3 px-4">Jabatan & Penugasan</th>
                    <th className="py-3 px-4">Regu Tim</th>
                    <th className="py-3 px-4">Area / Titik Bertugas</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedGuards.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-muted">
                        Tidak ada data personel satpam yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedGuards.map((g) => {
                      const isSelected = selectedGuardIds.includes(g.id);
                      return (
                        <tr key={g.id} className={`hover:bg-canvas/50 transition-colors ${isSelected ? 'bg-primary-50/40' : ''}`}>
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOneGuard(g.id)}
                              className="rounded border-border text-primary-600"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xs">
                                {g.fullName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-ink block">{g.fullName}</span>
                                <span className="text-[10px] text-ink-muted font-mono">{g.nip}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-ink block">{g.role}</span>
                            <div className="mt-0.5">{getDutyCategoryBadge(g.dutyCategory)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-primary-700 block">{g.team}</span>
                            <span className="text-[10px] text-ink-muted font-mono">{g.shift.replace('SHIFT_', 'Shift ')}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-ink flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{g.assignedPost}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getGuardStatusBadge(g.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveGuardView(g)}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditGuard(g)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setGuardToDelete(g)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
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

            {/* Pagination */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-ink-muted">
                Menampilkan <strong className="text-ink">{totalGuards === 0 ? 0 : guardStartIndex + 1}</strong> - <strong className="text-ink">{guardEndIndex}</strong> dari <strong className="text-ink">{totalGuards}</strong> personel satpam
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setGuardPage(Math.max(1, guardPage - 1))}
                  disabled={safeGuardPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-ink">Hal {safeGuardPage} / {totalGuardPages}</span>
                <button
                  type="button"
                  onClick={() => setGuardPage(Math.min(totalGuardPages, guardPage + 1))}
                  disabled={safeGuardPage === totalGuardPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: JADWAL SHIFT & ROSTER JAGA ================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Actions & Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-border shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Rekomendasi Klaster Kecil
                </span>
                <span className="text-ink-muted text-xs">• 14 Kavling (A s/d M)</span>
              </div>
              <h3 className="font-black text-base text-ink flex items-center gap-2 mt-1">
                <Calendar className="w-5 h-5 text-primary-600" />
                Roster Jadwal Shift & Penugasan Area Jaga
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Pengaturan rotasi dinamis satpam tunggal 24 jam (pagi s/d pagi), serah terima estafet, buku checklist tugas harian, dan mutasi pos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-canvas rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => handleToggleRosterMode('SOLO_24H')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    rosterMode === 'SOLO_24H'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mode 1 Satpam 24 Jam</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleRosterMode('MULTI_SHIFT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    rosterMode === 'MULTI_SHIFT'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Multi-Shift Reguler</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleOpenSolo24hModal}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⚡ Atur Rotasi 1 Satpam 24 Jam</span>
              </button>

              <button
                type="button"
                onClick={handleQuickHandover24h}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
                title="Serah terima mutasi pagi ke satpam berikutnya"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>🔄 Serah Terima Pagi (Cepat)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const firstFrom = guards[0]?.id || '';
                  const firstTo = guards[1]?.id || '';
                  setSwapGuardFrom(firstFrom);
                  setSwapGuardTo(firstTo);
                  setShowSwapModal(true);
                }}
                className="px-3 py-2 bg-canvas hover:bg-surface border border-border text-ink text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
                <span>Tukar Shift</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddRoster}
                className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Shift Baru</span>
              </button>
            </div>
          </div>

          {/* ================= HERO TACTICAL CARD: 1 SATPAM TUNGGAL 24 JAM (PAGI S/D PAGI) ================= */}
          {rosterMode === 'SOLO_24H' && (
            <div className="p-5 md:p-6 bg-gradient-to-br from-amber-500/5 via-surface to-surface rounded-3xl border-2 border-amber-500/30 shadow-card space-y-5">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[11px] tracking-wide flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      SEDANG DINAS 24 JAM (PAGI S/D PAGI)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px] font-mono">
                      Jam Kerja: 07:00 WIB s/d 07:00 WIB Besok
                    </span>
                  </div>
                  <h4 className="text-base font-black text-ink mt-2 flex items-center gap-2">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span>Sistem Pengamanan Komplek Kecil: Piket Tunggal Mandiri (1 Orang Satpam)</span>
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Karena skala klaster kecil (14 kavling), pos pengamanan dioperasikan secara penuh oleh 1 orang satpam dari pagi hingga pagi berikutnya secara estafet.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-canvas px-3.5 py-2 rounded-2xl border border-border/80 shrink-0">
                  <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                  <div className="text-right">
                    <span className="text-[10px] text-ink-muted block font-semibold">Waktu WIB Saat Ini</span>
                    <span className="text-xs font-mono font-black text-ink">{currentWibTime}</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Split: Active Guard & 24H Cycle Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Active Guard Profile & Handover (5 cols) */}
                <div className="lg:col-span-5 space-y-3.5">
                  {/* Active Guard Card */}
                  <div className="p-4 bg-canvas/80 rounded-2xl border border-border space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                            {activeSoloGuard?.fullName?.charAt(0) || 'J'}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface" title="Aktif di Pos" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                              PETUGAS HARI INI
                            </span>
                          </div>
                          <h5 className="text-sm font-black text-ink mt-0.5">{activeSoloGuard?.fullName || 'Pak Joko Sutrisno'}</h5>
                          <span className="text-[11px] text-ink-muted font-mono">{activeSoloGuard?.nip || 'SEC.2026.1001'} • {activeSoloGuard?.role || 'Satpam Tunggal 24 Jam'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">Titik Jaga Utama:</span>
                        <strong className="text-ink font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {activeSoloGuard?.assignedPost || 'Pos Gerbang Utama & Ronda 14 Kavling'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">Kontak Darurat:</span>
                        <span className="text-ink font-mono">{activeSoloGuard?.emergencyContact || '-'}</span>
                      </div>
                    </div>

                    {/* Quick Call & WhatsApp Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${activeSoloGuard?.phone || '0812-3456-7890'}`}
                        className="py-2 px-3 bg-surface hover:bg-canvas text-ink border border-border font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs font-mono"
                      >
                        <Phone className="w-3.5 h-3.5 text-primary-600" />
                        <span>{activeSoloGuard?.phone || '0812-3456-7890'}</span>
                      </a>
                      <a
                        href={`https://wa.me/${activeSoloGuard?.phone ? activeSoloGuard.phone.replace(/[^0-9]/g, '') : '6281234567890'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Hubungi WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Solo Guard 24h Operational Mode Box */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Sistem Piket Tunggal Mandiri (24 Jam)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-black text-[10px]">
                        1 SATPAM TETAP
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      Sesuai skala komplek (14 kavling), pos gerbang utama dijaga mandiri oleh <strong>{activeSoloGuard?.fullName || 'Pa Adri Harry'}</strong> dari pukul <strong>07:00 WIB s/d 07:00 WIB esok hari</strong> tanpa estafet pergantian orang.
                    </p>

                    <div className="pt-1 flex items-center justify-between border-t border-emerald-200/80 text-[11px] text-emerald-800 font-mono">
                      <span>✓ Kontrol Portal & PJU Terpusat</span>
                      <span className="font-bold">Standby Pos Gerbang</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: 24-Hour Cycle Milestones (7 cols) */}
                <div className="lg:col-span-7 p-4 bg-canvas/80 rounded-2xl border border-border space-y-3.5">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <h5 className="font-black text-xs text-ink">Timeline Siklus Piket 24 Jam Pagi s/d Pagi (Standar Operasional Komplek)</h5>
                    </div>
                    <span className="text-[10px] text-ink-muted font-mono">1 Personel Bertugas Mandiri</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        time: '07:00 WIB',
                        icon: Sun,
                        title: 'Serah Terima Piket & Cek Inventaris Pos',
                        desc: 'Pemeriksaan buku mutasi, HT, lampu darurat, gembok portal, dan kondisi pos.',
                        badge: 'Waktu Masuk',
                        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      },
                      {
                        time: '08:00 - 16:00 WIB',
                        icon: ShieldCheck,
                        title: 'Standby Gerbang, Tamu & Kurir Paket',
                        desc: 'Pemeriksaan akses tamu kavling A - M, ojol makanan, paket kurir, dan keamanan jalan.',
                        badge: 'Siang Hari',
                        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
                      },
                      {
                        time: '18:00 WIB',
                        icon: Zap,
                        title: 'Nyalakan Lampu Penerangan Jalan (PJU)',
                        desc: 'Mengaktifkan saklar PJU utama di gardu dan cek lampu jalan di sepanjang kavling A - M.',
                        badge: 'Wajib Sore',
                        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
                      },
                      {
                        time: '21:00 WIB',
                        icon: Moon,
                        title: 'Gembok & Kunci Portal Utama Komplek',
                        desc: 'Akses terbatas 1 pintu diberlakukan. Setiap tamu malam wajib lapor satpam bertugas.',
                        badge: 'Keamanan Malam',
                        badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
                      },
                      {
                        time: '23:30 & 02:30 WIB',
                        icon: Compass,
                        title: 'Ronda Keliling Malam & Dini Hari (14 Kavling)',
                        desc: 'Patroli jalan kaki bersenter keliling Kav A s/d Kav M, cek mobil di carport dan pagar.',
                        badge: 'Ronda Dini Hari',
                        badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
                      },
                      {
                        time: '07:00 WIB (Besok)',
                        icon: RefreshCw,
                        title: 'Buka Portal & Serah Terima ke Petugas Berikutnya',
                        desc: 'Padamkan PJU pagi, buka kunci portal, dan serahkan buku mutasi ke satpam pengganti.',
                        badge: 'Serah Terima',
                        badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
                      }
                    ].map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={idx} className="p-2.5 bg-surface rounded-xl border border-border/70 flex items-start gap-3 transition-colors hover:border-amber-300">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 space-y-0.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-ink truncate">{step.title}</span>
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border shrink-0 ${step.badgeColor}`}>
                                {step.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-muted leading-tight">{step.desc}</p>
                            <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 pt-0.5">
                              ⏰ {step.time}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 7-Day Solo Rotation Calendar / Projection */}
              <div className="p-4 bg-canvas/90 rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <h5 className="font-black text-xs text-ink">Jadwal Rotasi Mingguan 1 Satpam Pagi-ke-Pagi (7 Hari ke Depan)</h5>
                  </div>
                  <span className="text-[10px] text-ink-muted">Bergantian Setiap 24 Jam Penuh</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {soloWeekSchedule.map((day) => (
                    <div
                      key={day.index}
                      className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                        day.isToday
                          ? 'bg-amber-500/10 border-amber-400 text-ink shadow-xs ring-1 ring-amber-400'
                          : day.isTomorrow
                          ? 'bg-surface border-border text-ink'
                          : 'bg-surface/60 border-border/70 text-ink-muted'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                        {day.dateLabel}
                      </div>
                      <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                        {day.guardName.charAt(0)}
                      </div>
                      <strong className="text-xs font-black text-ink block truncate" title={day.guardName}>
                        {day.guardName}
                      </strong>
                      <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] ${
                        day.isToday
                          ? 'bg-emerald-600 text-white'
                          : day.isTomorrow
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-ink'
                      }`}>
                        {day.isToday ? 'Hari Ini (Aktif)' : day.isTomorrow ? 'Besok (Siaga)' : 'Terjadwal'}
                      </span>
                      <div className="text-[9px] font-mono text-ink-muted">
                        07:00 - 07:00
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Duty Checklist Box */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-ink">Buku Checklist Tugas Harian Lingkungan (Security & Hygiene)</h4>
                  <p className="text-[11px] text-ink-muted">Pemeriksaan rutin harian pos satpam dan pemeliharaan fasilitas komplek</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 font-black rounded-lg">
                  {completedDutiesCount} / {dailyDuties.length} Tugas Selesai ({dailyDuties.length > 0 ? Math.round((completedDutiesCount / dailyDuties.length) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {dailyDuties.length === 0 ? (
                <div className="py-6 text-center text-ink-muted text-xs">
                  Belum ada checklist tugas harian pos jaga.
                </div>
              ) : (
                dailyDuties.map((duty) => (
                  <div
                    key={duty.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      duty.isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                        : 'bg-canvas border-border/80 text-ink'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDutyCompleted(duty.id)}
                      className={`p-1 rounded-lg border transition-all ${
                        duty.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-surface border-border text-ink-muted hover:border-primary-400'
                      }`}
                    >
                      {duty.isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="space-y-0.5 flex-1">
                      <span className={`font-bold text-xs block ${duty.isCompleted ? 'line-through opacity-75' : ''}`}>{duty.title}</span>
                      <div className="flex items-center justify-between text-[10px] text-ink-muted">
                        <span>Jadwal: <strong>{duty.timeSchedule}</strong></span>
                        {duty.completedAt && <span className="text-emerald-700 font-bold">✓ {duty.completedAt}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Roster Shift Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-ink uppercase tracking-wider">
                Daftar Plotting Shift & Regu Tersimpan ({rosters.length})
              </h4>
              <span className="text-[11px] text-ink-muted">
                {rosterMode === 'SOLO_24H' ? 'Mode Aktif: 1 Satpam 24 Jam' : 'Mode Multi-Shift'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {rosters.length === 0 ? (
                <div className="col-span-full p-8 text-center text-ink-muted text-xs bg-surface rounded-2xl border border-border">
                  Belum ada jadwal shift jaga regu satpam. Klik <strong>"+ Atur Shift Baru"</strong> di atas untuk menambahkan.
                </div>
              ) : (
                rosters.map((r) => (
                  <div key={r.id} className="p-4 bg-surface rounded-2xl border border-border shadow-card space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">{r.shiftHours}</span>
                          {getDutyCategoryBadge(r.dutyCategory)}
                          {r.shiftType === 'SHIFT_24_JAM' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-200">
                              24 Jam
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-ink mt-0.5">{r.teamName}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.status === 'SEDANG_DINAS' ? 'bg-emerald-600 text-white' :
                          r.status === 'SIAGA_SIANG' ? 'bg-amber-500 text-white' :
                          'bg-purple-600 text-white'
                        }`}>
                          {r.status.replace(/_/g, ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditRoster(r)}
                          className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg"
                          title="Edit Shift & Plotting"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {rosters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRoster(r.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Hapus Shift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assigned Guards in this Shift */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                        Personel & Area Bertugas:
                      </span>
                      {r.assignedGuards.map((g, idx) => (
                        <div key={idx} className="p-2.5 bg-canvas rounded-xl border border-border/70 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-ink block">{idx + 1}. {g.guardName} ({g.role})</span>
                            <span className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>{g.assignedArea}</span>
                            </span>
                          </div>
                          {g.specialDuty && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-surface text-ink border border-border rounded-md shrink-0 text-right">
                              {g.specialDuty}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {r.nextHandoverGuardName && (
                      <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-[10px] text-amber-900 flex items-center justify-between">
                        <span>Serah terima esok pagi ({r.handoverTime || '07:00 WIB'}):</span>
                        <strong>{r.nextHandoverGuardName}</strong>
                      </div>
                    )}

                    {r.notes && (
                      <div className="p-2 bg-canvas/60 rounded-lg border border-border/60 text-[11px] text-ink-muted italic">
                        Catatan: {r.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: LOG PATROLI & QR CHECKPOINTS ================= */}
      {activeTab === 'patrol' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                Catatan Log Patroli Keliling & QR Checkpoint
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Monitoring keaktifan satpam memindai barcode QR di 6 titik checkpoint rawan komplek.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPatrolModal(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Laporan Patroli Baru</span>
            </button>
          </div>

          {/* 6 Checkpoint Cards Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { code: 'CP-01', name: 'Pos Gerbang Utama', count: 18, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { code: 'CP-02', name: 'Taman Blok A', count: 14, color: 'bg-blue-50 text-blue-800 border-blue-200' },
              { code: 'CP-03', name: 'Clubhouse Blok B', count: 12, color: 'bg-purple-50 text-purple-800 border-purple-200' },
              { code: 'CP-04', name: 'Gerbang Timur Blok C', count: 15, color: 'bg-amber-50 text-amber-800 border-amber-200' },
              { code: 'CP-05', name: 'Lapangan Blok D', count: 11, color: 'bg-teal-50 text-teal-800 border-teal-200' },
              { code: 'CP-06', name: 'Gardu PLN & PAM', count: 16, color: 'bg-rose-50 text-rose-800 border-rose-200' },
            ].map(cp => (
              <div key={cp.code} className={`p-3 rounded-2xl border ${cp.color} text-center space-y-1 shadow-xs`}>
                <span className="font-mono font-black text-xs block">{cp.code}</span>
                <p className="text-[11px] font-bold truncate">{cp.name}</p>
                <span className="text-[10px] font-semibold opacity-80 block">{cp.count}x Diperiksa</span>
              </div>
            ))}
          </div>

          {/* Patrol Table */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
              <h4 className="font-bold text-ink">Riwayat Laporan Pemeriksaan Patroli</h4>
              <span className="text-[11px] text-ink-muted">Terurut dari yang paling terkini</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3 px-4">Titik Checkpoint</th>
                    <th className="py-3 px-4">Petugas Patroli</th>
                    <th className="py-3 px-4">Waktu Pengecekan</th>
                    <th className="py-3 px-4">Kondisi Temuan</th>
                    <th className="py-3 px-4">Catatan Situasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {patrolLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-ink-muted">
                        <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                        Belum ada catatan patroli pos satpam yang terekam.
                      </td>
                    </tr>
                  ) : (
                    patrolLogs.map((p) => (
                    <tr key={p.id} className="hover:bg-canvas/50">
                      <td className="py-3.5 px-4 font-bold text-ink">
                        <span className="font-mono text-primary-700 font-black mr-1.5">{p.checkpointCode}</span>
                        {p.checkpointName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink">
                        {p.guardName}
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted">
                        {p.displayDate}, <span className="font-mono font-bold text-ink">{p.displayTime}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getConditionBadge(p.condition)}
                      </td>
                      <td className="py-3.5 px-4 text-ink font-medium">
                        {p.notes}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: POS GERBANG, BUKU TAMU & QR SCANNER ================= */}
      {activeTab === 'gate' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Barrier Gate Live Remote Control Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gate 1: Gerbang Masuk Utama */}
            <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
              gate1Open ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-surface border-border'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    gate1Open ? 'bg-emerald-600 text-white animate-pulse' : 'bg-canvas text-ink-muted border border-border'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink">Palang Gerbang 1 — Pintu Masuk Utama</h4>
                    <p className="text-[10px] text-ink-muted font-mono">Loop Sensor #1 • Relay Kontrol G1</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                  gate1Open
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {gate1Open ? `🟢 PALANG TERBUKA (${gate1Countdown ?? 5}s)` : '🔴 PALANG TERTUTUP'}
                </span>
              </div>

              <div className="mt-3.5 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span className="text-[10px] text-ink-muted">
                  {gate1Open ? `Relay aktif • Menutup otomatis dalam ${gate1Countdown ?? 5} detik` : 'Mode operasional: Otomatis RFID / Manual Satpam'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTriggerGate(1)}
                  disabled={gate1Open}
                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-[0.98] shrink-0 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {gate1Open ? `Membuka (${gate1Countdown ?? 5}s)...` : '⚡ Buka Palang Masuk'}
                </button>
              </div>
            </div>

            {/* Gate 2: Gerbang Keluar / Timur */}
            <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
              gate2Open ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-surface border-border'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    gate2Open ? 'bg-emerald-600 text-white animate-pulse' : 'bg-canvas text-ink-muted border border-border'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink">Palang Gerbang 2 — Pintu Keluar / Blok C</h4>
                    <p className="text-[10px] text-ink-muted font-mono">Loop Sensor #2 • Relay Kontrol G2</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                  gate2Open
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {gate2Open ? `🟢 PALANG TERBUKA (${gate2Countdown ?? 5}s)` : '🔴 PALANG TERTUTUP'}
                </span>
              </div>

              <div className="mt-3.5 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span className="text-[10px] text-ink-muted">
                  {gate2Open ? `Relay aktif • Menutup otomatis dalam ${gate2Countdown ?? 5} detik` : 'Mode operasional: Loop Sensor / Manual Satpam'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTriggerGate(2)}
                  disabled={gate2Open}
                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-[0.98] shrink-0 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {gate2Open ? `Membuka (${gate2Countdown ?? 5}s)...` : '⚡ Buka Palang Keluar'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick QR Scanner & Receipt Verification */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary-600" />
                  Verifikasi Cepat QR Pass & Kuitansi Warga
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  Ketik atau scan kode QR kuitansi / pass tamu untuk memverifikasi keabsahan akses gerbang.
                </p>
              </div>

              <form onSubmit={handleScanVerify} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: INV-202608-A17 atau VIS-PASS-88301"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    required
                    className="flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={scanLoading}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 transition-all active:scale-[0.98] shrink-0"
                  >
                    {scanLoading ? 'Memeriksa...' : 'Validasi QR'}
                  </button>
                </div>
              </form>

              {scanResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Hasil Verifikasi:</span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-[10px]">
                      {scanResult.status}
                    </span>
                  </div>
                  <p className="text-emerald-900 font-medium">{scanResult.message}</p>
                </div>
              )}
            </div>

            {/* Quick Plate Search */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-600" />
                  Cek Plat Nomor Kendaraan & Akses RFID
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  Cek apakah plat nomor mobil/motor terdaftar resmi dalam database kendaraan warga komplek.
                </p>
              </div>

              <form onSubmit={handlePlateSearch} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik Plat Nomor, contoh: D 1234 VRL"
                    value={searchingPlate}
                    onChange={(e) => setSearchingPlate(e.target.value)}
                    required
                    className="flex-1 p-2.5 bg-canvas border border-border rounded-xl font-mono uppercase text-ink text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] shrink-0"
                  >
                    Cek Plat
                  </button>
                </div>
              </form>

              {plateResult && (
                <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${plateResult.found ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm">{plateResult.plateNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${plateResult.found ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                      {plateResult.found ? plateResult.status : 'KENDARAAN LUAR'}
                    </span>
                  </div>
                  {plateResult.found ? (
                    <div className="space-y-2 text-[11px] pt-1">
                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200/50">
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold block">Pemilik / Penghuni:</span>
                          <strong className="text-emerald-950 font-bold">{plateResult.owner}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold block">Kavling / Unit:</span>
                          <strong className="text-emerald-950 font-bold">{plateResult.house}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold block">Kendaraan & Tipe:</span>
                          <strong className="text-emerald-950 font-bold">{plateResult.vehicle} ({plateResult.type})</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold block">Akses RFID:</span>
                          <strong className="font-mono text-emerald-900">{plateResult.rfidTag}</strong>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleTriggerGate(1)}
                          disabled={gate1Open}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {gate1Open ? `Palang 1 Terbuka (${gate1Countdown ?? 5}s)` : 'Buka Palang Masuk (G1)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerGate(2)}
                          disabled={gate2Open}
                          className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {gate2Open ? `Palang 2 Terbuka (${gate2Countdown ?? 5}s)` : 'Buka Palang Keluar (G2)'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-medium text-amber-900">{plateResult.message}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVisPlate(plateResult.plateNumber);
                          showToast(`Plat ${plateResult.plateNumber} disalin ke formulir Buku Tamu.`);
                          const el = document.getElementById('visitor-name-input');
                          if (el) el.focus();
                        }}
                        className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        + Salin ke Buku Tamu Digital
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visitor Logbook */}
          <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4 text-xs" id="visitor-form-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary-600" />
                  Buku Tamu Digital (Buku Catatan Masuk-Keluar)
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  Daftar tamu, kurir paket, dan kendaraan luar yang sedang berada di dalam komplek.
                </p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setVisitorFilterStatus('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all active:scale-[0.98] ${
                    visitorFilterStatus === 'ALL' ? 'bg-surface text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Semua ({visitors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVisitorFilterStatus('INSIDE')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all active:scale-[0.98] ${
                    visitorFilterStatus === 'INSIDE' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Di Dalam ({visitors.filter(v => v.status === 'INSIDE').length})
                </button>
                <button
                  type="button"
                  onClick={() => setVisitorFilterStatus('EXITED')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all active:scale-[0.98] ${
                    visitorFilterStatus === 'EXITED' ? 'bg-surface text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Keluar ({visitors.filter(v => v.status === 'EXITED').length})
                </button>
              </div>
            </div>

            {/* Quick Add Visitor Form */}
            <form onSubmit={handleAddVisitor} className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Tamu / Kurir *</label>
                <input
                  id="visitor-name-input"
                  type="text"
                  placeholder="Contoh: Bpk. Ahmad"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  required
                  className="w-full p-2 bg-surface border border-border rounded-xl text-ink focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Plat Kendaraan *</label>
                <input
                  type="text"
                  placeholder="B 1234 XYZ"
                  value={visPlate}
                  onChange={(e) => setVisPlate(e.target.value)}
                  required
                  className="w-full p-2 bg-surface border border-border rounded-xl font-mono uppercase text-ink focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Tujuan Kavling / Unit *</label>
                <input
                  list="registered-properties-list"
                  type="text"
                  placeholder="Pilih atau ketik Kavling..."
                  value={visHouse}
                  onChange={(e) => setVisHouse(e.target.value)}
                  required
                  className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-semibold focus:ring-1 focus:ring-primary-500 outline-none"
                />
                <datalist id="registered-properties-list">
                  {initialProperties.map((p: any) => (
                    <option key={p.id} value={p.code}>
                      {p.code} {p.ownerName ? `(${p.ownerName})` : ''}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="font-bold text-ink block mb-1">Keperluan / Kategori</label>
                <select
                  value={visPurpose}
                  onChange={(e) => setVisPurpose(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink focus:ring-1 focus:ring-primary-500 outline-none"
                >
                  <option value="Kunjungan Keluarga">Keluarga / Tamu Warga</option>
                  <option value="Pengantaran Paket Logistik">Kurir Paket (J&T, Shopee, dll)</option>
                  <option value="Pengantaran Makanan / Ojol">Ojek Online / Food Delivery</option>
                  <option value="Bongkar Muat Material Bangunan">Truk Bangunan & Renovasi</option>
                  <option value="Perbaikan Teknis / Servis">Teknisi / Servis Fasum</option>
                  <option value="Tamu Bisnis / Pertemuan">Tamu Bisnis / Lainnya</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
                >
                  + Catat Masuk Tamu
                </button>
              </div>
            </form>

            {/* Search Visitor Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama tamu, nomor polisi kendaraan, atau tujuan rumah..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Plat Kendaraan</th>
                    <th className="py-3 px-4">Tujuan Unit</th>
                    <th className="py-3 px-4">Keperluan</th>
                    <th className="py-3 px-4">Waktu Masuk</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-ink-muted text-xs">
                        Tidak ada catatan tamu yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map(v => (
                      <tr key={v.id} className="hover:bg-canvas/50">
                        <td className="py-3.5 px-4 font-bold text-ink">{v.visitorName}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-700">{v.vehiclePlate}</td>
                        <td className="py-3.5 px-4 font-bold text-ink">{v.destinationHouse}</td>
                        <td className="py-3.5 px-4 text-ink-muted">{v.purpose}</td>
                        <td className="py-3.5 px-4 text-ink font-medium">{v.entryTime}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${v.status === 'INSIDE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                            {v.status === 'INSIDE' ? 'Di Dalam Komplek' : 'Sudah Keluar'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {v.status === 'INSIDE' && (
                            <button
                              type="button"
                              onClick={() => handleMarkVisitorExited(v.id)}
                              className="px-2.5 py-1 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-lg text-[10px] transition-colors"
                            >
                              Tandai Keluar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: INVENTARIS PERALATAN POS ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-600" />
                Inventaris Peralatan Taktis & Kebersihan Pos Satpam
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Daftar peralatan keamanan, komunikasi HT, APAR, senter, dan perlengkapan sarana kebersihan komplek.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingEquipId(null);
                setEqName('');
                setEqCategory('KOMUNIKASI');
                setEqQty(1);
                setEqCondition('BAIK');
                setEqLocation('Pos Gerbang Utama');
                setEqNotes('');
                setShowEquipmentModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Peralatan</span>
            </button>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3 px-4">Nama Peralatan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Jumlah</th>
                    <th className="py-3 px-4">Lokasi Penyimpanan</th>
                    <th className="py-3 px-4 text-center">Kondisi Fisik</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {equipmentList.map(eq => (
                    <tr key={eq.id} className="hover:bg-canvas/50">
                      <td className="py-3.5 px-4 font-bold text-ink">
                        {eq.name}
                        {eq.notes && <span className="block text-[10px] text-ink-muted font-normal mt-0.5">{eq.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary-700">
                        {eq.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-ink">
                        {eq.quantity} Unit
                      </td>
                      <td className="py-3.5 px-4 font-medium text-ink">
                        {eq.location}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          eq.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-800' :
                          eq.condition === 'PERLU_SERVIS' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {eq.condition.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted">
                        {eq.personInCharge}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEquipId(eq.id);
                            setEqName(eq.name);
                            setEqCategory(eq.category);
                            setEqQty(eq.quantity);
                            setEqCondition(eq.condition);
                            setEqLocation(eq.location);
                            setEqNotes(eq.notes || '');
                            setShowEquipmentModal(true);
                          }}
                          className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 6: HOTLINE DARURAT & SOP KEAMANAN ================= */}
      {activeTab === 'emergency' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Emergency Siren Banner */}
          <div className={`p-5 rounded-2xl border transition-all ${
            sirenActive
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/30'
              : 'bg-surface border-border shadow-card'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                  sirenActive ? 'bg-rose-600 animate-bounce' : 'bg-rose-100 text-rose-700'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-ink flex items-center gap-2">
                    <span>Pusat Komando & Sirene Siaga Darurat Pos Satpam</span>
                    {sirenActive && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold animate-pulse">
                        SIAGA 1 AKTIF
                      </span>
                    )}
                  </h4>
                  <p className="text-ink-muted text-xs mt-0.5">
                    {sirenActive
                      ? '⚠️ Sirene siaga darurat aktif! Notifikasi otomatis disiarkan ke seluruh pengurus RT/RW.'
                      : 'Gunakan tombol ini saat terjadi tindak kejahatan, kebakaran, atau situasi darurat tingkat tinggi.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSiren}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 ${
                  sirenActive
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {sirenActive ? 'Matikan Sirene Siaga' : '🚨 AKTIFKAN SIAGA 1'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hotline Numbers */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  Hotline Panggilan Darurat (24 Jam)
                </h4>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Siaga 24 Jam
                </span>
              </div>
              <p className="text-ink-muted text-[11px]">
                Nomor cepat tanggap darurat yang dapat dihubungi satpam dan warga saat kondisi kritis.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { name: 'Polsek Terdekat / Sentra Pelayanan Kepolisian', phone: '(021) 887-2233 / 110', label: 'Keamanan POLRI' },
                  { name: 'Babinsa & Bhabinkamtibmas Komplek', phone: '0812-8899-7711 (Serka Budi)', label: 'Pembina Wilayah' },
                  { name: 'Dinas Pemadam Kebakaran & Penyelamatan (Damkar)', phone: '(021) 113 / 0811-2233-113', label: 'Damkar' },
                  { name: 'IGD Rumah Sakit & Layanan Ambulans 24 Jam', phone: '(021) 8899-0011 / 118', label: 'Medis & Ambulans' },
                  { name: 'Layanan Gangguan PLN (Listrik Padam / Korsleting)', phone: '123 / (021) 123', label: 'PLN Gardu' },
                  { name: 'Layanan Darurat PDAM (Pipa Pecah / Pompa)', phone: '(021) 8899-4455', label: 'Air Bersih' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-ink block">{item.name}</span>
                      <span className="text-[10px] text-ink-muted font-semibold">{item.label}</span>
                    </div>
                    <a
                      href={`tel:${item.phone.split('/')[0].trim()}`}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-mono font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{item.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Security SOPs */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h4 className="font-bold text-sm text-ink flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Standar Operasional Prosedur (SOP) Pos Satpam
                </h4>
                <span className="text-[10px] text-primary-700 font-bold bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full">
                  6 SOP Baku
                </span>
              </div>
              <p className="text-ink-muted text-[11px]">
                Pedoman baku tindakan petugas keamanan komplek dalam berbagai skenario.
              </p>

              <div className="space-y-2 pt-1 max-h-[400px] overflow-y-auto pr-1">
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">1. SOP Penerimaan Tamu & Kurir Luar:</span>
                  <p className="text-ink-muted text-[11px]">
                    Wajib menanyakan rumah tujuan, titip kartu identitas / KTP sementara jika bertamu lebih dari 1 jam, dan periksa bagasi mobil box material.
                  </p>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">2. SOP Penutupan Portal & Jam Malam 23:00 WIB:</span>
                  <p className="text-ink-muted text-[11px]">
                    Pintu gerbang timur ditutup pukul 22:00 WIB. Portal utama ditutup pukul 23:00 WIB. Setiap kendaraan malam wajib membuka kaca & lampu kabin.
                  </p>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">3. SOP Kebakaran & Tanggap Darurat APAR:</span>
                  <p className="text-ink-muted text-[11px]">
                    Segera bawa APAR 6kg terdekat, hubungi Damkar (113), dan bunyikan alarm darurat pos untuk evakuasi jalur warga.
                  </p>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">4. SOP Rumah Kosong / Warga Keluar Kota:</span>
                  <p className="text-ink-muted text-[11px]">
                    Lakukan pemeriksaan fisik pagar rumah kosong minimal 2x dalam satu shift patroli malam dan catat dalam buku patroli.
                  </p>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">5. SOP Evakuasi Hewan Liar & Ular:</span>
                  <p className="text-ink-muted text-[11px]">
                    Gunakan tongkat grabber reptil di pos utama, jangan menyentuh langsung, amankan area sekitar dari anak-anak, dan hubungi rescue Damkar jika perlu.
                  </p>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                  <span className="font-bold text-ink block">6. SOP Penertiban Parkir Sembarangan:</span>
                  <p className="text-ink-muted text-[11px]">
                    Pasang stiker peringatan sopan pada kaca wiper dan koordinasikan pemindahan kendaraan yang menghalangi hydrant atau gerbang darurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SECURITY GUARD ================= */}
      {showGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <span>{editingGuardId ? 'Edit Data Personel Satpam / Staf' : 'Tambah Personel Satpam / Staf Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGuardModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuard} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bambang Sudiro"
                    value={gFullName}
                    onChange={(e) => setGFullName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">NIP / ID Petugas *</label>
                  <input
                    type="text"
                    value={gNip}
                    onChange={(e) => setGNip(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Tugas Pokok *</label>
                  <select
                    value={gDutyCategory}
                    onChange={(e) => setGDutyCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KEAMANAN_MURNI">🛡️ Keamanan Murni</option>
                    <option value="KEAMANAN_KEBERSIHAN">🛡️🧹 Keamanan & Kebersihan</option>
                    <option value="KEBERSIHAN_TAMAN">🧹🌿 Kebersihan & Taman</option>
                    <option value="TEKNISI_FASUM">🔧 Teknisi & Fasum</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Regu Tim Jaga *</label>
                  <select
                    value={gTeam}
                    onChange={(e) => setGTeam(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {teamsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="LAINNYA">+ Tambah / Ketik Regu Baru...</option>
                  </select>
                  {gTeam === 'LAINNYA' && (
                    <input
                      type="text"
                      placeholder="Ketik nama regu baru (misal: Regu D - Harimau)..."
                      value={gCustomTeam}
                      onChange={(e) => setGCustomTeam(e.target.value)}
                      required
                      className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink mt-1.5 font-bold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Jabatan Penugasan *</label>
                <select
                  value={gRole}
                  onChange={(e) => setGRole(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="Komandan Regu (Danru)">Komandan Regu (Danru)</option>
                  <option value="Anggota Jaga Pos Utama & Gerbang">Anggota Jaga Pos Utama & Gerbang</option>
                  <option value="Petugas Patroli Keliling Lingkungan">Petugas Patroli Keliling Lingkungan</option>
                  <option value="Operator CCTV & Barrier Gate">Operator CCTV & Barrier Gate</option>
                  <option value="Satpam Merangkap Kebersihan & Sampah">Satpam Merangkap Kebersihan & Sampah (Dual-Role)</option>
                  <option value="Satpam & Pemeliharaan Taman / Fasum">Satpam & Pemeliharaan Taman / Fasum</option>
                  <option value="Petugas Keamanan & Teknisi Lingkungan (PJU / Pompa)">Petugas Keamanan & Teknisi Lingkungan</option>
                  <option value="Tim Serbaguna (Kebersihan & Taman Komplek)">Tim Serbaguna (Kebersihan & Taman Komplek)</option>
                  <option value="LAINNYA">Lainnya (Ketik Manual...)</option>
                </select>
                {gRole === 'LAINNYA' && (
                  <input
                    type="text"
                    placeholder="Ketik jabatan kustom..."
                    value={gCustomRole}
                    onChange={(e) => setGCustomRole(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink mt-1.5 font-bold"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">No. HP / WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7801"
                    value={gPhone}
                    onChange={(e) => setGPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Kontak Darurat (Keluarga)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0813-9988-1122 (Istri)"
                    value={gEmergency}
                    onChange={(e) => setGEmergency(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Area / Titik Plotting Bertugas *</label>
                <select
                  value={gAssignedPost}
                  onChange={(e) => setGAssignedPost(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="Pos Gerbang Utama (Main Gate)">Pos Gerbang Utama (Main Gate)</option>
                  <option value="Pos Gerbang Timur (Pintu Blok C)">Pos Gerbang Timur (Pintu Blok C)</option>
                  <option value="Patroli Blok A & Blok B">Patroli Blok A & Blok B</option>
                  <option value="Patroli Blok C & Blok D">Patroli Blok C & Blok D</option>
                  <option value="Area Taman Utama & Jogging Track">Area Taman Utama & Jogging Track</option>
                  <option value="Area TPS Sampah & Komposter Komplek">Area TPS Sampah & Komposter Komplek</option>
                  <option value="Ruang Monitor CCTV Pos Induk">Ruang Monitor CCTV Pos Induk</option>
                  <option value="Rumah Pompa PAM & Gardu PLN">Rumah Pompa PAM & Gardu PLN</option>
                  <option value="Seluruh Lingkungan Komplek (Mobile)">Seluruh Lingkungan Komplek (Mobile)</option>
                  <option value="LAINNYA">Lainnya (Ketik Manual...)</option>
                </select>
                {gAssignedPost === 'LAINNYA' && (
                  <input
                    type="text"
                    placeholder="Ketik area penugasan khusus..."
                    value={gCustomPost}
                    onChange={(e) => setGCustomPost(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink mt-1.5 font-bold"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Sertifikasi KTA Kepolisian</label>
                  <select
                    value={gCertification}
                    onChange={(e) => setGCertification(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="GADA_PRATAMA">Gada Pratama</option>
                    <option value="GADA_MADYA">Gada Madya</option>
                    <option value="GADA_UTAMA">Gada Utama</option>
                    <option value="NON_SERTIFIKASI">Non-Sertifikasi / Staf Kebersihan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Keaktifan</label>
                  <select
                    value={gStatus}
                    onChange={(e) => setGStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="AKTIF_BERTUGAS">Aktif Bertugas</option>
                    <option value="LEPAS_PIKET">Lepas Piket</option>
                    <option value="CUTI">Cuti Tahunan</option>
                    <option value="SAKIT">Izin Sakit</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Gaji Pokok Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={gSalary}
                    onChange={(e) => setGSalary(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tunjangan Jaga Malam (Rp)</label>
                  <input
                    type="number"
                    value={gNightAllowance}
                    onChange={(e) => setGNightAllowance(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Khusus / Keterampilan</label>
                <input
                  type="text"
                  placeholder="Contoh: Instruktur APAR, motor roda 3, penanganan listrik"
                  value={gNotes}
                  onChange={(e) => setGNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuardModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={guardSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
                >
                  {guardSaving ? 'Menyimpan...' : editingGuardId ? 'Perbarui Data Personel' : 'Simpan Personel Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ROSTER SHIFT ================= */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span>{editingRosterId ? 'Edit Jadwal Roster Shift' : 'Atur Jadwal Roster Shift Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Regu / Tim Jaga *</label>
                <input
                  type="text"
                  placeholder="Contoh: Regu A — Garuda"
                  value={rTeamName}
                  onChange={(e) => setRTeamName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Shift *</label>
                  <select
                    value={rShiftType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setRShiftType(val);
                      if (val === 'SHIFT_24_JAM') { setRShiftLabel('Shift 24 Jam (Pagi s/d Pagi)'); setRShiftHours('07:00 - 07:00 WIB (24 Jam Penuh)'); }
                      else if (val === 'SHIFT_PAGI') { setRShiftLabel('Shift Pagi'); setRShiftHours('07:00 - 15:00 WIB'); }
                      else if (val === 'SHIFT_SIANG') { setRShiftLabel('Shift Siang'); setRShiftHours('15:00 - 23:00 WIB'); }
                      else if (val === 'SHIFT_MALAM') { setRShiftLabel('Shift Malam'); setRShiftHours('23:00 - 07:00 WIB'); }
                      else if (val === 'SHIFT_FULL_DAY') { setRShiftLabel('Shift Harian Lingkungan'); setRShiftHours('08:00 - 17:00 WIB'); }
                      else { setRShiftLabel('Shift Khusus Weekend'); setRShiftHours('08:00 - 20:00 WIB'); }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SHIFT_24_JAM">⭐ Shift 24 Jam: Pagi s/d Pagi (07:00 - 07:00 WIB)</option>
                    <option value="SHIFT_PAGI">Shift Pagi (07:00 - 15:00)</option>
                    <option value="SHIFT_SIANG">Shift Siang (15:00 - 23:00)</option>
                    <option value="SHIFT_MALAM">Shift Malam (23:00 - 07:00)</option>
                    <option value="SHIFT_FULL_DAY">Shift Harian (08:00 - 17:00)</option>
                    <option value="SHIFT_WEEKEND">Shift Khusus Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Operasional Shift</label>
                  <input
                    type="text"
                    value={rShiftHours}
                    onChange={(e) => setRShiftHours(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Tugas Shift *</label>
                  <select
                    value={rDutyCategory}
                    onChange={(e) => setRDutyCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KEAMANAN_MURNI">🛡️ Keamanan Murni</option>
                    <option value="KEAMANAN_KEBERSIHAN">🛡️🧹 Keamanan & Kebersihan</option>
                    <option value="KEBERSIHAN_TAMAN">🧹🌿 Kebersihan & Taman</option>
                    <option value="TEKNISI_FASUM">🔧 Teknisi & Fasum</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Shift Saat Ini</label>
                  <select
                    value={rStatus}
                    onChange={(e) => setRStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SEDANG_DINAS">SEDANG DINAS</option>
                    <option value="SIAGA_SIANG">SIAGA SIANG</option>
                    <option value="LEPAS_PIKET">LEPAS PIKET</option>
                    <option value="LIBUR_OFF">LIBUR / OFF</option>
                  </select>
                </div>
              </div>

              {/* Guard Selection Checklist */}
              <div>
                <label className="font-bold text-ink block mb-1.5">
                  Pilih Personel Ditugaskan dalam Shift Ini ({rSelectedGuardIds.length} Petugas Terpilih):
                </label>
                <div className="max-h-40 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
                  {guards.map(g => {
                    const isChecked = rSelectedGuardIds.includes(g.id);
                    return (
                      <label key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border/70 hover:border-primary-300 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setRSelectedGuardIds(rSelectedGuardIds.filter(id => id !== g.id));
                              } else {
                                setRSelectedGuardIds([...rSelectedGuardIds, g.id]);
                              }
                            }}
                            className="rounded border-border text-primary-600"
                          />
                          <div>
                            <span className="font-bold text-ink block">{g.fullName}</span>
                            <span className="text-[10px] text-ink-muted">{g.role} — {g.assignedPost}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-primary-700 font-bold">{g.team}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan / Instruksi Khusus Shift</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Kunci portal malam pukul 23:00, kontrol kebersihan TPS Blok C"
                  value={rNotes}
                  onChange={(e) => setRNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs"
                >
                  Simpan Jadwal Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TUKAR SHIFT JAGA ================= */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <span>Tukar Shift & Ganti Petugas Jaga</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSwapShift} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">Petugas yang Berhalangan / Izin *</label>
                <select
                  value={swapGuardFrom}
                  onChange={(e) => setSwapGuardFrom(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {guards.map(g => (
                    <option key={g.id} value={g.id}>{g.fullName} ({g.team} - {g.shift})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Petugas Pengganti Jaga *</label>
                <select
                  value={swapGuardTo}
                  onChange={(e) => setSwapGuardTo(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {guards.map(g => (
                    <option key={g.id} value={g.id}>{g.fullName} ({g.team} - {g.shift})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Alasan Pertukaran Shift</label>
                <input
                  type="text"
                  placeholder="Contoh: Izin keperluan keluarga, sakit, dll"
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Aplikasikan Tukar Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ATUR ROTASI 1 SATPAM 24 JAM (PAGI S/D PAGI) ================= */}
      {showSolo24hModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink flex items-center gap-1.5">
                    <span>Atur Rotasi 1 Satpam 24 Jam</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                      Pagi s/d Pagi
                    </span>
                  </h3>
                  <p className="text-[11px] text-ink-muted">Sistem operasional tunggal komplek kecil (14 kavling)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSolo24hModal(false)}
                className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Ketentuan Operasional Piket Mandiri 24 Jam:
              </span>
              <p className="text-amber-900/90 leading-relaxed">
                Hanya <strong>1 orang satpam</strong> yang berjaga penuh dari pagi hari (07:00 WIB) sampai pagi berikutnya (07:00 WIB), mencakup penjagaan pos gerbang utama, verifikasi kurir paket & tamu, menyalakan lampu PJU komplek pukul 18:00, mengunci portal pukul 21:00, dan ronda berkala 14 kavling.
              </p>
            </div>

            <form onSubmit={handleApplySolo24hRoster} className="space-y-3.5">
              <div>
                <label className="font-bold text-ink block mb-1">
                  1. Satpam yang Bertugas Hari Ini (Piket Penuh 24 Jam) *
                </label>
                <select
                  value={soloGuardToday}
                  onChange={(e) => setSoloGuardToday(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {guards.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.fullName} ({g.nip}) — {g.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Masuk Piket Pagi</label>
                  <input
                    type="text"
                    value={soloHandoverTime}
                    onChange={(e) => setSoloHandoverTime(e.target.value)}
                    placeholder="07:00"
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink text-center font-bold"
                  />
                  <span className="text-[10px] text-ink-muted mt-0.5 block">Waktu mulai bertugas pagi</span>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Durasi Piket</label>
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-border rounded-xl font-mono text-ink text-center font-bold">
                    24 Jam Penuh
                  </div>
                  <span className="text-[10px] text-ink-muted mt-0.5 block">Hingga esok pagi {soloHandoverTime} WIB</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  2. Satpam Penerima Estafet Serah Terima Besok Pagi *
                </label>
                <select
                  value={soloGuardTomorrow}
                  onChange={(e) => setSoloGuardTomorrow(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {guards.map(g => (
                    <option key={g.id} value={g.id} disabled={g.id === soloGuardToday}>
                      {g.fullName} {g.id === soloGuardToday ? '(Sedang Dipilih Hari Ini)' : `(${g.nip})`}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-ink-muted mt-0.5 block">
                  Petugas berikutnya yang akan menerima buku mutasi dan kunci gerbang esok pukul {soloHandoverTime} WIB.
                </span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Instruksi Khusus & Catatan Operasional Komplek
                </label>
                <textarea
                  rows={3}
                  value={soloNotes}
                  onChange={(e) => setSoloNotes(e.target.value)}
                  placeholder="Catatan instruksi ronda atau fokus pemantauan lingkungan..."
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSolo24hModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Aktifkan Roster 24 Jam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL KTA DIGITAL SATPAM ================= */}
      {activeGuardView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <span>Kartu Tanda Anggota (KTA) Digital Satpam</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveGuardView(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Digital Badge Mockup */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl border border-primary-800/40 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xs tracking-wider block">WARGAHUB SECURITY</span>
                    <span className="text-[10px] text-primary-300 font-medium">SATUAN PENGAMANAN KOMPLEK</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px]">
                  {activeGuardView.status}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-20 h-24 rounded-2xl bg-primary-900/60 border border-primary-500/30 flex items-center justify-center text-primary-300 font-black text-2xl shadow-inner">
                  {activeGuardView.fullName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-base text-white">{activeGuardView.fullName}</h4>
                  <p className="text-primary-200 font-semibold text-xs">{activeGuardView.role}</p>
                  <p className="text-primary-300 font-mono text-[11px]">NIP: {activeGuardView.nip}</p>
                  <p className="text-slate-400 font-mono text-[10px]">KTA: {activeGuardView.regNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary-800/50 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Regu & Shift:</span>
                  <span className="font-bold text-white">{activeGuardView.team} ({activeGuardView.shift})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Titik Plotting Pos:</span>
                  <span className="font-bold text-white">{activeGuardView.assignedPost}</span>
                </div>
              </div>
            </div>

            {/* Guard Technical Specs */}
            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">No. WhatsApp / HP:</span>
                <a href={`https://wa.me/${activeGuardView.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-mono font-bold text-primary-700 hover:underline mt-0.5 inline-block">
                  {activeGuardView.phone}
                </a>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Kontak Darurat (Keluarga):</span>
                <span className="font-bold text-ink mt-0.5 block">{activeGuardView.emergencyContact}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Kategori Tugas:</span>
                <div className="mt-0.5">{getDutyCategoryBadge(activeGuardView.dutyCategory)}</div>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Gaji Pokok & Tunjangan:</span>
                <span className="font-mono font-bold text-emerald-800 mt-0.5 block">
                  Rp {(activeGuardView.salary + activeGuardView.nightAllowance).toLocaleString('id-ID')} / bln
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  const content = `KARTU TANDA ANGGOTA SATPAM - WARGAHUB\n======================================\nNIP: ${activeGuardView.nip}\nNama Lengkap: ${activeGuardView.fullName}\nJabatan: ${activeGuardView.role}\nKategori Tugas: ${activeGuardView.dutyCategory}\nRegu: ${activeGuardView.team}\nShift Jaga: ${activeGuardView.shift}\nTitik Plotting: ${activeGuardView.assignedPost}\n\nSertifikasi POLRI: ${activeGuardView.certification}\nNomor Registrasi KTA: ${activeGuardView.regNumber}\nNo Telepon: ${activeGuardView.phone}\nKontak Darurat: ${activeGuardView.emergencyContact}\nStatus: ${activeGuardView.status}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus Paguyuban Komplek`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `KTA_SATPAM_${activeGuardView.nip}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`KTA ${activeGuardView.fullName} berhasil diunduh.`);
                }}
                className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-primary-600" />
                <span>Cetak ID Card</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeGuardView;
                    setActiveGuardView(null);
                    handleOpenEditGuard(toEdit);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-xl text-xs"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuardView(null)}
                  className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HAPUS MASSAL GUARDS ================= */}
      {showBulkDeleteGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Hapus / Nonaktifkan {selectedGuardIds.length} Personel Satpam?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedGuardIds.length} data personel satpam</strong> yang telah diceklis akan dinonaktifkan dari sistem penjagaan. Tindakan ini akan dicatat dalam Jejak Audit Keamanan.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Personel Terpilih:
              </span>
              {guards.filter(g => selectedGuardIds.includes(g.id)).map(g => (
                <div key={g.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-bold text-ink">{g.fullName}</span>
                  <span className="text-ink-muted text-[11px] font-mono">{g.nip} ({g.team})</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeletingGuard}
                onClick={() => setShowBulkDeleteGuardModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeletingGuard}
                onClick={handleConfirmBulkDeleteGuard}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeletingGuard ? 'Memproses...' : `Ya, Hapus (${selectedGuardIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HAPUS SINGLE GUARD ================= */}
      {guardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Personel {guardToDelete.fullName}?</h3>
              <p className="text-xs text-ink-muted">
                Personel <strong>{guardToDelete.fullName}</strong> ({guardToDelete.role}, {guardToDelete.team}) akan dinonaktifkan dari jadwal tugas satpam.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGuardToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGuard}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs text-xs"
              >
                Ya, Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PATROL REPORT ================= */}
      {showAddPatrolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                <span>Catat Laporan Hasil Patroli Checkpoint</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPatrolModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatrol} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Titik Checkpoint QR *</label>
                <select
                  value={patCheckpoint}
                  onChange={(e) => setPatCheckpoint(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="CP-01">CP-01: Pos Gerbang Utama (Main Gate)</option>
                  <option value="CP-02">CP-02: Taman Utama & Jogging Track Blok A</option>
                  <option value="CP-03">CP-03: Clubhouse & Kolam Renang Blok B</option>
                  <option value="CP-04">CP-04: Gerbang Timur & Pintu Darurat Blok C</option>
                  <option value="CP-05">CP-05: Lapangan & Area Kompos Blok D</option>
                  <option value="CP-06">CP-06: Rumah Pompa PAM & Gardu Induk PLN</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Petugas Patroli *</label>
                <select
                  value={patGuard}
                  onChange={(e) => setPatGuard(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {guards.filter(g => g.status === 'AKTIF_BERTUGAS').map(g => (
                    <option key={g.id} value={g.fullName}>{g.fullName} ({g.team})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kondisi Temuan di Lokasi *</label>
                <select
                  value={patCondition}
                  onChange={(e) => setPatCondition(e.target.value as any)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="AMAN_KONDUSIF">Aman & Kondusif</option>
                  <option value="LAMPU_PJU_MATI">Lampu PJU Padam / Rusak</option>
                  <option value="PORTAL_TERBUKA">Portal Tidak Terkunci</option>
                  <option value="MENCURIGAKAN">Aktivitas Orang Mencurigakan</option>
                  <option value="HEWAN_LIAR">Hewan Liar Masuk Komplek</option>
                  <option value="LAINNYA">Lainnya / Catatan Khusus</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan Patroli</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Lampu PJU menyala normal, pagar keliling aman"
                  value={patNotes}
                  onChange={(e) => setPatNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatrolModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={patrolSaving}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {patrolSaving ? 'Merekam...' : 'Simpan Laporan Patroli'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT EQUIPMENT ================= */}
      {showEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-600" />
                <span>{editingEquipId ? 'Edit Inventaris Alat' : 'Tambah Peralatan Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEquipmentModal(false)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Peralatan *</label>
                <input
                  type="text"
                  placeholder="Contoh: HT Motorola GP328"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori *</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KOMUNIKASI">Komunikasi HT</option>
                    <option value="PENERANGAN">Senter & Penerangan</option>
                    <option value="PERTAHANAN">Tongkat T & Borgol</option>
                    <option value="PERLENGKAPAN_DIRI">Rompi & Jas Hujan</option>
                    <option value="TANGGAP_DARURAT">APAR & Medis</option>
                    <option value="KENDARAAN_PATROLI">Sepeda Listrik Patroli</option>
                    <option value="KEBERSIHAN_LINGKUNGAN">Kebersihan & Taman</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jumlah Unit *</label>
                  <input
                    type="number"
                    min={1}
                    value={eqQty}
                    onChange={(e) => setEqQty(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kondisi Fisik *</label>
                  <select
                    value={eqCondition}
                    onChange={(e) => setEqCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="BAIK">Baik / Siap Pakai</option>
                    <option value="PERLU_SERVIS">Perlu Servis / Cek Baterai</option>
                    <option value="RUSAK">Rusak</option>
                    <option value="HILANG">Hilang</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Lokasi Simpan</label>
                  <input
                    type="text"
                    value={eqLocation}
                    onChange={(e) => setEqLocation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Disimpan di lemari pos utama"
                  value={eqNotes}
                  onChange={(e) => setEqNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEquipmentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                >
                  Simpan Peralatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
