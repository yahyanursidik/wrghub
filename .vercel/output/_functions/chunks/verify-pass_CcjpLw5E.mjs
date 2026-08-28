import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import "./neon_DiYtP58s.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/security/verify-pass.ts
var verify_pass_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var verifySchema = z.object({
	qrPayload: z.string(),
	scannedBy: z.string().default("Petugas Pos Satpam Utama"),
	gateLocation: z.string().default("Gerbang Utama (Pos 1)")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = verifySchema.parse(body);
		let verificationResult = {
			isValid: true,
			type: "RESIDENT_RECEIPT",
			title: "Kuitansi Iuran Resmi Terverifikasi",
			propertyCode: "A-17",
			residentName: "Budi Santoso",
			periodName: "Agustus 2026",
			amount: 75e4,
			status: "LUNAS (TERVERIFIKASI)",
			verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (validated.qrPayload.toUpperCase().includes("INV-")) {
			const match = validated.qrPayload.match(/INV-\d+-([A-Z0-9]+)/i);
			if (match) verificationResult.propertyCode = match[1].replace(/(\D+)(\d+)/, "$1-$2");
		} else if (validated.qrPayload.toUpperCase().includes("GUEST") || validated.qrPayload.toUpperCase().includes("TAMU")) verificationResult = {
			isValid: true,
			type: "VISITOR_PASS",
			title: "Visitor Pass Tamu Terverifikasi",
			propertyCode: "B-07",
			residentName: "Tamu Keluarga Hendra Wijaya",
			periodName: "Akses Masuk 1x 24 Jam",
			amount: 0,
			status: "IZIN MASUK DITERBITKAN",
			verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: validated.scannedBy,
			action: "security.scan_pass",
			entityType: "SECURITY_GATE_PASS",
			entityId: `scan-${Date.now()}`,
			newValue: {
				payload: validated.qrPayload,
				result: verificationResult.status,
				gate: validated.gateLocation
			}
		});
		return new Response(JSON.stringify({
			data: verificationResult,
			meta: {},
			error: null
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "VERIFICATION_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/security/verify-pass@_@ts
var page = () => verify_pass_exports;
//#endregion
export { page };
