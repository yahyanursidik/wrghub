import type { APIRoute } from 'astro';
import { getBillingTariff, saveBillingTariff, tariffInput } from '../../../services/billing-tariff.service';
import { mutation } from '../../../services/operational-mutation';

export const GET: APIRoute = async () => {
  try { return Response.json({ data: await getBillingTariff(), error: null }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: { message: 'Tarif iuran belum dapat dimuat.' } }, { status: 503 }); }
};

export const POST: APIRoute = mutation(tariffInput, saveBillingTariff);
