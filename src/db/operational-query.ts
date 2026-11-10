import { client } from './index';
import { neonSql } from './neon';

type Value = string | number | boolean | null;
type Row = Record<string, unknown>;
export type Query = <T extends object = Row>(statement: string, values?: Value[]) => Promise<T[]>;
const pg = () => Boolean(process.env.DATABASE_URL);
function postgresText(statement: string) {
  let index = 0;
  return statement.replace(/\?/g, () => '$' + ++index);
}

export const query: Query = async <T extends object>(statement: string, values: Value[] = []) => {
  if (pg()) return await neonSql.unsafe(postgresText(statement), values) as unknown as T[];
  const { rows } = await client.execute({ sql: statement, args: values.map(value => typeof value === 'boolean' ? Number(value) : value) });
  return rows as unknown as T[];
};

export async function readSnapshot<T>(operation:(run:Query)=>Promise<T>):Promise<T> {
  if (pg()) return await neonSql.begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>operation(async <R extends object>(statement:string,values:Value[]=[]) =>
    await tx.unsafe(postgresText(statement),values) as unknown as R[])) as T;
  const tx=await client.transaction('read');
  try {
    return await operation(async <R extends object>(statement:string,values:Value[]=[])=>{
      const {rows}=await tx.execute({sql:statement,args:values.map(value=>typeof value==='boolean'?Number(value):value)});
      return rows as unknown as R[];
    });
  } finally { tx.close(); }
}

export async function writeTransaction<T>(operation: (run: Query, lock: string) => Promise<T>): Promise<T> {
  if (pg()) return await neonSql.begin(async tx => operation(async <R extends object>(statement: string, values: Value[] = []) =>
    await tx.unsafe(postgresText(statement), values) as unknown as R[], ' FOR UPDATE')) as T;
  const tx = await client.transaction('write');
  try {
    const result = await operation(async <R extends object>(statement: string, values: Value[] = []) => {
      const { rows } = await tx.execute({ sql: statement, args: values.map(value => typeof value === 'boolean' ? Number(value) : value) });
      return rows as unknown as R[];
    }, '');
    await tx.commit();
    return result;
  } finally { tx.close(); }
}
