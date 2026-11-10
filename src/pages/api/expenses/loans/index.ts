import type { APIRoute } from 'astro';
import { listStaffLoans } from '../../../../services/staff-loan.service';
import { canManageFinance } from '../../../../lib/access-policy';
import type { UserSession } from '../../../../types/auth';

export const GET: APIRoute = async ({session}) => {
  const actor = await session?.get('wargahub_user') as UserSession|undefined;
  if (!actor) return Response.json({error:{message:'Silakan masuk kembali.'}},{status:401});
  try { return Response.json({data:await listStaffLoans(canManageFinance(actor.role)),error:null}); }
  catch { return Response.json({error:{message:'Daftar belum dapat dimuat.'}},{status:503}); }
};
