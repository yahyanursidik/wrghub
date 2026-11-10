import type { APIRoute } from 'astro';
import { monthField, recurringProcessInput } from '../../../../services/expense-input';
import { postRecurringExpenses, previewRecurringExpenses } from '../../../../services/expense-operations.service';
import { mutation } from '../../../../services/operational-mutation';

export const GET: APIRoute = async ({url})=>{
  const month = monthField.safeParse(url.searchParams.get('month'));
  if (!month.success) return Response.json({error:{message:'Pilih periode yang valid.'}},{status:400});
  try { return Response.json({data:await previewRecurringExpenses(month.data)}); }
  catch { return Response.json({error:{message:'Pratinjau belum dapat dimuat.'}},{status:503}); }
};
export const POST = mutation(recurringProcessInput,(input,actor)=>postRecurringExpenses(input.month,input.itemIds,input.expectedVersion,actor),201);
