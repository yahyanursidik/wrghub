import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { disburseLoan, loanDisburse } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanDisburse, disburseLoan);
