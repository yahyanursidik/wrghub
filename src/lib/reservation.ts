import { z } from 'zod';

export const reservationStatuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'] as const;
export type ReservationStatus = typeof reservationStatuses[number];
export const reservationLabels: Record<ReservationStatus, string> = { PENDING: 'Menunggu', APPROVED: 'Disetujui', COMPLETED: 'Selesai', REJECTED: 'Ditolak' };

const prefix = 'WARGAHUB_BOOKING_V1:';
const metadata = z.object({
  propertyId: z.string().nullable(), propertyCode: z.string().nullable(),
  startTime: z.string(), endTime: z.string(), purpose: z.string(), phone: z.string().nullable(),
});
type ReservationDetails = z.infer<typeof metadata>;

export const encodeReservation = (details: ReservationDetails) => prefix + JSON.stringify(details);

export function readReservation(description: string | null): ReservationDetails {
  if (description?.startsWith(prefix)) {
    try {
      const result = metadata.safeParse(JSON.parse(description.slice(prefix.length)));
      if (result.success) return result.data;
    } catch {}
  }
  const text = description || '';
  const times = text.match(/Waktu:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  return { propertyId: null, propertyCode: null, startTime: times?.[1] || '-', endTime: times?.[2] || '-',
    purpose: text.match(/Keperluan:\s*([^|]+)/)?.[1]?.trim() || text,
    phone: text.match(/Kontak:\s*([^|]+)/)?.[1]?.trim() || null };
}
