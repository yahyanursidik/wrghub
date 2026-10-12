import type { APIRoute } from 'astro';
import { getResidentOverview } from '../../../services/resident-overview.service';
import { authorizeApi } from '../../../lib/api-authorization';

export const GET: APIRoute = async (context) => {
  const authorization = await authorizeApi(context, ['SUPER_ADMIN', 'CHAIRMAN', 'SECRETARY', 'TREASURER', 'RESIDENT_ADMIN', 'SECURITY', 'MAINTENANCE', 'HOUSE_OWNER', 'HOUSEHOLD_HEAD', 'RESIDENT', 'AUDITOR', 'VIEWER']);
  if (authorization.response) return authorization.response;
  try {
    return Response.json({ data: await getResidentOverview(authorization.user!), error: null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: { message: 'Data rumah belum bisa dimuat. Coba lagi.' } }, { status: 503 });
  }
};
