import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanDecision, decideLoan } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanDecision, decideLoan);
