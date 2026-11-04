// Idiomas FR (texto del HTML) / EN / ES (window.I18N_EN, I18N_ES en js/lang.js). Variante de common/i18n4.js con el francés por defecto.
// data-i18n="clave" cambia el contenido; data-i18n-attr="aria-label:clave;alt:clave2" cambia atributos.
// Guarda la elección (?lang=en, localStorage) y avisa con el evento "langchange". I18N.t(fr, en, es) para textos de JS.
(() => {
  const site = document.currentScript?.dataset.site || 'web';
  const KEY = site + '-lang';
  const LANGS = ['fr', 'en', 'es'];
  const D = { en: window.I18N_EN || {}, es: window.I18N_ES || {} };
  const orig = new Map();
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const load = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const pick = (lang, k, fallback) => (D[lang] && D[lang][k] != null ? D[lang][k] : fallback);

  function apply(lang) {
    if (!LANGS.includes(lang)) lang = 'fr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (!orig.has(el)) orig.set(el, el.innerHTML);
      el.innerHTML = pick(lang, el.dataset.i18n, orig.get(el));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, k] = pair.split(':').map((s) => s.trim());
        const ok = 'i18nOrig' + attr.replace(/(^|-)./g, (m) => m.slice(-1).toUpperCase());
        if (el.dataset[ok] == null) el.dataset[ok] = el.getAttribute(attr) || '';
        el.setAttribute(attr, pick(lang, k, el.dataset[ok]));
      });
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    store(KEY, lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  // Árabe y desconocidos con navegador en francés ven FR; el resto de idiomas, inglés
  const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  const guess = LANGS.includes(nav) ? nav : (nav === 'ar' ? 'fr' : 'en');
  const start = new URLSearchParams(location.search).get('lang') || load(KEY) || guess;
  const cur = () => document.documentElement.lang;
  window.I18N = { set: apply, get: cur, t: (fr, en, es) => ({ en, es }[cur()] ?? fr) };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b) { e.preventDefault(); apply(b.dataset.lang); } });
  const go = () => apply(start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
