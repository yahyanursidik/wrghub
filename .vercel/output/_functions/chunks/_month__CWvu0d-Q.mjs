import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate, x as createAstro } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { n as TransparencyView, t as getPublicMonthlyReport } from "./transparency.service_Dn_pcprA.mjs";
//#region src/pages/transparency/[year]/[month].astro
var _month__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Month,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Month = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Month;
	const { year, month } = Astro.params;
	const reportData = await getPublicMonthlyReport(parseInt(year || "2026", 10), parseInt(month || "8", 10));
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": `Laporan Transparansi Warga - ${reportData.periodName}`,
		"currentPath": "/transparency"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "TransparencyView", TransparencyView, {
		"initialData": reportData,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/transparency/TransparencyView.tsx",
		"client:component-export": "TransparencyView"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/transparency/[year]/[month].astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/transparency/[year]/[month].astro";
var $$url = "/transparency/[year]/[month]";
//#endregion
//#region \0virtual:astro:page:src/pages/transparency/[year]/[month]@_@astro
var page = () => _month__exports;
//#endregion
export { page };
