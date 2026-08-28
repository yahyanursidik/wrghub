import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { n as TransparencyView, t as getPublicMonthlyReport } from "./transparency.service_Dn_pcprA.mjs";
//#region src/pages/transparency/index.astro
var transparency_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const reportData = await getPublicMonthlyReport(2026, 8);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Laporan Transparansi Warga - WargaHub",
		"currentPath": "/transparency"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "TransparencyView", TransparencyView, {
		"initialData": reportData,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/transparency/TransparencyView.tsx",
		"client:component-export": "TransparencyView"
	})}` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/transparency/index.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/transparency/index.astro";
var $$url = "/transparency";
//#endregion
//#region \0virtual:astro:page:src/pages/transparency/index@_@astro
var page = () => transparency_exports;
//#endregion
export { page };
