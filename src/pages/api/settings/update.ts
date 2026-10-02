import type { APIRoute } from 'astro';
import { z } from 'zod';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

const settingsSchema = z.object({
  communityName: z.string().min(3),
  rtRw: z.string(),
  address: z.string(),
  monthlyRate: z.number().positive().optional().default(250000),
  bankName: z.string().min(1),
  bankAccount: z.string().min(1),
  accountHolder: z.string().min(1),
  qrisNmid: z.string().optional(),
  securityPhone: z.string(),
  rwHeadPhone: z.string(),
  balance: z.number().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = settingsSchema.parse(body);

    if (process.env.DATABASE_URL) {
      // 1. Update community table
      await neonSql`
        UPDATE communities
        SET name = ${validated.communityName},
            address = ${validated.address}
        WHERE id = 'comm-01';
      `;

      // 2. Selalu sinkronkan rekening bank master ke tabel accounts (Single Source of Truth)
      const mainAccName = `Rekening Kas Paguyuban (${validated.bankName})`;
      if (validated.balance !== undefined) {
        await neonSql`
          UPDATE accounts
          SET balance = ${validated.balance},
              bank_name = ${validated.bankName},
              account_number = ${validated.bankAccount},
              name = ${mainAccName}
          WHERE id = 'acc-main' OR code = 'BCA-UTAMA' OR code = 'BCA_MAIN' OR code = 'KAS_UTAMA' OR code = 'MANDIRI_UTAMA';
        `;
      } else {
        await neonSql`
          UPDATE accounts
          SET bank_name = ${validated.bankName},
              account_number = ${validated.bankAccount},
              name = ${mainAccName}
          WHERE id = 'acc-main' OR code = 'BCA-UTAMA' OR code = 'BCA_MAIN' OR code = 'KAS_UTAMA' OR code = 'MANDIRI_UTAMA';
        `;
      }

      // 3. Simpan seluruh konfigurasi profil dan rekening master ke tabel settings
      await neonSql`
        INSERT INTO settings (id, community_id, key, value, description, updated_at)
        VALUES ('set-profile', 'comm-01', 'community_profile', ${JSON.stringify(validated)}, 'Pengaturan utama profil komplek & rekening master', NOW())
        ON CONFLICT (id) DO UPDATE SET value = ${JSON.stringify(validated)}, updated_at = NOW();
      `;

      await recordAuditLog({
        actorName: 'Ketua Komplek',
        action: 'settings.update',
        entityType: 'COMMUNITY_SETTINGS',
        entityId: 'comm-01',
        newValue: validated,
      });

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            message: 'Pengaturan profil komplek & rekening master berhasil diperbarui dan disinkronkan ke seluruh sistem.',
            bankInfo: {
              bankName: validated.bankName,
              accountNumber: validated.bankAccount,
              accountHolder: validated.accountHolder,
              qrisNmid: validated.qrisNmid || 'ID102008891230',
            }
          },
          meta: {},
          error: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: {
          message: 'Pengaturan disimpan (mode lokal tanpa database).',
          bankInfo: {
            bankName: validated.bankName,
            accountNumber: validated.bankAccount,
            accountHolder: validated.accountHolder,
            qrisNmid: validated.qrisNmid || 'ID102008891230',
          }
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        data: null,
        error: { code: 'SETTINGS_UPDATE_FAILED', message: err.message },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
