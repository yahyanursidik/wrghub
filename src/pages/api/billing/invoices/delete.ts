import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { invoiceCancel, cancelInvoice } from '../../../../services/invoice-operations.service';

export const POST: APIRoute = mutation(invoiceCancel, cancelInvoice);
