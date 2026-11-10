import type { APIRoute } from 'astro';
import { canReadHousingBilling } from '../../../../lib/access-policy';
import { getInitialUtilities } from '../../../../services/property-submodules.service';
import type { UserSession } from '../../../../types/auth';

export const GET: APIRoute = async ({session}) => {
  try {
    const user=await session?.get('wargahub_user') as UserSession|undefined;
    if(!user) return Response.json({error:{message:'Silakan masuk kembali.'}},{status:401});
    return Response.json(await getInitialUtilities(canReadHousingBilling(user.role)));
  } catch {return Response.json({error:{message:'Daftar utilitas belum dapat dimuat.'}},{status:503});}
};
