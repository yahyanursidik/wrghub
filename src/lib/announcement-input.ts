import { z } from 'zod';

export const announcementFields = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(5).max(12000),
  category: z.string().trim().min(1).max(40),
  audience: z.enum(['ALL', 'BLOK_A_B', 'BLOK_C_D', 'KAVLING', 'PEMILIK_SAJA', 'PENYEWA_SAJA', 'OWNER', 'RESIDENT', 'COMMITTEE']),
  scheduledAt: z.string().trim().max(50).refine(value => Number.isFinite(Date.parse(value)), 'Tanggal pengumuman tidak valid.').nullable(),
  location: z.string().trim().max(180).nullable(),
  isPinned: z.boolean(),
});
