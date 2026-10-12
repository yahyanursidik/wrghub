import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, session }) => {
  await session?.destroy();
  cookies.delete('wargahub_user', { path: '/' });
  return new Response(
    JSON.stringify({
      data: { message: 'Berhasil keluar.' },
      meta: {},
      error: null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
