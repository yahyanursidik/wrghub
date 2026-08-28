import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
//#region src/pages/transparency/current.ts
var current_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	return new Response(null, {
		status: 302,
		headers: { Location: "/transparency/2026/08" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/transparency/current@_@ts
var page = () => current_exports;
//#endregion
export { page };
