import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentSubmit, submitPayment } from '../../../services/payment.service';
export const POST: APIRoute = mutation(paymentSubmit, submitPayment, 201);
