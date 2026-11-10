import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { installmentInput, recordInstallment } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(installmentInput, recordInstallment, 201);
