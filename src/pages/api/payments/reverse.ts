import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentReverse, reversePayment } from '../../../services/payment.service';

export const POST: APIRoute = mutation(paymentReverse, reversePayment);
