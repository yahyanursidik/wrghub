import { aidTypes } from '../../../../lib/cash-data';
import { socialInput } from '../../../../services/expense-input';
import { getExpenseCategories, recordExpense } from '../../../../services/expense-operations.service';
import { mutation } from '../../../../services/operational-mutation';

export const POST = mutation(socialInput,async (input,actor)=>{
  const categories = input.categoryId ? [] : await getExpenseCategories();
  const categoryId = input.categoryId || categories.find(category=>/sosial|kesehatan/i.test(category.name))?.id;
  return recordExpense({...input,categoryId,title:'Bantuan sosial · '+aidTypes[input.aidType],description:undefined,expenseDate:input.aidDate},
    actor,{recipientName:input.recipientName,aidType:input.aidType,memo:input.description});
},201);
