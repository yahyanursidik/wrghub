import type { APIRoute } from 'astro';
import { listCleaningTasks } from '../../../../services/cleaning-checklist.service';

export const GET: APIRoute = async () => {
  try { return Response.json({data:await listCleaningTasks(),error:null}); }
  catch { return Response.json({error:{message:'Daftar belum dapat dimuat.'}},{status:503}); }
};
