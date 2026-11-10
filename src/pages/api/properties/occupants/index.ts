import type { APIRoute } from 'astro';
import { residentsForRole } from '../../../../lib/access-policy';
import { getInitialResidents } from '../../../../services/property-submodules.service';
import type { UserSession } from '../../../../types/auth';

export const GET: APIRoute = async ({session}) => {
  try {
    const user=await session?.get('wargahub_user') as UserSession|undefined;
    if(!user) return Response.json({error:{message:'Silakan masuk kembali.'}},{status:401});
    return Response.json(residentsForRole(await getInitialResidents(),user.role));
  } catch { return Response.json({error:{message:'Daftar penghuni belum dapat dimuat.'}},{status:503}); }
};
