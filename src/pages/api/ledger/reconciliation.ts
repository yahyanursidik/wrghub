import type { APIRoute } from 'astro';
import { z } from 'zod';
import { query } from '../../../db/operational-query';
import { getCashReconciliation, saveCashReconciliation } from '../../../services/cash-ledger.service';
import { monthField, versionField } from '../../../services/expense-input';
import { idField, mutation, textField } from '../../../services/operational-mutation';

const input = z.object({accountId:idField,month:monthField,expectedVersion:versionField,
  statementBalance:z.number().finite().min(-9_999_999_999).max(9_999_999_999).multipleOf(0.01),note:textField(500).default('')});
export const POST = mutation(input,saveCashReconciliation);
export const GET: APIRoute = async ({url})=>{
  const params = input.pick({accountId:true,month:true}).safeParse({accountId:url.searchParams.get('account'),month:url.searchParams.get('month')});
  const headers = {'Cache-Control':'private, no-store'};
  if (!params.success) return Response.json({error:{message:'Pilih rekening dan periode yang valid.'}},{status:400,headers});
  try {
    const {accountId,month} = params.data;
    if (!(await query("SELECT id FROM accounts WHERE id=? AND is_active=true AND type<>'RESERVE'",[accountId])).length) return Response.json({error:{message:'Rekening tidak ditemukan.'}},{status:404,headers});
    return Response.json({data:await getCashReconciliation(accountId,month)},{headers});
  } catch { return Response.json({error:{message:'Rekonsiliasi belum dapat dimuat.'}},{status:503,headers}); }
};
