import type { APIRoute } from 'astro';

export const POST: APIRoute = () => Response.json({
  error:{message:'Reset massal dengan satu kata sandi dinonaktifkan. Buat kode pemulihan per akun.'},
},{status:410});
