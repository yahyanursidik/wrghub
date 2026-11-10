import type { APIRoute } from 'astro';
import { financeCsv } from '../../../lib/billing-data';
import { budgetRows, reportMonth, roundCash } from '../../../lib/planning-data';
import { getBudgetWorkspace } from '../../../services/budget-planning.service';

export const GET:APIRoute=async({url})=>{
  const month=reportMonth(url.searchParams.get('month'));
  const headers={'Cache-Control':'private, no-store'};
  try {
    const data=await getBudgetWorkspace(month);
    if(url.searchParams.get('format')!=='csv') return Response.json({data},{headers});
    const category=url.searchParams.get('category');
    const rows=budgetRows(data).filter(item=>!category || item.id===category);
    const csv=financeCsv([['Periode','Kategori','Status rencana','Pagu (Rp)','Realisasi (Rp)','Sisa pagu (Rp)','Jurnal'],
      ...rows.map(item=>[month,item.name,item.allocation?(data.plan.state==='APPROVED'?'Disahkan':'Draf'):'Tanpa pagu',
        item.allocation?.amount ?? '',item.actual,item.allocation?roundCash(item.allocation.amount-item.actual):'',item.count])]);
    return new Response(csv,{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="anggaran-'+month+'.csv"','X-Content-Type-Options':'nosniff'}});
  } catch {return Response.json({error:{message:'Anggaran belum dapat dimuat.'}},{status:503,headers});}
};
