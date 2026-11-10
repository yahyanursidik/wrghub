import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { facilityUpdate, saveFacility } from '../../../services/catalog.service';

export const POST: APIRoute = mutation(facilityUpdate, saveFacility);
