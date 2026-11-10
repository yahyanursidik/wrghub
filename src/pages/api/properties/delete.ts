import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { propertyArchive, archiveProperties } from '../../../services/housing-records.service';

export const POST: APIRoute = mutation(propertyArchive, archiveProperties);
