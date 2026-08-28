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
  Receipt
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

  // ================= PERMITS & CONTRACTOR COMPREHENSIVE STATE =================
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

  // Permit Form Fields (Complete Columns)
  const [pCode, setPCode] = useState('A-17');
  const [pAreaLabel, setPAreaLabel] = useState('Blok A');
  const [pOwnerName, setPOwnerName] = useState('Budi Santoso');
  const [pType, setPType] = useState('Pengecatan & Kanopi');
  const [pContractor, setPContractor] = useState('');
  const [pContractorPhone, setPContractorPhone] = useState('0812-xxxx-xxxx');
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

  // Trigger Notification Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Form for Add Property
  const handleOpenAdd = () => {
    setEditingPropertyId(null);
    setNamingType('BLOK');
    setFormAreaName('Blok A');
    setFormCode('');
    setFormNumber('');
    setFormAddress('');
    setFormOccupancy('OWNER_OCCUPIED');
    setFormOwner('');
    setFormOwnerPhone('');
    setFormOwnerNik('');
    setFormBuildingType('Tipe 72/120');
    setFormLandArea(120);
    setFormBuildingArea(72);
    setFormPlnCapacity('3.500 VA');
    setFormPamMeterNo('PAM-88301');
    setFormMonthlyRate(750000);
    setFormHandoverDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setShowAddModal(true);
  };

  // Open Form for Edit Property
  const handleOpenEdit = (prop: PropertyListItem) => {
    setEditingPropertyId(prop.id);
    const code = prop.code;
    if (code.toLowerCase().startsWith('kav')) {
      setNamingType('KAV');
      setFormAreaName(`Kav. ${prop.number || code.replace(/[^0-9]/g, '')}`);
    } else if (code.toLowerCase().startsWith('sw') || prop.address.toLowerCase().includes('sariwangi')) {
      setNamingType('STREET');
      setFormAreaName(prop.address.includes('Indah 2') ? 'Jl. Sariwangi Indah 2' : 'Jl. Sariwangi Indah 1');
    } else {
      setNamingType('BLOK');
      setFormAreaName(`Blok ${prop.blockCode || 'A'}`);
    }
    setFormCode(prop.code);
    setFormNumber(prop.number || prop.code.split('-')[1] || '1');
    setFormAddress(prop.address);
    setFormOccupancy(prop.occupancyStatus as any);
    setFormOwner(prop.ownerName || '');
    setFormOwnerPhone('0812-3456-7890');
    setFormOwnerNik('3171091203850001');
    setFormBuildingType('Tipe 72/120');
    setFormLandArea(120);
    setFormBuildingArea(72);
    setFormPlnCapacity('3.500 VA');
    setFormPamMeterNo(`PAM-${prop.code.replace(/[^0-9]/g, '') || '88301'}`);
    setFormMonthlyRate(750000);
    setFormHandoverDate('2024-01-15');
    setFormNotes('');
    setShowAddModal(true);
  };

  // Dynamic helper for area/naming change
  const handleNamingTypeChange = (type: 'BLOK' | 'KAV' | 'STREET' | 'CLUSTER') => {
    setNamingType(type);
    if (type === 'BLOK') {
      setFormAreaName('Blok A');
      if (!formCode || formCode.startsWith('KAV') || formCode.startsWith('SW')) setFormCode('A-');
    } else if (type === 'KAV') {
      setFormAreaName('Kavling (Kav.)');
      if (!formCode || formCode.startsWith('A-')) setFormCode('KAV-');
    } else if (type === 'STREET') {
      setFormAreaName('Jl. Sariwangi Indah 1');
      if (!formCode || formCode.startsWith('A-')) setFormCode('SW1-');
    } else if (type === 'CLUSTER') {
      setFormAreaName('Cluster Bougenville');
    }
  };

  // Handle Save Property (Create / Update)
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let defaultAddr = '';
      if (namingType === 'KAV') {
        defaultAddr = `Kavling No. ${formNumber || formCode.replace(/[^0-9]/g, '')}, Komplek Taman Sejahtera`;
      } else if (namingType === 'STREET') {
        defaultAddr = `${formAreaName} No. ${formNumber || formCode.replace(/[^0-9]/g, '')}`;
      } else {
        defaultAddr = `Jl. Taman Sejahtera ${formAreaName} No. ${formNumber || formCode.replace(/[^0-9]/g, '')}`;
      }

      const payload = {
        code: formCode.toUpperCase(),
        number: formNumber || formCode.replace(/[^0-9]/g, ''),
        blockId: formAreaName,
        address: formAddress || defaultAddr,
        occupancyStatus: formOccupancy,
        ownerName: formOwner || undefined,
        ownerPhone: formOwnerPhone || undefined,
        ownerNik: formOwnerNik || undefined,
        buildingType: formBuildingType,
        landArea: Number(formLandArea),
        buildingArea: Number(formBuildingArea),
        plnCapacity: formPlnCapacity,
        pamMeterNo: formPamMeterNo,
        monthlyRate: Number(formMonthlyRate),
        handoverDate: formHandoverDate,
        notes: formNotes || undefined,
      };

      const res = await fetch('/api/properties/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const blk = formCode.split('-')[0]?.toUpperCase() || 'A';
        if (editingPropertyId) {
          setProperties(properties.map(p => p.id === editingPropertyId ? {
            ...p,
            code: formCode.toUpperCase(),
            number: formNumber,
            blockCode: blk,
            address: payload.address,
            occupancyStatus: formOccupancy,
            ownerName: formOwner || '-',
          } : p));
          showToast(`Data unit ${formCode.toUpperCase()} (${formAreaName}) berhasil diperbarui.`);
        } else {
          const newProp: PropertyListItem = {
            id: `prop-${formCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            code: formCode.toUpperCase(),
            number: formNumber,
            blockCode: blk,
            address: payload.address,
            occupancyStatus: formOccupancy,
            ownerName: formOwner || '-',
            residentCount: formOccupancy === 'VACANT' ? 0 : 3,
            vehicleCount: formOccupancy === 'VACANT' ? 0 : 1,
            isActive: true,
          };
          setProperties([newProp, ...properties]);
          showToast(`Unit baru ${formCode.toUpperCase()} (${formAreaName}) berhasil didaftarkan.`);
        }
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan unit rumah. Cek koneksi.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Property
  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/properties/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: propertyToDelete.id,
          propertyCode: propertyToDelete.code,
          reason: deleteReason,
        })
      });

      if (res.ok) {
        setProperties(properties.filter(p => p.id !== propertyToDelete.id));
        showToast(`Unit ${propertyToDelete.code} berhasil dihapus dari direktori aktif.`);
        setPropertyToDelete(null);
        if (activeProperty?.id === propertyToDelete.id) {
          setActiveProperty(null);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus unit properti.');
    } finally {
      setDeleting(false);
    }
  };

  // ================= RESIDENT ACTIONS =================
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
    setResAreaLabel(r.areaLabel);
    setResFullName(r.fullName);
    setResRelation(r.relation);
    setResGender(r.gender || 'LAKI_LAKI');
    setResBirthPlaceDate(r.birthPlaceDate || 'Jakarta, 12-03-1985');
    setResReligion(r.religion || 'ISLAM');
    setResOccupation(r.occupation || 'Karyawan Swasta');
    setResPhone(r.phone === '-' ? '' : r.phone);
    setResEmail(r.email === '-' ? '' : r.email);
    setResIdCard(r.idCard);
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
        fullName: resFullName,
        relation: resRelation,
        idCardNumber: resIdCard || '3171xxxxxxxx0001',
        familyCardNumber: resFamilyCard || '3171xxxxxxxx0000',
        gender: resGender,
        birthPlaceDate: resBirthPlaceDate,
        religion: resReligion,
        occupation: resOccupation,
        phone: resPhone || '-',
        email: resEmail || '-',
        domicileStatus: resDomicileStatus,
        bloodType: resBloodType,
        isEmergencyContact: resIsEmergency,
        notes: resNotes || undefined,
      };

      const res = await fetch('/api/properties/occupants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingResidentId) {
          setResidents(residents.map(r => r.id === editingResidentId ? {
            ...r,
            ...payload,
            houseCode: resHouseCode.toUpperCase(),
            areaLabel: resAreaLabel,
            idCard: resIdCard,
            familyCard: resFamilyCard,
            isEmergency: resIsEmergency,
          } : r));
          showToast(`Data sensus penghuni ${resFullName} berhasil diperbarui.`);
        } else {
          const newRes = {
            id: `res-${Date.now()}`,
            houseCode: resHouseCode.toUpperCase(),
            areaLabel: resAreaLabel,
            fullName: resFullName,
            relation: resRelation,
            gender: resGender,
            birthPlaceDate: resBirthPlaceDate,
            religion: resReligion,
            occupation: resOccupation,
            phone: resPhone || '-',
            email: resEmail || '-',
            idCard: resIdCard || '3171xxxxxxxx0001',
            familyCard: resFamilyCard || '3171xxxxxxxx0000',
            domicileStatus: resDomicileStatus,
            bloodType: resBloodType,
            isEmergency: resIsEmergency,
            status: 'VERIFIED',
            notes: resNotes || '-',
          };
          setResidents([newRes, ...residents]);
          showToast(`Penghuni baru ${resFullName} berhasil didaftarkan ke Rumah ${resHouseCode}.`);
        }
        setShowResidentModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data kependudukan.');
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
          occupantId: residentToDelete.id,
          fullName: residentToDelete.fullName,
          houseCode: residentToDelete.houseCode,
          reason: residentDeleteReason,
        })
      });

      if (res.ok) {
        setResidents(residents.filter(r => r.id !== residentToDelete.id));
        showToast(`Penghuni ${residentToDelete.fullName} (${residentToDelete.houseCode}) berhasil dihapus.`);
        setResidentToDelete(null);
        if (activeResidentView?.id === residentToDelete.id) setActiveResidentView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data penghuni.');
    }
  };

  // ================= VEHICLE ACTIONS =================
  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVehHouseCode(properties[0]?.code || 'A-17');
    setVehAreaLabel('Blok A');
    setVehOwnerName(properties[0]?.ownerName || 'Budi Santoso');
    setVehPlateNumber('');
    setVehType('Mobil');
    setVehBrand('Toyota');
    setVehModel('Avanza Veloz');
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
    setVehOwnerName(v.ownerName || 'Warga Terdaftar');
    setVehPlateNumber(v.plateNumber);
    setVehType(v.type);
    setVehBrand(v.brand);
    setVehModel(v.model);
    setVehYear(v.year || 2024);
    setVehColor(v.color);
    setVehRfidTag(v.rfidTag || `RFID-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setVehGateAccess(v.gateAccess || 'SEMUA_GERBANG');
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
        notes: vehNotes || undefined,
      };

      const res = await fetch('/api/properties/vehicles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingVehicleId) {
          setVehicles(vehicles.map(v => v.id === editingVehicleId ? {
            ...v,
            ...payload,
            houseCode: vehHouseCode.toUpperCase(),
            areaLabel: vehAreaLabel,
          } : v));
          showToast(`Data kendaraan ${vehPlateNumber.toUpperCase()} berhasil diperbarui.`);
        } else {
          const newVeh = {
            id: `veh-${Date.now()}`,
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
            notes: vehNotes || '-',
          };
          setVehicles([newVeh, ...vehicles]);
          showToast(`Kendaraan baru ${vehPlateNumber.toUpperCase()} berhasil didaftarkan.`);
        }
        setShowVehicleModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan kendaraan & RFID.');
    } finally {
      setVehSaving(false);
    }
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      const res = await fetch('/api/properties/vehicles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicleToDelete.id,
          plateNumber: vehicleToDelete.plateNumber,
          houseCode: vehicleToDelete.houseCode,
          reason: vehicleDeleteReason,
        })
      });

      if (res.ok) {
        setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
        showToast(`Kendaraan ${vehicleToDelete.plateNumber} (${vehicleToDelete.houseCode}) berhasil dihapus.`);
        setVehicleToDelete(null);
        if (activeVehicleView?.id === vehicleToDelete.id) setActiveVehicleView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus kendaraan.');
    }
  };

  const handleToggleRfid = (id: string) => {
    setVehicles(vehicles.map(v => v.id === id ? {
      ...v,
      rfidStatus: v.rfidStatus === 'AKTIF' ? 'DIBLOKIR' : 'AKTIF'
    } : v));
    const target = vehicles.find(v => v.id === id);
    const newStatus = target?.rfidStatus === 'AKTIF' ? 'DIBLOKIR' : 'AKTIF';
    showToast(`Status RFID plat ${target?.plateNumber} diubah menjadi: ${newStatus}`);
  };

  // ================= PERMIT & CONTRACTOR ACTIONS (CRUD & APPROVALS) =================
  const handleOpenAddPermit = () => {
    setEditingPermitId(null);
    setPCode(properties[0]?.code || 'A-17');
    setPAreaLabel('Blok A');
    setPOwnerName(properties[0]?.ownerName || 'Budi Santoso');
    setPType('Pengecatan & Kanopi');
    setPContractor('');
    setPContractorPhone('0812-3344-5566');
    setPWorkers(3);
    setPWorkersList('1. Mandor Sugeng (KTP: 3301091203850001), 2. Slamet (KTP: 3301092507870002), 3. Joko');
    setPStart(new Date().toISOString().slice(0, 10));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    setPEnd(nextDate.toISOString().slice(0, 10));
    setPAllowedHours('08:00 - 17:00 WIB (Senin - Sabtu)');
    setPDepositStatus('SUDAH_SETOR');
    setPDepositAmount(2000000);
    setPStatus('APPROVED');
    setPDesc('');
    setShowAddPermitModal(true);
  };

  const handleOpenEditPermit = (p: any) => {
    setEditingPermitId(p.id);
    setPCode(p.houseCode);
    setPAreaLabel(p.areaLabel);
    setPOwnerName(p.ownerName || 'Warga Terdaftar');
    setPType(p.workType);
    setPContractor(p.contractorName);
    setPContractorPhone(p.contractorPhone || '0812-3344-5566');
    setPWorkers(p.workersCount);
    setPWorkersList(p.workersList || `${p.contractorName} & ${p.workersCount} Tukang`);
    setPStart(p.startDate);
    setPEnd(p.endDate);
    setPAllowedHours(p.allowedHours || '08:00 - 17:00 WIB (Senin - Sabtu)');
    setPDepositStatus(p.depositStatus || 'SUDAH_SETOR');
    setPDepositAmount(p.depositAmount || 2000000);
    setPStatus(p.status);
    setPDesc(p.description);
    setShowAddPermitModal(true);
  };

  const handleSavePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermitSaving(true);
    try {
      const payload = {
        propertyCode: pCode.toUpperCase(),
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
        depositStatus: pDepositStatus,
        depositAmount: Number(pDepositAmount),
        description: pDesc,
        status: pStatus,
      };

      const res = await fetch('/api/properties/permits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingPermitId) {
          setPermits(permits.map(p => p.id === editingPermitId ? {
            ...p,
            ...payload,
          } : p));
          showToast(`Surat izin renovasi ${editingPermitId} berhasil diperbarui.`);
        } else {
          const newPermit = {
            id: `PERMIT-2026-00${permits.length + 1}`,
            ...payload,
          };
          setPermits([newPermit, ...permits]);
          showToast(`Izin renovasi ${newPermit.id} untuk Unit ${pCode} berhasil diterbitkan.`);
        }
        setShowAddPermitModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menerbitkan izin renovasi.');
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
          permitId: permitToDelete.id,
          houseCode: permitToDelete.houseCode,
          contractorName: permitToDelete.contractorName,
          reason: permitDeleteReason,
        })
      });

      if (res.ok) {
        setPermits(permits.filter(p => p.id !== permitToDelete.id));
        showToast(`Izin renovasi ${permitToDelete.id} berhasil dihapus/dibatalkan.`);
        setPermitToDelete(null);
        if (activePermitView?.id === permitToDelete.id) setActivePermitView(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus izin renovasi.');
    }
  };

  const handleTogglePermitStatus = (id: string, newStatus: string) => {
    setPermits(permits.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
    showToast(`Status izin ${id} diubah menjadi: ${newStatus}`);
  };

  // Filtered & Sorted Properties
  const filteredAndSortedProperties = useMemo(() => {
    const list = properties.filter((p) => {
      const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) || 
                          (p.ownerName && p.ownerName.toLowerCase().includes(search.toLowerCase())) || 
                          p.address.toLowerCase().includes(search.toLowerCase());
      
      let matchBlock = true;
      if (selectedBlock !== 'ALL') {
        if (selectedBlock === 'KAV') {
          matchBlock = p.code.toLowerCase().startsWith('kav') || p.address.toLowerCase().includes('kav');
        } else if (selectedBlock === 'SARIWANGI_1') {
          matchBlock = p.address.toLowerCase().includes('sariwangi indah 1') || p.code.toLowerCase().startsWith('sw1');
        } else if (selectedBlock === 'SARIWANGI_2') {
          matchBlock = p.address.toLowerCase().includes('sariwangi indah 2') || p.code.toLowerCase().startsWith('sw2');
        } else {
          matchBlock = p.blockCode === selectedBlock || p.address.toLowerCase().includes(`blok ${selectedBlock.toLowerCase()}`);
        }
      }

      const matchStatus = selectedStatus === 'ALL' || p.occupancyStatus === selectedStatus;
      return matchSearch && matchBlock && matchStatus;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      } else if (sortBy === 'owner') {
        comparison = (a.ownerName || '').localeCompare(b.ownerName || '');
      } else if (sortBy === 'status') {
        comparison = a.occupancyStatus.localeCompare(b.occupancyStatus);
      } else if (sortBy === 'residents') {
        comparison = (a.residentCount || 0) - (b.residentCount || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [properties, search, selectedBlock, selectedStatus, sortBy, sortOrder]);

  // Property Pagination
  const totalItems = filteredAndSortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, endIndex);

  // Resident Filtered & Sorted & Paginated
  const filteredAndSortedResidents = useMemo(() => {
    const list = residents.filter((r) => {
      const matchSearch = r.fullName.toLowerCase().includes(residentSearch.toLowerCase()) || 
                          r.houseCode.toLowerCase().includes(residentSearch.toLowerCase()) || 
                          r.areaLabel.toLowerCase().includes(residentSearch.toLowerCase()) ||
                          r.idCard.includes(residentSearch) ||
                          r.phone.includes(residentSearch);
      const matchCat = residentCategory === 'ALL' || r.relation === residentCategory;
      return matchSearch && matchCat;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (residentSortBy === 'fullName') comparison = a.fullName.localeCompare(b.fullName);
      else if (residentSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (residentSortBy === 'relation') comparison = a.relation.localeCompare(b.relation);
      else if (residentSortBy === 'occupation') comparison = a.occupation.localeCompare(b.occupation);
      else if (residentSortBy === 'idCard') comparison = a.idCard.localeCompare(b.idCard);
      return residentSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [residents, residentSearch, residentCategory, residentSortBy, residentSortOrder]);

  const totalResidents = filteredAndSortedResidents.length;
  const totalResidentPages = Math.max(1, Math.ceil(totalResidents / residentPageSize));
  const safeResidentPage = Math.min(residentCurrentPage, totalResidentPages);
  const resStartIndex = (safeResidentPage - 1) * residentPageSize;
  const resEndIndex = Math.min(resStartIndex + residentPageSize, totalResidents);
  const paginatedResidents = filteredAndSortedResidents.slice(resStartIndex, resEndIndex);

  // Vehicle Filtered & Sorted & Paginated
  const filteredAndSortedVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      const matchSearch = v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.houseCode.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.ownerName.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.brand.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.model.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          (v.rfidTag && v.rfidTag.toLowerCase().includes(vehicleSearch.toLowerCase()));
      const matchType = vehicleTypeFilter === 'ALL' || v.type === vehicleTypeFilter;
      const matchRfid = vehicleRfidFilter === 'ALL' || v.rfidStatus === vehicleRfidFilter;
      return matchSearch && matchType && matchRfid;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (vehicleSortBy === 'plateNumber') comparison = a.plateNumber.localeCompare(b.plateNumber);
      else if (vehicleSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (vehicleSortBy === 'type') comparison = a.type.localeCompare(b.type);
      else if (vehicleSortBy === 'brand') comparison = a.brand.localeCompare(b.brand);
      else if (vehicleSortBy === 'rfidStatus') comparison = a.rfidStatus.localeCompare(b.rfidStatus);
      return vehicleSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [vehicles, vehicleSearch, vehicleTypeFilter, vehicleRfidFilter, vehicleSortBy, vehicleSortOrder]);

  const totalVehicles = filteredAndSortedVehicles.length;
  const totalVehiclePages = Math.max(1, Math.ceil(totalVehicles / vehiclePageSize));
  const safeVehiclePage = Math.min(vehicleCurrentPage, totalVehiclePages);
  const vehStartIndex = (safeVehiclePage - 1) * vehiclePageSize;
  const vehEndIndex = Math.min(vehStartIndex + vehiclePageSize, totalVehicles);
  const paginatedVehicles = filteredAndSortedVehicles.slice(vehStartIndex, vehEndIndex);

  // Permit Filtered & Sorted & Paginated
  const filteredAndSortedPermits = useMemo(() => {
    const list = permits.filter((p) => {
      const matchSearch = p.id.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.houseCode.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.contractorName.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.workType.toLowerCase().includes(permitSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(permitSearch.toLowerCase());
      const matchStatus = permitStatusFilter === 'ALL' || p.status === permitStatusFilter;
      const matchType = permitTypeFilter === 'ALL' || p.workType === permitTypeFilter;
      return matchSearch && matchStatus && matchType;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (permitSortBy === 'id') comparison = a.id.localeCompare(b.id);
      else if (permitSortBy === 'houseCode') comparison = a.houseCode.localeCompare(b.houseCode, undefined, { numeric: true });
      else if (permitSortBy === 'workType') comparison = a.workType.localeCompare(b.workType);
      else if (permitSortBy === 'contractorName') comparison = a.contractorName.localeCompare(b.contractorName);
      else if (permitSortBy === 'status') comparison = a.status.localeCompare(b.status);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OWNER_OCCUPIED':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 inline-flex items-center gap-1">Dihuni Pemilik</span>;
      case 'RENTED':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-extrabold border border-blue-200 inline-flex items-center gap-1">Disewa</span>;
      case 'VACANT':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200 inline-flex items-center gap-1">Kosong</span>;
      case 'RENOVATION':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-extrabold border border-purple-200 inline-flex items-center gap-1">Renovasi</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-canvas text-ink-muted text-[11px] font-semibold">{status}</span>;
    }
  };

  const getRelationBadge = (rel: string) => {
    switch (rel) {
      case 'KEPALA_KELUARGA':
        return <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-800 font-black text-[10px] border border-primary-200">Kepala Keluarga</span>;
      case 'ISTRI':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-black text-[10px] border border-rose-200">Istri</span>;
      case 'ANAK':
        return <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold text-[10px] border border-sky-200">Anak</span>;
      case 'ORANG_TUA':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">Orang Tua/Mertua</span>;
      case 'ART':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">ART / Supir</span>;
      case 'PENYEWA':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-bold text-[10px] border border-indigo-200">Penyewa</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted text-[10px]">{rel}</span>;
    }
  };

  const getPermitStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-300 inline-flex items-center gap-1">✓ SEDANG BERJALAN</span>;
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-300 inline-flex items-center gap-1">⏱ MENUNGGU ACC</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-black border border-slate-300 inline-flex items-center gap-1">✓ SELESAI</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-black border border-rose-300 inline-flex items-center gap-1">✕ DIHENTIKAN</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-canvas text-ink-muted text-[10px]">{status}</span>;
    }
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
              {activeSubTab === 'permits'
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
              activeSubTab === 'permits'
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
            {activeSubTab === 'permits'
              ? 'Ekspor Izin (CSV)'
              : activeSubTab === 'vehicles'
              ? 'Ekspor Kendaraan (CSV)'
              : activeSubTab === 'residents'
              ? 'Ekspor Sensus (CSV)'
              : 'Ekspor CSV'}
          </button>
          
          {activeSubTab === 'permits' ? (
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
          { id: 'analytics', label: 'Okupansi & Utilitas', icon: TrendingUp },
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
          {/* Summary Metric Cards */}
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

          {/* Filter, Sort & View Switcher Bar */}
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
                title={`Urutan: ${sortOrder === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              {/* View Switcher Button */}
              <div className="flex items-center bg-canvas p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                  title="Tampilan Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                  title="Tampilan Grid Matriks Wilayah"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: TABLE MODE WITH FULL ACTIONS & PAGINATION */}
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
                    {paginatedProperties.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-ink-muted font-medium">
                          Tidak ada data unit rumah/kavling yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedProperties.map((prop) => {
                        const isKav = prop.code.toLowerCase().startsWith('kav');
                        const isStreet = prop.address.toLowerCase().includes('sariwangi') || prop.code.toLowerCase().startsWith('sw');

                        return (
                          <tr key={prop.id} className="hover:bg-canvas/60 text-ink transition-colors">
                            <td className="py-3.5 px-4 font-bold text-sm text-primary-700 flex items-center gap-2">
                              {isKav ? (
                                <Compass className="w-4 h-4 text-indigo-600" />
                              ) : isStreet ? (
                                <MapPin className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Home className="w-4 h-4 text-primary-600" />
                              )}
                              <span>{isKav ? prop.code : `Unit ${prop.code}`}</span>
                            </td>
                            <td className="py-3.5 px-4 text-ink-muted font-medium">
                              <span className="font-semibold text-ink block">{prop.address}</span>
                              <span className="text-[10px] text-ink-muted">
                                {isKav ? 'Area Kavling' : isStreet ? 'Per Jalan' : `Blok ${prop.blockCode}`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">{getStatusBadge(prop.occupancyStatus)}</td>
                            <td className="py-3.5 px-4 font-black text-ink">{prop.ownerName || '-'}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-ink">
                              {prop.residentCount || 3} Jiwa
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-ink">
                              {prop.vehicleCount || 1} Unit
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveProperty(prop)}
                                  className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                                  title="Lihat Detail Hunian"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(prop)}
                                  className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                                  title="Edit Data Rumah"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPropertyToDelete(prop)}
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                                  title="Hapus Unit Rumah"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus
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

              {/* PAGINATION CONTROLLER BAR */}
              <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-ink-muted">
                    Menampilkan <strong className="text-ink">{totalItems === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalItems}</strong> unit
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-ink-muted">Tampilkan:</span>
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
                    onClick={() => handlePageChange(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman Sebelumnya"
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
                          onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Halaman Terakhir"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: VISUAL BLOCK & KAVLING GRID MATRIX */}
          {viewMode === 'grid' && (
            <div className="space-y-6">
              {[
                { key: 'A', label: 'Blok A', street: 'Jl. Taman Sejahtera A' },
                { key: 'B', label: 'Blok B / Sariwangi Indah 1', street: 'Jl. Taman Sejahtera B & Sariwangi 1' },
                { key: 'C', label: 'Blok C / Kavling Cluster', street: 'Jl. Taman Sejahtera C & Area Kavling' },
                { key: 'D', label: 'Blok D / Sariwangi Indah 2', street: 'Jl. Taman Sejahtera D & Sariwangi 2' },
              ].map((area) => {
                const blockProps = filteredAndSortedProperties.filter(p => p.blockCode === area.key);
                if (selectedBlock !== 'ALL' && selectedBlock !== area.key) return null;
                return (
                  <div key={area.key} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">
                          {area.key}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-sm text-ink">{area.label}</h3>
                          <p className="text-[10px] text-ink-muted">{area.street}</p>
                        </div>
                      </div>
                      <span className="text-xs text-ink-muted font-medium">{blockProps.length} Unit Terdaftar</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2">
                      {blockProps.map((p) => {
                        const isOwner = p.occupancyStatus === 'OWNER_OCCUPIED';
                        const isRented = p.occupancyStatus === 'RENTED';
                        const isVacant = p.occupancyStatus === 'VACANT';
                        const isReno = p.occupancyStatus === 'RENOVATION';

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setActiveProperty(p)}
                            className={`p-2.5 rounded-xl text-center border transition-all hover:scale-105 hover:shadow-md ${
                              isOwner
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : isRented
                                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                                : isReno
                                ? 'bg-purple-50/80 border-purple-200 text-purple-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900'
                            }`}
                          >
                            <p className="font-mono text-xs font-black">{p.code}</p>
                            <p className="text-[9px] truncate font-bold mt-0.5">{p.ownerName?.split(' ')[0] || 'Kosong'}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SUBTAB 2: DATABASE KEPENDUDUKAN & PENGHUNI ================= */}
      {activeSubTab === 'residents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
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
              <span className="text-[10px] text-ink-muted font-medium">Penanggung Jawab</span>
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

          {/* Filter & Sensus Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama, nomor unit/kav, NIK..."
                value={residentSearch}
                onChange={(e) => {
                  setResidentSearch(e.target.value);
                  setResidentCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={residentCategory}
                onChange={(e) => {
                  setResidentCategory(e.target.value);
                  setResidentCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Hubungan Keluarga</option>
                <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                <option value="ISTRI">Istri</option>
                <option value="ANAK">Anak</option>
                <option value="ORANG_TUA">Orang Tua / Mertua</option>
                <option value="ART">ART / Supir</option>
                <option value="PENYEWA">Penyewa</option>
              </select>

              <select
                value={residentSortBy}
                onChange={(e) => setResidentSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="houseCode">Urut Nomor Unit</option>
                <option value="fullName">Urut Nama Lengkap</option>
                <option value="relation">Urut Hubungan</option>
                <option value="occupation">Urut Profesi</option>
                <option value="idCard">Urut NIK</option>
              </select>

              <button
                type="button"
                onClick={() => setResidentSortOrder(residentSortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
                title={`Urutan: ${residentSortOrder === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SENSUS TABLE WITH PAGINATION & CRUD ACTIONS */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">No Unit / Kav</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Hubungan</th>
                    <th className="py-3.5 px-4">NIK (KTP)</th>
                    <th className="py-3.5 px-4">Profesi / Pekerjaan</th>
                    <th className="py-3.5 px-4">Kontak WhatsApp</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary-700 block">{r.houseCode}</span>
                        <span className="text-[10px] text-ink-muted">{r.areaLabel}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink">
                        <div className="flex items-center gap-1.5">
                          <span>{r.fullName}</span>
                          {r.isEmergency && (
                            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 text-[9px] font-black rounded-md border border-rose-200">
                              Darurat
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getRelationBadge(r.relation)}</td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">{r.idCard}</td>
                      <td className="py-3.5 px-4 text-ink font-medium">{r.occupation}</td>
                      <td className="py-3.5 px-4 font-mono text-ink">
                        {r.phone !== '-' ? (
                          <a
                            href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-1"
                            title="Kirim pesan WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {r.phone}
                          </a>
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          TERVERIFIKASI
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveResidentView(r)}
                            className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title="Lihat Biodata Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditResident(r)}
                            className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title="Edit Data Penghuni"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setResidentToDelete(r)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title="Hapus Data Penghuni"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RESIDENT PAGINATION BAR */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalResidents === 0 ? 0 : resStartIndex + 1}</strong> - <strong className="text-ink">{resEndIndex}</strong> dari <strong className="text-ink">{totalResidents}</strong> jiwa terdaftar
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={residentPageSize}
                    onChange={(e) => {
                      setResidentPageSize(Number(e.target.value));
                      setResidentCurrentPage(1);
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
                  onClick={() => setResidentCurrentPage(1)}
                  disabled={safeResidentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setResidentCurrentPage(safeResidentPage - 1)}
                  disabled={safeResidentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalResidentPages) }, (_, i) => {
                    let pageNum = safeResidentPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalResidentPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setResidentCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safeResidentPage === pageNum
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
                  onClick={() => setResidentCurrentPage(safeResidentPage + 1)}
                  disabled={safeResidentPage === totalResidentPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setResidentCurrentPage(totalResidentPages)}
                  disabled={safeResidentPage === totalResidentPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: MASTER KENDARAAN & RFID ================= */}
      {activeSubTab === 'vehicles' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
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
              <span className="text-[10px] text-ink-muted">Lane Motor & E-Bike</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Stiker RFID Aktif</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {vehicles.filter(v => v.rfidStatus === 'AKTIF').length} RFID
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Akses Aktif</span>
            </div>
          </div>

          {/* Filter & Vehicle Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari plat nomor, unit, merk, tag RFID..."
                value={vehicleSearch}
                onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Jenis Kendaraan</option>
                <option value="Mobil">Mobil (Roda 4)</option>
                <option value="Motor">Sepeda Motor</option>
                <option value="Sepeda Listrik">Sepeda Listrik / E-Bike</option>
                <option value="Truk / Pickup">Truk / Pickup Niaga</option>
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
                <option value="AKTIF">Akses Aktif (Buka Otomatis)</option>
                <option value="DIBLOKIR">Diblokir (Tunggakan/Hilang)</option>
                <option value="PENDING_VERIFIKASI">Pending Verifikasi</option>
              </select>

              <select
                value={vehicleSortBy}
                onChange={(e) => setVehicleSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="plateNumber">Urut Plat Nomor</option>
                <option value="houseCode">Urut Nomor Unit</option>
                <option value="type">Urut Jenis</option>
                <option value="brand">Urut Merk</option>
                <option value="rfidStatus">Urut Status RFID</option>
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

          {/* MASTER VEHICLES TABLE */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">Plat Nomor</th>
                    <th className="py-3.5 px-4">Unit / Wilayah</th>
                    <th className="py-3.5 px-4">Pemilik / Pengemudi</th>
                    <th className="py-3.5 px-4">Jenis</th>
                    <th className="py-3.5 px-4">Merk & Tipe</th>
                    <th className="py-3.5 px-4">Serial Tag RFID</th>
                    <th className="py-3.5 px-4 text-center">Status Gerbang</th>
                    <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-ink">{v.plateNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-primary-700 block">{v.houseCode}</span>
                        <span className="text-[10px] text-ink-muted">{v.areaLabel}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink">{v.ownerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-canvas text-ink font-bold border border-border">
                          {v.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-ink">{v.brand} {v.model}</p>
                        <p className="text-[10px] text-ink-muted">{v.color} • Thn {v.year}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">
                        <span className="px-1.5 py-0.5 bg-canvas rounded-md border border-border text-[11px]">
                          {v.rfidTag}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRfid(v.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-xs ${
                            v.rfidStatus === 'AKTIF'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-red-50 hover:text-red-700'
                              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {v.rfidStatus === 'AKTIF' ? '✓ AKTIF' : '✕ DIBLOKIR'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPassVehicle(v)}
                            className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Stiker
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditVehicle(v)}
                            className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setVehicleToDelete(v)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VEHICLE PAGINATION BAR */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalVehicles === 0 ? 0 : vehStartIndex + 1}</strong> - <strong className="text-ink">{vehEndIndex}</strong> dari <strong className="text-ink">{totalVehicles}</strong> kendaraan terdaftar
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={vehiclePageSize}
                    onChange={(e) => {
                      setVehiclePageSize(Number(e.target.value));
                      setVehicleCurrentPage(1);
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
                  onClick={() => setVehicleCurrentPage(1)}
                  disabled={safeVehiclePage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCurrentPage(safeVehiclePage - 1)}
                  disabled={safeVehiclePage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalVehiclePages) }, (_, i) => {
                    let pageNum = safeVehiclePage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalVehiclePages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setVehicleCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safeVehiclePage === pageNum
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
                  onClick={() => setVehicleCurrentPage(safeVehiclePage + 1)}
                  disabled={safeVehiclePage === totalVehiclePages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCurrentPage(totalVehiclePages)}
                  disabled={safeVehiclePage === totalVehiclePages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: IZIN RENOVASI & TUKANG (FULL CRUD & PAGINATION) ================= */}
      {activeSubTab === 'permits' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
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
              <span className="text-[10px] text-emerald-600 font-bold">Dalam Pengawasan Satpam</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Menunggu ACC RT/RW</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">
                {permits.filter(p => p.status === 'PENDING_REVIEW').length} Pengajuan
              </p>
              <span className="text-[10px] text-amber-600 font-bold">Perlu Ditinjau</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Jaminan Deposit</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">
                Rp {(permits.reduce((acc, p) => p.depositStatus === 'SUDAH_SETOR' ? acc + (p.depositAmount || 0) : acc, 0) / 1000000).toFixed(1)} Jt
              </p>
              <span className="text-[10px] text-ink-muted">Uang Jaminan Tertahan</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari ID izin, unit, mandor, rincian pekerjaan..."
                value={permitSearch}
                onChange={(e) => {
                  setPermitSearch(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={permitStatusFilter}
                onChange={(e) => {
                  setPermitStatusFilter(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Izin</option>
                <option value="APPROVED">Sedang Berjalan (Disetujui)</option>
                <option value="PENDING_REVIEW">Menunggu Persetujuan</option>
                <option value="COMPLETED">Selesai Dikerjakan</option>
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
                <option value="Perbaikan Atap & Dak Bocor">Perbaikan Atap & Dak</option>
                <option value="Pembangunan Tingkat / Ekstensi">Pembangunan Tingkat</option>
                <option value="Pemasangan Solar Panel">Pemasangan Solar Panel</option>
              </select>

              <select
                value={permitSortBy}
                onChange={(e) => setPermitSortBy(e.target.value as any)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="startDate">Urut Tanggal Mulai</option>
                <option value="houseCode">Urut Nomor Unit</option>
                <option value="contractorName">Urut Nama Mandor</option>
                <option value="status">Urut Status Izin</option>
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

          {/* PERMITS TABLE WITH PAGINATION & CRUD ACTIONS */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3.5 px-4">ID Permit / Unit</th>
                    <th className="py-3.5 px-4">Jenis Pekerjaan</th>
                    <th className="py-3.5 px-4">Mandor & Tukang</th>
                    <th className="py-3.5 px-4">Masa Berlaku</th>
                    <th className="py-3.5 px-4">Uang Jaminan</th>
                    <th className="py-3.5 px-4 text-center">Status Izin</th>
                    <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedPermits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-ink-muted font-medium">
                        Tidak ada data izin renovasi yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedPermits.map((p) => (
                      <tr key={p.id} className="hover:bg-canvas/60 text-ink transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-primary-700 block text-xs">{p.id}</span>
                          <span className="text-[11px] font-bold text-ink">Unit {p.houseCode} ({p.areaLabel})</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-ink text-xs">{p.workType}</p>
                          <p className="text-[10px] text-ink-muted truncate max-w-xs">{p.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-ink">{p.contractorName}</p>
                          <p className="text-[10px] text-ink-muted">{p.workersCount} Orang Tukang • {p.contractorPhone || '-'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-ink">{p.startDate} s/d {p.endDate}</p>
                          <span className="text-[10px] text-ink-muted block">{p.allowedHours || '08:00 - 17:00 WIB'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <p className="font-bold text-ink">Rp {(p.depositAmount || 2000000).toLocaleString('id-ID')}</p>
                          <span className={`text-[10px] font-bold ${p.depositStatus === 'SUDAH_SETOR' ? 'text-emerald-700' : p.depositStatus === 'DIKEMBALIKAN' ? 'text-slate-600' : 'text-amber-700'}`}>
                            {p.depositStatus === 'SUDAH_SETOR' ? '✓ Disetor' : p.depositStatus === 'DIKEMBALIKAN' ? 'Dikembalikan' : 'Belum Setor'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getPermitStatusBadge(p.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedPrintPermit(p)}
                              className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              title="Cetak Surat Izin & QR Pas Tukang"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Surat Izin
                            </button>
                            <button
                              type="button"
                              onClick={() => setActivePermitView(p)}
                              className="p-1.5 hover:bg-slate-100 text-ink rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              title="Lihat Detail Izin"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPermit(p)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              title="Edit Data Izin"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPermitToDelete(p)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              title="Hapus / Batalkan Izin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PERMIT PAGINATION BAR */}
            <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-ink-muted">
                  Menampilkan <strong className="text-ink">{totalPermits === 0 ? 0 : permitStartIndex + 1}</strong> - <strong className="text-ink">{permitEndIndex}</strong> dari <strong className="text-ink">{totalPermits}</strong> izin renovasi
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted">Tampilkan:</span>
                  <select
                    value={permitPageSize}
                    onChange={(e) => {
                      setPermitPageSize(Number(e.target.value));
                      setPermitCurrentPage(1);
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
                  onClick={() => setPermitCurrentPage(1)}
                  disabled={safePermitPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPermitCurrentPage(safePermitPage - 1)}
                  disabled={safePermitPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPermitPages) }, (_, i) => {
                    let pageNum = safePermitPage - 2 + i;
                    if (pageNum < 1) pageNum = i + 1;
                    if (pageNum > totalPermitPages) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPermitCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          safePermitPage === pageNum
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
                  onClick={() => setPermitCurrentPage(safePermitPage + 1)}
                  disabled={safePermitPage === totalPermitPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPermitCurrentPage(totalPermitPages)}
                  disabled={safePermitPage === totalPermitPages}
                  className="p-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: OKUPANSI & ANALISIS ================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                Statistik Okupansi per Wilayah (Blok, Kavling, Jalan)
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { block: 'Blok A', rate: '96.7%', filled: 29, total: 30, color: 'bg-emerald-500' },
                  { block: 'Blok B / Sariwangi 1', rate: '90.0%', filled: 27, total: 30, color: 'bg-blue-500' },
                  { block: 'Blok C / Area Kavling', rate: '93.3%', filled: 28, total: 30, color: 'bg-indigo-500' },
                  { block: 'Blok D / Sariwangi 2', rate: '96.7%', filled: 29, total: 30, color: 'bg-purple-500' },
                ].map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{b.block} ({b.filled}/{b.total} Unit)</span>
                      <span className="font-mono text-primary-700">{b.rate}</span>
                    </div>
                    <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
                      <div className={`h-full ${b.color}`} style={{ width: b.rate }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-4">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Sebaran Daya Listrik PLN Komplek
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { cap: '1.300 VA', count: '14 Rumah (11.7%)', width: '12%' },
                  { cap: '2.200 VA', count: '38 Rumah (31.7%)', width: '32%' },
                  { cap: '3.500 VA', count: '52 Rumah (43.3%)', width: '43%' },
                  { cap: '4.400 VA - 5.500 VA', count: '16 Rumah (13.3%)', width: '13%' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-canvas rounded-xl border border-border flex items-center justify-between">
                    <span className="font-bold text-ink">{item.cap}</span>
                    <span className="font-mono text-ink-muted">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL RUMAH / KAVLING ================= */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">Unit {activeProperty.code}</h3>
                  <p className="text-xs text-ink-muted">{activeProperty.address}</p>
                </div>
              </div>
              <button onClick={() => setActiveProperty(null)} className="p-1 rounded-full text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Status Hunian:</span>
                  <div className="mt-1">{getStatusBadge(activeProperty.occupancyStatus)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Kepala Keluarga / Pemilik:</span>
                  <p className="font-black text-ink text-sm mt-0.5">{activeProperty.ownerName || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Luas Tanah / Bangunan:</span>
                  <p className="font-bold text-ink mt-0.5">120 m² / 72 m² (Tipe 72/120)</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Daya Listrik & Meter Air:</span>
                  <p className="font-mono font-bold text-ink mt-0.5">3.500 VA • PAM-88301</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Tarif Iuran Lingkungan:</span>
                  <p className="font-bold text-emerald-700 mt-0.5">Rp 750.000 / bulan</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold">Status Keamanan RFID:</span>
                  <p className="font-bold text-primary-700 mt-0.5">TERHUBUNG POS GERBANG 1</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const toEdit = activeProperty;
                  setActiveProperty(null);
                  handleOpenEdit(toEdit);
                }}
                className="px-4 py-2 bg-surface hover:bg-canvas border border-border text-ink font-bold text-xs rounded-xl"
              >
                Edit Data Lengkap
              </button>
              <button
                type="button"
                onClick={() => setActiveProperty(null)}
                className="px-5 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-xs text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL LENGKAP IZIN RENOVASI ================= */}
      {activePermitView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">{activePermitView.id}</h3>
                  <p className="text-xs text-ink-muted">Unit {activePermitView.houseCode} ({activePermitView.areaLabel}) • {activePermitView.workType}</p>
                </div>
              </div>
              <button onClick={() => setActivePermitView(null)} className="p-1 rounded-full text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-canvas rounded-2xl border border-border grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Status Izin:</span>
                  <div className="mt-0.5">{getPermitStatusBadge(activePermitView.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Uang Jaminan Deposit:</span>
                  <p className="font-bold text-ink mt-0.5">
                    Rp {(activePermitView.depositAmount || 2000000).toLocaleString('id-ID')} ({activePermitView.depositStatus})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Mandor Penanggung Jawab:</span>
                  <p className="font-bold text-ink mt-0.5">{activePermitView.contractorName}</p>
                  <p className="text-[10px] font-mono text-ink-muted">{activePermitView.contractorPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted font-bold block">Tenaga Kerja Terdaftar:</span>
                  <p className="font-bold text-ink mt-0.5">{activePermitView.workersCount} Orang Tukang</p>
                </div>
                <div className="col-span-2 border-t border-border/60 pt-2">
                  <span className="text-[10px] text-ink-muted font-bold block">Masa Berlaku Izin & Jam Kerja:</span>
                  <p className="font-bold text-ink mt-0.5">{activePermitView.startDate} s/d {activePermitView.endDate} ({activePermitView.allowedHours || '08:00 - 17:00 WIB'})</p>
                </div>
              </div>

              <div className="p-3 bg-canvas/60 rounded-xl border border-border space-y-1">
                <span className="text-[10px] text-ink-muted font-bold block">Daftar Nama Tenaga Kerja (Tukang):</span>
                <p className="font-medium text-ink leading-relaxed">{activePermitView.workersList || 'Daftar nama tukang terlampir di pos satpam'}</p>
              </div>

              <div className="p-3 bg-canvas/60 rounded-xl border border-border space-y-1">
                <span className="text-[10px] text-ink-muted font-bold block">Deskripsi & Peraturan Kebersihan:</span>
                <p className="font-medium text-ink leading-relaxed">{activePermitView.description}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <div className="flex gap-2">
                {activePermitView.status === 'PENDING_REVIEW' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleTogglePermitStatus(activePermitView.id, 'APPROVED');
                      setActivePermitView(null);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Setujui Izin
                  </button>
                )}
                {activePermitView.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleTogglePermitStatus(activePermitView.id, 'COMPLETED');
                      setActivePermitView(null);
                    }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Tandai Selesai
                  </button>
                )}
                {activePermitView.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleTogglePermitStatus(activePermitView.id, 'SUSPENDED');
                      setActivePermitView(null);
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Hentikan Sementara
                  </button>
                )}
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    const toPrint = activePermitView;
                    setActivePermitView(null);
                    setSelectedPrintPermit(toPrint);
                  }}
                  className="px-4 py-2 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Surat
                </button>
                <button
                  type="button"
                  onClick={() => setActivePermitView(null)}
                  className="px-5 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-xs text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CETAK SURAT IZIN RESMI & PAS TUKANG ================= */}
      {selectedPrintPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary-600" />
                <h3 className="font-black text-sm text-ink">Surat Izin Kerja Renovasi & Pas Masuk Tukang</h3>
              </div>
              <button onClick={() => setSelectedPrintPermit(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {/* Simulated Official Paper Document */}
            <div className="p-5 bg-canvas rounded-2xl border-2 border-dashed border-border space-y-4 text-ink">
              <div className="text-center border-b border-border pb-3 space-y-0.5">
                <h2 className="font-black text-sm uppercase tracking-wider text-ink">PENGURUS PAGUYUBAN WARGA TAMAN SEJAHTERA</h2>
                <p className="text-[10px] text-ink-muted">SURAT KETERANGAN IZIN PEKERJAAN RENOVASI BANGUNAN</p>
                <p className="font-mono text-xs font-bold text-primary-700">{selectedPrintPermit.id}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <p><span className="text-ink-muted">Unit Hunian:</span> <strong>Rumah {selectedPrintPermit.houseCode} ({selectedPrintPermit.areaLabel})</strong></p>
                  <p><span className="text-ink-muted">Jenis Pekerjaan:</span> <strong>{selectedPrintPermit.workType}</strong></p>
                  <p><span className="text-ink-muted">Penanggung Jawab:</span> <strong>{selectedPrintPermit.contractorName}</strong></p>
                  <p><span className="text-ink-muted">Jumlah Pekerja:</span> <strong>{selectedPrintPermit.workersCount} Orang Tukang</strong></p>
                  <p><span className="text-ink-muted">Masa Berlaku:</span> <strong>{selectedPrintPermit.startDate} s/d {selectedPrintPermit.endDate}</strong></p>
                  <p><span className="text-ink-muted">Jam Kerja:</span> <strong>{selectedPrintPermit.allowedHours || '08:00 - 17:00 WIB'}</strong></p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-border text-center shrink-0">
                  <QrCode className="w-24 h-24 text-primary-900 mx-auto" />
                  <span className="text-[8px] font-mono font-bold text-ink-muted block mt-1">SCAN POS SATPAM</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface rounded-xl border border-border text-[10px] space-y-1 text-ink-muted">
                <p className="font-bold text-ink">Tata Tertib Pekerja Bangunan:</p>
                <p>1. Wajib mengenakan rompi/ID Pass tukang saat berada di area komplek.</p>
                <p>2. Tidak diperkenankan menaruh material pasir/semen di atas aspal jalan warga.</p>
                <p>3. Pekerjaan bising wajib dihentikan pada hari Minggu dan hari libur nasional.</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedPrintPermit(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak Surat Izin & ID Pass Tukang: ${selectedPrintPermit.id}`);
                  setSelectedPrintPermit(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen Resmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT IZIN RENOVASI (KOLOM LENGKAP) ================= */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingPermitId ? `Edit Izin ${editingPermitId}` : 'Terbitkan Izin Renovasi & Tukang Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Pencatatan legalitas izin renovasi, tenaga kerja, dan uang jaminan.</p>
                </div>
              </div>
              <button onClick={() => setShowAddPermitModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermit} className="space-y-3.5 text-xs">
              {/* Seksi 1: Lokasi Hunian & Kategori Pekerjaan */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-primary-600" />
                  1. Lokasi Hunian & Kategori Renovasi
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Pilih Unit Rumah / Kavling *</label>
                    <select
                      value={pCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setPCode(code);
                        const matchedProp = properties.find(p => p.code === code);
                        if (matchedProp) {
                          setPAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matchedProp.blockCode}`);
                          if (matchedProp.ownerName) setPOwnerName(matchedProp.ownerName);
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
                    <label className="font-bold text-ink block mb-1">Kategori Pekerjaan *</label>
                    <select
                      value={pType}
                      onChange={(e) => setPType(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="Pengecatan & Kanopi">Pengecatan & Kanopi</option>
                      <option value="Renovasi Interior & Dapur">Renovasi Interior & Dapur</option>
                      <option value="Perbaikan Atap & Dak Bocor">Perbaikan Atap & Dak Bocor</option>
                      <option value="Pembangunan Tingkat / Ekstensi">Pembangunan Tingkat / Ekstensi</option>
                      <option value="Pemasangan Solar Panel">Pemasangan Solar Panel</option>
                      <option value="Pembangunan Rumah Baru / Kavling">Pembangunan Rumah Baru / Kavling</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Mandor & Tenaga Kerja (Tukang) */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-primary-600" />
                  2. Kontraktor, Mandor & Jumlah Tukang
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="font-bold text-ink block mb-1">Nama Mandor / Kontraktor *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bpk. Sugeng (CV Berkah)"
                      value={pContractor}
                      onChange={(e) => setPContractor(e.target.value)}
                      required
                      className="w-full p-2 bg-surface border border-border rounded-xl font-bold text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={pContractorPhone}
                      onChange={(e) => setPContractorPhone(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Jml Pekerja *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={pWorkers}
                      onChange={(e) => setPWorkers(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-bold text-ink block mb-1">Daftar Nama & NIK Tukang</label>
                    <input
                      type="text"
                      placeholder="1. Sugeng (KTP: 3301..), 2. Slamet"
                      value={pWorkersList}
                      onChange={(e) => setPWorkersList(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Masa Izin, Uang Jaminan & Status */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-primary-600" />
                  3. Masa Berlaku, Deposit & Status Izin
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Tanggal Mulai *</label>
                    <input
                      type="date"
                      value={pStart}
                      onChange={(e) => setPStart(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Tanggal Selesai *</label>
                    <input
                      type="date"
                      value={pEnd}
                      onChange={(e) => setPEnd(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Status Jaminan</label>
                    <select
                      value={pDepositStatus}
                      onChange={(e) => setPDepositStatus(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="SUDAH_SETOR">Sudah Disetor</option>
                      <option value="BELUM_SETOR">Belum Setor</option>
                      <option value="DIKEMBALIKAN">Sudah Dikembalikan</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Nominal Jaminan (Rp)</label>
                    <input
                      type="number"
                      value={pDepositAmount}
                      onChange={(e) => setPDepositAmount(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Status Izin *</label>
                    <select
                      value={pStatus}
                      onChange={(e) => setPStatus(e.target.value as any)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="APPROVED">Disetujui (Berjalan)</option>
                      <option value="PENDING_REVIEW">Menunggu ACC</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="SUSPENDED">Dihentikan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Rincian Deskripsi Pekerjaan *</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Pengecatan fasad luar rumah dan perbaikan kanopi garasi..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    required
                    className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPermitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-ink font-bold hover:bg-canvas"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={permitSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {permitSaving ? 'Menerbitkan...' : editingPermitId ? 'Perbarui Izin' : 'Terbitkan Izin'}
                </button>
              </div>
            </form>
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

      {/* ================= MODAL: QR PASS PRINT PREVIEW (VEHICLE) ================= */}
      {selectedPassVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal text-center space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-black text-sm text-ink flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-primary-600" />
                Stiker Fisik Akses RFID & QR Gate
              </h3>
              <button onClick={() => setSelectedPassVehicle(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border inline-block">
              <QrCode className="w-36 h-36 mx-auto text-primary-700" />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-xl font-black text-ink">{selectedPassVehicle.plateNumber}</p>
              <p className="text-xs font-bold text-primary-700">
                Unit {selectedPassVehicle.houseCode} • {selectedPassVehicle.brand} {selectedPassVehicle.model}
              </p>
              <p className="text-[10px] font-mono text-ink-muted">Tag Serial: {selectedPassVehicle.rfidTag || 'RFID-8830192'}</p>
              <span className={`inline-block mt-2 px-3 py-0.5 text-[10px] font-bold rounded-full border ${
                selectedPassVehicle.rfidStatus === 'AKTIF'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {selectedPassVehicle.rfidStatus === 'AKTIF'
                  ? 'GATE 1 & 2 AUTO BARRIER AUTHORIZED'
                  : 'BLOCKED / ACCESS REVOKED'}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak stiker fisik & hologram barcode untuk plat: ${selectedPassVehicle.plateNumber}`);
                  setSelectedPassVehicle(null);
                }}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Stiker Fisik Kendaraan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
