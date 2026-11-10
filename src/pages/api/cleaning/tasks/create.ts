import type { APIRoute } from 'astro';
import { mutation } from '../../../../services/operational-mutation';
import { taskInput, createCleaningTask } from '../../../../services/cleaning-checklist.service';

export const POST: APIRoute = mutation(taskInput, createCleaningTask, 201);
