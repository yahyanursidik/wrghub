import { z } from 'zod';

export const profileFields = z.object({
  buildingType:z.string().trim().max(80).optional(),
  landArea:z.number().nonnegative().max(1000000).optional(),
  buildingArea:z.number().nonnegative().max(1000000).optional(),
  plnCapacity:z.string().trim().max(50).optional(),
  pamMeterNo:z.string().trim().max(80).optional(),
});
export type PropertyProfile=z.output<typeof profileFields>;
export function readPropertyProfile(value:unknown):PropertyProfile {
  try { const profile=profileFields.safeParse(typeof value==='string'?JSON.parse(value):value); return profile.success ? profile.data : {}; }
  catch { return {}; }
}
export function definedProfile(value:unknown):PropertyProfile {
  return Object.fromEntries(Object.entries(profileFields.parse(value)).filter(([,item])=>item!==undefined));
}
