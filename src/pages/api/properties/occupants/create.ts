import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { occupantInput, saveOccupant } from '../../../../services/occupant.service';

export const POST: APIRoute = mutation(occupantInput, saveOccupant, 201);
