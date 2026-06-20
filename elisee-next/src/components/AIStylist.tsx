'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Send, Mic, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  id: string;
}

export default function AIStylist({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          sender: 'bot',
          text: "Ciao! Sono l'Agente Elisee. Posso farti da Personal Stylist per lo shop o generare preventivi per i tuoi progetti creativi. Come ti aiuto?"
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: 'session-guest',
          profile: {}
        })
      });
      const data = await res.json();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: data.reply || "Mi spiace, c'è stato un problema di comunicazione.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Errore di rete con il server AI.", sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'white' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 600 }}>
          <Sparkles size={20} />
          <span>Elisee AI Stylist</span>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronDown size={20} />
        </button>
      </div>
      
      <div ref={bodyRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              maxWidth: '85%', 
              padding: '12px 16px', 
              borderRadius: '16px', 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
              color: msg.sender === 'user' ? 'black' : 'white',
              borderBottomRightRadius: msg.sender === 'user' ? 0 : '16px',
              borderBottomLeftRadius: msg.sender === 'bot' ? 0 : '16px',
              lineHeight: 1.5,
              fontSize: '15px'
            }}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}
        {isTyping && (
          <div style={{ maxWidth: '85%', padding: '12px 16px', borderRadius: '16px', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={16} className="spin" color="var(--gold)" />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Analisi in corso...</span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', background: 'var(--bg2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
          <button onClick={() => sendMessage("Consigliami un outfit per stasera")} style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', fontSize: '13px', cursor: 'pointer' }}>Crea outfit da sera</button>
          <button onClick={() => sendMessage("Scarpe per allenamento pesante")} style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', fontSize: '13px', cursor: 'pointer' }}>Scarpe da workout</button>
        </div>
        <div style={{ position: 'relative' }}>
          <Mic size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
          <input 
            type="text" 
            placeholder="Chiedi al tuo personal stylist..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            style={{ width: '100%', padding: '16px 48px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '24px', color: 'white', fontSize: '15px' }}
          />
          <button onClick={() => sendMessage(input)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'var(--gold)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', cursor: 'pointer' }}>
            <Send size={16} style={{ marginLeft: '-2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
