import { useMemo, useState, type ReactNode } from 'react';
import { Copy, ExternalLink, RotateCcw, X } from 'lucide-react';
import {
  buildFinanceWhatsAppMessage, financeWhatsAppBank, financeWhatsAppLink, financeWhatsAppNumber, financeWhatsAppTemplates,
  getWhatsAppDuesReport, preferredWhatsAppPeriod, type FinanceWhatsAppProfile, type FinanceWhatsAppTemplate,
  type WhatsAppDuesInvoice, type WhatsAppDuesPeriod,
} from '../../lib/finance-whatsapp';
import { financeMonth, type CashPeriodSummary } from '../../lib/cash-data';
import { ModalDialog } from './ModalDialog';

type Source =
  {mode:'dues';periods:WhatsAppDuesPeriod[];invoices:WhatsAppDuesInvoice[];initialPeriodId:string} |
  {mode:'cash';summary:CashPeriodSummary;month:string} | {mode:'bank'};
type Props = Source & {onClose:()=>void;today:string;profile:FinanceWhatsAppProfile|null};

const field = 'mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal text-ink';
const secondary = 'btn-secondary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';
const primary = 'btn-primary inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap';
const duesTemplates = ['dues_detail','dues_summary','dues_thr','bank'] as const;
const greetings = [
  ['','Halo Bapak/Ibu warga,'],['Wilujeng wengi/pagi, Bapak/Ibu warga.','Wilujeng wengi/pagi'],
  ['Wilujeng enjing, Bapak/Ibu warga.','Wilujeng enjing'],['Wilujeng siang, Bapak/Ibu warga.','Wilujeng siang'],
  ['Wilujeng sonten, Bapak/Ibu warga.','Wilujeng sonten'],['Wilujeng wengi, Bapak/Ibu warga.','Wilujeng wengi'],
];

function Field({label,children}:{label:string;children:ReactNode}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}{children}</label>;
}

export function WhatsAppDuesReportModal(props:Props) {
  const {onClose,today,profile} = props;
  const periods = props.mode==='dues'?props.periods:undefined;
  const invoices = props.mode==='dues'?props.invoices:undefined;
  const [template,setTemplate] = useState<FinanceWhatsAppTemplate>(props.mode==='dues'?'dues_detail':props.mode);
  const [periodId,setPeriodId] = useState(props.mode==='dues'?preferredWhatsAppPeriod(props.periods,props.initialPeriodId,today)?.id || '':'');
  const [date,setDate] = useState(today);
  const [greeting,setGreeting] = useState('');
  const [title,setTitle] = useState('');
  const [notes,setNotes] = useState('');
  const [phone,setPhone] = useState('');
  const [includeUnits,setIncludeUnits] = useState(true);
  const [edited,setEdited] = useState<string|null>(null);
  const [notice,setNotice] = useState('');
  const selectedPeriod = periods?.find(item=>item.id===periodId);
  const dues = useMemo(()=>selectedPeriod && periods && invoices ? getWhatsAppDuesReport(selectedPeriod,periods,invoices) : null,[selectedPeriod,periods,invoices]);
  const bankAvailable = Boolean(financeWhatsAppBank(profile));
  const options = {date,greeting,title,notes,includeUnits,profile};
  const generated = template==='bank' ? buildFinanceWhatsAppMessage({template},options) :
    template==='cash' && props.mode==='cash' ? buildFinanceWhatsAppMessage({template,month:props.month,summary:props.summary},options) :
    template!=='cash' && dues ? buildFinanceWhatsAppMessage({template,report:dues},options) : '';
  const message = edited ?? generated;
  const recipientInvalid = financeWhatsAppNumber(phone)===null;
  const url = generated ? financeWhatsAppLink(message,phone) : null;
  const tooLong = Boolean(url && url.length>8000);
  const isDetailed = template==='dues_detail' || template==='dues_thr';
  const isDues = template!=='bank' && template!=='cash';
  const refreshDraft = ()=>{setEdited(null);setNotice('');};

  async function copy(value:string,kind:'message'|'link') {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(kind==='message'?'Pesan disalin.':'Tautan wa.me disalin.');
    } catch {setNotice('Papan klip tidak tersedia. Salin teks langsung dari pratinjau.');}
  }

  return <ModalDialog open onClose={onClose} label="Laporan WA (wa.me)" className="w-[min(42rem,calc(100vw-1.5rem))]">
    <div className="grid min-w-0 gap-3 p-4 sm:gap-4 sm:p-5">
      <header className="flex min-w-0 items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Laporan WA (wa.me)</h2>
        <button type="button" className="icon-button" aria-label="Tutup" onClick={onClose}><X className="size-5" aria-hidden="true" /></button>
      </header>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        {props.mode==='dues' ? <Field label="Template pesan">
          <select className={field} name="waTemplate" value={template} onChange={event=>{
            setTemplate(event.target.value as FinanceWhatsAppTemplate);setTitle('');refreshDraft();
          }}>
            {duesTemplates.map(value=><option key={value} value={value}>{financeWhatsAppTemplates[value]}</option>)}
          </select>
        </Field> : <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-900">{financeWhatsAppTemplates[template]}</div>}
        {isDues && <Field label="Periode laporan">
          <select className={field} name="waPeriod" value={periodId} disabled={!periods?.length} onChange={event=>{setPeriodId(event.target.value);refreshDraft();}}>
            {!periods?.length && <option value="">Belum ada periode</option>}
            {periods?.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>}
        {props.mode==='cash' && <p className="flex items-center rounded-lg bg-canvas px-3 py-2 text-sm font-semibold">{financeMonth(props.month)}</p>}
      </div>

      {template==='bank' && !bankAvailable ? <div role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Rekening resmi belum tersedia. <a className="font-semibold underline" href="/admin/ledger?tab=accounts_manage">Kelola rekening</a>
      </div> : !generated ? <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Belum ada periode tagihan untuk dibuatkan laporan.</p> : <>
        <details className="rounded-lg border border-border bg-surface px-3">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold"><span>Sesuaikan pesan dan nomor tujuan</span></summary>
          <div className="grid min-w-0 gap-2 pb-3 sm:grid-cols-2">
            <Field label="Tanggal laporan">
              <input className={field} name="waDate" type="date" value={date} onChange={event=>{setDate(event.target.value);refreshDraft();}} />
            </Field>
            <Field label="Sapaan">
              <select className={field} value={greeting} onChange={event=>{setGreeting(event.target.value);refreshDraft();}}>
                {greetings.map(([value,label])=><option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <div className="min-w-0 sm:col-span-2"><Field label="Nomor WhatsApp tujuan (opsional)">
              <input type="tel" className={field} name="waPhone" inputMode="tel" autoComplete="off" placeholder="08… atau +62…" maxLength={30}
                value={phone} aria-invalid={recipientInvalid} onChange={event=>{setPhone(event.target.value);setNotice('');}} />
            </Field>
              {recipientInvalid ? <p role="alert" className="mt-1 text-xs text-rose-800">Masukkan nomor WhatsApp yang valid.</p> :
                <p className="mt-1 text-xs text-ink-muted">Kosongkan untuk memilih kontak atau grup di WhatsApp.</p>}
            </div>
            <div className="min-w-0 sm:col-span-2"><Field label="Judul khusus (opsional)">
              <input className={field} maxLength={160} value={title} placeholder={financeWhatsAppTemplates[template]}
                onChange={event=>{setTitle(event.target.value);refreshDraft();}} />
            </Field></div>
            <div className="min-w-0 sm:col-span-2"><Field label={template==='dues_thr'?'Catatan THR (opsional)':'Catatan pengurus (opsional)'}>
              <textarea className={field} rows={2} maxLength={500} value={notes} onChange={event=>{setNotes(event.target.value);refreshDraft();}} />
            </Field></div>
            {isDetailed && <label className="flex min-h-11 items-center gap-2 text-sm font-semibold sm:col-span-2">
              <input type="checkbox" checked={includeUnits} onChange={event=>{setIncludeUnits(event.target.checked);refreshDraft();}} />
              Sertakan daftar kode rumah
            </label>}
          </div>
        </details>
        <Field label="Pratinjau pesan">
          <textarea className={field+' min-h-44 resize-y bg-canvas [overflow-wrap:anywhere]'} name="waMessage" value={message} rows={8}
            onChange={event=>{setEdited(event.target.value);setNotice('');}} spellCheck={false} />
        </Field>
        {edited!==null && <button type="button" onClick={refreshDraft} className={secondary+' justify-self-start'}>
          <RotateCcw className="size-4" aria-hidden="true" />Pulihkan teks template
        </button>}
        {tooLong && <p role="status" className="text-sm text-amber-900">Pesan terlalu panjang untuk tautan. Salin pesannya atau pilih template ringkasan.</p>}
        <div className="flex flex-wrap gap-2">
          {url && !tooLong ? <a className={primary} href={url} target="_blank" rel="noopener noreferrer" data-astro-reload>
            Buka di WhatsApp (wa.me) <ExternalLink className="size-4" aria-hidden="true" />
          </a> : <button type="button" className={primary+' opacity-60'} disabled>Buka di WhatsApp (wa.me)</button>}
          <button type="button" className={secondary} disabled={!message.trim()} onClick={()=>void copy(message.trim(),'message')}>
            <Copy className="size-4" aria-hidden="true" />Salin pesan
          </button>
          <button type="button" className={secondary} disabled={!url || tooLong} onClick={()=>{if(url) void copy(url,'link');}}>Salin tautan</button>
        </div>
        <p className="text-xs text-ink-muted">Periksa isi dan tujuan sebelum mengirim di WhatsApp.</p>
        <p role="status" className={notice?'text-sm font-medium text-primary-800':'sr-only'}>{notice}</p>
      </>}
    </div>
  </ModalDialog>;
}
