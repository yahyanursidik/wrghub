import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanInput, createLoan } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanInput, createLoan, 201);
