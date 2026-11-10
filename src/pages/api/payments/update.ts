import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { paymentEdit, editPendingPayment } from '../../../services/payment.service';

export const POST: APIRoute = mutation(paymentEdit, editPendingPayment);
