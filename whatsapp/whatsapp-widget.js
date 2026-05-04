// whatsapp-widget.js
// INJETAR CSS
const estilo = document.createElement('style');
estilo.innerHTML = `
  /* --- CSS do Widget --- */
  .whatsapp-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #25D366, #0ea5e9);
    border-radius: 16px;
    width: 62px;
    height: 62px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 18px 42px rgba(37, 211, 102, 0.28);
    z-index: 9999;
    touch-action: manipulation;
    border: 1px solid rgba(255,255,255,0.28);
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .whatsapp-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 52px rgba(14, 165, 233, 0.34);
  }
  .whatsapp-button img {
    width: 35px;
    height: 35px;
  }

  .whatsapp-chat {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: min(320px, calc(100vw - 32px));
    background: #f8fafc;
    border-radius: 18px;
    box-shadow: 0 24px 70px rgba(2, 6, 23, 0.38);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 9998;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    border: 1px solid rgba(15, 23, 42, 0.10);
  }

  .chat-header {
    background: linear-gradient(135deg, #063f3a, #075e54);
    color: white;
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-header strong {
    font-size: 16px;
    line-height: 1.2;
    display: inline-block;
  }

  .chat-header .info span.chat-subtext::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #25d366;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
  }

  .chat-header .info span.chat-subtext {
    font-size: 13px;
    color: #cfcfcf;
    margin-top: 2px;
  }

  .chat-header .info {
    display: flex;
    align-items: center;
  }

  .chat-header img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .chat-body {
    background-color: #e8f0eb;
    padding: 15px;
    height: 180px;
    overflow-y: auto;
    background-image: var(--chat-background-image);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }

  .message {
    font-size: 15px;
    background: #dcfce7;
    color: #1d1b1b;
    padding: 10px;
    border-radius: 12px;
    margin-bottom: 10px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    display: inline-block;
    max-width: 80%;
    position: relative;
    line-height: 1.4;
  }

  .message::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 12px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid #dcfce7;
  }

  .message-time {
    font-size: 11px;
    text-align: right;
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2.2px;
  }

  .message-time svg {
    width: 14px;
    height: 14px;
    fill: #34B7F1;
    vertical-align: middle;
  }

  .typing {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
  }

  .typing span {
    width: 6px;
    height: 6px;
    background: #ccc;
    border-radius: 50%;
    animation: piscar 1.4s infinite;
  }

  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes piscar {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }

  .chat-footer {
    padding: 12px;
    background: #f8fafc;
    text-align: center;
  }

  .chat-footer a {
    background: linear-gradient(135deg, #075e54, #128c7e);
    color: white;
    padding: 8px 16px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    box-shadow: 0 10px 22px rgba(7, 94, 84, 0.18);
  }

  .chat-footer a img {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 520px) {
    .whatsapp-button {
      right: 16px;
      bottom: 16px;
      width: 58px;
      height: 58px;
      border-radius: 15px;
    }
    .whatsapp-chat {
      right: 16px;
      bottom: 86px;
    }
  }
`;
document.head.appendChild(estilo);

// descobre pasta base do script
const scriptWidget = document.querySelector('script[src*="whatsapp-widget.js"]');
const pastaWidget = scriptWidget ? scriptWidget.src.replace(/\/whatsapp-widget\.js$/, '') : '.';
const mensagensPadrao = { cumprimentos: { manha: 'Bom dia!', tarde: 'Boa tarde!', noite: 'Boa noite!' } };

// HTML DO CHAT + BOTÃO
const chatBox = document.createElement('div');
chatBox.innerHTML = `
  <div class="whatsapp-chat" id="chatBox">
    <div class="chat-header">
      <div class="info">
        <img id="chatLogo" src="" alt="Logo" />
        <div>
          <strong></strong><br />
          <span class="chat-subtext">Disponível</span>
        </div>
      </div>
      <button class="close-btn" onclick="alternarChat()">×</button>
    </div>
    <div class="chat-body" id="chatBody">
      <div class="typing" id="typing">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div class="chat-footer">
      <a href="#" target="_blank">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="Ícone do WhatsApp" />
        Iniciar conversa
      </a>
    </div>
  </div>

  <div class="whatsapp-button" onclick="alternarChat()">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="Botão WhatsApp" />
  </div>

  <audio id="notifSound" preload="auto">
    <source src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3" type="audio/mpeg">
  </audio>
`;
document.body.appendChild(chatBox);

const widgetConfig = {
  cumprimentos: { manha: 'Bom dia!', tarde: 'Boa tarde!', noite: 'Boa noite!' },
  mensagemPosCumprimento: 'Você está falando com a Digital Objetiva. Me diga qual serviço precisa: site, currículo, suporte remoto, GOV.BR, MEI, Detran ou segunda via.',
  tituloChat: 'Digital Objetiva',
  imagemChat: 'whatsapp/Sem Título-2.png',
  backgroundChat: 'https://raw.githubusercontent.com/thiagodelgado/appdoid/refs/heads/gh-pages/stylesheets/15-16-17.svg',
  numeroWhatsapp: '5521970707616'
};

// Pré-carrega cabeçalho
const logoEl = document.querySelector('#chatBox .chat-header img#chatLogo');
if (logoEl) logoEl.src = widgetConfig.imagemChat;
const titleEl = document.querySelector('#chatBox .chat-header strong');
if (titleEl) titleEl.textContent = widgetConfig.tituloChat;
const linkFooterEl = document.querySelector('.chat-footer a');
if (linkFooterEl) linkFooterEl.href = `https://wa.me/${widgetConfig.numeroWhatsapp}`;

let chatVisivel = false;
let mensagemTimeoutId;

window.alternarChat = function () {
  const box = document.getElementById('chatBox');
  const body = document.getElementById('chatBody');
  const sound = document.getElementById('notifSound');

  if (!chatVisivel) {
    body.innerHTML = `<div class="typing" id="typing"><span></span><span></span><span></span></div>`;
    const typingIndicator = document.getElementById('typing');
    typingIndicator.style.display = 'flex';
    box.style.display = 'flex';
    chatVisivel = true;
    
    mensagemTimeoutId = setTimeout(() => {
      const horaAtual = new Date().getHours();
      const periodo = horaAtual < 12 ? 'manha' : (horaAtual < 18 ? 'tarde' : 'noite');
      const saudacao = widgetConfig.cumprimentos[periodo];
      const posMsg = widgetConfig.mensagemPosCumprimento;
      
      const message = document.createElement('div');
      message.classList.add('message');
      message.innerHTML = `
        ${saudacao}<br />
        ${posMsg}
        <div class="message-time">
          ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <svg viewBox="0 0 24 24"><path d="M1.8 12l2.1-2.1L9 15l11.1-11.1L22.2 6 9 19.2z"/><path d="M12 19.2L7.2 14.4l1.4-1.4L12 16.4l7.8-7.8 1.4 1.4z"/></svg>
        </div>
      `;
      
      document.getElementById('typing').style.display = 'none';
      body.appendChild(message);
      sound.play().catch(() => {});
    }, 2000);
  } else {
    clearTimeout(mensagemTimeoutId);
    box.style.display = 'none';
    chatVisivel = false;
  }
};
