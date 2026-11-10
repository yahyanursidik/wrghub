import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { newProperty, createProperty } from '../../../services/housing-records.service';

export const POST: APIRoute = mutation(newProperty, createProperty, 201);
