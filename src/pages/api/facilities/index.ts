import type { APIRoute } from 'astro';
import { listCatalog } from '../../../services/catalog.service';

export const GET: APIRoute = async () => {
  try { return Response.json({data:await listCatalog(),error:null}); }
  catch { return Response.json({error:{message:'Daftar belum dapat dimuat.'}},{status:503}); }
};
