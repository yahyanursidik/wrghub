import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanPolicy, saveLoanPolicy } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanPolicy, saveLoanPolicy);
