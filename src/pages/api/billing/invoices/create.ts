import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { invoiceCreate, createInvoice } from '../../../../services/invoice-operations.service';

export const POST: APIRoute = mutation(invoiceCreate, createInvoice, 201);
