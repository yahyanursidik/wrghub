import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentReject, rejectPayment } from '../../../services/payment.service';
export const POST: APIRoute = mutation(paymentReject, rejectPayment);
