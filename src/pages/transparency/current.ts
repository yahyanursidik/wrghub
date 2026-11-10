import type { APIRoute } from 'astro';
import { publicReportFilters, publicReportPath, publicReportPeriod } from '../../lib/transparency-data';

export const GET: APIRoute = async ({url}) => {
  const filters=publicReportFilters(url.searchParams);
  return new Response(null, {
    status: 302,
    headers: {
      Location: publicReportPath(publicReportPeriod(),filters.tab,{direction:filters.direction,category:filters.category}),
      'Cache-Control':'no-store',
    },
  });
};

