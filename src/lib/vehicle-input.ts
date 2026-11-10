import { z } from 'zod';
import { normalizeVehiclePlate } from './vehicle-plate';

const text = z.string().trim().min(1).max(100);
export const vehicleInput = z.object({
  propertyId: z.string().trim().min(1).max(180),
  plateNumber: z.string().trim().max(24).refine(value => /^[A-Z0-9]{3,14}$/.test(normalizeVehiclePlate(value)), 'Plat kendaraan tidak valid.'),
  type: text.default('Mobil'), brand: text, model: text, color: text.default('Hitam'),
  year: z.union([z.string().regex(/^\d{4}$/), z.number().int().min(1900).max(2100)]).optional(),
});
