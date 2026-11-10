/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useUrlTab } from '../../lib/use-url-tab';
import { apiFetch } from '../../lib/api-fetch';
import React, { useState, useMemo, useEffect } from 'react';
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
import { 
  DEFAULT_RESIDENTS, 
  DEFAULT_VEHICLES, 
  DEFAULT_PERMITS, 
  DEFAULT_UTILITIES,
  type ResidentItem,
  type VehicleItem,
  type PermitItem,
  type UtilityItem,
} from '../../types/property-submodules';
import { ErrorBoundary } from '../shared/ErrorBoundary';

interface PropertiesManagerProps {
  initialProperties: PropertyListItem[];
  initialTab?: string;
  initialResidents?: ResidentItem[];
  initialVehicles?: VehicleItem[];
  initialPermits?: PermitItem[];
  initialUtilities?: UtilityItem[];
  initialHouse?: string;
  initialQuery?: string;
  canEdit?: boolean;
  canOpenBilling?: boolean;
}

const PropertiesManagerInner: React.FC<PropertiesManagerProps> = ({
  initialProperties = [],
  initialTab = 'units',
  initialResidents,
  initialVehicles,
  initialPermits,
  initialUtilities,
  initialHouse = '', initialQuery = '', canEdit = false, canOpenBilling = false,
}) => {
  const tabs = ['units','residents','vehicles','permits','analytics'] as const;
  type RegistryTab = typeof tabs[number];
  const aliases: Record<string,RegistryTab> = {owners:'units',occupants:'residents',rfid:'vehicles',renovation:'permits',utilities:'analytics',occupancy:'analytics'};
  const [activeSubTab, setActiveSubTab] = useUrlTab(tabs,'units','tab',aliases,initialTab);
  const [houseFilter,setHouseFilter] = useState(initialHouse);
  useEffect(()=>{
    const restore=()=>setHouseFilter(new URLSearchParams(window.location.search).get('house') || '');
    window.addEventListener('popstate',restore); return ()=>window.removeEventListener('popstate',restore);
  },[]);
  function scopeHouse(code:string,tab:RegistryTab=activeSubTab) {
    const url=new URL(window.location.href);
    url.searchParams.set('tab',tab);
    if(code) url.searchParams.set('house',code); else url.searchParams.delete('house');
    url.searchParams.delete('q');
    if(url.href!==window.location.href) window.history.pushState(window.history.state,'',url);
    setHouseFilter(code); setActiveSubTab(tab); setSearch('');
    setResidentSearch(''); setVehicleSearch(''); setPermitSearch(''); setUtilitySearch('');
    setActiveProperty(null);
  }
  const handleTabChange=(tab:RegistryTab)=>setActiveSubTab(tab);
  const matchesHouse=(code:string)=>!houseFilter || code.toLowerCase()===houseFilter.toLowerCase();

  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'grid'>('auto');
  const [properties, setProperties] = useState<PropertyListItem[]>(initialProperties || []);
  const [search, setSearch] = useState(initialQuery);
  useEffect(() => {
    const syncSearch = () => setSearch(new URLSearchParams(window.location.search).get('q') || '');
    syncSearch();
    window.addEventListener('popstate', syncSearch);
    return () => window.removeEventListener('popstate', syncSearch);
  }, []);
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialTab === 'owners' ? 'OWNER_OCCUPIED' : 'ALL');
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
  const [formCode, setFormCode] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOccupancy, setFormOccupancy] = useState<'OWNER_OCCUPIED' | 'RENTED' | 'VACANT' | 'RENOVATION' | 'BORROWED' | 'FOR_SALE' | 'OTHER'>('OWNER_OCCUPIED');
  const [formOwner, setFormOwner] = useState('');
  const [formOccupant, setFormOccupant] = useState('');
  const [formBuildingType, setFormBuildingType] = useState('');
  const [formLandArea, setFormLandArea] = useState(0);
  const [formBuildingArea, setFormBuildingArea] = useState(0);
  const [formPlnCapacity, setFormPlnCapacity] = useState('3.500 VA');
  const [formPamMeterNo, setFormPamMeterNo] = useState('PAM-88301');
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
  // ================= RESIDENTS (PENGHUNI) STATE =================
  const [residentCategory, setResidentCategory] = useState('ALL');
  const [residentSearch, setResidentSearch] = useState('');
  const [residentSortBy, setResidentSortBy] = useState<'fullName' | 'houseCode' | 'relation' | 'occupation' | 'idCard'>('houseCode');
  const [residentSortOrder, setResidentSortOrder] = useState<'asc' | 'desc'>('asc');
  const [residentCurrentPage, setResidentCurrentPage] = useState(1);
  const [residentPageSize, setResidentPageSize] = useState(10);

  const [residents, setResidents] = useState<ResidentItem[]>(
    initialResidents && initialResidents.length > 0 ? initialResidents : []
  );

  // Resident Form Modal State
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<string | null>(null);
  const [activeResidentView, setActiveResidentView] = useState<any>(null);
  const [residentToDelete, setResidentToDelete] = useState<any>(null);
  const [residentDeleteReason, setResidentDeleteReason] = useState('Pindah Domisili Keluar Komplek');

  // Resident Form Fields
  const [resHouseCode, setResHouseCode] = useState(properties[0]?.code || 'Kav A');
  const [resAreaLabel, setResAreaLabel] = useState('Kavling');
  const [resFullName, setResFullName] = useState('');
  const [resRelation, setResRelation] = useState<'KEPALA_KELUARGA' | 'ISTRI' | 'ANAK' | 'ORANG_TUA' | 'FAMILI_LAIN' | 'ART' | 'PENYEWA'>('KEPALA_KELUARGA');
  const [resGender, setResGender] = useState<ResidentItem['gender']>('');
  const [resBirthPlaceDate, setResBirthPlaceDate] = useState('Bandung, 14-04-1985');
  const [resReligion, setResReligion] = useState('ISLAM');
  const [resOccupation, setResOccupation] = useState('Karyawan Swasta');
  const [resPhone, setResPhone] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resIdCard, setResIdCard] = useState('');
  const [resFamilyCard, setResFamilyCard] = useState('');
  const [resDomicileStatus, setResDomicileStatus] = useState<ResidentItem['domicileStatus']>('');
  const [resBloodType, setResBloodType] = useState<ResidentItem['bloodType']>('');
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

  const [vehicles, setVehicles] = useState<VehicleItem[]>(
    initialVehicles && initialVehicles.length > 0 ? initialVehicles : []
  );

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
  const [vehHouseCode, setVehHouseCode] = useState(properties[0]?.code || 'Kav A');
  const [vehAreaLabel, setVehAreaLabel] = useState('Kavling');
  const [vehOwnerName, setVehOwnerName] = useState(properties[0]?.ownerName || 'Pak Verial');
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

  const [permits, setPermits] = useState<PermitItem[]>(
    initialPermits && initialPermits.length > 0 ? initialPermits : []
  );

  // Permit Form Modal State
  const [showAddPermitModal, setShowAddPermitModal] = useState(false);
  const [editingPermitId, setEditingPermitId] = useState<string | null>(null);
  const [activePermitView, setActivePermitView] = useState<any>(null);
  const [selectedPrintPermit, setSelectedPrintPermit] = useState<any>(null);
  const [permitToDelete, setPermitToDelete] = useState<any>(null);
  const [permitDeleteReason, setPermitDeleteReason] = useState('Izin Dibatalkan / Proyek Batal');

  // Permit Checkbox Selection & Bulk Delete State
  const [selectedPermitIds, setSelectedPermitIds] = useState<string[]>([]);
  const [showBulkDeletePermitModal, setShowBulkDeletePermitModal] = useState(false);
  const [bulkDeletingPermit, setBulkDeletingPermit] = useState(false);

  // Permit Form Fields
  const [pCode, setPCode] = useState(properties[0]?.code || 'Kav D');
  const [pAreaLabel, setPAreaLabel] = useState('Kavling');
  const [pOwnerName, setPOwnerName] = useState(properties[0]?.ownerName || 'Pak Rieva');
  const [pType, setPType] = useState('Pengecatan & Kanopi');
  const [pContractor, setPContractor] = useState('');
  const [pContractorPhone, setPContractorPhone] = useState('0812-3344-5566');
  const [pWorkers, setPWorkers] = useState(3);
  const [pWorkersList, setPWorkersList] = useState('');
  const [pStart, setPStart] = useState('');
  const [pEnd, setPEnd] = useState('');
  const [pAllowedHours, setPAllowedHours] = useState('08:00 - 17:00 WIB (Senin - Sabtu)');
  const [pStatus, setPStatus] = useState<'APPROVED' | 'PENDING_REVIEW' | 'COMPLETED' | 'SUSPENDED'>('PENDING_REVIEW');
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

  const [utilities, setUtilities] = useState<UtilityItem[]>(
    initialUtilities && initialUtilities.length > 0 ? initialUtilities : []
  );

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
  const [uCode, setUCode] = useState(properties[0]?.code || 'Kav A');
  const [uAreaLabel, setUAreaLabel] = useState('Kavling');
  const [uOwnerName, setUOwnerName] = useState(properties[0]?.ownerName || 'Pak Verial');
  const [uPlnCapacity, setUPlnCapacity] = useState('3.500 VA');
  const [uPlnCustomerId, setUPlnCustomerId] = useState('PLN-5388123490');
  const [uPamMeterNo, setUPamMeterNo] = useState('PAM-88301');
  const [uPamLastMonth, setUPamLastMonth] = useState(120);
  const [uPamThisMonth, setUPamThisMonth] = useState(138);
  const [uWasteSchedule, setUWasteSchedule] = useState('SENIN_RABU_JUMAT');
  const [uHasBiopori, setUHasBiopori] = useState(true);
  const [uHasSolarPanel, setUHasSolarPanel] = useState(false);
  const [uNotes, setUNotes] = useState('');
  const [utilitySaving, setUtilitySaving] = useState(false);

  useEffect(()=>{
    setSelectedPropertyIds([]); setSelectedResidentIds([]); setSelectedVehicleIds([]); setSelectedPermitIds([]); setSelectedUtilityIds([]);
  },[houseFilter]);

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
    setEditingPropertyId(null); setFormCode(''); setFormNumber(''); setFormAddress(''); setFormOccupancy('OWNER_OCCUPIED');
    setFormOwner(''); setFormOccupant(''); setFormBuildingType(''); setFormLandArea(0); setFormBuildingArea(0);
    setFormPlnCapacity(''); setFormPamMeterNo(''); setFormNotes(''); setShowAddModal(true);
  };
  const handleOpenEdit = (property: PropertyListItem) => {
    setEditingPropertyId(property.id); setFormCode(property.code); setFormNumber(property.number); setFormAddress(property.address);
    setFormOccupancy((property.occupancyStatus || 'OTHER') as typeof formOccupancy); setFormOwner(property.legalOwner || '');
    setFormOccupant(property.occupantName || ''); setFormBuildingType(property.buildingType || '');
    setFormLandArea(property.landArea ?? 0); setFormBuildingArea(property.buildingArea ?? 0);
    setFormPlnCapacity(property.plnCapacity || ''); setFormPamMeterNo(property.pamMeterNo || '');
    setFormNotes(property.notes || ''); setShowAddModal(true);
  };
  const handleSaveProperty = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      const response=await apiFetch('/api/properties/'+(editingPropertyId?'update':'create'),{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:editingPropertyId || undefined,code:formCode,number:formNumber || formCode,address:formAddress,
          occupancyStatus:formOccupancy,ownerName:formOwner.trim() || undefined,occupantName:formOccupant.trim() || undefined,
          buildingType:formBuildingType,landArea:formLandArea || undefined,buildingArea:formBuildingArea || undefined,
          plnCapacity:formPlnCapacity,pamMeterNo:formPamMeterNo,notes:formNotes}),
      });
      const {data}=await response.json();
      setProperties(items=>items.some(item=>item.id===data.id)?items.map(item=>item.id===data.id?data:item):[data,...items]);
      setActiveProperty(item=>item?.id===data.id?data:item);
      if(!editingPropertyId && houseFilter && !matchesHouse(data.code)) scopeHouse(data.code,'units');
      const latest = await fetch('/api/properties/occupants').then(res=>res.ok?res.json():null).catch(()=>null);
      if(Array.isArray(latest)) setResidents(latest);
      setShowAddModal(false); showToast('Rumah disimpan.');
    } catch(error) { showToast(error instanceof Error?error.message:'Rumah belum dapat disimpan.'); }
    finally {setSaving(false);}
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
    setResHouseCode(houseFilter || properties[0]?.code || '');
    setResAreaLabel(properties[0]?.code?.toUpperCase().startsWith('KAV') ? 'Kavling' : 'Komplek');
    setResFullName('');
    setResRelation('FAMILI_LAIN');
    setResGender('');
    setResBirthPlaceDate('');
    setResReligion('');
    setResOccupation('');
    setResPhone('');
    setResEmail('');
    setResIdCard('');
    setResFamilyCard('');
    setResDomicileStatus('');
    setResBloodType('');
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
    setResGender(r.gender || '');
    setResBirthPlaceDate(r.birthPlaceDate || 'Jakarta, 12-03-1985');
    setResReligion(r.religion || 'ISLAM');
    setResOccupation(r.occupation || 'Karyawan Swasta');
    setResPhone(r.phone || '');
    setResEmail(r.email || '');
    setResIdCard(r.idCard || '');
    setResFamilyCard(r.familyCard || '');
    setResDomicileStatus(r.domicileStatus || '');
    setResBloodType(r.bloodType || '');
    setResIsEmergency(Boolean(r.isEmergency));
    setResNotes(r.notes || '');
    setShowResidentModal(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setResSaving(true);
    try {
      const property = properties.find(item => item.code === resHouseCode);
      if (!property) throw new Error('Pilih rumah yang terdaftar.');
      const payload = {
        propertyId: property.id,
        id: editingResidentId || undefined,
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

      const response = await apiFetch('/api/properties/occupants/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const { data } = await response.json();
      setResidents(items => items.some(item => item.id === data.id) ? items.map(item => item.id === data.id ? data : item) : [data, ...items]);
      setShowResidentModal(false);
      showToast('Data penghuni disimpan.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Perubahan belum tersimpan.');
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
    const house=properties.find(item=>matchesHouse(item.code)) || properties[0];
    setEditingVehicleId(null); setVehHouseCode(house?.code || ''); setVehAreaLabel(house?.blockName || '');
    setVehOwnerName(house?.headName || house?.legalOwner || ''); setVehPlateNumber(''); setVehType('Mobil');
    setVehBrand(''); setVehModel(''); setVehYear(0); setVehColor(''); setVehRfidTag('');
    setVehGateAccess(''); setVehRfidStatus('PENDING_VERIFIKASI'); setVehNotes(''); setShowVehicleModal(true);
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
    if (vehSaving) return;
    const property = properties.find(item => item.code === vehHouseCode);
    if (!property) { showToast('Pilih rumah yang terdaftar.'); return; }
    setVehSaving(true);
    try {
      const res = await fetch('/api/properties/vehicles/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingVehicleId || undefined, propertyId: property.id, plateNumber: vehPlateNumber,
          type: vehType, brand: vehBrand, model: vehModel, year: vehYear || undefined, color: vehColor,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Kendaraan belum tersimpan.');
      const saved: VehicleItem = json.data;
      setVehicles(previous => editingVehicleId ? previous.map(item => item.id === saved.id ? saved : item) : [saved, ...previous]);
      showToast(editingVehicleId ? 'Kendaraan diperbarui.' : 'Kendaraan terdaftar.');
      setShowVehicleModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Kendaraan belum tersimpan.');
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
    const house=properties.find(item=>matchesHouse(item.code)) || properties[0];
    setEditingPermitId(null); setPCode(house?.code || ''); setPAreaLabel(house?.blockName || '');
    setPOwnerName(house?.legalOwner || ''); setPType('Pengecatan & Kanopi'); setPContractor(''); setPContractorPhone('');
    setPWorkers(1); setPWorkersList(''); setPStart(''); setPEnd(''); setPAllowedHours('');
    setPStatus('PENDING_REVIEW'); setPDesc(''); setShowAddPermitModal(true);
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
      const property = properties.find(item => item.code === pCode);
      if (!property) throw new Error('Pilih rumah yang terdaftar.');
      const payload = {
        propertyId: property.id,
        id: editingPermitId || undefined,
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

      const response = await apiFetch('/api/properties/permits/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const { data } = await response.json();
      setPermits(items => items.some(item => item.id === data.id) ? items.map(item => item.id === data.id ? data : item) : [data, ...items]);
      setShowAddPermitModal(false);
      showToast('Izin renovasi disimpan.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Perubahan belum tersimpan.');
    } finally {
      setPermitSaving(false);
    }
  };

  const handleQuickTogglePermitStatus = async (permit: PermitItem) => {
    if (permit.status === 'COMPLETED') return;
    const status = permit.status === 'APPROVED' ? 'COMPLETED' : 'APPROVED';
    try {
      const response = await apiFetch('/api/properties/permits/status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: permit.id, status, expectedStatus: permit.status }),
      });
      const { data } = await response.json();
      setPermits(items => items.map(item => item.id === data.id ? data : item));
      showToast('Status izin diperbarui.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Status belum berubah.'); }
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
    const property=properties.find(item=>item.code===houseFilter) || properties[0];
    const existing=utilities.find(item=>item.propertyId===property?.id);
    if(existing) {handleOpenEditUtility(existing);return;}
    setEditingUtilityId(null); setUCode(property?.code || ''); setUAreaLabel(property?.blockName || ''); setUOwnerName(property?.legalOwner || '');
    setUPlnCapacity(property?.plnCapacity || ''); setUPlnCustomerId(''); setUPamMeterNo(property?.pamMeterNo || '');
    setUPamLastMonth(0); setUPamThisMonth(0); setUWasteSchedule(''); setUHasBiopori(false); setUHasSolarPanel(false); setUNotes('');
    setShowUtilityModal(true);
  };
  const handleOpenEditUtility = (utility: UtilityItem) => {
    setEditingUtilityId(utility.id); setUCode(utility.houseCode); setUAreaLabel(utility.areaLabel); setUOwnerName(utility.ownerName);
    setUPlnCapacity(utility.plnCapacity); setUPlnCustomerId(utility.plnCustomerId); setUPamMeterNo(utility.pamMeterNo);
    setUPamLastMonth(utility.pamReadingLastMonth); setUPamThisMonth(utility.pamReadingThisMonth); setUWasteSchedule(utility.wasteSchedule);
    setUHasBiopori(utility.hasBiopori); setUHasSolarPanel(utility.hasSolarPanel); setUNotes(utility.notes || ''); setShowUtilityModal(true);
  };
  const handleSaveUtility = async (event: React.FormEvent) => {
    event.preventDefault(); setUtilitySaving(true);
    try {
      const property=properties.find(item=>item.code===uCode);
      if(!property) throw new Error('Pilih rumah yang terdaftar.');
      const response=await apiFetch('/api/properties/utilities/create',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({propertyId:property.id,plnCapacity:uPlnCapacity,plnCustomerId:uPlnCustomerId,pamMeterNo:uPamMeterNo,
          pamReadingLastMonth:uPamLastMonth,pamReadingThisMonth:uPamThisMonth,wasteSchedule:uWasteSchedule,
          hasBiopori:uHasBiopori,hasSolarPanel:uHasSolarPanel,notes:uNotes}),
      });
      const {data}=await response.json();
      setUtilities(items=>items.some(item=>item.id===data.id)?items.map(item=>item.id===data.id?data:item):[data,...items]);
      setProperties(items=>items.map(item=>item.id===property.id?{...item,plnCapacity:data.plnCapacity,pamMeterNo:data.pamMeterNo}:item));
      setShowUtilityModal(false); showToast('Catatan utilitas disimpan.');
    } catch(error) { showToast(error instanceof Error?error.message:'Utilitas belum dapat disimpan.'); }
    finally {setUtilitySaving(false);}
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
    const q = search.toLowerCase().trim();
    const normQ = q.replace(/[\s\-_]/g, '');
    const altKvaQ = normQ.startsWith('kva') ? 'kava' + normQ.slice(3) : normQ;

    const list = (properties || []).filter((p) => {
      if (!matchesHouse(p.code)) return false;
      const codeNorm = p.code.toLowerCase().replace(/[\s\-_]/g, '');
      const matchSearch = !q ||
                          p.code.toLowerCase().includes(q) ||
                          codeNorm.includes(normQ) ||
                          codeNorm.includes(altKvaQ) ||
                          (p.ownerName || '').toLowerCase().includes(q) ||
                          (p.occupantName || '').toLowerCase().includes(q) ||
                          (p.headName || '').toLowerCase().includes(q) ||
                          (p.address || '').toLowerCase().includes(q) ||
                          (p.notes || '').toLowerCase().includes(q);
      const matchBlock = selectedBlock === 'ALL' || p.blockCode === selectedBlock;
      const matchStatus = selectedStatus === 'ALL' || p.occupancyStatus === selectedStatus;
      return matchSearch && matchBlock && matchStatus;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'code') comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      else if (sortBy === 'owner') comparison = (a.ownerName || '').localeCompare(b.ownerName || '');
      else if (sortBy === 'status') comparison = a.occupancyStatus.localeCompare(b.occupancyStatus);
      else if (sortBy === 'residents') comparison = (a.residentCount || 0)-(b.residentCount || 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [properties, houseFilter, search, selectedBlock, selectedStatus, sortBy, sortOrder]);

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
    const q = (residentSearch || '').toLowerCase().trim();
    const list = (residents || []).filter((r) => {
      if (!matchesHouse(r.houseCode)) return false;
      const matchSearch = !q ||
                          (r.fullName || '').toLowerCase().includes(q) ||
                          (r.houseCode || '').toLowerCase().includes(q) ||
                          (r.occupation || '').toLowerCase().includes(q) ||
                          (r.idCard || '').toLowerCase().includes(q) ||
                          (r.phone || '').includes(q);
      const matchCat = residentCategory === 'ALL' || r.relation === residentCategory || r.domicileStatus === residentCategory;
      return matchSearch && matchCat;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (residentSortBy === 'fullName') comparison = (a.fullName || '').localeCompare(b.fullName || '');
      else if (residentSortBy === 'houseCode') comparison = (a.houseCode || '').localeCompare(b.houseCode || '', undefined, { numeric: true });
      else if (residentSortBy === 'relation') comparison = (a.relation || '').localeCompare(b.relation || '');
      else if (residentSortBy === 'occupation') comparison = (a.occupation || '').localeCompare(b.occupation || '');
      return residentSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [residents, houseFilter, residentSearch, residentCategory, residentSortBy, residentSortOrder]);

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
    const q = (vehicleSearch || '').toLowerCase().trim();
    const list = (vehicles || []).filter((v) => {
      if (!matchesHouse(v.houseCode)) return false;
      const matchSearch = !q ||
                          (v.plateNumber || '').toLowerCase().includes(q) ||
                          (v.houseCode || '').toLowerCase().includes(q) ||
                          (v.ownerName || '').toLowerCase().includes(q) ||
                          (v.rfidTag || '').toLowerCase().includes(q) ||
                          (v.brand || '').toLowerCase().includes(q) ||
                          (v.model || '').toLowerCase().includes(q);
      const matchType = vehicleTypeFilter === 'ALL' || v.type === vehicleTypeFilter;
      const matchRfid = vehicleRfidFilter === 'ALL' || v.rfidStatus === vehicleRfidFilter;
      return matchSearch && matchType && matchRfid;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (vehicleSortBy === 'plateNumber') comparison = (a.plateNumber || '').localeCompare(b.plateNumber || '');
      else if (vehicleSortBy === 'houseCode') comparison = (a.houseCode || '').localeCompare(b.houseCode || '', undefined, { numeric: true });
      else if (vehicleSortBy === 'type') comparison = (a.type || '').localeCompare(b.type || '');
      else if (vehicleSortBy === 'brand') comparison = (a.brand || '').localeCompare(b.brand || '');
      else if (vehicleSortBy === 'rfidStatus') comparison = (a.rfidStatus || '').localeCompare(b.rfidStatus || '');
      return vehicleSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [vehicles, houseFilter, vehicleSearch, vehicleTypeFilter, vehicleRfidFilter, vehicleSortBy, vehicleSortOrder]);

  const totalVehicles = filteredAndSortedVehicles.length;
  const totalVehiclePages = Math.max(1, Math.ceil(totalVehicles / vehiclePageSize));
  const safeVehiclePage = Math.min(vehicleCurrentPage, totalVehiclePages);
  const vehicleStartIndex = (safeVehiclePage - 1) * vehiclePageSize;
  const vehicleEndIndex = Math.min(vehicleStartIndex + vehiclePageSize, totalVehicles);
  const paginatedVehicles = filteredAndSortedVehicles.slice(vehicleStartIndex, vehicleEndIndex);

  // 4. Filtered & Sorted Permits
  const filteredAndSortedPermits = useMemo(() => {
    const q = (permitSearch || '').toLowerCase().trim();
    const list = (permits || []).filter((p) => {
      if (!matchesHouse(p.houseCode)) return false;
      const matchSearch = !q ||
                          (p.id || '').toLowerCase().includes(q) ||
                          (p.houseCode || '').toLowerCase().includes(q) ||
                          (p.ownerName || '').toLowerCase().includes(q) ||
                          (p.workType || '').toLowerCase().includes(q) ||
                          (p.contractorName || '').toLowerCase().includes(q);
      const matchStatus = permitStatusFilter === 'ALL' || p.status === permitStatusFilter;
      const matchType = permitTypeFilter === 'ALL' || (p.workType || '').includes(permitTypeFilter);
      return matchSearch && matchStatus && matchType;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (permitSortBy === 'id') comparison = (a.id || '').localeCompare(b.id || '');
      else if (permitSortBy === 'houseCode') comparison = (a.houseCode || '').localeCompare(b.houseCode || '', undefined, { numeric: true });
      else if (permitSortBy === 'startDate') comparison = (a.startDate || '').localeCompare(b.startDate || '');
      return permitSortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [permits, houseFilter, permitSearch, permitStatusFilter, permitTypeFilter, permitSortBy, permitSortOrder]);

  const totalPermits = filteredAndSortedPermits.length;
  const totalPermitPages = Math.max(1, Math.ceil(totalPermits / permitPageSize));
  const safePermitPage = Math.min(permitCurrentPage, totalPermitPages);
  const permitStartIndex = (safePermitPage - 1) * permitPageSize;
  const permitEndIndex = Math.min(permitStartIndex + permitPageSize, totalPermits);
  const paginatedPermits = filteredAndSortedPermits.slice(permitStartIndex, permitEndIndex);

  // 5. Filtered & Sorted Utilities
  const filteredAndSortedUtilities = useMemo(() => {
    const q = (utilitySearch || '').toLowerCase().trim();
    const list = (utilities || []).filter((u) => {
      if (!matchesHouse(u.houseCode)) return false;
      const matchSearch = !q ||
                          (u.houseCode || '').toLowerCase().includes(q) ||
                          (u.ownerName || '').toLowerCase().includes(q) ||
                          (u.pamMeterNo || '').toLowerCase().includes(q) ||
                          (u.plnCustomerId || '').toLowerCase().includes(q);
      const matchPln = utilityPlnFilter === 'ALL' || u.plnCapacity === utilityPlnFilter;
      const matchPayment = utilityPaymentFilter === 'ALL' || u.paymentStatus === utilityPaymentFilter;
      return matchSearch && matchPln && matchPayment;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (utilitySortBy === 'houseCode') comparison = (a.houseCode || '').localeCompare(b.houseCode || '', undefined, { numeric: true });
      else if (utilitySortBy === 'plnCapacity') comparison = (a.plnCapacity || '').localeCompare(b.plnCapacity || '');
      else if (utilitySortBy === 'pamUsage') comparison = (a.pamUsage || 0) - (b.pamUsage || 0);
      else if (utilitySortBy === 'monthlyIplFee') comparison = (a.monthlyIplFee || 0) - (b.monthlyIplFee || 0);
      else if (utilitySortBy === 'paymentStatus') comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
      return utilitySortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [utilities, houseFilter, utilitySearch, utilityPlnFilter, utilityPaymentFilter, utilitySortBy, utilitySortOrder]);

  const totalUtilities = filteredAndSortedUtilities.length;
  const totalUtilityPages = Math.max(1, Math.ceil(totalUtilities / utilityPageSize));
  const safeUtilityPage = Math.min(utilityCurrentPage, totalUtilityPages);
  const utilStartIndex = (safeUtilityPage - 1) * utilityPageSize;
  const utilEndIndex = Math.min(utilStartIndex + utilityPageSize, totalUtilities);
  const paginatedUtilities = filteredAndSortedUtilities.slice(utilStartIndex, utilEndIndex);

  // CSV Export Handlers
  function exportCsv(title:string,headers:string[],rows:(string|number|null|undefined)[][]) {
    const cell=(value:string|number|null|undefined)=>{
      const text=String(value ?? '');
      return '"'+(/^[\s]*[=+\-@]|^[\t\r\n]/.test(text)?"'"+text:text).replaceAll('"','""')+'"';
    };
    const url=URL.createObjectURL(new Blob(['\uFEFF',[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download=title+'.csv'; link.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportSelection() {
    if(activeSubTab==='units') return exportCsv('rumah',['Rumah','Alamat','Status hunian','Pemilik','Kepala keluarga','Penghuni'],
      filteredAndSortedProperties.map(item=>[item.code,item.address,item.occupancyStatus,item.legalOwner,item.headName,item.residentCount]));
    if(activeSubTab==='residents') return exportCsv('penghuni',['Rumah','Nama','Hubungan','Kontak darurat'],
      filteredAndSortedResidents.map(item=>[item.houseCode,item.fullName,item.relation,item.isEmergency?'Ya':'Tidak']));
    if(activeSubTab==='vehicles') return exportCsv('kendaraan',['Rumah','Nomor polisi','Jenis','Merek','Model','Status administrasi RFID'],
      filteredAndSortedVehicles.map(item=>[item.houseCode,item.plateNumber,item.type,item.brand,item.model,item.rfidStatus]));
    if(activeSubTab==='permits') return exportCsv('izin-renovasi',['Rumah','Pekerjaan','Status','Mulai','Selesai'],
      filteredAndSortedPermits.map(item=>[item.houseCode,item.workType,item.status,item.startDate,item.endDate]));
    return exportCsv('utilitas',['Rumah','Daya listrik','Stand sebelumnya','Stand saat ini','Pemakaian','Periode iuran','Iuran','Status'],
      filteredAndSortedUtilities.map(item=>[item.houseCode,item.plnCapacity,item.pamReadingLastMonth,item.pamReadingThisMonth,item.pamUsage,item.billingPeriodName,item.monthlyIplFee,billLabel(item.paymentStatus)]));
  }
  const billLabels: Record<UtilityItem['paymentStatus'],string>={LUNAS:'Lunas',MENUNGGU_BAYAR:'Belum bayar',MENUNGGAK:'Menunggak',
    SEBAGIAN:'Dibayar sebagian',DIBEBASKAN:'Dibebaskan',BELUM_ADA_TAGIHAN:'Belum ada tagihan',TERBATAS:'Akses bendahara'};
  const billLabel=(status:UtilityItem['paymentStatus']|undefined)=>status?billLabels[status]:'Belum tersedia';
  const billAmount=(amount:number|null|undefined)=>amount==null?'—':'Rp '+amount.toLocaleString('id-ID');
  const billHref=(code:string,period?:string)=>'/admin/billing?house='+encodeURIComponent(code)+(period?'&period='+encodeURIComponent(period):'');

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

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="registry-heading">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="workspace-kicker">Administrasi lingkungan</p>
            <h1 id="registry-heading" className="mt-1 text-2xl font-bold tracking-tight text-ink [overflow-wrap:anywhere] sm:text-3xl">Rumah &amp; Warga</h1>
          </div>
          <a href={'/admin/passwords'+(houseFilter?'?house='+encodeURIComponent(houseFilter):'')} className="btn-secondary inline-flex min-h-11 items-center gap-2 whitespace-nowrap"><KeyRound className="h-4 w-4" aria-hidden /> Akun warga</a>
        </div>
        <div role="tablist" aria-label="Menu Rumah dan Warga" className="flex flex-wrap gap-1.5" onKeyDown={event=>{
          if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
          const current=tabs.indexOf(activeSubTab);
          const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs[tabs.length-1]:tabs[(current+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length];
          event.preventDefault();handleTabChange(next);document.getElementById('tab-btn-'+next)?.focus();
        }}>
          {([
            {id:'units',label:'Rumah',icon:Home,theme:'bg-primary-50 text-primary-800',count:filteredAndSortedProperties.length},
            {id:'residents',label:'Penghuni',icon:Users,theme:'bg-sky-50 text-sky-800',count:filteredAndSortedResidents.length},
            {id:'vehicles',label:'Kendaraan',icon:Car,theme:'bg-violet-50 text-violet-800',count:filteredAndSortedVehicles.length},
            {id:'permits',label:'Izin renovasi',icon:Hammer,theme:'bg-amber-50 text-amber-900',count:filteredAndSortedPermits.length},
            {id:'analytics',label:'Utilitas',icon:Zap,theme:'bg-teal-50 text-teal-800',count:filteredAndSortedUtilities.length},
          ] as const).map(tab=><button key={tab.id} id={'tab-btn-'+tab.id} type="button" role="tab" aria-selected={activeSubTab===tab.id}
            aria-controls={'tab-panel-'+tab.id} tabIndex={activeSubTab===tab.id?0:-1} onClick={()=>handleTabChange(tab.id)}
            className={'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-bold transition-colors sm:text-sm '+(activeSubTab===tab.id?'border-primary-700 '+tab.theme:'border-border bg-surface text-ink hover:bg-canvas')}>
            <tab.icon className="h-4 w-4" aria-hidden />{tab.label}<span className="tabular-nums text-[11px]" aria-label={tab.count+' catatan'}>{tab.count}</span>
          </button>)}
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <label className="min-w-0 max-w-full text-xs font-semibold">Lingkup rumah
            <select aria-label="Lingkup rumah" value={houseFilter} onChange={event=>scopeHouse(event.target.value)} className="mt-1 block min-h-11 max-w-full rounded-lg border border-border bg-canvas px-2.5 text-sm">
              <option value="">Semua rumah</option>
              {houseFilter&&!properties.some(item=>item.code===houseFilter)&&<option value={houseFilter}>{houseFilter} (tidak tersedia)</option>}
              {properties.map(item=><option key={item.id} value={item.code}>{item.code}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button type="button" onClick={exportSelection} className="btn-secondary inline-flex min-h-11 items-center gap-2 whitespace-nowrap"><FileSpreadsheet className="h-4 w-4" aria-hidden /> Ekspor CSV</button>
            {canEdit && <button type="button" onClick={{units:handleOpenAdd,residents:handleOpenAddResident,vehicles:handleOpenAddVehicle,permits:handleOpenAddPermit,analytics:handleOpenAddUtility}[activeSubTab]}
              className="btn-primary inline-flex min-h-11 items-center gap-2 whitespace-nowrap"><Plus className="h-4 w-4" aria-hidden />
              {{units:'Tambah rumah',residents:'Tambah penghuni',vehicles:'Daftar kendaraan',permits:'Buat izin',analytics:'Catat utilitas'}[activeSubTab]}</button>}
          </div>
        </div>
      </section>

      {/* ================= SUBTAB 1: DIREKTORI RUMAH & KAVLING ================= */}
      {activeSubTab === 'units' && (
        <div id="tab-panel-units" role="tabpanel" aria-labelledby="tab-btn-units" className="space-y-4 animate-in fade-in duration-150">
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

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <select
                value={selectedBlock}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setCurrentPage(1);
                }}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status</option>
                <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
                <option value="RENTED">Disewa</option>
                <option value="VACANT">Kosong</option>
                <option value="RENOVATION">Renovasi</option><option value="BORROWED">Dipinjamkan</option><option value="FOR_SALE">Dijual</option><option value="OTHER">Lainnya</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="code">Urut Kode</option>
                <option value="owner">Urut Pemilik</option>
                <option value="status">Urut Status</option>
              </select>

              <button
                type="button"
                aria-label="Balik urutan rumah" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-canvas border border-border rounded-xl text-ink-muted hover:text-ink"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-canvas p-1 rounded-xl border border-border">
                <button
                  type="button"
                  aria-label="Tampilan tabel" aria-pressed={viewMode==='table'} onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Tampilan kartu" aria-pressed={viewMode==='grid'} onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface text-primary-700 shadow-xs' : 'text-ink-muted'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: TABLE WITH CHECKBOXES */}
          {viewMode !== 'grid' && (
            <div className={(viewMode==='auto'?'hidden md:block ':'')+'bg-surface rounded-2xl border border-border shadow-card overflow-hidden'}>
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
                      <th className="py-3.5 px-4">Pemilik Unit (Owner)</th>
                      <th className="py-3.5 px-4">Penghuni (Kepala Keluarga)</th>
                      <th className="py-3.5 px-4 text-center">Sensus Jiwa</th>
                      <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedProperties.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-ink-muted">
                          <Building2 className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                          <h4 className="text-sm font-bold text-ink">Belum Ada Data Unit Rumah</h4>
                          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                            Basis data telah bersih dari data demo. Silakan klik <strong>"+ Tambah Unit Baru"</strong> atau <strong>"Impor CSV"</strong> untuk mulai mendaftarkan data riil komplek Anda.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedProperties.map((prop) => {
                      const isSelected = selectedPropertyIds.includes(prop.id);
                      const occName = prop.occupantName || prop.headName;
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

                          {/* KOLOM KHUSUS PEMILIK UNIT (OWNER) */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-extrabold text-ink text-xs">{prop.legalOwner || prop.ownerName || '-'}</span>
                              <span className="text-[10px] text-ink-muted font-medium flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Pemilik tercatat</span>
                              </span>
                            </div>
                          </td>

                          {/* KOLOM KHUSUS PENGHUNI (KEPALA KELUARGA / PENYEWA) */}
                          <td className="py-3.5 px-4">
                            {(() => {
                              if (prop.occupancyStatus === 'VACANT') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[11px] font-semibold border border-amber-500/20">
                                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>Kosong (Belum Berpenghuni)</span>
                                  </span>
                                );
                              }
                              if (prop.occupancyStatus === 'RENTED') {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-extrabold text-ink text-xs">{occName || 'Penyewa'}</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 w-fit px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200">
                                      <KeyRound className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                                      <span>Penyewa / Pengontrak</span>
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-extrabold text-ink text-xs">{occName || prop.ownerName || '-'}</span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 w-fit px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span>Dihuni Pemilik Sendiri</span>
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* KOLOM SENSUS JIWA */}
                          <td className="py-3.5 px-4 text-center">
                            {(() => {
                              const residentsInHouse = residents.filter(r => r.houseCode.toUpperCase() === prop.code.toUpperCase());
                              const count = residentsInHouse.length > 0 ? residentsInHouse.length : (prop.residentCount || 0);
                              if (count > 0) {
                                return (
                                  <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-black text-xs border border-primary-200 inline-flex items-center gap-1">
                                    <Users className="w-3 h-3 text-primary-600" />
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
                                    setResFullName(prop.occupantName || (prop.ownerName && prop.ownerName !== 'Belum berpenghuni' && !prop.ownerName.startsWith('Warga ') ? prop.ownerName : ''));
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
                                disabled={!canEdit} onClick={() => handleOpenEdit(prop)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => setPropertyToDelete(prop)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
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
          {viewMode !== 'table' && (
            <div className={(viewMode==='auto'?'md:hidden ':'')+'space-y-4'}>
              {!filteredAndSortedProperties.length && <p className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-muted">Tidak ada rumah sesuai filter.</p>}
              {(() => {
                const groups: { [key: string]: PropertyListItem[] } = {};
                filteredAndSortedProperties.forEach(p => {
                  const groupKey = p.blockName || 'Tanpa blok';
                  if (!groups[groupKey]) groups[groupKey] = [];
                  groups[groupKey].push(p);
                });

                return Object.entries(groups).map(([groupTitle, items]) => (
                  <div key={groupTitle} className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-ink">{groupTitle}</h3>
                      <span className="text-[11px] font-mono font-bold text-ink-muted">{items.length} Unit</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((p) => {
                        const isVacant = p.occupancyStatus === 'VACANT';
                        const isRented = p.occupancyStatus === 'RENTED';
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setActiveProperty(p);
                              setDetailTab('specs');
                            }}
                            className={`p-3 rounded-xl text-left border transition-all hover:scale-[1.02] shadow-2xs active:scale-[0.98] ${
                              isVacant
                                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                                : isRented
                                ? 'bg-sky-50/70 border-sky-200 text-sky-900'
                                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-mono text-xs font-black">{p.code}</p>
                              <span className="text-[9px] font-bold uppercase">
                                {p.statusLabel || (p.occupancyStatus==='RENOVATION'?'Renovasi':'Lainnya')}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold truncate text-ink">
                              {p.address}
                            </p>
                            <p className="text-[10px] text-ink-muted truncate mt-0.5">
                              {p.residentCount ?? 0} penghuni
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {/* ================= SUBTAB 2: DATABASE KEPENDUDUKAN (SENSUS) ================= */}
      {activeSubTab === 'residents' && (
        <div id="tab-panel-residents" role="tabpanel" aria-labelledby="tab-btn-residents" className="space-y-4 animate-in fade-in duration-150">
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

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <select
                value={residentCategory}
                onChange={(e) => {
                  setResidentCategory(e.target.value);
                  setResidentCurrentPage(1);
                }}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Hubungan</option>
                <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                <option value="ISTRI">Istri</option>
                <option value="ANAK">Anak</option>
                <option value="ART">ART / Supir</option>
                <option value="">Belum tercatat</option>
                    <option value="KTP_SETEMPAT">KTP Setempat</option>
                <option value="KTP_LUAR_DAERAH">KTP luar daerah</option>
              </select>

              <select
                value={residentSortBy}
                onChange={(e) => setResidentSortBy(e.target.value as any)}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                        disabled={!canEdit} onChange={handleToggleSelectAllResidents}
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
                  {paginatedResidents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-ink-muted">
                        <UserPlus className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-ink">Belum Ada Data Sensus Penghuni</h4>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                          Data sensus keluarga dan kependudukan warga komplek akan tampil di sini. Silakan klik <strong>"+ Tambah Data Penghuni"</strong> untuk mulai mencatat.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedResidents.map((r) => {
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
                              disabled={!canEdit} onChange={() => handleToggleSelectOneResident(r.id)}
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
                          <td className="py-3.5 px-4 font-mono text-ink-muted">{r.idCard ? '••••'+r.idCard.slice(-4) : '—'}</td>
                          <td className="py-3.5 px-4 font-medium text-ink">{r.occupation || '-'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-ink">
                              <span>{r.phone || '-'}</span>
                              {r.phone && r.phone !== '-' && (
                                <a
                                  href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-[0.95] transition-all"
                                  title="Kirim Pesan WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveResidentView(r)}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => handleOpenEditResident(r)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => setResidentToDelete(r)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
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
        <div id="tab-panel-vehicles" role="tabpanel" aria-labelledby="tab-btn-vehicles" className="space-y-4 animate-in fade-in duration-150">
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

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <select
                value={vehicleTypeFilter}
                onChange={(e) => {
                  setVehicleTypeFilter(e.target.value);
                  setVehicleCurrentPage(1);
                }}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status RFID</option>
                <option value="AKTIF">RFID Aktif</option>
                <option value="DIBLOKIR">RFID Diblokir</option>
              </select>

              <select
                value={vehicleSortBy}
                onChange={(e) => setVehicleSortBy(e.target.value as any)}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                        disabled={!canEdit} onChange={handleToggleSelectAllVehicles}
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
                  {paginatedVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-ink-muted">
                        <Car className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-ink">Belum Ada Data Kendaraan & RFID</h4>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                          Belum ada kendaraan pada filter ini.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((v) => {
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
                              disabled={!canEdit} onChange={() => handleToggleSelectOneVehicle(v.id)}
                              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 text-white font-mono font-black text-xs tracking-wider border border-slate-700 shadow-2xs">
                              {v.plateNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary-700">Unit {v.houseCode}</td>
                          <td className="py-3.5 px-4 font-bold text-ink">{v.ownerName}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-canvas font-bold border border-border text-[11px]">
                              {v.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-ink">{v.brand} {v.model}</td>
                          <td className="py-3.5 px-4 font-mono text-primary-700 font-bold tracking-tight">{v.rfidTag}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-xs text-ink-muted">Belum terhubung</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveVehicleView(v)}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => handleOpenEditVehicle(v)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => setVehicleToDelete(v)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
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
        <div id="tab-panel-permits" role="tabpanel" aria-labelledby="tab-btn-permits" className="space-y-4 animate-in fade-in duration-150">
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

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <select
                value={permitStatusFilter}
                onChange={(e) => {
                  setPermitStatusFilter(e.target.value);
                  setPermitCurrentPage(1);
                }}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                        disabled={!canEdit} onChange={handleToggleSelectAllPermits}
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
                  {paginatedPermits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-ink-muted">
                        <FileText className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-ink">Belum Ada Izin Kerja Renovasi</h4>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                          Data permohonan izin renovasi unit dan registrasi tukang akan tampil di sini. Silakan klik <strong>"+ Terbitkan Izin Baru"</strong> untuk mulai membuat izin.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPermits.map((p) => {
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
                              disabled={!canEdit} onChange={() => handleToggleSelectOnePermit(p.id)}
                              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 font-mono font-black text-xs tracking-wider border border-slate-700 shadow-2xs">
                              {p.id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary-700">Unit {p.houseCode}</td>
                          <td className="py-3.5 px-4 font-extrabold text-ink">{p.workType}</td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className="font-bold text-ink block">{p.contractorName}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-canvas border border-border text-ink-muted">
                                  {p.workersCount} Tukang
                                </span>
                                {p.contractorPhone && (
                                  <a
                                    href={`https://wa.me/${p.contractorPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 active:scale-[0.95] transition-all"
                                    title="Hubungi Mandor via WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                                    <span>{p.contractorPhone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-ink-muted">
                            <span className="font-mono font-bold text-ink block">{p.startDate} s/d {p.endDate}</span>
                            <span className="text-[10px] text-ink-muted font-medium">{p.allowedHours}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              {getPermitStatusBadge(p.status)}
                              {p.status === 'PENDING_REVIEW' && (
                                <button
                                  type="button"
                                  disabled={!canEdit} onClick={() => handleQuickTogglePermitStatus(p)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs active:scale-[0.95] transition-all"
                                >
                                  ✓ Setujui ACC
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActivePermitView(p)}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => handleOpenEditPermit(p)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => setPermitToDelete(p)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
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
        <div id="tab-panel-analytics" role="tabpanel" aria-labelledby="tab-btn-analytics" className="space-y-4 animate-in fade-in duration-150">
          {filteredAndSortedUtilities.length>0 && <dl className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-surface p-3 text-sm">
            <div><dt className="text-xs text-ink-muted">Catatan meter</dt><dd className="font-semibold tabular-nums">{filteredAndSortedUtilities.length}</dd></div>
            <div><dt className="text-xs text-ink-muted">Pemakaian PAM tercatat</dt><dd className="font-semibold tabular-nums">{filteredAndSortedUtilities.reduce((sum,item)=>sum+item.pamUsage,0).toLocaleString('id-ID')} m³</dd></div>
            {canOpenBilling && filteredAndSortedUtilities.some(item=>item.monthlyIplFee!==null) && <div><dt className="text-xs text-ink-muted">Total tagihan tercatat</dt><dd className="font-semibold tabular-nums">{billAmount(filteredAndSortedUtilities.reduce((sum,item)=>sum+(item.monthlyIplFee ?? 0),0))}</dd></div>}
          </dl>}

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

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <select
                value={utilityPlnFilter}
                onChange={(e) => {
                  setUtilityPlnFilter(e.target.value);
                  setUtilityCurrentPage(1);
                }}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Daya PLN</option>
                <option value="">Belum tercatat</option>
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
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
              >
                <option value="ALL">Semua Status Bayar</option>
                <option value="LUNAS">Lunas</option>
                <option value="MENUNGGU_BAYAR">Menunggu Bayar</option>
                <option value="MENUNGGAK">Menunggak</option><option value="SEBAGIAN">Dibayar sebagian</option><option value="BELUM_ADA_TAGIHAN">Belum ada tagihan</option><option value="DIBEBASKAN">Dibebaskan</option>
              </select>

              <select
                value={utilitySortBy}
                onChange={(e) => setUtilitySortBy(e.target.value as any)}
                className="min-h-11 min-w-28 max-w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-bold text-ink"
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
                        disabled={!canEdit} onChange={handleToggleSelectAllUtilities}
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
                  {paginatedUtilities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-ink-muted">
                        <Zap className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-ink">Belum Ada Data Utilitas & Meteran</h4>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                          Data meteran air PAM dan beban daya PLN unit komplek akan tampil di sini. Silakan klik <strong>"+ Input Meteran Utilitas"</strong> untuk mulai mencatat.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedUtilities.map((u) => {
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
                              disabled={!canEdit} onChange={() => handleToggleSelectOneUtility(u.id)}
                              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary-700">Unit {u.houseCode}</td>
                          <td className="py-3.5 px-4 font-bold text-ink">{u.ownerName}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-ink block">{u.plnCapacity}</span>
                            <span className="text-[10px] text-ink-muted font-mono">{u.plnCustomerId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-sky-800 font-mono block">{u.pamUsage} m³</span>
                            <span className="text-[10px] text-ink-muted font-mono">{u.pamMeterNo}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-ink">
                            {billAmount(u.monthlyIplFee)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block rounded-lg bg-canvas px-2.5 py-1 text-xs font-semibold">{billLabel(u.paymentStatus)}</span>{u.billingPeriodName && <p className="mt-1 text-[11px] text-ink-muted">{u.billingPeriodName}</p>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveUtilityView(u)}
                                className="p-1.5 hover:bg-primary-50 text-primary-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => handleOpenEditUtility(u)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit} onClick={() => setUtilityToDelete(u)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg font-bold text-xs inline-flex items-center gap-1 active:scale-[0.98] transition-all"
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
                  const content = `BIODATA SENSUS PENGHUNI - WARGAHUB\n===================================\nNama Lengkap: ${activeResidentView.fullName}\nUnit Rumah: ${activeResidentView.houseCode}\nHubungan: ${activeResidentView.relation}\nNIK: ${activeResidentView.idCard}\nNo. KK: ${activeResidentView.familyCard || '-'}\nTTL: ${activeResidentView.birthPlaceDate}\nGender: ${activeResidentView.gender}\nAgama: ${activeResidentView.religion}\nProfesi: ${activeResidentView.occupation}\nWhatsApp: ${activeResidentView.phone}\nEmail: ${activeResidentView.email || '-'}\nGol. Darah: ${activeResidentView.bloodType}\nStatus Domisili: ${activeResidentView.domicileStatus}\nKontak Darurat: ${activeResidentView.isEmergency ? 'YA' : 'TIDAK'}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus Komplek Grand Sariwangi`;
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
                    disabled={!!editingResidentId} value={resHouseCode}
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
                    onChange={(e) => setResRelation(e.target.value as any)}
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
                    onChange={(e) => setResGender(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="">Belum tercatat</option>
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
                    <option value="">Belum tercatat</option><option value="ISLAM">Islam</option>
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
                    onChange={(e) => setResDomicileStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="KTP_SETEMPAT">KTP Setempat (Komplek)</option>
                    <option value="KTP_LUAR_DAERAH">KTP Luar Daerah</option>
                    <option value="SURAT_DOMISILI">Surat Keterangan Domisili</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Golongan Darah</label>
                  <select
                    value={resBloodType}
                    onChange={(e) => setResBloodType(e.target.value as any)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold font-mono text-ink"
                  >
                    <option value="O">O</option>
                    <option value="">Belum tercatat</option><option value="A">A</option>
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
                    placeholder="Contoh: Kav A, A-17, SW1-02"
                    value={formCode}
                    readOnly={Boolean(editingPropertyId)}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                </div>
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
              </div>

              {/* Pemilik tercatat vs Penghuni Terpisah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-canvas/60 rounded-xl border border-border">
                <div>
                  <label className="font-bold text-ink block mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pemilik Unit (Owner) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Pemilik tercatat (contoh: Pak Verial / Bu Shinta)"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  />
                  <span className="text-[10px] text-ink-muted mt-1 block">Pemilik sah sertifikat / rumah.</span>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1 flex items-center gap-1.5">
                    {formOccupancy === 'RENTED' ? (
                      <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Penghuni (Kepala Keluarga)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={formOccupancy === 'VACANT' ? 'Tidak ada penghuni (Kosong)' : formOccupancy === 'RENTED' ? 'Nama Penyewa / Pengontrak' : 'Nama Kepala Keluarga'}
                    value={formOccupancy === 'VACANT' ? '' : formOccupant}
                    onChange={(e) => setFormOccupant(e.target.value)}
                    disabled={formOccupancy === 'VACANT'}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink disabled:opacity-50 disabled:bg-canvas/40"
                  />
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    {formOccupancy === 'RENTED'
                      ? 'Nama penyewa/pengontrak yang mendiami rumah.'
                      : formOccupancy === 'VACANT'
                      ? 'Unit tidak berpenghuni.'
                      : 'Kepala keluarga yang tinggal (bisa pemilik sendiri).'}
                  </span>
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

              <details className="rounded-xl border border-border p-3">
                <summary className="min-h-11 cursor-pointer font-bold">Spesifikasi rumah</summary>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label>Tipe bangunan<input value={formBuildingType} onChange={event=>setFormBuildingType(event.target.value)} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                  <label>Nomor rumah<input value={formNumber} onChange={event=>setFormNumber(event.target.value)} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                  <label>Luas tanah (m²)<input type="number" min={0} step="any" value={formLandArea || ''} onChange={event=>setFormLandArea(Number(event.target.value))} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                  <label>Luas bangunan (m²)<input type="number" min={0} step="any" value={formBuildingArea || ''} onChange={event=>setFormBuildingArea(Number(event.target.value))} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                  <label>Daya PLN<input value={formPlnCapacity} onChange={event=>setFormPlnCapacity(event.target.value)} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                  <label>Nomor meter PAM<input value={formPamMeterNo} onChange={event=>setFormPamMeterNo(event.target.value)} className="block min-h-11 w-full rounded-lg border border-border bg-canvas px-2" /></label>
                </div>
              </details>

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
                    const content = `KARTU IDENTITAS UNIT RUMAH - WARGAHUB\n=======================================\nKode Unit: ${activeProperty.code}\nAlamat: ${activeProperty.address}\nStatus Okupansi: ${activeProperty.occupancyStatus}\nPemilik Unit (Owner): ${activeProperty.ownerName || '-'}\nPenghuni (Kepala Keluarga): ${activeProperty.occupancyStatus === 'VACANT' ? 'Kosong (Belum Berpenghuni)' : (activeProperty.headName || '—')}\nTotal Penghuni Terdata: ${activePropertyResidents.length} Jiwa\nTotal Kendaraan Terdaftar: ${activePropertyVehicles.length} Unit\nDaya PLN: ${activeProperty.plnCapacity || '—'}\nMeter PAM: ${activeProperty.pamMeterNo || '—'}\nIuran IPL:  ${billAmount(activePropertyUtility?.monthlyIplFee)} / bln\nStatus Bayar: ${billLabel(activePropertyUtility?.paymentStatus)}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPengurus Komplek Grand Sariwangi`;
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
            <nav aria-label="Data terkait rumah" className="flex flex-wrap gap-2">
              <button type="button" onClick={()=>scopeHouse(activeProperty.code,'residents')} className="btn-secondary min-h-11 whitespace-nowrap">Penghuni</button>
              <button type="button" onClick={()=>scopeHouse(activeProperty.code,'vehicles')} className="btn-secondary min-h-11 whitespace-nowrap">Kendaraan</button>
              <button type="button" onClick={()=>scopeHouse(activeProperty.code,'permits')} className="btn-secondary min-h-11 whitespace-nowrap">Izin renovasi</button>
              <button type="button" onClick={()=>scopeHouse(activeProperty.code,'analytics')} className="btn-secondary min-h-11 whitespace-nowrap">Utilitas</button>
              <a href={'/admin/passwords?house='+encodeURIComponent(activeProperty.code)} className="btn-secondary inline-flex min-h-11 items-center whitespace-nowrap">Akun warga</a>
              {canOpenBilling && <a href={billHref(activeProperty.code,activePropertyUtility?.billingPeriodName)} className="btn-secondary inline-flex min-h-11 items-center whitespace-nowrap">Iuran</a>}
            </nav>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Pemilik Unit (Owner)</span>
                <p className="font-extrabold text-ink text-sm mt-0.5 truncate">{activeProperty.ownerName || '-'}</p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Pemilik tercatat</span>
                </span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Penghuni (Kepala Keluarga)</span>
                <p className="font-extrabold text-ink text-sm mt-0.5 truncate">
                  {activeProperty.occupancyStatus === 'VACANT'
                    ? 'Kosong'
                    : (activeProperty.headName || '—')}
                </p>
                <span className="text-[10px] font-semibold truncate block">
                  {activeProperty.occupancyStatus === 'VACANT' ? (
                    <span className="text-amber-700">Belum Berpenghuni</span>
                  ) : activeProperty.occupancyStatus === 'RENTED' ? (
                    <span className="text-sky-700">🔑 Penyewa / Kontrak</span>
                  ) : (
                    <span className="text-emerald-700">✓ Dihuni Pemilik</span>
                  )}
                </span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Sensus Penghuni</span>
                <p className="font-extrabold text-ink text-sm mt-0.5">{activePropertyResidents.length} Jiwa</p>
                <span className="text-[10px] text-emerald-700 font-semibold">{activePropertyResidents.length > 0 ? 'Anggota tercatat' : 'Belum ada anggota'}</span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Kendaraan & RFID</span>
                <p className="font-extrabold text-ink text-sm mt-0.5">{activePropertyVehicles.length} Unit</p>
                <span className="text-[10px] text-sky-700 font-semibold">Akses Barrier Gate</span>
              </div>
              <div className="p-3 bg-canvas rounded-2xl border border-border">
                <span className="text-[10px] text-ink-muted font-bold block">Iuran Lingkungan (IPL)</span>
                <p className="font-extrabold text-emerald-800 text-sm mt-0.5">
                  {billAmount(activePropertyUtility?.monthlyIplFee)}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold">Status: {billLabel(activePropertyUtility?.paymentStatus)}</span>
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
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.buildingType || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Luas Tanah:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.landArea ? activeProperty.landArea+' m²' : '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Luas Bangunan:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.buildingArea ? activeProperty.buildingArea+' m²' : '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik PLN:</span>
                    <p className="font-extrabold text-amber-800 mt-0.5">{activeProperty.plnCapacity || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">No. Meteran PAM:</span>
                    <p className="font-extrabold text-sky-800 mt-0.5">{activeProperty.pamMeterNo || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Wilayah / Blok:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.blockCode ? `Blok ${activeProperty.blockCode}` : 'Wilayah Komplek'}</p>
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
                      <p className="text-ink-muted text-[11px] mt-0.5">
                        Pemilik tercatat: <strong>{activeProperty.ownerName || '-'}</strong>
                        {activeProperty.occupantName && (
                          <> • Penghuni (Kepala Keluarga): <strong className="text-sky-700">{activeProperty.occupantName}</strong></>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const targetCode = activeProperty.code;
                        const targetArea = activeProperty.blockCode ? `Blok ${activeProperty.blockCode}` : 'Wilayah Komplek';
                        const targetOccupant = activeProperty.occupantName || (activeProperty.ownerName && activeProperty.ownerName !== 'Belum berpenghuni' && !activeProperty.ownerName.startsWith('Warga ') ? activeProperty.ownerName : '');
                        setActiveProperty(null);
                        setEditingResidentId(null);
                        setResHouseCode(targetCode);
                        setResAreaLabel(targetArea);
                        setResFullName(targetOccupant);
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
                            Profesi: {r.occupation || '—'}
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
                    <p className="font-mono font-extrabold text-amber-800 mt-0.5">{activePropertyUtility?.plnCustomerId || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Kapasitas Listrik:</span>
                    <p className="font-extrabold text-ink mt-0.5">{activeProperty.plnCapacity || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Nomor Meter PAM:</span>
                    <p className="font-mono font-extrabold text-sky-800 mt-0.5">{activeProperty.pamMeterNo || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Pemakaian Air (Bulan Ini):</span>
                    <p className="font-extrabold text-ink mt-0.5">{activePropertyUtility?.pamUsage ?? '—'} m³</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Iuran Lingkungan (IPL):</span>
                    <p className="font-mono font-extrabold text-emerald-800 mt-0.5">{billAmount(activePropertyUtility?.monthlyIplFee)} / bln</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Status Pembayaran:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-0.5">
                      {billLabel(activePropertyUtility?.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Sumur Resapan Biopori:</span>
                    <p className="font-extrabold text-emerald-800 mt-0.5">
                      {activePropertyUtility ? (activePropertyUtility.hasBiopori ? 'Ada' : 'Tidak ada') : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-bold block">Solar Panel Rooftop:</span>
                    <p className="font-extrabold text-amber-800 mt-0.5">
                      {activePropertyUtility ? (activePropertyUtility.hasSolarPanel ? 'Ada' : 'Tidak ada') : '—'}
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
                      {activeVehicleView.rfidStatus === 'AKTIF' ? 'RFID terhubung' : 'RFID belum terhubung'}
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
                  const content = `DATA REGISTRASI KENDARAAN - WARGAHUB\n===========================================\nNomor Plat: ${activeVehicleView.plateNumber}\nJenis: ${activeVehicleView.type}\nMerk/Model: ${activeVehicleView.brand} ${activeVehicleView.model} (${activeVehicleView.year})\nWarna: ${activeVehicleView.color}\nTag RFID: ${activeVehicleView.rfidTag}\nUnit Rumah: ${activeVehicleView.houseCode}\nPemilik: ${activeVehicleView.ownerName}\nHak Akses: ${activeVehicleView.gateAccess}\nStatus: ${activeVehicleView.rfidStatus}\n\nDicetak pada: ${new Date().toLocaleString('id-ID')}\nPos Satpam & Keamanan Komplek`;
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
                <span>Unduh data kendaraan</span>
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
                    {editingVehicleId ? `Edit Kendaraan: ${vehPlateNumber}` : 'Daftarkan Kendaraan Baru'}
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
                    value={vehYear || ''}
                    onChange={(e) => setVehYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Warna Kendaraan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hitam Metalik, Putih"
                    required value={vehColor}
                    onChange={(e) => setVehColor(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl text-ink"
                  />
                </div>
              </div>

              <p className="text-ink-muted">Registrasi kendaraan tidak mengaktifkan perangkat RFID.</p>
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
                    disabled={!!editingPermitId} value={pCode}
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
                    disabled={Boolean(editingUtilityId)}
                    onChange={(e) => {
                      const code = e.target.value;
                      setUCode(code);
                      const matchedProp = properties.find(p => p.code === code);
                      if (matchedProp) {
                        setUAreaLabel(code.startsWith('KAV') ? 'Kavling' : code.startsWith('SW') ? 'Jl. Sariwangi Indah' : `Blok ${matchedProp.blockCode}`);
                        setUOwnerName(matchedProp.legalOwner || '');
                        setUPlnCapacity(matchedProp.plnCapacity || '');
                        setUPamMeterNo(matchedProp.pamMeterNo || '');
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
                  <span className="block min-h-11 py-2 text-sm">{uOwnerName || '-'}</span>
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

              {canOpenBilling && uCode && <a href={billHref(uCode)} className="inline-flex min-h-11 items-center text-primary-700 font-semibold">Buka tagihan rumah</a>}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-ink block mb-1">Jadwal Angkut Sampah</label>
                  <select
                    value={uWasteSchedule}
                    onChange={(e) => setUWasteSchedule(e.target.value)}
                    className="w-full p-2.5 bg-canvas border border-border rounded-xl font-bold text-ink"
                  >
                    <option value="">Belum tercatat</option>
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
                      {billLabel(activeUtilityView.paymentStatus)}
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
                  {billAmount(activeUtilityView.monthlyIplFee)} / bln
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
