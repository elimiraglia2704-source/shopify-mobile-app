import { $, $$, toast } from '../utils.js';
import { getProfile } from '../intelligence.js';

export function initAssistant() {
  const aiFab = $('ai-stylist-btn');
  const aiOverlay = $('ai-stylist-overlay');
  const aiClose = $('ai-stylist-close');
  const aiBody = $('ai-chat-body');
  const aiInput = $('ai-chat-input');
  const aiSend = $('ai-chat-send');

  const addAiMessage = (text, sender) => {
    const el = document.createElement('div');
    el.className = `ai-bubble ${sender}`;
    el.innerHTML = text;
    aiBody.appendChild(el);
    aiBody.scrollTop = aiBody.scrollHeight;
  };

  const processAiQuery = async (query) => {
    addAiMessage(query, 'user');
    aiInput.value = '';
    
    // Simulate thinking delay
    const typingId = 'typing-' + Date.now();
    const typingEl = document.createElement('div');
    typingEl.className = 'ai-bubble bot';
    typingEl.id = typingId;
    typingEl.innerHTML = '<span class="spin" style="display:inline-block; font-size:10px;">⏳</span> Analisi in corso...';
    aiBody.appendChild(typingEl);
    aiBody.scrollTop = aiBody.scrollHeight;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId: 'session-' + (getProfile().email || 'guest'),
          profile: getProfile()
        })
      });
      const data = await res.json();
      
      const el = document.getElementById(typingId);
      if (el) el.remove();
      
      if (data.reply) {
        addAiMessage(data.reply, 'bot');
      } else {
        addAiMessage("Mi spiace, c'è stato un problema di comunicazione.", 'bot');
      }
    } catch (e) {
      const el = document.getElementById(typingId);
      if (el) el.remove();
      addAiMessage("Errore di rete con il server AI.", 'bot');
    }
  };

  const openAiStylist = (customGreeting) => {
    aiOverlay.classList.remove('hidden');
    if (aiBody.children.length === 0 || customGreeting) {
      if (customGreeting && aiBody.children.length > 0) aiBody.innerHTML = ''; // Reset per nuovo contesto
      const greeting = customGreeting || `Ciao ${getProfile().name?.split(' ')[0] || ''}, sono l'Agente Elisee. Posso farti da Personal Stylist per lo shop o generare preventivi per i tuoi progetti creativi. Come ti aiuto?`;
      addAiMessage(greeting, 'bot');
    }
  };

  if (aiFab) aiFab.addEventListener('click', () => openAiStylist());

  $('btn-studio-ai')?.addEventListener('click', () => {
    openAiStylist(`Ciao! Sono l'Agente Elisee. Pronto a sfogliare il portfolio e creare pacchetti su misura per il tuo progetto video o fotografico. Di cosa hai bisogno?`);
  });

  if (aiClose) aiClose.addEventListener('click', () => aiOverlay.classList.add('hidden'));
  
  if (aiSend) aiSend.addEventListener('click', () => {
    if (aiInput.value.trim()) processAiQuery(aiInput.value.trim());
  });
  
  if (aiInput) aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && aiInput.value.trim()) processAiQuery(aiInput.value.trim());
  });

  document.querySelectorAll('.ai-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      processAiQuery(chip.getAttribute('data-query'));
    });
  });
}
