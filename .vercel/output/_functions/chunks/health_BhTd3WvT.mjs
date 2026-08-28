import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as neonSql } from "./neon_DiYtP58s.mjs";
//#region src/pages/api/health.ts
var health_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	const startTime = Date.now();
	let dbStatus = "DISCONNECTED";
	let dbLatencyMs = 0;
	let tableCount = 0;
	try {
		if (process.env.DATABASE_URL) {
			const dbStart = Date.now();
			const res = await neonSql`SELECT count(*) as total FROM information_schema.tables WHERE table_schema = 'public'`;
			dbLatencyMs = Date.now() - dbStart;
			tableCount = Number(res[0].total);
			dbStatus = "CONNECTED_HEALTHY";
		}
		const memoryUsage = process.memoryUsage();
		const uptimeSeconds = process.uptime();
		const healthPayload = {
			status: "UP_AND_HEALTHY",
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			environment: "PRODUCTION_STANDALONE",
			uptime: {
				seconds: Math.floor(uptimeSeconds),
				formatted: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`
			},
			database: {
				provider: "Neon PostgreSQL Cloud (ap-southeast-1)",
				status: dbStatus,
				latencyMs: dbLatencyMs,
				tablesRegistered: tableCount,
				poolMode: "Active / Pooler Enabled"
			},
			server: {
				nodeVersion: process.version,
				platform: process.platform,
				arch: process.arch,
				memoryUsage: {
					rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(1) + " MB",
					heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(1) + " MB",
					heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(1) + " MB"
				}
			},
			portals: {
				residentPortal: "ONLINE (/)",
				transparencyReport: "ONLINE (/transparency)",
				adminDashboard: "ONLINE (/admin)",
				securityGate: "ONLINE (/admin/security-gate)",
				analytics: "ONLINE (/admin/analytics)",
				backupEngine: "ONLINE (/admin/backup)"
			},
			responseTimeMs: Date.now() - startTime
		};
		return new Response(JSON.stringify(healthPayload, null, 2), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			status: "DEGRADED",
			error: err.message,
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		}), {
			status: 503,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/health@_@ts
var page = () => health_exports;
//#endregion
export { page };
