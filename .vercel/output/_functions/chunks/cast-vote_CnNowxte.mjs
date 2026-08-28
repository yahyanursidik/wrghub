import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as recordAuditLog } from "./audit.service_D4o7GGen.mjs";
import { z } from "zod";
//#region src/pages/api/voting/cast-vote.ts
var cast_vote_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var voteSchema = z.object({
	targetType: z.enum(["ELECTION", "POLL"]),
	targetId: z.string(),
	choiceId: z.string(),
	propertyCode: z.string().default("A-17"),
	voterName: z.string().default("Budi Santoso")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const validated = voteSchema.parse(body);
		const voteReceipt = {
			voteId: `VOTE-${Date.now()}-${validated.propertyCode.replace("-", "")}`,
			targetType: validated.targetType,
			targetId: validated.targetId,
			choiceId: validated.choiceId,
			propertyCode: validated.propertyCode,
			voterName: validated.voterName,
			status: "RECORDED_AND_VERIFIED",
			castAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (process.env.DATABASE_URL) await recordAuditLog({
			actorName: validated.voterName,
			action: "voting.cast_vote",
			entityType: validated.targetType === "ELECTION" ? "RW_ELECTION_VOTE" : "COMMUNITY_POLL_VOTE",
			entityId: voteReceipt.voteId,
			newValue: {
				targetId: validated.targetId,
				choiceId: validated.choiceId,
				house: validated.propertyCode
			}
		});
		return new Response(JSON.stringify({
			data: voteReceipt,
			meta: {},
			error: null
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			data: null,
			error: {
				code: "VOTE_FAILED",
				message: err.message
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/voting/cast-vote@_@ts
var page = () => cast_vote_exports;
//#endregion
export { page };
