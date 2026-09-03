import type { APIRoute } from 'astro';
import { getProperties } from '../../../services/property.service';

export const GET: APIRoute = async () => {
  try {
    const props = await getProperties();
    return new Response(JSON.stringify(props), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
