import type { APIRoute } from 'astro';
import { allowLoginAttempt } from '../../../lib/login-rate-limit';
import { OperationalError } from '../../../services/operational-mutation';
import { redeemRecoveryCode, redeemRecoveryInput } from '../../../services/account-recovery.service';

export const POST: APIRoute = async context => {
  const headers={'Cache-Control':'no-store'};
  const fail=(message:string,status:number)=>Response.json({error:{message}},{status,headers});
  let address='unavailable';
  try { address=context.clientAddress; } catch {}
  if (!allowLoginAttempt('recover:'+address)) return Response.json({error:{message:'Terlalu banyak percobaan. Coba lagi dalam 10 menit.'}},
    {status:429,headers:{...headers,'Retry-After':'600'}});
  const input=redeemRecoveryInput.safeParse(await context.request.json().catch(()=>null));
  if (!input.success) return fail('Periksa kode pemulihan dan gunakan minimal 12 karakter untuk kata sandi baru.',400);
  try {
    const data=await redeemRecoveryCode(input.data);
    await context.session?.destroy();
    return Response.json({data},{headers});
  } catch(error) {
    if (error instanceof OperationalError) return fail(error.message,error.status);
    console.error('Account recovery failed',error instanceof Error ? error.name : typeof error);
    return fail('Pemulihan belum dapat diselesaikan. Coba lagi.',503);
  }
};
