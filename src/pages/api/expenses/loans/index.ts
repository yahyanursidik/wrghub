import type { APIRoute } from 'astro';
import { listStaffLoans } from '../../../../services/staff-loan.service';

export const GET: APIRoute = async () => {
  try { return Response.json({data:await listStaffLoans(),error:null}); }
  catch { return Response.json({error:{message:'Daftar belum dapat dimuat.'}},{status:503}); }
};
