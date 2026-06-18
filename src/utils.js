export const $ = id  => document.getElementById(id);
export const $$ = sel => document.querySelectorAll(sel);
export const fmt = (amt, cur = 'EUR') => `${({ EUR:'€', USD:'$', GBP:'£' }[cur] || cur)}${parseFloat(amt).toFixed(2)}`;

let _toastTimer;
export function toast(msg, isError = false) {
  const el = $('toast');
  const sp = $('toast-msg');
  if (!el || !sp) return;
  sp.textContent = msg;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

let _lucideScheduled = false;
export function refreshIcons(node) {
  if (_lucideScheduled) return;
  _lucideScheduled = true;
  requestAnimationFrame(() => {
    if (window.lucide) {
      window.lucide.createIcons(node ? { nodes: [node] } : {});
    }
    _lucideScheduled = false;
  });
}
