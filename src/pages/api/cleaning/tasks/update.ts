import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { taskUpdate, updateCleaningTask } from '../../../../services/cleaning-checklist.service';

export const POST: APIRoute = mutation(taskUpdate, updateCleaningTask);
