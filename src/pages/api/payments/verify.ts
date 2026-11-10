import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentVerify, verifyPayment } from '../../../services/payment.service';
export const POST: APIRoute = mutation(paymentVerify, verifyPayment);
