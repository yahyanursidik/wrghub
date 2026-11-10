import type { APIRoute } from 'astro';
import { mutation, archiveInput } from '../../../../services/operational-mutation';
import { archivePermits } from '../../../../services/permit.service';

export const POST: APIRoute = mutation(archiveInput, archivePermits);
