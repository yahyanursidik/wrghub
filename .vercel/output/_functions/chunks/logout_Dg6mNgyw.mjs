import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
//#region src/pages/api/auth/logout.ts
var logout_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ cookies }) => {
	cookies.delete("wargahub_user", { path: "/" });
	return new Response(JSON.stringify({
		data: { message: "Berhasil keluar." },
		meta: {},
		error: null
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/logout@_@ts
var page = () => logout_exports;
//#endregion
export { page };
