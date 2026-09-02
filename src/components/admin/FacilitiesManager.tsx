import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  Edit3,
  Trash2,
  Calendar,
  Phone,
  Eye,
  Check,
  X,
  Users,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Send,
  MessageCircle,
  HelpCircle,
  Trees,
  Droplets,
  Zap,
  Tag,
  Share2,
  Copy,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';

export interface FacilityItem {
  id: string;
  name: string;
  code: string;
  category: 'BALAI_WARGA' | 'OLAHRAGA' | 'IBADAH' | 'TAMAN' | 'KOLAM_RENANG' | 'KEAMANAN_PJU' | 'INFRASTRUKTUR';
  location: string;
  capacity?: number;
  operatingHours?: string;
  hourlyRate?: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'UNDER_MAINTENANCE' | 'DAMAGED';
  picName: string;
  imageUrl?: string;
  notes: string | null;
}

export interface FacilityBooking {
  id: string;
  bookingNumber: string;
  facilityId: string;
  facilityName: string;
  propertyCode: string;
  residentName: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  depositAmount: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  approvedBy?: string;
  notes?: string;
}

export interface MaintenanceProject {
  id: string;
  title: string;
  facilityId: string;
  facilityName: string;
  location: string;
  description: string;
  costEstimate: number;
  actualCost: number;
  scheduledDate: string;
  performedBy: string;
  contractorPhone?: string;
  priority: 'HIGH' | 'MEDIUM' | 'ROUTINE';
  status: 'PLANNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  notes?: string;
}

export interface FacilityStaff {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'LEAVE';
  assignedProjectsCount: number;
  notes?: string;
}

interface FacilitiesManagerProps {
  facilities: FacilityItem[];
  maintenanceRequests: any[];
  initialTab?: string;
}

export const FacilitiesManager: React.FC<FacilitiesManagerProps> = ({
  facilities: initialServerFacilities,
  maintenanceRequests: initialServerRequests,
  initialTab = 'facilities',
}) => {
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

  // 1. Facilities Default Roster
  const defaultFacilities: FacilityItem[] = [
    {
      id: 'fac-1',
      name: 'Gedung Balai Warga Serbaguna',
      code: 'FAS-BW-01',
      category: 'BALAI_WARGA',
      location: 'Pusat Komplek (Depan Taman Blok B)',
      capacity: 150,
      operatingHours: '07:00 - 22:00 WIB',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Hendro Siswanto (Pengurus Sarana)',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      notes: 'Dilengkapi pendingin ruangan AC 3 PK, sound system wireless, 80 kursi lipat, dan proyektor presentasi.',
    },
    {
      id: 'fac-2',
      name: 'Lapangan Tenis & Futsal Outdoor',
      code: 'FAS-LAP-01',
      category: 'OLAHRAGA',
      location: 'Area Fasum Belakang Blok C',
      capacity: 30,
      operatingHours: '06:00 - 21:00 WIB',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Mandor Wawan & Tim Sarana',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80',
      notes: 'Lantai flexi-pave anti-slip dengan 4 titik tiang lampu sorot LED 100W untuk pemakaian malam.',
    },
    {
      id: 'fac-3',
      name: 'Lapangan Badminton Indoor Balai Warga',
      code: 'FAS-BDM-01',
      category: 'OLAHRAGA',
      location: 'Di dalam Balai Warga',
      capacity: 20,
      operatingHours: '07:00 - 22:00 WIB',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Hendro Siswanto',
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
      notes: 'Karpet vinyl standar PBSI dengan jaring net Yonex baru.',
    },
    {
      id: 'fac-4',
      name: 'Kolam Renang Fasum Paguyuban Warga',
      code: 'FAS-KLM-01',
      category: 'KOLAM_RENANG',
      location: 'Club House Fasum Blok B',
      capacity: 40,
      operatingHours: '06:30 - 18:00 WIB (Kecuali Senin Kuras Air)',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Pak Ujang Suhendra & Teknisi Pompa',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80',
      notes: 'Klorinasi otomatis & sistem sirkulasi pompa sand filter Hayward 1.5 HP.',
    },
    {
      id: 'fac-5',
      name: 'Musholla Baitul Makmur Komplek',
      code: 'FAS-MSH-01',
      category: 'IBADAH',
      location: 'Blok A (Dekat Gerbang Utama)',
      capacity: 80,
      operatingHours: '24 Jam (Waktu Sholat)',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'DKM Baitul Makmur & Pak Dadang',
      imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80',
      notes: 'Tempat wudhu bersih terpisah pria/wanita dan sound system corong TOA baru.',
    },
    {
      id: 'fac-6',
      name: 'Taman Bermain Anak & Gazebo Lansia',
      code: 'FAS-TMN-01',
      category: 'TAMAN',
      location: 'Ruang Terbuka Hijau Blok B & D',
      capacity: 50,
      operatingHours: '06:00 - 18:30 WIB',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Pak Ujang Suhendra (Petugas Taman)',
      imageUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&auto=format&fit=crop&q=80',
      notes: 'Ayunan, perosotan anak, jogging track paving block, dan 3 unit gazebo kayu jati.',
    },
    {
      id: 'fac-7',
      name: 'Barrier Gate RFID & Pos Keamanan Utama',
      code: 'FAS-SEC-01',
      category: 'KEAMANAN_PJU',
      location: 'Gerbang Akses Masuk Pos 1 & Pos 2',
      capacity: 2,
      operatingHours: '24 Jam Nonstop',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Bambang Sudiro (Danru Satpam)',
      imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&auto=format&fit=crop&q=80',
      notes: 'Palang otomatis MX-50 RFID 13.56MHz terintegrasi scanner QR warga.',
    },
    {
      id: 'fac-8',
      name: 'Jaringan Penerangan Jalan Umum (PJU) Solar Cell',
      code: 'FAS-PJU-01',
      category: 'KEAMANAN_PJU',
      location: 'Sepanjang Jl. Utama, Blok A s/d D & Kavling',
      capacity: 45,
      operatingHours: 'Otomatis Sensor Cahaya (18:00 - 05:30 WIB)',
      hourlyRate: 0,
      condition: 'GOOD',
      picName: 'Hendro Siswanto (Teknisi)',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=80',
      notes: '45 titik tiang lampu LED 60W solar cell otomatis menyala saat gelap.',
    }
  ];

  const [facilities, setFacilities] = useState<FacilityItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wargahub_facilities');
        const deletedStr = localStorage.getItem('wargahub_deleted_facilities');
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((f: any) => !deletedIds.includes(f.id));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return defaultFacilities;
  });

  // 2. Bookings State
  const defaultBookings: FacilityBooking[] = [
    {
      id: 'BKG-001',
      bookingNumber: 'RES-202609-BW01',
      facilityId: 'fac-1',
      facilityName: 'Gedung Balai Warga Serbaguna',
      propertyCode: 'A-17',
      residentName: 'Budi Santoso',
      phone: '0812-3456-7890',
      date: '2026-09-06',
      startTime: '10:00',
      endTime: '15:00',
      purpose: 'Acara Syukuran Ulang Tahun Keluarga & Pengajian Warga',
      depositAmount: 200000,
      status: 'APPROVED',
      approvedBy: 'Ketua RW 05',
      notes: 'Uang jaminan kebersihan Rp 200.000 telah disetor dan akan dikembalikan setelah selesai.'
    },
    {
      id: 'BKG-002',
      bookingNumber: 'RES-202609-TEN01',
      facilityId: 'fac-2',
      facilityName: 'Lapangan Tenis & Futsal Outdoor',
      propertyCode: 'B-04',
      residentName: 'Hendra Wijaya',
      phone: '0813-9988-7766',
      date: '2026-09-07',
      startTime: '16:00',
      endTime: '18:00',
      purpose: 'Latihan Pertandingan Tenis Antar Blok A vs Blok B',
      depositAmount: 0,
      status: 'APPROVED',
      approvedBy: 'Pengurus Sarana',
      notes: 'Gratis untuk kegiatan olahraga warga komplek.'
    },
    {
      id: 'BKG-003',
      bookingNumber: 'RES-202609-BW02',
      facilityId: 'fac-1',
      facilityName: 'Gedung Balai Warga Serbaguna',
      propertyCode: 'C-08',
      residentName: 'Ibu Ratna Kumala',
      phone: '0819-2233-4455',
      date: '2026-09-12',
      startTime: '13:00',
      endTime: '17:00',
      purpose: 'Pertemuan Rutin Arisan PKK & Posyandu Balita',
      depositAmount: 0,
      status: 'PENDING',
      notes: 'Memerlukan 40 kursi lipat dan meja pendaftaran posyandu.'
    }
  ];

  const [bookings, setBookings] = useState<FacilityBooking[]>(() =>
    getPersisted('wargahub_facility_bookings', defaultBookings)
  );

  // 3. Maintenance Projects State
  const defaultMaintenance: MaintenanceProject[] = [
    {
      id: 'MNT-001',
      title: 'Servis Rutin & Penggantian Filter Pompa Kolam Renang',
      facilityId: 'fac-4',
      facilityName: 'Kolam Renang Fasum Paguyuban Warga',
      location: 'Club House Blok B',
      description: 'Penggantian media pasir silica filter Hayward dan pelumasan bearing dinamo pompa.',
      costEstimate: 850000,
      actualCost: 850000,
      scheduledDate: '2026-09-01',
      performedBy: 'CV Tirta Abadi Pool Cimahi',
      contractorPhone: '0812-4455-6677',
      priority: 'HIGH',
      status: 'RESOLVED',
      notes: 'Pekerjaan selesai 100%, kualitas air kolam jernih pH 7.4.'
    },
    {
      id: 'MNT-002',
      title: 'Pengecatan Ulang Dinding & Kusen Jendela Balai Warga',
      facilityId: 'fac-1',
      facilityName: 'Gedung Balai Warga Serbaguna',
      location: 'Balai Warga',
      description: 'Pengecatan tembok interior cat Dulux EasyClean warna broken white dan perbaikan lis plafon.',
      costEstimate: 2400000,
      actualCost: 1200000,
      scheduledDate: '2026-09-04',
      performedBy: 'Mandor Wawan & 2 Tukang Cat',
      contractorPhone: '0813-7788-9900',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      notes: 'Tahap plamir dan cat dasar 50% selesai.'
    },
    {
      id: 'MNT-003',
      title: 'Penggantian Jaring Net & Lampu Sorot Lapangan Badminton',
      facilityId: 'fac-3',
      facilityName: 'Lapangan Badminton Indoor Balai Warga',
      location: 'Balai Warga',
      description: 'Pengadaan 1 unit net Yonex standar turnamen dan 2 bohlam LED Philips 50W.',
      costEstimate: 450000,
      actualCost: 450000,
      scheduledDate: '2026-08-28',
      performedBy: 'Hendro Siswanto (Teknisi)',
      contractorPhone: '0812-3456-7805',
      priority: 'ROUTINE',
      status: 'RESOLVED',
      notes: 'Selesai tepat waktu.'
    },
    {
      id: 'MNT-004',
      title: 'Pengecekan Baterai & Panel Solar Cell PJU Blok D',
      facilityId: 'fac-8',
      facilityName: 'Jaringan Penerangan Jalan Umum (PJU) Solar Cell',
      location: 'Jl. Sariwangi Indah 2 & Blok D',
      description: 'Pembersihan permukaan kaca panel tenaga surya dari debu dan tes voltase aki lithium.',
      costEstimate: 300000,
      actualCost: 0,
      scheduledDate: '2026-09-10',
      performedBy: 'PT Solar Panel Nusantara',
      contractorPhone: '0811-2233-4455',
      priority: 'ROUTINE',
      status: 'PLANNED',
      notes: 'Jadwal servis berkala 3 bulanan.'
    }
  ];

  const [maintenanceList, setMaintenanceList] = useState<MaintenanceProject[]>(() =>
    getPersisted('wargahub_facility_maintenance', defaultMaintenance)
  );

  // 4. Staff & Technicians State
  const defaultStaff: FacilityStaff[] = [
    {
      id: 'STF-FAC-01',
      name: 'Hendro Siswanto',
      role: 'Koordinator Teknisi Sarana & Kelistrikan',
      specialty: 'Instalasi Listrik, Genset, CCTV & Pompa Sirkulasi',
      phone: '0812-3456-7805',
      status: 'AVAILABLE',
      assignedProjectsCount: 3,
      notes: 'Penanggung jawab kelistrikan balai warga, genset darurat, dan pompa kolam.'
    },
    {
      id: 'STF-FAC-02',
      name: 'Mandor Wawan',
      role: 'Mitra Tukang Bangunan & Sipil',
      specialty: 'Konstruksi Bangunan, Pengecatan, Paving Block & Atap Bocor',
      phone: '0813-7788-9900',
      status: 'ON_DUTY',
      assignedProjectsCount: 2,
      notes: 'Mitra tetap perbaikan sarana fisik lingkungan komplek.'
    },
    {
      id: 'STF-FAC-03',
      name: 'Pak Ujang Suhendra',
      role: 'Petugas Perawatan Taman & Fasum',
      specialty: 'Pemotongan Rumput, Pemangkasan Dahan & Kolam',
      phone: '0813-7766-5544',
      status: 'AVAILABLE',
      assignedProjectsCount: 1,
      notes: 'Perawatan berkala area playground anak dan taman komplek.'
    }
  ];

  const [staffList, setStaffList] = useState<FacilityStaff[]>(() =>
    getPersisted('wargahub_facility_staff', defaultStaff)
  );

  // Active Subtab matching query parameter
  const validTabs = ['facilities', 'bookings', 'maintenance', 'staff'];
  const [activeSubTab, setActiveSubTab] = useState<'facilities' | 'bookings' | 'maintenance' | 'staff'>(
    validTabs.includes(initialTab) ? (initialTab as any) : 'facilities'
  );

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'capacity' | 'condition'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-Selection State for Bulk Actions (Facilities)
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modals State
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<FacilityItem | null>(null);

  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<FacilityBooking | null>(null);

  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit Facility
  const [formFacName, setFormFacName] = useState('');
  const [formFacCode, setFormFacCode] = useState('');
  const [formFacCategory, setFormFacCategory] = useState<FacilityItem['category']>('BALAI_WARGA');
  const [formFacLocation, setFormFacLocation] = useState('');
  const [formFacCapacity, setFormFacCapacity] = useState(50);
  const [formFacHours, setFormFacHours] = useState('06:00 - 22:00 WIB');
  const [formFacRate, setFormFacRate] = useState(0);
  const [formFacCondition, setFormFacCondition] = useState<FacilityItem['condition']>('GOOD');
  const [formFacPic, setFormFacPic] = useState('Hendro Siswanto');
  const [formFacNotes, setFormFacNotes] = useState('');

  // Form State for Add Booking
  const [bkgFacilityId, setBkgFacilityId] = useState('fac-1');
  const [bkgPropertyCode, setBkgPropertyCode] = useState('A-17');
  const [bkgResidentName, setBkgResidentName] = useState('Budi Santoso');
  const [bkgPhone, setBkgPhone] = useState('0812-3456-7890');
  const [bkgDate, setBkgDate] = useState(new Date().toISOString().slice(0, 10));
  const [bkgStartTime, setBkgStartTime] = useState('09:00');
  const [bkgEndTime, setBkgEndTime] = useState('14:00');
  const [bkgPurpose, setBkgPurpose] = useState('Acara Keluarga / Rapat RT');
  const [bkgDeposit, setBkgDeposit] = useState(0);
  const [bkgNotes, setBkgNotes] = useState('');

  // Form State for Add Maintenance
  const [mntTitle, setMntTitle] = useState('');
  const [mntFacilityId, setMntFacilityId] = useState('fac-1');
  const [mntLocation, setMntLocation] = useState('Balai Warga');
  const [mntDesc, setMntDesc] = useState('');
  const [mntCostEstimate, setMntCostEstimate] = useState(500000);
  const [mntScheduledDate, setMntScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [mntPerformedBy, setMntPerformedBy] = useState('Hendro Siswanto (Teknisi)');
  const [mntPriority, setMntPriority] = useState<MaintenanceProject['priority']>('MEDIUM');

  // Form State for Add Staff
  const [stfName, setStfName] = useState('');
  const [stfRole, setStfRole] = useState('Teknisi Listrik & Genset');
  const [stfSpecialty, setStfSpecialty] = useState('Instalasi Listrik & Elektronik');
  const [stfPhone, setStfPhone] = useState('0812-');
  const [stfNotes, setStfNotes] = useState('');

  // Calculations & KPIs
  const totalFacilitiesCount = facilities.length;
  const readyFacilitiesCount = facilities.filter(f => f.condition === 'GOOD').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING').length;
  const activeMaintenanceCount = maintenanceList.filter(m => m.status === 'IN_PROGRESS' || m.status === 'PLANNED').length;

  // Filtered & Sorted Facilities
  const filteredFacilities = useMemo(() => {
    let list = facilities.filter(f => {
      const matchSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.picName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
      const matchCondition = conditionFilter === 'ALL' || f.condition === conditionFilter;

      return matchSearch && matchCategory && matchCondition;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'code') comp = a.code.localeCompare(b.code);
      else if (sortBy === 'capacity') comp = (a.capacity || 0) - (b.capacity || 0);
      else if (sortBy === 'condition') comp = a.condition.localeCompare(b.condition);

      return sortOrder === 'asc' ? comp : -comp;
    });

    return list;
  }, [facilities, searchTerm, categoryFilter, conditionFilter, sortBy, sortOrder]);

  // Handlers for Facility Management
  const handleOpenAddFacility = () => {
    setEditingFacilityId(null);
    setFormFacName('');
    setFormFacCode(`FAS-${Date.now().toString().slice(-4)}`);
    setFormFacCategory('BALAI_WARGA');
    setFormFacLocation('Pusat Fasum Komplek');
    setFormFacCapacity(50);
    setFormFacHours('06:00 - 22:00 WIB');
    setFormFacRate(0);
    setFormFacCondition('GOOD');
    setFormFacPic('Hendro Siswanto');
    setFormFacNotes('');
    setShowAddFacilityModal(true);
  };

  const handleOpenEditFacility = (fac: FacilityItem) => {
    setEditingFacilityId(fac.id);
    setFormFacName(fac.name);
    setFormFacCode(fac.code);
    setFormFacCategory(fac.category);
    setFormFacLocation(fac.location);
    setFormFacCapacity(fac.capacity || 50);
    setFormFacHours(fac.operatingHours || '06:00 - 22:00 WIB');
    setFormFacRate(fac.hourlyRate || 0);
    setFormFacCondition(fac.condition);
    setFormFacPic(fac.picName);
    setFormFacNotes(fac.notes || '');
    setShowAddFacilityModal(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingFacilityId) {
        await fetch('/api/facilities/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingFacilityId,
            name: formFacName,
            code: formFacCode,
            category: formFacCategory,
            location: formFacLocation,
            capacity: Number(formFacCapacity),
            hourlyRate: Number(formFacRate),
            operatingHours: formFacHours,
            condition: formFacCondition,
            picName: formFacPic,
            notes: formFacNotes,
          }),
        }).catch(() => {});

        const updated = facilities.map(f => {
          if (f.id === editingFacilityId) {
            return {
              ...f,
              name: formFacName,
              code: formFacCode,
              category: formFacCategory,
              location: formFacLocation,
              capacity: Number(formFacCapacity),
              hourlyRate: Number(formFacRate),
              operatingHours: formFacHours,
              condition: formFacCondition,
              picName: formFacPic,
              notes: formFacNotes,
            };
          }
          return f;
        });

        setFacilities(updated);
        savePersisted('wargahub_facilities', updated);
        showToast(`Data fasilitas ${formFacName} berhasil diperbarui.`);
        setShowAddFacilityModal(false);
      } else {
        await fetch('/api/facilities/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formFacName,
            code: formFacCode,
            category: formFacCategory,
            location: formFacLocation,
            capacity: Number(formFacCapacity),
            hourlyRate: Number(formFacRate),
            operatingHours: formFacHours,
            condition: formFacCondition,
            picName: formFacPic,
            notes: formFacNotes,
          }),
        }).catch(() => {});

        const newId = `fac-${Date.now().toString().slice(-4)}`;
        const newFac: FacilityItem = {
          id: newId,
          name: formFacName,
          code: formFacCode.toUpperCase(),
          category: formFacCategory,
          location: formFacLocation,
          capacity: Number(formFacCapacity),
          hourlyRate: Number(formFacRate),
          operatingHours: formFacHours,
          condition: formFacCondition,
          picName: formFacPic,
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
          notes: formFacNotes,
        };

        const updated = [newFac, ...facilities];
        setFacilities(updated);
        savePersisted('wargahub_facilities', updated);
        showToast(`Fasilitas baru ${formFacName} berhasil ditambahkan.`);
        setShowAddFacilityModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses data fasilitas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteFacility = async () => {
    if (!facilityToDelete) return;
    try {
      await fetch('/api/facilities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: facilityToDelete.id, name: facilityToDelete.name })
      }).catch(() => {});

      const updated = facilities.filter(f => f.id !== facilityToDelete.id);
      setFacilities(updated);
      savePersisted('wargahub_facilities', updated);
      addDeletedIds('wargahub_deleted_facilities', [facilityToDelete.id]);
      showToast(`Fasilitas ${facilityToDelete.name} berhasil dihapus.`);
      setFacilityToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus fasilitas.');
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedFacilityIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await fetch('/api/facilities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedFacilityIds })
      }).catch(() => {});

      const updated = facilities.filter(f => !selectedFacilityIds.includes(f.id));
      setFacilities(updated);
      savePersisted('wargahub_facilities', updated);
      addDeletedIds('wargahub_deleted_facilities', selectedFacilityIds);
      showToast(`${selectedFacilityIds.length} fasilitas berhasil dihapus.`);
      setSelectedFacilityIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus fasilitas massal.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Handlers for Booking
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const selectedFac = facilities.find(f => f.id === bkgFacilityId) || facilities[0];
      await fetch('/api/facilities/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: selectedFac.id,
          facilityName: selectedFac.name,
          residentName: bkgResidentName,
          date: bkgDate,
          startTime: bkgStartTime,
          endTime: bkgEndTime,
          purpose: bkgPurpose,
          contactPhone: bkgPhone,
        })
      }).catch(() => {});

      const newBkg: FacilityBooking = {
        id: `BKG-${Date.now().toString().slice(-4)}`,
        bookingNumber: `RES-${bkgDate.replace(/-/g, '').slice(0, 6)}-${bkgPropertyCode.replace(/[^A-Z0-9]/g, '')}`,
        facilityId: selectedFac.id,
        facilityName: selectedFac.name,
        propertyCode: bkgPropertyCode,
        residentName: bkgResidentName,
        phone: bkgPhone,
        date: bkgDate,
        startTime: bkgStartTime,
        endTime: bkgEndTime,
        purpose: bkgPurpose,
        depositAmount: Number(bkgDeposit),
        status: 'APPROVED',
        approvedBy: 'Pengurus Sarana WargaHub',
        notes: bkgNotes,
      };

      const updated = [newBkg, ...bookings];
      setBookings(updated);
      savePersisted('wargahub_facility_bookings', updated);
      showToast(`Reservasi fasilitas ${selectedFac.name} untuk Rumah ${bkgPropertyCode} berhasil disetujui.`);
      setShowAddBookingModal(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat reservasi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBookingStatus = (id: string, newStatus: FacilityBooking['status']) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus, approvedBy: 'Ketua RW / Pengurus' } : b);
    setBookings(updated);
    savePersisted('wargahub_facility_bookings', updated);
    showToast(`Status booking diubah menjadi ${newStatus}.`);
  };

  // Handlers for Maintenance
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFac = facilities.find(f => f.id === mntFacilityId) || facilities[0];
    const newMnt: MaintenanceProject = {
      id: `MNT-${Date.now().toString().slice(-4)}`,
      title: mntTitle,
      facilityId: selectedFac.id,
      facilityName: selectedFac.name,
      location: mntLocation,
      description: mntDesc,
      costEstimate: Number(mntCostEstimate),
      actualCost: 0,
      scheduledDate: mntScheduledDate,
      performedBy: mntPerformedBy,
      priority: mntPriority,
      status: 'PLANNED',
    };

    const updated = [newMnt, ...maintenanceList];
    setMaintenanceList(updated);
    savePersisted('wargahub_facility_maintenance', updated);
    showToast(`Jadwal perbaikan ${mntTitle} berhasil dicatat.`);
    setShowAddMaintenanceModal(false);
  };

  const handleUpdateMaintenanceStatus = async (id: string, newStatus: MaintenanceProject['status']) => {
    await fetch('/api/facilities/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, status: newStatus }),
    }).catch(() => {});

    const updated = maintenanceList.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: newStatus,
          actualCost: newStatus === 'RESOLVED' ? (m.actualCost || m.costEstimate) : m.actualCost,
        };
      }
      return m;
    });

    setMaintenanceList(updated);
    savePersisted('wargahub_facility_maintenance', updated);
    showToast(`Status maintenance diubah menjadi ${newStatus}.`);
  };

  // Export CSV
  const handleExportFacilitiesCSV = () => {
    const headers = ['Kode Fasilitas', 'Nama Fasilitas', 'Kategori', 'Lokasi', 'Kapasitas', 'Jam Operasional', 'Kondisi', 'Penanggung Jawab'];
    const rows = facilities.map(f => [
      f.code,
      `"${f.name}"`,
      f.category,
      `"${f.location}"`,
      f.capacity || 0,
      `"${f.operatingHours}"`,
      f.condition,
      `"${f.picName}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INVENTARIS_FASILITAS_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data inventaris fasilitas berhasil diekspor ke CSV.');
  };

  const getConditionBadge = (cond: FacilityItem['condition']) => {
    switch (cond) {
      case 'GOOD':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">✓ KONDISI PRIMA (BAIK)</span>;
      case 'NEEDS_REPAIR':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">⚠️ PERLU SERVIS</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-200 animate-pulse">🔧 DALAM PERBAIKAN</span>;
      case 'DAMAGED':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px] border border-rose-200">✕ RUSAK / NONAKTIF</span>;
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-ink flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary-600" />
              Sarana, Fasilitas Umum & Maintenance Komplek
            </h1>
            <span className="px-2.5 py-0.5 bg-primary-100 text-primary-900 font-black text-xs rounded-full border border-primary-300">
              {readyFacilitiesCount} / {totalFacilitiesCount} Fasilitas Prima
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Pengelolaan inventaris aset fasilitas warga (Balai Warga, Lapangan Olahraga, Kolam Renang, Musholla), sistem booking peminjaman acara, jadwal servis berkala, dan tim teknisi sarana.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportFacilitiesCSV}
            className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Ekspor Data (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddBookingModal(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Catat Booking Sarana</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddFacility}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Fasilitas Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Total Sarana & Fasilitas</span>
          <p className="text-2xl font-black text-primary-700 mt-1 tabular-nums">
            {totalFacilitiesCount} <span className="text-xs font-normal text-ink-muted">Aset Terdata</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">{readyFacilitiesCount} Kondisi Siap Pakai</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Reservasi & Booking Aktif</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
            {activeBookingsCount} <span className="text-xs font-normal text-ink-muted">Jadwal Acara</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Balai Warga & Lapangan Olahraga</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Proyek Maintenance Berjalan</span>
          <p className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
            {activeMaintenanceCount} <span className="text-xs font-normal text-ink-muted">Pekerjaan</span>
          </p>
          <span className="text-[10px] text-amber-600 font-bold">Servis Pompa, Cat & Lampu PJU</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] text-ink-muted font-bold block">Tim Teknisi Sarana Siaga</span>
          <p className="text-2xl font-black text-purple-700 mt-1 tabular-nums">
            {staffList.length} <span className="text-xs font-normal text-ink-muted">Petugas & Mitra</span>
          </p>
          <span className="text-[10px] text-purple-600 font-bold">Teknisi Listrik, Sipil & Pompa</span>
        </div>
      </div>

      {/* 4 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'facilities', label: 'Inventaris Sarana & Fasilitas', icon: Building2, count: totalFacilitiesCount },
          { id: 'bookings', label: 'Peminjaman & Booking Sarana Warga', icon: Calendar, count: activeBookingsCount },
          { id: 'maintenance', label: 'Jadwal Pemeliharaan & Perbaikan', icon: Wrench, count: activeMaintenanceCount },
          { id: 'staff', label: 'Tim Teknisi & Petugas Fasum', icon: Users, count: staffList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
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

      {/* ================= SUBTAB 1: INVENTARIS FASILITAS ================= */}
      {activeSubTab === 'facilities' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Floating Bulk Action Bar */}
          {selectedFacilityIds.length > 0 && (
            <div className="p-3.5 bg-primary-50 border border-primary-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedFacilityIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-primary-950">
                    {selectedFacilityIds.length} Fasilitas Umum Terpilih
                  </p>
                  <p className="text-[11px] text-primary-700">
                    Pilih aksi massal untuk sarana yang telah diceklis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacilityIds([])}
                  className="px-3.5 py-2 rounded-xl border border-primary-200 bg-surface text-ink text-xs font-bold hover:bg-canvas"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  disabled={bulkProcessing}
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
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
                placeholder="Cari fasilitas, kode, lokasi, penanggung jawab..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kategori ({facilities.length})</option>
                <option value="BALAI_WARGA">Balai Warga</option>
                <option value="OLAHRAGA">Lapangan Olahraga</option>
                <option value="KOLAM_RENANG">Kolam Renang</option>
                <option value="IBADAH">Musholla / Ibadah</option>
                <option value="TAMAN">Taman & Playground</option>
                <option value="KEAMANAN_PJU">Barrier Gate & PJU</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Kondisi</option>
                <option value="GOOD">Kondisi Prima (Baik)</option>
                <option value="NEEDS_REPAIR">Perlu Servis</option>
                <option value="UNDER_MAINTENANCE">Dalam Perbaikan</option>
                <option value="DAMAGED">Rusak</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="code">Urut Kode</option>
                <option value="name">Urut Nama</option>
                <option value="capacity">Urut Kapasitas</option>
                <option value="condition">Urut Kondisi</option>
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

          {/* Grid of Facility Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {filteredFacilities.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-ink-muted font-medium bg-surface rounded-3xl border border-border">
                <Building2 className="w-10 h-10 text-primary-400 mx-auto mb-2 opacity-60" />
                Tidak ada fasilitas yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              filteredFacilities.map((fac) => {
                const isSelected = selectedFacilityIds.includes(fac.id);
                return (
                  <div
                    key={fac.id}
                    className={`p-5 bg-surface rounded-3xl border transition-all shadow-card space-y-3 relative overflow-hidden ${
                      isSelected ? 'border-primary-500 ring-2 ring-primary-300' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedFacilityIds(prev =>
                              prev.includes(fac.id) ? prev.filter(id => id !== fac.id) : [...prev, fac.id]
                            );
                          }}
                          className="mt-1 rounded border-border text-primary-600"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200">
                              {fac.code}
                            </span>
                            <span className="text-[10px] text-ink-muted font-semibold">
                              {fac.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-ink mt-1">{fac.name}</h3>
                          <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary-600 shrink-0" />
                            <span>{fac.location}</span>
                          </p>
                        </div>
                      </div>

                      {getConditionBadge(fac.condition)}
                    </div>

                    {/* Facility Specs Info */}
                    <div className="p-3 bg-canvas rounded-2xl border border-border/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-ink-muted block text-[10px]">Kapasitas:</span>
                        <strong className="text-ink">{fac.capacity || 0} Orang</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[10px]">Jam Operasional:</span>
                        <strong className="text-ink">{fac.operatingHours || '06:00 - 22:00'}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[10px]">Tarif Sewa Warga:</span>
                        <strong className="text-emerald-700">{fac.hourlyRate ? formatRupiah(fac.hourlyRate) : 'GRATIS / FREE'}</strong>
                      </div>
                    </div>

                    {fac.notes && (
                      <p className="text-[11px] text-ink-muted leading-relaxed italic bg-surface p-2.5 rounded-xl border border-border/60">
                        "{fac.notes}"
                      </p>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-primary-700 font-semibold">
                        PIC: <strong>{fac.picName}</strong>
                      </span>

                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setBkgFacilityId(fac.id);
                            setShowAddBookingModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          <span>Booking</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditFacility(fac)}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold"
                          title="Edit Fasilitas"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFacilityToDelete(fac)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold"
                          title="Hapus Fasilitas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: PEMINJAMAN & BOOKING ================= */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Daftar Peminjaman & Booking Sarana oleh Warga
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Kelola izin pemakaian Balai Warga, Lapangan Tenis/Futsal, dan fasilitas umum untuk acara syukuran, olahraga atau kegiatan RT/RW.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddBookingModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Reservasi Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas text-ink-muted font-bold">
                    <th className="py-3 px-4">No. Booking & Tanggal</th>
                    <th className="py-3 px-4">Fasilitas yang Dipinjam</th>
                    <th className="py-3 px-4">Pemohon & Unit Rumah</th>
                    <th className="py-3 px-4">Waktu Pemakaian</th>
                    <th className="py-3 px-4">Keperluan Acara</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-primary-700 block">{b.bookingNumber}</span>
                        <span className="text-[10px] text-ink-muted font-mono">{b.date}</span>
                      </td>

                      <td className="py-3 px-4 font-bold text-ink">
                        {b.facilityName}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-ink block">{b.residentName}</span>
                        <span className="text-[10px] text-primary-700 font-bold">Rumah {b.propertyCode} • {b.phone}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-ink">
                        ⏰ {b.startTime} - {b.endTime} WIB
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="text-ink font-medium truncate" title={b.purpose}>{b.purpose}</p>
                        {b.depositAmount > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            Deposit: {formatRupiah(b.depositAmount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                          b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          b.status === 'PENDING' ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse' :
                          b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status === 'APPROVED' ? '✓ DISETUJUI' : b.status === 'PENDING' ? '⏳ MENUNGGU APPROVAL' : b.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {b.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                            >
                              Setujui
                            </button>
                          )}
                          {b.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg font-bold text-[10px]"
                            >
                              Selesai
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const content = `SURAT IZIN PEMINJAMAN FASILITAS UMUM - WARGAHUB\n===================================================\nNo. Booking: ${b.bookingNumber}\nFasilitas: ${b.facilityName}\nNama Pemohon: ${b.residentName} (Rumah ${b.propertyCode})\nKontak: ${b.phone}\nTanggal Pemakaian: ${b.date}\nWaktu: ${b.startTime} - ${b.endTime} WIB\nKeperluan Acara: ${b.purpose}\nUang Jaminan/Deposit: ${formatRupiah(b.depositAmount)}\nStatus: ${b.status}\nDisetujui Oleh: ${b.approvedBy || 'Pengurus Komplek'}\n\nCatatan: Pemohon wajib menjaga kebersihan dan ketertiban fasilitas umum.\nDicetak pada: ${new Date().toLocaleString('id-ID')}`;
                              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `SURAT_IZIN_BOOKING_${b.bookingNumber}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                              showToast(`Surat izin booking ${b.bookingNumber} berhasil diunduh.`);
                            }}
                            className="p-1.5 hover:bg-canvas text-ink-muted rounded-lg font-bold"
                            title="Cetak Surat Izin Booking"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: JADWAL PEMELIHARAAN & PERBAIKAN ================= */}
      {activeSubTab === 'maintenance' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  Jadwal Pemeliharaan, Servis & Perbaikan Sarana
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Pantau proyek pemeliharaan rutin, penggantian suku cadang mesin pompa, perbaikan lampu PJU, dan renovasi fisik fasum.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMaintenanceModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Jadwal Maintenance</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintenanceList.map((m) => (
                <div key={m.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {m.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                      m.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-900 animate-pulse' :
                      m.status === 'PLANNED' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {m.status === 'RESOLVED' ? '✓ SELESAI' : m.status === 'IN_PROGRESS' ? '🔧 SEDANG DIKERJAKAN' : m.status === 'PLANNED' ? 'TERJADWAL' : 'DITOLAK'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-ink">{m.title}</h4>
                    <p className="text-primary-700 font-bold mt-0.5">📍 {m.facilityName} ({m.location})</p>
                    <p className="text-ink-muted mt-1 leading-relaxed">{m.description}</p>
                  </div>

                  <div className="p-2.5 bg-surface rounded-xl border border-border space-y-1">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Pelaksana / Teknisi:</span>
                      <span className="font-bold text-ink">{m.performedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Estimasi Biaya:</span>
                      <span className="font-mono font-bold text-ink">{formatRupiah(m.costEstimate)}</span>
                    </div>
                    {m.actualCost > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-border">
                        <span>Realisasi Biaya:</span>
                        <span className="font-mono">{formatRupiah(m.actualCost)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-ink-muted font-mono">Jadwal: {m.scheduledDate}</span>

                    <div className="inline-flex items-center gap-1.5">
                      {m.status === 'PLANNED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateMaintenanceStatus(m.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Mulai Kerja
                        </button>
                      )}
                      {m.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateMaintenanceStatus(m.id, 'RESOLVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {m.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateMaintenanceStatus(m.id, 'REJECTED')}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-200"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: TIM TEKNISI & PETUGAS FASUM ================= */}
      {activeSubTab === 'staff' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Tim Teknisi & Mitra Pemeliharaan Sarana Komplek
                </h3>
                <p className="text-ink-muted mt-0.5">
                  Daftar tenaga teknis listrik, genset, tukang bangunan, pemelihara kolam, dan nomor kontak darurat perbaikan fasum.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Teknisi Mitra</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffList.map((stf) => (
                <div key={stf.id} className="p-4 bg-canvas rounded-2xl border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {stf.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      stf.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {stf.status === 'AVAILABLE' ? '✓ SIAGA' : 'SEDANG BERTUGAS'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-ink">{stf.name}</h4>
                    <p className="text-purple-700 font-bold mt-0.5">{stf.role}</p>
                    <p className="text-ink-muted text-[11px] mt-1 leading-relaxed">
                      Keahlian: <strong>{stf.specialty}</strong>
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface rounded-xl border border-border flex items-center justify-between">
                    <a
                      href={`https://wa.me/${stf.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-purple-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3.5 h-3.5 text-purple-600" />
                      <span>{stf.phone}</span>
                    </a>

                    <a
                      href={`https://wa.me/${stf.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Pak ${stf.name}, mohon bantuan terkait perbaikan fasilitas umum komplek. Terima kasih.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]"
                    >
                      Hubungi WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT FASILITAS ================= */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                <span>{editingFacilityId ? 'Edit Data Fasilitas Sarana' : 'Tambah Fasilitas Baru'}</span>
              </h3>
              <button onClick={() => setShowAddFacilityModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Fasilitas / Sarana *</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung Balai Warga Serbaguna"
                  value={formFacName}
                  onChange={(e) => setFormFacName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kode Fasilitas *</label>
                  <input
                    type="text"
                    placeholder="FAS-BW-01"
                    value={formFacCode}
                    onChange={(e) => setFormFacCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Kategori Sarana *</label>
                  <select
                    value={formFacCategory}
                    onChange={(e) => setFormFacCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="BALAI_WARGA">Balai Warga</option>
                    <option value="OLAHRAGA">Lapangan Olahraga</option>
                    <option value="KOLAM_RENANG">Kolam Renang</option>
                    <option value="IBADAH">Musholla / Ibadah</option>
                    <option value="TAMAN">Taman & Playground</option>
                    <option value="KEAMANAN_PJU">Keamanan & PJU</option>
                    <option value="INFRASTRUKTUR">Infrastruktur Lingkungan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi di Dalam Komplek *</label>
                <input
                  type="text"
                  placeholder="Contoh: Depan Taman Blok B & Club House"
                  value={formFacLocation}
                  onChange={(e) => setFormFacLocation(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Kapasitas Maksimal (Orang)</label>
                  <input
                    type="number"
                    value={formFacCapacity}
                    onChange={(e) => setFormFacCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tarif Sewa (Rp / Jam - 0 jika Gratis)</label>
                  <input
                    type="number"
                    value={formFacRate}
                    onChange={(e) => setFormFacRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    placeholder="06:00 - 22:00 WIB"
                    value={formFacHours}
                    onChange={(e) => setFormFacHours(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Kondisi Fasilitas</label>
                  <select
                    value={formFacCondition}
                    onChange={(e) => setFormFacCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="GOOD">Kondisi Prima (Baik)</option>
                    <option value="NEEDS_REPAIR">Perlu Servis / Perbaikan</option>
                    <option value="UNDER_MAINTENANCE">Dalam Perawatan</option>
                    <option value="DAMAGED">Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Penanggung Jawab / PIC</label>
                <input
                  type="text"
                  placeholder="Hendro Siswanto"
                  value={formFacPic}
                  onChange={(e) => setFormFacPic(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi & Fasilitas Pendukung</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dilengkapi pendingin AC, sound system, 80 kursi lipat..."
                  value={formFacNotes}
                  onChange={(e) => setFormFacNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFacilityModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Fasilitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT RESERVASI BOOKING ================= */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Catat Reservasi / Booking Fasilitas</span>
              </h3>
              <button onClick={() => setShowAddBookingModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Pilih Fasilitas *</label>
                <select
                  value={bkgFacilityId}
                  onChange={(e) => setBkgFacilityId(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Rumah Pemohon *</label>
                  <input
                    type="text"
                    placeholder="A-17"
                    value={bkgPropertyCode}
                    onChange={(e) => setBkgPropertyCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    value={bkgResidentName}
                    onChange={(e) => setBkgResidentName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">No. WhatsApp Pemohon *</label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={bkgPhone}
                  onChange={(e) => setBkgPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={bkgDate}
                    onChange={(e) => setBkgDate(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    value={bkgStartTime}
                    onChange={(e) => setBkgStartTime(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    value={bkgEndTime}
                    onChange={(e) => setBkgEndTime(e.target.value)}
                    required
                    className="w-full p-2 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Keperluan Acara *</label>
                <input
                  type="text"
                  placeholder="Contoh: Syukuran Ulang Tahun / Arisan Warga"
                  value={bkgPurpose}
                  onChange={(e) => setBkgPurpose(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Uang Jaminan Kebersihan (Rp - Jika Ada)</label>
                <input
                  type="number"
                  value={bkgDeposit}
                  onChange={(e) => setBkgDeposit(Number(e.target.value))}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Setujui & Buat Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH MAINTENANCE ================= */}
      {showAddMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Tambah Jadwal Pemeliharaan Fasum</span>
              </h3>
              <button onClick={() => setShowAddMaintenanceModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-3">
              <div>
                <label className="font-bold text-ink block mb-1">Judul Pekerjaan Pemeliharaan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Servis Pompa Kolam / Ganti Lampu PJU"
                  value={mntTitle}
                  onChange={(e) => setMntTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Fasilitas Target *</label>
                <select
                  value={mntFacilityId}
                  onChange={(e) => {
                    setMntFacilityId(e.target.value);
                    const f = facilities.find(item => item.id === e.target.value);
                    if (f) setMntLocation(f.location);
                  }}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Estimasi Biaya (Rp)</label>
                  <input
                    type="number"
                    value={mntCostEstimate}
                    onChange={(e) => setMntCostEstimate(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Prioritas</label>
                  <select
                    value={mntPriority}
                    onChange={(e) => setMntPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="ROUTINE">Rutin Berkala</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi / Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Rencana *</label>
                  <input
                    type="date"
                    value={mntScheduledDate}
                    onChange={(e) => setMntScheduledDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Pelaksana / Teknisi</label>
                  <input
                    type="text"
                    value={mntPerformedBy}
                    onChange={(e) => setMntPerformedBy(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Rincian Deskripsi Pekerjaan</label>
                <textarea
                  rows={2}
                  value={mntDesc}
                  onChange={(e) => setMntDesc(e.target.value)}
                  placeholder="Keterangan perbaikan dan penggantian suku cadang..."
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaintenanceModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH TEKNISI MITRA ================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Tambah Teknisi / Petugas Fasum Mitra</span>
              </h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newStf: FacilityStaff = {
                  id: `STF-FAC-${Date.now().toString().slice(-3)}`,
                  name: stfName,
                  role: stfRole,
                  specialty: stfSpecialty,
                  phone: stfPhone,
                  status: 'AVAILABLE',
                  assignedProjectsCount: 0,
                  notes: stfNotes,
                };
                const updated = [newStf, ...staffList];
                setStaffList(updated);
                savePersisted('wargahub_facility_staff', updated);
                showToast(`Teknisi mitra ${stfName} berhasil dicatat.`);
                setShowAddStaffModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap Teknisi *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Suparman"
                  value={stfName}
                  onChange={(e) => setStfName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Posisi / Peran *</label>
                <input
                  type="text"
                  placeholder="Teknisi Listrik / Tukang Cat"
                  value={stfRole}
                  onChange={(e) => setStfRole(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Spesialisasi Keahlian *</label>
                <input
                  type="text"
                  placeholder="Genset, AC, Pompa Kolam, Perbaikan Atap..."
                  value={stfSpecialty}
                  onChange={(e) => setStfSpecialty(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">No. WhatsApp *</label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={stfPhone}
                  onChange={(e) => setStfPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                >
                  Simpan Teknisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS FASILITAS ================= */}
      {facilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus Fasilitas {facilityToDelete.name}?</h3>
              <p className="text-ink-muted">
                Data sarana umum <strong>{facilityToDelete.code}</strong> akan dihapus permanen dari inventaris fasilitas komplek.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFacilityToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFacility}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Fasilitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL FASILITAS ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-ink">Hapus {selectedFacilityIds.length} Fasilitas Terpilih?</h3>
              <p className="text-ink-muted">
                Sebanyak <strong>{selectedFacilityIds.length} fasilitas sarana</strong> yang telah diceklis akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkProcessing ? 'Menghapus...' : `Ya, Hapus (${selectedFacilityIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
