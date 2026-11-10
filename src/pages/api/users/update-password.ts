import type { APIRoute } from 'astro';
import { mutation } from '../../../services/operational-mutation';
import { changeAccountCredential, changeCredentialInput } from '../../../services/account-recovery.service';

export const POST: APIRoute = mutation(changeCredentialInput, changeAccountCredential);
