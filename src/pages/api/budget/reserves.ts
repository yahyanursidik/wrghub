import type { APIRoute } from 'astro';
import { budgetReserveInput, changeReserveFund, listReserveFunds } from '../../../services/budget-planning.service';
import { mutation } from '../../../services/operational-mutation';

export const POST=mutation(budgetReserveInput,changeReserveFund,input=>input.action==='create'?201:200);
export const GET:APIRoute=async()=>{
  try {return Response.json({data:await listReserveFunds()},{headers:{'Cache-Control':'private, no-store'}});}
  catch {return Response.json({error:{message:'Dana cadangan belum dapat dimuat.'}},{status:503});}
};
