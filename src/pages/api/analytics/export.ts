import type { APIRoute } from 'astro';
import { getProperties } from '../../../services/property.service';
import { getLedgerEntries, getAccounts } from '../../../services/finance.service';
import { getComplaints } from '../../../services/complaint.service';
import { formatRupiah } from '../../../lib/format';

export const GET: APIRoute = async () => {
  const [properties, entries, accounts, complaints] = await Promise.all([
    getProperties().catch(() => []),
    getLedgerEntries(200).catch(() => []),
    getAccounts().catch(() => []),
    getComplaints().catch(() => []),
  ]);

  const totalHouses = properties.length;
  const occupiedHouses = properties.filter((p: any) => p.occupancyStatus === 'OCCUPIED').length;
  const totalBalance = accounts.reduce((acc: number, a: any) => acc + (Number(a.balance) || 0), 0);
  
  const ytdIncome = entries
    .filter((e: any) => e.type === 'INCOME')
    .reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
  const ytdExpense = entries
    .filter((e: any) => e.type === 'EXPENSE')
    .reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
  const ytdNetSurplus = ytdIncome - ytdExpense;

  const openComplaints = complaints.filter((c: any) => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS').length;
  const resolvedComplaints = complaints.filter((c: any) => c.status === 'RESOLVED').length;

  const summary = {
    generatedAt: new Date().toISOString(),
    complexName: 'WargaHub Smart Residential Estate',
    totalHouses,
    activeOccupants: occupiedHouses,
    avgComplianceRate: totalHouses > 0 ? `${((occupiedHouses / totalHouses) * 100).toFixed(1)}%` : '0%',
    bankBalance: formatRupiah(totalBalance),
    ytdIncome: formatRupiah(ytdIncome),
    ytdExpense: formatRupiah(ytdExpense),
    ytdNetSurplus: formatRupiah(ytdNetSurplus),
    openComplaints,
    resolvedComplaints,
  };

  return new Response(
    JSON.stringify({
      data: summary,
      meta: { format: 'EXECUTIVE_JSON' },
      error: null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
