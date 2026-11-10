import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { facilityCreate, saveFacility } from '../../../services/catalog.service';

export const POST: APIRoute = mutation(facilityCreate, saveFacility, 201);
