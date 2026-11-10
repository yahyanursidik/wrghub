import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentRemove, removeUnbookedPayments } from '../../../services/payment.service';

export const POST: APIRoute = mutation(paymentRemove, removeUnbookedPayments);
