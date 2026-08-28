import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const summary = {
    generatedAt: new Date().toISOString(),
    complexName: 'WargaHub Smart Residential Estate',
    totalHouses: 123,
    activeOccupants: 486,
    avgComplianceRate: '95.3%',
    bankBalance: 'Rp 127.100.000',
    ytdIncome: 'Rp 522.000.000',
    ytdExpense: 'Rp 236.650.000',
    ytdNetSurplus: 'Rp 285.350.000',
    openComplaints: 1,
    resolvedComplaints: 28,
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
