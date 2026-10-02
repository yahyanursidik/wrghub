import type { APIRoute } from 'astro';
import { getCommunityProfile, getMasterBankAccount } from '../../../services/settings.service';

export const GET: APIRoute = async () => {
  try {
    const [profile, bankInfo] = await Promise.all([
      getCommunityProfile(),
      getMasterBankAccount(),
    ]);

    return new Response(
      JSON.stringify({
        data: {
          profile,
          bankInfo,
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
        error: { code: 'FETCH_SETTINGS_FAILED', message: err.message },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
