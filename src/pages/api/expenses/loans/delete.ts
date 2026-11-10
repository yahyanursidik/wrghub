import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanIdInput, archiveLoan } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanIdInput, archiveLoan);
