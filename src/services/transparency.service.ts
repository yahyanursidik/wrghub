import { neonSql } from '../db/neon';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';

export interface PublicTransparencyData {
  periodName: string;
  year: number;
  month: number;
  totalProperties: number;
  paidProperties: number;
  unpaidProperties: number;
  paidPercentage: number;
  unpaidPercentage: number;
  income: number;
  expense: number;
  openingBalance: number;
  closingBalance: number;
  unpaidHouses: string[];
  expenseBreakdown: Array<{
    name: string;
    percentage: number;
    amount: number;
    icon: string;
  }>;
  qrCodeDataUrl: string;
  lastUpdatedAt: string;
  communityName: string;
}

export async function getPublicMonthlyReport(year = 2026, month = 8): Promise<PublicTransparencyData> {
  let totalProps = 0;
  let paidProps = 0;
  let unpaidProps = 0;
  let income = 0;
  let expense = 0;
  let openingBalance = 0;
  let closingBalance = 0;
  let unpaidHouses: string[] = [];
  let expenseBreakdown: Array<{ name: string; percentage: number; amount: number; icon: string }> = [];

  if (process.env.DATABASE_URL) {
    try {
      const periodId = `period-${year}-${month.toString().padStart(2, '0')}`;
      const snaps = await neonSql`SELECT * FROM monthly_snapshots WHERE billing_period_id = ${periodId} LIMIT 1`;
      if (snaps.length) {
        const s = snaps[0];
        totalProps = Number(s.total_properties ?? 0);
        paidProps = Number(s.paid_properties ?? 0);
        unpaidProps = Number(s.unpaid_properties ?? 0);
        income = Number(s.income ?? 0);
        expense = Number(s.expense ?? 0);
        openingBalance = Number(s.opening_balance ?? 0);
        closingBalance = Number(s.closing_balance ?? 0);
        if (s.unpaid_properties_list_json) unpaidHouses = JSON.parse(s.unpaid_properties_list_json);
        if (s.breakdown_json) expenseBreakdown = JSON.parse(s.breakdown_json);
      } else {
        // Query live counts from database
        const pCount = await neonSql`SELECT COUNT(*) as total FROM properties WHERE is_active = true`;
        totalProps = Number(pCount[0]?.total ?? 0);

        const invStats = await neonSql`
          SELECT 
            COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid,
            COUNT(CASE WHEN status != 'PAID' THEN 1 END) as unpaid,
            COALESCE(SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END), 0) as income
          FROM invoices
          WHERE billing_period_id = ${periodId}
        `;
        paidProps = Number(invStats[0]?.paid ?? 0);
        unpaidProps = Number(invStats[0]?.unpaid ?? 0);
        income = Number(invStats[0]?.income ?? 0);

        const expSum = await neonSql`SELECT COALESCE(SUM(amount), 0) as total FROM expenses`;
        expense = Number(expSum[0]?.total ?? 0);

        const accSum = await neonSql`SELECT COALESCE(SUM(balance), 0) as total FROM accounts WHERE is_active = true`;
        closingBalance = Number(accSum[0]?.total ?? 0);
      }
    } catch (e) {
      console.warn('Neon transparency snapshot error:', e);
    }
  }

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(`https://wargahub.id/transparency/${year}/${month.toString().padStart(2, '0')}`, {
      margin: 1,
      width: 140,
      color: { dark: '#18201D', light: '#FFFFFF' }
    });
  } catch (e) {
    qrCodeDataUrl = '';
  }

  return {
    periodName: 'Agustus 2026',
    year,
    month,
    totalProperties: totalProps,
    paidProperties: paidProps,
    unpaidProperties: unpaidProps,
    paidPercentage: totalProps > 0 ? Number(((paidProps / totalProps) * 100).toFixed(1)) : 0,
    unpaidPercentage: totalProps > 0 ? Number(((unpaidProps / totalProps) * 100).toFixed(1)) : 0,
    income,
    expense,
    openingBalance,
    closingBalance,
    unpaidHouses,
    expenseBreakdown,
    qrCodeDataUrl,
    lastUpdatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', 17:30 WIB',
    communityName: 'Komplek Taman Sejahtera',
  };
}
