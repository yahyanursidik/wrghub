import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export function RequestErrorNotice() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const handle = (event: Event) => setMessage(String((event as CustomEvent).detail || 'Permintaan gagal. Coba lagi.'));
    window.addEventListener('wargahub:request-error', handle);
    return () => window.removeEventListener('wargahub:request-error', handle);
  }, []);
  if (!message) return null;
  return <aside role="alert" className="fixed top-20 left-4 right-4 sm:left-auto sm:max-w-md z-50 flex items-start gap-3 bg-red-50 text-red-800 border border-red-200 rounded-xl shadow-modal p-4 text-sm">
    <AlertCircle size={19} className="shrink-0 mt-0.5" /><p className="flex-1">{message}</p><button onClick={() => setMessage('')} aria-label="Tutup pesan kesalahan" className="shrink-0 p-1 rounded-lg hover:bg-red-100"><X size={18} /></button>
  </aside>;
}
