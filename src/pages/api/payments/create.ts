import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { manualPayment, recordManualPayment } from '../../../services/payment.service';
export const POST: APIRoute = mutation(manualPayment, recordManualPayment, 201);
