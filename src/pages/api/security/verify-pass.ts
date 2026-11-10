import type { APIRoute } from 'astro';
import { z } from 'zod';
import { findVerifiedReceipt } from '../../../services/receipt-verification.service';

const input = z.object({ qrPayload: z.string().trim().min(3).max(700) });

function receiptQuery(payload: string) {
  if (!payload.startsWith('/') && !/^https?:\/\//i.test(payload)) return payload;
  const url = new URL(payload, 'https://wargahub.invalid');
  return /^\/kuitansi\/?$/.test(url.pathname) ? url.searchParams.get('q') || '' : '';
}

export const POST: APIRoute = async ({ request }) => {
  const body = input.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: { message: 'Masukkan nomor kuitansi atau tautan QR.' } }, { status: 400 });
  try {
    let query = '';
    try { query = receiptQuery(body.data.qrPayload); } catch {}
    const receipt = query ? await findVerifiedReceipt(query) : undefined;
    return Response.json({ data: receipt
      ? { isValid: true, allowsEntry: false, type: 'RESIDENT_RECEIPT', status: 'Kuitansi terverifikasi', message: `Pembayaran rumah ${receipt.propertyCode} tercatat. Kuitansi bukan izin masuk.` }
      : { isValid: false, allowsEntry: false, status: 'Tidak terverifikasi', message: 'Kuitansi tidak ditemukan. Pas tamu digital belum tersedia; periksa tamu secara manual.' }
    });
  } catch (error) {
    console.error('Validasi kuitansi pos keamanan:', error);
    return Response.json({ error: { message: 'Pemeriksaan belum tersedia. Gunakan pemeriksaan manual.' } }, { status: 503 });
  }
};
