import type { APIRoute } from 'astro';
import { financeCsv } from '../../../lib/billing-data';
import { analyticsFilters, roundCash, type AnalyticsWorkspace } from '../../../lib/planning-data';
import { getAnalyticsWorkspace } from '../../../services/analytics-report.service';

function rows(data:AnalyticsWorkspace):(string|number)[][] {
  const {month,tab,target}=data.filters;
  if(tab==='block_compliance') return [
    ['Periode','Blok','Rumah aktif','Dihuni','Ditagih','Lunas','Belum lunas','Belum terbit','Bukti menunggu','Kepatuhan (%)','Terbayar (Rp)','Sisa (Rp)'],
    ...data.compliance.blocks.map(item=>[month,item.block,item.houses,item.occupied,item.issued,item.paid,item.issued-item.paid,item.houses-item.issued,item.pending,item.rate ?? '',item.received,item.remaining]),
  ];
  if(tab==='utility_efficiency') {
    const u=data.utilities;
    return [['Cakupan','Indikator','Nilai'],['Terkini','Rumah aktif',u.houses],['Terkini','Catatan utilitas',u.records],['Terkini','PLN tercatat',u.electricity],
      ['Terkini','Meter air tercatat',u.waterMeters],['Terkini','Pasangan bacaan valid',u.usableReadings],['Terkini','Selisih bacaan (m³)',u.waterUsage ?? ''],
      ['Terkini','Bacaan perlu cek',u.invalidReadings],['Terkini','Panel surya',u.solar],['Terkini','Biopori',u.biopori],
      ...u.costs.map(item=>[month,item.name+' (Rp)',item.amount])];
  }
  if(tab==='security_sla') return [
    ['Periode','Kelompok','Aduan masuk','Masih terbuka','Selesai atau ditutup','Terukur','Rata-rata (jam)','Target (jam)','Sesuai target','Persentase target (%)'],
    ...([['Semua aduan',data.security.complaints],['Keamanan',data.security.security]] as const).map(([name,row])=>
      [month,name,row.total,row.open,row.done,row.measured,row.avgHours ?? '',target,row.onTime,row.targetRate ?? '']),
    [],['Periode','Kategori','Masuk','Terbuka'],...data.security.categories.map(item=>[month,item.name,item.total,item.open]),
    [],['Periode','Indikator','Jumlah'],[month,'Patroli tercatat',data.security.patrols],
  ];
  return [['Periode','Saldo awal (Rp)','Pemasukan bersih (Rp)','Pengeluaran bersih (Rp)','Arus bersih (Rp)','Mutasi internal bersih (Rp)','Saldo awal rekening (Rp)','Saldo akhir (Rp)','Jumlah jurnal'],
    ...data.trends.map(row=>[row.month,row.opening,row.income,row.outgoing,roundCash(row.income-row.outgoing),row.transfers,row.openingEntries,row.closing,row.count])];
}
export const GET:APIRoute=async({url})=>{
  const filters=analyticsFilters(url.searchParams);
  const headers={'Cache-Control':'private, no-store'};
  try {
    const data=await getAnalyticsWorkspace(filters,undefined,false);
    if(url.searchParams.get('format')!=='csv') return Response.json({data,meta:{format:'EXECUTIVE_JSON'}},{headers});
    return new Response(financeCsv(rows(data)),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8',
      'Content-Disposition':'attachment; filename="laporan-'+filters.tab+'-'+filters.month+'.csv"','X-Content-Type-Options':'nosniff'}});
  } catch {return Response.json({error:{message:'Laporan belum dapat dimuat.'}},{status:503,headers});}
};
