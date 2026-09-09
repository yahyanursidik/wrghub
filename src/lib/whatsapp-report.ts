import { formatRupiah } from './format';

export interface DuesReportPropertyItem {
  code: string;
  residentName?: string;
  isRented?: boolean;
  status: 'PAID' | 'UNPAID' | 'UNBILLED' | string;
  unpaidMonthsCount?: number;
  unpaidPeriodNames?: string[];
  monthlyRate?: number;
  totalDueAmount?: number;
}

export interface GenerateWhatsAppDuesReportOptions {
  periodName: string;
  reportDate?: string;
  greetingTime?: string;
  customHeaderTitle?: string;
  properties: DuesReportPropertyItem[];
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  transparencyUrl?: string;
  rekapUrl?: string;
  kepalaKomplekName?: string;
  extraNotes?: string;
  phoneNumber?: string;
}

export function getIndonesianFormattedDate(date: Date = new Date()): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function generateWhatsAppDuesReportText(options: GenerateWhatsAppDuesReportOptions): string {
  const {
    periodName,
    reportDate = getIndonesianFormattedDate(),
    greetingTime = 'wengi/pagi',
    customHeaderTitle,
    properties,
    bankName = 'Bank Mandiri',
    bankAccountNumber = '1300024446419',
    bankAccountHolder = 'Paguyuban Grand Sariwangi',
    transparencyUrl = 'https://wrghub.vercel.app/transparency',
    rekapUrl = 'https://wrghub.vercel.app/rekap-iuran',
    kepalaKomplekName = 'Yahya Nursidik',
    extraNotes,
  } = options;

  const headerTitle = customHeaderTitle || 
    `📢 INFO IURAN KOMPLEK DAN THR PENJAGA KOMPLEK GRAND SARIWANGI – UPDATE UNTUK IURAN PER TANGGAL ${reportDate.toUpperCase()}`;

  const paidList = properties.filter((p) => p.status === 'PAID');
  const unpaidList = properties.filter((p) => p.status !== 'PAID');

  const totalUnits = properties.length;
  const paidCount = paidList.length;
  const unpaidCount = unpaidList.length;
  const paidPercent = totalUnits > 0 ? ((paidCount / totalUnits) * 100).toFixed(1) : '0.0';

  const totalCollected = paidList.reduce((sum, p) => sum + (p.monthlyRate || 250000), 0);
  const totalUnpaid = unpaidList.reduce((sum, p) => sum + (p.totalDueAmount || p.monthlyRate || 250000), 0);

  const lines: string[] = [];

  lines.push(`*${headerTitle.trim()}*`);
  lines.push('');

  lines.push(`Wilujeng ${greetingTime} Bapak/Ibu warga Grand Sariwangi, mugia Allah salawasna ngajagi urang sadaya dina kasehatan, kaberkahan, sareng kabagjaan.`);
  lines.push('');
  lines.push(`Berikut ini adalah update iuran bulanan Komplek Grand Sariwangi pada bulan *${periodName}*, belum semuanya terkumpul:`);
  lines.push('');

  lines.push(`✅ *SUDAH BAYAR / LUNAS (${paidCount} Unit):*`);
  if (paidList.length === 0) {
    lines.push('_Belum ada pembayaran terverifikasi untuk periode ini._');
  } else {
    paidList.forEach((p) => {
      lines.push(`• *${p.code}* — ${p.residentName || 'Warga'}`);
    });
  }
  lines.push('');

  lines.push(`⏳ *BELUM BAYAR / MENUNGGAK (${unpaidCount} Unit):*`);
  if (unpaidList.length === 0) {
    lines.push('🎉 *Alhamdulillah seluruh warga telah menyelesaikan iuran periode ini (100% Lunas)!*');
  } else {
    unpaidList.forEach((p) => {
      const months = p.unpaidMonthsCount && p.unpaidMonthsCount > 1 
        ? `${p.unpaidMonthsCount} bulan` 
        : '1 bulan';

      let periodDetail = '';
      if (p.unpaidPeriodNames && p.unpaidPeriodNames.length > 0) {
        periodDetail = `: ${p.unpaidPeriodNames.join(', ')}`;
      }

      lines.push(`• *${p.code}* — ${p.residentName || 'Warga'} _(Menunggak ${months}${periodDetail})_`);
    });
  }
  lines.push('');

  if (extraNotes && extraNotes.trim().length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📌 *Catatan Khusus Pengurus:*`);
    lines.push(extraNotes.trim());
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📊 *Ringkasan Status Iuran:*`);
  lines.push(`• Partisipasi: *${paidCount} dari ${totalUnits} Unit* (${paidPercent}%)`);
  lines.push(`• Total Kas Terkumpul: *${formatRupiah(totalCollected)}*`);
  if (unpaidCount > 0) {
    lines.push(`• Sisa Tagihan Berjalan: *${formatRupiah(totalUnpaid)}*`);
  }
  lines.push('');

  lines.push(`🌐 *Tautan Laporan Rutin & Transparansi:*`);
  lines.push(`👉 ${transparencyUrl}`);
  if (rekapUrl && rekapUrl !== transparencyUrl) {
    lines.push(`👉 Rekap Warga: ${rekapUrl}`);
  }
  lines.push(`_(Warga bisa login menyusul)_`);
  lines.push('');

  lines.push(`💳 *Rekening Kas Resmi Paguyuban:*`);
  lines.push(`${bankName}: *${bankAccountNumber}*`);
  lines.push(`a.n. *${bankAccountHolder}*`);
  lines.push(`_(Pengurus tidak pernah menerima pembayaran iuran melalui rekening pribadi individu)_`);
  lines.push('');

  lines.push(`Hatur nuhun atas perhatosan, partisipasi, sareng kerja sama sadaya warga demi kanyamanan, kabersihan, sareng kaamanan lingkungan komplek urang sadaya. 🙏🌿`);
  lines.push('');
  lines.push(`Salam silaturahmi,`);
  lines.push(`*Pengurus Paguyuban Grand Sariwangi*`);
  lines.push(`*(Kepala Komplek: ${kepalaKomplekName})*`);

  return lines.join('\n');
}

export function generateWaMeLink(messageText: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(messageText);
  if (!phoneNumber || phoneNumber.trim() === '') {
    return `https://wa.me/?text=${encoded}`;
  }
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '62');
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
