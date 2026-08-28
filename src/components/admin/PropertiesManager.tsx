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
  ArrowUpDown
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Property Modal State (Complete Columns)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyListItem | null>(null);

  // Form Fields (Full Columns)
  const [formCode, setFormCode] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formBlock, setFormBlock] = useState('block-a');
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

  // Delete Confirmation Modal State
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Renovasi Penggabungan Unit / Koreksi Data');
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Residents State
  const [residentCategory, setResidentCategory] = useState('ALL');
  const [residentSearch, setResidentSearch] = useState('');
  const [residents, setResidents] = useState([
    { id: 'res-1', houseCode: 'A-17', fullName: 'Budi Santoso', relation: 'KEPALA_KELUARGA', phone: '0812-3456-7890', idCard: '3171091203850001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-2', houseCode: 'A-17', fullName: 'Siti Lestari', relation: 'ISTRI', phone: '0813-9876-5432', idCard: '3171092507870002', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-3', houseCode: 'A-17', fullName: 'Alya Santoso', relation: 'ANAK', phone: '-', idCard: '3171091405130003', isEmergency: false, status: 'VERIFIED' },
    { id: 'res-4', houseCode: 'A-17', fullName: 'Daffa Santoso', relation: 'ANAK', phone: '-', idCard: '3171090309170004', isEmergency: false, status: 'VERIFIED' },
    { id: 'res-5', houseCode: 'A-01', fullName: 'Hendra Gunawan', relation: 'KEPALA_KELUARGA', phone: '0811-2233-4455', idCard: '3171090101800001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-6', houseCode: 'A-01', fullName: 'Maria Gunawan', relation: 'ISTRI', phone: '0811-2233-4456', idCard: '3171090101820002', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-7', houseCode: 'B-07', fullName: 'Agus Wijaya', relation: 'KEPALA_KELUARGA', phone: '0818-7788-9900', idCard: '3171090707750001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-8', houseCode: 'B-07', fullName: 'Rina Wijaya', relation: 'ISTRI', phone: '0818-7788-9901', idCard: '3171090707780002', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-9', houseCode: 'C-12', fullName: 'Bambang Sutrisno', relation: 'KEPALA_KELUARGA', phone: '0812-9988-1122', idCard: '3171091212680001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-10', houseCode: 'D-05', fullName: 'Dr. Ratna Kusuma', relation: 'KEPALA_KELUARGA', phone: '0813-4455-6677', idCard: '3171090505790001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-11', houseCode: 'B-14', fullName: 'Suryo Pranoto', relation: 'KEPALA_KELUARGA', phone: '0815-6677-8899', idCard: '3171091414810001', isEmergency: true, status: 'VERIFIED' },
    { id: 'res-12', houseCode: 'C-22', fullName: 'Joko Widodo', relation: 'KEPALA_KELUARGA', phone: '0819-0011-2233', idCard: '3171092222830001', isEmergency: true, status: 'VERIFIED' },
  ]);

  // Master Vehicles State
  const [vehicles, setVehicles] = useState([
    { id: 'veh-1', houseCode: 'A-17', plateNumber: 'B 1234 ABC', type: 'Mobil', brand: 'Toyota', model: 'Avanza Veloz', color: 'Hitam Metalik', rfidStatus: 'AKTIF' },
    { id: 'veh-2', houseCode: 'A-17', plateNumber: 'B 5678 DEF', type: 'Motor', brand: 'Honda', model: 'Vario 160', color: 'Putih Mutiara', rfidStatus: 'AKTIF' },
    { id: 'veh-3', houseCode: 'A-01', plateNumber: 'B 9999 HG', type: 'Mobil', brand: 'Honda', model: 'CR-V Turbo', color: 'Abu-Abu', rfidStatus: 'AKTIF' },
    { id: 'veh-4', houseCode: 'B-07', plateNumber: 'B 8888 AW', type: 'Mobil', brand: 'Mitsubishi', model: 'Pajero Sport', color: 'Putih', rfidStatus: 'AKTIF' },
    { id: 'veh-5', houseCode: 'B-07', plateNumber: 'B 7777 WZ', type: 'Motor', brand: 'Yamaha', model: 'NMAX 155', color: 'Hitam Doff', rfidStatus: 'AKTIF' },
    { id: 'veh-6', houseCode: 'C-12', plateNumber: 'B 1111 BS', type: 'Mobil', brand: 'Toyota', model: 'Innova Zenix', color: 'Silver Metalik', rfidStatus: 'AKTIF' },
    { id: 'veh-7', houseCode: 'D-05', plateNumber: 'B 2222 RK', type: 'Mobil', brand: 'Hyundai', model: 'IONIQ 5', color: 'Gravity Gold', rfidStatus: 'AKTIF' },
    { id: 'veh-8', houseCode: 'B-14', plateNumber: 'B 3333 SP', type: 'Mobil', brand: 'Wuling', model: 'Air EV', color: 'Peach Pink', rfidStatus: 'AKTIF' },
    { id: 'veh-9', houseCode: 'C-22', plateNumber: 'B 4444 JW', type: 'Mobil', brand: 'Toyota', model: 'Fortuner GR', color: 'Hitam', rfidStatus: 'AKTIF' },
  ]);

  // Permits State
  const [permits, setPermits] = useState([
    { id: 'PERMIT-2026-001', houseCode: 'A-17', workType: 'Pengecatan & Kanopi', contractorName: 'Bpk. Sugeng (Mandor CV Berkah)', workersCount: 3, startDate: '2026-08-25', endDate: '2026-09-05', status: 'APPROVED', description: 'Pengecatan fasad luar dan perbaikan talang air kanopi garasi.' },
    { id: 'PERMIT-2026-002', houseCode: 'B-12', workType: 'Renovasi Dapur Belakang', contractorName: 'Bpk. Yanto (Mandor Sejahtera)', workersCount: 4, startDate: '2026-08-20', endDate: '2026-09-15', status: 'APPROVED', description: 'Pemasangan keramik dinding dapur dan penutupan dak jemuran.' },
    { id: 'PERMIT-2026-003', houseCode: 'C-05', workType: 'Perbaikan Atap Bocor', contractorName: 'Bpk. Maman', workersCount: 2, startDate: '2026-08-28', endDate: '2026-09-02', status: 'PENDING_REVIEW', description: 'Pergantian 15 genteng pecah di atap lantai 2.' },
    { id: 'PERMIT-2026-004', houseCode: 'D-19', workType: 'Pemasangan Solar Panel', contractorName: 'PT Surya Nusantara Mandiri', workersCount: 5, startDate: '2026-08-15', endDate: '2026-08-27', status: 'COMPLETED', description: 'Pemasangan 8 panel surya di atas dak genteng.' },
  ]);
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [pCode, setPCode] = useState('A-17');
  const [pType, setPType] = useState('Pengecatan & Kanopi');
  const [pContractor, setPContractor] = useState('');
  const [pWorkers, setPWorkers] = useState(2);
  const [pStart, setPStart] = useState('2026-09-01');
  const [pEnd, setPEnd] = useState('2026-09-10');
  const [pDesc, setPDesc] = useState('');

  // Selected Pass Preview Modal
  const [selectedPassVehicle, setSelectedPassVehicle] = useState<any>(null);

  // Trigger Notification Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingPropertyId(null);
    setFormCode('');
    setFormNumber('');
    setFormBlock('block-a');
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

  // Open Form for Edit
  const handleOpenEdit = (prop: PropertyListItem) => {
    setEditingPropertyId(prop.id);
    setFormCode(prop.code);
    setFormNumber(prop.number || prop.code.split('-')[1] || '1');
    setFormBlock(`block-${prop.blockCode?.toLowerCase() || 'a'}`);
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

  // Handle Save Property (Create / Update)
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: formCode.toUpperCase(),
        number: formNumber || formCode.replace(/[^0-9]/g, ''),
        blockId: formBlock,
        address: formAddress || `Jl. Taman Sejahtera Blok ${formCode.split('-')[0]?.toUpperCase()} No. ${formNumber}`,
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
          // Update existing
          setProperties(properties.map(p => p.id === editingPropertyId ? {
            ...p,
            code: formCode.toUpperCase(),
            number: formNumber,
            blockCode: blk,
            address: payload.address,
            occupancyStatus: formOccupancy,
            ownerName: formOwner || '-',
          } : p));
          showToast(`Data rumah ${formCode.toUpperCase()} berhasil diperbarui.`);
        } else {
          // Create new
          const newProp: PropertyListItem = {
            id: `prop-${formCode.toLowerCase()}`,
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
          showToast(`Unit rumah baru ${formCode.toUpperCase()} berhasil didaftarkan.`);
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
        showToast(`Rumah ${propertyToDelete.code} berhasil dihapus dari direktori aktif.`);
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

  // Create Permit
  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pContractor || !pDesc) return;
    setPermits([
      {
        id: `PERMIT-2026-00${permits.length + 1}`,
        houseCode: pCode.toUpperCase(),
        workType: pType,
        contractorName: pContractor,
        workersCount: Number(pWorkers),
        startDate: pStart,
        endDate: pEnd,
        status: 'APPROVED',
        description: pDesc,
      },
      ...permits,
    ]);
    setShowAddPermitModal(false);
    setPContractor('');
    setPDesc('');
    showToast(`Izin renovasi untuk Rumah ${pCode.toUpperCase()} berhasil diterbitkan.`);
  };

  const handleTogglePermitStatus = (id: string, newStatus: string) => {
    setPermits(permits.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showToast(`Status izin ${id} diubah menjadi ${newStatus}.`);
  };

  const handleToggleRfid = (id: string) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, rfidStatus: v.rfidStatus === 'AKTIF' ? 'DIBLOKIR' : 'AKTIF' } : v));
    showToast(`Status akses gerbang RFID diperbarui.`);
  };

  // Filtered & Sorted Properties
  const filteredAndSortedProperties = useMemo(() => {
    const list = properties.filter((p) => {
      const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) || (p.ownerName && p.ownerName.toLowerCase().includes(search.toLowerCase())) || p.address.toLowerCase().includes(search.toLowerCase());
      const matchBlock = selectedBlock === 'ALL' || p.blockCode === selectedBlock;
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

  // Pagination Calculations
  const totalItems = filteredAndSortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredResidents = residents.filter((r) => {
    const matchSearch = r.fullName.toLowerCase().includes(residentSearch.toLowerCase()) || r.houseCode.toLowerCase().includes(residentSearch.toLowerCase()) || r.phone.includes(residentSearch);
    const matchCat = residentCategory === 'ALL' || r.relation === residentCategory;
    return matchSearch && matchCat;
  });

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

  const handleExportPropertiesCSV = () => {
    const headers = ['Kode Rumah', 'Nomor', 'Blok', 'Alamat', 'Status Hunian', 'Nama Pemilik / Penghuni', 'Jumlah Penghuni', 'Jumlah Kendaraan'];
    const rows = properties.map((p) => [
      p.code,
      p.number,
      p.blockCode,
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
    link.setAttribute('download', `DATA_120_RUMAH_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data 120 rumah berhasil diekspor ke CSV.');
  };

  const handleExportResidentsCSV = () => {
    const headers = ['No Rumah', 'Nama Lengkap', 'Hubungan Keluarga', 'No KTP/NIK', 'No WhatsApp', 'Kontak Darurat'];
    const rows = residents.map((r) => [
      r.houseCode,
      `"${r.fullName}"`,
      r.relation,
      `'${r.idCard}`,
      r.phone,
      r.isEmergency ? 'YA' : 'TIDAK',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_PENDUDUK_WARGAHUB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data kependudukan berhasil diekspor ke CSV.');
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
              {properties.length} Unit Terdaftar
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Master database unit hunian 120 rumah, data sensus kependudukan, pengawasan kendaraan, dan perizinan renovasi komplek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={activeSubTab === 'residents' ? handleExportResidentsCSV : handleExportPropertiesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-surface hover:bg-canvas border border-border text-ink text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-ink-muted" />
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Unit Rumah
          </button>
        </div>
      </div>

      {/* 5-SubTab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'units', label: 'Direktori 120 Rumah', icon: Home, count: properties.length },
          { id: 'residents', label: 'Database Kependudukan', icon: Users, count: 384 },
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

      {/* ================= SUBTAB 1: DIREKTORI 120 RUMAH (DENGAN PAGINATION & HAPUS) ================= */}
      {activeSubTab === 'units' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Hunian</span>
              <p className="text-xl font-black text-ink mt-0.5">{properties.length} Unit</p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Terpetakan</span>
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
                placeholder="Cari kode rumah (cth: A-17) atau nama..."
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
                <option value="ALL">Semua Blok (A, B, C, D)</option>
                <option value="A">Blok A</option>
                <option value="B">Blok B</option>
                <option value="C">Blok C</option>
                <option value="D">Blok D</option>
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
                <option value="code">Urut Kode Rumah</option>
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
                  title="Tampilan Grid Matriks Blok"
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
                      <th className="py-3.5 px-4">Kode Rumah</th>
                      <th className="py-3.5 px-4">Alamat Jalan</th>
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
                          Tidak ada data unit rumah yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-canvas/60 text-ink transition-colors">
                          <td className="py-3.5 px-4 font-bold text-sm text-primary-700 flex items-center gap-2">
                            <Home className="w-4 h-4 text-primary-600" />
                            Rumah {prop.code}
                          </td>
                          <td className="py-3.5 px-4 text-ink-muted font-medium">{prop.address}</td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLLER BAR */}
              <div className="p-4 border-t border-border bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-ink-muted">
                    Menampilkan <strong className="text-ink">{totalItems === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-ink">{endIndex}</strong> dari <strong className="text-ink">{totalItems}</strong> unit rumah
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

          {/* VIEW 2: VISUAL BLOCK GRID MATRIX */}
          {viewMode === 'grid' && (
            <div className="space-y-6">
              {['A', 'B', 'C', 'D'].map((blockLetter) => {
                const blockProps = filteredAndSortedProperties.filter(p => p.blockCode === blockLetter);
                if (selectedBlock !== 'ALL' && selectedBlock !== blockLetter) return null;
                return (
                  <div key={blockLetter} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-800 font-black flex items-center justify-center text-xs">
                          {blockLetter}
                        </span>
                        <h3 className="font-extrabold text-sm text-ink">Blok {blockLetter} (Jl. Taman Sejahtera {blockLetter})</h3>
                      </div>
                      <span className="text-xs text-ink-muted font-medium">{blockProps.length} Unit Rumah</span>
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

      {/* ================= SUBTAB 2: DATABASE KEPENDUDUKAN ================= */}
      {activeSubTab === 'residents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Total Sensus Jiwa</span>
              <p className="text-xl font-black text-ink mt-0.5">384 Jiwa</p>
              <span className="text-[10px] text-emerald-600 font-bold">120 KK Terdaftar</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Kepala Keluarga</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">120 Orang</p>
              <span className="text-[10px] text-ink-muted font-medium">Penanggung Jawab</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Anak & Pelajar</span>
              <p className="text-xl font-black text-sky-700 mt-0.5">142 Jiwa</p>
              <span className="text-[10px] text-sky-600 font-bold">Usia 0-18 Tahun</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Warga Lansia</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">28 Jiwa</p>
              <span className="text-[10px] text-amber-600 font-bold">Prioritas Posyandu</span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama warga, nomor rumah, NIK..."
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={residentCategory}
                onChange={(e) => setResidentCategory(e.target.value)}
                className="px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Hubungan Keluarga</option>
                <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                <option value="ISTRI">Istri</option>
                <option value="ANAK">Anak</option>
                <option value="ART">ART / Supir</option>
              </select>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3 px-4">No Rumah</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Hubungan Keluarga</th>
                    <th className="py-3 px-4">NIK (KTP)</th>
                    <th className="py-3 px-4">Kontak WhatsApp</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary-700">Rumah {r.houseCode}</td>
                      <td className="py-3 px-4 font-bold text-ink flex items-center gap-2">
                        {r.fullName}
                        {r.isEmergency && (
                          <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-md border border-rose-200">
                            Darurat
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-muted font-medium">{r.relation.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-ink-muted">{r.idCard}</td>
                      <td className="py-3 px-4 font-mono text-ink">{r.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          TERVERIFIKASI
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {r.phone !== '-' && (
                          <a
                            href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
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
              <p className="text-xl font-black text-ink mt-0.5">248 Unit</p>
              <span className="text-[10px] text-emerald-600 font-bold">120 Rumah</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Mobil Terdaftar</span>
              <p className="text-xl font-black text-primary-700 mt-0.5">142 Unit</p>
              <span className="text-[10px] text-ink-muted">Barrier Gate 1</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Sepeda Motor</span>
              <p className="text-xl font-black text-sky-700 mt-0.5">106 Unit</p>
              <span className="text-[10px] text-ink-muted">Lane Motor</span>
            </div>
            <div className="p-3.5 bg-surface rounded-2xl border border-border shadow-xs">
              <span className="text-[11px] text-ink-muted font-medium">Stiker RFID Aktif</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">248 RFID</p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Aktif</span>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-ink-muted font-bold">
                    <th className="py-3 px-4">Plat Nomor</th>
                    <th className="py-3 px-4">Rumah</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Merk & Model</th>
                    <th className="py-3 px-4">Warna</th>
                    <th className="py-3 px-4 text-center">Status RFID Akses</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-canvas/60 text-ink transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-sm text-ink">{v.plateNumber}</td>
                      <td className="py-3 px-4 font-bold text-primary-700">Rumah {v.houseCode}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-canvas text-ink-muted font-bold border border-border">
                          {v.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-ink">{v.brand} {v.model}</td>
                      <td className="py-3 px-4 text-ink-muted font-medium">{v.color}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRfid(v.id)}
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                            v.rfidStatus === 'AKTIF'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-red-50 hover:text-red-700'
                              : 'bg-red-50 text-red-800 border-red-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Klik untuk ubah status akses gerbang"
                        >
                          {v.rfidStatus}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPassVehicle(v)}
                          className="p-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg inline-flex items-center gap-1 font-bold text-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Cetak Stiker Pass
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

      {/* ================= SUBTAB 4: IZIN RENOVASI ================= */}
      {activeSubTab === 'permits' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-ink">Pengawasan Renovasi Lingkungan</h3>
              <p className="text-xs text-ink-muted">Pantau aktivitas tukang, masa berlaku permit, dan kepatuhan jam kerja.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPermitModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Terbitkan Izin Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {permits.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-200">
                      Rumah {p.houseCode}
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">{p.id}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    p.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : p.status === 'COMPLETED'
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {p.status === 'APPROVED' ? 'SEDANG BERJALAN' : p.status === 'COMPLETED' ? 'SELESAI' : 'MENUNGGU ACC'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-ink">{p.workType}</h4>
                  <p className="text-xs text-ink-muted mt-0.5">{p.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-canvas text-xs">
                  <div>
                    <span className="text-[10px] text-ink-muted">Mandor / Kontraktor:</span>
                    <p className="font-bold text-ink">{p.contractorName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted">Tenaga Kerja:</span>
                    <p className="font-bold text-ink">{p.workersCount} Orang Tukang</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/60">
                    <span className="text-[10px] text-ink-muted">Masa Izin:</span>
                    <p className="font-semibold text-ink">{p.startDate} s/d {p.endDate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {p.status === 'PENDING_REVIEW' && (
                    <button
                      type="button"
                      onClick={() => handleTogglePermitStatus(p.id, 'APPROVED')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Setujui Izin
                    </button>
                  )}
                  {p.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleTogglePermitStatus(p.id, 'COMPLETED')}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                Statistik Okupansi per Blok Hunian
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { block: 'Blok A', rate: '96.7%', filled: 29, total: 30, color: 'bg-emerald-500' },
                  { block: 'Blok B', rate: '90.0%', filled: 27, total: 30, color: 'bg-blue-500' },
                  { block: 'Blok C', rate: '93.3%', filled: 28, total: 30, color: 'bg-indigo-500' },
                  { block: 'Blok D', rate: '96.7%', filled: 29, total: 30, color: 'bg-purple-500' },
                ].map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{b.block} ({b.filled}/{b.total} Rumah)</span>
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

      {/* ================= MODAL: DETAIL RUMAH (VIEW) ================= */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 border border-border shadow-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">Rumah {activeProperty.code}</h3>
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

              <div className="space-y-2">
                <h4 className="font-black text-ink text-xs">Penghuni Terdaftar ({activeProperty.residentCount || 3} Jiwa):</h4>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <p className="font-bold text-ink">{activeProperty.ownerName || 'Budi Santoso'}</p>
                      <p className="text-[10px] text-ink-muted">Kepala Keluarga • 0812-3456-7890</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-ink text-xs">Kendaraan Terdaftar ({activeProperty.vehicleCount || 1} Unit):</h4>
                <div className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary-600" />
                    <div>
                      <p className="font-mono font-bold text-ink">B 1234 ABC</p>
                      <p className="text-[10px] text-ink-muted">Toyota Avanza • Hitam</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md">
                    RFID PASS AKTIF
                  </span>
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

      {/* ================= MODAL: TAMBAH / EDIT RUMAH (KOLOM LENGKAP) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-xl w-full p-6 border border-border shadow-modal space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-ink">
                    {editingPropertyId ? `Edit Data Rumah ${formCode}` : 'Tambah Unit Rumah Baru'}
                  </h3>
                  <p className="text-[11px] text-ink-muted">Lengkapi seluruh kolom data teknis dan kepemilikan hunian.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-3.5 text-xs">
              {/* Seksi 1: Identitas Unit */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary-600" />
                  1. Identitas Unit Hunian
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Kode Rumah *</label>
                    <input
                      type="text"
                      placeholder="Contoh: A-31"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      required
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono font-bold uppercase text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Nomor Unit *</label>
                    <input
                      type="text"
                      placeholder="31"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      required
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Blok Hunian *</label>
                    <select
                      value={formBlock}
                      onChange={(e) => setFormBlock(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="block-a">Blok A</option>
                      <option value="block-b">Blok B</option>
                      <option value="block-c">Blok C</option>
                      <option value="block-d">Blok D</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Alamat Lengkap Jalan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Taman Sejahtera Blok A No. 31"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              {/* Seksi 2: Kepemilikan & Status Okupansi */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary-600" />
                  2. Status Okupansi & Kontak Pemilik
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Status Okupansi *</label>
                    <select
                      value={formOccupancy}
                      onChange={(e) => setFormOccupancy(e.target.value as any)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    >
                      <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
                      <option value="RENTED">Disewa / Kontrak</option>
                      <option value="VACANT">Kosong</option>
                      <option value="RENOVATION">Renovasi</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Nama Kepala Rumah</label>
                    <input
                      type="text"
                      placeholder="Nama Pemilik / Penghuni"
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={formOwnerPhone}
                      onChange={(e) => setFormOwnerPhone(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">NIK KTP Pemilik</label>
                    <input
                      type="text"
                      placeholder="317109xxxxxxxxxx"
                      value={formOwnerNik}
                      onChange={(e) => setFormOwnerNik(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Spesifikasi Teknis & Utilitas */}
              <div className="p-3 bg-canvas/60 rounded-2xl border border-border space-y-2.5">
                <h4 className="font-black text-ink text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  3. Spesifikasi Bangunan & Utilitas
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Tipe Bangunan</label>
                    <input
                      type="text"
                      placeholder="Tipe 72/120"
                      value={formBuildingType}
                      onChange={(e) => setFormBuildingType(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Luas Tanah (m²)</label>
                    <input
                      type="number"
                      value={formLandArea}
                      onChange={(e) => setFormLandArea(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Luas Bangunan (m²)</label>
                    <input
                      type="number"
                      value={formBuildingArea}
                      onChange={(e) => setFormBuildingArea(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-ink block mb-1">Daya Listrik PLN</label>
                    <select
                      value={formPlnCapacity}
                      onChange={(e) => setFormPlnCapacity(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl text-ink font-mono font-bold"
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
                    <label className="font-bold text-ink block mb-1">No. Meter PAM</label>
                    <input
                      type="text"
                      placeholder="PAM-88301"
                      value={formPamMeterNo}
                      onChange={(e) => setFormPamMeterNo(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink block mb-1">Iuran Bulanan (IPL)</label>
                    <input
                      type="number"
                      value={formMonthlyRate}
                      onChange={(e) => setFormMonthlyRate(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-xl font-mono text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Catatan Tambahan Hunian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rumah posisi hoek, ada kanopi 2 mobil, dekat pos satpam"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-ink"
                  />
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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Menyimpan Unit...' : editingPropertyId ? 'Perbarui Data Rumah' : 'Daftarkan Unit Rumah'}
                </button>
              </div>
            </form>
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
              <h3 className="font-black text-lg text-ink">Hapus Unit Rumah {propertyToDelete.code}?</h3>
              <p className="text-xs text-ink-muted">
                Unit <strong>{propertyToDelete.address}</strong> akan dinonaktifkan dari direktori master 120 rumah. Tindakan ini akan tercatat dalam Jejak Audit Keamanan.
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

      {/* ================= MODAL: ADD PERMIT ================= */}
      {showAddPermitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 border border-border shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-ink">Terbitkan Izin Renovasi Baru</h3>
              <button onClick={() => setShowAddPermitModal(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePermit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Unit Rumah *</label>
                  <input
                    type="text"
                    placeholder="A-17"
                    value={pCode}
                    onChange={(e) => setPCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl uppercase font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Jenis Pekerjaan</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-ink font-bold"
                  >
                    <option value="Pengecatan & Kanopi">Pengecatan & Kanopi</option>
                    <option value="Renovasi Interior">Renovasi Interior</option>
                    <option value="Perbaikan Atap">Perbaikan Atap</option>
                    <option value="Pembangunan Total">Pembangunan Total</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Mandor / Penanggung Jawab *</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Sugeng (CV Berkah)"
                  value={pContractor}
                  onChange={(e) => setPContractor(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Jml Tukang</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={pWorkers}
                    onChange={(e) => setPWorkers(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Mulai</label>
                  <input
                    type="date"
                    value={pStart}
                    onChange={(e) => setPStart(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Selesai</label>
                  <input
                    type="date"
                    value={pEnd}
                    onChange={(e) => setPEnd(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Deskripsi Pekerjaan *</label>
                <textarea
                  rows={2}
                  placeholder="Rincian renovasi..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  required
                  className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPermitModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-ink font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs"
                >
                  Terbitkan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QR PASS PRINT PREVIEW ================= */}
      {selectedPassVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 border border-border shadow-modal text-center space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-black text-sm text-ink">Stiker Akses RFID / QR Gate</h3>
              <button onClick={() => setSelectedPassVehicle(null)} className="text-ink-muted hover:text-ink">✕</button>
            </div>

            <div className="p-4 bg-canvas rounded-2xl border border-border inline-block">
              <QrCode className="w-36 h-36 mx-auto text-primary-700" />
            </div>

            <div>
              <p className="font-mono text-xl font-black text-ink">{selectedPassVehicle.plateNumber}</p>
              <p className="text-xs font-bold text-primary-700">Rumah {selectedPassVehicle.houseCode} • {selectedPassVehicle.brand} {selectedPassVehicle.model}</p>
              <span className="inline-block mt-2 px-3 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                GATE 1 AUTO BARRIER AUTHORIZED
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak stiker akses untuk plat: ${selectedPassVehicle.plateNumber}`);
                  setSelectedPassVehicle(null);
                }}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Cetak Stiker Fisik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
