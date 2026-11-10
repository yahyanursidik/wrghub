import type { APIRoute } from 'astro';
import { getRecurringExpensesConfig, saveRecurringExpensesConfig } from '../../../../services/expense-operations.service';
import { recurringConfigInput } from '../../../../services/expense-input';
import { mutation } from '../../../../services/operational-mutation';

export const GET: APIRoute = async ()=>{
  try { return Response.json({data:await getRecurringExpensesConfig()}); }
  catch { return Response.json({error:{message:'Rencana belum dapat dimuat.'}},{status:503}); }
};
export const POST = mutation(recurringConfigInput,(input,actor)=>saveRecurringExpensesConfig(input.items,input.expectedVersion,actor));
