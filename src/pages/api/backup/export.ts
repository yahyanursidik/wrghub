import type { APIRoute } from 'astro';
import { neonSql } from '../../../db/neon';
import { recordAuditLog } from '../../../services/audit.service';

export const GET: APIRoute = async () => {
  try {
    let backupPayload: any = {
      exportTimestamp: new Date().toISOString(),
      community: 'Komplek Perumahan Taman Sejahtera',
      systemVersion: 'WargaHub v2.5 Enterprise Production',
      tables: {},
    };

    if (process.env.DATABASE_URL) {
      const [properties, invoices, ledger, complaints, facilities, announcements, auditLogs, settings] = await Promise.all([
        neonSql`SELECT * FROM properties LIMIT 500`,
        neonSql`SELECT * FROM invoices LIMIT 500`,
        neonSql`SELECT * FROM ledger_entries LIMIT 500`,
        neonSql`SELECT * FROM complaints LIMIT 500`,
        neonSql`SELECT * FROM facilities LIMIT 500`,
        neonSql`SELECT * FROM announcements LIMIT 500`,
        neonSql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`,
        neonSql`SELECT * FROM settings LIMIT 50`,
      ]);

      backupPayload.tables = {
        propertiesCount: properties.length,
        properties,
        invoicesCount: invoices.length,
        invoices,
        ledgerCount: ledger.length,
        ledger,
        complaintsCount: complaints.length,
        complaints,
        facilitiesCount: facilities.length,
        facilities,
        announcementsCount: announcements.length,
        announcements,
        auditLogsCount: auditLogs.length,
        auditLogs,
        settings,
      };

      await recordAuditLog({
        actorName: 'Ketua Komplek / Admin',
        action: 'system.backup_export',
        entityType: 'FULL_DATABASE_BACKUP',
        entityId: `backup-${Date.now()}`,
        newValue: { recordCounts: { properties: properties.length, invoices: invoices.length, ledger: ledger.length } },
      });
    }

    return new Response(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="wargahub-backup-${new Date().toISOString().substring(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: { code: 'BACKUP_FAILED', message: err.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
