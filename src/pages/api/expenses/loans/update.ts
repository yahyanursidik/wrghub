import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanUpdate, updateLoan } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanUpdate, updateLoan);
