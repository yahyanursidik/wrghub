import type { APIRoute } from 'astro';
import { getPayments } from '../../../services/payment.service';
import { receiptNumber } from '../../../lib/receipt-number';

export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get('q') || '').trim();
  if (query.length < 3 || query.length > 180) return Response.json({ error: { message: 'Masukkan nomor kuitansi atau referensi pembayaran yang lengkap.' } }, { status: 400 });
  try {
    const payments = await getPayments(undefined, 'VERIFIED');
    const payment = payments.find(payment => [payment.id, payment.reference, receiptNumber(payment.periodName || '', payment.propertyCode)]
      .some(value => value?.toLocaleUpperCase('id') === query.toLocaleUpperCase('id')));
    if (!payment) return Response.json({ data: null, error: null }, { status: 404 });
    const paidAt = payment.paidAt ? new Date(payment.paidAt).toLocaleString('id-ID') : '-';
    return Response.json({ data: {
      id: payment.id, receiptNumber: receiptNumber(payment.periodName || '', payment.propertyCode),
      propertyCode: payment.propertyCode, blockName: 'Lingkungan komplek',
      residentName: `Warga ${payment.propertyCode}`, phoneMasked: 'Tidak ditampilkan',
      period: payment.periodName || '-', amount: payment.amount, paidAt,
      verifiedAt: payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString('id-ID') : '-',
      paymentMethod: payment.method, refNumber: payment.reference || payment.id,
      verifiedBy: 'Pengurus', status: 'VERIFIED',
      components: [{ name: 'Pembayaran iuran', amount: payment.amount }],
    }, error: null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: { message: 'Data pembayaran belum bisa diperiksa. Coba lagi.' } }, { status: 503 });
  }
};
