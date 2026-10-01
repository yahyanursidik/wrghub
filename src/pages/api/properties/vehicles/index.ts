import type { APIRoute } from 'astro';
import { getInitialVehicles } from '../../../../services/property-submodules.service';

export const GET: APIRoute = async () => {
  try {
    const data = await getInitialVehicles();
    return new Response(JSON.stringify(data), {
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
