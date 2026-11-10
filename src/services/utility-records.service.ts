import { z } from 'zod';
import { query, writeTransaction, type Query } from '../db/operational-query';
import { canReadHousingBilling } from '../lib/access-policy';
import { readPropertyProfile } from '../lib/property-profile';
import type { UtilityItem } from '../types/property-submodules';
import type { UserSession } from '../types/auth';
import { archiveInput, idField, operationalAudit, OperationalError, requiredIds, textField } from './operational-mutation';

export const utilityInput=z.object({
  propertyId:idField,plnCapacity:textField(50).optional(),plnCustomerId:textField(80).default(''),pamMeterNo:textField(80).optional(),
  pamReadingLastMonth:z.number().nonnegative().max(1e9),pamReadingThisMonth:z.number().nonnegative().max(1e9),
  wasteSchedule:textField(100).default(''),hasBiopori:z.boolean().default(false),hasSolarPanel:z.boolean().default(false),
  notes:textField(1000).default(''),
}).refine(data=>data.pamReadingThisMonth>=data.pamReadingLastMonth,'Pembacaan meter saat ini tidak boleh lebih kecil dari sebelumnya.');
export const utilityArchive=archiveInput.extend({utilityId:idField.optional()});
type Row={id:string;property_id:string;code:string;block_name:string|null;profile_json:string;owner_name:string|null;pln_customer_id:string;
  meter_previous:string|number;meter_current:string|number;waste_schedule:string;has_biopori:number|boolean;has_solar_panel:number|boolean;notes:string|null;
  period_name:string|null;invoice_status:string|null;invoice_total:number|string|null;invoice_paid:number|string|null;due_date:string|null};
const jakartaDay=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
async function list(run:Query,propertyId?:string):Promise<UtilityItem[]> {
  const rows=await run<Row>(`SELECT u.*,p.code,p.profile_json,b.name AS block_name,
    (SELECT person.name FROM property_ownerships po JOIN persons person ON person.id=po.person_id
      WHERE po.property_id=p.id AND po.is_active=true AND po.ended_at IS NULL ORDER BY po.started_at DESC,po.id LIMIT 1) AS owner_name,
    period.name AS period_name,inv.status AS invoice_status,inv.total AS invoice_total,inv.paid_amount AS invoice_paid,inv.due_date
    FROM property_utilities u JOIN properties p ON p.id=u.property_id AND p.is_active=true LEFT JOIN blocks b ON b.id=p.block_id
    LEFT JOIN billing_periods period ON period.id=(SELECT next.id FROM billing_periods next WHERE next.community_id=p.community_id
      ORDER BY next.year DESC,next.month DESC,next.id LIMIT 1)
    LEFT JOIN invoices inv ON inv.id=(SELECT item.id FROM invoices item WHERE item.property_id=p.id AND item.billing_period_id=period.id
      AND item.status NOT IN ('CANCELLED','VOID') ORDER BY item.issued_at DESC,item.id LIMIT 1)
    WHERE u.archived_at IS NULL`+(propertyId?' AND p.id=?':'')+' ORDER BY p.code',propertyId?[propertyId]:[]);
  const today=jakartaDay();
  return rows.map(row=>{
    const profile=readPropertyProfile(row.profile_json);
    const bill=row.invoice_status;
    const paymentStatus:UtilityItem['paymentStatus']=!bill?'BELUM_ADA_TAGIHAN':bill==='WAIVED'?'DIBEBASKAN':bill==='PAID'?'LUNAS':
      Number(row.invoice_paid)>0?'SEBAGIAN':bill==='OVERDUE'||(row.due_date && row.due_date.slice(0,10)<today)?'MENUNGGAK':'MENUNGGU_BAYAR';
    return {id:row.id,propertyId:row.property_id,houseCode:row.code,areaLabel:row.block_name || 'Tanpa blok',ownerName:row.owner_name || '',
      plnCapacity:profile.plnCapacity || '',plnCustomerId:row.pln_customer_id,pamMeterNo:profile.pamMeterNo || '',
      pamReadingLastMonth:Number(row.meter_previous),pamReadingThisMonth:Number(row.meter_current),pamUsage:Number(row.meter_current)-Number(row.meter_previous),
      wasteSchedule:row.waste_schedule,hasBiopori:Boolean(row.has_biopori),hasSolarPanel:Boolean(row.has_solar_panel),notes:row.notes || undefined,
      monthlyIplFee:row.invoice_total===null?null:Number(row.invoice_total),billingPeriodName:row.period_name || undefined,paymentStatus};
  });
}
const billingView=(item:UtilityItem,allowed:boolean):UtilityItem=>allowed?item:{...item,monthlyIplFee:null,billingPeriodName:undefined,paymentStatus:'TERBATAS'};
export const listUtilities=async (includeBilling=true)=>(await list(query)).map(item=>billingView(item,includeBilling));
export async function saveUtility(input:z.output<typeof utilityInput>,actor:UserSession) {
  return writeTransaction(async(run,lock)=>{
    const [property]=await run<{profile_json:string}>('SELECT profile_json FROM properties WHERE id=? AND is_active=true'+lock,[input.propertyId]);
    if(!property) throw new OperationalError('Rumah aktif tidak ditemukan.',404);
    const now=new Date().toISOString();
    const profile=readPropertyProfile(property.profile_json);
    if(input.plnCapacity!==undefined) profile.plnCapacity=input.plnCapacity;
    if(input.pamMeterNo!==undefined) profile.pamMeterNo=input.pamMeterNo;
    await run('UPDATE properties SET profile_json=?,updated_at=? WHERE id=?',[JSON.stringify(profile),now,input.propertyId]);
    const id='util-'+input.propertyId;
    await run(`INSERT INTO property_utilities (id,property_id,pln_customer_id,meter_previous,meter_current,waste_schedule,has_biopori,has_solar_panel,notes,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT (property_id) DO UPDATE SET pln_customer_id=excluded.pln_customer_id,
      meter_previous=excluded.meter_previous,meter_current=excluded.meter_current,waste_schedule=excluded.waste_schedule,
      has_biopori=excluded.has_biopori,has_solar_panel=excluded.has_solar_panel,notes=excluded.notes,updated_at=excluded.updated_at,archived_at=NULL`,
      [id,input.propertyId,input.plnCustomerId,input.pamReadingLastMonth,input.pamReadingThisMonth,input.wasteSchedule,input.hasBiopori,input.hasSolarPanel,input.notes,now]);
    await operationalAudit(run,actor,'property.utility_save','PROPERTY_UTILITY',id,{propertyId:input.propertyId});
    return billingView((await list(run,input.propertyId))[0],canReadHousingBilling(actor.role));
  });
}
export async function archiveUtilities(input:z.output<typeof utilityArchive>,actor:UserSession) {
  const ids=requiredIds({...input,id:input.id || input.utilityId}).sort();
  return writeTransaction(async run=>{
    for(const id of ids) {
      const [row]=await run<{id:string}>('UPDATE property_utilities SET archived_at=? WHERE id=? AND archived_at IS NULL RETURNING id',[new Date().toISOString(),id]);
      if(!row) throw new OperationalError('Catatan utilitas aktif tidak ditemukan.',404);
      await operationalAudit(run,actor,'property.utility_archive','PROPERTY_UTILITY',id,{reason:input.reason||null});
    }
    return {ids};
  });
}
