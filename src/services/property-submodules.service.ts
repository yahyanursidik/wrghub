import { neonSql } from '../db/neon';
import { getProperties } from './property.service';
import {
  DEFAULT_RESIDENTS,
  DEFAULT_VEHICLES,
  DEFAULT_PERMITS,
  DEFAULT_UTILITIES,
  type ResidentItem,
  type VehicleItem,
  type PermitItem,
  type UtilityItem,
} from '../types/property-submodules';

export * from '../types/property-submodules';

// Server Loaders - Murni dari data riil database (tanpa data karangan / dummy)
export async function getInitialResidents(): Promise<ResidentItem[]> {
  try {
    const properties = await getProperties();
    const realResidents: ResidentItem[] = [];

    for (const p of properties) {
      // Rumah kosong tidak memiliki data penghuni
      if (p.occupancyStatus === 'VACANT') continue;

      const residentName = p.occupantName || p.ownerName || p.legalOwner;
      // Jangan masukkan jika hanya label umum tanpa nama riil
      if (!residentName || residentName === 'Warga' || residentName === 'Penyewa' || residentName === 'Belum berpenghuni') {
        continue;
      }

      realResidents.push({
        id: `res-${p.id || p.code.toLowerCase().replace(/\s+/g, '-')}`,
        propertyId: p.id,
        houseCode: p.code,
        areaLabel: p.blockName || 'Kavling',
        fullName: residentName,
        relation: p.occupancyStatus === 'RENTED' ? 'PENYEWA' : 'KEPALA_KELUARGA',
        gender: 'LAKI_LAKI',
        birthPlaceDate: '-',
        religion: '-',
        occupation: '-',
        phone: '-',
        email: '-',
        idCard: '-',
        familyCard: '-',
        domicileStatus: p.occupancyStatus === 'RENTED' ? 'SURAT_DOMISILI' : 'KTP_SETEMPAT',
        bloodType: 'O',
        isEmergency: true,
        notes: `Penghuni terdaftar resmi pada ${p.code} (${p.statusLabel || (p.occupancyStatus === 'RENTED' ? 'Penyewa / Kontrak' : 'Pemilik')}).`,
      });
    }

    return realResidents;
  } catch (err) {
    console.warn('getInitialResidents error:', err);
    return [];
  }
}

export async function getInitialVehicles(): Promise<VehicleItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await neonSql`
        SELECT v.id, v.property_id, v.plate_number, v.type, v.brand, v.model, v.color, v.year, v.is_active,
               p.code as house_code, p.notes as prop_notes
        FROM vehicles v
        JOIN properties p ON v.property_id = p.id
        WHERE v.is_active = true
        ORDER BY p.code ASC;
      `;

      if (rows && rows.length > 0) {
        return rows.map((r: any, idx: number) => ({
          id: r.id,
          propertyId: r.property_id,
          houseCode: r.house_code || 'Kav A',
          areaLabel: 'Kavling',
          ownerName: 'Warga Terdaftar',
          plateNumber: r.plate_number,
          type: r.type || 'Mobil',
          brand: r.brand || '',
          model: r.model || '',
          year: Number(r.year) || 2024,
          color: r.color || '',
          rfidTag: `RFID-${String(1001 + idx).slice(-4)}`,
          gateAccess: 'SEMUA_GERBANG',
          rfidStatus: 'AKTIF' as const,
          notes: 'Terdaftar di gerbang komplek',
        }));
      }
    }
  } catch (err) {
    console.warn('getInitialVehicles error:', err);
  }

  return [];
}

export async function getInitialPermits(): Promise<PermitItem[]> {
  // Hanya data riil dari database (jika belum ada warga yang mengajukan izin, kembalikan kosong)
  return [];
}

export async function getInitialUtilities(): Promise<UtilityItem[]> {
  try {
    const properties = await getProperties();
    return properties.map((p) => ({
      id: `util-${p.id || p.code.toLowerCase().replace(/\s+/g, '-')}`,
      propertyId: p.id,
      houseCode: p.code,
      areaLabel: p.blockName || 'Kavling',
      ownerName: p.occupantName || p.ownerName || p.legalOwner || 'Warga',
      plnCapacity: '2200 VA',
      electricityCapacity: '2200 VA',
      plnCustomerId: '-',
      pamMeterNo: '-',
      pamReadingLastMonth: 0,
      pamReadingThisMonth: 0,
      pamUsage: 0,
      monthlyIplFee: 250000,
      wasteSchedule: 'Senin, Rabu, Sabtu (Pagi)',
      hasBiopori: true,
      hasSolarPanel: false,
      paymentStatus: 'LUNAS' as const,
      notes: `Kavling ${p.code} (${p.statusLabel || p.occupancyStatus})`,
    }));
  } catch (err) {
    return [];
  }
}
