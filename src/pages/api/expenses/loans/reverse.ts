import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanReverse, reverseLoanMovement } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanReverse, reverseLoanMovement);
