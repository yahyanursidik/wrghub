import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { occupantArchive, archiveOccupants } from '../../../../services/occupant.service';

export const POST: APIRoute = mutation(occupantArchive, archiveOccupants);
