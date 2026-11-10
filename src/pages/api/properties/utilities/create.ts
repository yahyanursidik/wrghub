import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { utilityInput, saveUtility } from '../../../../services/utility-records.service';

export const POST: APIRoute = mutation(utilityInput, saveUtility, 201);
