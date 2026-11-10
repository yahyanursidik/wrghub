/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, Receipt, X } from 'lucide-react';
import { financeDate, financePath, type TariffComponent } from '../../lib/billing-data';
import { formatRupiah } from '../../lib/format';
import { ModalDialog } from './ModalDialog';

export interface ReceiptModalData {
  receiptNumber?: string;
  invoiceNumber: string;
  periodName: string;
  propertyCode: string;
  residentName: string;
  amount: number;
  paidAt?: string | null;
  dueDate?: string | null;
  status?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  isInvoice?: boolean;
  items?: TariffComponent[];
  paidAmount?: number;
  remaining?: number;
  bankInfo?: {bankName:string;accountNumber:string;accountHolder?:string};
  accountName?: string;
  notes?: string;
}

interface Props {isOpen:boolean;onClose:()=>void;data:ReceiptModalData}
type Verification='pending'|'matched'|'unmatched'|'unavailable';

export function ReceiptModal({isOpen,onClose,data}:Props) {
  return isOpen && typeof document!=='undefined'
    ? createPortal(<PaymentDocument data={data} onClose={onClose} />,document.body) : null;
}

function PaymentDocument({data,onClose}:Omit<Props,'isOpen'>) {
  const receiptId=data.isInvoice?undefined:data.receiptNumber;
  const title=receiptId?'Kuitansi pembayaran':'Surat tagihan';
  const [verification,setVerification]=useState<Verification>('pending');
  const [qr,setQr]=useState('');
  const [retry,setRetry]=useState(0);
  const path=receiptId?financePath('/kuitansi',{q:receiptId}):'';
  useEffect(()=>{
    if(!receiptId) return;
    const controller=new AbortController();
    setVerification('pending');setQr('');
    import('qrcode').then(module=>module.default.toDataURL(window.location.origin+path,{width:160,margin:1}))
      .then(image=>{if(!controller.signal.aborted) setQr(image);}).catch(()=>{});
    fetch('/api/receipts/verify?q='+encodeURIComponent(receiptId),{signal:controller.signal,cache:'no-store'})
      .then(async response=>{
        if(response.status===404) return 'unmatched';
        if(!response.ok) return 'unavailable';
        const {data:payment}=await response.json();
        return payment?.receiptNumber===receiptId && payment?.propertyCode===data.propertyCode &&
          Number(payment?.amount)===data.amount ? 'matched':'unmatched';
      }).then(result=>{if(!controller.signal.aborted) setVerification(result);})
      .catch(()=>{if(!controller.signal.aborted) setVerification('unavailable');});
    return ()=>controller.abort();
  },[receiptId,path,data.amount,data.propertyCode,retry]);

  const items=data.items?.length?data.items:[{name:receiptId?'Pembayaran iuran':'Iuran lingkungan',amount:data.amount}];
  const canPrint=!receiptId || verification==='matched';
  const Icon=receiptId?Receipt:FileText;
  const financeButton='btn-secondary inline-flex min-h-11 items-center gap-2 whitespace-nowrap';
  return <ModalDialog open onClose={onClose} label={title} className="finance-doc w-[min(36rem,calc(100vw-1.5rem))]">
    <style>{'@media print { body:has(dialog.finance-doc[open]) { display:block!important;overflow:visible!important; } body:has(dialog.finance-doc[open]) > :not(dialog.finance-doc) { display:none!important; } dialog.finance-doc[open] { display:block!important;position:static;inset:auto;width:100%;max-width:none;max-height:none;margin:0;overflow:visible;border:0;box-shadow:none; } dialog.finance-doc::backdrop { display:none; } }'}</style>
    <article className="grid min-w-0 gap-4 p-4 sm:p-6">
      <header className="flex min-w-0 items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary-800"><Icon className="size-4" aria-hidden="true" />WargaHub</p>
          <h2 className="text-xl font-bold tracking-tight [overflow-wrap:anywhere]">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted [overflow-wrap:anywhere]">{receiptId || data.invoiceNumber}</p>
        </div>
        <button type="button" className="icon-button print:hidden" onClick={onClose} aria-label="Tutup"><X className="size-5" /></button>
      </header>
      <dl className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <dt>Rumah</dt><dd className="font-semibold [overflow-wrap:anywhere]">{data.propertyCode}</dd>
        <dt>Nama</dt><dd className="[overflow-wrap:anywhere]">{data.residentName}</dd>
        <dt>Periode</dt><dd className="[overflow-wrap:anywhere]">{data.periodName}</dd>
        {receiptId ? <>
          <dt>Tagihan</dt><dd className="[overflow-wrap:anywhere]">{data.invoiceNumber}</dd>
          <dt>Tanggal bayar</dt><dd>{financeDate(data.paidAt)}</dd>
          {data.paymentMethod && <><dt>Metode</dt><dd>{data.paymentMethod}</dd></>}
          {data.referenceNumber && <><dt>Referensi</dt><dd className="[overflow-wrap:anywhere]">{data.referenceNumber}</dd></>}
          {data.accountName && <><dt>Rekening</dt><dd className="[overflow-wrap:anywhere]">{data.accountName}</dd></>}
        </> : <><dt>Jatuh tempo</dt><dd>{financeDate(data.dueDate)}</dd>
          {data.status==='PAID' && <><dt>Status</dt><dd>Lunas</dd></>}
          {data.status==='WAIVED' && <><dt>Status</dt><dd>Dibebaskan</dd></>}
          {['VOID','CANCELLED'].includes(data.status || '') && <><dt>Status</dt><dd>Dibatalkan</dd></>}
        </>}
      </dl>
      <ul className="divide-y divide-border border-y border-border">
        {items.map((item,index)=><li key={index} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 text-sm">
          <span className="[overflow-wrap:anywhere]">{item.name}</span><span className="font-semibold tabular-nums">{formatRupiah(item.amount)}</span>
        </li>)}
      </ul>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-lg bg-primary-50 p-3 text-sm tabular-nums">
        <dt className="font-semibold">{receiptId?'Jumlah dibayar':'Total tagihan'}</dt><dd className="font-bold">{formatRupiah(data.amount)}</dd>
        {!receiptId && data.paidAmount!==undefined && <><dt>Diterima</dt><dd>{formatRupiah(data.paidAmount)}</dd></>}
        {!receiptId && data.remaining!==undefined && <><dt>Sisa</dt><dd className="font-bold">{formatRupiah(data.remaining)}</dd></>}
      </dl>
      {!receiptId && data.bankInfo && (data.remaining ?? data.amount)>0 && <p className="text-sm [overflow-wrap:anywhere]">
        <strong>Rekening penerima</strong><br />{[data.bankInfo.bankName,data.bankInfo.accountNumber,data.bankInfo.accountHolder].filter(Boolean).join(' · ')}
      </p>}
      {data.notes && <p className="whitespace-pre-wrap text-sm text-ink-muted [overflow-wrap:anywhere]">{data.notes}</p>}
      {receiptId && <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-border p-3 text-sm">
        {qr && verification==='matched' && <a href={path} target="_blank" rel="noopener noreferrer" aria-label="Verifikasi kuitansi">
          <img src={qr} width={64} height={64} alt="QR verifikasi kuitansi" />
        </a>}
        <div className="min-w-0">
          <p role="status" className="font-semibold">{{
            pending:'Memeriksa kuitansi…',matched:'Pembayaran terverifikasi',
            unmatched:'Kuitansi tidak lagi sah atau datanya tidak cocok',unavailable:'Verifikasi belum tersedia',
          }[verification]}</p>
          <a href={path} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-primary-800 underline">Buka verifikasi</a>
        </div>
        {verification==='unavailable' && <button type="button" className={financeButton} onClick={()=>setRetry(value=>value+1)}>Coba lagi</button>}
      </div>}
      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" disabled={!canPrint} onClick={()=>window.print()}
          className="btn-primary inline-flex min-h-11 items-center gap-2 whitespace-nowrap"><Printer className="size-4" aria-hidden="true" />Cetak / PDF</button>
        <button type="button" className={financeButton} onClick={onClose}>Tutup</button>
      </div>
    </article>
  </ModalDialog>;
}
