import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { permitStatus, changePermitStatus } from '../../../../services/permit.service';

export const POST: APIRoute = mutation(permitStatus, changePermitStatus);
