import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { permitInput, savePermit } from '../../../../services/permit.service';

export const POST: APIRoute = mutation(permitInput, savePermit, 201);
