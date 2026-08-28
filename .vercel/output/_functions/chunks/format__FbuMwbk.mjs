//#region src/lib/format.ts
function formatRupiah(amount) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount).replace(/\s+/g, "");
}
//#endregion
export { formatRupiah as t };
