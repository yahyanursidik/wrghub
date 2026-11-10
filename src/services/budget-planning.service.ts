import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { BILLING_COMMUNITY_ID } from '../lib/billing-data';
import { RESERVE_ACCOUNT, roundCash, type AnnualTemplate, type BudgetAllocation, type BudgetPlan, type BudgetWorkspace, type ReserveFund } from '../lib/planning-data';
import type { UserSession } from '../types/auth';
import { getCashMonthlySummaries } from './cash-ledger.service';
import { monthField, rupiahAmount } from './expense-input';
import { getExpenseCashTotals, getExpenseCategories, putCashSetting, readCashSetting } from './expense-operations.service';
import { writeAccountTransfer } from './manual-ledger.service';
import { dateField, idField, OperationalError, operationalAudit, textField } from './operational-mutation';

const community=BILLING_COMMUNITY_ID;
const planKey=(month:string)=>'budget-plan:'+month;
const fundKey=(id:string)=>'budget-fund:'+id;
const emptyPlan=(month:string):BudgetPlan=>({month,version:0,state:'DRAFT',items:[]});
const label=(length:number)=>textField(length).pipe(z.string().min(2));
const reason=textField(400).pipe(z.string().min(5));
const planBase={month:monthField,expectedVersion:z.number().int().nonnegative()};
const allocationFields={...planBase,categoryId:idField,amount:rupiahAmount,pic:textField(100).default(''),notes:textField(500).default('')};
export const budgetCreateInput=z.object(allocationFields).strict();
export const budgetUpdateInput=z.object({...allocationFields,id:idField}).strict();
export const budgetRemoveInput=z.object({...planBase,id:idField,reason}).strict();
export const budgetPlanInput=z.discriminatedUnion('action',[
  z.object({...planBase,action:z.literal('approve')}).strict(),
  z.object({...planBase,action:z.literal('reopen'),reason}).strict(),
  z.object({...planBase,action:z.literal('apply_annual'),annualId:idField}).strict(),
]);
const fundFields={name:label(90),target:rupiahAmount,targetMonth:z.union([monthField,z.literal('')]).default(''),purpose:textField(400).default('')};
export const budgetReserveInput=z.discriminatedUnion('action',[
  z.object({action:z.literal('create'),...fundFields}).strict(),
  z.object({action:z.literal('update'),id:idField,...fundFields}).strict(),
  z.object({action:z.literal('archive'),id:idField,reason}).strict(),
  z.object({action:z.literal('move'),id:idField,requestId:z.string().uuid(),direction:z.enum(['DEPOSIT','WITHDRAW']),accountId:idField,
    amount:rupiahAmount,date:dateField,note:textField(160).default('')}).strict(),
]);

export async function readBudgetPlan(month:string,run:Query=query,lock='') {
  return await readCashSetting<BudgetPlan>(run,planKey(month),lock) || emptyPlan(month);
}

async function lockedPlan(run:Query,lock:string,month:string,expectedVersion:number) {
  await run(`INSERT INTO settings (id,community_id,key,value,description) VALUES (?,?,?,?,?) ON CONFLICT(key) DO NOTHING`,
    [`plan-${month}`,community,planKey(month),JSON.stringify(emptyPlan(month)),'Pagu anggaran per bulan']);
  const plan=await readBudgetPlan(month,run,lock);
  if (plan.version!==expectedVersion) throw new OperationalError('Rencana berubah di perangkat lain. Muat ulang sebelum menyimpan.');
  return plan;
}

async function storePlan(run:Query,plan:BudgetPlan,actor:UserSession,action:string,details:unknown) {
  const next={...plan,version:plan.version+1};
  await putCashSetting(run,planKey(plan.month),next,'Pagu anggaran per bulan');
  await operationalAudit(run,actor,action,'BUDGET_PLAN',plan.month,details);
  return next;
}

function requireDraft(plan:BudgetPlan) {
  if (plan.state!=='DRAFT') throw new OperationalError('Pagu sudah disahkan. Buka revisi sebelum mengubahnya.');
}
export const canApproveBudget=(role:UserSession['role'])=>role==='SUPER_ADMIN' || role==='CHAIRMAN';

export async function saveBudgetAllocation(input:z.output<typeof budgetCreateInput> & {id?:string},actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const plan=await lockedPlan(run,lock,input.month,input.expectedVersion);
    requireDraft(plan);
    if (!(await run('SELECT id FROM expense_categories WHERE id=?',[input.categoryId])).length) throw new OperationalError('Kategori pengeluaran tidak ditemukan.',404);
    const previous=plan.items.find(item=>item.id===input.id);
    if (input.id && !previous) throw new OperationalError('Pos pagu tidak ditemukan.',404);
    if (plan.items.some(item=>item.categoryId===input.categoryId && item.id!==input.id)) throw new OperationalError('Kategori ini sudah mempunyai pagu untuk periode tersebut.');
    const allocation={id:previous?.id || `pos-${randomUUID()}`,categoryId:input.categoryId,amount:input.amount,pic:input.pic,notes:input.notes};
    return storePlan(run,{...plan,items:[...plan.items.filter(item=>item.id!==allocation.id),allocation]},actor,
      previous?'budget.allocation.update':'budget.allocation.create',{previous:previous || null,allocation});
  });
}

export async function archiveBudgetAllocation(input:z.output<typeof budgetRemoveInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const plan=await lockedPlan(run,lock,input.month,input.expectedVersion);
    requireDraft(plan);
    const allocation=plan.items.find(item=>item.id===input.id);
    if (!allocation) throw new OperationalError('Pos pagu tidak ditemukan.',404);
    return storePlan(run,{...plan,items:plan.items.filter(item=>item.id!==input.id)},actor,'budget.allocation.archive',{allocation,reason:input.reason});
  });
}

export async function applyBudgetPlan(input:z.output<typeof budgetPlanInput>,actor:UserSession) {
  if (input.action!=='apply_annual' && !canApproveBudget(actor.role)) throw new OperationalError('Hanya Ketua atau Admin yang dapat mengesahkan dan membuka revisi.',403);
  return writeTransaction(async(run,lock)=>{
    const plan=await lockedPlan(run,lock,input.month,input.expectedVersion);
    if(input.action==='reopen') {
      if(plan.state!=='APPROVED') throw new OperationalError('Pagu ini sudah berupa draf.');
      return storePlan(run,{...plan,state:'DRAFT',approved:undefined,revision:input.reason},actor,'budget.reopen',{reason:input.reason,previousApproval:plan.approved});
    }
    requireDraft(plan);
    if(input.action==='approve') {
      if(!plan.items.length) throw new OperationalError('Tambahkan pagu sebelum mengesahkan.');
      const approved={by:actor.fullName,at:new Date().toISOString()};
      return storePlan(run,{...plan,state:'APPROVED',approved,revision:undefined},actor,'budget.approve',{
        approved,items:plan.items.map(({categoryId,amount})=>({categoryId,amount})),total:roundCash(plan.items.reduce((sum,item)=>sum+item.amount,0)),
      });
    }
    const templates=await run<{category_id:string;amount:string|number}>(`SELECT bi.category_id,SUM(bi.monthly_budget) AS amount
      FROM budgets b JOIN budget_items bi ON bi.budget_id=b.id JOIN expense_categories c ON c.id=bi.category_id
      WHERE b.id=? AND b.community_id=? AND b.year=? AND bi.monthly_budget>0 GROUP BY bi.category_id`,[input.annualId,community,Number(input.month.slice(0,4))]);
    const additions:BudgetAllocation[]=templates.filter(row=>!plan.items.some(item=>item.categoryId===row.category_id)).map(row=>({
      id:`pos-${randomUUID()}`,categoryId:row.category_id,amount:roundCash(Number(row.amount)),pic:'',notes:'',
    }));
    if(!additions.length) throw new OperationalError('Acuan tidak menambahkan kategori baru.');
    return storePlan(run,{...plan,items:[...plan.items,...additions]},actor,'budget.apply_annual',{annualId:input.annualId,count:additions.length});
  });
}

async function getAnnualTemplates(year:number):Promise<AnnualTemplate[]> {
  const rows=await query<{id:string;name:string;count:number|string}>(`SELECT b.id,b.name,COUNT(DISTINCT bi.category_id) AS count
    FROM budgets b JOIN budget_items bi ON bi.budget_id=b.id JOIN expense_categories c ON c.id=bi.category_id
    WHERE b.community_id=? AND b.year=? AND bi.monthly_budget>0 GROUP BY b.id,b.name ORDER BY b.name,b.id`,[community,year]);
  return rows.map(row=>({...row,count:Number(row.count)}));
}

export async function getBudgetWorkspace(month:string):Promise<BudgetWorkspace> {
  const [year,number]=month.split('-').map(Number);
  const [plan,actual,categories,annual,period,cash]=await Promise.all([readBudgetPlan(month),getExpenseCashTotals(month),getExpenseCategories(),
    getAnnualTemplates(year),query<{id:string}>('SELECT id FROM billing_periods WHERE community_id=? AND year=? AND month=? ORDER BY id LIMIT 1',[community,year,number]),
    getCashMonthlySummaries(month,1)]);
  return {month,plan,actual,categories,annual,billingPeriodId:period[0]?.id || null,cash:cash[0]};
}

type StoredFund=Omit<ReserveFund,'balance'>;
type Movement=z.output<typeof budgetReserveInput> & {action:'move'};
type MoveReceipt={input:Movement;transferId:string};
export async function listReserveFunds():Promise<ReserveFund[]> {
  const [settings,balances]=await Promise.all([
    query<{value:string}>("SELECT value FROM settings WHERE key LIKE 'budget-fund:%'"),
    query<{id:string;balance:number|string}>('SELECT id,balance FROM accounts WHERE type=?',[RESERVE_ACCOUNT]),
  ]);
  const amounts=new Map(balances.map(row=>[row.id,Number(row.balance)]));
  return settings.map(({value})=>{
    const fund=JSON.parse(value) as StoredFund;
    const balance=amounts.get(fund.accountId);
    if (balance===undefined) throw new Error('Missing reserve account');
    return {...fund,balance};
  }).sort((a,b)=>Number(Boolean(a.archivedAt))-Number(Boolean(b.archivedAt)) || a.name.localeCompare(b.name,'id'));
}

export async function changeReserveFund(input:z.output<typeof budgetReserveInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    if (input.action==='create') {
      const uuid=randomUUID();
      const fund:StoredFund={id:`fund-${uuid}`,accountId:`res-${uuid}`,name:input.name,target:input.target,targetMonth:input.targetMonth,purpose:input.purpose};
      await run('INSERT INTO accounts (id,community_id,name,code,type,balance,is_active) VALUES (?,?,?,?,?,0,true)',
        [fund.accountId,community,fund.name,'CAD-'+uuid.toUpperCase(),RESERVE_ACCOUNT]);
      await putCashSetting(run,fundKey(fund.id),fund,'Dana cadangan terhubung ke jurnal');
      await operationalAudit(run,actor,'budget.reserve.create','BUDGET_RESERVE',fund.id,fund);
      return {...fund,balance:0};
    }
    const fund=await readCashSetting<StoredFund>(run,fundKey(input.id),lock);
    if (!fund) throw new OperationalError('Dana cadangan tidak ditemukan.',404);
    if(input.action==='move') {
      const key='budget-move:'+fund.id+':'+input.requestId;
      const prior=await readCashSetting<MoveReceipt>(run,key);
      if(prior) {
        if (JSON.stringify(prior.input)!==JSON.stringify(input)) throw new OperationalError('Permintaan mutasi telah dipakai untuk rincian lain.');
        return {transferId:prior.transferId};
      }
      if(fund.archivedAt) throw new OperationalError('Dana sudah diarsipkan.');
      const deposit=input.direction==='DEPOSIT';
      const data=await writeAccountTransfer(run,lock,{fromAccountId:deposit?input.accountId:fund.accountId,toAccountId:deposit?fund.accountId:input.accountId,
        amount:input.amount,entryDate:input.date,description:(deposit?'Setor cadangan: ':'Tarik cadangan: ')+fund.name+(input.note?' · '+input.note:'')},actor,true);
      await putCashSetting(run,key,{input,transferId:data.transferId},'Referensi mutasi dana cadangan');
      return {transferId:data.transferId};
    }
    if(fund.archivedAt) throw new OperationalError('Dana sudah diarsipkan.');
    if(input.action==='archive') {
      const [account]=await run<{balance:number|string}>('SELECT balance FROM accounts WHERE id=? AND type=? AND is_active=true'+lock,[fund.accountId,RESERVE_ACCOUNT]);
      if (!account || Number(account.balance)!==0) throw new OperationalError('Tarik sisa dana ke rekening kas sebelum mengarsipkan.');
      const archivedAt=new Date().toISOString();
      await run('UPDATE accounts SET is_active=false WHERE id=?',[fund.accountId]);
      await putCashSetting(run,fundKey(fund.id),{...fund,archivedAt},'Dana cadangan terhubung ke jurnal');
      await operationalAudit(run,actor,'budget.reserve.archive','BUDGET_RESERVE',fund.id,{reason:input.reason});
      return {id:fund.id,archivedAt};
    }
    const next={...fund,name:input.name,target:input.target,targetMonth:input.targetMonth,purpose:input.purpose};
    await run('UPDATE accounts SET name=? WHERE id=? AND type=?',[next.name,next.accountId,RESERVE_ACCOUNT]);
    await putCashSetting(run,fundKey(fund.id),next,'Dana cadangan terhubung ke jurnal');
    await operationalAudit(run,actor,'budget.reserve.update','BUDGET_RESERVE',fund.id,{before:fund,after:next});
    return next;
  });
}
