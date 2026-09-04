import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  PhoneCall,
  GripVertical,
  Minimize2,
  Maximize2,
  ArrowLeftRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedActions?: string[];
  time: string;
}

interface WargaAIChatWidgetProps {
  currentPropertyCode?: string;
}

export const WargaAIChatWidget: React.FC<WargaAIChatWidgetProps> = ({ currentPropertyCode = 'A-17' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [dockSide, setDockSide] = useState<'right' | 'left'>('right');
  const [bottomPos, setBottomPos] = useState<number>(100);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedMin = localStorage.getItem('wargahub_ai_minimized');
      if (savedMin !== null) setIsMinimized(savedMin === 'true');

      const savedSide = localStorage.getItem('wargahub_ai_dock_side');
      if (savedSide === 'right' || savedSide === 'left') setDockSide(savedSide);

      const savedBottom = localStorage.getItem('wargahub_ai_bottom_pos');
      if (savedBottom) {
        const parsed = parseInt(savedBottom, 10);
        if (!isNaN(parsed) && parsed >= 70 && parsed <= window.innerHeight - 90) {
          setBottomPos(parsed);
        }
      }
    } catch (_) {}
  }, []);

  const toggleMinimized = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wargahub_ai_minimized', String(next));
      } catch (_) {}
      return next;
    });
  };

  const toggleDockSide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDockSide((prev) => {
      const next = prev === 'right' ? 'left' : 'right';
      try {
        localStorage.setItem('wargahub_ai_dock_side', next);
      } catch (_) {}
      return next;
    });
  };

  // Dragging support
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startBottomRef = useRef(100);
  const hasMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startBottomRef.current = bottomPos;
    hasMovedRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    if (Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }
    const maxBottom = typeof window !== 'undefined' ? window.innerHeight - 90 : 600;
    const minBottom = 75;
    const newBottom = Math.max(minBottom, Math.min(maxBottom, startBottomRef.current + deltaY));
    setBottomPos(newBottom);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (hasMovedRef.current) {
      try {
        localStorage.setItem('wargahub_ai_bottom_pos', bottomPos.toString());
      } catch (_) {}
    } else {
      // Normal click -> Open widget
      setIsOpen(true);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Halo! Saya **Warga AI**, asisten cerdas Komplek Taman Sejahtera. Ada yang bisa saya bantu terkait tagihan iuran, pemesanan balai warga, nomor satpam, atau aduan lingkungan?',
      suggestedActions: ['Cek Rekening BCA', 'Status Tagihan Saya', 'Kontak Satpam 24 Jam', 'Pesan Balai Warga'],
      time: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          propertyCode: currentPropertyCode,
        }),
      });

      const json = await res.json();
      if (json.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: json.data.reply,
          suggestedActions: json.data.suggestedActions,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <>
      {/* Floating Action Button / Launcher */}
      {!isOpen && (
        <div
          style={{ bottom: `${bottomPos}px` }}
          className={`fixed z-40 transition-[left,right] duration-200 select-none ${
            dockSide === 'right' ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
          }`}
        >
          {isMinimized ? (
            /* Minimized Mode: Compact circular icon */
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Tanya Warga AI (Klik untuk buka, seret vertikal untuk pindah posisi)"
              className="relative group cursor-grab active:cursor-grabbing p-3 bg-primary-600 hover:bg-primary-700 active:scale-95 text-surface rounded-2xl shadow-xl border border-primary-500 flex items-center justify-center transition-transform touch-none"
            >
              <Sparkles className="w-5 h-5 text-surface animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary-600 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary-600" />

              {/* Expand Toggle */}
              <button
                type="button"
                onClick={toggleMinimized}
                title="Buka Tampilan Penuh"
                className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-surface text-ink border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              >
                <Maximize2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            /* Full Pill Mode */
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex items-center gap-2 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-surface rounded-2xl shadow-xl border border-primary-500 cursor-grab active:cursor-grabbing transition-all touch-none group"
            >
              {/* Drag Handle */}
              <div
                title="Seret ke atas/bawah untuk memindahkan posisi tombol"
                className="text-white/60 group-hover:text-white p-0.5 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-surface animate-pulse" />
                </div>
                <span className="font-bold text-xs whitespace-nowrap">Tanya Warga AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>

              {/* Quick Controls: Switch Dock Side & Minimize */}
              <div
                className="flex items-center gap-0.5 pl-1.5 border-l border-white/20"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={toggleDockSide}
                  title={dockSide === 'right' ? 'Pindah ke Sisi Kiri' : 'Pindah ke Sisi Kanan'}
                  className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={toggleMinimized}
                  title="Kecilkan Tombol (Mode Ringkas)"
                  className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-5 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-surface rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            dockSide === 'right' ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
          }`}
        >
          {/* Chat Header */}
          <div className="p-4 bg-primary-600 text-surface flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-surface shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Warga AI
                  <span className="px-1.5 py-0.2 bg-emerald-400/30 text-emerald-100 text-[10px] rounded font-semibold">Aktif</span>
                </h3>
                <p className="text-[11px] text-surface/80">Asisten Cerdas Komplek Taman Sejahtera</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleDockSide}
                title={dockSide === 'right' ? 'Pindah Tampilan ke Kiri' : 'Pindah Tampilan ke Kanan'}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-surface"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-canvas/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-primary-600 text-surface rounded-tr-xs shadow-xs font-medium'
                        : 'bg-surface text-ink border border-border shadow-card rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>

                  <span className={`text-[10px] text-ink-muted block px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.time}
                  </span>

                  {/* Suggested Quick Action Chips */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 bg-surface hover:bg-primary-50 hover:text-primary-700 text-ink text-[11px] font-semibold rounded-xl border border-border transition-colors shadow-2xs"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-primary-600 text-surface flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-ink-muted text-xs p-2">
                <div className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-surface rounded-2xl border border-border text-ink-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce delay-200" />
                  <span className="ml-1 text-[11px]">Warga AI sedang berpikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSubmit} className="p-3 bg-surface border-t border-border flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Tanyakan sesuatu ke Warga AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 bg-canvas border border-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-surface rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
