export interface ResidentItem {
  id: string;
  propertyId: string;
  houseCode: string;
  areaLabel: string;
  fullName: string;
  relation: 'KEPALA_KELUARGA' | 'ISTRI' | 'ANAK' | 'ORANG_TUA' | 'FAMILI_LAIN' | 'ART' | 'PENYEWA';
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  birthPlaceDate: string;
  religion: string;
  occupation: string;
  phone: string;
  email: string;
  idCard: string;
  familyCard: string;
  domicileStatus: 'KTP_SETEMPAT' | 'KTP_LUAR_DAERAH' | 'SURAT_DOMISILI';
  bloodType: 'A' | 'B' | 'AB' | 'O';
  isEmergency: boolean;
  notes?: string;
}

export interface VehicleItem {
  id: string;
  propertyId: string;
  houseCode: string;
  areaLabel: string;
  ownerName: string;
  plateNumber: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  rfidTag: string;
  gateAccess: string;
  rfidStatus: 'AKTIF' | 'DIBLOKIR' | 'PENDING_VERIFIKASI';
  notes?: string;
}

export interface PermitItem {
  id: string;
  propertyCode: string;
  houseCode: string;
  areaLabel: string;
  ownerName: string;
  workType: string;
  contractorName: string;
  contractorPhone: string;
  workersCount: number;
  workersList: string;
  startDate: string;
  endDate: string;
  allowedHours: string;
  depositStatus: string;
  depositAmount: number;
  description: string;
  status: 'APPROVED' | 'PENDING_REVIEW' | 'COMPLETED' | 'SUSPENDED';
  issuedAt: string;
}

export interface UtilityItem {
  id: string;
  propertyId: string;
  houseCode: string;
  areaLabel: string;
  ownerName: string;
  plnCapacity: string;
  electricityCapacity?: string;
  plnCustomerId: string;
  pamMeterNo: string;
  pamReadingLastMonth: number;
  pamReadingThisMonth: number;
  pamUsage: number;
  monthlyIplFee: number;
  wasteSchedule: string;
  hasBiopori: boolean;
  hasSolarPanel: boolean;
  paymentStatus: 'LUNAS' | 'MENUNGGU_BAYAR' | 'MENUNGGAK';
  notes?: string;
}

// Data default dikosongkan (tanpa data fiktif / dummy karangan)
// Seluruh data bersumber murni dari data riil database
export const DEFAULT_RESIDENTS: ResidentItem[] = [];
export const DEFAULT_VEHICLES: VehicleItem[] = [];
export const DEFAULT_PERMITS: PermitItem[] = [];
export const DEFAULT_UTILITIES: UtilityItem[] = [];
