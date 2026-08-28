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
  Ban,
  Receipt,
  Gauge,
  Sun,
  Leaf,
  Trash
} from 'lucide-react';
import type { PropertyListItem } from '../../services/property.service';

interface PropertiesManagerProps {
  initialProperties: PropertyListItem[];
  initialTab?: string;
}

export const PropertiesManager: React.FC<PropertiesManagerProps> = ({
  initialProperties,
  initialTab = 'units'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'units' | 'residents' | 'vehicles' | 'permits' | 'analytics'>('units');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [properties, setProperties] = useState<PropertyListItem[]>(initialProperties);
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'owner' | 'status' | 'residents'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Property Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Property Modal State (Complete Columns + Blok/Kav/Jalan)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyListItem | null>(null);

  // Area Naming Type: BLOK (Blok A), KAV (Kavling/Kav 12), STREET (Jl. Sariwangi Indah 1), CLUSTER (Cluster)
  const [namingType, setNamingType] = useState<'BLOK' | 'KAV' | 'STREET' | 'CLUSTER'>('BLOK');
  const [formAreaName, setFormAreaName] = useState('Blok A');
  const [formCode, setFormCode] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOccupancy, setFormOccupancy] = useState<'OWNER_OCCUPIED' | 'RENTED' | 'VACANT' | 'RENOVATION'>('OWNER_OCCUPIED');
  const [formOwner, setFormOwner] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('');
  const [formOwnerNik, setFormOwnerNik] = useState('');
  const [formBuildingType, setFormBuildingType] = useState('Tipe 72/120');
  const [formLandArea, setFormLandArea] = useState(120);
  const [formBuildingArea, setFormBuildingArea] = useState(72);
  const [formPlnCapacity, setFormPlnCapacity] = useState('3.500 VA');
  const [formPamMeterNo, setFormPamMeterNo] = useState('PAM-88301');
  const [formMonthlyRate, setFormMonthlyRate] = useState(750000);
  const [formHandoverDate, setFormHandoverDate] = useState('2024-01-15');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal State (Property)
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Renovasi Penggabungan Unit / Koreksi Data');
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    { id: 'res-5', houseCode: 'A-01', areaLabel: 'Blok A', fullName: 'Hendra Gunawan', relation: 'KEPALA_KELUARGA', gender: 'LAKI_LAKI', birthPlaceDate: 'Semarang, 01-01-1980', religion: 'KRISTEN', occupation: 'Eksekutif Perbankan', phone: '0811-2233-4455', email: 'hendra.gunawan@wargahub.id', idCard: '3171090101800001', familyCard: '3171090101800000', domicileStatus: 'KTP_SETEMPAT', bloodType: 'B', isEmergency: true, status: 'VERIFIED', notes: '-' },
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
      depositStatus: 'SUDAH_SETOR',
      depositAmount: 2000000,
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
      depositStatus: 'SUDAH_SETOR',
      depositAmount: 3000000,
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
      depositStatus: 'BELUM_SETOR',
      depositAmount: 1000000,
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
      depositStatus: 'DIKEMBALIKAN',
      depositAmount: 2500000,
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
      depositStatus: 'SUDAH_SETOR',
      depositAmount: 5000000,
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
  const [pDepositStatus, setPDepositStatus] = useState('SUDAH_SETOR');
  const [pDepositAmount, setPDepositAmount] = useState(2000000);
  const [pStatus, setPStatus] = useState<'APPROVED' | 'PENDING_REVIEW' | 'COMPLETED' | 'SUSPENDED'>('APPROVED');
  const [pDesc, setPDesc] = useState('');
  const [permitSaving, setPermitSaving] = useState(false);

  // ================= UTILITIES & OCCUPANCY COMPREHENSIVE STATE =================
  const [utilitySearch, setUtilitySearch] = useState('');
  const [utilityPlnFilter, setUtilityPlnFilter] = useState('ALL');
  const [utilityPaymentFilter, setUtilityPaymentFilter] = useState('ALL');
  const [utilitySortBy, setUtilitySortBy] = useState<'houseCode' | 'plnCapacity' | 'pamUsage' | 'monthlyIplFee' | 'paymentStatus'>('houseCode');
  const [utilitySortOrder, setUtilitySortOrder] = useState<'asc' | 'desc'>('asc');
  const [utilityCurrentPage, setUtilityCurrentPage] = useState(1);
  const [utilityPageSize, setUtilityPageSize] = useState(10);

  const [utilities, setUtilities] = useState([
    { id: 'UTIL-A-17', houseCode: 'A-17', areaLabel: 'Blok A', ownerName: 'Budi Santoso', plnCapacity: '3.500 VA', plnCustomerId: 'PLN-5388123490', pamMeterNo: 'PAM-88301', pamReadingLastMonth: 124, pamReadingThisMonth: 142, pamUsage: 18, monthlyIplFee: 750000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: false, paymentStatus: 'LUNAS', notes: 'Meter air baru dikalibrasi' },
    { id: 'UTIL-A-01', houseCode: 'A-01', areaLabel: 'Blok A', ownerName: 'Hendra Gunawan', plnCapacity: '5.500 VA', plnCustomerId: 'PLN-5388123491', pamMeterNo: 'PAM-88302', pamReadingLastMonth: 150, pamReadingThisMonth: 174, pamUsage: 24, monthlyIplFee: 850000, wasteSchedule: 'SENIN_RABU_JUMAT', hasBiopori: true, hasSolarPanel: true, paymentStatus: 'LUNAS', notes: 'Solar panel on-grid 3 kWp' },
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

  // Utility Form Fields
  const [uCode, setUCode] = useState('A-17');
  const [uAreaLabel, setUAreaLabel] = useState('Blok A');
  const [uOwnerName, setUOwnerName] = useState('Budi Santoso');
  const [uPlnCapacity, setUPlnCapacity] = useState('3.500 VA');
  const [uPlnCustomerId, setUPlnCustomerId] = useState('PLN-5388123490');
  const [uPamMeterNo, setUPamMeterNo] = useState('PAM-88301');
  const [uPamLastMonth, setUPamLastMonth] = useState(124);
  const [uPamThisMonth, setUPamThisMonth] = useState(142);
  const [uMonthlyIplFee, setUMonthlyIplFee] = useState(750000);
  const [uWasteSchedule, setUWasteSchedule] = useState('SENIN_RABU_JUMAT');
  const [uHasBiopori, setUHasBiopori] = useState(true);
  const [uHasSolarPanel, setUHasSolarPanel] = useState(false);
  const [uPaymentStatus, setUPaymentStatus] = useState<'LUNAS' | 'MENUNGGU_BAYAR' | 'MENUNGGAK'>('LUNAS');
  const [uNotes, setUNotes] = useState('');
  const [utilitySaving, setUtilitySaving] = useState(false);

  // Open Add Utility Modal
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
        notes: uNotes || undefined,
      };

      const res = await fetch('/api/properties/utilities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const pamUsage = Math.max(0, Number(uPamThisMonth) - Number(uPamLastMonth));
        if (editingUtilityId) {
          setUtilities(utilities.map(item => item.id === editingUtilityId ? {
            ...item,
            ...payload,
            pamUsage,
          } : item));
          showToast(`Data utilitas ${uCode} berhasil diperbarui.`);
        } else {
          const newUtil = {
            id: `UTIL-${uCode.toUpperCase()}`,
            ...payload,
            pamUsage,
          };
          setUtilities([newUtil, ...utilities]);
          showToast(`Catatan utilitas ${uCode} berhasil ditambahkan.`);
        }
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
        setUtilities(utilities.filter(u => u.id !== utilityToDelete.id));
        showToast(`Catatan utilitas ${utilityToDelete.houseCode} berhasil direset/dihapus.`);
        setUtilityToDelete(null);
        if (activeUtilityView?.id === utilityToDelete.id) setActiveUtilityView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data utilitas.');
    }
  };

  // Filtered & Sorted Utilities
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

  const handleExportPropertiesCSV = () => {
    const headers = ['Kode Unit', 'Nomor', 'Blok / Kav / Jalan', 'Alamat Lengkap', 'Status Hunian', 'Nama Pemilik / Penghuni', 'Jumlah Penghuni', 'Jumlah Kendaraan'];
    const rows = properties.map((p) => [
      p.code,
      p.number,
      p.code.startsWith('KAV') ? 'Kavling' : p.code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${p.blockCode}`,
      `"${p.address}"`,
      p.occupancyStatus,
      `"${p.ownerName || '-'}"`,
      p.residentCount,
      p.vehicleCount,
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
    const headers = ['ID Izin', 'No Unit', 'Wilayah', 'Jenis Renovasi', 'Mandor / Kontraktor', 'No WA Mandor', 'Jumlah Tukang', 'Masa Mulai', 'Masa Selesai', 'Jam Kerja', 'Status Jaminan Deposit', 'Nominal Deposit (Rp)', 'Status Izin', 'Rincian Pekerjaan'];
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
      p.depositStatus,
      p.depositAmount,
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-ink">Tata Kelola Rumah & Warga</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs font-black border border-primary-200">
              {activeSubTab === 'analytics'
                ? `${utilities.length} Unit Utilitas`
                : activeSubTab === 'permits'
                ? `${permits.length} Izin Renovasi`
                : activeSubTab === 'vehicles'
                ? `${vehicles.length} Kendaraan Terdaftar`
                : activeSubTab === 'residents'
                ? `${residents.length} Jiwa Sensus`
                : `${properties.length} Unit Terdaftar`}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Master unit hunian komplek (Mendukung sistem <strong>Blok</strong>, <strong>Kavling (Kav.)</strong>, maupun <strong>Per Jalan / Cluster</strong> seperti Sariwangi Indah 1, 2, dst).
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <Download className="w-4 h-4 text-ink-muted" />
            {activeSubTab === 'analytics'
              ? 'Ekspor Utilitas (CSV)'
              : activeSubTab === 'permits'
              ? 'Ekspor Izin (CSV)'
              : activeSubTab === 'vehicles'
              ? 'Ekspor Kendaraan (CSV)'
              : activeSubTab === 'residents'
              ? 'Ekspor Sensus (CSV)'
              : 'Ekspor CSV'}
          </button>
          
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

      {/* 5-SubTab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'units', label: 'Direktori Rumah & Kavling', icon: Home, count: properties.length },
          { id: 'residents', label: 'Database Kependudukan & Penghuni', icon: Users, count: residents.length },
          { id: 'vehicles', label: 'Master Kendaraan & RFID', icon: Car, count: vehicles.length },
          { id: 'permits', label: 'Izin Renovasi & Tukang', icon: Hammer, count: permits.filter(p => p.status === 'APPROVED').length },
          { id: 'analytics', label: 'Okupansi & Utilitas', icon: TrendingUp, count: utilities.length },
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

      {/* ================= SUBTAB 1: DIREKTORI RUMAH & KAVLING ================= */}
      {activeSubTab === 'units' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Hunian & Kav</span>
              <p className="text-xl font-black text-ink mt-0.5">{properties.length} Unit</p>
              <span className="text-[10px] text-emerald-600 font-bold">Blok / Kavling / Jalan</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Dihuni Pemilik</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {properties.filter(p => p.occupancyStatus === 'OWNER_OCCUPIED').length} Unit
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Okupansi Utama</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Disewa / Kontrak</span>
              <p className="text-xl font-black text-blue-700 mt-0.5">
                {properties.filter(p => p.occupancyStatus === 'RENTED').length} Unit
              </p>
              <span className="text-[10px] text-blue-600 font-bold">Warga Sewa</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Kosong / Renovasi</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">
                {properties.filter(p => p.occupancyStatus === 'VACANT' || p.occupancyStatus === 'RENOVATION').length} Unit
              </p>
              <span className="text-[10px] text-amber-600 font-bold">Belum Dihuni</span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari kode/kav/jalan (cth: A-17, Kav 5, Sariwangi)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedBlock}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Wilayah (Blok / Kav / Jalan)</option>
                <option value="A">Blok A</option>
                <option value="B">Blok B</option>
                <option value="C">Blok C</option>
                <option value="D">Blok D</option>
                <option value="KAV">Kavling (Kav.)</option>
                <option value="SARIWANGI_1">Jl. Sariwangi Indah 1</option>
                <option value="SARIWANGI_2">Jl. Sariwangi Indah 2</option>
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
                <option value="code">Urut Kode / Kav</option>
                <option value="owner">Urut Nama Pemilik</option>
                <option value="status">Urut Status Okupansi</option>
                <option value="residents">Urut Jumlah Penghuni</option>
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

          {/* VIEW 1: TABLE */}
          {viewMode === 'table' && (
            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                      <th className="py-3.5 px-4">Kode / Kavling</th>
                      <th className="py-3.5 px-4">Wilayah / Alamat Jalan</th>
                      <th className="py-3.5 px-4">Status Hunian</th>
                      <th className="py-3.5 px-4">Kepala Rumah / Pemilik</th>
                      <th className="py-3.5 px-4 text-center">Penghuni</th>
                      <th className="py-3.5 px-4 text-center">Kendaraan</th>
                      <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-canvas/60 text-ink transition-colors">
                        <td className="py-3.5 px-4 font-bold text-sm text-primary-700 flex items-center gap-2">
                          <Home className="w-4 h-4 text-primary-600" />
                          <span>Unit {prop.code}</span>
                        </td>
                        <td className="py-3.5 px-4 text-ink-muted font-medium">
                          <span className="font-semibold text-ink block">{prop.address}</span>
                          <span className="text-[10px] text-ink-muted">{prop.blockCode ? `Blok ${prop.blockCode}` : 'Wilayah Komplek'}</span>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(prop.occupancyStatus)}</td>
                        <td className="py-3.5 px-4 font-black text-ink">{prop.ownerName || '-'}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-ink">{prop.residentCount || 3} Jiwa</td>
                        <td className="py-3.5 px-4 text-center font-bold text-ink">{prop.vehicleCount || 1} Unit</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveProperty(prop)}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalItems}</strong> unit
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-ink">Hal {currentPage} / {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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
                        onClick={() => setActiveProperty(p)}
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

      {/* ================= SUBTAB 2: DATABASE KEPENDUDUKAN ================= */}
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

          {/* SENSUS TABLE */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
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
                  {paginatedResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-700">{r.houseCode}</td>
                      <td className="py-3.5 px-4 font-bold text-ink">{r.fullName}</td>
                      <td className="py-3.5 px-4">{getRelationBadge(r.relation)}</td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">{r.idCard}</td>
                      <td className="py-3.5 px-4 font-medium text-ink">{r.occupation}</td>
                      <td className="py-3.5 px-4 font-mono">{r.phone}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditResident(r)}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setResidentToDelete(r)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

          {/* VEHICLES TABLE */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">Plat Nomor</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Pemilik</th>
                    <th className="py-3.5 px-4">Jenis</th>
                    <th className="py-3.5 px-4">Merk & Tipe</th>
                    <th className="py-3.5 px-4">Tag RFID</th>
                    <th className="py-3.5 px-4 text-center">Status RFID</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-ink">{v.plateNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-primary-700">{v.houseCode}</td>
                      <td className="py-3.5 px-4 font-bold text-ink">{v.ownerName}</td>
                      <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-canvas font-bold">{v.type}</span></td>
                      <td className="py-3.5 px-4">{v.brand} {v.model}</td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">{v.rfidTag}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRfid(v.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${v.rfidStatus === 'AKTIF' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}
                        >
                          {v.rfidStatus === 'AKTIF' ? '✓ AKTIF' : '✕ DIBLOKIR'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPassVehicle(v)}
                          className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVehicle(v)}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVehicleToDelete(v)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
              <span className="text-[11px] text-ink-muted font-medium">Total Jaminan Deposit</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">
                Rp {(permits.reduce((acc, p) => p.depositStatus === 'SUDAH_SETOR' ? acc + (p.depositAmount || 0) : acc, 0) / 1000000).toFixed(1)} Jt
              </p>
              <span className="text-[10px] text-ink-muted">Uang Jaminan</span>
            </div>
          </div>

          {/* PERMITS TABLE */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">ID Permit</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Jenis Renovasi</th>
                    <th className="py-3.5 px-4">Mandor</th>
                    <th className="py-3.5 px-4">Masa Berlaku</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedPermits.map((p) => (
                    <tr key={p.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-primary-700">{p.id}</td>
                      <td className="py-3.5 px-4 font-bold">{p.houseCode}</td>
                      <td className="py-3.5 px-4 font-extrabold">{p.workType}</td>
                      <td className="py-3.5 px-4">{p.contractorName} ({p.workersCount} Tukang)</td>
                      <td className="py-3.5 px-4">{p.startDate} s/d {p.endDate}</td>
                      <td className="py-3.5 px-4">{getPermitStatusBadge(p.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPrintPermit(p)}
                          className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditPermit(p)}
                          className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermitToDelete(p)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ================= SUBTAB 5: OKUPANSI & UTILITAS (COMPREHENSIVE FULL SUITE) ================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
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

          {/* Visual Progress & Eco-Green Initiative Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sebaran Okupansi per Wilayah */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                Sebaran Okupansi per Wilayah (Blok, Kavling, Jalan)
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { block: 'Blok A (Taman Sejahtera A)', rate: '96.7%', filled: 29, total: 30, color: 'bg-emerald-500' },
                  { block: 'Blok B (Jl. Sariwangi Indah 1)', rate: '90.0%', filled: 27, total: 30, color: 'bg-blue-500' },
                  { block: 'Blok C (Area Kavling Cluster)', rate: '93.3%', filled: 28, total: 30, color: 'bg-indigo-500' },
                  { block: 'Blok D (Jl. Sariwangi Indah 2)', rate: '96.7%', filled: 29, total: 30, color: 'bg-purple-500' },
                ].map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{b.block} ({b.filled}/{b.total} Unit)</span>
                      <span className="font-mono text-primary-700 font-bold">{b.rate}</span>
                    </div>
                    <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
                      <div className={`h-full ${b.color}`} style={{ width: b.rate }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inisiatif Eco-Green & Daya PLN */}
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Inisiatif Eco-Green Lingkungan & Daya Listrik
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Droplets className="w-4 h-4 text-emerald-600" />
                    <span>Sumur Resapan Biopori</span>
                  </div>
                  <p className="text-xl font-black text-emerald-900 mt-1">92 Unit</p>
                  <span className="text-[10px] text-emerald-700">76.7% Terpasang Biopori</span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>Solar Panel Rooftop</span>
                  </div>
                  <p className="text-xl font-black text-amber-900 mt-1">16 Unit</p>
                  <span className="text-[10px] text-amber-700">On-Grid PLTS Warga</span>
                </div>

                <div className="col-span-2 p-3 bg-canvas rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash className="w-4 h-4 text-primary-600" />
                    <div>
                      <p className="font-bold text-ink text-xs">Jadwal Pengangkutan Sampah Komplek</p>
                      <p className="text-[10px] text-ink-muted">Senin, Rabu, Jumat & Sabtu (Pagi 06:30 WIB)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-800 text-[10px] font-black">
                    TERPADU
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar for Utilities Table */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari unit, nama, no meter PAM, ID PLN..."
                value={utilitySearch}
                onChange={(e) => {
                  setUtilitySearch(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={utilityPlnFilter}
                onChange={(e) => {
                  setUtilityPlnFilter(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Daya Listrik</option>
                <option value="1.300 VA">1.300 VA</option>
                <option value="2.200 VA">2.200 VA</option>
                <option value="3.500 VA">3.500 VA</option>
                <option value="4.400 VA">4.400 VA</option>
                <option value="5.500 VA">5.500 VA</option>
                <option value="7.700 VA">7.700 VA</option>
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
                <option value="houseCode">Urut Nomor Unit</option>
                <option value="pamUsage">Urut Pemakaian Air</option>
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

          {/* MASTER UTILITY & METER READING TABLE */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">No Unit / Wilayah</th>
                    <th className="py-3.5 px-4">Penghuni / Pemilik</th>
                    <th className="py-3.5 px-4">Daya Listrik PLN</th>
                    <th className="py-3.5 px-4">Meter Air PAM & Pemakaian</th>
                    <th className="py-3.5 px-4">Iuran IPL Bulanan</th>
                    <th className="py-3.5 px-4 text-center">Fitur Eco-Green</th>
                    <th className="py-3.5 px-4 text-center">Status Bayar</th>
                    <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedUtilities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada catatan meteran utilitas yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedUtilities.map((u) => (
                      <tr key={u.id} className="hover:bg-canvas/60 text-ink transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-700">
                          <span className="block text-sm font-black">{u.houseCode}</span>
                          <span className="text-[10px] text-ink-muted">{u.areaLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-ink">{u.ownerName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {u.plnCapacity}
                          </span>
                          <span className="text-[10px] font-mono text-ink-muted block mt-0.5">{u.plnCustomerId}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-ink">{u.pamUsage} m³ <span className="text-[10px] text-ink-muted">({u.pamReadingLastMonth} ➔ {u.pamReadingThisMonth})</span></p>
                          <span className="text-[10px] font-mono text-ink-muted">{u.pamMeterNo}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-ink">
                          Rp {u.monthlyIplFee.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {u.hasBiopori && (
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[9px] font-bold" title="Sumur Resapan Biopori Aktif">
                                Biopori
                              </span>
                            )}
                            {u.hasSolarPanel && (
                              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[9px] font-bold" title="Solar Panel Rooftop">
                                Solar
                              </span>
                            )}
                            {!u.hasBiopori && !u.hasSolarPanel && (
                              <span className="text-ink-muted text-[10px]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                            u.paymentStatus === 'LUNAS'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : u.paymentStatus === 'MENUNGGAK'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {u.paymentStatus === 'LUNAS' ? '✓ LUNAS' : u.paymentStatus === 'MENUNGGAK' ? '✕ TUNGGAK' : '⏱ MENUNGGU'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveUtilityView(u)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors font-bold text-xs"
                              title="Lihat Rincian Utilitas & Rekening"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUtility(u)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors font-bold text-xs"
                              title="Edit Catatan Meteran"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setUtilityToDelete(u)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-bold text-xs"
                              title="Reset Catatan Meteran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* UTILITY PAGINATION BAR */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalUtilities === 0 ? 0 : utilStartIndex + 1}</strong> - <strong className="text-ink">{utilEndIndex}</strong> dari <strong className="text-ink">{totalUtilities}</strong> unit utilitas
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={utilityPageSize}
                    onChange={(e) => {
                      setUtilityPageSize(Number(e.target.value));
                      setUtilityCurrentPage(1);
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
                  onClick={() => setUtilityCurrentPage(1)}
                  disabled={safeUtilityPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUtilityCurrentPage(safeUtilityPage - 1)}
                  disabled={safeUtilityPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalUtilityPages) }, (_, i) => {
                    let pageNum = safeUtilityPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalUtilityPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setUtilityCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safeUtilityPage === pageNum
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
                  onClick={() => setUtilityCurrentPage(safeUtilityPage + 1)}
                  disabled={safeUtilityPage === totalUtilityPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUtilityCurrentPage(totalUtilityPages)}
                  disabled={safeUtilityPage === totalUtilityPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL REKENING & UTILITAS ================= */}
      {activeUtilityView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">Utilitas Unit {activeUtilityView.houseCode}</h3>
                  <p className="text-xs text-ink-muted">{activeUtilityView.ownerName} • {activeUtilityView.areaLabel}</p>
                </div>
              </div>
              <button onClick={() => setActiveUtilityView(null)} className="p-1 rounded-full text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik PLN:</span>
                  <p className="font-bold text-amber-800 text-sm mt-0.5">{activeUtilityView.plnCapacity}</p>
                  <p className="font-mono text-[10px] text-ink-muted">{activeUtilityView.plnCustomerId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Meteran Air Bersih (PAM):</span>
                  <p className="font-bold text-sky-800 text-sm mt-0.5">{activeUtilityView.pamUsage} m³ (Bulan Ini)</p>
                  <p className="font-mono text-[10px] text-ink-muted">{activeUtilityView.pamMeterNo}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Iuran Lingkungan (IPL):</span>
                  <p className="font-mono font-bold text-emerald-800 text-sm mt-0.5">Rp {activeUtilityView.monthlyIplFee.toLocaleString('id-ID')} / bln</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Status Pembayaran:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-200 mt-0.5 inline-block">
                    {activeUtilityView.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Jadwal Angkut Sampah:</span>
                  <p className="font-medium text-ink mt-0.5">{activeUtilityView.wasteSchedule.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Status Eco-Green:</span>
                  <p className="font-medium text-ink mt-0.5">
                    Biopori: {activeUtilityView.hasBiopori ? '✓ Ada' : '✕ Belum'} • Solar: {activeUtilityView.hasSolarPanel ? '✓ Ada' : '✕ Belum'}
                  </p>
                </div>
              </div>

              {activeUtilityView.notes && (
                <div className="p-3 bg-canvas/60 rounded-xl border border-border">
                  <span className="text-[10px] text-ink-muted font-bold block">Catatan Khusus Utilitas:</span>
                  <p className="font-medium text-ink mt-0.5">{activeUtilityView.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak lembar rekening pemakaian utilitas Unit ${activeUtilityView.houseCode}`);
                  setActiveUtilityView(null);
                }}
                className="px-4 py-2 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Lembar Rekening
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = activeUtilityView;
                    setActiveUtilityView(null);
                    handleOpenEditUtility(toEdit);
                  }}
                  className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUtilityView(null)}
                  className="px-5 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-xs text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INPUT / EDIT METERAN UTILITAS ================= */}
      {showUtilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
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

            <form onSubmit={handleSaveUtility} className="space-y-3.5 text-xs">
              {/* Seksi 1: Lokasi Unit & Penghuni */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-primary-600" />
                  1. Unit Rumah & Pemilik
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Pilih Unit Rumah / Kavling *</label>
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
                      className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.code}>
                          {p.code} — {p.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">Nama Penghuni / Pemilik *</label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap Pemilik"
                      value={uOwnerName}
                      onChange={(e) => setUOwnerName(e.target.value)}
                      required
                      className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 2: Meteran PLN & Air PAM */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  2. Utilitas Listrik PLN & Air Bersih PAM
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Kapasitas Daya PLN *</label>
                    <select
                      value={uPlnCapacity}
                      onChange={(e) => setUPlnCapacity(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono font-bold text-ink"
                    >
                      <option value="1.300 VA">1.300 VA</option>
                      <option value="2.200 VA">2.200 VA</option>
                      <option value="3.500 VA">3.500 VA</option>
                      <option value="4.400 VA">4.400 VA</option>
                      <option value="5.500 VA">5.500 VA</option>
                      <option value="7.700 VA">7.700 VA</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">ID Pelanggan PLN</label>
                    <input
                      type="text"
                      placeholder="PLN-5388xxxx"
                      value={uPlnCustomerId}
                      onChange={(e) => setUPlnCustomerId(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">No Meter PAM</label>
                    <input
                      type="text"
                      placeholder="PAM-88301"
                      value={uPamMeterNo}
                      onChange={(e) => setUPamMeterNo(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Meter Lalu (m³)</label>
                    <input
                      type="number"
                      value={uPamLastMonth}
                      onChange={(e) => setUPamLastMonth(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Meter Ini (m³)</label>
                    <input
                      type="number"
                      value={uPamThisMonth}
                      onChange={(e) => setUPamThisMonth(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Iuran IPL, Sampah & Eco-Green */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  3. Iuran IPL, Jadwal Sampah & Inisiatif Eco-Green
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Tarif IPL (Rp/bln)</label>
                    <input
                      type="number"
                      value={uMonthlyIplFee}
                      onChange={(e) => setUMonthlyIplFee(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Jadwal Sampah</label>
                    <select
                      value={uWasteSchedule}
                      onChange={(e) => setUWasteSchedule(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="SENIN_RABU_JUMAT">Senin, Rabu, Jumat</option>
                      <option value="SELASA_KAMIS_SABTU">Selasa, Kamis, Sabtu</option>
                      <option value="SETIAP_HARI">Setiap Hari</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Status Bayar</label>
                    <select
                      value={uPaymentStatus}
                      onChange={(e) => setUPaymentStatus(e.target.value as any)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="LUNAS">LUNAS</option>
                      <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                      <option value="MENUNGGAK">Menunggak</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Sumur Resapan Biopori</label>
                    <select
                      value={uHasBiopori ? 'YES' : 'NO'}
                      onChange={(e) => setUHasBiopori(e.target.value === 'YES')}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="YES">Ada (Aktif)</option>
                      <option value="NO">Belum Ada</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Solar Panel Rooftop</label>
                    <select
                      value={uHasSolarPanel ? 'YES' : 'NO'}
                      onChange={(e) => setUHasSolarPanel(e.target.value === 'YES')}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="NO">Belum Terpasang</option>
                      <option value="YES">Terpasang (On-Grid)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Catatan Khusus Utilitas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pompa booster terpasang / Meter air baru dikalibrasi"
                    value={uNotes}
                    onChange={(e) => setUNotes(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUtilityModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={utilitySaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {utilitySaving ? 'Menyimpan...' : editingUtilityId ? 'Perbarui Utilitas' : 'Simpan Utilitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI RESET / HAPUS UTILITAS ================= */}
      {utilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Reset Utilitas {utilityToDelete.houseCode}?</h3>
              <p className="text-xs text-ink-muted">
                Catatan meteran dan data utilitas untuk Unit <strong>{utilityToDelete.houseCode}</strong> ({utilityToDelete.ownerName}) akan direset. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
              <span className="font-bold block">Alasan Reset / Penghapusan:</span>
              <select
                value={utilityDeleteReason}
                onChange={(e) => setUtilityDeleteReason(e.target.value)}
                className="w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs"
              >
                <option value="Meteran Diganti Baru / Dikalibrasi Ulang">Meteran Diganti Baru / Kalibrasi Ulang</option>
                <option value="Koreksi Input Pembacaan Meter">Koreksi Input Pembacaan Meter</option>
                <option value="Unit Kosong / Nonaktif">Unit Kosong / Nonaktif</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUtilityToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUtility}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS IZIN RENOVASI ================= */}
      {permitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Izin {permitToDelete.id}?</h3>
              <p className="text-xs text-ink-muted">
                Izin renovasi untuk Unit <strong>{permitToDelete.houseCode}</strong> ({permitToDelete.workType}) oleh <strong>{permitToDelete.contractorName}</strong> akan dihapus dan dicabut dari sistem pos satpam. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
              <span className="font-bold block">Alasan Pembatalan / Penghapusan:</span>
              <select
                value={permitDeleteReason}
                onChange={(e) => setPermitDeleteReason(e.target.value)}
                className="w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs"
              >
                <option value="Renovasi Batal Dilaksanakan">Renovasi Batal Dilaksanakan</option>
                <option value="Masa Berlaku Habis / Kedaluwarsa">Masa Berlaku Habis</option>
                <option value="Pelanggaran Jam Kerja Berat">Pelanggaran Jam Kerja Berat</option>
                <option value="Koreksi Data / Input Ganda">Koreksi Data Ganda</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPermitToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePermit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
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
                Kendaraan <strong>{vehicleToDelete.plateNumber}</strong> ({vehicleToDelete.brand} {vehicleToDelete.model}) milik Unit <strong>{vehicleToDelete.houseCode}</strong> akan dicabut hak akses barrier gate RFID-nya. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
              <span className="font-bold block">Alasan Pencabutan / Penghapusan:</span>
              <select
                value={vehicleDeleteReason}
                onChange={(e) => setVehicleDeleteReason(e.target.value)}
                className="w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs"
              >
                <option value="Kendaraan Dijual / Diganti">Kendaraan Dijual / Diganti Baru</option>
                <option value="Penghuni Pindah Keluar Komplek">Penghuni Pindah Keluar Komplek</option>
                <option value="Stiker RFID Rusak / Hilang">Stiker RFID Rusak / Hilang</option>
                <option value="Koreksi Data / Input Ganda">Koreksi Data Ganda</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS PENGHUNI ================= */}
      {residentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-red-200 shadow-modal space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-ink">Hapus Data {residentToDelete.fullName}?</h3>
              <p className="text-xs text-ink-muted">
                Penghuni <strong>{residentToDelete.fullName}</strong> ({residentToDelete.houseCode}) akan dihapus dari data kependudukan komplek. Tindakan ini tercatat di Jejak Audit.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
              <span className="font-bold block">Alasan Penghapusan Sensus:</span>
              <select
                value={residentDeleteReason}
                onChange={(e) => setResidentDeleteReason(e.target.value)}
                className="w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs"
              >
                <option value="Pindah Domisili Keluar Komplek">Pindah Domisili Keluar Komplek</option>
                <option value="Masa Kontrak / Sewa Berakhir">Masa Sewa Berakhir</option>
                <option value="Meninggal Dunia">Meninggal Dunia</option>
                <option value="Koreksi Data / Input Ganda">Koreksi Data Ganda</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setResidentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteResident}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Ya, Hapus Data
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
                Unit <strong>{propertyToDelete.address}</strong> akan dinonaktifkan dari direktori master. Tindakan ini akan tercatat dalam Jejak Audit Keamanan.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-xs text-red-900 space-y-1">
              <span className="font-bold block">Alasan Penghapusan:</span>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 bg-surface border border-red-200 rounded-xl font-semibold text-ink text-xs"
              >
                <option value="Renovasi Penggabungan Unit / Koreksi Data">Penggabungan Unit / Koreksi Data</option>
                <option value="Unit Dibongkar / Direnovasi Total">Unit Dibongkar / Renovasi Total</option>
                <option value="Kesalahan Input Data Duplikat">Kesalahan Input Data Duplikat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs disabled:opacity-50"
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
