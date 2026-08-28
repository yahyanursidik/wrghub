import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, PhoneCall, Bot, Sparkles, RefreshCw, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

interface WAMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const WhatsAppBotSimulator: React.FC = () => {
  const [messages, setMessages] = useState<WAMessage[]>([
    {
      id: 'wa-1',
      sender: 'bot',
      text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
      time: '14:20',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [phoneSim, setPhoneSim] = useState('0812-3456-7890 (Rumah A-17)');

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: WAMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    let reply = '';
    const clean = text.trim();

    if (clean === '1' || clean.toLowerCase().includes('tagihan') || clean.toLowerCase().includes('iuran')) {
      reply = `📋 *STATUS TAGIHAN IURAN WARGA*\n\n🏡 *Unit:* Rumah A-17 (Bpk. Budi Santoso)\n🗓️ *Periode:* Agustus 2026\n💵 *Nominal:* Rp 750.000\n✅ *Status:* *LUNAS (VERIFIED)*\n\nKuitansi digital ber-QR code dapat diunduh di portal warga: http://localhost:4321/`;
    } else if (clean === '2' || clean.toLowerCase().includes('rekening') || clean.toLowerCase().includes('bca')) {
      reply = `🏦 *REKENING RESMI IURAN KOMPLEK*\n\nBank: *Bank BCA (Bank Central Asia)*\nNo. Rekening: *8830-1928-33*\nAtas Nama: *PENGURUS KOMPLEK TAMAN SEJAHTERA*\nTarif Iuran: *Rp 750.000 / bulan*\n\nHarap simpan bukti transfer untuk konfirmasi di aplikasi.`;
    } else if (clean === '3' || clean.toLowerCase().includes('satpam') || clean.toLowerCase().includes('darurat')) {
      reply = `🚨 *KONTAK DARURAT 24 JAM*\n\n👮 *Pos Satpam Utama:* 0811-9988-7766\n👤 *Ketua RW 05:* 0812-3456-7890\n🔧 *Petugas Sarana:* 0813-8888-9999\n\nPetugas satpam siap membantu 24 jam non-stop.`;
    } else if (clean === '4' || clean.toLowerCase().includes('booking') || clean.toLowerCase().includes('balai')) {
      reply = `🏟️ *PEMESANAN FASILITAS UMUM*\n\nUntuk meminjam Balai Warga atau Lapangan Olahraga, silakan isi formulir tanggal & jam pemakaian di menu *Pesan Sarana* pada aplikasi WargaHub.`;
    } else if (clean === '5' || clean.toLowerCase().includes('kas') || clean.toLowerCase().includes('transparansi')) {
      reply = `📊 *RINGKASAN KAS BULAN AGUSTUS 2026*\n\n💰 *Total Kas BCA:* Rp 128.450.000\n📈 *Pemasukan:* Rp 64.500.000\n📉 *Pengeluaran:* Rp 39.150.000\n\nRincian nota belanja lengkap: http://localhost:4321/transparency`;
    } else {
      reply = `Maaf, pesan tidak dikenali. Ketik angka *1*, *2*, *3*, *4*, atau *5* untuk memilih menu layanan warga.`;
    }

    const botMsg: WAMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: reply,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'wa-1',
        sender: 'bot',
        text: `Halo Bapak/Ibu Warga Komplek Taman Sejahtera! 🌿\n\nSelamat datang di *Layanan WhatsApp Otomatis WargaHub*.\n\nKetik angka menu untuk bantuan cepat:\n1️⃣ *Cek Tagihan & Status Iuran Rumah*\n2️⃣ *Informasi Rekening Bank BCA Resmi*\n3️⃣ *Kontak Darurat Pos Satpam 24 Jam*\n4️⃣ *Cara Booking Balai Warga & Lapangan*\n5️⃣ *Ringkasan Laporan Kas Transparansi*`,
        time: '14:20',
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            Simulator WhatsApp Bot WargaHub
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Uji coba simulasi interaksi bot WhatsApp otomatis untuk pelayanan tagihan, info kas, dan aduan warga 24 jam.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-canvas text-ink text-xs font-bold rounded-xl border border-border transition-colors shadow-2xs"
        >
          <RefreshCw className="w-4 h-4 text-ink-muted" />
          Reset Percakapan
        </button>
      </div>

      {/* Simulator Frame */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Menu Buttons */}
        <div className="p-5 bg-surface rounded-3xl border border-border shadow-card space-y-3 text-xs">
          <h3 className="font-bold text-sm text-ink">Simulasi Perintah Cepat</h3>
          <p className="text-ink-muted text-[11px]">Klik salah satu tombol di bawah untuk menguji respon bot WhatsApp:</p>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => handleSend('1')}
              className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
            >
              <span>1️⃣ Cek Status Iuran</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <button
              type="button"
              onClick={() => handleSend('2')}
              className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
            >
              <span>2️⃣ Rekening BCA Iuran</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <button
              type="button"
              onClick={() => handleSend('3')}
              className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
            >
              <span>3️⃣ Kontak Satpam Darurat</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <button
              type="button"
              onClick={() => handleSend('4')}
              className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
            >
              <span>4️⃣ Booking Balai Warga</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <button
              type="button"
              onClick={() => handleSend('5')}
              className="w-full text-left p-2.5 rounded-xl bg-canvas hover:bg-emerald-50 hover:text-emerald-900 border border-border font-semibold transition-colors flex items-center justify-between"
            >
              <span>5️⃣ Info Kas & Transparansi</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </button>
          </div>
        </div>

        {/* WhatsApp Phone Mockup */}
        <div className="md:col-span-2 bg-[#efeae2] dark:bg-slate-900 rounded-3xl border border-border shadow-xl flex flex-col h-[520px] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="p-3.5 bg-[#075e54] text-surface flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                WH
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight flex items-center gap-1">
                  WargaHub Bot Official
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-emerald-200">Online • Layanan Warga 24 Jam</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-200 font-mono">{phoneSim}</span>
          </div>

          {/* WhatsApp Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#d9fdd3] dark:bg-emerald-900 text-ink rounded-tr-xs font-medium'
                      : 'bg-surface text-ink rounded-tl-xs border border-border/40'
                  }`}
                >
                  {m.text}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-ink-muted">
                    <span>{m.time}</span>
                    {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="p-3 bg-surface border-t border-border flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ketik angka (1-5) atau ketik pesan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#075e54] hover:bg-[#064e46] text-surface rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
