import type { APIRoute } from 'astro';
import { mutation, archiveInput } from '../../../services/operational-mutation';
import { archiveFacilities } from '../../../services/catalog.service';

export const POST: APIRoute = mutation(archiveInput, archiveFacilities);
