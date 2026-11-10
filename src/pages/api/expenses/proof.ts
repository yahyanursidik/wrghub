import type { APIRoute } from 'astro';
import { proofLink } from '../../../lib/billing-data';
import { getExpenseProof, parseExpenseProof } from '../../../services/expense-operations.service';
import { idField, OperationalError } from '../../../services/operational-mutation';

const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
export const GET: APIRoute = async ({url,session})=>{
  if (!await session?.get('wargahub_user')) return new Response(null,{status:401,headers});
  const input = idField.safeParse(url.searchParams.get('expense'));
  if (!input.success) return new Response(null,{status:400,headers});
  try {
    const value = await getExpenseProof(input.data);
    if (!value) return new Response(null,{status:404,headers});
    if (!value.startsWith('data:')) {
      const legacy = proofLink(value);
      return legacy ? new Response(null,{status:302,headers:{...headers,Location:legacy}}) : new Response(null,{status:404,headers});
    }
    const {bytes,mime,extension} = parseExpenseProof(value);
    const name = 'bukti-' + input.data.replace(/[^a-zA-Z0-9_-]/g,'') + '.' + extension;
    return new Response(new Uint8Array(bytes),{headers:{...headers,'Content-Type':mime,'Content-Disposition':'attachment; filename="'+name+'"'}});
  } catch (error) {
    return new Response(null,{status:error instanceof OperationalError?404:503,headers});
  }
};
