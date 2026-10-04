import type { APIRoute } from 'astro';
import { getVotingDashboard, getVotedPollIdsByProperty } from '../../../services/voting.service';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const dashboard = await getVotingDashboard();
    const propertyCode = url.searchParams.get('propertyCode');
    const votedPollIds = propertyCode ? await getVotedPollIdsByProperty(propertyCode) : [];
    return new Response(
      JSON.stringify({
        data: {
          election: dashboard.election,
          polls: dashboard.polls,
          votedPollIds,
        },
        meta: { timestamp: new Date().toISOString() },
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        meta: {},
        error: { code: 'VOTING_FETCH_FAILED', message: err?.message || 'Gagal memuat data voting' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
