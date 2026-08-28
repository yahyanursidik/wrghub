import { r as ShieldCheck } from "./global_DI05LtBp.mjs";
import { n as X } from "./WargaAIChatWidget_Mi3cfDtB.mjs";
import { t as CircleCheck } from "./circle-check_BAe-ea2u.mjs";
import { t as Printer } from "./printer_DTnpkCgr.mjs";
import { t as QrCode } from "./qr-code_CWniIOgo.mjs";
import { t as formatRupiah } from "./format__FbuMwbk.mjs";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/shared/ReceiptModal.tsx
var ReceiptModal = ({ isOpen, onClose, data }) => {
	if (!isOpen) return null;
	const handlePrint = () => {
		window.print();
	};
	const receiptNo = data.receiptNumber || `KW-${data.periodName.replace(" ", "")}-${data.propertyCode.replace("-", "")}`;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-border shadow-modal relative max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none",
			children: [
				/* @__PURE__ */ jsx("button", {
					onClick: onClose,
					className: "absolute top-4 right-4 p-2 text-ink-muted hover:text-ink hover:bg-canvas rounded-full print:hidden",
					children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-b border-border pb-4 text-center space-y-1",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-800 mb-1",
							children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-lg font-bold tracking-tight text-ink",
							children: "KOMPLEK TAMAN SEJAHTERA"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-ink-muted",
							children: "Rukun Tetangga 02 / Rukun Warga 05 • Kelurahan Melati, Jakarta Selatan 12340"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-2",
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200",
								children: "Kuitansi Resmi Pembayaran IPL"
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "py-4 border-b border-dashed border-border text-xs space-y-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-ink-muted",
								children: "No. Kuitansi:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono font-bold text-ink",
								children: receiptNo
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-ink-muted",
								children: "No. Invoice:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono text-ink",
								children: data.invoiceNumber
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-ink-muted",
								children: "Waktu Pembayaran:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-ink",
								children: data.paidAt
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-ink-muted",
								children: "Metode / Ref:"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-medium text-ink",
								children: [
									data.paymentMethod,
									" • ",
									data.referenceNumber
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "py-4 border-b border-border space-y-3 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "text-ink-muted block text-[11px]",
							children: "Telah Diterima Dari:"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-sm font-bold text-ink",
							children: [
								data.residentName,
								" (Rumah ",
								data.propertyCode,
								")"
							]
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-ink-muted block text-[11px]",
								children: "Untuk Pembayaran:"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "font-medium text-ink",
								children: ["Iuran Pengelolaan Lingkungan (IPL) Periode ", /* @__PURE__ */ jsx("strong", { children: data.periodName })]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[10px] text-ink-muted",
								children: "(Mencakup operasional keamanan 24 jam, kebersihan sampah, penerangan jalan fasum, dan perawatan sarana)."
							})
						] }),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-canvas rounded-xl flex items-center justify-between border border-border",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-bold text-ink",
								children: "Total Nominal Dibayar:"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-base font-extrabold text-primary-700 tabular-nums",
								children: formatRupiah(data.amount)
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pt-4 flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-14 h-14 bg-canvas border border-border rounded-xl flex items-center justify-center p-1",
							children: /* @__PURE__ */ jsx(QrCode, { className: "w-10 h-10 text-primary-800" })
						}), /* @__PURE__ */ jsxs("div", {
							className: "text-[10px] text-ink-muted",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "font-bold text-emerald-700 block text-xs flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(CircleCheck, { className: "w-3.5 h-3.5" }), " LUNAS / VERIFIED"]
							}), /* @__PURE__ */ jsx("span", { children: "Kuitansi elektronik sah terbitan WargaHub." })]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-right text-[11px]",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-ink-muted",
							children: "Bendahara Komplek,"
						}), /* @__PURE__ */ jsx("p", {
							className: "font-bold text-ink mt-6 underline",
							children: "Hendra Wijaya"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 pt-4 border-t border-border flex items-center justify-end gap-3 print:hidden",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "px-4 py-2 border border-border hover:bg-canvas text-ink text-xs font-semibold rounded-xl",
						children: "Tutup"
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handlePrint,
						className: "px-4 py-2 bg-primary-600 hover:bg-primary-700 text-surface text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors",
						children: [/* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }), "Cetak / Simpan PDF"]
					})]
				})
			]
		})
	});
};
//#endregion
export { ReceiptModal as t };
