import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { archiveUtilities, utilityArchive } from '../../../../services/utility-records.service';

export const POST: APIRoute = mutation(utilityArchive, archiveUtilities);
