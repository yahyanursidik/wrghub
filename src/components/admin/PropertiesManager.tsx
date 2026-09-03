import React, { useState, useMemo } from 'react';
import {
  Home,
  Users,
  UserCheck,
  Car,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Download,
  Hammer,
  Building2,
  Zap,
  Droplets,
  BadgeCheck,
  QrCode,
  Phone,
  MessageCircle,
  Layers,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  MapPin,
  Compass,
  UserPlus,
  Heart,
  Briefcase,
  CreditCard,
  Mail,
  Activity,
  KeyRound,
  ShieldAlert,
  Printer,
  HardHat,
  CheckSquare,
  Square,
  Ban,
  Receipt,
  Gauge,
  Sun,
  Leaf,
  Trash,
  Check
} from 'lucide-react';
import type { PropertyListItem } from '../../services/property.service';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface PropertiesManagerProps {
  initialProperties: PropertyListItem[];
  initialTab?: string;
}

const PropertiesManagerInner: React.FC<PropertiesManagerProps> = ({
  initialProperties = [],
  initialTab = 'units'
}) => {
  const resolveTab = (t: string): 'units' | 'residents' | 'vehicles' | 'permits' | 'analytics' => {
    if (t === 'occupants' || t === 'residents' || t === 'owners') return 'residents';
    if (t === 'vehicles' || t === 'rfid') return 'vehicles';
    if (t === 'permits' || t === 'renovation') return 'permits';
    if (t === 'analytics' || t === 'utilities' || t === 'occupancy') return 'analytics';
    return 'units';
  };

  const [activeSubTab, setActiveSubTab] = useState<'units' | 'residents' | 'vehicles' | 'permits' | 'analytics'>(resolveTab(initialTab));
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [properties, setProperties] = useState<PropertyListItem[]>(initialProperties || []);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'owner' | 'status' | 'residents'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Property Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Property Checkbox Selection & Bulk Delete State
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Resident Checkbox Selection & Bulk Delete State
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [showBulkDeleteResidentModal, setShowBulkDeleteResidentModal] = useState(false);
  const [bulkDeletingResident, setBulkDeletingResident] = useState(false);

  // Property Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyListItem | null>(null);
  const [detailTab, setDetailTab] = useState<'specs' | 'occupants' | 'vehicles' | 'permits' | 'utilities'>('specs');

  // Area Naming Type
  const [namingType, setNamingType] = useState<'BLOK' | 'KAV' | 'STREET' | 'CLUSTER'>('BLOK');
  const [formAreaName, setFormAreaName] = useState('Blok A');
  const [formCode, setFormCode] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOccupancy, setFormOccupancy] = useState<'OWNER_OCCUPIED' | 'RENTED' | 'VACANT' | 'RENOVATION'>('OWNER_OCCUPIED');
  const [formOwner, setFormOwner] = useState('');
  const [formBuildingType, setFormBuildingType] = useState('Tipe 72/120');
  const [formLandArea, setFormLandArea] = useState(120);
  const [formBuildingArea, setFormBuildingArea] = useState(72);
  const [formPlnCapacity, setFormPlnCapacity] = useState('3.500 VA');
  const [formPamMeterNo, setFormPamMeterNo] = useState('PAM-88301');
  const [formMonthlyRate, setFormMonthlyRate] = useState(750000);
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal State (Property)
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Renovasi Penggabungan Unit / Koreksi Data');
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper for saving persisted state to localStorage
  const savePersisted = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
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

  // Synchronize persisted changes from localStorage on client load
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const deletedPropsStr = localStorage.getItem('wargahub_deleted_properties');
        if (deletedPropsStr) {
          const deletedIds: string[] = JSON.parse(deletedPropsStr);
          if (Array.isArray(deletedIds) && deletedIds.length > 0) {
            setProperties(prev => prev.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.code)));
          }
        }

        const savedResidents = localStorage.getItem('wargahub_residents');
        const deletedResStr = localStorage.getItem('wargahub_deleted_residents');
        const deletedResIds: string[] = deletedResStr ? JSON.parse(deletedResStr) : [];
        if (savedResidents !== null) {
          const parsed = JSON.parse(savedResidents);
          if (Array.isArray(parsed)) {
            setResidents(parsed.filter((r: any) => !deletedResIds.includes(r.id) && !deletedResIds.includes(r.fullName)));
          }
        } else if (deletedResIds.length > 0) {
          setResidents(prev => prev.filter(r => !deletedResIds.includes(r.id) && !deletedResIds.includes(r.fullName)));
        }

        const savedVehicles = localStorage.getItem('wargahub_vehicles');
        const deletedVehStr = localStorage.getItem('wargahub_deleted_vehicles');
        const deletedVehIds: string[] = deletedVehStr ? JSON.parse(deletedVehStr) : [];
        if (savedVehicles !== null) {
          const parsed = JSON.parse(savedVehicles);
          if (Array.isArray(parsed)) {
            setVehicles(parsed.filter((v: any) => !deletedVehIds.includes(v.id) && !deletedVehIds.includes(v.plateNumber)));
          }
        } else if (deletedVehIds.length > 0) {
          setVehicles(prev => prev.filter(v => !deletedVehIds.includes(v.id) && !deletedVehIds.includes(v.plateNumber)));
        }

        const savedPermits = localStorage.getItem('wargahub_permits');
        const deletedPermitStr = localStorage.getItem('wargahub_deleted_permits');
        const deletedPermitIds: string[] = deletedPermitStr ? JSON.parse(deletedPermitStr) : [];
        if (savedPermits !== null) {
          const parsed = JSON.parse(savedPermits);
          if (Array.isArray(parsed)) {
            setPermits(parsed.filter((p: any) => !deletedPermitIds.includes(p.id)));
          }
        } else if (deletedPermitIds.length > 0) {
          setPermits(prev => prev.filter(p => !deletedPermitIds.includes(p.id)));
        }

        const savedUtilities = localStorage.getItem('wargahub_utilities');
        const deletedUtilStr = localStorage.getItem('wargahub_deleted_utilities');
        const deletedUtilIds: string[] = deletedUtilStr ? JSON.parse(deletedUtilStr) : [];
        if (savedUtilities !== null) {
          const parsed = JSON.parse(savedUtilities);
          if (Array.isArray(parsed)) {
            setUtilities(parsed.filter((u: any) => !deletedUtilIds.includes(u.id) && !deletedUtilIds.includes(u.houseCode)));
          }
        } else if (deletedUtilIds.length > 0) {
          setUtilities(prev => prev.filter(u => !deletedUtilIds.includes(u.id) && !deletedUtilIds.includes(u.houseCode)));
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }
  }, []);

  // ================= RESIDENTS (PENGHUNI) STATE =================
  const [residentCategory, setResidentCategory] = useState('ALL');
  const [residentSearch, setResidentSearch] = useState('');
  const [residentSortBy, setResidentSortBy] = useState<'fullName' | 'houseCode' | 'relation' | 'occupation' | 'idCard'>('houseCode');
  const [residentSortOrder, setResidentSortOrder] = useState<'asc' | 'desc'>('asc');
  const [residentCurrentPage, setResidentCurrentPage] = useState(1);
  const [residentPageSize, setResidentPageSize] = useState(10);

  const [residents, setResidents] = useState([
    { id: 'res-1', houseCode: 'A-17', areaLabel: 'Blok A', fullName: 'Budi Santoso', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Jakarta, 12-03-1985', religion: 'ISLAM', occupation: 'Wiraswasta / IT Consultant', phone: '0812-3456-7890', email: 'budi.santoso@wargahub.id', idCard: '3171091203850001', familyCard: '3171091203850000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'O', isEmergency: true, status: 'VERIFIED', notes: 'Kepala Keluarga' },
    { id: 'res-2', houseCode: 'A-17', areaLabel: 'Blok A', fullName: 'Siti Lestari', relation: 'ISTRI', gender: 'PEREMPUAN', birthPlaceDate: 'Bandung, 25-07-1987', religion: 'ISLAM', occupation: 'Dokter Umum RSUD', phone: '0813-9876-5432', email: 'siti.lestari@wargahub.id', idCard: '3171092507870002', familyCard: '3171091203850000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'A', isEmergency: true, status: 'VERIFIED', notes: 'Tenaga Medis Warga' },
    { id: 'res-3', houseCode: 'A-17', areaLabel: 'Blok A', fullName: 'Alya Santoso', relation: 'ANAK', gender: 'PEREMPUAN', birthPlaceDate: 'Jakarta, 14-05-2013', religion: 'ISLAM', occupation: 'Pelajar SMP', phone: '-', email: 'alya.santoso@wargahub.id', idCard: '3171091405130003', familyCard: '3171091203850000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'O', isEmergency: false, status: 'VERIFIED', notes: '-' },
    { id: 'res-4', houseCode: 'A-17', areaLabel: 'Blok A', fullName: 'Daffa Santoso', relation: 'ANAK', gender: 'LAKI_LAKI', birthPlaceDate: 'Jakarta, 03-09-2017', religion: 'ISLAM', occupation: 'Pelajar SD', phone: '-', email: 'daffa.santoso@wargahub.id', idCard: '3171090309170004', familyCard: '3171091203850000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'A', isEmergency: false, status: 'VERIFIED', notes: '-' },
    { id: 'res-5', houseCode: 'A-01', areaLabel: 'Blok A', fullName: 'Hendra Gunawan', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Semarang, 01-01-1980', religion: 'KRISTEN', occupation: 'Eksekutif Perbankan', phone: '0811-2233-4455', email: 'hendra.gunawan@wargahub.id', idCard: '3171090101800001', familyCard: '3171090101800000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'B', isEmergency: true, status: 'VERIFIED', notes: 'Ketua Paguyuban Blok A' },
    { id: 'res-6', houseCode: 'A-01', areaLabel: 'Blok A', fullName: 'Maria Gunawan', relation: 'ISTRI', gender: 'PEREMPUAN', birthPlaceDate: 'Surabaya, 01-01-1982', religion: 'KRISTEN', occupation: 'Dosen Universitas', phone: '0811-2233-4456', email: 'maria.gunawan@wargahub.id', idCard: '3171090101820002', familyCard: '3171090101800000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'AB', isEmergency: true, status: 'VERIFIED', notes: '-' },
    { id: 'res-7', houseCode: 'B-07', areaLabel: 'Blok B', fullName: 'Agus Wijaya', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Yogyakarta, 07-07-1975', religion: 'ISLAM', occupation: 'Arsitek / Konsultan Properti', phone: '0818-7788-9900', email: 'agus.wijaya@wargahub.id', idCard: '3171090707750001', familyCard: '3171090707750000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'O', isEmergency: true, status: 'VERIFIED', notes: '-' },
    { id: 'res-8', houseCode: 'B-07', areaLabel: 'Blok B', fullName: 'Rina Wijaya', relation: 'ISTRI', gender: 'PEREMPUAN', birthPlaceDate: 'Solo, 07-07-1978', religion: 'ISLAM', occupation: 'Akuntan Publik', phone: '0818-7788-9901', email: 'rina.wijaya@wargahub.id', idCard: '3171090707780002', familyCard: '3171090707750000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'O', isEmergency: true, status: 'VERIFIED', notes: '-' },
    { id: 'res-9', houseCode: 'KAV-12', areaLabel: 'Kav. 12', fullName: 'Bambang Sutrisno', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Malang, 12-12-1968', religion: 'ISLAM', occupation: 'Pensiunan BUMN', phone: '0812-9988-1122', email: 'bambang.sutrisno@wargahub.id', idCard: '3171091212680001', familyCard: '3171091212680000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'A', isEmergency: true, status: 'VERIFIED', notes: 'Warga Lansia Prioritas' },
    { id: 'res-10', houseCode: 'SW1-05', areaLabel: 'Jl. Sariwangi Indah 1', fullName: 'Dr. Ratna Kusuma', relation: 'KEPALA_KELUARGA', gender: 'PEREMPUAN', birthPlaceDate: 'Denpasar, 05-05-1979', religion: 'HINDU', occupation: 'Dokter Spesialis Anak', phone: '0813-4455-6677', email: 'ratna.kusuma@wargahub.id', idCard: '3171090505790001', familyCard: '3171090505790000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'B', isEmergency: true, status: 'VERIFIED', notes: 'Dokter Jaga Kompleks' },
    { id: 'res-11', houseCode: 'SW2-14', areaLabel: 'Jl. Sariwangi Indah 2', fullName: 'Suryo Pranoto', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Cirebon, 14-04-1981', religion: 'ISLAM', occupation: 'Manajer Logistik', phone: '0815-6677-8899', email: 'suryo.pranoto@wargahub.id', idCard: '3171091414810001', familyCard: '3171091414810000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'AB', isEmergency: true, status: 'VERIFIED', notes: '-' },
    { id: 'res-12', houseCode: 'C-22', areaLabel: 'Blok C', fullName: 'Joko Widodo', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Surakarta, 22-02-1983', religion: 'ISLAM', occupation: 'Pengusaha Mebel', phone: '0819-0011-2233', email: 'joko.widodo@wargahub.id', idCard: '3171092222830001', familyCard: '3171092222830000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'O', isEmergency: true, status: 'VERIFIED', notes: '-' },
    { id: 'res-13', houseCode: 'A-17', areaLabel: 'Blok A', fullName: 'Mbok Darmi', relation: 'ART', gender: 'PEREMPUAN', birthPlaceDate: 'Kebumen, 10-10-1990', religion: 'ISLAM', occupation: 'Asisten Rumah Tangga', phone: '0857-1122-3344', email: '-', idCard: '3305091010900005', familyCard: '-', domicileStatus: 'KTP_LUAR', bloodType: 'B', isEmergency: false, status: 'VERIFIED', notes: 'Tinggal Dalam' },
  ]);

  // Resident Form Modal State
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<string | null>(null);
  const [activeResidentView, setActiveResidentView] = useState<any>(null);
  const [residentToDelete, setResidentToDelete] = useState<any>(null);
  const [residentDeleteReason, setResidentDeleteReason] = useState('Pindah Domisili Keluar Komplek');

  // Resident Form Fields
  const [resHouseCode, setResHouseCode] = useState('A-17');
  const [resAreaLabel, setResAreaLabel] = useState('Blok A');
  const [resFullName, setResFullName] = useState('');
  const [resRelation, setResRelation] = useState('KEPALA_KELUARGA');
  const [resGender, setResGender] = useState('LAKI_LAKI');
  const [resBirthPlaceDate, setResBirthPlaceDate] = useState('Jakarta, 12-03-1985');
  const [resReligion, setResReligion] = useState('ISLAM');
  const [resOccupation, setResOccupation] = useState('Karyawan Swasta');
  const [resPhone, setResPhone] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resIdCard, setResIdCard] = useState('');
  const [resFamilyCard, setResFamilyCard] = useState('');
  const [resDomicileStatus, setResDomicileStatus] = useState('KTP_SETEMPAT');
  const [resBloodType, setResBloodType] = useState('O');
  const [resIsEmergency, setResIsEmergency] = useState(false);
  const [resNotes, setResNotes] = useState('');
  const [resSaving, setResSaving] = useState(false);

  // ================= VEHICLES & RFID STATE =================
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [vehicleRfidFilter, setVehicleRfidFilter] = useState('ALL');
  const [vehicleSortBy, setVehicleSortBy] = useState<'plateNumber' | 'houseCode' | 'type' | 'brand' | 'rfidStatus'>('plateNumber');
  const [vehicleSortOrder, setVehicleSortOrder] = useState<'asc' | 'desc'>('asc');
  const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);
  const [vehiclePageSize, setVehiclePageSize] = useState(10);

  const [vehicles, setVehicles] = useState([
    { id: 'veh-1', houseCode: 'A-17', areaLabel: 'Blok A', ownerName: 'Budi Santoso', plateNumber: 'B 1234 ABC', type: 'Mobil', brand: 'Toyota', model: 'Avanza Veloz', year: 2023, color: 'Hitam Metalik', rfidTag: 'RFID-8830192', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Parkir dalam garasi unit' },
    { id: 'veh-2', houseCode: 'A-17', areaLabel: 'Blok A', ownerName: 'Siti Lestari', plateNumber: 'B 5678 DEF', type: 'Motor', brand: 'Honda', model: 'Vario 160', year: 2024, color: 'Putih Mutiara', rfidTag: 'RFID-8830193', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Motor operasional dokter' },
    { id: 'veh-3', houseCode: 'A-01', areaLabel: 'Blok A', ownerName: 'Hendra Gunawan', plateNumber: 'B 9999 HG', type: 'Mobil', brand: 'Honda', model: 'CR-V Turbo', year: 2024, color: 'Abu-Abu', rfidTag: 'RFID-7720194', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Mobil dinas perbankan' },
    { id: 'veh-4', houseCode: 'B-07', areaLabel: 'Blok B', ownerName: 'Agus Wijaya', plateNumber: 'B 8888 AW', type: 'Mobil', brand: 'Mitsubishi', model: 'Pajero Sport', year: 2022, color: 'Putih', rfidTag: 'RFID-6610195', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-5', houseCode: 'B-07', areaLabel: 'Blok B', ownerName: 'Rina Wijaya', plateNumber: 'B 7777 WZ', type: 'Motor', brand: 'Yamaha', model: 'NMAX 155', year: 2023, color: 'Hitam Doff', rfidTag: 'RFID-6610196', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-6', houseCode: 'KAV-12', areaLabel: 'Kav. 12', ownerName: 'Bambang Sutrisno', plateNumber: 'B 1111 BS', type: 'Mobil', brand: 'Toyota', model: 'Innova Zenix Hybrid', year: 2024, color: 'Silver Metalik', rfidTag: 'RFID-5540197', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Prioritas akses gate' },
    { id: 'veh-7', houseCode: 'SW1-05', areaLabel: 'Jl. Sariwangi Indah 1', ownerName: 'Dr. Ratna Kusuma', plateNumber: 'B 2222 RK', type: 'Mobil', brand: 'Hyundai', model: 'IONIQ 5 EV', year: 2024, color: 'Gravity Gold', rfidTag: 'RFID-4430198', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Kendaraan listrik ramah lingkungan' },
    { id: 'veh-8', houseCode: 'SW2-14', areaLabel: 'Jl. Sariwangi Indah 2', ownerName: 'Suryo Pranoto', plateNumber: 'B 3333 SP', type: 'Mobil', brand: 'Wuling', model: 'Air EV Long Range', year: 2023, color: 'Peach Pink', rfidTag: 'RFID-3320199', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-9', houseCode: 'C-22', areaLabel: 'Blok C', ownerName: 'Joko Widodo', plateNumber: 'B 4444 JW', type: 'Mobil', brand: 'Toyota', model: 'Fortuner GR Sport', year: 2023, color: 'Hitam', rfidTag: 'RFID-2210200', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-10', houseCode: 'D-03', areaLabel: 'Blok D', ownerName: 'Rahmat Hidayat', plateNumber: 'B 6677 RH', type: 'Motor', brand: 'Honda', model: 'PCX 160', year: 2024, color: 'Merah Doff', rfidTag: 'RFID-1100201', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-11', houseCode: 'D-19', areaLabel: 'Blok D', ownerName: 'Fajar Nugraha', plateNumber: 'B 9876 FJ', type: 'Mobil', brand: 'Daihatsu', model: 'Rocky 1.0T', year: 2023, color: 'Kuning Metalik', rfidTag: 'RFID-9980202', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: '-' },
    { id: 'veh-12', houseCode: 'A-05', areaLabel: 'Blok A', ownerName: 'Eko Prasetyo', plateNumber: 'B 7890 EK', type: 'Sepeda Listrik', brand: 'Uwinfly', model: 'T3 Pro E-Bike', year: 2024, color: 'Biru Pastel', rfidTag: 'RFID-8870203', gateAccess: 'SEMUA_GERBANG', rfidStatus: 'AKTIF', notes: 'Lane khusus jalur sepeda' },
  ]);

  // Vehicle Form Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [activeVehicleView, setActiveVehicleView] = useState<any>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);
  const [vehicleDeleteReason, setVehicleDeleteReason] = useState('Kendaraan Dijual / Diganti');

  // Vehicle Checkbox Selection & Bulk Delete State
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [showBulkDeleteVehicleModal, setShowBulkDeleteVehicleModal] = useState(false);
  const [bulkDeletingVehicle, setBulkDeletingVehicle] = useState(false);

  // Vehicle Form Fields
  const [vehHouseCode, setVehHouseCode] = useState('A-17');
  const [vehAreaLabel, setVehAreaLabel] = useState('Blok A');
  const [vehOwnerName, setVehOwnerName] = useState('Budi Santoso');
  const [vehPlateNumber, setVehPlateNumber] = useState('');
  const [vehType, setVehType] = useState('Mobil');
  const [vehBrand, setVehBrand] = useState('Toyota');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState(2024);
  const [vehColor, setVehColor] = useState('Hitam Metalik');
  const [vehRfidTag, setVehRfidTag] = useState('');
  const [vehGateAccess, setVehGateAccess] = useState('SEMUA_GERBANG');
  const [vehRfidStatus, setVehRfidStatus] = useState<'AKTIF' | 'DIBLOKIR' | 'PENDING_VERIFIKASI'>('AKTIF');
  const [vehNotes, setVehNotes] = useState('');
  const [vehSaving, setVehSaving] = useState(false);
  const [selectedPassVehicle, setSelectedPassVehicle] = useState<any>(null);

  // ================= PERMITS & CONTRACTOR STATE =================
  const [permitSearch, setPermitSearch] = useState('');
  const [permitStatusFilter, setPermitStatusFilter] = useState('ALL');
  const [permitTypeFilter, setPermitTypeFilter] = useState('ALL');
  const [permitSortBy, setPermitSortBy] = useState<'id' | 'houseCode' | 'workType' | 'contractorName' | 'status' | 'startDate'>('startDate');
  const [permitSortOrder, setPermitSortOrder] = useState<'asc' | 'desc'>('desc');
  const [permitCurrentPage, setPermitCurrentPage] = useState(1);
  const [permitPageSize, setPermitPageSize] = useState(10);

  const [permits, setPermits] = useState([
    {
      id: 'PERMIT-2026-001',
      houseCode: 'A-17',
      areaLabel: 'Blok A',
      ownerName: 'Budi Santoso',
      workType: 'Pengecatan & Kanopi',
      contractorName: 'Bpk. Sugeng (CV Berkah)',
      contractorPhone: '0812-3344-5566',
      workersCount: 3,
      workersList: '1. Sugeng (Mandor), 2. Slamet (Tukang Cat), 3. Joko (Las Kanopi)',
      startDate: '2026-08-25',
      endDate: '2026-09-05',
      allowedHours: '08:00 - 17:00 WIB (Senin - Sabtu)',
      status: 'APPROVED',
      description: 'Pengecatan fasad luar dan perbaikan talang air kanopi garasi.',
    },
    {
      id: 'PERMIT-2026-002',
      houseCode: 'SW1-12',
      areaLabel: 'Jl. Sariwangi Indah 1',
      ownerName: 'Ibu Ratna',
      workType: 'Renovasi Interior & Dapur',
      contractorName: 'Bpk. Yanto (Mandor Sejahtera)',
      contractorPhone: '0813-8877-6655',
      workersCount: 4,
      workersList: '1. Yanto, 2. Agus, 3. Maman, 4. Dedi',
      startDate: '2026-08-20',
      endDate: '2026-09-15',
      allowedHours: '08:00 - 17:00 WIB (Senin - Sabtu)',
      status: 'APPROVED',
      description: 'Pemasangan keramik dinding dapur dan penutupan dak jemuran belakang.',
    },
    {
      id: 'PERMIT-2026-003',
      houseCode: 'KAV-05',
      areaLabel: 'Kav. 05',
      ownerName: 'Bpk. Hendra Gunawan',
      workType: 'Perbaikan Atap & Dak Bocor',
      contractorName: 'Bpk. Maman Jaya',
      contractorPhone: '0815-1122-3344',
      workersCount: 2,
      workersList: '1. Maman, 2. Ujang',
      startDate: '2026-08-28',
      endDate: '2026-09-02',
      allowedHours: '08:00 - 17:00 WIB (Senin - Sabtu)',
      status: 'PENDING_REVIEW',
      description: 'Pergantian 15 genteng pecah di atap lantai 2 dan waterproofing talang.',
    },
    {
      id: 'PERMIT-2026-004',
      houseCode: 'D-19',
      areaLabel: 'Blok D',
      ownerName: 'Bpk. Suryo Pranoto',
      workType: 'Pemasangan Solar Panel',
      contractorName: 'PT Surya Nusantara Mandiri',
      contractorPhone: '0811-9988-7766',
      workersCount: 5,
      workersList: '1. Ir. Doni (Engineer), 2. Rudi, 3. Budi, 4. Tono, 5. Hendro',
      startDate: '2026-08-15',
      endDate: '2026-08-27',
      allowedHours: '08:00 - 17:00 WIB (Senin - Sabtu)',
      status: 'COMPLETED',
      description: 'Pemasangan 8 unit panel surya on-grid di atas dak genteng rumah.',
    },
    {
      id: 'PERMIT-2026-005',
      houseCode: 'B-04',
      areaLabel: 'Blok B',
      ownerName: 'Bpk. Agus Wijaya',
      workType: 'Pembangunan Tingkat / Ekstensi',
      contractorName: 'CV Bangun Prima Mandiri',
      contractorPhone: '0818-4455-6677',
      workersCount: 6,
      workersList: '1. Mandor Joko, 2. Aris, 3. Bayu, 4. Wahyu, 5. Koko, 6. Dani',
      startDate: '2026-08-10',
      endDate: '2026-10-10',
      allowedHours: '08:00 - 17:00 WIB (Senin - Sabtu)',
      status: 'SUSPENDED',
      description: 'Penambahan kamar tidur lantai 2. Dihentikan sementara karena material menutupi jalan warga.',
    },
  ]);

  // Permit Form Modal State
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [editingPermitId, setEditingPermitId] = useState<string | null>(null);
  const [activePermitView, setActivePermitView] = useState<any>(null);
  const [selectedPrintPermit, setSelectedPrintPermit] = useState<any>(null);
  const [permitToDelete, setPermitToDelete] = useState<any>(null);
  const [permitDeleteReason, setPermitDeleteReason] = useState('Renovasi Batal Dilaksanakan');

  // Permit Checkbox Selection & Bulk Delete State
  const [selectedPermitIds, setSelectedPermitIds] = useState<string[]>([]);
  const [showBulkDeletePermitModal, setShowBulkDeletePermitModal] = useState(false);
  const [bulkDeletingPermit, setBulkDeletingPermit] = useState(false);

  // Permit Form Fields
  const [pCode, setPCode] = useState('A-17');
  const [pAreaLabel, setPAreaLabel] = useState('Blok A');
  const [pOwnerName, setPOwnerName] = useState('Budi Santoso');
  const [pType, setPType] = useState('Pengecatan & Kanopi');
  const [pContractor, setPContractor] = useState('');
  const [pContractorPhone, setPContractorPhone] = useState('0812-3344-5566');
  const [pWorkers, setPWorkers] = useState(3);
  const [pWorkersList, setPWorkersList] = useState('');
  const [pStart, setPStart] = useState('2026-09-01');
  const [pEnd, setPEnd] = useState('2026-09-10');
  const [pAllowedHours, setPAllowedHours] = useState('08:00 - 17:00 WIB (Senin - Sabtu)');
  const [pStatus, setPStatus] = useState<'APPROVED' | 'PENDING_REVIEW' | 'COMPLETED' | 'SUSPENDED'>('APPROVED');
  const [pDesc, setPDesc] = useState('');
  const [permitSaving, setPermitSaving] = useState(false);

  // ================= UTILITIES & OCCUPANCY STATE =================
  const [utilitySearch, setUtilitySearch] = useState('');
  const [utilityPlnFilter, setUtilityPlnFilter] = useState('ALL');
  const [utilityPaymentFilter, setUtilityPaymentFilter] = useState('ALL');
  const [utilitySortBy, setUtilitySortBy] = useState<'houseCode' | 'plnCapacity' | 'pamUsage' | 'monthlyIplFee' | 'paymentStatus'>('houseCode');
  const [utilitySortOrder, setUtilitySortOrder] = useState<'asc' | 'desc'>('asc');
  const [utilityCurrentPage, setUtilityCurrentPage] = useState(1);
  const [utilityPageSize, setUtilityPageSize] = useState(10);

  const [utilities, setUtilities] = useState([
    { id: 'UTIL-A-01', houseCode: 'A-01', areaLabel: 'Blok A', ownerName: 'Hendra Gunawan', plnCapacity: '5.500 VA', plnCustomerId: 'PLN-5388123491', pamMeterNo: 'PAM-88302', pamReadingLastMonth: 150, pamReadingThisMonth: 174, pamUsage: 24, monthlyIplFee: 850000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: true, paymentStatus: 'LUNAS', notes: 'Solar panel on-grid 3 kWp' },
    { id: 'UTIL-A-17', houseCode: 'A-17', areaLabel: 'Blok A', ownerName: 'Budi Santoso', plnCapacity: '3.500 VA', plnCustomerId: 'PLN-5388123490', pamMeterNo: 'PAM-88301', pamReadingLastMonth: 124, pamReadingThisMonth: 142, pamUsage: 18, monthlyIplFee: 750000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: 'Meter air baru dikalibrasi' },
    { id: 'UTIL-B-07', houseCode: 'B-07', areaLabel: 'Blok B', ownerName: 'Agus Wijaya', plnCapacity: '3.500 VA', plnCustomerId: 'PLN-5388123492', pamMeterNo: 'PAM-88303', pamReadingLastMonth: 98, pamReadingThisMonth: 114, pamUsage: 16, monthlyIplFee: 750000, wasteSchedule: 'SELASA_KAMIS_SABTU', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: '-' },
    { id: 'UTIL-KAV-12', houseCode: 'KAV-12', areaLabel: 'Kav. 12', ownerName: 'Bambang Sutrisno', plnCapacity: '4.400 VA', plnCustomerId: 'PLN-5388123493', pamMeterNo: 'PAM-88304', pamReadingLastMonth: 110, pamReadingThisMonth: 125, pamUsage: 15, monthlyIplFee: 800000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: 'Rumah kavling sudut' },
    { id: 'UTIL-SW1-05', houseCode: 'SW1-05', areaLabel: 'Jl. Sariwangi Indah 1', ownerName: 'Dr. Ratna Kusuma', plnCapacity: '5.500 VA', plnCustomerId: 'PLN-5388123494', pamMeterNo: 'PAM-88305', pamReadingLastMonth: 135, pamReadingThisMonth: 156, pamUsage: 21, monthlyIplFee: 850000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: true, paymentStatus: 'LUNAS', notes: 'Dilengkapi wall charging EV' },
    { id: 'UTIL-SW2-14', houseCode: 'SW2-14', areaLabel: 'Jl. Sariwangi Indah 2', ownerName: 'Suryo Pranoto', plnCapacity: '2.200 VA', plnCustomerId: 'PLN-5388123495', pamMeterNo: 'PAM-88306', pamReadingLastMonth: 82, pamReadingThisMonth: 95, pamUsage: 13, monthlyIplFee: 700000, wasteSchedule: 'SELASA_KAMIS_SABTU', hasBiopori: false, hasSolarPanel: false, paymentStatus: 'MENUNGGU_BAYAR', notes: 'Tagihan bulan berjalan' },
    { id: 'UTIL-C-22', houseCode: 'C-22', areaLabel: 'Blok C', ownerName: 'Joko Widodo', plnCapacity: '3.500 VA', plnCustomerId: 'PLN-5388123496', pamMeterNo: 'PAM-88307', pamReadingLastMonth: 105, pamReadingThisMonth: 122, pamUsage: 17, monthlyIplFee: 750000, wasteSchedule: 'SELASA_KAMIS_SABTU', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: '-' },
    { id: 'UTIL-D-03', houseCode: 'D-03', areaLabel: 'Blok D', ownerName: 'Rahmat Hidayat', plnCapacity: '2.200 VA', plnCustomerId: 'PLN-5388123497', pamMeterNo: 'PAM-88308', pamReadingLastMonth: 78, pamReadingThisMonth: 90, pamUsage: 12, monthlyIplFee: 700000, wasteSchedule: 'SETIAP_HARI', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: '-' },
    { id: 'UTIL-D-19', houseCode: 'D-19', areaLabel: 'Blok D', ownerName: 'Fajar Nugraha', plnCapacity: '3.500 VA', plnCustomerId: 'PLN-5388123498', pamMeterNo: 'PAM-88309', pamReadingLastMonth: 140, pamReadingThisMonth: 168, pamUsage: 28, monthlyIplFee: 750000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: true, paymentStatus: 'LUNAS', notes: 'Baru pasang solar panel' },
    { id: 'UTIL-B-04', houseCode: 'B-04', areaLabel: 'Blok B', ownerName: 'Keluarga Wijaya', plnCapacity: '4.400 VA', plnCustomerId: 'PLN-5388123499', pamMeterNo: 'PAM-88310', pamReadingLastMonth: 160, pamReadingThisMonth: 195, pamUsage: 35, monthlyIplFee: 800000, wasteSchedule: 'SETIAP_HARI', hasBiopori: false, hasSolarPanel: false, paymentStatus: 'MENUNGGAK', notes: 'Sedang renovasi tingkat' },
  ]);

  // Utility Form Modal State
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [editingUtilityId, setEditingUtilityId] = useState<string | null>(null);
  const [activeUtilityView, setActiveUtilityView] = useState<any>(null);
  const [utilityToDelete, setUtilityToDelete] = useState<any>(null);
  const [utilityDeleteReason, setUtilityDeleteReason] = useState('Meteran Diganti Baru / Dikalibrasi Ulang');

  // Utility Checkbox Selection & Bulk Delete State
  const [selectedUtilityIds, setSelectedUtilityIds] = useState<string[]>([]);
  const [showBulkDeleteUtilityModal, setShowBulkDeleteUtilityModal] = useState(false);
  const [bulkDeletingUtility, setBulkDeletingUtility] = useState(false);

  // Utility Form Fields
  const [uCode, setUCode] = useState('A-17');
  const [uAreaLabel, setUAreaLabel] = useState('Blok A');
  const [uOwnerName, setUOwnerName] = useState('Budi Santoso');
  const [uPlnCapacity, setUPlnCapacity] = useState('3.500 VA');
  const [uPlnCustomerId, setUPlnCustomerId] = useState('PLN-5388123490');
  const [uPamMeterNo, setUPamMeterNo] = useState('PAM-88301');
  const [uPamLastMonth, setUPamLastMonth] = useState(120);
  const [uPamThisMonth, setUPamThisMonth] = useState(138);
  const [uMonthlyIplFee, setUMonthlyIplFee] = useState(750000);
  const [uWasteSchedule, setUWasteSchedule] = useState('SENIN_RABU_JUMAT');
  const [uHasBiopori, setUHasBiopori] = useState(true);
  const [uHasSolarPanel, setUHasSolarPanel] = useState(false);
  const [uPaymentStatus, setUPaymentStatus] = useState<'LUNAS' | 'MENUNGGU_BAYAR' | 'MENUNGGAK'>('LUNAS');
  const [uNotes, setUNotes] = useState('');
  const [utilitySaving, setUtilitySaving] = useState(false);

  // Status Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OWNER_OCCUPIED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">Dihuni Pemilik</span>;
      case 'RENTED':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">Disewa / Kontrak</span>;
      case 'VACANT':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">Kosong</span>;
      case 'RENOVATION':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">Renovasi</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-800 text-[10px] font-bold border border-slate-200">{status}</span>;
    }
  };

  const getRelationBadge = (relation: string) => {
    switch (relation) {
      case 'KEPALA_KELUARGA':
        return <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 text-[10px] font-bold border border-primary-200">Kepala Keluarga</span>;
      case 'ISTRI':
        return <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-800 text-[10px] font-bold border border-pink-200">Istri</span>;
      case 'ANAK':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">Anak</span>;
      case 'ART':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">ART / Supir</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-800 text-[10px] font-bold border border-slate-200">{relation}</span>;
    }
  };

  const getPermitStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">Disetujui (Aktif)</span>;
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">Menunggu Review</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">Selesai</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">Ditangguhkan</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-800 text-[10px] font-bold border border-slate-200">{status}</span>;
    }
  };

  // Property Handlers
  const handleOpenAdd = () => {
    setEditingPropertyId(null);
    setFormCode('');
    setFormNumber('');
    setFormAddress('');
    setFormOccupancy('OWNER_OCCUPIED');
    setFormOwner('');
    setFormBuildingType('Tipe 72/120');
    setFormLandArea(120);
    setFormBuildingArea(72);
    setFormPlnCapacity('3.500 VA');
    setFormPamMeterNo('PAM-88301');
    setFormMonthlyRate(750000);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: PropertyListItem) => {
    setEditingPropertyId(p.id);
    setFormCode(p.code);
    setFormNumber(p.number);
    setFormAddress(p.address || '');
    setFormOccupancy((p.occupancyStatus as any) || 'OWNER_OCCUPIED');
    setFormOwner(p.ownerName || '');
    setFormBuildingType('Tipe 72/120');
    setFormLandArea(120);
    setFormBuildingArea(72);
    setFormPlnCapacity('3.500 VA');
    setFormPamMeterNo('PAM-88301');
    setFormMonthlyRate(750000);
    setFormNotes(p.notes || '');
    setShowAddModal(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = Boolean(editingPropertyId);
      const url = isEdit ? '/api/properties/update' : '/api/properties/create';
      const payload = {
        id: editingPropertyId || `prop-${formCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        code: formCode.toUpperCase(),
        number: formNumber || formCode,
        address: formAddress || `Komplek Taman Sejahtera, ${formAreaName} No. ${formNumber || formCode}`,
        occupancyStatus: formOccupancy,
        ownerName: formOwner || 'Warga',
        buildingType: formBuildingType,
        landArea: Number(formLandArea),
        buildingArea: Number(formBuildingArea),
        plnCapacity: formPlnCapacity,
        pamMeterNo: formPamMeterNo,
        monthlyRate: Number(formMonthlyRate),
        notes: formNotes || undefined,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (isEdit) {
          setProperties(properties.map(p => p.id === editingPropertyId ? {
            ...p,
            code: payload.code,
            number: payload.number,
            address: payload.address,
            occupancyStatus: payload.occupancyStatus,
            ownerName: payload.ownerName,
            notes: payload.notes || null,
          } : p));
          showToast(`Unit ${payload.code} berhasil diperbarui.`);
        } else {
          const newP: PropertyListItem = {
            id: payload.id,
            code: payload.code,
            blockCode: payload.code.split('-')[0] || 'A',
            blockName: formAreaName || `Blok ${payload.code.split('-')[0]}`,
            number: payload.number,
            address: payload.address,
            occupancyStatus: payload.occupancyStatus,
            isActive: true,
            notes: payload.notes || null,
            ownerName: payload.ownerName,
          };
          setProperties([newP, ...properties]);
          showToast(`Unit ${payload.code} berhasil didaftarkan ke sistem.`);
        }
        setShowAddModal(false);
      } else {
        showToast('Gagal menyimpan data unit properti.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/properties/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: propertyToDelete.id,
          propertyId: propertyToDelete.id,
          code: propertyToDelete.code,
          propertyCode: propertyToDelete.code,
          reason: deleteReason,
        }),
      });

      if (res.ok) {
        const nextProps = properties.filter(p => p.id !== propertyToDelete.id && p.code !== propertyToDelete.code);
        setProperties(nextProps);
        setSelectedPropertyIds(prev => prev.filter(id => id !== propertyToDelete.id));
        if (typeof window !== 'undefined') {
          try {
            const prevDel = JSON.parse(localStorage.getItem('wargahub_deleted_properties') || '[]');
            localStorage.setItem('wargahub_deleted_properties', JSON.stringify(Array.from(new Set([...prevDel, propertyToDelete.id, propertyToDelete.code]))));
          } catch (e) {}
        }
        showToast(`Unit ${propertyToDelete.code} berhasil dihapus dari direktori aktif.`);
        setPropertyToDelete(null);
        if (activeProperty?.id === propertyToDelete.id) setActiveProperty(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus data unit properti.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data properti.');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Delete Handler for Properties
  const handleConfirmBulkDelete = async () => {
    if (selectedPropertyIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const selectedCodes = properties.filter(p => selectedPropertyIds.includes(p.id)).map(p => p.code);
      const res = await fetch('/api/properties/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedPropertyIds,
          propertyCodes: selectedCodes,
          reason: `Penghapusan massal ${selectedPropertyIds.length} unit rumah`,
        }),
      });

      if (res.ok) {
        const nextProps = properties.filter(p => !selectedPropertyIds.includes(p.id));
        setProperties(nextProps);
        if (typeof window !== 'undefined') {
          try {
            const prevDel = JSON.parse(localStorage.getItem('wargahub_deleted_properties') || '[]');
            localStorage.setItem('wargahub_deleted_properties', JSON.stringify(Array.from(new Set([...prevDel, ...selectedPropertyIds, ...selectedCodes]))));
          } catch (e) {}
        }
        showToast(`${selectedPropertyIds.length} unit rumah berhasil dihapus secara massal.`);
        setSelectedPropertyIds([]);
        setShowBulkDeleteModal(false);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus unit terpilih.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus unit terpilih.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Resident Handlers
  const handleOpenAddResident = () => {
    setEditingResidentId(null);
    setResHouseCode(properties[0]?.code || 'A-17');
    setResAreaLabel('Blok A');
    setResFullName('');
    setResRelation('KEPALA_KELUARGA');
    setResGender('LAKI_LAKI');
    setResBirthPlaceDate('Jakarta, 12-03-1985');
    setResReligion('ISLAM');
    setResOccupation('Karyawan Swasta');
    setResPhone('');
    setResEmail('');
    setResIdCard('');
    setResFamilyCard('');
    setResDomicileStatus('KTP_SETEMPAT');
    setResBloodType('O');
    setResIsEmergency(false);
    setResNotes('');
    setShowResidentModal(true);
  };

  const handleOpenEditResident = (r: any) => {
    setEditingResidentId(r.id);
    setResHouseCode(r.houseCode);
    setResAreaLabel(r.areaLabel || 'Blok A');
    setResFullName(r.fullName);
    setResRelation(r.relation);
    setResGender(r.gender || 'LAKI_LAKI');
    setResBirthPlaceDate(r.birthPlaceDate || 'Jakarta, 12-03-1985');
    setResReligion(r.religion || 'ISLAM');
    setResOccupation(r.occupation || 'Karyawan Swasta');
    setResPhone(r.phone || '');
    setResEmail(r.email || '');
    setResIdCard(r.idCard || '');
    setResFamilyCard(r.familyCard || '');
    setResDomicileStatus(r.domicileStatus || 'KTP_SETEMPAT');
    setResBloodType(r.bloodType || 'O');
    setResIsEmergency(Boolean(r.isEmergency));
    setResNotes(r.notes || '');
    setShowResidentModal(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setResSaving(true);
    try {
      const payload = {
        propertyId: `prop-${resHouseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        houseCode: resHouseCode.toUpperCase(),
        areaLabel: resAreaLabel,
        fullName: resFullName,
        relation: resRelation,
        gender: resGender,
        birthPlaceDate: resBirthPlaceDate,
        religion: resReligion,
        occupation: resOccupation,
        phone: resPhone,
        email: resEmail,
        idCard: resIdCard,
        familyCard: resFamilyCard,
        domicileStatus: resDomicileStatus,
        bloodType: resBloodType,
        isEmergency: resIsEmergency,
        notes: resNotes || '',
      };

      const res = await fetch('/api/properties/occupants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let nextRes: any[];
        if (editingResidentId) {
          nextRes = residents.map(r => r.id === editingResidentId ? { ...r, ...payload, id: editingResidentId, status: 'VERIFIED' } : r);
          showToast(`Data penghuni ${resFullName} berhasil diperbarui.`);
        } else {
          const newRes = { ...payload, id: `res-${Date.now()}`, status: 'VERIFIED' };
          nextRes = [newRes, ...residents];
          showToast(`Penghuni baru ${resFullName} berhasil didaftarkan.`);
        }
        setResidents(nextRes);
        savePersisted('wargahub_residents', nextRes);
        setShowResidentModal(false);
      } else {
        showToast('Gagal menyimpan data penghuni.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server.');
    } finally {
      setResSaving(false);
    }
  };

  const handleConfirmDeleteResident = async () => {
    if (!residentToDelete) return;
    try {
      const res = await fetch('/api/properties/occupants/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: residentToDelete.id,
          occupantId: residentToDelete.id,
          fullName: residentToDelete.fullName,
          houseCode: residentToDelete.houseCode,
          reason: residentDeleteReason,
        }),
      });
      if (res.ok) {
        const nextRes = residents.filter(r => r.id !== residentToDelete.id);
        setResidents(nextRes);
        savePersisted('wargahub_residents', nextRes);
        addDeletedIds('wargahub_deleted_residents', [residentToDelete.id, residentToDelete.fullName]);
        setSelectedResidentIds(prev => prev.filter(id => id !== residentToDelete.id));
        showToast(`Data penghuni ${residentToDelete.fullName} berhasil dihapus/diarsipkan.`);
        setResidentToDelete(null);
        if (activeResidentView?.id === residentToDelete.id) setActiveResidentView(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus data penghuni.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data penghuni.');
    }
  };

  // Bulk Delete Handler for Residents
  const handleConfirmBulkDeleteResident = async () => {
    if (selectedResidentIds.length === 0) return;
    setBulkDeletingResident(true);
    try {
      const selectedNames = residents.filter(r => selectedResidentIds.includes(r.id)).map(r => r.fullName);
      const res = await fetch('/api/properties/occupants/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedResidentIds,
          names: selectedNames,
          reason: `Penghapusan massal ${selectedResidentIds.length} data penghuni`,
        }),
      });

      if (res.ok) {
        const nextRes = residents.filter(r => !selectedResidentIds.includes(r.id));
        setResidents(nextRes);
        savePersisted('wargahub_residents', nextRes);
        addDeletedIds('wargahub_deleted_residents', [...selectedResidentIds, ...selectedNames]);
        showToast(`${selectedResidentIds.length} data penghuni berhasil dihapus secara massal.`);
        setSelectedResidentIds([]);
        setShowBulkDeleteResidentModal(false);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus data penghuni terpilih.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data penghuni.');
    } finally {
      setBulkDeletingResident(false);
    }
  };

  // Vehicle Handlers
  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVehHouseCode(properties[0]?.code || 'A-17');
    setVehAreaLabel('Blok A');
    setVehOwnerName(properties[0]?.ownerName || 'Budi Santoso');
    setVehPlateNumber('');
    setVehType('Mobil');
    setVehBrand('Toyota');
    setVehModel('');
    setVehYear(2024);
    setVehColor('Hitam Metalik');
    setVehRfidTag(`RFID-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setVehGateAccess('SEMUA_GERBANG');
    setVehRfidStatus('AKTIF');
    setVehNotes('');
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (v: any) => {
    setEditingVehicleId(v.id);
    setVehHouseCode(v.houseCode);
    setVehAreaLabel(v.areaLabel);
    setVehOwnerName(v.ownerName);
    setVehPlateNumber(v.plateNumber);
    setVehType(v.type);
    setVehBrand(v.brand);
    setVehModel(v.model);
    setVehYear(v.year);
    setVehColor(v.color);
    setVehRfidTag(v.rfidTag);
    setVehGateAccess(v.gateAccess);
    setVehRfidStatus(v.rfidStatus);
    setVehNotes(v.notes || '');
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehSaving(true);
    try {
      const payload = {
        propertyId: `prop-${vehHouseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        houseCode: vehHouseCode.toUpperCase(),
        areaLabel: vehAreaLabel,
        ownerName: vehOwnerName,
        plateNumber: vehPlateNumber.toUpperCase(),
        type: vehType,
        brand: vehBrand,
        model: vehModel,
        year: Number(vehYear),
        color: vehColor,
        rfidTag: vehRfidTag,
        gateAccess: vehGateAccess,
        rfidStatus: vehRfidStatus,
        notes: vehNotes || '',
      };

      const res = await fetch('/api/properties/vehicles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let nextVeh: any[];
        if (editingVehicleId) {
          nextVeh = vehicles.map(v => v.id === editingVehicleId ? { ...v, ...payload, id: editingVehicleId } : v);
          showToast(`Data kendaraan ${vehPlateNumber} berhasil diperbarui.`);
        } else {
          const newVeh = { ...payload, id: `veh-${Date.now()}` };
          nextVeh = [newVeh, ...vehicles];
          showToast(`Kendaraan baru ${vehPlateNumber} (${vehRfidTag}) berhasil didaftarkan.`);
        }
        setVehicles(nextVeh);
        savePersisted('wargahub_vehicles', nextVeh);
        setShowVehicleModal(false);
      } else {
        showToast('Gagal menyimpan data kendaraan.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server.');
    } finally {
      setVehSaving(false);
    }
  };

  const handleToggleRfid = (id: string) => {
    const nextVeh = vehicles.map(v => {
      if (v.id === id) {
        const nextStatus = v.rfidStatus === 'AKTIF' ? 'DIBLOKIR' : 'AKTIF';
        showToast(`Akses RFID kendaraan ${v.plateNumber} diubah menjadi ${nextStatus}.`);
        return { ...v, rfidStatus: nextStatus as any };
      }
      return v;
    });
    setVehicles(nextVeh);
    savePersisted('wargahub_vehicles', nextVeh);
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      const res = await fetch('/api/properties/vehicles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehicleToDelete.id,
          vehicleId: vehicleToDelete.id,
          plateNumber: vehicleToDelete.plateNumber,
          houseCode: vehicleToDelete.houseCode,
          reason: vehicleDeleteReason,
        }),
      });
      if (res.ok) {
        const nextVeh = vehicles.filter(v => v.id !== vehicleToDelete.id);
        setVehicles(nextVeh);
        savePersisted('wargahub_vehicles', nextVeh);
        addDeletedIds('wargahub_deleted_vehicles', [vehicleToDelete.id, vehicleToDelete.plateNumber]);
        showToast(`Kendaraan ${vehicleToDelete.plateNumber} berhasil dihapus/dinonaktifkan.`);
        setVehicleToDelete(null);
        if (activeVehicleView?.id === vehicleToDelete.id) setActiveVehicleView(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus data kendaraan.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus kendaraan.');
    }
  };

  // Bulk Delete Handler for Vehicles
  const handleConfirmBulkDeleteVehicle = async () => {
    if (selectedVehicleIds.length === 0) return;
    setBulkDeletingVehicle(true);
    try {
      const selectedPlates = vehicles.filter(v => selectedVehicleIds.includes(v.id)).map(v => v.plateNumber);
      const res = await fetch('/api/properties/vehicles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedVehicleIds,
          plateNumbers: selectedPlates,
          reason: `Penghapusan massal ${selectedVehicleIds.length} kendaraan & akses RFID`,
        }),
      });

      if (res.ok) {
        const nextVeh = vehicles.filter(v => !selectedVehicleIds.includes(v.id));
        setVehicles(nextVeh);
        savePersisted('wargahub_vehicles', nextVeh);
        addDeletedIds('wargahub_deleted_vehicles', [...selectedVehicleIds, ...selectedPlates]);
        showToast(`${selectedVehicleIds.length} kendaraan berhasil dinonaktifkan / dihapus secara massal.`);
        setSelectedVehicleIds([]);
        setShowBulkDeleteVehicleModal(false);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus kendaraan terpilih.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus kendaraan.');
    } finally {
      setBulkDeletingVehicle(false);
    }
  };

  const handleToggleSelectAllVehicles = () => {
    if (paginatedVehicles.length > 0 && paginatedVehicles.every(v => selectedVehicleIds.includes(v.id))) {
      setSelectedVehicleIds(prev => prev.filter(id => !paginatedVehicles.some(v => v.id === id)));
    } else {
      const pageIds = paginatedVehicles.map(v => v.id);
      setSelectedVehicleIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOneVehicle = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Permit Handlers
  const handleOpenAddPermit = () => {
    setEditingPermitId(null);
    setPCode(properties[0]?.code || 'A-17');
    setPAreaLabel('Blok A');
    setPOwnerName(properties[0]?.ownerName || 'Budi Santoso');
    setPType('Pengecatan & Kanopi');
    setPContractor('');
    setPContractorPhone('0812-3344-5566');
    setPWorkers(3);
    setPWorkersList('');
    setPStart('2026-09-01');
    setPEnd('2026-09-10');
    setPAllowedHours('08:00 - 17:00 WIB (Senin - Sabtu)');
    setPStatus('APPROVED');
    setPDesc('');
    setShowAddPermitModal(true);
  };

  const handleOpenEditPermit = (p: any) => {
    setEditingPermitId(p.id);
    setPCode(p.houseCode);
    setPAreaLabel(p.areaLabel);
    setPOwnerName(p.ownerName);
    setPType(p.workType);
    setPContractor(p.contractorName);
    setPContractorPhone(p.contractorPhone);
    setPWorkers(p.workersCount);
    setPWorkersList(p.workersList);
    setPStart(p.startDate);
    setPEnd(p.endDate);
    setPAllowedHours(p.allowedHours);
    setPStatus(p.status);
    setPDesc(p.description || '');
    setShowAddPermitModal(true);
  };

  const handleSavePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermitSaving(true);
    try {
      const payload = {
        propertyId: `prop-${pCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        houseCode: pCode.toUpperCase(),
        areaLabel: pAreaLabel,
        ownerName: pOwnerName,
        workType: pType,
        contractorName: pContractor,
        contractorPhone: pContractorPhone,
        workersCount: Number(pWorkers),
        workersList: pWorkersList,
        startDate: pStart,
        endDate: pEnd,
        allowedHours: pAllowedHours,
        status: pStatus,
        description: pDesc || '',
      };

      const res = await fetch('/api/properties/permits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let nextPermits: any[];
        if (editingPermitId) {
          nextPermits = permits.map(p => p.id === editingPermitId ? { ...p, ...payload, id: editingPermitId } : p);
          showToast(`Surat izin renovasi ${editingPermitId} berhasil diperbarui.`);
        } else {
          const newPermit = { ...payload, id: `PERMIT-2026-00${permits.length + 1}` };
          nextPermits = [newPermit, ...permits];
          showToast(`Surat izin renovasi untuk unit ${pCode} berhasil diterbitkan.`);
        }
        setPermits(nextPermits);
        savePersisted('wargahub_permits', nextPermits);
        setShowAddPermitModal(false);
      } else {
        showToast('Gagal menerbitkan surat izin renovasi.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server.');
    } finally {
      setPermitSaving(false);
    }
  };

  const handleConfirmDeletePermit = async () => {
    if (!permitToDelete) return;
    try {
      const res = await fetch('/api/properties/permits/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: permitToDelete.id,
          permitId: permitToDelete.id,
          houseCode: permitToDelete.houseCode,
          contractorName: permitToDelete.contractorName,
          reason: permitDeleteReason,
        }),
      });
      if (res.ok) {
        const nextPermits = permits.filter(p => p.id !== permitToDelete.id);
        setPermits(nextPermits);
        savePersisted('wargahub_permits', nextPermits);
        addDeletedIds('wargahub_deleted_permits', [permitToDelete.id]);
        showToast(`Surat izin ${permitToDelete.id} berhasil dibatalkan/diarsipkan.`);
        setPermitToDelete(null);
        if (activePermitView?.id === permitToDelete.id) setActivePermitView(null);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal membatalkan surat izin.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal membatalkan surat izin.');
    }
  };

  // Bulk Delete Handler for Permits
  const handleConfirmBulkDeletePermit = async () => {
    if (selectedPermitIds.length === 0) return;
    setBulkDeletingPermit(true);
    try {
      const res = await fetch('/api/properties/permits/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedPermitIds,
          reason: `Penghapusan massal ${selectedPermitIds.length} surat izin renovasi & pekerja`,
        }),
      });

      if (res.ok) {
        const nextPermits = permits.filter(p => !selectedPermitIds.includes(p.id));
        setPermits(nextPermits);
        savePersisted('wargahub_permits', nextPermits);
        addDeletedIds('wargahub_deleted_permits', selectedPermitIds);
        showToast(`${selectedPermitIds.length} izin renovasi berhasil dihapus secara massal.`);
        setSelectedPermitIds([]);
        setShowBulkDeletePermitModal(false);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal menghapus izin renovasi terpilih.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus izin renovasi.');
    } finally {
      setBulkDeletingPermit(false);
    }
  };

  const handleToggleSelectAllPermits = () => {
    if (paginatedPermits.length > 0 && paginatedPermits.every(p => selectedPermitIds.includes(p.id))) {
      setSelectedPermitIds(prev => prev.filter(id => !paginatedPermits.some(p => p.id === id)));
    } else {
      const pageIds = paginatedPermits.map(p => p.id);
      setSelectedPermitIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOnePermit = (id: string) => {
    setSelectedPermitIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Utility Handlers
  const handleOpenAddUtility = () => {
    setEditingUtilityId(null);
    setUCode(properties[0]?.code || 'A-17');
    setUAreaLabel('Blok A');
    setUOwnerName(properties[0]?.ownerName || 'Budi Santoso');
    setUPlnCapacity('3.500 VA');
    setUPlnCustomerId(`PLN-5388${Math.floor(100000 + Math.random() * 900000)}`);
    setUPamMeterNo('PAM-88301');
    setUPamLastMonth(120);
    setUPamThisMonth(138);
    setUMonthlyIplFee(750000);
    setUWasteSchedule('SENIN_RABU_JUMAT');
    setUHasBiopori(true);
    setUHasSolarPanel(false);
    setUPaymentStatus('LUNAS');
    setUNotes('');
    setShowUtilityModal(true);
  };

  const handleOpenEditUtility = (u: any) => {
    setEditingUtilityId(u.id);
    setUCode(u.houseCode);
    setUAreaLabel(u.areaLabel);
    setUOwnerName(u.ownerName);
    setUPlnCapacity(u.plnCapacity);
    setUPlnCustomerId(u.plnCustomerId);
    setUPamMeterNo(u.pamMeterNo);
    setUPamLastMonth(u.pamReadingLastMonth);
    setUPamThisMonth(u.pamReadingThisMonth);
    setUMonthlyIplFee(u.monthlyIplFee);
    setUWasteSchedule(u.wasteSchedule);
    setUHasBiopori(Boolean(u.hasBiopori));
    setUHasSolarPanel(Boolean(u.hasSolarPanel));
    setUPaymentStatus(u.paymentStatus);
    setUNotes(u.notes || '');
    setShowUtilityModal(true);
  };

  const handleSaveUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtilitySaving(true);
    try {
      const payload = {
        propertyId: `prop-${uCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        houseCode: uCode.toUpperCase(),
        areaLabel: uAreaLabel,
        ownerName: uOwnerName,
        plnCapacity: uPlnCapacity,
        plnCustomerId: uPlnCustomerId,
        pamMeterNo: uPamMeterNo,
        pamReadingLastMonth: Number(uPamLastMonth),
        pamReadingThisMonth: Number(uPamThisMonth),
        monthlyIplFee: Number(uMonthlyIplFee),
        wasteSchedule: uWasteSchedule,
        hasBiopori: uHasBiopori,
        hasSolarPanel: uHasSolarPanel,
        paymentStatus: uPaymentStatus,
        notes: uNotes || '',
      };

      const res = await fetch('/api/properties/utilities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const pamUsage = Math.max(0, Number(uPamThisMonth) - Number(uPamLastMonth));
        let nextUtil: any[];
        if (editingUtilityId) {
          nextUtil = utilities.map(item => item.id === editingUtilityId ? {
            ...item,
            ...payload,
            pamUsage,
          } : item);
          showToast(`Data utilitas ${uCode} berhasil diperbarui.`);
        } else {
          const newUtil = {
            id: `UTIL-${uCode.toUpperCase()}`,
            ...payload,
            pamUsage,
          };
          nextUtil = [newUtil, ...utilities];
          showToast(`Catatan utilitas ${uCode} berhasil ditambahkan.`);
        }
        setUtilities(nextUtil);
        savePersisted('wargahub_utilities', nextUtil);
        setShowUtilityModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan catatan utilitas.');
    } finally {
      setUtilitySaving(false);
    }
  };

  const handleConfirmDeleteUtility = async () => {
    if (!utilityToDelete) return;
    try {
      const res = await fetch('/api/properties/utilities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilityId: utilityToDelete.id,
          houseCode: utilityToDelete.houseCode,
          reason: utilityDeleteReason,
        })
      });

      if (res.ok) {
        const nextUtil = utilities.filter(u => u.id !== utilityToDelete.id);
        setUtilities(nextUtil);
        savePersisted('wargahub_utilities', nextUtil);
        addDeletedIds('wargahub_deleted_utilities', [utilityToDelete.id, utilityToDelete.houseCode]);
        showToast(`Catatan utilitas ${utilityToDelete.houseCode} berhasil direset/dihapus.`);
        setUtilityToDelete(null);
        if (activeUtilityView?.id === utilityToDelete.id) setActiveUtilityView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data utilitas.');
    }
  };

  // Bulk Delete Handler for Utilities
  const handleConfirmBulkDeleteUtility = async () => {
    if (selectedUtilityIds.length === 0) return;
    setBulkDeletingUtility(true);
    try {
      const res = await fetch('/api/properties/utilities/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedUtilityIds,
          reason: `Reset massal ${selectedUtilityIds.length} catatan meteran & utilitas unit`,
        }),
      });

      if (res.ok) {
        const nextUtil = utilities.filter(u => !selectedUtilityIds.includes(u.id));
        setUtilities(nextUtil);
        savePersisted('wargahub_utilities', nextUtil);
        addDeletedIds('wargahub_deleted_utilities', selectedUtilityIds);
        showToast(`${selectedUtilityIds.length} catatan utilitas berhasil direset/dihapus secara massal.`);
        setSelectedUtilityIds([]);
        setShowBulkDeleteUtilityModal(false);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast(json.error?.message || 'Gagal mereset catatan utilitas terpilih.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data utilitas.');
    } finally {
      setBulkDeletingUtility(false);
    }
  };

  const handleToggleSelectAllUtilities = () => {
    if (paginatedUtilities.length > 0 && paginatedUtilities.every(u => selectedUtilityIds.includes(u.id))) {
      setSelectedUtilityIds(prev => prev.filter(id => !paginatedUtilities.some(u => u.id === id)));
    } else {
      const pageIds = paginatedUtilities.map(u => u.id);
      setSelectedUtilityIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOneUtility = (id: string) => {
    setSelectedUtilityIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 1. Filtered & Sorted Properties
  const filteredAndSortedProperties = useMemo(() => {
    const list = (properties || []).filter((p) => {
      const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) ||
                          (p.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.address || '').toLowerCase().includes(search.toLowerCase());
      const matchBlock = selectedBlock === 'ALL' || p.blockCode === selectedBlock;
      const matchStatus = selectedStatus === 'ALL' || p.occupancyStatus === selectedStatus;
      return matchSearch && matchBlock && matchStatus;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      else if (sortBy === 'owner') comparison = (a.ownerName || '').localeCompare(b.ownerName || '');
      else if (sortBy === 'status') comparison = a.occupancyStatus.localeCompare(b.occupancyStatus);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [properties, search, selectedBlock, selectedStatus, sortBy, sortOrder]);

  const totalItems = filteredAndSortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, endIndex);

  // Property Checkbox Selection Handlers
  const handleToggleSelectAll = () => {
    if (paginatedProperties.length > 0 && paginatedProperties.every(p => selectedPropertyIds.includes(p.id))) {
      setSelectedPropertyIds(prev => prev.filter(id => !paginatedProperties.some(p => p.id === id)));
    } else {
      const pageIds = paginatedProperties.map(p => p.id);
      setSelectedPropertyIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedPropertyIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 2. Filtered & Sorted Residents
  const filteredAndSortedResidents = useMemo(() => {
    const list = (residents || []).filter((r) => {
      const matchSearch = r.fullName.toLowerCase().includes(residentSearch.toLowerCase()) ||
                          r.houseCode.toLowerCase().includes(residentSearch.toLowerCase()) ||
                          r.occupation.toLowerCase().includes(residentSearch.toLowerCase()) ||
                          (r.phone || '').includes(residentSearch);
      const matchCat = residentCategory === 'ALL' || r.relation === residentCategory || r.domicileStatus === residentCategory;
      return matchSearch && matchCat;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (residentSortBy === 'fullName') comparison = a.fullName.localeCompare(b.fullName);
      else if (residentSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (residentSortBy === 'relation') comparison = a.relation.localeCompare(b.relation);
      else if (residentSortBy === 'occupation') comparison = a.occupation.localeCompare(b.occupation);
      return residentSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [residents, residentSearch, residentCategory, residentSortBy, residentSortOrder]);

  const totalResidents = filteredAndSortedResidents.length;
  const totalResidentPages = Math.max(1, Math.ceil(totalResidents / residentPageSize));
  const safeResidentPage = Math.min(residentCurrentPage, totalResidentPages);
  const residentStartIndex = (safeResidentPage - 1) * residentPageSize;
  const residentEndIndex = Math.min(residentStartIndex + residentPageSize, totalResidents);
  const paginatedResidents = filteredAndSortedResidents.slice(residentStartIndex, residentEndIndex);

  // Resident Checkbox Selection Handlers
  const handleToggleSelectAllResidents = () => {
    if (paginatedResidents.length > 0 && paginatedResidents.every(r => selectedResidentIds.includes(r.id))) {
      setSelectedResidentIds(prev => prev.filter(id => !paginatedResidents.some(r => r.id === id)));
    } else {
      const pageIds = paginatedResidents.map(r => r.id);
      setSelectedResidentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectOneResident = (id: string) => {
    setSelectedResidentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 3. Filtered & Sorted Vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    const list = (vehicles || []).filter((v) => {
      const matchSearch = v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.houseCode.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.ownerName.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.rfidTag.toLowerCase().includes(vehicleSearch.toLowerCase());
      const matchType = vehicleTypeFilter === 'ALL' || v.type === vehicleTypeFilter;
      const matchRfid = vehicleRfidFilter === 'ALL' || v.rfidStatus === vehicleRfidFilter;
      return matchSearch && matchType && matchRfid;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (vehicleSortBy === 'plateNumber') comparison = a.plateNumber.localeCompare(b.plateNumber);
      else if (vehicleSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (vehicleSortBy === 'type') comparison = a.type.localeCompare(b.type);
      return vehicleSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [vehicles, vehicleSearch, vehicleTypeFilter, vehicleRfidFilter, vehicleSortBy, vehicleSortOrder]);

  const totalVehicles = filteredAndSortedVehicles.length;
  const totalVehiclePages = Math.max(1, Math.ceil(totalVehicles / vehiclePageSize));
  const safeVehiclePage = Math.min(vehicleCurrentPage, totalVehiclePages);
  const vehicleStartIndex = (safeVehiclePage - 1) * vehiclePageSize;
  const vehicleEndIndex = Math.min(vehicleStartIndex + vehiclePageSize, totalVehicles);
  const paginatedVehicles = filteredAndSortedVehicles.slice(vehicleStartIndex, vehicleEndIndex);

  // 4. Filtered & Sorted Permits
  const filteredAndSortedPermits = useMemo(() => {
    const list = (permits || []).filter((p) => {
      const matchSearch = p.id.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.houseCode.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.ownerName.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.workType.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.contractorName.toLowerCase().includes(permitSearch.toLowerCase());
      const matchStatus = permitStatusFilter === 'ALL' || p.status === permitStatusFilter;
      const matchType = permitTypeFilter === 'ALL' || p.workType.includes(permitTypeFilter);
      return matchSearch && matchStatus && matchType;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (permitSortBy === 'id') comparison = a.id.localeCompare(b.id);
      else if (permitSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (permitSortBy === 'startDate') comparison = a.startDate.localeCompare(b.startDate);
      return permitSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [permits, permitSearch, permitStatusFilter, permitTypeFilter, permitSortBy, permitSortOrder]);

  const totalPermits = filteredAndSortedPermits.length;
  const totalPermitPages = Math.max(1, Math.ceil(totalPermits / permitPageSize));
  const safePermitPage = Math.min(permitCurrentPage, totalPermitPages);
  const permitStartIndex = (safePermitPage - 1) * permitPageSize;
  const permitEndIndex = Math.min(permitStartIndex + permitPageSize, totalPermits);
  const paginatedPermits = filteredAndSortedPermits.slice(permitStartIndex, permitEndIndex);

  // 5. Filtered & Sorted Utilities
  const filteredAndSortedUtilities = useMemo(() => {
    const list = utilities.filter((u) => {
      const matchSearch = u.houseCode.toLowerCase().includes(utilitySearch.toLowerCase()) ||
                          u.ownerName.toLowerCase().includes(utilitySearch.toLowerCase()) ||
                          u.pamMeterNo.toLowerCase().includes(utilitySearch.toLowerCase()) ||
                          u.plnCustomerId.toLowerCase().includes(utilitySearch.toLowerCase());
      const matchPln = utilityPlnFilter === 'ALL' || u.plnCapacity === utilityPlnFilter;
      const matchPayment = utilityPaymentFilter === 'ALL' || u.paymentStatus === utilityPaymentFilter;
      return matchSearch && matchPln && matchPayment;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (utilitySortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (utilitySortBy === 'plnCapacity') comparison = a.plnCapacity.localeCompare(b.plnCapacity);
      else if (utilitySortBy === 'pamUsage') comparison = a.pamUsage - b.pamUsage;
      else if (utilitySortBy === 'monthlyIplFee') comparison = a.monthlyIplFee - b.monthlyIplFee;
      else if (utilitySortBy === 'paymentStatus') comparison = a.paymentStatus.localeCompare(b.paymentStatus);
      return utilitySortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [utilities, utilitySearch, utilityPlnFilter, utilityPaymentFilter, utilitySortBy, utilitySortOrder]);

  const totalUtilities = filteredAndSortedUtilities.length;
  const totalUtilityPages = Math.max(1, Math.ceil(totalUtilities / utilityPageSize));
  const safeUtilityPage = Math.min(utilityCurrentPage, totalUtilityPages);
  const utilStartIndex = (safeUtilityPage - 1) * utilityPageSize;
  const utilEndIndex = Math.min(utilStartIndex + utilityPageSize, totalUtilities);
  const paginatedUtilities = filteredAndSortedUtilities.slice(utilStartIndex, utilEndIndex);

  // CSV Export Handlers
  const handleExportPropertiesCSV = () => {
    const headers = ['Kode Unit', 'Nomor', 'Blok / Kav / Jalan', 'Alamat Lengkap', 'Status Hunian', 'Nama Pemilik / Penghuni', 'Jumlah Penghuni'];
    const rows = properties.map((p) => [
      p.code,
      p.number,
      p.code.startsWith('KAV') ? 'Kavling' : p.code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${p.blockCode}`,
      `"${p.address}"`,
      p.occupancyStatus,
      `"${p.ownerName || '-'}"`,
      p.residentCount || 1,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_RUMAH_KAV_JALAN_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data master rumah/kavling berhasil diekspor ke CSV.');
  };

  const handleExportResidentsCSV = () => {
    const headers = ['No Unit', 'Wilayah / Jalan', 'Nama Lengkap', 'Hubungan Keluarga', 'Gender', 'TTL', 'Agama', 'Pekerjaan', 'No KTP/NIK', 'No KK', 'No WhatsApp', 'Email', 'Gol Darah', 'Status KTP', 'Kontak Darurat'];
    const rows = residents.map((r) => [
      r.houseCode,
      `"${r.areaLabel}"`,
      `"${r.fullName}"`,
      r.relation,
      r.gender,
      `"${r.birthPlaceDate}"`,
      r.religion,
      `"${r.occupation}"`,
      `'${r.idCard}`,
      `'${r.familyCard}`,
      r.phone,
      r.email,
      r.bloodType,
      r.domicileStatus,
      r.isEmergency ? 'YA' : 'TIDAK',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATABASE_SENSUS_KEPENDUDUKAN_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Database sensus kependudukan lengkap berhasil diekspor ke CSV.');
  };

  const handleExportVehiclesCSV = () => {
    const headers = ['No Plat', 'No Unit', 'Wilayah', 'Pemilik / Pengemudi', 'Jenis', 'Merk', 'Model / Tipe', 'Tahun', 'Warna', 'Serial RFID', 'Hak Akses Gerbang', 'Status Akses RFID', 'Catatan Parkir'];
    const rows = vehicles.map((v) => [
      v.plateNumber,
      v.houseCode,
      `"${v.areaLabel}"`,
      `"${v.ownerName}"`,
      v.type,
      v.brand,
      `"${v.model}"`,
      v.year,
      `"${v.color}"`,
      v.rfidTag,
      v.gateAccess,
      v.rfidStatus,
      `"${v.notes || '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MASTER_KENDARAAN_DAN_RFID_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Master kendaraan & tag RFID berhasil diekspor ke CSV.');
  };

  const handleExportPermitsCSV = () => {
    const headers = ['ID Izin', 'No Unit', 'Wilayah', 'Jenis Renovasi', 'Mandor / Kontraktor', 'No WA Mandor', 'Jumlah Tukang', 'Masa Mulai', 'Masa Selesai', 'Jam Kerja', 'Status Izin', 'Rincian Pekerjaan'];
    const rows = permits.map((p) => [
      p.id,
      p.houseCode,
      `"${p.areaLabel}"`,
      `"${p.workType}"`,
      `"${p.contractorName}"`,
      p.contractorPhone,
      p.workersCount,
      p.startDate,
      p.endDate,
      `"${p.allowedHours}"`,
      p.status,
      `"${p.description}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LAPORAN_IZIN_RENOVASI_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan izin renovasi & pekerja bangunan berhasil diekspor ke CSV.');
  };

  const handleExportUtilitiesCSV = () => {
    const headers = ['No Unit', 'Wilayah', 'Pemilik / Penghuni', 'Daya PLN', 'ID Pelanggan PLN', 'No Meter PAM', 'Meter Lalu (m³)', 'Meter Ini (m³)', 'Pemakaian Air (m³)', 'Tarif IPL (Rp)', 'Jadwal Sampah', 'Biopori', 'Solar Panel', 'Status Bayar', 'Catatan'];
    const rows = utilities.map((u) => [
      u.houseCode,
      `"${u.areaLabel}"`,
      `"${u.ownerName}"`,
      u.plnCapacity,
      u.plnCustomerId,
      u.pamMeterNo,
      u.pamReadingLastMonth,
      u.pamReadingThisMonth,
      u.pamUsage,
      u.monthlyIplFee,
      u.wasteSchedule,
      u.hasBiopori ? 'ADA' : 'TIDAK',
      u.hasSolarPanel ? 'TERPASANG' : 'TIDAK',
      u.paymentStatus,
      `"${u.notes || '-'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LAPORAN_OKUPANSI_DAN_UTILITAS_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan okupansi & meteran utilitas berhasil diekspor ke CSV.');
  };

  // Matched details for Active Property
  const activePropertyResidents = useMemo(() => {
    if (!activeProperty) return [];
    return residents.filter(r => r.houseCode.toUpperCase() === activeProperty.code.toUpperCase());
  }, [activeProperty, residents]);

  const activePropertyVehicles = useMemo(() => {
    if (!activeProperty) return [];
    return vehicles.filter(v => v.houseCode.toUpperCase() === activeProperty.code.toUpperCase());
  }, [activeProperty, vehicles]);

  const activePropertyPermits = useMemo(() => {
    if (!activeProperty) return [];
    return permits.filter(p => p.houseCode.toUpperCase() === activeProperty.code.toUpperCase());
  }, [activeProperty, permits]);

  const activePropertyUtility = useMemo(() => {
    if (!activeProperty) return null;
    return utilities.find(u => u.houseCode.toUpperCase() === activeProperty.code.toUpperCase());
  }, [activeProperty, utilities]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-ink">
              Data Rumah, Warga & Keamanan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              {activeSubTab === 'analytics'
                ? 'Okupansi & Utilitas'
                : activeSubTab === 'permits'
                ? `${permits.length} Izin Kerja`
                : activeSubTab === 'vehicles'
                ? `${vehicles.length} Kendaraan RFID`
                : activeSubTab === 'residents'
                ? `${residents.length} Jiwa Sensus`
                : `${properties.length} Unit Terdaftar`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Manajemen direktori hunian, database sensus kependudukan, akses RFID barrier gate, izin renovasi, dan utilitas mandiri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={
              activeSubTab === 'analytics'
                ? handleExportUtilitiesCSV
                : activeSubTab === 'permits'
                ? handleExportPermitsCSV
                : activeSubTab === 'vehicles'
                ? handleExportVehiclesCSV
                : activeSubTab === 'residents'
                ? handleExportResidentsCSV
                : handleExportPropertiesCSV
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>

          {/* Action Button */}
          {activeSubTab === 'analytics' ? (
            <button
              type="button"
              onClick={handleOpenAddUtility}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Input Meteran Utilitas
            </button>
          ) : activeSubTab === 'permits' ? (
            <button
              type="button"
              onClick={handleOpenAddPermit}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Terbitkan Izin Baru
            </button>
          ) : activeSubTab === 'vehicles' ? (
            <button
              type="button"
              onClick={handleOpenAddVehicle}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Kendaraan & RFID
            </button>
          ) : activeSubTab === 'residents' ? (
            <button
              type="button"
              onClick={handleOpenAddResident}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Data Penghuni
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Unit Rumah / Kavling
            </button>
          )}
        </div>
      </div>

      {/* 5-SubTab Tactile Navigation Bar */}
      <div className="bg-surface rounded-2xl p-1.5 border border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'units', label: 'Direktori Rumah & Kavling', icon: Home, count: `${properties.length} Unit` },
          { id: 'residents', label: 'Sensus Kependudukan', icon: Users, count: `${residents.length} Jiwa` },
          { id: 'vehicles', label: 'Kendaraan & Barrier RFID', icon: Car, count: `${vehicles.length} Unit` },
          { id: 'permits', label: 'Izin Renovasi & Pekerja', icon: Hammer, count: `${permits.length} Izin` },
          { id: 'analytics', label: 'Okupansi & Utilitas', icon: Gauge, count: `${utilities.length} Meteran` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted border border-border/60'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= SUBTAB 1: DIREKTORI RUMAH & KAVLING ================= */}
      {activeSubTab === 'units' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Cards with Monospaced Tabular Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Total Unit Master</span>
              <p className="text-2xl font-black font-mono text-ink mt-0.5 tabular-nums">{properties.length} Unit</p>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">100% TERDATA LENGKAP</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Dihuni Pemilik</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5 tabular-nums">
                {properties.filter(p => p.occupancyStatus === 'OWNER_OCCUPIED').length} Unit
              </p>
              <span className="text-[10px] text-ink-muted">Pemilik Tetap Aktif</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Disewa / Kontrak</span>
              <p className="text-2xl font-black font-mono text-blue-700 mt-0.5 tabular-nums">
                {properties.filter(p => p.occupancyStatus === 'RENTED').length} Unit
              </p>
              <span className="text-[10px] text-ink-muted">Penyewa Terverifikasi</span>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-ink-muted tracking-wider">Kosong / Renovasi</span>
              <p className="text-2xl font-black font-mono text-amber-700 mt-0.5 tabular-nums">
                {properties.filter(p => p.occupancyStatus === 'VACANT' || p.occupancyStatus === 'RENOVATION').length} Unit
              </p>
              <span className="text-[10px] text-amber-600 font-bold font-mono">STANDBY / RENOVASI</span>
            </div>
          </div>


          {/* Bulk Action Bar (Properties) */}
          {selectedPropertyIds.length > 0 && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedPropertyIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedPropertyIds.length} Unit Rumah / Kavling Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk unit yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPropertyIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedPropertyIds.length} Unit Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari kode unit, pemilik, alamat..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedBlock}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Wilayah</option>
                <option value="A">Blok A</option>
                <option value="B">Blok B</option>
                <option value="C">Blok C</option>
                <option value="D">Blok D</option>
                <option value="KAV">Kavling</option>
                <option value="SW1">Jl. Sariwangi Indah 1</option>
                <option value="SW2">Jl. Sariwangi Indah 2</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status</option>
                <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
                <option value="RENTED">Disewa</option>
                <option value="VACANT">Kosong</option>
                <option value="RENOVATION">Renovasi</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="code">Urut Kode</option>
                <option value="owner">Urut Pemilik</option>
                <option value="status">Urut Status</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-canvas p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: TABLE WITH CHECKBOXES */}
          {viewMode === 'table' && (
            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                      <th className="py-3.5 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            paginatedProperties.length > 0 &&
                            paginatedProperties.every((p) => selectedPropertyIds.includes(p.id))
                          }
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3.5 px-4">Kode / Kavling</th>
                      <th className="py-3.5 px-4">Wilayah / Alamat</th>
                      <th className="py-3.5 px-4">Status Hunian</th>
                      <th className="py-3.5 px-4">Kepala Rumah / Pemilik</th>
                      <th className="py-3.5 px-4 text-center">Penghuni</th>
                      <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedProperties.map((prop) => {
                      const isSelected = selectedPropertyIds.includes(prop.id);
                      return (
                        <tr
                          key={prop.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-canvas/60'
                          } text-ink`}
                        >
                          <td className="py-3.5 px-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(prop.id)}
                              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-sm text-primary-700 flex items-center gap-2">
                            <Home className="w-4 h-4 text-primary-600 shrink-0" />
                            <span>Unit {prop.code}</span>
                          </td>
                          <td className="py-3.5 px-4 text-ink-muted font-medium">
                            <span className="font-semibold text-ink block">{prop.address}</span>
                            <span className="text-[10px] text-ink-muted">{prop.blockCode ? `Blok ${prop.blockCode}` : 'Wilayah Komplek'}</span>
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(prop.occupancyStatus)}</td>
                          <td className="py-3.5 px-4 font-black text-ink">{prop.ownerName || '-'}</td>
                          <td className="py-3.5 px-4 text-center">
                            {(() => {
                              const count = residents.filter(r => r.houseCode.toUpperCase() === prop.code.toUpperCase()).length;
                              if (count > 0) {
                                return (
                                  <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-black text-xs border border-primary-200">
                                    {count} Jiwa
                                  </span>
                                );
                              }
                              if (prop.occupancyStatus === 'VACANT') {
                                return <span className="text-amber-600 font-bold text-[11px]">0 Jiwa (Kosong)</span>;
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingResidentId(null);
                                    setResHouseCode(prop.code);
                                    setResAreaLabel(prop.blockCode ? `Blok ${prop.blockCode}` : 'Wilayah Komplek');
                                    setResFullName(prop.ownerName && prop.ownerName !== 'Belum berpenghuni' && !prop.ownerName.startsWith('Warga ') ? prop.ownerName : '');
                                    setShowResidentModal(true);
                                  }}
                                  className="text-ink-muted hover:text-primary-600 font-medium text-[11px] inline-flex items-center gap-1 hover:underline"
                                  title="Klik untuk tambah data penghuni unit ini"
                                >
                                  <span>0 Jiwa</span>
                                  <span className="text-[9px] text-primary-600 font-bold">+ Input</span>
                                </button>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProperty(prop);
                                  setDetailTab('specs');
                                }}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(prop)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setPropertyToDelete(prop)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalItems === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalItems}</strong> unit
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-ink">Hal {safePage} / {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: GRID */}
          {viewMode === 'grid' && (
            <div className="space-y-6">
              {['A', 'B', 'C', 'D'].map((blk) => (
                <div key={blk} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3">
                  <h3 className="font-extrabold text-sm text-ink">Blok {blk}</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2">
                    {properties.filter(p => p.blockCode === blk).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setActiveProperty(p);
                          setDetailTab('specs');
                        }}
                        className="p-2.5 rounded-xl text-center border bg-emerald-50 border-emerald-200 text-emerald-900 hover:scale-105 transition-all"
                      >
                        <p className="font-mono text-xs font-black">{p.code}</p>
                        <p className="text-[9px] truncate font-bold">{p.ownerName?.split(' ')[0] || 'Pemilik'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUBTAB 2: DATABASE KEPENDUDUKAN (SENSUS) ================= */}
      {activeSubTab === 'residents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Sensus Jiwa</span>
              <p className="text-xl font-black text-ink mt-0.5">{residents.length} Jiwa</p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Terverifikasi</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Kepala Keluarga</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">
                {residents.filter(r => r.relation === 'KEPALA_KELUARGA').length} Orang
              </p>
              <span className="text-[10px] text-ink-muted">Penanggung Jawab</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Anak & Pelajar</span>
              <p className="text-xl font-black text-sky-700 mt-0.5">
                {residents.filter(r => r.relation === 'ANAK').length} Jiwa
              </p>
              <span className="text-[10px] text-sky-600 font-bold">Usia 0-18 Tahun</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Kontak Darurat</span>
              <p className="text-xl font-black text-rose-700 mt-0.5">
                {residents.filter(r => r.isEmergency).length} Kontak
              </p>
              <span className="text-[10px] text-rose-600 font-bold">Prioritas Keamanan</span>
            </div>
          </div>

          {/* Bulk Action Bar (Residents) */}
          {selectedResidentIds.length > 0 && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedResidentIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedResidentIds.length} Data Penghuni Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk data kependudukan yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedResidentIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteResidentModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedResidentIds.length} Data Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar (Residents) */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari nama warga, nomor unit, NIK..."
                value={residentSearch}
                onChange={(e) => {
                  setResidentSearch(e.target.value);
                  setResidentCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={residentCategory}
                onChange={(e) => {
                  setResidentCategory(e.target.value);
                  setResidentCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Hubungan</option>
                <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                <option value="ISTRI">Istri</option>
                <option value="ANAK">Anak</option>
                <option value="ART">ART / Supir</option>
                <option value="KTP_SETEMPAT">KTP Setempat</option>
                <option value="KTP_LUAR">KTP Luar / Kos</option>
              </select>

              <select
                value={residentSortBy}
                onChange={(e) => setResidentSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="houseCode">Urut Unit</option>
                <option value="fullName">Urut Nama</option>
                <option value="relation">Urut Hubungan</option>
                <option value="occupation">Urut Profesi</option>
              </select>

              <button
                type="button"
                onClick={() => setResidentSortOrder(residentSortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SENSUS TABLE WITH CHECKBOXES */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedResidents.length > 0 &&
                          paginatedResidents.every((r) => selectedResidentIds.includes(r.id))
                        }
                        onChange={handleToggleSelectAllResidents}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">No Unit</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Hubungan</th>
                    <th className="py-3.5 px-4">NIK (KTP)</th>
                    <th className="py-3.5 px-4">Profesi</th>
                    <th className="py-3.5 px-4">WhatsApp</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedResidents.map((r) => {
                    const isSelected = selectedResidentIds.includes(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-canvas/60'
                        } text-ink`}
                      >
                        <td className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOneResident(r.id)}
                            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-700">Unit {r.houseCode}</td>
                        <td className="py-3.5 px-4 font-bold text-ink">
                          <div className="flex items-center gap-1.5">
                            <span>{r.fullName}</span>
                            {r.isEmergency && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[9px]">
                                Darurat
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getRelationBadge(r.relation)}</td>
                        <td className="py-3.5 px-4 font-mono text-ink-muted">{r.idCard}</td>
                        <td className="py-3.5 px-4 font-medium text-ink">{r.occupation}</td>
                        <td className="py-3.5 px-4 font-mono">{r.phone}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveResidentView(r)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditResident(r)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setResidentToDelete(r)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RESIDENTS PAGINATION */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-ink-muted">
                Menampilkan <strong className="text-ink">{totalResidents === 0 ? 0 : residentStartIndex + 1}</strong> - <strong className="text-ink">{residentEndIndex}</strong> dari <strong className="text-ink">{totalResidents}</strong> data penghuni
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setResidentCurrentPage(Math.max(1, residentCurrentPage - 1))}
                  disabled={safeResidentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-ink">Hal {safeResidentPage} / {totalResidentPages}</span>
                <button
                  type="button"
                  onClick={() => setResidentCurrentPage(Math.min(totalResidentPages, residentCurrentPage + 1))}
                  disabled={safeResidentPage === totalResidentPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: MASTER KENDARAAN & RFID ================= */}
      {activeSubTab === 'vehicles' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Kendaraan</span>
              <p className="text-xl font-black text-ink mt-0.5">{vehicles.length} Unit</p>
              <span className="text-[10px] text-emerald-600 font-bold">Terdata di Gate Barrier</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Mobil / Roda 4</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">
                {vehicles.filter(v => v.type === 'Mobil').length} Unit
              </p>
              <span className="text-[10px] text-ink-muted">Barrier Gate Mobil</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Motor & Sepeda Listrik</span>
              <p className="text-xl font-black text-sky-700 mt-0.5">
                {vehicles.filter(v => v.type === 'Motor' || v.type === 'Sepeda Listrik').length} Unit
              </p>
              <span className="text-[10px] text-ink-muted">Lane Motor</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Stiker RFID Aktif</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {vehicles.filter(v => v.rfidStatus === 'AKTIF').length} RFID
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Akses Aktif</span>
            </div>
          </div>

          {/* Bulk Action Bar (Vehicles) */}
          {selectedVehicleIds.length > 0 && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedVehicleIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedVehicleIds.length} Kendaraan & Akses RFID Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk kendaraan yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteVehicleModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedVehicleIds.length} Kendaraan Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar (Vehicles) */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari plat nomor, pemilik, unit, RFID..."
                value={vehicleSearch}
                onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="Mobil">Mobil</option>
                <option value="Motor">Motor</option>
                <option value="Sepeda Listrik">Sepeda Listrik</option>
                <option value="Truk / Pickup">Truk / Pickup</option>
              </select>

              <select
                value={vehicleRfidFilter}
                onChange={(e) => {
                  setVehicleRfidFilter(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status RFID</option>
                <option value="AKTIF">RFID Aktif</option>
                <option value="DIBLOKIR">RFID Diblokir</option>
              </select>

              <select
                value={vehicleSortBy}
                onChange={(e) => setVehicleSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="plateNumber">Urut Plat Nomor</option>
                <option value="houseCode">Urut Unit Rumah</option>
                <option value="type">Urut Jenis</option>
              </select>

              <button
                type="button"
                onClick={() => setVehicleSortOrder(vehicleSortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VEHICLES TABLE WITH CHECKBOXES */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedVehicles.length > 0 &&
                          paginatedVehicles.every((v) => selectedVehicleIds.includes(v.id))
                        }
                        onChange={handleToggleSelectAllVehicles}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Plat Nomor</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Pemilik / Pengemudi</th>
                    <th className="py-3.5 px-4">Jenis</th>
                    <th className="py-3.5 px-4">Merk & Tipe</th>
                    <th className="py-3.5 px-4">Tag RFID</th>
                    <th className="py-3.5 px-4 text-center">Status RFID</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedVehicles.map((v) => {
                    const isSelected = selectedVehicleIds.includes(v.id);
                    return (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-canvas/60'
                        } text-ink`}
                      >
                        <td className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOneVehicle(v.id)}
                            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-ink">{v.plateNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-primary-700">Unit {v.houseCode}</td>
                        <td className="py-3.5 px-4 font-bold text-ink">{v.ownerName}</td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-canvas font-bold border border-border">{v.type}</span></td>
                        <td className="py-3.5 px-4 font-medium">{v.brand} {v.model}</td>
                        <td className="py-3.5 px-4 font-mono text-primary-700 font-bold">{v.rfidTag}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRfid(v.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
                              v.rfidStatus === 'AKTIF'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                            }`}
                          >
                            {v.rfidStatus === 'AKTIF' ? '✓ AKTIF' : '✕ DIBLOKIR'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveVehicleView(v)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditVehicle(v)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setVehicleToDelete(v)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VEHICLES PAGINATION */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-ink-muted">
                Menampilkan <strong className="text-ink">{totalVehicles === 0 ? 0 : vehicleStartIndex + 1}</strong> - <strong className="text-ink">{vehicleEndIndex}</strong> dari <strong className="text-ink">{totalVehicles}</strong> kendaraan
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVehicleCurrentPage(Math.max(1, vehicleCurrentPage - 1))}
                  disabled={safeVehiclePage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-ink">Hal {safeVehiclePage} / {totalVehiclePages}</span>
                <button
                  type="button"
                  onClick={() => setVehicleCurrentPage(Math.min(totalVehiclePages, vehicleCurrentPage + 1))}
                  disabled={safeVehiclePage === totalVehiclePages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: IZIN RENOVASI & TUKANG ================= */}
      {activeSubTab === 'permits' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Izin Diajukan</span>
              <p className="text-xl font-black text-ink mt-0.5">{permits.length} Permit</p>
              <span className="text-[10px] text-emerald-600 font-bold">Tercatat di Sistem</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Sedang Berjalan</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {permits.filter(p => p.status === 'APPROVED').length} Unit
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Dalam Pengawasan</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Menunggu ACC</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">
                {permits.filter(p => p.status === 'PENDING_REVIEW').length} Pengajuan
              </p>
              <span className="text-[10px] text-amber-600 font-bold">Perlu Review</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Tenaga Kerja</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">
                {permits.filter(p => p.status === 'APPROVED').reduce((acc, p) => acc + (p.workersCount || 0), 0)} Orang
              </p>
              <span className="text-[10px] text-primary-600 font-bold">Pekerja Aktif</span>
            </div>
          </div>

          {/* Bulk Action Bar (Permits) */}
          {selectedPermitIds.length > 0 && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedPermitIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedPermitIds.length} Surat Izin Renovasi Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk izin renovasi yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPermitIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeletePermitModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedPermitIds.length} Izin Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar (Permits) */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari unit, mandor, jenis renovasi, ID..."
                value={permitSearch}
                onChange={(e) => {
                  setPermitSearch(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={permitStatusFilter}
                onChange={(e) => {
                  setPermitStatusFilter(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Izin</option>
                <option value="APPROVED">Disetujui (Approved)</option>
                <option value="PENDING_REVIEW">Menunggu Review</option>
                <option value="COMPLETED">Selesai (Completed)</option>
                <option value="SUSPENDED">Dihentikan Sementara</option>
              </select>

              <select
                value={permitTypeFilter}
                onChange={(e) => {
                  setPermitTypeFilter(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Jenis Pekerjaan</option>
                <option value="Pengecatan & Kanopi">Pengecatan & Kanopi</option>
                <option value="Renovasi Interior & Dapur">Renovasi Interior & Dapur</option>
                <option value="Perbaikan Atap & Dak Bocor">Perbaikan Atap & Dak Bocor</option>
                <option value="Pemasangan Solar Panel">Pemasangan Solar Panel</option>
                <option value="Pembangunan Tingkat / Ekstensi">Pembangunan Tingkat</option>
              </select>

              <select
                value={permitSortBy}
                onChange={(e) => setPermitSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="startDate">Urut Tgl Mulai</option>
                <option value="houseCode">Urut Unit Rumah</option>
                <option value="id">Urut ID Izin</option>
              </select>

              <button
                type="button"
                onClick={() => setPermitSortOrder(permitSortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PERMITS TABLE WITH CHECKBOXES */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedPermits.length > 0 &&
                          paginatedPermits.every((p) => selectedPermitIds.includes(p.id))
                        }
                        onChange={handleToggleSelectAllPermits}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">ID Permit</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Jenis Renovasi</th>
                    <th className="py-3.5 px-4">Mandor & Pekerja</th>
                    <th className="py-3.5 px-4">Masa Berlaku</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedPermits.map((p) => {
                    const isSelected = selectedPermitIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-canvas/60'
                        } text-ink`}
                      >
                        <td className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOnePermit(p.id)}
                            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-primary-700">{p.id}</td>
                        <td className="py-3.5 px-4 font-bold">Unit {p.houseCode}</td>
                        <td className="py-3.5 px-4 font-extrabold">{p.workType}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-ink block">{p.contractorName}</span>
                          <span className="text-[10px] text-ink-muted">{p.workersCount} Tukang • {p.contractorPhone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-ink-muted">
                          <span className="font-bold text-ink block">{p.startDate} s/d {p.endDate}</span>
                          <span className="text-[10px] text-ink-muted">{p.allowedHours}</span>
                        </td>
                        <td className="py-3.5 px-4">{getPermitStatusBadge(p.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActivePermitView(p)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPermit(p)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPermitToDelete(p)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PERMITS PAGINATION */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-ink-muted">
                Menampilkan <strong className="text-ink">{totalPermits === 0 ? 0 : permitStartIndex + 1}</strong> - <strong className="text-ink">{permitEndIndex}</strong> dari <strong className="text-ink">{totalPermits}</strong> izin renovasi
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPermitCurrentPage(Math.max(1, permitCurrentPage - 1))}
                  disabled={safePermitPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-ink">Hal {safePermitPage} / {totalPermitPages}</span>
                <button
                  type="button"
                  onClick={() => setPermitCurrentPage(Math.min(totalPermitPages, permitCurrentPage + 1))}
                  disabled={safePermitPage === totalPermitPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: OKUPANSI & UTILITAS ================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Tingkat Okupansi Komplek</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">94.2%</p>
              <span className="text-[10px] text-emerald-600 font-bold">113 dari 120 Unit Dihuni</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Beban Daya Listrik PLN</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">420 kVA</p>
              <span className="text-[10px] text-ink-muted">Kapasitas Gardu Utama</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Rata-Rata Air Bersih (PAM)</span>
              <p className="text-xl font-black text-sky-700 mt-0.5">18.5 m³</p>
              <span className="text-[10px] text-sky-600 font-bold">Konsumsi Per Rumah/Bulan</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Potensi Iuran IPL/Bulan</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">Rp 92.25 Jt</p>
              <span className="text-[10px] text-emerald-600 font-bold">96.8% Kolektibilitas</span>
            </div>
          </div>

          {/* Bulk Action Bar (Utilities) */}
          {selectedUtilityIds.length > 0 && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {selectedUtilityIds.length}
                </span>
                <div>
                  <p className="font-bold text-xs text-red-950">
                    {selectedUtilityIds.length} Catatan Utilitas & Meteran Terpilih
                  </p>
                  <p className="text-[11px] text-red-700">
                    Pilih aksi massal untuk catatan utilitas yang telah diceklis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUtilityIds([])}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-surface text-ink text-xs font-bold hover:bg-canvas transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteUtilityModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset / Hapus {selectedUtilityIds.length} Catatan Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar (Utilities) */}
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari unit, pemilik, meter PAM, ID PLN..."
                value={utilitySearch}
                onChange={(e) => {
                  setUtilitySearch(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-border rounded-xl text-xs font-medium text-ink focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={utilityPlnFilter}
                onChange={(e) => {
                  setUtilityPlnFilter(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Daya PLN</option>
                <option value="1.300 VA">1.300 VA</option>
                <option value="2.200 VA">2.200 VA</option>
                <option value="3.500 VA">3.500 VA</option>
                <option value="4.400 VA">4.400 VA</option>
                <option value="5.500 VA">5.500 VA</option>
              </select>

              <select
                value={utilityPaymentFilter}
                onChange={(e) => {
                  setUtilityPaymentFilter(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Bayar</option>
                <option value="LUNAS">Lunas</option>
                <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                <option value="MENUNGGAK">Menunggak</option>
              </select>

              <select
                value={utilitySortBy}
                onChange={(e) => setUtilitySortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="houseCode">Urut No Unit</option>
                <option value="pamUsage">Urut Pakai PAM</option>
                <option value="monthlyIplFee">Urut Tarif IPL</option>
                <option value="paymentStatus">Urut Status Bayar</option>
              </select>

              <button
                type="button"
                onClick={() => setUtilitySortOrder(utilitySortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* UTILITIES TABLE WITH CHECKBOXES */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedUtilities.length > 0 &&
                          paginatedUtilities.every((u) => selectedUtilityIds.includes(u.id))
                        }
                        onChange={handleToggleSelectAllUtilities}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">No Unit</th>
                    <th className="py-3.5 px-4">Pemilik</th>
                    <th className="py-3.5 px-4">Daya Listrik PLN</th>
                    <th className="py-3.5 px-4">Meter Air PAM</th>
                    <th className="py-3.5 px-4">Tarif IPL</th>
                    <th className="py-3.5 px-4 text-center">Status Bayar</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedUtilities.map((u) => {
                    const isSelected = selectedUtilityIds.includes(u.id);
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-canvas/60'
                        } text-ink`}
                      >
                        <td className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOneUtility(u.id)}
                            className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-700">Unit {u.houseCode}</td>
                        <td className="py-3.5 px-4 font-bold text-ink">{u.ownerName}</td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-ink block">{u.plnCapacity}</span>
                          <span className="text-[10px] text-ink-muted">{u.plnCustomerId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-sky-800 block">{u.pamUsage} m³</span>
                          <span className="text-[10px] text-ink-muted">{u.pamMeterNo}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-ink">
                          Rp {u.monthlyIplFee.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            u.paymentStatus === 'LUNAS'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : u.paymentStatus === 'MENUNGGU_BAYAR'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {u.paymentStatus === 'LUNAS' ? '✓ LUNAS' : u.paymentStatus === 'MENUNGGU_BAYAR' ? '⏳ MENUNGGU' : '✕ MENUNGGAK'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveUtilityView(u)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUtility(u)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setUtilityToDelete(u)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* UTILITIES PAGINATION */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-ink-muted">
                Menampilkan <strong className="text-ink">{totalUtilities === 0 ? 0 : utilStartIndex + 1}</strong> - <strong className="text-ink">{utilEndIndex}</strong> dari <strong className="text-ink">{totalUtilities}</strong> unit utilitas
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUtilityCurrentPage(Math.max(1, utilityCurrentPage - 1))}
                  disabled={safeUtilityPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-ink">Hal {safeUtilityPage} / {totalUtilityPages}</span>
                <button
                  type="button"
                  onClick={() => setUtilityCurrentPage(Math.min(totalUtilityPages, utilityCurrentPage + 1))}
                  disabled={safeUtilityPage === totalUtilityPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL WARGA / PENGHUNI (SENSUS) ================= */}
      {activeResidentView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-ink">{activeResidentView.fullName}</h3>
                    {getRelationBadge(activeResidentView.relation)}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Unit <strong>{activeResidentView.houseCode}</strong> • {activeResidentView.areaLabel || 'Komplek'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveResidentView(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resident Full Specs Grid */}
            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Nomor Induk Kependudukan (NIK):</span>
                <p className="font-mono font-black text-ink mt-0.5">{activeResidentView.idCard || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Nomor Kartu Keluarga (KK):</span>
                <p className="font-mono font-black text-ink mt-0.5">{activeResidentView.familyCard || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Tempat & Tanggal Lahir:</span>
                <p className="font-bold text-ink mt-0.5">{activeResidentView.birthPlaceDate || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Jenis Kelamin / Agama:</span>
                <p className="font-bold text-ink mt-0.5">
                  {activeResidentView.gender === 'LAKI_LAKI' ? 'Laki-Laki' : 'Perempuan'} / {activeResidentView.religion || '-'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Pekerjaan / Profesi:</span>
                <p className="font-bold text-ink mt-0.5">{activeResidentView.occupation || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Golongan Darah:</span>
                <p className="font-mono font-black text-rose-700 mt-0.5">Tipe {activeResidentView.bloodType || 'O'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Status Domisili KTP:</span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-ink inline-block mt-0.5">
                  {activeResidentView.domicileStatus?.replace(/_/g, ' ') || 'KTP SETEMPAT'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Status Kontak Darurat:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5 ${
                  activeResidentView.isEmergency ? 'bg-rose-100 text-rose-800' : 'bg-canvas text-ink-muted'
                }`}>
                  {activeResidentView.isEmergency ? '✓ Kontak Darurat Aktif' : 'Bukan Kontak Darurat'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-ink-muted font-bold block">Kontak WhatsApp & Email:</span>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-mono font-bold text-ink">{activeResidentView.phone || '-'}</p>
                  <p className="text-ink-muted font-mono">{activeResidentView.email || '-'}</p>
                </div>
              </div>
            </div>

            {activeResidentView.notes && (
              <div className="p-3 bg-canvas/80 rounded-xl border border-border text-xs">
                <span className="text-[10px] text-ink-muted font-bold block">Catatan Khusus:</span>
                <p className="font-medium text-ink mt-0.5">{activeResidentView.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = `BIODATA SENSUS PENGHUNI - WARGAHUB\n===================================\nNama Lengkap: ${activeResidentView.fullName}\nUnit Rumah: ${activeResidentView.houseCode}\nHubungan: ${activeResidentView.relation}\nNIK: ${activeResidentView.idCard}\nNo. KK: ${activeResidentView.familyCard || '-'}\nTTL: ${activeResidentView.birthPlaceDate}\nGender: ${activeResidentView.gender}\nAgama: ${activeResidentView.religion}\nProfesi: ${activeResidentView.occupation}\nWhatsApp: ${activeResidentView.phone}\nEmail: ${activeResidentView.email || '-'}\nGol. Darah: ${activeResidentView.bloodType}\nStatus Domisili: ${activeResidentView.domicileStatus}\nKontak Darurat: ${activeResidentView.isEmergency ? 'YA' : 'TIDAK'}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus Komplek Taman Sejahtera`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `BIODATA_${activeResidentView.fullName.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`Biodata ${activeResidentView.fullName} berhasil diunduh.`);
                }}
                className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary-600" />
                <span>Cetak Biodata</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeResidentView;
                    setActiveResidentView(null);
                    handleOpenEditResident(toEdit);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResidentView(null)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT PENGHUNI (SENSUS) ================= */}
      {showResidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingResidentId ? `Edit Data Penghuni: ${resFullName}` : 'Tambah Data Penghuni Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Formulir sensus kependudukan warga komplek.</p>
                </div>
              </div>
              <button onClick={() => setShowResidentModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Pilih Unit Rumah *</label>
                  <select
                    value={resHouseCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setResHouseCode(code);
                      const matched = properties.find(p => p.code === code);
                      if (matched) {
                        setResAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matched.blockCode}`);
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.code}>
                        Unit {p.code} — {p.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Hubungan Keluarga *</label>
                  <select
                    value={resRelation}
                    onChange={(e) => setResRelation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ANAK">Anak</option>
                    <option value="ORANG_TUA">Orang Tua / Mertua</option>
                    <option value="FAMILI_LAIN">Famili Lain</option>
                    <option value="ART">ART / Supir</option>
                    <option value="PENYEWA">Penyewa / Pengontrak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Lengkap Sesuai KTP *</label>
                <input
                  type="text"
                  placeholder="Contoh: Hendra Gunawan, S.E."
                  value={resFullName}
                  onChange={(e) => setResFullName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 Digit NIK KTP"
                    value={resIdCard}
                    onChange={(e) => setResIdCard(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 Digit No. KK"
                    value={resFamilyCard}
                    onChange={(e) => setResFamilyCard(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Kelamin</label>
                  <select
                    value={resGender}
                    onChange={(e) => setResGender(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="LAKI_LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Agama</label>
                  <select
                    value={resReligion}
                    onChange={(e) => setResReligion(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN">Kristen Protestan</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDDHA">Buddha</option>
                    <option value="KONGHUCU">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tempat, Tanggal Lahir</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jakarta, 12-03-1985"
                    value={resBirthPlaceDate}
                    onChange={(e) => setResBirthPlaceDate(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Profesi / Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Wiraswasta, Dokter, PNS"
                    value={resOccupation}
                    onChange={(e) => setResOccupation(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={resEmail}
                    onChange={(e) => setResEmail(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Status Domisili</label>
                  <select
                    value={resDomicileStatus}
                    onChange={(e) => setResDomicileStatus(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KTP_SETEMPAT">KTP Setempat (Komplek)</option>
                    <option value="KTP_LUAR">KTP Luar Wilayah</option>
                    <option value="PENYEWA">Penyewa / Kontrak</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Golongan Darah</label>
                  <select
                    value={resBloodType}
                    onChange={(e) => setResBloodType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold font-mono text-ink"
                  >
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-canvas rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="resEmergency"
                  checked={resIsEmergency}
                  onChange={(e) => setResIsEmergency(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="resEmergency" className="font-bold text-ink cursor-pointer select-none text-xs">
                  Jadikan Kontak Darurat Prioritas Unit Ini (Satpam & Pengurus)
                </label>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan kondisi kesehatan, jadwal tugas, dll"
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResidentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
                >
                  {resSaving ? 'Menyimpan...' : editingResidentId ? 'Perbarui Data Penghuni' : 'Simpan Penghuni Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL PENGHUNI (BULK DELETE RESIDENTS) ================= */}
      {showBulkDeleteResidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Hapus {selectedResidentIds.length} Data Penghuni Terpilih?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedResidentIds.length} data sensus kependudukan</strong> yang telah diceklis akan dinonaktifkan dari database warga. Tindakan ini akan tercatat dalam Jejak Audit Keamanan.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Penghuni Terpilih:
              </span>
              {residents.filter(r => selectedResidentIds.includes(r.id)).map(r => (
                <div key={r.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-bold text-primary-700">{r.fullName}</span>
                  <span className="text-ink-muted text-[11px] truncate">Unit {r.houseCode} ({r.relation})</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeletingResident}
                onClick={() => setShowBulkDeleteResidentModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeletingResident}
                onClick={handleConfirmBulkDeleteResident}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeletingResident ? 'Menghapus...' : `Ya, Hapus (${selectedResidentIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS PENGHUNI TUNGGAL ================= */}
      {residentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Data {residentToDelete.fullName}?</h3>
              <p className="text-xs text-ink-muted">
                Penghuni <strong>{residentToDelete.fullName}</strong> (Unit {residentToDelete.houseCode}) akan dinonaktifkan dari database kependudukan.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setResidentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResident}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs text-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT RUMAH ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Home className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-ink">
                  {editingPropertyId ? `Edit Unit Rumah ${formCode}` : 'Tambah Unit Rumah / Kavling Baru'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Kode Unit *</label>
                  <input
                    type="text"
                    placeholder="Contoh: A-17, KAV-04, SW1-02"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemilik / Penghuni *</label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Palem Raya No. 17, Blok A"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Status Hunian</label>
                  <select
                    value={formOccupancy}
                    onChange={(e) => setFormOccupancy(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
                    <option value="RENTED">Disewa / Kontrak</option>
                    <option value="VACANT">Kosong</option>
                    <option value="RENOVATION">Renovasi</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tarif Iuran IPL Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={formMonthlyRate}
                    onChange={(e) => setFormMonthlyRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editingPropertyId ? 'Perbarui Data Unit' : 'Simpan Unit Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL RUMAH LENGKAP & KOMPREHENSIF ================= */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-3xl w-full p-5 sm:p-7 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl text-ink">Spesifikasi Unit {activeProperty.code}</h3>
                    {getStatusBadge(activeProperty.occupancyStatus)}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    <span>{activeProperty.address}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const content = `KARTU IDENTITAS UNIT RUMAH - WARGAHUB\n=======================================\nKode Unit: ${activeProperty.code}\nAlamat: ${activeProperty.address}\nStatus Okupansi: ${activeProperty.occupancyStatus}\nPemilik / Kepala Rumah: ${activeProperty.ownerName || '-'}\nTotal Penghuni Terdata: ${activePropertyResidents.length} Jiwa\nTotal Kendaraan Terdaftar: ${activePropertyVehicles.length} Unit\nDaya PLN: ${activePropertyUtility?.plnCapacity || '3.500 VA'}\nMeter PAM: ${activePropertyUtility?.pamMeterNo || 'PAM-88301'}\nIuran IPL: Rp ${(activePropertyUtility?.monthlyIplFee || 750000).toLocaleString('id-ID')} / bln\nStatus Bayar: ${activePropertyUtility?.paymentStatus || 'LUNAS'}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus Komplek Taman Sejahtera`;
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `KARTU_UNIT_${activeProperty.code}_WARGAHUB.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast(`Kartu profil Unit ${activeProperty.code} berhasil diunduh.`);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface text-ink text-xs font-bold hover:bg-canvas flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-primary-600" />
                  <span>Cetak Profil</span>
                </button>
                <button
                  onClick={() => setActiveProperty(null)}
                  className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-canvas"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Kepala Rumah / Pemilik</span>
                <p className="font-extrabold text-ink text-sm mt-0.5 truncate">{activeProperty.ownerName || '-'}</p>
                <span className="text-[10px] text-primary-700 font-semibold">Penanggung Jawab</span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Sensus Penghuni</span>
                <p className="font-extrabold text-ink text-sm mt-0.5">{activePropertyResidents.length} Jiwa</p>
                <span className="text-[10px] text-emerald-700 font-semibold">{activePropertyResidents.length > 0 ? 'KTP & KK Terverifikasi' : 'Belum Ada Anggota'}</span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Kendaraan & RFID</span>
                <p className="font-extrabold text-ink text-sm mt-0.5">{activePropertyVehicles.length} Unit</p>
                <span className="text-[10px] text-sky-700 font-semibold">Akses Barrier Gate</span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Iuran Lingkungan (IPL)</span>
                <p className="font-extrabold text-emerald-800 text-sm mt-0.5">
                  Rp {(activePropertyUtility?.monthlyIplFee || 750000).toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold">Status: {activePropertyUtility?.paymentStatus || 'LUNAS'}</span>
              </div>
            </div>

            {/* Sub-Navigation Tabs within Detail Modal */}
            <div className="flex border-b border-border gap-1 overflow-x-auto text-xs font-bold pt-1">
              {[
                { id: 'specs', label: 'Spesifikasi Teknis & Fisik', icon: Building2 },
                { id: 'occupants', label: `Penghuni (${activePropertyResidents.length})`, icon: Users },
                { id: 'vehicles', label: `Kendaraan (${activePropertyVehicles.length})`, icon: Car },
                { id: 'permits', label: `Izin Renovasi (${activePropertyPermits.length})`, icon: Hammer },
                { id: 'utilities', label: 'Utilitas & Meteran', icon: Gauge },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-1.5 py-2 px-3 border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-primary-600 text-primary-700 font-black'
                        : 'border-transparent text-ink-muted hover:text-ink'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: SPESIFIKASI TEKNIS & FISIK */}
            {detailTab === 'specs' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Tipe Bangunan:</span>
                    <p className="font-extrabold text-ink mt-0.5">Tipe 72/120 (2 Lantai)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Luas Tanah:</span>
                    <p className="font-extrabold text-ink mt-0.5">120 m²</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Luas Bangunan:</span>
                    <p className="font-extrabold text-ink mt-0.5">72 m²</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Arah Hadap Rumah:</span>
                    <p className="font-extrabold text-ink mt-0.5">Timur (Menghadap Taman)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik PLN:</span>
                    <p className="font-extrabold text-amber-800 mt-0.5">{activePropertyUtility?.plnCapacity || '3.500 VA'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">No. Meteran PAM:</span>
                    <p className="font-extrabold text-sky-800 mt-0.5">{activePropertyUtility?.pamMeterNo || 'PAM-88301'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Tahun Serah Terima:</span>
                    <p className="font-extrabold text-ink mt-0.5">15 Januari 2024</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Wilayah / Blok:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.blockCode ? `Blok ${activeProperty.blockCode}` : 'Wilayah Komplek'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Status Sertifikat:</span>
                    <p className="font-extrabold text-emerald-800 mt-0.5">SHM (Sertifikat Hak Milik)</p>
                  </div>
                </div>

                {activeProperty.notes && (
                  <div className="p-3 bg-canvas/80 rounded-xl border border-border text-xs">
                    <span className="text-[10px] text-ink-muted font-bold block">Catatan Khusus Unit:</span>
                    <p className="font-medium text-ink mt-0.5">{activeProperty.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: PENGHUNI TERDAFTAR */}
            {detailTab === 'occupants' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                {activePropertyResidents.length === 0 ? (
                  <div className="p-6 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-3">
                    <Users className="w-8 h-8 text-ink-muted mx-auto" />
                    <div>
                      <p className="font-bold text-ink">Belum ada rincian anggota keluarga yang tercatat di unit ini.</p>
                      <p className="text-ink-muted text-[11px] mt-0.5">Kepala rumah terdaftar: <strong>{activeProperty.ownerName || '-'}</strong></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCode = activeProperty.code;
                        const targetArea = activeProperty.blockCode ? `Blok ${activeProperty.blockCode}` : 'Wilayah Komplek';
                        const targetOwner = activeProperty.ownerName && activeProperty.ownerName !== 'Belum berpenghuni' && !activeProperty.ownerName.startsWith('Warga ') ? activeProperty.ownerName : '';
                        setActiveProperty(null);
                        setEditingResidentId(null);
                        setResHouseCode(targetCode);
                        setResAreaLabel(targetArea);
                        setResFullName(targetOwner);
                        setShowResidentModal(true);
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Tambah Data Penghuni Unit {activeProperty.code}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activePropertyResidents.map((r) => (
                      <div key={r.id} className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-ink">{r.fullName}</p>
                            {getRelationBadge(r.relation)}
                            {r.isEmergency && (
                              <span className="px-2 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[9px]">
                                Kontak Darurat
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-ink-muted font-mono">
                            NIK: {r.idCard} • No. KK: {r.familyCard || '-'} • Profesi: {r.occupation}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-xs font-bold text-ink">{r.phone}</p>
                          <span className="text-[10px] text-emerald-700 font-semibold">{r.domicileStatus.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: KENDARAAN & RFID */}
            {detailTab === 'vehicles' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                {activePropertyVehicles.length === 0 ? (
                  <div className="p-6 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
                    <Car className="w-8 h-8 text-ink-muted mx-auto" />
                    <p className="font-bold text-ink">Belum ada stiker barrier gate RFID yang terdaftar untuk unit ini.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activePropertyVehicles.map((v) => (
                      <div key={v.id} className="p-3 bg-canvas rounded-xl border border-border flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-ink">{v.plateNumber}</span>
                            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold">
                              {v.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.rfidStatus === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {v.rfidStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted">
                            {v.brand} {v.model} ({v.year}) • Warna: {v.color} • Tag: <span className="font-mono">{v.rfidTag}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-primary-700 block">{v.gateAccess.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-ink-muted">{v.notes || 'Parkir Garasi'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: IZIN RENOVASI & PEKERJA */}
            {detailTab === 'permits' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                {activePropertyPermits.length === 0 ? (
                  <div className="p-6 text-center bg-canvas rounded-2xl border border-dashed border-border space-y-2">
                    <Hammer className="w-8 h-8 text-ink-muted mx-auto" />
                    <p className="font-bold text-ink">Tidak ada catatan perizinan renovasi aktif untuk unit ini.</p>
                    <p className="text-ink-muted text-[11px]">Bangunan dalam kondisi standar terawat.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activePropertyPermits.map((p) => (
                      <div key={p.id} className="p-3.5 bg-canvas rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-primary-700">{p.id}</span>
                            <span className="font-bold text-ink">{p.workType}</span>
                          </div>
                          {getPermitStatusBadge(p.status)}
                        </div>
                        <p className="text-[11px] text-ink">{p.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[10px] text-ink-muted font-medium border-t border-border/60">
                          <span>Mandor: <strong className="text-ink">{p.contractorName}</strong></span>
                          <span>Masa: <strong className="text-ink">{p.startDate} s/d {p.endDate}</strong></span>
                          <span>Jam Kerja: <strong className="text-ink">{p.allowedHours}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 5: UTILITAS & ECO-GREEN */}
            {detailTab === 'utilities' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">ID Pelanggan PLN:</span>
                    <p className="font-mono font-extrabold text-amber-800 mt-0.5">{activePropertyUtility?.plnCustomerId || 'PLN-5388123490'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activePropertyUtility?.plnCapacity || '3.500 VA'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Nomor Meter PAM:</span>
                    <p className="font-mono font-extrabold text-sky-800 mt-0.5">{activePropertyUtility?.pamMeterNo || 'PAM-88301'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Pemakaian Air (Bulan Ini):</span>
                    <p className="font-extrabold text-ink mt-0.5">{activePropertyUtility?.pamUsage || 18} m³</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Iuran Lingkungan (IPL):</span>
                    <p className="font-mono font-extrabold text-emerald-800 mt-0.5">Rp {(activePropertyUtility?.monthlyIplFee || 750000).toLocaleString('id-ID')} / bln</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Status Pembayaran:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-0.5">
                      {activePropertyUtility?.paymentStatus || 'LUNAS'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Sumur Resapan Biopori:</span>
                    <p className="font-extrabold text-emerald-800 mt-0.5">
                      {activePropertyUtility?.hasBiopori !== false ? '✓ Terpasang (2 Titik)' : '✕ Belum Ada'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Solar Panel Rooftop:</span>
                    <p className="font-extrabold text-amber-800 mt-0.5">
                      {activePropertyUtility?.hasSolarPanel ? '✓ Terpasang (On-Grid)' : '✕ Belum Terpasang'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Jadwal Angkut Sampah:</span>
                    <p className="font-extrabold text-ink mt-0.5">Senin, Rabu, Jumat (06:30 WIB)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[11px] text-ink-muted font-medium">
                ID Master: <strong className="text-ink font-mono">{activeProperty.id}</strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeProperty;
                    setActiveProperty(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl transition-colors"
                >
                  Edit Data Unit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProperty(null)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL KENDARAAN & RFID ================= */}
      {activeVehicleView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-ink font-mono">{activeVehicleView.plateNumber}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-xs font-bold text-ink">
                      {activeVehicleView.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeVehicleView.rfidStatus === 'AKTIF' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {activeVehicleView.rfidStatus === 'AKTIF' ? '✓ RFID Aktif' : '✕ RFID Diblokir'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Unit <strong>{activeVehicleView.houseCode}</strong> • {activeVehicleView.ownerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveVehicleView(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle Full Specs */}
            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Merk & Model:</span>
                <p className="font-bold text-ink mt-0.5">{activeVehicleView.brand} {activeVehicleView.model}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Tahun & Warna:</span>
                <p className="font-bold text-ink mt-0.5">{activeVehicleView.year || 2024} • {activeVehicleView.color}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Nomor Seri Tag RFID:</span>
                <p className="font-mono font-black text-primary-700 mt-0.5">{activeVehicleView.rfidTag}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Hak Akses Barrier Gate:</span>
                <p className="font-bold text-ink mt-0.5">{activeVehicleView.gateAccess?.replace(/_/g, ' ') || 'SEMUA GERBANG'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Pemilik / Pengemudi:</span>
                <p className="font-bold text-ink mt-0.5">{activeVehicleView.ownerName}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Unit Hunian:</span>
                <p className="font-bold text-primary-700 mt-0.5">Unit {activeVehicleView.houseCode} ({activeVehicleView.areaLabel || 'Komplek'})</p>
              </div>
            </div>

            {activeVehicleView.notes && (
              <div className="p-3 bg-canvas/80 rounded-xl border border-border text-xs">
                <span className="text-[10px] text-ink-muted font-bold block">Catatan Parkir / Garasi:</span>
                <p className="font-medium text-ink mt-0.5">{activeVehicleView.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = `KARTU AKSES RFID BARRIER GATE - WARGAHUB\n===========================================\nNomor Plat: ${activeVehicleView.plateNumber}\nJenis: ${activeVehicleView.type}\nMerk/Model: ${activeVehicleView.brand} ${activeVehicleView.model} (${activeVehicleView.year})\nWarna: ${activeVehicleView.color}\nTag RFID: ${activeVehicleView.rfidTag}\nUnit Rumah: ${activeVehicleView.houseCode}\nPemilik: ${activeVehicleView.ownerName}\nHak Akses: ${activeVehicleView.gateAccess}\nStatus: ${activeVehicleView.rfidStatus}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPos Satpam & Keamanan Komplek`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `STIKER_RFID_${activeVehicleView.plateNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`Stiker RFID ${activeVehicleView.plateNumber} berhasil diunduh.`);
                }}
                className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary-600" />
                <span>Cetak Stiker RFID</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeVehicleView;
                    setActiveVehicleView(null);
                    handleOpenEditVehicle(toEdit);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVehicleView(null)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT KENDARAAN & RFID ================= */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingVehicleId ? `Edit Kendaraan: ${vehPlateNumber}` : 'Daftarkan Kendaraan & RFID Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Master kendaraan untuk barrier gate pos satpam komplek.</p>
                </div>
              </div>
              <button onClick={() => setShowVehicleModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Pilih Unit Rumah *</label>
                  <select
                    value={vehHouseCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setVehHouseCode(code);
                      const matched = properties.find(p => p.code === code);
                      if (matched) {
                        setVehAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matched.blockCode}`);
                        if (matched.ownerName) setVehOwnerName(matched.ownerName);
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.code}>
                        Unit {p.code} — {p.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemilik / Pengemudi *</label>
                  <input
                    type="text"
                    placeholder="Nama Pemilik"
                    value={vehOwnerName}
                    onChange={(e) => setVehOwnerName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Plat Kendaraan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: B 1234 ABC"
                    value={vehPlateNumber}
                    onChange={(e) => setVehPlateNumber(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono font-bold text-ink uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Kendaraan</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Mobil">Mobil (Roda 4)</option>
                    <option value="Motor">Motor (Roda 2)</option>
                    <option value="Sepeda Listrik">Sepeda Listrik / E-Bike</option>
                    <option value="Truk / Pickup">Truk / Pickup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Merk Kendaraan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Toyota, Honda, Hyundai"
                    value={vehBrand}
                    onChange={(e) => setVehBrand(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Model / Tipe *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Avanza Veloz, PCX 160"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tahun Pembuatan</label>
                  <input
                    type="number"
                    value={vehYear}
                    onChange={(e) => setVehYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Warna Kendaraan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hitam Metalik, Putih"
                    value={vehColor}
                    onChange={(e) => setVehColor(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Seri Tag RFID</label>
                  <input
                    type="text"
                    placeholder="Contoh: RFID-8830192"
                    value={vehRfidTag}
                    onChange={(e) => setVehRfidTag(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Akses RFID</label>
                  <select
                    value={vehRfidStatus}
                    onChange={(e) => setVehRfidStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="AKTIF">AKTIF (Diberi Akses Gate)</option>
                    <option value="DIBLOKIR">DIBLOKIR (Akses Ditolak)</option>
                    <option value="PENDING_VERIFIKASI">PENDING VERIFIKASI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Hak Akses Gerbang Barrier</label>
                <select
                  value={vehGateAccess}
                  onChange={(e) => setVehGateAccess(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                >
                  <option value="SEMUA_GERBANG">Semua Gerbang (Utama & Barat)</option>
                  <option value="GERBANG_UTAMA">Hanya Gerbang Utama</option>
                  <option value="GERBANG_BARAT">Hanya Gerbang Barat</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Parkir / Garasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Parkir di garasi dalam unit"
                  value={vehNotes}
                  onChange={(e) => setVehNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={vehSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
                >
                  {vehSaving ? 'Menyimpan...' : editingVehicleId ? 'Perbarui Kendaraan' : 'Simpan Kendaraan Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL KENDARAAN ================= */}
      {showBulkDeleteVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Hapus {selectedVehicleIds.length} Kendaraan Terpilih?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedVehicleIds.length} kendaraan & stiker RFID</strong> yang telah diceklis akan dicabut hak aksesnya dari barrier gate pos satpam. Tindakan ini akan tercatat dalam Jejak Audit.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Kendaraan Terpilih:
              </span>
              {vehicles.filter(v => selectedVehicleIds.includes(v.id)).map(v => (
                <div key={v.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-mono font-bold text-primary-700">{v.plateNumber}</span>
                  <span className="text-ink-muted text-[11px] truncate">Unit {v.houseCode} ({v.brand} {v.model})</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeletingVehicle}
                onClick={() => setShowBulkDeleteVehicleModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeletingVehicle}
                onClick={handleConfirmBulkDeleteVehicle}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeletingVehicle ? 'Menghapus...' : `Ya, Hapus (${selectedVehicleIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL SURAT IZIN KERJA & RENOVASI ================= */}
      {activePermitView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                  <Hammer className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-ink font-mono">{activePermitView.id}</h3>
                    {getPermitStatusBadge(activePermitView.status)}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Unit <strong>{activePermitView.houseCode}</strong> ({activePermitView.areaLabel || 'Komplek'}) • Pemohon: <strong>{activePermitView.ownerName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePermitView(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permit Full Specifications */}
            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Jenis Pekerjaan:</span>
                <p className="font-extrabold text-ink mt-0.5">{activePermitView.workType}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Periode Renovasi:</span>
                <p className="font-bold text-ink mt-0.5">{activePermitView.startDate} s/d {activePermitView.endDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Mandor / Pelaksana:</span>
                <p className="font-bold text-primary-700 mt-0.5">{activePermitView.contractorName}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Kontak Mandor:</span>
                <p className="font-mono font-bold text-ink mt-0.5">{activePermitView.contractorPhone || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Jumlah Tenaga Kerja:</span>
                <p className="font-bold text-ink mt-0.5">{activePermitView.workersCount} Orang Tukang</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-ink-muted font-bold block">Jam Kerja Diizinkan:</span>
                <p className="font-bold text-ink mt-0.5">{activePermitView.allowedHours}</p>
              </div>
            </div>

            {/* Workers List */}
            {activePermitView.workersList && (
              <div className="p-3.5 bg-canvas/80 rounded-xl border border-border text-xs space-y-1">
                <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                  Daftar Nama Pekerja & KTP:
                </span>
                <p className="font-medium text-ink whitespace-pre-line">{activePermitView.workersList}</p>
              </div>
            )}

            {/* Description / Notes */}
            {activePermitView.description && (
              <div className="p-3.5 bg-canvas/80 rounded-xl border border-border text-xs space-y-1">
                <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                  Catatan Khusus & Rencana Kerja:
                </span>
                <p className="font-medium text-ink">{activePermitView.description}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = `SURAT IZIN KERJA RENOVASI (SIK) - WARGAHUB\n===========================================\nNomor Dokumen: ${activePermitView.id}\nUnit Rumah: ${activePermitView.houseCode}\nWilayah: ${activePermitView.areaLabel || 'Komplek'}\nPemilik / Pemohon: ${activePermitView.ownerName}\nJenis Pekerjaan: ${activePermitView.workType}\n\nMandor / Kontraktor: ${activePermitView.contractorName}\nNomor Telepon: ${activePermitView.contractorPhone || '-'}\nJumlah Tukang: ${activePermitView.workersCount} Pekerja\nDaftar Pekerja:\n${activePermitView.workersList || '-'}\n\nMasa Berlaku: ${activePermitView.startDate} s/d ${activePermitView.endDate}\nJam Operasional: ${activePermitView.allowedHours}\nStatus Izin: ${activePermitView.status}\n\nCatatan Pengawasan:\n${activePermitView.description || '-'}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus & Pos Satpam Keamanan Komplek`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SURAT_IZIN_RENOVASI_${activePermitView.id}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`Surat Izin Kerja ${activePermitView.id} berhasil diunduh.`);
                }}
                className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary-600" />
                <span>Cetak Surat Izin (SIK)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activePermitView;
                    setActivePermitView(null);
                    handleOpenEditPermit(toEdit);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Edit Data Izin
                </button>
                <button
                  type="button"
                  onClick={() => setActivePermitView(null)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT IZIN RENOVASI ================= */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Hammer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingPermitId ? `Edit Surat Izin: ${editingPermitId}` : 'Terbitkan Surat Izin Renovasi Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Penerbitan surat izin kerja (SIK) tukang untuk pos satpam.</p>
                </div>
              </div>
              <button onClick={() => setShowAddPermitModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Pilih Unit Rumah *</label>
                  <select
                    value={pCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setPCode(code);
                      const matched = properties.find(p => p.code === code);
                      if (matched) {
                        setPAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matched.blockCode}`);
                        if (matched.ownerName) setPOwnerName(matched.ownerName);
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.code}>
                        Unit {p.code} — {p.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemilik / Pemohon *</label>
                  <input
                    type="text"
                    placeholder="Nama Pemilik Unit"
                    value={pOwnerName}
                    onChange={(e) => setPOwnerName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Pekerjaan Renovasi *</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="Pengecatan & Kanopi">Pengecatan & Kanopi</option>
                    <option value="Renovasi Interior & Dapur">Renovasi Interior & Dapur</option>
                    <option value="Perbaikan Atap & Dak Bocor">Perbaikan Atap & Dak Bocor</option>
                    <option value="Pemasangan Solar Panel">Pemasangan Solar Panel</option>
                    <option value="Pembangunan Tingkat / Ekstensi">Pembangunan Tingkat / Ekstensi</option>
                    <option value="Renovasi Taman & Pagar">Renovasi Taman & Pagar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Izin Renovasi</label>
                  <select
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="APPROVED">Disetujui (Approved)</option>
                    <option value="PENDING_REVIEW">Menunggu Review</option>
                    <option value="COMPLETED">Selesai (Completed)</option>
                    <option value="SUSPENDED">Dihentikan Sementara (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="font-bold text-ink block mb-1">Nama Mandor / Kontraktor *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Sugeng (CV Berkah)"
                    value={pContractor}
                    onChange={(e) => setPContractor(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jumlah Tukang</label>
                  <input
                    type="number"
                    min={1}
                    value={pWorkers}
                    onChange={(e) => setPWorkers(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">No. HP / WhatsApp Mandor *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={pContractorPhone}
                    onChange={(e) => setPContractorPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jam Kerja Diizinkan</label>
                  <input
                    type="text"
                    value={pAllowedHours}
                    onChange={(e) => setPAllowedHours(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={pStart}
                    onChange={(e) => setPStart(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={pEnd}
                    onChange={(e) => setPEnd(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Daftar Nama Pekerja & KTP</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: 1. Sugeng (Mandor), 2. Slamet (Tukang Cat), 3. Joko (Tukang Las)"
                  value={pWorkersList}
                  onChange={(e) => setPWorkersList(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Rincian Deskripsi & Catatan Pengawasan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengecatan fasad luar dan perbaikan kanopi garasi"
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPermitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={permitSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
                >
                  {permitSaving ? 'Menyimpan...' : editingPermitId ? 'Perbarui Surat Izin' : 'Terbitkan Izin Renovasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL PERMIT ================= */}
      {showBulkDeletePermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Hapus {selectedPermitIds.length} Izin Renovasi Terpilih?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedPermitIds.length} surat izin renovasi & akses pekerja</strong> yang telah diceklis akan dicabut izin kerjanya dari sistem pos satpam. Tindakan ini akan dicatat dalam Jejak Audit.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Izin Terpilih:
              </span>
              {permits.filter(p => selectedPermitIds.includes(p.id)).map(p => (
                <div key={p.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-mono font-bold text-primary-700">{p.id}</span>
                  <span className="text-ink-muted text-[11px] truncate">Unit {p.houseCode} ({p.workType})</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeletingPermit}
                onClick={() => setShowBulkDeletePermitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeletingPermit}
                onClick={handleConfirmBulkDeletePermit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeletingPermit ? 'Menghapus...' : `Ya, Hapus (${selectedPermitIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INPUT / EDIT METERAN UTILITAS ================= */}
      {showUtilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingUtilityId ? `Edit Utilitas Unit ${uCode}` : 'Catat & Input Meteran Utilitas Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Pencatatan pembacaan meter air PAM, daya PLN, dan iuran IPL.</p>
                </div>
              </div>
              <button onClick={() => setShowUtilityModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUtility} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Pilih Unit Rumah *</label>
                  <select
                    value={uCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setUCode(code);
                      const matchedProp = properties.find(p => p.code === code);
                      if (matchedProp) {
                        setUAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matchedProp.blockCode}`);
                        if (matchedProp.ownerName) setUOwnerName(matchedProp.ownerName);
                      }
                    }}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.code}>
                        Unit {p.code} — {p.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Nama Pemilik / Penghuni *</label>
                  <input
                    type="text"
                    value={uOwnerName}
                    onChange={(e) => setUOwnerName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Daya Listrik PLN</label>
                  <select
                    value={uPlnCapacity}
                    onChange={(e) => setUPlnCapacity(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                  >
                    <option value="1.300 VA">1.300 VA</option>
                    <option value="2.200 VA">2.200 VA</option>
                    <option value="3.500 VA">3.500 VA</option>
                    <option value="4.400 VA">4.400 VA</option>
                    <option value="5.500 VA">5.500 VA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">ID Pelanggan PLN</label>
                  <input
                    type="text"
                    placeholder="Contoh: PLN-5388123490"
                    value={uPlnCustomerId}
                    onChange={(e) => setUPlnCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Nomor Meter PAM</label>
                  <input
                    type="text"
                    placeholder="Contoh: PAM-88301"
                    value={uPamMeterNo}
                    onChange={(e) => setUPamMeterNo(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Stand Bulan Lalu (m³)</label>
                  <input
                    type="number"
                    value={uPamLastMonth}
                    onChange={(e) => setUPamLastMonth(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Stand Bulan Ini (m³)</label>
                  <input
                    type="number"
                    value={uPamThisMonth}
                    onChange={(e) => setUPamThisMonth(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Tarif Iuran IPL (Rp / Bulan)</label>
                  <input
                    type="number"
                    value={uMonthlyIplFee}
                    onChange={(e) => setUMonthlyIplFee(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Status Pembayaran</label>
                  <select
                    value={uPaymentStatus}
                    onChange={(e) => setUPaymentStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="LUNAS">LUNAS (Terverifikasi)</option>
                    <option value="MENUNGGU_BAYAR">MENUNGGU BAYAR</option>
                    <option value="MENUNGGAK">MENUNGGAK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jadwal Angkut Sampah</label>
                  <select
                    value={uWasteSchedule}
                    onChange={(e) => setUWasteSchedule(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="SENIN_RABU_JUMAT">Senin, Rabu, Jumat</option>
                    <option value="SELASA_KAMIS_SABTU">Selasa, Kamis, Sabtu</option>
                    <option value="SETIAP_HARI">Setiap Hari</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-ink">
                    <input
                      type="checkbox"
                      checked={uHasBiopori}
                      onChange={(e) => setUHasBiopori(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span>Lubang Biopori</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-ink">
                    <input
                      type="checkbox"
                      checked={uHasSolarPanel}
                      onChange={(e) => setUHasSolarPanel(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span>Solar Panel</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Catatan Khusus Utilitas</label>
                <input
                  type="text"
                  placeholder="Contoh: Meter air baru dikalibrasi, dilengkapi charging EV"
                  value={uNotes}
                  onChange={(e) => setUNotes(e.target.value)}
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUtilityModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={utilitySaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
                >
                  {utilitySaving ? 'Menyimpan...' : editingUtilityId ? 'Perbarui Utilitas' : 'Simpan Utilitas Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL REKENING & UTILITAS ================= */}
      {activeUtilityView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black shrink-0">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base sm:text-lg text-ink font-mono">Utilitas Unit {activeUtilityView.houseCode}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeUtilityView.paymentStatus === 'LUNAS'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : activeUtilityView.paymentStatus === 'MENUNGGU_BAYAR'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {activeUtilityView.paymentStatus === 'LUNAS' ? '✓ Iuran Lunas' : activeUtilityView.paymentStatus === 'MENUNGGU_BAYAR' ? '⏳ Menunggu Bayar' : '✕ Menunggak'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {activeUtilityView.ownerName} • {activeUtilityView.areaLabel || 'Komplek'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveUtilityView(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Utility Full Grid Specs */}
            <div className="p-4 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik PLN:</span>
                <p className="font-bold text-amber-800 text-sm mt-0.5">{activeUtilityView.plnCapacity}</p>
                <span className="text-[10px] text-ink-muted font-mono">{activeUtilityView.plnCustomerId || 'ID: Belum diisi'}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Nomor Meteran PAM:</span>
                <p className="font-mono font-bold text-ink text-sm mt-0.5">{activeUtilityView.pamMeterNo || 'PAM-88301'}</p>
                <span className="text-[10px] text-ink-muted">Stand: {activeUtilityView.pamReadingLastMonth || 0} m³ → {activeUtilityView.pamReadingThisMonth || activeUtilityView.pamUsage || 0} m³</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Total Pemakaian Air Bulan Ini:</span>
                <p className="font-bold text-sky-800 text-sm mt-0.5">{activeUtilityView.pamUsage} m³ (Kubik)</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Tarif Iuran Lingkungan (IPL):</span>
                <p className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                  Rp {(activeUtilityView.monthlyIplFee || 750000).toLocaleString('id-ID')} / bln
                </p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Jadwal Angkut Sampah:</span>
                <p className="font-bold text-ink mt-0.5">{activeUtilityView.wasteSchedule?.replace(/_/g, ' ') || 'SENIN RABU JUMAT'}</p>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted font-bold block">Fasilitas Ramah Lingkungan:</span>
                <p className="font-medium text-ink mt-0.5">
                  {activeUtilityView.hasBiopori ? '✓ Lubang Biopori' : '✕ Belum ada biopori'} • {activeUtilityView.hasSolarPanel ? '✓ Solar Panel' : 'Tanpa Solar'}
                </p>
              </div>
            </div>

            {activeUtilityView.notes && (
              <div className="p-3 bg-canvas/80 rounded-xl border border-border text-xs">
                <span className="text-[10px] text-ink-muted font-bold block">Catatan Khusus Utilitas:</span>
                <p className="font-medium text-ink mt-0.5">{activeUtilityView.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = `LEMBAR REKENING & UTILITAS UNIT - WARGAHUB\n==========================================\nUnit Rumah: ${activeUtilityView.houseCode}\nNama Pemilik: ${activeUtilityView.ownerName}\nWilayah: ${activeUtilityView.areaLabel || 'Komplek'}\n\nLISTRIK PLN:\n- Daya: ${activeUtilityView.plnCapacity}\n- ID Pelanggan: ${activeUtilityView.plnCustomerId || '-'}\n- Solar Panel: ${activeUtilityView.hasSolarPanel ? 'Ada (Aktif)' : 'Tidak Ada'}\n\nAIR BERSIH PAM:\n- Nomor Meteran: ${activeUtilityView.pamMeterNo || '-'}\n- Stand Lalu: ${activeUtilityView.pamReadingLastMonth || 0} m³\n- Stand Kini: ${activeUtilityView.pamReadingThisMonth || 0} m³\n- Total Pemakaian: ${activeUtilityView.pamUsage} m³\n\nIURAN PENGELOLAAN LINGKUNGAN (IPL):\n- Tarif Bulanan: Rp ${(activeUtilityView.monthlyIplFee || 0).toLocaleString('id-ID')}\n- Status Pembayaran: ${activeUtilityView.paymentStatus}\n- Jadwal Sampah: ${activeUtilityView.wasteSchedule || '-'}\n- Lubang Biopori: ${activeUtilityView.hasBiopori ? 'Ada' : 'Tidak Ada'}\n\nCatatan: ${activeUtilityView.notes || '-'}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nBendahara & Pengurus Komplek`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `REKENING_UTILITAS_${activeUtilityView.houseCode}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`Slip rekening utilitas Unit ${activeUtilityView.houseCode} berhasil diunduh.`);
                }}
                className="px-3.5 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary-600" />
                <span>Cetak Rekening Utilitas</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeUtilityView;
                    setActiveUtilityView(null);
                    handleOpenEditUtility(toEdit);
                  }}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Edit Utilitas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUtilityView(null)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL UTILITAS ================= */}
      {showBulkDeleteUtilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Reset / Hapus {selectedUtilityIds.length} Catatan Utilitas Terpilih?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedUtilityIds.length} catatan meteran air PAM & daya PLN</strong> yang telah diceklis akan direset. Tindakan ini akan dicatat dalam Jejak Audit Keamanan.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Unit Terpilih:
              </span>
              {utilities.filter(u => selectedUtilityIds.includes(u.id)).map(u => (
                <div key={u.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-mono font-bold text-primary-700">Unit {u.houseCode}</span>
                  <span className="text-ink-muted text-[11px] truncate">{u.ownerName} ({u.plnCapacity}, {u.pamUsage} m³)</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeletingUtility}
                onClick={() => setShowBulkDeleteUtilityModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeletingUtility}
                onClick={handleConfirmBulkDeleteUtility}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeletingUtility ? 'Mereset...' : `Ya, Reset / Hapus (${selectedUtilityIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS MASSAL (BULK DELETE PROPERTIES) ================= */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">
                Hapus {selectedPropertyIds.length} Unit Rumah Terpilih?
              </h3>
              <p className="text-xs text-ink-muted">
                Sebanyak <strong>{selectedPropertyIds.length} unit rumah / kavling</strong> yang telah diceklis akan dinonaktifkan dari direktori master. Tindakan ini akan tercatat dalam Jejak Audit Keamanan.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto p-3 bg-canvas rounded-2xl border border-border space-y-1.5 text-xs">
              <span className="text-[10px] text-ink-muted font-bold block uppercase tracking-wider">
                Daftar Unit Terpilih:
              </span>
              {properties.filter(p => selectedPropertyIds.includes(p.id)).map(p => (
                <div key={p.id} className="flex items-center justify-between text-ink py-0.5">
                  <span className="font-bold text-primary-700">Unit {p.code}</span>
                  <span className="text-ink-muted text-[11px] truncate max-w-[200px]">{p.ownerName || p.address}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeleting ? 'Menghapus...' : `Ya, Hapus (${selectedPropertyIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS UTILITAS ================= */}
      {utilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Reset Utilitas {utilityToDelete.houseCode}?</h3>
              <p className="text-xs text-ink-muted">
                Catatan meteran dan data utilitas untuk Unit <strong>{utilityToDelete.houseCode}</strong> akan direset.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUtilityToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUtility}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs text-xs"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS PERMIT ================= */}
      {permitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Izin {permitToDelete.id}?</h3>
              <p className="text-xs text-ink-muted">
                Izin renovasi untuk Unit <strong>{permitToDelete.houseCode}</strong> ({permitToDelete.workType}) akan dihapus.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPermitToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePermit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs text-xs"
              >
                Ya, Hapus Izin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS KENDARAAN ================= */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Kendaraan {vehicleToDelete.plateNumber}?</h3>
              <p className="text-xs text-ink-muted">
                Kendaraan <strong>{vehicleToDelete.plateNumber}</strong> milik Unit <strong>{vehicleToDelete.houseCode}</strong> akan dicabut hak akses RFID-nya.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs text-xs"
              >
                Ya, Hapus Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS RUMAH ================= */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Unit {propertyToDelete.code}?</h3>
              <p className="text-xs text-ink-muted">
                Unit <strong>{propertyToDelete.address}</strong> akan dinonaktifkan dari direktori master.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50 text-xs"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Unit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PropertiesManager: React.FC<PropertiesManagerProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="Kendala Memuat Data Rumah & Warga">
      <PropertiesManagerInner {...props} />
    </ErrorBoundary>
  );
};
