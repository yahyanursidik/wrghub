import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { patchProperty, updateProperty } from '../../../services/housing-records.service';

export const POST: APIRoute = mutation(patchProperty, updateProperty);
