import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as authenticateUser } from "./auth.service_CycQzLZv.mjs";
import { z } from "zod";
//#region src/pages/api/auth/login.ts
var login_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var loginSchema = z.object({
	identifier: z.string().min(1, "Username atau No. Rumah wajib diisi"),
	password: z.string().min(1, "Password / PIN wajib diisi"),
	portal: z.enum([
		"resident",
		"admin",
		"any"
	]).default("any")
});
var POST = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { identifier, password, portal } = loginSchema.parse(body);
		const result = await authenticateUser(identifier, password);
		if (!result.success || !result.user) return new Response(JSON.stringify({
			data: null,
			error: {
				code: "AUTH_FAILED",
				message: result.error || "Login gagal."
			}
		}), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const user = result.user;
		const isAdminRole = [
			"SUPER_ADMIN",
			"CHAIRMAN",
			"SECRETARY",
			"TREASURER",
			"RESIDENT_ADMIN",
			"SECURITY"
		].includes(user.role);
		let redirectUrl = "/";
		if (portal === "admin" || isAdminRole && portal !== "resident") redirectUrl = user.role === "TREASURER" ? "/admin/payments" : user.role === "SECURITY" ? "/admin/complaints" : "/admin";
		else redirectUrl = "/";
		cookies.set("wargahub_user", JSON.stringify(user), {
			path: "/",
			httpOnly: false,
			maxAge: 604800,
			sameSite: "lax"
		});
		return new Response(JSON.stringify({
			data: {
				user,
				redirectUrl,
				message: `Selamat datang, ${user.fullName}!`
			},
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
				code: "INVALID_REQUEST",
				message: err.message || "Format data login salah."
			}
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/login@_@ts
var page = () => login_exports;
//#endregion
export { page };
