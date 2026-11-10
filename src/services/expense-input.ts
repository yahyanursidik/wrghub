import { z } from 'zod';
import { jakartaDate } from '../lib/billing-data';
import { aidTypes, financeMonthPattern, projectStatuses, projectTypes, proofMaxBytes } from '../lib/cash-data';
import { dateField, idField, textField } from './operational-mutation';

export const rupiahAmount = z.number().finite().min(0.01).max(9_999_999_999).multipleOf(0.01);
export const versionField = z.string().regex(/^[a-f0-9]{64}$/);
export const monthField = z.string().regex(financeMonthPattern).refine(value=>value>='1900-01' && value<='2199-12');
const titleField = textField(200).pipe(z.string().min(2));
const categoryFields = {categoryId:idField.optional(),categoryName:textField(100).optional()};
const proofFields = {receiptFile:z.string().max(Math.ceil(proofMaxBytes/3)*4+50).nullable().optional(),proofUrl:textField(2048).optional()};
const expenseFields = z.object({ ...categoryFields,...proofFields,accountId:idField.optional(),title:titleField,amount:rupiahAmount,
  expenseDate:dateField,description:textField(1500).optional(),vendor:textField(160).optional() });
export const expenseCreateInput = expenseFields.extend({expenseDate:dateField.default(jakartaDate),bookNow:z.boolean().default(true),projectId:idField.optional()});
export const aidTypeField = z.enum(Object.keys(aidTypes) as [keyof typeof aidTypes]);
export const expenseUpdateInput = expenseFields.partial().extend({id:idField.optional(),expenseId:idField.optional(),recipientName:titleField.optional(),
  aidType:aidTypeField.optional(),memo:textField(1500).optional()}).refine(value=>Boolean(value.id || value.expenseId),'ID pengeluaran wajib diisi.');
export const expenseCancelInput = z.object({id:idField.optional(),expenseId:idField.optional(),ids:z.array(idField).min(1).max(50).optional(),
  reason:textField(500).pipe(z.string().min(5))}).refine(value=>Boolean(value.ids || value.id || value.expenseId),'Pilih pengeluaran yang akan dibatalkan.');
export const socialInput = z.object({...categoryFields,...proofFields,accountId:idField.optional(),recipientName:titleField,aidType:aidTypeField,
  amount:rupiahAmount,aidDate:dateField.default(jakartaDate),description:textField(1500).optional(),bookNow:z.boolean().default(true)});
export const projectInput = z.object({id:idField.optional(),projectName:titleField,projectType:z.enum(Object.keys(projectTypes) as [keyof typeof projectTypes]),
  budgetAmount:rupiahAmount,vendorOrContractor:textField(160).optional().default(''),startDate:dateField,targetCompletionDate:dateField.optional(),
  status:z.enum(Object.keys(projectStatuses) as [keyof typeof projectStatuses]),facilityId:idField.optional()});
const recurringItemInput = z.object({id:idField,title:titleField,amount:rupiahAmount,categoryId:idField,categoryName:textField(100).optional(),accountId:idField,
  executionDay:z.number().int().min(1).max(31),frequency:z.enum(['MONTHLY','SPECIFIC_MONTH','YEARLY']).optional(),executionMonth:z.number().int().min(1).max(12).optional(),
  vendor:textField(160).optional(),description:textField(1500).optional(),isActive:z.boolean()})
  .refine(value=>!value.frequency || value.frequency==='MONTHLY' || value.executionMonth!==undefined,'Pilih bulan untuk pengeluaran tahunan.');
export const recurringConfigInput = z.object({items:z.array(recurringItemInput).max(120),expectedVersion:versionField});
export const recurringProcessInput = z.object({month:monthField,expectedVersion:versionField,itemIds:z.array(idField).min(1).max(120)});
