import type { APIRoute } from 'astro';
import { publicJournalParams, publicReportFilters, publicReportPath, publicReportPeriod } from '../../lib/transparency-data';

export const GET: APIRoute = async ({url}) => {
  const filters=publicReportFilters(url.searchParams);
  return new Response(null, {
    status: 302,
    headers: {
      Location: publicReportPath(publicReportPeriod(),filters.tab,filters.tab==='public_ledger'?publicJournalParams(filters):{}),
      'Cache-Control':'no-store',
    },
  });
};

