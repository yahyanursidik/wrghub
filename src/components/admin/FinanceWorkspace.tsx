/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import type { ReactNode } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, FileMinus, Receipt, Wallet, X, type LucideIcon } from 'lucide-react';
import { apiFetch } from '../../lib/api-fetch';
import { ModalDialog } from '../shared/ModalDialog';

export const financeField = 'mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal text-ink';
export const financeButton = 'btn-secondary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';
export const financePrimary = 'btn-primary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';

export interface FinanceHouse {
  id: string;
  code: string;
  name?: string;
  block: string;
  occupancy: string;
}

const areas = [
  { id:'billing', name:'Tagihan', icon:Receipt },
  { id:'payments', name:'Pembayaran', icon:CreditCard },
  { id:'expenses', name:'Pengeluaran', icon:FileMinus },
  { id:'ledger', name:'Buku kas', icon:Wallet },
] as const;

export function FinanceHeader({area, title, children, canViewPayments = true}: {
  area:typeof areas[number]['id']; title:string; children?:ReactNode; canViewPayments?:boolean;
}) {
  return <header className="grid min-w-0 gap-4">
    <nav aria-label="Alur keuangan" className="flex flex-wrap items-center gap-1.5">
      {areas.filter(item=>item.id!=='payments' || canViewPayments).map(({id,name,icon:Icon})=><a key={id} href={`/admin/${id}`}
        aria-current={id===area?'page':undefined}
        className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold sm:px-3 ${id===area?'bg-primary-100 text-primary-800':'text-ink-muted hover:bg-surface hover:text-ink'}`}>
        <Icon className="hidden size-4 sm:block" aria-hidden="true" />{name}
      </a>)}
    </nav>
    <div className="workspace-heading">
      <h1>{title}</h1>
      {children && <div className="flex min-w-0 flex-wrap gap-2">{children}</div>}
    </div>
  </header>;
}

export function FinanceTabs<T extends string>({tabs, active, change, label}: {
  tabs:readonly {id:T;label:string;icon:LucideIcon;count?:number}[]; active:T; change:(tab:T)=>void; label:string;
}) {
  return <nav aria-label={label} className="flex flex-wrap gap-1.5 border-b border-border pb-2">
    {tabs.map(({id,label:tabLabel,icon:Icon,count})=><button key={id} type="button" aria-pressed={active===id} onClick={()=>change(id)}
      className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold ${active===id?'bg-primary-700 text-white':'text-ink-muted hover:bg-surface hover:text-ink'}`}>
      <Icon className="size-4" aria-hidden="true" />{tabLabel}
      {count!==undefined && count>0 && <span className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${active===id?'bg-white/20':'bg-amber-100 text-amber-900'}`}>{count}</span>}
    </button>)}
  </nav>;
}

export function FinanceTabLinks({tabs, active, label}: {
  tabs:readonly {id:string;label:string;icon:LucideIcon;href:string}[];active:string;label:string;
}) {
  return <nav aria-label={label} className="grid grid-cols-2 gap-1.5 border-b border-border pb-2 sm:flex sm:flex-wrap">
    {tabs.map(({id,label:tabLabel,icon:Icon,href})=><a key={id} href={href} aria-current={active===id?'page':undefined}
      className={`inline-flex min-h-11 min-w-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold min-[400px]:text-sm sm:px-3 ${active===id?'bg-primary-700 text-white':'text-ink-muted hover:bg-surface hover:text-ink'}`}>
      <Icon className="hidden size-4 shrink-0 min-[460px]:block" aria-hidden="true" />{tabLabel}
    </a>)}
  </nav>;
}

const tones = {
  mint:'bg-primary-50 text-primary-900', amber:'bg-amber-50 text-amber-900', sky:'bg-sky-50 text-sky-900',
  rose:'bg-rose-50 text-rose-900', slate:'bg-slate-100 text-slate-800',
};

const statuses: Record<string,{label:string;tone:keyof typeof tones}> = {
  PAID:{label:'Lunas',tone:'mint'}, VERIFIED:{label:'Terverifikasi',tone:'mint'},
  UNPAID:{label:'Belum bayar',tone:'amber'}, OVERDUE:{label:'Jatuh tempo',tone:'rose'},
  PENDING:{label:'Menunggu',tone:'sky'}, PENDING_VERIFICATION:{label:'Menunggu cek',tone:'sky'},
  PARTIAL:{label:'Sebagian',tone:'sky'}, REJECTED:{label:'Ditolak',tone:'rose'}, REVERSED:{label:'Dibalik',tone:'rose'},
  CANCELLED:{label:'Dibatalkan',tone:'slate'}, VOID:{label:'Dibatalkan',tone:'slate'}, WAIVED:{label:'Dibebaskan',tone:'slate'},
  APPROVED:{label:'Dibukukan',tone:'mint'}, DRAFT:{label:'Draf',tone:'sky'}, UNLINKED:{label:'Perlu cek jurnal',tone:'amber'},
  PLANNED:{label:'Direncanakan',tone:'sky'}, IN_PROGRESS:{label:'Berjalan',tone:'amber'}, COMPLETED:{label:'Selesai',tone:'mint'},
  READY:{label:'Siap dicatat',tone:'mint'}, BOOKED:{label:'Sudah tercatat',tone:'mint'}, NOT_DUE:{label:'Belum jatuh tempo',tone:'slate'}, UNAVAILABLE:{label:'Periksa konfigurasi',tone:'amber'},
  MATCHED:{label:'Cocok',tone:'mint'}, DIFFERENT:{label:'Ada selisih',tone:'rose'}, STALE:{label:'Perlu cek ulang',tone:'amber'}, UNREVIEWED:{label:'Belum diperiksa',tone:'slate'},
};

export function FinanceStatus({value}: {value:string}) {
  const status = statuses[value] || {label:'Status belum dikenali',tone:'slate' as const};
  return <span className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status.tone]}`}>
    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />{status.label}
  </span>;
}

export function FinanceSummary({items}: {items:{label:string;value:ReactNode;detail?:ReactNode;tone:keyof typeof tones}[]}) {
  return <dl className="grid min-w-0 grid-cols-2 gap-2 [&>div:first-child]:col-span-2 sm:grid-cols-3 sm:gap-3 sm:[&>div:first-child]:col-span-1">
    {items.map(item=><div key={item.label} className={`grid min-w-0 gap-1 rounded-xl px-3 py-3 sm:px-4 ${tones[item.tone]}`}>
      <dt className="text-sm font-semibold">{item.label}</dt>
      <dd className="text-lg font-bold tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-2xl">{item.value}</dd>
      {item.detail!==undefined && <dd className="text-xs">{item.detail}</dd>}
    </div>)}
  </dl>;
}

export function FinanceEmpty({children, action}: {children:ReactNode;action?:ReactNode}) {
  return <div className="grid justify-items-start gap-2 rounded-xl border border-dashed border-border-dark bg-surface p-5 text-sm text-ink-muted">
    <p>{children}</p>{action}
  </div>;
}

export function FinancePager({total, page, pageSize, onChange, label}: {
  total:number;page:number;pageSize:number;onChange:(page:number)=>void;label:string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (!total) return null;
  return <nav aria-label={`Halaman ${label}`} className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-sm text-ink-muted sm:px-4">
    <p className="tabular-nums">{(page-1)*pageSize+1}–{Math.min(page*pageSize,total)} dari {total}</p>
    {pages>1 && <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Halaman sebelumnya" className="icon-button disabled:opacity-40" disabled={page===1} onClick={()=>onChange(page-1)}><ChevronLeft className="size-5" /></button>
      <span className="whitespace-nowrap tabular-nums">{page} / {pages}</span>
      <button type="button" aria-label="Halaman berikutnya" className="icon-button disabled:opacity-40" disabled={page===pages} onClick={()=>onChange(page+1)}><ChevronRight className="size-5" /></button>
    </div>}
  </nav>;
}

export function FinanceDialog({open, title, close, busy, error, children}: {
  open:boolean;title:string;close:()=>void;busy?:boolean;error?:string;children:ReactNode;
}) {
  return <ModalDialog open={open} onClose={()=>{if(!busy) close();}} label={title} className="w-[min(38rem,calc(100vw-1.5rem))]">
    <div className="grid gap-4 p-4 sm:p-5">
      <header className="flex min-w-0 items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight [overflow-wrap:anywhere]">{title}</h2>
        <button type="button" className="icon-button" onClick={close} disabled={busy} aria-label="Tutup"><X className="size-5" /></button>
      </header>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      {children}
    </div>
  </ModalDialog>;
}

export function FinanceScope({children, clear}: {children:ReactNode;clear:()=>void}) {
  return <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-900">
    <p className="min-w-0 font-medium [overflow-wrap:anywhere]">{children}</p>
    <button type="button" onClick={clear} className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap font-semibold hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />Lihat semua
    </button>
  </div>;
}

export async function financePost<T>(path:string, input:object): Promise<T> {
  const response = await apiFetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
  return (await response.json()).data;
}
