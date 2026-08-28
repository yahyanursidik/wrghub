import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_D9_Gh2WS.mjs";
import { t as createComponent } from "./compiler_CLQWMlUi.mjs";
import { t as $$AdminLayout } from "./AdminLayout_CzR5wuim.mjs";
import { t as getAuditLogs } from "./audit.service_D4o7GGen.mjs";
//#region src/pages/admin/notifications.astro
var notifications_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Notifications,
	file: () => $$file,
	url: () => $$url
});
var $$Notifications = createComponent(async ($$result, $$props, $$slots) => {
	const auditLogs = await getAuditLogs(50);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Pusat Notifikasi & Audit Trail - WargaHub",
		"currentPath": "/admin/notifications"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="space-y-6"><div><h1 class="text-2xl font-bold tracking-tight text-ink">Histori Aktivitas & Audit Trail</h1><p class="text-sm text-ink-muted mt-1">Log rekam jejak setiap aksi penting (verifikasi, pengeluaran, pengumuman).</p></div><div class="bg-surface rounded-2xl border border-border shadow-card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-xs text-left"><thead><tr class="border-b border-border bg-canvas/40 text-ink-muted font-semibold"><th class="py-3 px-4">Waktu</th><th class="py-3 px-4">Pelaku (Actor)</th><th class="py-3 px-4">Aksi</th><th class="py-3 px-4">Entitas</th><th class="py-3 px-4">Detail Perubahan</th></tr></thead><tbody class="divide-y divide-border/60">${auditLogs.map((log) => renderTemplate`<tr class="hover:bg-canvas/50 text-ink"><td class="py-3 px-4 font-mono text-ink-muted">${log.createdAt}</td><td class="py-3 px-4 font-semibold text-primary-700">${log.actorName}</td><td class="py-3 px-4"><span class="px-2 py-0.5 rounded-md bg-canvas border border-border font-mono text-[11px]">${log.action}</span></td><td class="py-3 px-4 font-semibold">${log.entityType}</td><td class="py-3 px-4 font-mono text-[11px] text-ink-muted max-w-xs truncate">${log.newValueJson || log.oldValueJson || "-"}</td></tr>`)}</tbody></table></div></div></div>` })}`;
}, "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/notifications.astro", void 0);
var $$file = "C:/Users/P R E D A T O R/Documents/wargahub/src/pages/admin/notifications.astro";
var $$url = "/admin/notifications";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/notifications@_@astro
var page = () => notifications_exports;
//#endregion
export { page };
