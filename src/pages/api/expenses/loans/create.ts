import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { loanCreation, createLoan } from '../../../../services/staff-loan.service';

export const POST: APIRoute = mutation(loanCreation, createLoan, 201);
