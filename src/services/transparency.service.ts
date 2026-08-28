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
  const defaultUnpaid = ['A-03', 'A-11', 'B-07', 'C-02', 'C-11', 'D-05'];
  const defaultBreakdown = [
    { name: 'Keamanan', percentage: 45, amount: 17600000, icon: 'ShieldCheck' },
    { name: 'Kebersihan', percentage: 25, amount: 9787500, icon: 'Sparkles' },
    { name: 'Listrik', percentage: 20, amount: 7830000, icon: 'Zap' },
    { name: 'Pemeliharaan', percentage: 10, amount: 3932500, icon: 'Wrench' },
  ];

  let totalProps = 68;
  let paidProps = 59;
  let unpaidProps = 9;
  let income = 64500000;
  let expense = 39150000;
  let openingBalance = 18000000;
  let closingBalance = 25350000;
  let unpaidHouses = defaultUnpaid;
  let expenseBreakdown = defaultBreakdown;

  if (process.env.DATABASE_URL) {
    try {
      const snaps = await neonSql`SELECT * FROM monthly_snapshots WHERE billing_period_id = 'period-2026-08' LIMIT 1`;
      if (snaps.length) {
        const s = snaps[0];
        totalProps = Number(s.total_properties) || 68;
        paidProps = Number(s.paid_properties) || 59;
        unpaidProps = Number(s.unpaid_properties) || 9;
        income = Number(s.income) || 64500000;
        expense = Number(s.expense) || 39150000;
        openingBalance = Number(s.opening_balance) || 18000000;
        closingBalance = Number(s.closing_balance) || 25350000;
        if (s.unpaid_properties_list_json) unpaidHouses = JSON.parse(s.unpaid_properties_list_json);
        if (s.breakdown_json) expenseBreakdown = JSON.parse(s.breakdown_json);
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
    paidPercentage: Number(((paidProps / totalProps) * 100).toFixed(1)),
    unpaidPercentage: Number(((unpaidProps / totalProps) * 100).toFixed(1)),
    income,
    expense,
    openingBalance,
    closingBalance,
    unpaidHouses,
    expenseBreakdown,
    qrCodeDataUrl,
    lastUpdatedAt: '19 Agustus 2026, 17:30 WIB',
    communityName: 'Komplek Taman Sejahtera',
  };
}
