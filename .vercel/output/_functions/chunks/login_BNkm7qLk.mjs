import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { f as renderHead, i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import "./global_DI05LtBp.mjs";
import { t as UnifiedLoginView } from "./UnifiedLoginView_C0-ZkMv6.mjs";
//#region src/pages/admin/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
var $$Login = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Login Pengurus & Admin - WargaHub</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead($$result)}</head><body class="bg-canvas text-ink font-sans min-h-screen antialiased selection:bg-primary-100 selection:text-primary-900">${renderComponent($$result, "UnifiedLoginView", UnifiedLoginView, {
		"initialPortal": "admin",
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "C:/Users/P R E D A T O R/Documents/wargahub/src/components/auth/UnifiedLoginView.tsx",
		"client:component-export": "UnifiedLoginView"
	})}</body></html>`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/login.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/login.astro";
var $$url = "/admin/login";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/login@_@astro
var page = () => login_exports;
//#endregion
export { page };
