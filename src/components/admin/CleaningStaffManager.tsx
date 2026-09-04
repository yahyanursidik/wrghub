import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Truck,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Edit3,
  Calendar,
  Phone,
  Check,
  Wrench,
  Activity,
  Trees,
  MapPin,
  MessageCircle,
  RotateCcw,
  CheckSquare,
  Square,
  Package,
  Building,
  RefreshCw,
  X
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface CleaningStaff {
  id: string;
  name: string;
  role: 'PENGANGKUT_SAMPAH' | 'PENYAPU_JALAN' | 'PETUGAS_TAMAN' | 'PENGELOLA_TPS' | 'KOORDINATOR_KEBERSIHAN';
  phone: string;
  zoneAssignment: string;
  baseSalary: number;
  allowance: number;
  employmentStatus: 'TETAP' | 'KONTRAK' | 'HARIAN_LEPAS';
  status: 'ACTIVE' | 'LEAVE' | 'SICK' | 'INACTIVE';
  shift: 'PAGI' | 'SIANG' | 'FULL_DAY';
  joinDate: string;
  avatarUrl?: string;
  notes?: string;
}

export interface WasteRouteSchedule {
  id: string;
  routeName: string;
  days: string[];
  operationalHours: string;
  targetBlocks: string;
  assignedStaffNames: string[];
  vehicleUsed: string;
  statusToday: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
  completionTime?: string;
}

export interface DailyCleaningTask {
  id: string;
  taskName: string;
  category: 'SAMPAH_WARGA' | 'SAPU_JALAN' | 'GOT_DRAINASE' | 'FASUM_TAMAN' | 'TPS_PENGOLAHAN';
  location: string;
  assignedTo: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface CleaningEquipment {
  id: string;
  name: string;
  category: 'ARMADA_MOTOR' | 'GEROBAK' | 'MESIN_RUMPUT' | 'ALAT_MANUAL' | 'SAFETY_APD';
  unitCode: string;
  quantity: number;
  condition: 'BAIK' | 'PERLU_SERVIS' | 'RUSAK';
  lastServiceDate?: string;
  nextServiceDueDate?: string;
  picName: string;
  notes?: string;
}

export interface CleaningTicket {
  id: string;
  reporterHouse: string;
  reporterName: string;
  category: 'SAMPAH_TERLEWAT' | 'GOT_MAMPET' | 'RUMPUT_LIAR' | 'POHON_RANTING' | 'BANGKAI_HEWAN';
  description: string;
  reportedAt: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED';
  resolvedAt?: string;
}

interface CleaningStaffManagerProps {
  totalProperties?: number;
  properties?: any[];
}

// ================= DEFAULT REALISTIC DATASETS =================
const defaultStaff: CleaningStaff[] = [
  {
    id: 'CLN-001',
    name: 'Pak Slamet Riyadi',
    role: 'KOORDINATOR_KEBERSIHAN',
    phone: '0812-8877-6601',
    zoneAssignment: 'Sentra TPS3R & Supervisi Seluruh Blok',
    baseSalary: 4500000,
    allowance: 600000,
    employmentStatus: 'TETAP',
    status: 'ACTIVE',
    shift: 'FULL_DAY',
    joinDate: '2023-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Koordinator operasional sanitasi komplek & penanggung jawab fasilitas TPS3R.'
  },
  {
    id: 'CLN-002',
    name: 'Pak Rohmat Hidayat',
    role: 'PENGANGKUT_SAMPAH',
    phone: '0813-2244-8802',
    zoneAssignment: 'Rute Blok A, Blok B & Jl. Utama Boulevard',
    baseSalary: 3800000,
    allowance: 400000,
    employmentStatus: 'KONTRAK',
    status: 'ACTIVE',
    shift: 'PAGI',
    joinDate: '2023-04-10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Driver operasional motor roda tiga Tossa Viar D-4821-WGH.'
  },
  {
    id: 'CLN-003',
    name: 'Pak Diding Supriyadi',
    role: 'PENYAPU_JALAN',
    phone: '0815-6677-9903',
    zoneAssignment: 'Rute Blok C, Blok D & Drainase Utama',
    baseSalary: 3600000,
    allowance: 350000,
    employmentStatus: 'KONTRAK',
    status: 'ACTIVE',
    shift: 'PAGI',
    joinDate: '2023-08-01',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Penanggung jawab kebersihan trotoar, selokan got, dan gerobak sampah GBK-01.'
  },
  {
    id: 'CLN-004',
    name: 'Pak Cecep Permana',
    role: 'PETUGAS_TAMAN',
    phone: '0857-3322-1104',
    zoneAssignment: 'Taman Fasum Komunal & Jalur Hijau Gerbang',
    baseSalary: 3600000,
    allowance: 350000,
    employmentStatus: 'KONTRAK',
    status: 'ACTIVE',
    shift: 'PAGI',
    joinDate: '2024-02-15',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    notes: 'Operator mesin potong rumput Honda dan pemeliharaan vegetasi taman.'
  }
];

const defaultRoutes: WasteRouteSchedule[] = [
  {
    id: 'RTE-01',
    routeName: 'Pengangkutan Pagi: Blok A & B',
    days: ['Senin', 'Rabu', 'Jumat'],
    operationalHours: '06:30 - 09:30 WIB',
    targetBlocks: 'Blok A (Kav 01-14) & Blok B (Kav 01-12)',
    assignedStaffNames: ['Pak Rohmat Hidayat', 'Pak Slamet Riyadi'],
    vehicleUsed: 'Motor Tossa Viar D-4821-WGH',
    statusToday: 'COMPLETED',
    completionTime: '09:15 WIB'
  },
  {
    id: 'RTE-02',
    routeName: 'Pengangkutan Siang: Blok C & D',
    days: ['Selasa', 'Kamis', 'Sabtu'],
    operationalHours: '07:00 - 10:30 WIB',
    targetBlocks: 'Blok C (Kav 01-10) & Blok D (Kav 01-15)',
    assignedStaffNames: ['Pak Rohmat Hidayat', 'Pak Diding Supriyadi'],
    vehicleUsed: 'Motor Tossa Viar D-4821-WGH & Gerobak GBK-01',
    statusToday: 'IN_PROGRESS'
  },
  {
    id: 'RTE-03',
    routeName: 'Pemilahan Organik & Anorganik TPS3R',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    operationalHours: '10:30 - 13:00 WIB',
    targetBlocks: 'Hanggar Sentral Pengolahan Sampah Terpadu TPS3R',
    assignedStaffNames: ['Pak Slamet Riyadi', 'Pak Cecep Permana'],
    vehicleUsed: 'Mesin Cacah Kompos & Timbangan Duduk',
    statusToday: 'SCHEDULED'
  }
];

const defaultTasks: DailyCleaningTask[] = [
  {
    id: 'TSK-01',
    taskName: 'Pengangkutan Sampah Rumah Tangga Blok A & B',
    category: 'SAMPAH_WARGA',
    location: 'Blok A & Blok B',
    assignedTo: 'Pak Rohmat Hidayat',
    isCompleted: true,
    completedAt: '09:15 WIB',
    notes: 'Semua tempat sampah depan rumah terangkut tuntas ke TPS3R.'
  },
  {
    id: 'TSK-02',
    taskName: 'Penyapuan Daun Kering Boulevard & Area Gerbang',
    category: 'SAPU_JALAN',
    location: 'Jl. Utama Boulevard & Security Gate',
    assignedTo: 'Pak Diding Supriyadi',
    isCompleted: true,
    completedAt: '08:45 WIB',
    notes: 'Kondisi jalur protokol bersih rapi sebelum jam kantor warga.'
  },
  {
    id: 'TSK-03',
    taskName: 'Pengerukan Endapan Sedimen Got Drainase Blok C',
    category: 'GOT_DRAINASE',
    location: 'Saluran Drainase Terbuka Blok C',
    assignedTo: 'Pak Diding Supriyadi',
    isCompleted: false,
    notes: 'Antisipasi genangan air saat hujan deras.'
  },
  {
    id: 'TSK-04',
    taskName: 'Pemangkasan Rumput & Siram Tanaman Fasum',
    category: 'FASUM_TAMAN',
    location: 'Taman Bermain Anak & Gazebo Warga',
    assignedTo: 'Pak Cecep Permana',
    isCompleted: false,
    notes: 'Pemangkasan rumput gajah mini dan pemupukan tanaman hias.'
  },
  {
    id: 'TSK-05',
    taskName: 'Pengecekan Kebersihan Hanggar & Pencacahan Kompos TPS3R',
    category: 'TPS_PENGOLAHAN',
    location: 'Sentra TPS3R Belakang Komplek',
    assignedTo: 'Pak Slamet Riyadi',
    isCompleted: false,
    notes: 'Pengolahan sampah daun menjadi pupuk kompos warga.'
  }
];

const defaultEquipment: CleaningEquipment[] = [
  {
    id: 'EQ-01',
    name: 'Motor Roda Tiga Bak Sampah Viar 200cc',
    category: 'ARMADA_MOTOR',
    unitCode: 'D-4821-WGH (ARM-01)',
    quantity: 1,
    condition: 'BAIK',
    lastServiceDate: '2026-08-20',
    nextServiceDueDate: '2026-09-20',
    picName: 'Pak Rohmat Hidayat',
    notes: 'Kondisi mesin prima, ganti oli rutin bulanan, hidrolik bak berfungsi baik.'
  },
  {
    id: 'EQ-02',
    name: 'Gerobak Dorong Sampah Plat Besi',
    category: 'GEROBAK',
    unitCode: 'GBK-01 & GBK-02',
    quantity: 2,
    condition: 'BAIK',
    lastServiceDate: '2026-08-10',
    nextServiceDueDate: '2026-10-10',
    picName: 'Pak Diding Supriyadi',
    notes: 'Roda karet bearing baru diganti, cat pelapis anti-karat terpasang.'
  },
  {
    id: 'EQ-03',
    name: 'Mesin Pemotong Rumput Gendong Honda GX35',
    category: 'MESIN_RUMPUT',
    unitCode: 'MSN-01',
    quantity: 1,
    condition: 'BAIK',
    lastServiceDate: '2026-08-25',
    nextServiceDueDate: '2026-09-25',
    picName: 'Pak Cecep Permana',
    notes: 'Pisau potong baja tajam dan senar cadangan tersedia 2 gulung.'
  },
  {
    id: 'EQ-04',
    name: 'Set Alat Pengeruk Selokan (Cangkul Got, Garpu, Sekop)',
    category: 'ALAT_MANUAL',
    unitCode: 'SET-DRN-01',
    quantity: 4,
    condition: 'BAIK',
    lastServiceDate: '2026-07-15',
    nextServiceDueDate: '2026-10-15',
    picName: 'Pak Diding Supriyadi',
    notes: 'Peralatan manual pengerukan sedimentasi got dan parit komplek.'
  },
  {
    id: 'EQ-05',
    name: 'Paket APD Petugas (Sepatu Boots Karet, Sarung Tangan, Rompi Scotlight)',
    category: 'SAFETY_APD',
    unitCode: 'APD-SET-04',
    quantity: 4,
    condition: 'BAIK',
    lastServiceDate: '2026-08-01',
    nextServiceDueDate: '2026-11-01',
    picName: 'Pak Slamet Riyadi',
    notes: 'Standar keselamatan kerja wajib bagi seluruh tim saat bertugas.'
  }
];

const defaultTickets: CleaningTicket[] = [
  {
    id: 'TCK-101',
    reporterHouse: 'Blok A / Kav 04',
    reporterName: 'Ibu Ratna Dewi',
    category: 'SAMPAH_TERLEWAT',
    description: 'Tempat sampah di depan pagar terlewat saat pengangkutan pagi tadi karena tertutup dahan.',
    reportedAt: '08:30 WIB',
    assignedStaffId: 'CLN-002',
    assignedStaffName: 'Pak Rohmat Hidayat',
    status: 'ASSIGNED'
  },
  {
    id: 'TCK-102',
    reporterHouse: 'Blok D / Kav 11',
    reporterName: 'Bapak Hendra Gunawan',
    category: 'POHON_RANTING',
    description: 'Dahan pohon di tepi jalan menjorok rendah dan menghalangi penerangan lampu jalan.',
    reportedAt: 'Kemarin, 16:45 WIB',
    assignedStaffId: 'CLN-004',
    assignedStaffName: 'Pak Cecep Permana',
    status: 'RESOLVED',
    resolvedAt: '08:00 WIB'
  }
];

export const CleaningStaffManager: React.FC<CleaningStaffManagerProps> = ({
  totalProperties = 0,
  properties = []
}) => {
  // Helper storage persistence
  const getPersisted = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      if (val === null) return fallback;
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
        return fallback;
      }
      return parsed;
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

  // Live WIB Clock
  const [currentWibTime, setCurrentWibTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentWibTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta'
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Cleaning Staff Roster State
  const [staffList, setStaffList] = useState<CleaningStaff[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_cleaning_staff');
        const deletedStr = localStorage.getItem('wargahub_deleted_cleaning_staff');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((s: any) => !deletedIds.includes(s.id));
          }
        }
        return defaultStaff.filter(s => !deletedIds.includes(s.id));
      } catch (e) {
        console.warn(e);
      }
    }
    return defaultStaff;
  });

  // 2. Routes Schedules State
  const [routes, setRoutes] = useState<WasteRouteSchedule[]>(() =>
    getPersisted('wargahub_cleaning_routes', defaultRoutes)
  );

  // 3. Daily Checklist State
  const [dailyTasks, setDailyTasks] = useState<DailyCleaningTask[]>(() =>
    getPersisted('wargahub_cleaning_tasks', defaultTasks)
  );

  // 4. Equipment & Vehicles State
  const [equipmentList, setEquipmentList] = useState<CleaningEquipment[]>(() =>
    getPersisted('wargahub_cleaning_equipment', defaultEquipment)
  );

  // 5. Citizen Cleaning Tickets State
  const [tickets, setTickets] = useState<CleaningTicket[]>(() =>
    getPersisted('wargahub_cleaning_tickets', defaultTickets)
  );

  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<'staff_roster' | 'routes_schedule' | 'daily_checklist' | 'equipment_inventory' | 'citizen_tickets'>('staff_roster');

  // Filters & State for Staff Roster
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'joinDate' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filters for Checklist & Equipment
  const [checklistCategoryFilter, setChecklistCategoryFilter] = useState<string>('ALL');
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<string>('ALL');
  const [equipmentConditionFilter, setEquipmentConditionFilter] = useState<string>('ALL');

  // Multi-Selection State for Bulk Actions
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modals State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<CleaningStaff | null>(null);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit Staff
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<CleaningStaff['role']>('PENGANGKUT_SAMPAH');
  const [formPhone, setFormPhone] = useState('');
  const [formZone, setFormZone] = useState('Rute Blok A & B');
  const [formSalary, setFormSalary] = useState(3800000);
  const [formAllowance, setFormAllowance] = useState(350000);
  const [formStatus, setFormStatus] = useState<CleaningStaff['status']>('ACTIVE');
  const [formEmpStatus, setFormEmpStatus] = useState<CleaningStaff['employmentStatus']>('KONTRAK');
  const [formShift, setFormShift] = useState<CleaningStaff['shift']>('PAGI');
  const [formNotes, setFormNotes] = useState('');

  // Form State for Route Modal
  const [routeName, setRouteName] = useState('');
  const [routeDays, setRouteDays] = useState<string[]>(['Senin', 'Rabu', 'Jumat']);
  const [routeHours, setRouteHours] = useState('06:30 - 09:30 WIB');
  const [routeBlocks, setRouteBlocks] = useState('');
  const [routeStaff, setRouteStaff] = useState<string>('Pak Rohmat Hidayat');
  const [routeVehicle, setRouteVehicle] = useState('Motor Tossa Viar D-4821-WGH');

  // Form State for Task Modal
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState<DailyCleaningTask['category']>('SAMPAH_WARGA');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('Pak Slamet Riyadi');
  const [taskNotes, setTaskNotes] = useState('');

  // Form State for Equipment Modal
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState<CleaningEquipment['category']>('ALAT_MANUAL');
  const [eqUnitCode, setEqUnitCode] = useState('');
  const [eqQuantity, setEqQuantity] = useState(1);
  const [eqCondition, setEqCondition] = useState<CleaningEquipment['condition']>('BAIK');
  const [eqPicName, setEqPicName] = useState('Pak Slamet Riyadi');
  const [eqNotes, setEqNotes] = useState('');

  // Form State for Ticket Modal
  const [ticketHouse, setTicketHouse] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [ticketCategory, setTicketCategory] = useState<CleaningTicket['category']>('SAMPAH_TERLEWAT');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketStaff, setTicketStaff] = useState('Pak Rohmat Hidayat');

  // Calculations & KPIs
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter(s => s.status === 'ACTIVE').length;
  const completedTasksCount = dailyTasks.filter(t => t.isCompleted).length;
  const taskProgressPercent = dailyTasks.length > 0 ? Math.round((completedTasksCount / dailyTasks.length) * 100) : 0;
  const totalVehicles = equipmentList.reduce((acc, eq) => acc + (eq.category === 'ARMADA_MOTOR' || eq.category === 'GEROBAK' || eq.category === 'MESIN_RUMPUT' ? eq.quantity : 0), 0);
  const openTicketsCount = tickets.filter(t => t.status !== 'RESOLVED').length;

  // Filtered & Sorted Staff
  const filteredStaff = useMemo(() => {
    let list = staffList.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.zoneAssignment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm);

      const matchRole = roleFilter === 'ALL' || s.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'salary') comp = a.baseSalary - b.baseSalary;
      else if (sortBy === 'joinDate') comp = a.joinDate.localeCompare(b.joinDate);
      else if (sortBy === 'status') comp = a.status.localeCompare(b.status);

      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [staffList, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Filtered Daily Tasks
  const filteredDailyTasks = useMemo(() => {
    if (checklistCategoryFilter === 'ALL') return dailyTasks;
    return dailyTasks.filter(t => t.category === checklistCategoryFilter);
  }, [dailyTasks, checklistCategoryFilter]);

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchCat = equipmentCategoryFilter === 'ALL' || eq.category === equipmentCategoryFilter;
      const matchCond = equipmentConditionFilter === 'ALL' || eq.condition === equipmentConditionFilter;
      return matchCat && matchCond;
    });
  }, [equipmentList, equipmentCategoryFilter, equipmentConditionFilter]);

  // Handlers for Staff
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setFormName('');
    setFormRole('PENGANGKUT_SAMPAH');
    setFormPhone('0812-');
    setFormZone('Rute Blok A & Blok B');
    setFormSalary(3800000);
    setFormAllowance(350000);
    setFormStatus('ACTIVE');
    setFormEmpStatus('KONTRAK');
    setFormShift('PAGI');
    setFormNotes('Petugas pengangkutan sampah berkala');
    setShowAddStaffModal(true);
  };

  const handleOpenEditStaff = (staff: CleaningStaff) => {
    setEditingStaffId(staff.id);
    setFormName(staff.name);
    setFormRole(staff.role);
    setFormPhone(staff.phone);
    setFormZone(staff.zoneAssignment);
    setFormSalary(staff.baseSalary);
    setFormAllowance(staff.allowance);
    setFormStatus(staff.status);
    setFormEmpStatus(staff.employmentStatus);
    setFormShift(staff.shift);
    setFormNotes(staff.notes || '');
    setShowAddStaffModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingStaffId) {
        await fetch('/api/cleaning/staff/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStaffId,
            name: formName,
            role: formRole,
            phone: formPhone,
            zoneAssignment: formZone,
            salary: Number(formSalary),
            employmentStatus: formEmpStatus,
            status: formStatus,
            notes: formNotes,
          })
        }).catch(() => {});

        const updated = staffList.map(s => {
          if (s.id === editingStaffId) {
            return {
              ...s,
              name: formName,
              role: formRole,
              phone: formPhone,
              zoneAssignment: formZone,
              baseSalary: Number(formSalary),
              allowance: Number(formAllowance),
              employmentStatus: formEmpStatus,
              status: formStatus,
              shift: formShift,
              notes: formNotes,
            };
          }
          return s;
        });

        setStaffList(updated);
        savePersisted('wargahub_cleaning_staff', updated);
        showToast(`Profil staf ${formName} berhasil diperbarui.`);
        setShowAddStaffModal(false);
      } else {
        await fetch('/api/cleaning/staff/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            phone: formPhone,
            zoneAssignment: formZone,
            salary: Number(formSalary),
            employmentStatus: formEmpStatus,
            notes: formNotes,
          })
        }).catch(() => {});

        const newId = `CLN-${Date.now().toString().slice(-4)}`;
        const newStaff: CleaningStaff = {
          id: newId,
          name: formName,
          role: formRole,
          phone: formPhone,
          zoneAssignment: formZone,
          baseSalary: Number(formSalary),
          allowance: Number(formAllowance),
          employmentStatus: formEmpStatus,
          status: formStatus,
          shift: formShift,
          joinDate: new Date().toISOString().slice(0, 10),
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          notes: formNotes,
        };

        const updated = [newStaff, ...staffList];
        setStaffList(updated);
        savePersisted('wargahub_cleaning_staff', updated);
        showToast(`Petugas kebersihan ${formName} berhasil didaftarkan.`);
        setShowAddStaffModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses data staf.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      await fetch('/api/cleaning/staff/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: staffToDelete.id, name: staffToDelete.name })
      }).catch(() => {});

      const updated = staffList.filter(s => s.id !== staffToDelete.id);
      setStaffList(updated);
      savePersisted('wargahub_cleaning_staff', updated);
      addDeletedIds('wargahub_deleted_cleaning_staff', [staffToDelete.id]);
      showToast(`Data staf ${staffToDelete.name} berhasil dihapus.`);
      setStaffToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data staf.');
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedStaffIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await fetch('/api/cleaning/staff/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStaffIds })
      }).catch(() => {});

      const updated = staffList.filter(s => !selectedStaffIds.includes(s.id));
      setStaffList(updated);
      savePersisted('wargahub_cleaning_staff', updated);
      addDeletedIds('wargahub_deleted_cleaning_staff', selectedStaffIds);
      showToast(`${selectedStaffIds.length} staf kebersihan berhasil dihapus secara massal.`);
      setSelectedStaffIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus staf massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Toggle Route Status (SCHEDULED -> IN_PROGRESS -> COMPLETED)
  const handleToggleRouteStatus = (routeId: string) => {
    const updated = routes.map(r => {
      if (r.id === routeId) {
        let nextStatus: WasteRouteSchedule['statusToday'] = 'SCHEDULED';
        let completionTime = r.completionTime;

        if (r.statusToday === 'SCHEDULED') {
          nextStatus = 'IN_PROGRESS';
          completionTime = undefined;
        } else if (r.statusToday === 'IN_PROGRESS') {
          nextStatus = 'COMPLETED';
          completionTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } else {
          nextStatus = 'SCHEDULED';
          completionTime = undefined;
        }

        return {
          ...r,
          statusToday: nextStatus,
          completionTime
        };
      }
      return r;
    });

    setRoutes(updated);
    savePersisted('wargahub_cleaning_routes', updated);
    showToast('Status operasional rute sampah diperbarui.');
  };

  // Add Route
  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/cleaning/routes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeName,
          days: routeDays,
          operationalHours: routeHours,
          targetBlocks: routeBlocks,
          assignedStaffNames: [routeStaff],
          vehicleUsed: routeVehicle
        })
      }).catch(() => {});

      const newRoute: WasteRouteSchedule = {
        id: `RTE-${(routes.length + 1).toString().padStart(2, '0')}`,
        routeName,
        days: routeDays,
        operationalHours: routeHours,
        targetBlocks: routeBlocks,
        assignedStaffNames: [routeStaff],
        vehicleUsed: routeVehicle,
        statusToday: 'SCHEDULED'
      };

      const updated = [...routes, newRoute];
      setRoutes(updated);
      savePersisted('wargahub_cleaning_routes', updated);
      showToast(`Rute pengangkutan "${routeName}" berhasil ditambahkan.`);
      setShowAddRouteModal(false);
      setRouteName('');
      setRouteBlocks('');
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan rute sampah.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Daily Task
  const handleToggleTask = (taskId: string) => {
    const updated = dailyTasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : undefined
        };
      }
      return t;
    });
    setDailyTasks(updated);
    savePersisted('wargahub_cleaning_tasks', updated);
    showToast('Status checklist kebersihan harian diperbarui.');
  };

  // Add Daily Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/cleaning/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName,
          category: taskCategory,
          location: taskLocation,
          assignedTo: taskAssignedTo,
          notes: taskNotes
        })
      }).catch(() => {});

      const newTask: DailyCleaningTask = {
        id: `TSK-${(dailyTasks.length + 1).toString().padStart(2, '0')}`,
        taskName,
        category: taskCategory,
        location: taskLocation,
        assignedTo: taskAssignedTo,
        isCompleted: false,
        notes: taskNotes
      };

      const updated = [newTask, ...dailyTasks];
      setDailyTasks(updated);
      savePersisted('wargahub_cleaning_tasks', updated);
      showToast(`Tugas checklist "${taskName}" berhasil ditambahkan.`);
      setShowAddTaskModal(false);
      setTaskName('');
      setTaskLocation('');
      setTaskNotes('');
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan tugas checklist.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Equipment
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/cleaning/equipment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eqName,
          category: eqCategory,
          unitCode: eqUnitCode,
          quantity: Number(eqQuantity),
          condition: eqCondition,
          picName: eqPicName,
          notes: eqNotes
        })
      }).catch(() => {});

      const newEq: CleaningEquipment = {
        id: `EQ-${(equipmentList.length + 1).toString().padStart(2, '0')}`,
        name: eqName,
        category: eqCategory,
        unitCode: eqUnitCode,
        quantity: Number(eqQuantity),
        condition: eqCondition,
        picName: eqPicName,
        notes: eqNotes,
        lastServiceDate: new Date().toISOString().slice(0, 10),
        nextServiceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      };

      const updated = [newEq, ...equipmentList];
      setEquipmentList(updated);
      savePersisted('wargahub_cleaning_equipment', updated);
      showToast(`Armada / alat "${eqName}" berhasil dicatat.`);
      setShowAddEquipmentModal(false);
      setEqName('');
      setEqUnitCode('');
      setEqNotes('');
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan peralatan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Ticket
  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/cleaning/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterHouse: ticketHouse,
          reporterName: ticketName,
          category: ticketCategory,
          description: ticketDesc,
          assignedStaffName: ticketStaff
        })
      }).catch(() => {});

      const newTicket: CleaningTicket = {
        id: `TCK-${Date.now().toString().slice(-4)}`,
        reporterHouse: ticketHouse,
        reporterName: ticketName,
        category: ticketCategory,
        description: ticketDesc,
        reportedAt: 'Baru saja',
        assignedStaffName: ticketStaff,
        status: ticketStaff ? 'ASSIGNED' : 'OPEN'
      };

      const updated = [newTicket, ...tickets];
      setTickets(updated);
      savePersisted('wargahub_cleaning_tickets', updated);
      showToast(`Aduan kebersihan dari ${ticketName} (${ticketHouse}) berhasil dibuat.`);
      setShowAddTicketModal(false);
      setTicketHouse('');
      setTicketName('');
      setTicketDesc('');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat tiket aduan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = (ticketId: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'RESOLVED' as const,
          resolvedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
      }
      return t;
    });
    setTickets(updated);
    savePersisted('wargahub_cleaning_tickets', updated);
    showToast('Aduan kebersihan warga berhasil diselesaikan.');
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (confirm('Kembalikan data staf, rute, checklist, peralatan, dan tiket ke sampel bawaan komplek?')) {
      setStaffList(defaultStaff);
      setRoutes(defaultRoutes);
      setDailyTasks(defaultTasks);
      setEquipmentList(defaultEquipment);
      setTickets(defaultTickets);
      savePersisted('wargahub_cleaning_staff', defaultStaff);
      savePersisted('wargahub_cleaning_routes', defaultRoutes);
      savePersisted('wargahub_cleaning_tasks', defaultTasks);
      savePersisted('wargahub_cleaning_equipment', defaultEquipment);
      savePersisted('wargahub_cleaning_tickets', defaultTickets);
      localStorage.removeItem('wargahub_deleted_cleaning_staff');
      showToast('Data kebersihan komplek berhasil dipulihkan ke default.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID Staf', 'Nama Lengkap', 'Jabatan / Peran', 'No. HP / WA', 'Zona Penugasan', 'Gaji Pokok', 'Tunjangan', 'Status Kepegawaian', 'Status Aktif', 'Tanggal Bergabung'];
    const rows = staffList.map(s => [
      s.id,
      `"${s.name}"`,
      s.role,
      `"${s.phone}"`,
      `"${s.zoneAssignment}"`,
      s.baseSalary,
      s.allowance,
      s.employmentStatus,
      s.status,
      s.joinDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DAFTAR_STAF_KEBERSIHAN_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data staf kebersihan berhasil diekspor ke CSV.');
  };

  const getRoleBadge = (role: CleaningStaff['role']) => {
    switch (role) {
      case 'KOORDINATOR_KEBERSIHAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-200">👑 Koordinator Kebersihan</span>;
      case 'PENGANGKUT_SAMPAH':
        return <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-[10px] border border-teal-200">🚛 Pengangkut Sampah (Tossa)</span>;
      case 'PENYAPU_JALAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-200">🧹 Penyapu Jalan & Got</span>;
      case 'PETUGAS_TAMAN':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200">🌿 Petugas Taman & Rumput</span>;
      case 'PENGELOLA_TPS':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">♻️ Pengelola TPS3R</span>;
    }
  };

  const getStatusBadge = (status: CleaningStaff['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">✓ AKTIF BERTUGAS</span>;
      case 'LEAVE':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">SEDANG CUTI</span>;
      case 'SICK':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">SAKIT / IZIN</span>;
      case 'INACTIVE':
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">NONAKTIF</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Properties Datalist for Autocomplete */}
      <datalist id="property-houses-list">
        {properties.map((p: any) => (
          <option key={p.id} value={`${p.block || ''} / Kav ${p.unit_number || ''}`.trim()}>
            {p.owner_name ? `Pemilik: ${p.owner_name}` : ''}
          </option>
        ))}
        <option value="Blok A / Kav 01" />
        <option value="Blok A / Kav 04" />
        <option value="Blok B / Kav 05" />
        <option value="Blok C / Kav 08" />
        <option value="Blok D / Kav 11" />
      </datalist>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tactical Sanitation Telemetry Cockpit Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-3xl border border-teal-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-300 font-extrabold">
                  Sanitation Dispatch Telemetry • Terkoneksi Real-time
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Pusat Kendali Sanitasi, Armada Sampah & TPS3R Komplek
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap border-t border-white/10 pt-3 md:pt-0 md:border-t-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-center">
              <span className="text-[10px] text-slate-400 block font-sans">WAKTU OPERASIONAL</span>
              <span className="text-sm font-black text-emerald-300 tracking-wider">
                {currentWibTime || '07:30:00 WIB'}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-center">
              <span className="text-[10px] text-slate-400 block font-sans">PROGRES CHECKLIST</span>
              <span className="text-sm font-black text-teal-300">
                {taskProgressPercent}% Selesai
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetDemoData}
              title="Muat ulang dataset sampel jika data kosong"
              className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Sampel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-600" />
              Pengelolaan Tim Kebersihan & Sampah Komplek
            </h1>
            <span className="px-2.5 py-0.5 bg-teal-100 text-teal-900 font-black text-xs rounded-full border border-teal-300">
              {activeStaffCount} Petugas Siaga
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manajemen operasional armada pengangkut sampah door-to-door, jadwal penyapuan jalan, pembersihan drainase selokan got, dan perawatan taman fasum komplek.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Ekspor Staf (CSV)</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddStaff}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Petugas Kebersihan</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs hover:border-teal-300 transition-colors">
          <span className="text-[11px] text-ink-muted font-bold block">Total Staf Kebersihan</span>
          <p className="text-2xl font-black text-teal-700 mt-1 tabular-nums">
            {totalStaffCount} <span className="text-xs font-normal text-ink-muted">Petugas</span>
          </p>
          <span className="text-[10px] text-teal-600 font-bold">{activeStaffCount} Aktif Bertugas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs hover:border-emerald-300 transition-colors">
          <span className="text-[11px] text-ink-muted font-bold block">Target Rumah Terlayani</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {totalProperties || 14} <span className="text-xs font-normal text-ink-muted">Kavling</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Terjangkau Rute</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs hover:border-teal-300 transition-colors">
          <span className="text-[11px] text-ink-muted font-bold block">Checklist Harian Selesai</span>
          <p className="text-2xl font-black text-teal-800 mt-1 tabular-nums">
            {taskProgressPercent}% <span className="text-xs font-normal text-ink-muted">({completedTasksCount}/{dailyTasks.length})</span>
          </p>
          <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden mt-1.5 border border-border/50">
            <div className="bg-teal-600 h-full rounded-full transition-all duration-300" style={{ width: `${taskProgressPercent}%` }} />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs hover:border-amber-300 transition-colors">
          <span className="text-[11px] text-ink-muted font-bold block">Armada & Alat Operasional</span>
          <p className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {totalVehicles} <span className="text-xs font-normal text-ink-muted">Unit</span>
          </p>
          <span className="text-[10px] text-amber-600 font-bold">1 Motor Tossa, 2 Gerobak, 2 Mesin</span>
        </div>
      </div>

      {/* 5 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'staff_roster', label: 'Daftar Staf & Tim Kebersihan', icon: Users, count: totalStaffCount },
          { id: 'routes_schedule', label: 'Jadwal & Rute Sampah', icon: Truck, count: routes.length },
          { id: 'daily_checklist', label: 'Checklist & Log Kerja Harian', icon: CheckSquare, count: `${taskProgressPercent}%` },
          { id: 'equipment_inventory', label: 'Armada & Peralatan', icon: Wrench, count: equipmentList.length },
          { id: 'citizen_tickets', label: 'Aduan Kebersihan Warga', icon: MessageCircle, count: openTicketsCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98] ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: DAFTAR STAF & TIM KEBERSIHAN ================= */}
      {activeSubTab === 'staff_roster' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Floating Bulk Action Bar */}
          {selectedStaffIds.length > 0 && (
            <div className="p-3.5 bg-teal-50 border border-teal-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedStaffIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-teal-950">
                    {selectedStaffIds.length} Petugas Kebersihan Terpilih
                  </p>
                  <p className="text-[11px] text-teal-700">
                    Pilih aksi massal untuk petugas yang telah diceklis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaffIds([])}
                  className="px-3.5 py-2 rounded-xl border border-teal-200 bg-surface text-ink text-xs font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Massal</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama petugas, no HP, area tugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Peran ({staffList.length})</option>
                <option value="KOORDINATOR_KEBERSIHAN">Koordinator Kebersihan</option>
                <option value="PENGANGKUT_SAMPAH">Pengangkut Sampah (Tossa)</option>
                <option value="PENYAPU_JALAN">Penyapu Jalan & Got</option>
                <option value="PETUGAS_TAMAN">Petugas Taman & Rumput</option>
                <option value="PENGELOLA_TPS">Pengelola TPS3R</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif Bertugas</option>
                <option value="LEAVE">Sedang Cuti</option>
                <option value="SICK">Sakit / Izin</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="name">Urut Nama</option>
                <option value="salary">Urut Gaji</option>
                <option value="joinDate">Urut Tanggal Masuk</option>
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

          {/* Table of Cleaning Staff */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredStaff.length > 0 && filteredStaff.every(s => selectedStaffIds.includes(s.id))}
                        onChange={() => {
                          if (filteredStaff.every(s => selectedStaffIds.includes(s.id))) {
                            setSelectedStaffIds([]);
                          } else {
                            setSelectedStaffIds(filteredStaff.map(s => s.id));
                          }
                        }}
                        className="rounded border-border text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="py-3.5 px-4">Nama Petugas & ID</th>
                    <th className="py-3.5 px-4">Peran / Posisi</th>
                    <th className="py-3.5 px-4">Zona / Area Tugas Utama</th>
                    <th className="py-3.5 px-4">Kontak WhatsApp</th>
                    <th className="py-3.5 px-4">Gaji Pokok & Tunjangan</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada staf kebersihan yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const isSelected = selectedStaffIds.includes(staff.id);
                      return (
                        <tr key={staff.id} className={`hover:bg-canvas/50 transition-colors ${isSelected ? 'bg-teal-50/40' : ''}`}>
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedStaffIds(prev =>
                                  prev.includes(staff.id) ? prev.filter(id => id !== staff.id) : [...prev, staff.id]
                                );
                              }}
                              className="rounded border-border text-teal-600 focus:ring-teal-500"
                            />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                                alt={staff.name}
                                className="w-8 h-8 rounded-full object-cover border border-border"
                              />
                              <div>
                                <span className="font-bold text-ink block text-sm">{staff.name}</span>
                                <span className="font-mono text-[10px] text-ink-muted">{staff.id} • Shift {staff.shift}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {getRoleBadge(staff.role)}
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
                            <p className="text-ink font-semibold truncate" title={staff.zoneAssignment}>
                              📍 {staff.zoneAssignment}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <a
                              href={`https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-teal-600" />
                              {staff.phone}
                            </a>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold font-mono text-ink block">{formatRupiah(staff.baseSalary)}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">+ {formatRupiah(staff.allowance)} Tunjangan</span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(staff.status)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStaff(staff)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Edit Profil Staf"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setStaffToDelete(staff)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold active:scale-[0.98] transition-all"
                                title="Hapus Staf"
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
        </div>
      )}

      {/* ================= SUBTAB 2: JADWAL & RUTE SAMPAH ================= */}
      {activeSubTab === 'routes_schedule' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  Jadwal & Rute Pengangkutan Sampah Door-to-Door
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Pembagian jadwal operasional motor Tossa per kavling dan pengolahan sampah TPS3R komplek.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Rute Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const content = `JADWAL & RUTE PENGANGKUTAN SAMPAH KOMPLEK WARGAHUB\n======================================================\n${routes.map(r => `• [${r.id}] ${r.routeName}\n  Status: ${r.statusToday}\n  Hari: ${r.days.join(', ')}\n  Jam Operasional: ${r.operationalHours}\n  Wilayah Target: ${r.targetBlocks}\n  Petugas Pelaksana: ${r.assignedStaffNames.join(', ')}\n  Armada: ${r.vehicleUsed}\n`).join('\n')}\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `JADWAL_RUTE_SAMPAH_${new Date().toISOString().slice(0, 10)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Jadwal rute sampah berhasil diunduh.');
                  }}
                  className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Unduh Jadwal (.txt)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((r) => (
                <div key={r.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs hover:border-teal-300 transition-colors flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                        {r.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRouteStatus(r.id)}
                        className={`px-2.5 py-0.5 rounded-full font-black text-[10px] cursor-pointer active:scale-[0.98] transition-all ${
                          r.statusToday === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : r.statusToday === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                        title="Klik untuk mengubah status rute"
                      >
                        {r.statusToday === 'COMPLETED' ? '✓ SELESAI HARI INI' : r.statusToday === 'IN_PROGRESS' ? '⏳ SEDANG BERJALAN' : 'TERJADWAL'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-ink">{r.routeName}</h4>
                      <p className="text-teal-700 font-bold mt-1">🗓️ {r.days.join(', ')} • ⏰ {r.operationalHours}</p>
                      <p className="text-ink-muted mt-1 leading-relaxed">🎯 {r.targetBlocks}</p>
                    </div>

                    <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1">
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Petugas Bertugas:</span>
                        <span className="font-bold text-ink">{r.assignedStaffNames.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Armada Kendaraan:</span>
                        <span className="font-bold text-teal-800">{r.vehicleUsed}</span>
                      </div>
                      {r.completionTime && (
                        <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-border">
                          <span>Waktu Selesai:</span>
                          <span className="font-mono">{r.completionTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-ink-muted font-medium">Ubah Status Operasi:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleRouteStatus(r.id)}
                      className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[10px] font-bold active:scale-[0.98] transition-all"
                    >
                      {r.statusToday === 'SCHEDULED' ? 'Mulai Rute ➔' : r.statusToday === 'IN_PROGRESS' ? 'Selesaikan Rute ✓' : 'Reset ke Jadwal ↺'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: CHECKLIST HARIAN ================= */}
      {activeSubTab === 'daily_checklist' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-600" />
                  Checklist & Lembar Kerja Sanitasi Harian
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Pantau verifikasi tugas kebersihan harian lingkungan komplek secara interaktif.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Tugas Checklist</span>
                </button>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-black rounded-xl border border-emerald-300">
                  Ketercapaian: {taskProgressPercent}% Selesai
                </span>
              </div>
            </div>

            {/* Filter Category Checklist */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-bold text-ink-muted whitespace-nowrap">Filter Kategori:</span>
              {[
                { id: 'ALL', label: 'Semua Tugas' },
                { id: 'SAMPAH_WARGA', label: 'Sampah Warga' },
                { id: 'SAPU_JALAN', label: 'Sapu Jalan' },
                { id: 'GOT_DRAINASE', label: 'Drainase Got' },
                { id: 'FASUM_TAMAN', label: 'Fasum Taman' },
                { id: 'TPS_PENGOLAHAN', label: 'TPS3R' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setChecklistCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.98] ${
                    checklistCategoryFilter === cat.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-canvas text-ink-muted hover:text-ink border border-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredDailyTasks.length === 0 ? (
                <div className="py-8 text-center text-ink-muted text-xs">
                  Tidak ada checklist tugas kebersihan pada kategori ini.
                </div>
              ) : (
                filteredDailyTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                      t.isCompleted
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-canvas border-border hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
                        t.isCompleted ? 'bg-emerald-600 text-white' : 'bg-surface border border-border text-ink-muted'
                      }`}>
                        {t.isCompleted && <Check className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className={`font-bold block text-sm ${t.isCompleted ? 'line-through text-ink-muted' : 'text-ink'}`}>
                          {t.taskName}
                        </span>
                        <span className="text-[11px] text-teal-800 font-semibold">
                          📍 {t.location} • Petugas: {t.assignedTo}
                        </span>
                        {t.notes && <p className="text-[10px] text-ink-muted italic mt-0.5">{t.notes}</p>}
                      </div>
                    </div>

                    <div className="text-right">
                      {t.isCompleted ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[10px] border border-emerald-200">
                          ✓ Selesai {t.completedAt}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black rounded text-[10px] border border-amber-200">
                          ⏳ Belum Selesai (Klik untuk Ceklis)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: ARMADA & PERALATAN ================= */}
      {activeSubTab === 'equipment_inventory' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  Inventaris Armada & Peralatan Kebersihan Komplek
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Pencatatan kondisi fisik motor Tossa, gerobak sampah, mesin potong rumput, dan jadwal servis berkala.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddEquipmentModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Peralatan / Armada</span>
              </button>
            </div>

            {/* Filter Equipment */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={equipmentCategoryFilter}
                onChange={(e) => setEquipmentCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori Alat ({equipmentList.length})</option>
                <option value="ARMADA_MOTOR">Armada Motor Tossa</option>
                <option value="GEROBAK">Gerobak Sampah</option>
                <option value="MESIN_RUMPUT">Mesin Rumput</option>
                <option value="ALAT_MANUAL">Peralatan Manual</option>
                <option value="SAFETY_APD">Perlengkapan APD</option>
              </select>

              <select
                value={equipmentConditionFilter}
                onChange={(e) => setEquipmentConditionFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kondisi Fisik</option>
                <option value="BAIK">Kondisi Baik</option>
                <option value="PERLU_SERVIS">Perlu Servis</option>
                <option value="RUSAK">Rusak</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.length === 0 ? (
                <div className="col-span-full py-8 text-center text-ink-muted text-xs">
                  Tidak ada peralatan yang sesuai dengan filter.
                </div>
              ) : (
                filteredEquipment.map((eq) => (
                  <div key={eq.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5 shadow-xs hover:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded text-[10px]">
                        {eq.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        eq.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {eq.condition}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-ink">{eq.name}</h4>
                      <p className="font-mono text-primary-700 font-bold mt-0.5">{eq.unitCode} (Jumlah: {eq.quantity} Unit)</p>
                      <p className="text-ink-muted text-[11px] mt-1">Penanggung Jawab: <strong>{eq.picName}</strong></p>
                    </div>

                    {eq.lastServiceDate && (
                      <div className="p-2 bg-surface rounded-xl border border-border flex justify-between items-center text-[11px]">
                        <span className="text-ink-muted">Servis Terakhir: <strong>{eq.lastServiceDate}</strong></span>
                        <span className="text-teal-700 font-bold">Servis Berikutnya: {eq.nextServiceDueDate}</span>
                      </div>
                    )}

                    {eq.notes && (
                      <p className="text-[11px] text-ink-muted italic">"{eq.notes}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: ADUAN KEBERSIHAN WARGA ================= */}
      {activeSubTab === 'citizen_tickets' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-teal-600" />
                  Tiket Permintaan & Aduan Kebersihan Masuk dari Warga
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Laporan sampah terlewat, got mampet, atau dahan pohon rapuh yang diajukan warga dari portal komplek.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Buat Aduan Manual</span>
                </button>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-900 font-black rounded-xl border border-amber-300">
                  {openTicketsCount} Aduan Perlu Ditangani
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="py-8 text-center text-ink-muted text-xs">
                  Tidak ada tiket aduan kebersihan yang masuk dari warga saat ini.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-2.5 hover:border-teal-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-900 font-bold rounded text-[10px]">
                        {t.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}>
                        {t.status === 'RESOLVED' ? '✓ SELESAI' : 'DALAM PROSES'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-ink">{t.reporterHouse} — {t.reporterName}</h4>
                      <p className="text-ink-muted mt-0.5 leading-relaxed">{t.description}</p>
                      <p className="text-[10px] text-ink-muted font-mono mt-1">Lapor: {t.reportedAt}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-[11px] text-teal-800 font-semibold">
                        Disposisi Petugas: <strong>{t.assignedStaffName || 'Belum Ditugaskan'}</strong>
                      </span>

                      {t.status !== 'RESOLVED' ? (
                        <button
                          type="button"
                          onClick={() => handleResolveTicket(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all"
                        >
                          ✓ Tandai Selesai Ditangani
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">Selesai pada {t.resolvedAt}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT STAF KEBERSIHAN ================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>{editingStaffId ? 'Edit Profil Petugas Kebersihan' : 'Tambah Petugas Kebersihan Baru'}</span>
              </h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap Petugas *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Slamet Riyadi"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Peran / Jabatan *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="PENGANGKUT_SAMPAH">Pengangkut Sampah (Tossa)</option>
                    <option value="PENYAPU_JALAN">Penyapu Jalan & Selokan Got</option>
                    <option value="PETUGAS_TAMAN">Petugas Taman & Rumput</option>
                    <option value="PENGELOLA_TPS">Pengelola TPS3R</option>
                    <option value="KOORDINATOR_KEBERSIHAN">Koordinator Kebersihan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    placeholder="0812-3456-7890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Zona Area Tugas Utama *</label>
                <input
                  type="text"
                  placeholder="Contoh: Rute Blok A, Blok B & Jl. Utama Boulevard"
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Gaji Pokok Bulanan (Rp) *</label>
                  <input
                    type="number"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Uang Makan & Tunjangan (Rp)</label>
                  <input
                    type="number"
                    value={formAllowance}
                    onChange={(e) => setFormAllowance(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Status Ikatan</label>
                  <select
                    value={formEmpStatus}
                    onChange={(e) => setFormEmpStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KONTRAK">Kontrak</option>
                    <option value="TETAP">Tetap</option>
                    <option value="HARIAN_LEPAS">Harian Lepas</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Shift Kerja</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="PAGI">Pagi (06:00 - 11:00)</option>
                    <option value="SIANG">Siang (13:00 - 17:00)</option>
                    <option value="FULL_DAY">Full Day (Pagi + Sore)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Keaktifan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="ACTIVE">Aktif Bertugas</option>
                    <option value="LEAVE">Sedang Cuti</option>
                    <option value="SICK">Sakit / Izin</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Penanggung jawab motor Tossa D-4821-WGH"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data Petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH RUTE SAMPAH ================= */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                <span>Tambah Jadwal & Rute Sampah Baru</span>
              </h3>
              <button onClick={() => setShowAddRouteModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Rute / Operasional *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengangkutan Sore: Ruko & Blok Komersial"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Jam Operasional *</label>
                <input
                  type="text"
                  placeholder="06:30 - 09:30 WIB"
                  value={routeHours}
                  onChange={(e) => setRouteHours(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Target Wilayah / Blok *</label>
                <input
                  type="text"
                  placeholder="Contoh: Blok B (Kav 01-15) & Fasum Masjid"
                  value={routeBlocks}
                  onChange={(e) => setRouteBlocks(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Petugas Pelaksana</label>
                  <select
                    value={routeStaff}
                    onChange={(e) => setRouteStaff(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Armada Digunakan</label>
                  <select
                    value={routeVehicle}
                    onChange={(e) => setRouteVehicle(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Motor Tossa Viar D-4821-WGH">Motor Tossa Viar</option>
                    <option value="Gerobak Plat GBK-01">Gerobak GBK-01</option>
                    <option value="Gerobak Plat GBK-02">Gerobak GBK-02</option>
                    <option value="Mesin Cacah Kompos TPS3R">Mesin Cacah TPS3R</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH TUGAS CHECKLIST ================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-600" />
                <span>Tambah Tugas Checklist Harian Baru</span>
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Tugas Kegiatan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembersihan Saluran Air Hujan Depan Gerbang"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Tugas</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SAMPAH_WARGA">Sampah Warga</option>
                    <option value="SAPU_JALAN">Sapu Jalan</option>
                    <option value="GOT_DRAINASE">Got Drainase</option>
                    <option value="FASUM_TAMAN">Fasum Taman</option>
                    <option value="TPS_PENGOLAHAN">TPS3R Pengolahan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Petugas Penanggung Jawab</label>
                  <select
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi Kegiatan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Area Boulevard & Sekitar Pos Satpam"
                  value={taskLocation}
                  onChange={(e) => setTaskLocation(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Gunakan APD rompi dan sarung tangan tebal"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH PERALATAN ================= */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Tambah Inventaris Peralatan / Armada</span>
              </h3>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Alat / Armada *</label>
                <input
                  type="text"
                  placeholder="Contoh: Gerobak Dorong Sampah Baru"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Alat</label>
                  <select
                    value={eqCategory}
                    onChange={(e) => setEqCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="ARMADA_MOTOR">Armada Motor Tossa</option>
                    <option value="GEROBAK">Gerobak Sampah</option>
                    <option value="MESIN_RUMPUT">Mesin Rumput / Blower</option>
                    <option value="ALAT_MANUAL">Sapu / Cangkul / Sekop</option>
                    <option value="SAFETY_APD">Sepatu Boots / APD</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jumlah Unit *</label>
                  <input
                    type="number"
                    min={1}
                    value={eqQuantity}
                    onChange={(e) => setEqQuantity(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Kode / Nomor Seri / Plat</label>
                <input
                  type="text"
                  placeholder="GBK-03 / D-4821-WGH"
                  value={eqUnitCode}
                  onChange={(e) => setEqUnitCode(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kondisi Fisik</label>
                  <select
                    value={eqCondition}
                    onChange={(e) => setEqCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="BAIK">Kondisi Baik</option>
                    <option value="PERLU_SERVIS">Perlu Servis / Perbaikan</option>
                    <option value="RUSAK">Rusak</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={eqPicName}
                    onChange={(e) => setEqPicName(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Disimpan di gudang TPS3R samping mesin pencacah"
                  value={eqNotes}
                  onChange={(e) => setEqNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH ADUAN WARGA MANUAL ================= */}
      {showAddTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-600" />
                <span>Buat Aduan Kebersihan Manual</span>
              </h3>
              <button onClick={() => setShowAddTicketModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Blok / No Rumah Warga *</label>
                  <input
                    type="text"
                    list="property-houses-list"
                    placeholder="Pilih atau ketik kavling..."
                    value={ticketHouse}
                    onChange={(e) => setTicketHouse(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pelapor *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Ratna Dewi"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Aduan</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SAMPAH_TERLEWAT">Sampah Terlewat</option>
                    <option value="GOT_MAMPET">Got Mampet / Meluap</option>
                    <option value="RUMPUT_LIAR">Rumput Liar Tinggi</option>
                    <option value="POHON_RANTING">Pohon / Dahan Rapuh</option>
                    <option value="BANGKAI_HEWAN">Bangkai Hewan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Disposisi Petugas</label>
                  <select
                    value={ticketStaff}
                    onChange={(e) => setTicketStaff(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi Permasalahan *</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan detail aduan atau lokasi spesifik..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Aduan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS STAF ================= */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Data Petugas {staffToDelete.name}?</h3>
              <p className="text-ink-muted">
                Data profil dan penugasan area kebersihan <strong>{staffToDelete.zoneAssignment}</strong> akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStaff}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-[0.98] transition-all"
              >
                Ya, Hapus Petugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus {selectedStaffIds.length} Petugas Kebersihan?</h3>
              <p className="text-ink-muted">
                Sebanyak <strong>{selectedStaffIds.length} data staf</strong> yang telah diceklis akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkProcessing ? 'Menghapus...' : `Ya, Hapus (${selectedStaffIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
