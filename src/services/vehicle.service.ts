import { randomUUID } from 'node:crypto';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { db, schema } from '../db';
import { neonSql } from '../db/neon';
import { normalizeVehiclePlate } from '../lib/vehicle-plate';
import type { VehicleItem } from '../types/property-submodules';

type VehicleRow = { id: string; propertyId: string; houseCode: string; ownerName: string | null;
  plateNumber: string; type: string; brand: string; model: string; color: string; year: number | string | null };

function toVehicle(row: VehicleRow): VehicleItem {
  return { ...row, ownerName: row.ownerName || '—', areaLabel: row.houseCode.split('-')[0],
    year: Number(row.year) || 0, rfidTag: '—', gateAccess: 'Belum terintegrasi', rfidStatus: 'PENDING_VERIFIKASI' };
}

export async function getRegisteredVehicles(propertyId?: string, vehicleId?: string): Promise<VehicleItem[]> {
  const { vehicles: v, properties: p, persons } = schema;
  if (process.env.DATABASE_URL) {
    const rows = await neonSql<VehicleRow[]>`SELECT v.id, v.property_id AS "propertyId", p.code AS "houseCode",
      person.name AS "ownerName", v.plate_number AS "plateNumber", v.type, v.brand, v.model, v.color, v.year
      FROM vehicles v JOIN properties p ON p.id = v.property_id
      LEFT JOIN persons person ON person.id = v.owner_person_id
      WHERE v.is_active = true AND (${propertyId ?? null}::text IS NULL OR v.property_id = ${propertyId ?? null})
      AND (${vehicleId ?? null}::text IS NULL OR v.id = ${vehicleId ?? null}) ORDER BY v.plate_number`;
    return rows.map(toVehicle);
  }
  const rows = await db.select({ id: v.id, propertyId: p.id, houseCode: p.code, ownerName: persons.name,
    plateNumber: v.plateNumber, type: v.type, brand: v.brand, model: v.model, color: v.color, year: v.year })
    .from(v).innerJoin(p, eq(v.propertyId, p.id)).leftJoin(persons, eq(v.ownerPersonId, persons.id))
    .where(and(eq(v.isActive, true), propertyId ? eq(v.propertyId, propertyId) : undefined, vehicleId ? eq(v.id, vehicleId) : undefined))
    .orderBy(asc(v.plateNumber));
  return rows.map(toVehicle);
}

export type VehicleInput = { id?: string; propertyId: string; plateNumber: string; type: string; brand: string; model: string; color: string; year?: string | number };

export async function saveRegisteredVehicle(input: VehicleInput) {
  const id = input.id ?? `veh-${randomUUID()}`;
  const plate = input.plateNumber.trim().toUpperCase().replace(/\s+/g, ' ');
  const plateKey = normalizeVehiclePlate(plate);
  const year = input.year ? String(input.year) : null;
  const { vehicles: v, properties: p } = schema;
  if (process.env.DATABASE_URL) {
    await neonSql.begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock(hashtext(${plateKey}))`;
      const [property] = await tx`SELECT id FROM properties WHERE id = ${input.propertyId} AND is_active = true`;
      if (!property) throw new Error('Rumah tidak ditemukan.');
      const [duplicate] = await tx`SELECT id FROM vehicles WHERE is_active = true AND id <> ${id}
        AND regexp_replace(upper(plate_number), '[[:space:].-]', '', 'g') = ${plateKey} LIMIT 1`;
      if (duplicate) throw new Error('Plat nomor sudah terdaftar.');
      if (input.id) {
        const updated = await tx`UPDATE vehicles SET property_id = ${input.propertyId}, plate_number = ${plate},
          type = ${input.type}, brand = ${input.brand}, model = ${input.model}, color = ${input.color}, year = ${year},
          owner_person_id = CASE WHEN property_id = ${input.propertyId} THEN owner_person_id ELSE NULL END
          WHERE id = ${id} AND is_active = true RETURNING id`;
        if (!updated.length) throw new Error('Kendaraan tidak ditemukan.');
      } else {
        await tx`INSERT INTO vehicles (id, property_id, plate_number, type, brand, model, color, year, is_active)
          VALUES (${id}, ${input.propertyId}, ${plate}, ${input.type}, ${input.brand}, ${input.model}, ${input.color}, ${year}, true)`;
      }
    });
  } else {
    await db.transaction(async tx => {
      const [property] = await tx.select({ id: p.id }).from(p).where(and(eq(p.id, input.propertyId), eq(p.isActive, true)));
      if (!property) throw new Error('Rumah tidak ditemukan.');
      const [duplicate] = await tx.select({ id: v.id }).from(v).where(and(eq(v.isActive, true), ne(v.id, id),
        sql`replace(replace(replace(upper(${v.plateNumber}), ' ', ''), '.', ''), '-', '') = ${plateKey}`));
      if (duplicate) throw new Error('Plat nomor sudah terdaftar.');
      const values = { propertyId: input.propertyId, plateNumber: plate, type: input.type, brand: input.brand, model: input.model, color: input.color, year };
      if (input.id) {
        const updated = await tx.update(v).set({ ...values, ownerPersonId: sql`CASE WHEN ${v.propertyId} = ${input.propertyId} THEN ${v.ownerPersonId} ELSE NULL END` })
          .where(and(eq(v.id, id), eq(v.isActive, true))).returning({ id: v.id });
        if (!updated.length) throw new Error('Kendaraan tidak ditemukan.');
      } else await tx.insert(v).values({ ...values, id });
    });
  }
  const [vehicle] = await getRegisteredVehicles(input.propertyId, id);
  if (!vehicle) throw new Error('Kendaraan belum bisa dimuat ulang.');
  return vehicle;
}

export async function deactivateRegisteredVehicles(ids: string[]) {
  const rows = process.env.DATABASE_URL
    ? await neonSql`UPDATE vehicles SET is_active = false WHERE is_active = true AND id IN ${neonSql(ids)} RETURNING id`
    : await db.update(schema.vehicles).set({ isActive: false }).where(and(eq(schema.vehicles.isActive, true), inArray(schema.vehicles.id, ids))).returning({ id: schema.vehicles.id });
  return rows.map(row => String(row.id));
}
