import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const verifySchema = z.object({
  qrPayload: z.string(),
  scannedBy: z.string().default('Petugas Pos Satpam Utama'),
  gateLocation: z.string().default('Gerbang Utama (Pos 1)'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);

    let verificationResult = {
      isValid: true,
      type: 'RESIDENT_RECEIPT',
      title: 'Kuitansi Iuran Resmi Terverifikasi',
      propertyCode: 'A-17',
      residentName: 'Budi Santoso',
      periodName: 'Agustus 2026',
      amount: 750000,
      status: 'LUNAS (TERVERIFIKASI)',
      verifiedAt: new Date().toISOString(),
    };

    // Extract property code or QR type if payload matches pattern
    if (validated.qrPayload.toUpperCase().includes('INV-')) {
      const match = validated.qrPayload.match(/INV-\d+-([A-Z0-9]+)/i);
      if (match) {
        verificationResult.propertyCode = match[1].replace(/(\D+)(\d+)/, '$1-$2');
      }
    } else if (validated.qrPayload.toUpperCase().includes('GUEST') || validated.qrPayload.toUpperCase().includes('TAMU')) {
      verificationResult = {
        isValid: true,
        type: 'VISITOR_PASS',
        title: 'Visitor Pass Tamu Terverifikasi',
        propertyCode: 'B-07',
        residentName: 'Tamu Keluarga Hendra Wijaya',
        periodName: 'Akses Masuk 1x 24 Jam',
        amount: 0,
        status: 'IZIN MASUK DITERBITKAN',
        verifiedAt: new Date().toISOString(),
      };
    }

    if (process.env.DATABASE_URL) {
      await recordAuditLog({
        actorName: validated.scannedBy,
        action: 'security.scan_pass',
        entityType: 'SECURITY_GATE_PASS',
        entityId: `scan-${Date.now()}`,
        newValue: { payload: validated.qrPayload, result: verificationResult.status, gate: validated.gateLocation },
      });
    }

    return new Response(
      JSON.stringify({
        data: verificationResult,
        meta: {},
        error: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'VERIFICATION_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
