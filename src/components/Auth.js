import { $, $$, toast } from '../utils.js';
import { updateProfile } from '../intelligence.js';
import { ShopifyClient } from '../shopify.js';

const shopify = new ShopifyClient();

export function initAuth(finishAuthCallback, goCallback, renderAdminAreaCallback) {
  // Landing & Auth Overlay
  const authOverlay = $('auth-overlay');
  const landingOverlay = $('landing-overlay');
  
  const showAuthState = (stateId) => {
    $$('.auth-state').forEach(el => el.classList.remove('active'));
    $(stateId).classList.add('active');
    authOverlay.classList.remove('hidden');
  };

  const finishAuth = () => {
    authOverlay.classList.add('hidden');
    if (landingOverlay) landingOverlay.classList.add('hidden');
    sessionStorage.setItem('hasSeenLanding', 'true');
    toast('Accesso effettuato con successo!');
    if (finishAuthCallback) finishAuthCallback();
  };

  $('landing-signup-btn')?.addEventListener('click', () => showAuthState('auth-state-signup'));
  $('landing-login-btn')?.addEventListener('click', () => showAuthState('auth-state-login'));
  
  $('auth-back-btn')?.addEventListener('click', () => {
    authOverlay.classList.add('hidden');
  });

  // Auth actions
  $('auth-do-signup')?.addEventListener('click', async () => {
    const nameEl = $('signup-name');
    const emailEl = $('signup-email');
    const passEl = $('signup-password');
    
    // Protezione dalla cache: se mancano gli ID, la UI è vecchia e forziamo il ricaricamento
    if (!nameEl || !emailEl || !passEl) {
      toast('Aggiornamento app in corso...', false);
      setTimeout(() => window.location.reload(true), 1500);
      return;
    }

    const fullName = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passEl.value;
    if (!fullName || !email || !password) {
      toast('Compila tutti i campi', true);
      return;
    }
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    
    const btn = $('auth-do-signup');
    const oldText = btn.textContent;
    btn.textContent = 'Registrazione...';
    btn.disabled = true;

    try {
      const customer = await shopify.customerCreate({ firstName, lastName, email, password });
      updateProfile({ name: fullName, email });
      finishAuth();
    } catch (err) {
      toast('Errore: ' + err.message, true);
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });

  $('btn-spid')?.addEventListener('click', () => {
    $('spid-gateway-overlay').style.display = 'flex';
  });

  $('spid-gateway-close')?.addEventListener('click', () => {
    $('spid-gateway-overlay').style.display = 'none';
  });

  let currentSpidProvider = '';

  document.querySelectorAll('.spid-provider').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentSpidProvider = e.currentTarget.dataset.name;
      $('spid-providers-container').style.display = 'none';
      $('spid-provider-title').textContent = `Accedi con ${currentSpidProvider}`;
      $('spid-credentials-form').style.display = 'block';
    });
  });

  $('spid-back-to-providers')?.addEventListener('click', () => {
    $('spid-credentials-form').style.display = 'none';
    $('spid-providers-container').style.display = 'grid';
    $('spid-username').value = '';
    $('spid-password').value = '';
  });

  $('spid-submit-credentials')?.addEventListener('click', () => {
    const user = $('spid-username').value.trim();
    const pass = $('spid-password').value;
    
    if (!user || !pass) {
      toast('Inserisci Nome Utente e Password SPID', true);
      return;
    }

    $('spid-credentials-form').style.display = 'none';
    $('spid-loading-state').style.display = 'flex';
    
    setTimeout(() => {
      $('spid-gateway-overlay').style.display = 'none';
      $('spid-providers-container').style.display = 'grid'; // reset
      $('spid-credentials-form').style.display = 'none';
      $('spid-loading-state').style.display = 'none';
      $('spid-username').value = '';
      $('spid-password').value = '';
      
      finishAuth();
      toast(`Accesso certificato con ${currentSpidProvider}.`);
    }, 300);
  });

  $('spid-qr-login-btn')?.addEventListener('click', () => {
    $('spid-credentials-form').style.display = 'none';
    $('spid-loading-state').style.display = 'flex';
    $('spid-loading-text').textContent = "In attesa di autorizzazione dall'App...";
    
    setTimeout(() => {
      $('spid-gateway-overlay').style.display = 'none';
      $('spid-providers-container').style.display = 'grid';
      $('spid-credentials-form').style.display = 'none';
      $('spid-loading-state').style.display = 'none';
      
      finishAuth();
      toast(`Accesso SPID completato con ${currentSpidProvider}.`);
    }, 3000);
  });
  
  $('auth-do-login')?.addEventListener('click', async () => {
    const emailEl = $('auth-login-email');
    const passEl = $('auth-login-password');
    
    // Protezione dalla cache
    if (!emailEl || !passEl) {
      toast('Aggiornamento app in corso...', false);
      setTimeout(() => window.location.reload(true), 1500);
      return;
    }

    const email = emailEl.value.trim();
    const password = passEl.value;
    if (!email || !password) {
      toast('Inserisci email e password', true);
      return;
    }

    const btn = $('auth-do-login');
    const oldText = btn.textContent;
    btn.textContent = 'Accesso...';
    btn.disabled = true;

    try {
      const auth = await shopify.customerLogin({ email, password });
      sessionStorage.setItem('customerAccessToken', auth.accessToken);
      updateProfile({ email });
      finishAuth();
    } catch (err) {
      toast('Credenziali errate: ' + err.message, true);
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });

  // Admin Area Auth
  const showDirAuth = () => {
    const overlay = $('dir-auth-overlay');
    if (overlay) overlay.classList.remove('hidden');
  };
  $('btn-profile-dir-clienti')?.addEventListener('click', showDirAuth);
  $('btn-profile-dir-admin')?.addEventListener('click', showDirAuth);
  
  $('dir-auth-back-btn')?.addEventListener('click', () => {
    const overlay = $('dir-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
  });

  $('dir-do-login')?.addEventListener('click', async () => {
    const user = $('dir-login-username').value;
    const pass = $('dir-login-password').value;
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      
      if (data.success) {
        const overlay = $('dir-auth-overlay');
        if (overlay) overlay.classList.add('hidden');
        $('dir-login-username').value = '';
        $('dir-login-password').value = '';
        sessionStorage.setItem('admin_token', data.token); // Secure token
        if (goCallback) goCallback('admin');
        if (renderAdminAreaCallback) renderAdminAreaCallback();
        toast('Accesso Direzione consentito.');
      } else {
        toast(data.error || 'Credenziali errate.', true);
      }
    } catch (err) {
      toast('Errore di rete durante il login', true);
    }
  });
}
