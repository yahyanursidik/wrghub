import type { APIRoute } from 'astro';
import { currentFinanceMonth, financeMonthPattern } from '../../../../lib/cash-data';
import { listPayrollExpenses } from '../../../../services/staff-loan.service';

export const GET: APIRoute = async ({url}) => {
  const month=url.searchParams.get('month') || '';
  if(!financeMonthPattern.test(month) || month<'1900-01' || month>currentFinanceMonth())
    return Response.json({error:{message:'Pilih bulan penggajian yang valid.'}},{status:400});
  try { return Response.json({data:await listPayrollExpenses(month)}); }
  catch { return Response.json({error:{message:'Jurnal gaji belum dapat dimuat.'}},{status:503}); }
};
