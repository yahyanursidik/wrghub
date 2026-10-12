import type { APIRoute } from 'astro';
import { getAccounts } from '../../../services/finance.service';
export const GET: APIRoute = async () => {
  try { return Response.json({ data: await getAccounts(), error: null }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: { message: 'Rekening belum bisa dimuat.' } }, { status: 503 }); }
};
