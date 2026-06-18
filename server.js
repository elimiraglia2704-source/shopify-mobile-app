/**
 * Elisee Mobile App — Proxy Server
 * Risolve il CORS servendo sia i file statici che proxando le chiamate
 * alle API Shopify Storefront senza restrizioni CORS.
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { eliseeAgent } from './server/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;
const APP_DIR = __dirname;

// ── Tipi MIME ──────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ── Helper: invia risposta JSON ────────────────────────
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// ── Proxy verso Shopify Storefront API ─────────────────
function proxyShopify(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload;
    try { payload = JSON.parse(body); } catch {
      return sendJSON(res, 400, { error: 'Invalid JSON body' });
    }

    const shopDomain  = payload.shopDomain  || 'eliseebrand.myshopify.com';
    const accessToken = payload.accessToken || 'fd3d51862812c1f0c530dc83ac3f6685';
    const apiVersion  = payload.apiVersion  || '2024-04';
    const graphql     = payload.query       || '';
    const variables   = payload.variables   || {};

    const postData = JSON.stringify({ query: graphql, variables });

    const options = {
      hostname: shopDomain,
      path:     `/api/${apiVersion}/graphql.json`,
      method:   'POST',
      headers:  {
        'Content-Type':                        'application/json',
        'Content-Length':                      Buffer.byteLength(postData),
        'X-Shopify-Storefront-Access-Token':   accessToken,
        'Accept':                              'application/json',
      },
    };

    const proxyReq = https.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => { data += chunk; });
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type':                  'application/json',
          'Access-Control-Allow-Origin':   '*',
          'Access-Control-Allow-Methods':  'POST, OPTIONS',
          'Access-Control-Allow-Headers':  'Content-Type',
        });
        res.end(data);
      });
    });

    proxyReq.on('error', err => {
      console.error('❌ Proxy error:', err.message);
      sendJSON(res, 502, { error: 'Proxy request failed', detail: err.message });
    });

    proxyReq.write(postData);
    proxyReq.end();
  });
}

// ── Server principale ──────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname  = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Storefront-Access-Token',
    });
    return res.end();
  }

  // ── Proxy endpoint ──────────────────────────────────
  if (pathname === '/api/shopify' && req.method === 'POST') {
    return proxyShopify(req, res);
  }

  // ── Admin Login endpoint (Secured) ──────────────────
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const creds = JSON.parse(body);
        if (creds.username === 'Eliseo2704' && creds.password === 'Iemmello9') {
          return sendJSON(res, 200, { success: true, token: 'admin_token_secure_xyz123' });
        } else {
          return sendJSON(res, 401, { success: false, error: 'Credenziali errate' });
        }
      } catch {
        return sendJSON(res, 400, { success: false, error: 'Invalid JSON' });
      }
    });
    return;
  }

  // ── AI Agent endpoint (LangGraph) ───────────────────
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message, sessionId, profile } = data;
        
        if (!message) return sendJSON(res, 400, { error: 'Message required' });

        const config = { configurable: { thread_id: sessionId || 'default_thread' } };
        const inputMessage = { role: "user", content: message };
        
        const finalState = await eliseeAgent.invoke(
          { messages: [inputMessage], profile }, 
          config
        );
        
        const lastMsg = finalState.messages[finalState.messages.length - 1];
        sendJSON(res, 200, { reply: lastMsg.content });
      } catch (e) {
        console.error("AI Error:", e);
        sendJSON(res, 500, { error: e.message });
      }
    });
    return;
  }

  // ── File statici ────────────────────────────────────
  let filePath = path.join(APP_DIR, pathname === '/' ? 'index.html' : pathname);

  // Sicurezza: evita path traversal
  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback a index.html per SPA routing
        fs.readFile(path.join(APP_DIR, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); return res.end('Not Found'); }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(d2);
        });
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     Elisee Mobile App — Proxy Server     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  App:   http://localhost:${PORT}             ║`);
  console.log(`║  Proxy: http://localhost:${PORT}/api/shopify ║`);
  console.log('║  CORS:  OK Risolto via proxy locale      ║');

  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
