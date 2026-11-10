import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { invoiceEdit, editInvoice } from '../../../../services/invoice-operations.service';

export const POST: APIRoute = mutation(invoiceEdit, editInvoice);
