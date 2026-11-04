// Reda Location / Rent · interacción de la página
// Scroll suave (Lenis + GSAP ScrollTrigger), cabecera, menú móvil, fichas con carrusel y filtro,
// la piscina que se abre desde la tarjeta, el calendario (arrastrar o tocar llegada y salida)
// y el mensaje de WhatsApp que se escribe solo con lo que eliges.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('anim');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const HAS = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const SITE = window.SITE || { WA: '212652291153', DEMO: true };
  const DEMO = SITE.DEMO !== false;
  const LIST = window.LISTINGS || [];
  const lang = () => root.lang || 'fr';
  const T = (fr, en, es) => ({ en, es }[lang()] ?? fr);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ic = (id) => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;
  const wa = (text) => `https://wa.me/${SITE.WA}` + (text ? `?text=${encodeURIComponent(text)}` : '');
  const barH = () => ($('#bar')?.offsetHeight || 64);
  if (!HAS || RM) root.classList.remove('js'); // sin animaciones: todo visible desde el principio

  // ---------- scroll suave ----------
  let lenis = null;
  if (HAS) gsap.registerPlugin(ScrollTrigger);
  if (HAS && !RM && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const goTo = (el, extra = 12) => {
    if (!el) return;
    const y = Math.max(0, el.getBoundingClientRect().top + scrollY - barH() - extra);
    if (lenis) lenis.scrollTo(y, { duration: 1.25 }); else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.getElementById(id.slice(1));
    if (!t) return;
    e.preventDefault();
    if (a.dataset.filter) setFilter(a.dataset.filter);
    closeMenu();
    goTo(t, id === '#accueil' ? 999 : 12);
    if (id === '#accueil') { if (lenis) lenis.scrollTo(0, { duration: 1.25 }); else scrollTo({ top: 0 }); }
  });

  // ---------- cabecera, menú y barra inferior ----------
  const bar = $('#bar'), menu = $('#menu'), mbtn = $('#menu-btn'), dock = $('#dock');
  let lastY = 0, menuOpen = false, askSeen = false;
  const onScroll = () => {
    const y = scrollY;
    bar.classList.toggle('solid', y > 24 || menuOpen);
    if (!menuOpen) { if (y > 700 && y > lastY + 6) bar.classList.add('away'); else if (y < lastY - 6 || y < 700) bar.classList.remove('away'); }
    lastY = y;
    dock.classList.toggle('on', y > innerHeight * 0.85 && !askSeen && !menuOpen);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function openMenu() {
    menuOpen = true; menu.hidden = false; mbtn.setAttribute('aria-expanded', 'true');
    mbtn.setAttribute('aria-label', T('Fermer le menu', 'Close the menu', 'Cerrar el menú'));
    mbtn.querySelector('use').setAttribute('href', '#i-close');
    bar.classList.remove('away'); onScroll(); lenis?.stop(); document.body.style.overflow = 'hidden';
    if (HAS && !RM) gsap.fromTo('.menu-nav a', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
    menu.querySelector('a')?.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false');
    mbtn.setAttribute('aria-label', T('Ouvrir le menu', 'Open the menu', 'Abrir el menú'));
    mbtn.querySelector('use').setAttribute('href', '#i-menu');
    lenis?.start(); document.body.style.overflow = ''; onScroll();
  }
  mbtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { closeMenu(); mbtn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 1000 && menuOpen) closeMenu(); });

  // enlace activo del menú
  const navLinks = $$('.nav a');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['logements', 'voitures', 'transport', 'immobilier', 'reserver', 'demande', 'questions', 'services', 'accueil'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  // ---------- enlaces de WhatsApp con un saludo ----------
  const hello = () => T('Bonjour Reda, je vous écris depuis votre site.', 'Hello Reda, I’m writing from your website.', 'Hola, Reda. Te escribo desde tu web.');
  const immoText = (k) => T('Bonjour Reda, j’ai un projet immobilier au Maroc : je veux ', 'Hello Reda, I have a property project in Morocco: I want to ', 'Hola, Reda. Tengo un proyecto inmobiliario en Marruecos: quiero ') +
    ({ buy: T('acheter.', 'buy.', 'comprar.'), sell: T('vendre.', 'sell.', 'vender.'), rent: T('louer à l’année.', 'rent long term.', 'alquilar a largo plazo.') }[k]);
  function waLinks() {
    $$('[data-wa]').forEach((a) => { a.href = wa(hello()); });
    $$('[data-immo]').forEach((a) => { a.href = wa(immoText(a.dataset.immo)); });
  }

  // ---------- logements ----------
  const grid = $('#grid');
  let filter = 'all';
  const typeName = (t) => (t === 'villa' ? 'Villa' : T('Appartement', 'Apartment', 'Apartamento'));
  function renderListings() {
    const L = lang();
    grid.innerHTML = LIST.map((it) => {
      const many = it.photos.length > 1;
      return `<li class="lst" data-type="${it.type}" data-id="${it.id}">
        <div class="lst-ph">
          <div class="lst-track">${it.photos.map((p) => `<img src="assets/img/${p.src}.jpg" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" alt="${esc(p.alt[L] || p.alt.fr)}">`).join('')}</div>
          ${DEMO ? `<span class="lst-tag">${T('Exemple', 'Example', 'Ejemplo')}</span>` : ''}
          ${many ? `<button class="lst-nav prev" type="button" disabled aria-label="${T('Photo précédente', 'Previous photo', 'Foto anterior')}">${ic('i-prev')}</button>
          <button class="lst-nav next" type="button" aria-label="${T('Photo suivante', 'Next photo', 'Foto siguiente')}">${ic('i-next')}</button>
          <span class="lst-dots" aria-hidden="true">${it.photos.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</span>` : ''}
        </div>
        <div class="lst-body">
          <span class="lst-type">${typeName(it.type)}</span>
          <h3>${esc(it.title[L] || it.title.fr)}</h3>
          <p class="lst-tags">${(it.tags[L] || it.tags.fr).map(esc).join(' · ')}</p>
          <button class="btn btn-line btn-sm lst-ask" type="button" data-listing="${it.id}">${T('Demander ce logement', 'Ask about this place', 'Pedir este alojamiento')}</button>
        </div>
      </li>`;
    }).join('');
    $$('.lst', grid).forEach(carousel);
    setFilter(filter, true);
  }
  function carousel(li) {
    const track = $('.lst-track', li), dots = $$('.lst-dots i', li), prev = $('.lst-nav.prev', li), next = $('.lst-nav.next', li);
    if (!prev) return;
    const n = track.children.length;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      prev.disabled = i <= 0; next.disabled = i >= n - 1;
    };
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
    const go = (d) => track.scrollBy({ left: d * track.clientWidth, behavior: RM ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
  }
  function setFilter(type, instant) {
    filter = type;
    $$('.filters button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
    const items = $$('.lst', grid);
    items.forEach((li) => { li.hidden = !(type === 'all' || li.dataset.type === type); });
    if (!instant && HAS && !RM) gsap.fromTo(items.filter((li) => !li.hidden), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out', clearProps: 'transform,opacity' });
    if (HAS) ScrollTrigger.refresh();
  }
  $$('.filters button').forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.type)));

  // ---------- la demanda ----------
  const form = $('#ask');
  const ask = { need: new Set(), listing: null, start: null, end: null, adults: 2, kids: 0 };
  const ORDER = ['appartement', 'villa', 'voiture', 'transport', 'immobilier'];
  const NEED = {
    appartement: () => T('un appartement', 'an apartment', 'un apartamento'),
    villa: () => T('une villa', 'a villa', 'una villa'),
    voiture: () => T('une voiture de location', 'a hire car', 'un coche de alquiler'),
    transport: () => T('un trajet avec chauffeur', 'a journey with a driver', 'un trayecto con conductor'),
    immobilier: () => T('un conseil pour un projet immobilier', 'help with a property project', 'ayuda con un proyecto inmobiliario')
  };
  const andJoin = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + T(' et ', ' and ', ' y ') + a[a.length - 1]);
  const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = day0(new Date());
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const unkey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const nights = () => (ask.start && ask.end ? Math.round((ask.end - ask.start) / 864e5) : 0);
  const fmt = (d, o) => new Intl.DateTimeFormat(lang(), o).format(d);
  const plural = (n, fr, frp, en, enp, es, esp) => `${n} ${n === 1 ? T(fr, en, es) : T(frp, enp, esp)}`;

  // calendario
  const cal = $('#cal'), sum = $('#cal-sum'), clearBtn = $('#cal-clear');
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let hoverK = null, dragging = false, ptr = 'mouse';
  const twoMonths = () => !matchMedia('(max-width: 760px)').matches;
  function renderCal(focusK) {
    const fm = new Intl.DateTimeFormat(lang(), { month: 'long', year: 'numeric' });
    const fw = new Intl.DateTimeFormat(lang(), { weekday: 'short' });
    const wd = [...Array(7)].map((_, i) => fw.format(new Date(2024, 0, 1 + i)).replace('.', '')); // 1/1/2024 = lunes
    const full = new Intl.DateTimeFormat(lang(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    let h = '';
    for (let m = 0; m < 2; m++) {
      const first = new Date(view.getFullYear(), view.getMonth() + m, 1);
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7;
      const mName = fm.format(first).replace(/^\p{L}/u, (c) => c.toUpperCase());
      h += `<div class="cal-m"><h3>${esc(mName)}</h3><div class="cal-g" role="group" aria-label="${esc(mName)}">`;
      h += wd.map((w) => `<span class="cal-w" aria-hidden="true">${w}</span>`).join('');
      for (let i = 0; i < lead; i++) h += '<span class="cal-x" aria-hidden="true"></span>';
      for (let d = 1; d <= days; d++) {
        const dt = new Date(first.getFullYear(), first.getMonth(), d), k = key(dt);
        h += `<button type="button" class="cal-d${k === key(today) ? ' today' : ''}" data-k="${k}" tabindex="-1" aria-pressed="false" aria-label="${esc(full.format(dt))}"${dt < today ? ' disabled' : ''}>${d}</button>`;
      }
      h += '</div></div>';
    }
    cal.innerHTML = h;
    $('#cal-prev').disabled = view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();
    paint();
    const target = (focusK && cal.querySelector(`[data-k="${focusK}"]`)) || null;
    roving(target);
    if (target) target.focus();
  }
  function roving(target) {
    const days = $$('.cal-d:not(:disabled)', cal);
    const pick = target || cal.querySelector('.cal-d.s:not(:disabled)') || cal.querySelector('.cal-d.today:not(:disabled)') || days[0];
    days.forEach((b) => { b.tabIndex = b === pick ? 0 : -1; });
  }
  function paint() {
    const s = ask.start && key(ask.start), e = ask.end && key(ask.end);
    const pv = !ask.end && ask.start && hoverK && unkey(hoverK) > ask.start ? hoverK : null;
    $$('.cal-d', cal).forEach((b) => {
      const k = b.dataset.k;
      const inR = (s && e && k > s && k < e) || (pv && k > s && k < pv);
      b.classList.toggle('s', k === s);
      b.classList.toggle('e', k === e || k === pv);
      b.classList.toggle('in', !!(inR || ((k === s) && (e || pv))));
      b.classList.toggle('pv', !!(pv && k > s && k <= pv));
      b.setAttribute('aria-pressed', String(k === s || k === e));
    });
    if (!ask.start) sum.innerHTML = esc(T('Choisissez la date d’arrivée', 'Choose your arrival date', 'Elige la fecha de llegada'));
    else if (!ask.end) sum.innerHTML = `${esc(fmt(ask.start, { day: 'numeric', month: 'short' }))} <span class="sl">/</span> …<small>${esc(T('Choisissez la date de départ', 'Now choose your departure date', 'Ahora elige la fecha de salida'))}</small>`;
    else sum.innerHTML = `${esc(fmt(ask.start, { day: 'numeric', month: 'short' }))} <span class="sl">/</span> ${esc(fmt(ask.end, { day: 'numeric', month: 'short' }))}<small>${esc(plural(nights(), 'nuit', 'nuits', 'night', 'nights', 'noche', 'noches'))}</small>`;
    clearBtn.hidden = !ask.start;
  }
  function pickDay(d) {
    if (!ask.start || ask.end) { ask.start = d; ask.end = null; }
    else if (d > ask.start) ask.end = d;
    else { ask.start = d; ask.end = null; }
    hoverK = null; paint(); update();
  }
  cal.addEventListener('pointerdown', (e) => {
    ptr = e.pointerType;
    const b = e.target.closest('.cal-d');
    if (!b || b.disabled || e.pointerType !== 'mouse' || e.button !== 0) return;
    e.preventDefault();
    pickDay(unkey(b.dataset.k));
    dragging = !ask.end; b.focus({ preventScroll: true }); roving(b);
  });
  cal.addEventListener('pointerover', (e) => {
    const b = e.target.closest('.cal-d');
    const k = b && !b.disabled ? b.dataset.k : null;
    if (k === hoverK) return;
    hoverK = k;
    if (ask.start && !ask.end) paint();
  });
  cal.addEventListener('pointerleave', () => { hoverK = null; if (ask.start && !ask.end) paint(); });
  addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const b = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.cal-d');
    const k = b && !b.disabled ? b.dataset.k : hoverK;
    if (k && ask.start && !ask.end && unkey(k) > ask.start) pickDay(unkey(k));
  });
  cal.addEventListener('click', (e) => { // toque, lápiz y teclado (el ratón ya eligió en pointerdown)
    const b = e.target.closest('.cal-d');
    if (!b || b.disabled) return;
    if (ptr === 'mouse' && e.detail !== 0) return;
    pickDay(unkey(b.dataset.k)); roving(b);
  });
  cal.addEventListener('keydown', (e) => {
    const b = e.target.closest('.cal-d');
    if (!b) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (e.key === 'Enter' || e.key === ' ') { ptr = 'key'; return; }
    if (!step) return;
    e.preventDefault();
    const d = unkey(b.dataset.k); d.setDate(d.getDate() + step);
    if (d < today) return;
    const k = key(d), el = cal.querySelector(`.cal-d[data-k="${k}"]`);
    if (el && (twoMonths() || el.closest('.cal-m') === cal.querySelector('.cal-m'))) { roving(el); el.focus(); return; }
    view = new Date(d.getFullYear(), d.getMonth() - (step > 0 && twoMonths() ? 1 : 0), 1);
    if (view < new Date(today.getFullYear(), today.getMonth(), 1)) view = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCal(k);
  });
  $('#cal-prev').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  $('#cal-next').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });
  clearBtn.addEventListener('click', () => { ask.start = ask.end = null; paint(); update(); });

  // necesidades, logement elegido, viajeros
  const chips = $$('input[name="need"]', form);
  chips.forEach((c) => c.addEventListener('change', () => { c.checked ? ask.need.add(c.value) : ask.need.delete(c.value); if (!c.checked && ask.listing && ask.listing.type === c.value) setListing(null); update(); }));
  $$('input[name="immo"]', form).forEach((c) => c.addEventListener('change', update));
  ['route', 'note'].forEach((id) => $('#' + id).addEventListener('input', update));
  const setNeed = (v, on = true) => { const c = chips.find((x) => x.value === v); if (c) { c.checked = on; on ? ask.need.add(v) : ask.need.delete(v); } };
  const boxL = $('#ask-listing');
  function setListing(id) {
    const it = LIST.find((x) => x.id === id) || null;
    ask.listing = it;
    boxL.hidden = !it;
    if (it) {
      const p = it.photos[0];
      $('img', boxL).src = `assets/img/${p.src}.jpg`; $('img', boxL).alt = '';
      $('b', boxL).textContent = (it.title[lang()] || it.title.fr) + (DEMO ? T(' (exemple)', ' (example)', ' (ejemplo)') : '');
      setNeed(it.type, true);
      boxL.classList.remove('flash'); void boxL.offsetWidth; boxL.classList.add('flash');
    }
    update();
  }
  $('#ask-listing-x').addEventListener('click', () => setListing(null));
  $$('.step', form).forEach((st) => {
    const out = $('output', st), k = st.dataset.step, min = k === 'adults' ? 1 : 0, max = k === 'adults' ? 16 : 12;
    const [minus, plus] = $$('.x-btn', st);
    const sync = () => { out.textContent = ask[k]; minus.disabled = ask[k] <= min; plus.disabled = ask[k] >= max; };
    $$('.x-btn', st).forEach((b) => b.addEventListener('click', () => {
      ask[k] = Math.max(min, Math.min(max, ask[k] + Number(b.dataset.d)));
      sync(); out.classList.remove('tick'); void out.offsetWidth; out.classList.add('tick'); update();
    }));
    sync();
  });

  // mensaje
  const msgEl = $('#msg'), send = $('#send');
  let prevLines = [];
  function compose() {
    const n = ask.need, lines = [T('Bonjour Reda,', 'Hello Reda,', 'Hola, Reda:'), T('Je vous écris depuis votre site.', 'I’m writing from your website.', 'Te escribo desde tu web.')];
    const wants = ORDER.filter((x) => n.has(x)).map((x) => NEED[x]());
    if (wants.length) lines.push(T('Je cherche ', 'I’m looking for ', 'Busco ') + andJoin(wants) + '.');
    if (ask.listing) lines.push(T('Logement vu sur le site : ', 'Place seen on the site: ', 'Alojamiento visto en la web: ') + (ask.listing.title[lang()] || ask.listing.title.fr) + (DEMO ? T(' (exemple)', ' (example)', ' (ejemplo)') : '') + '.');
    const onlyImmo = n.size === 1 && n.has('immobilier');
    if (!onlyImmo && ask.start) {
      const s = fmt(ask.start, { day: 'numeric', month: 'long' }), e = ask.end && fmt(ask.end, { day: 'numeric', month: 'long', year: 'numeric' });
      const nn = plural(nights(), 'nuit', 'nuits', 'night', 'nights', 'noche', 'noches'), s1 = fmt(ask.start, { day: 'numeric', month: 'long', year: 'numeric' });
      if (e) lines.push(T(`Dates : du ${s} au ${e} (${nn}).`, `Dates: ${s} to ${e} (${nn}).`, `Fechas: del ${s} al ${e} (${nn}).`));
      else lines.push(T(`Arrivée : le ${s1}.`, `Arrival: ${s1}.`, `Llegada: el ${s1}.`));
    }
    if (!onlyImmo) {
      const who = [plural(ask.adults, 'adulte', 'adultes', 'adult', 'adults', 'adulto', 'adultos')];
      if (ask.kids) who.push(plural(ask.kids, 'enfant', 'enfants', 'child', 'children', 'niño', 'niños'));
      lines.push(T('Voyageurs : ', 'Guests: ', 'Viajeros: ') + who.join(', ') + '.');
    }
    const route = $('#route').value.trim();
    if (n.has('transport') && route) lines.push(T('Trajet : ', 'Journey: ', 'Trayecto: ') + route);
    const immo = $('input[name="immo"]:checked', form)?.value;
    if (n.has('immobilier') && immo) lines.push(T('Projet immobilier : ', 'Property project: ', 'Proyecto inmobiliario: ') + ({ buy: T('acheter', 'buy', 'comprar'), sell: T('vendre', 'sell', 'vender'), rent: T('louer à l’année', 'rent long term', 'alquilar a largo plazo') }[immo]) + '.');
    const note = $('#note').value.trim();
    if (note) lines.push(note);
    lines.push(T('Merci !', 'Thank you!', '¡Gracias!'));
    return lines;
  }
  let coolT = 0;
  function update() {
    const n = ask.need, onlyImmo = n.size === 1 && n.has('immobilier');
    $('#ask-route').hidden = !n.has('transport');
    $('#ask-immo').hidden = !n.has('immobilier');
    $('#ask-dates').hidden = onlyImmo;
    $('.ask-who', form).hidden = onlyImmo;
    const lines = compose();
    msgEl.innerHTML = lines.map((l, i) => (prevLines.length && prevLines[i] !== l ? `<mark>${esc(l)}</mark>` : esc(l))).join('\n');
    prevLines = lines;
    clearTimeout(coolT);
    coolT = setTimeout(() => $$('mark', msgEl).forEach((m) => m.classList.add('cool')), 900);
    send.href = wa(lines.join('\n'));
  }
  $('#copy').addEventListener('click', async (e) => {
    const b = e.currentTarget, span = $('span', b), txt = compose().join('\n');
    try { await navigator.clipboard.writeText(txt); } catch (_) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (__) {} t.remove(); }
    span.textContent = T('Message copié', 'Message copied', 'Mensaje copiado');
    setTimeout(() => { span.textContent = T('Copier le message', 'Copy the message', 'Copiar el mensaje'); }, 1800);
  });

  // botones que llevan a la demanda con algo ya elegido
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-listing]');
    const a = e.target.closest('[data-ask]');
    if (!l && !a) return;
    if (l) setListing(l.dataset.listing);
    if (a) { setNeed(a.dataset.ask, true); update(); }
    goTo($('#demande'));
    setTimeout(() => (l ? boxL : $(`.chip input[value="${a.dataset.ask}"]`))?.focus?.({ preventScroll: true }), RM ? 0 : 900);
  });

  // la barra inferior se esconde cuando se ve la demanda
  new IntersectionObserver(([e]) => { askSeen = e.isIntersecting; onScroll(); }, { rootMargin: '0px 0px -25% 0px' }).observe($('#demande'));

  // ---------- idioma ----------
  const TITLE = { fr: 'Reda Location / Rent · Appartements, villas et voitures au Maroc', en: 'Reda Location / Rent · Apartments, villas and cars in Morocco', es: 'Reda Location / Rent · Apartamentos, villas y coches en Marruecos' };
  let first = true;
  document.addEventListener('langchange', () => {
    document.title = TITLE[lang()] || TITLE.fr;
    $$('[data-demo]').forEach((el) => { el.hidden = !DEMO; });
    waLinks();
    renderListings();
    renderCal();
    if (ask.listing) setListing(ask.listing.id); else update();
    if (first) { first = false; intro(); }
  });

  // ---------- movimiento ----------
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w"><span class="w-i" style="--i:${i}">${esc(w)}</span></span>`).join(' ');
    el.classList.add('split');
  }
  function intro() {
    const hero = $('#accueil');
    if (root.classList.contains('js')) splitWords($('#h-hero'));
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('in')));
    const showCard = () => hero.classList.add('card-in');
    if (window.Card?.ready) showCard(); else { document.addEventListener('cardready', showCard, { once: true }); setTimeout(showCard, 2600); }
    // entradas por sección
    const rv = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('[data-reveal]').forEach((el) => { [...el.children].forEach((c, i) => c.style.setProperty('--i', i)); rv.observe(el); });
    $$('[data-img]').forEach((el) => rv.observe(el));
    if (!HAS) return;
    // la portada se queda quieta un momento y la tarjeta se da la vuelta: del monograma a los servicios
    const flipEase = gsap.parseEase('power2.inOut');
    ScrollTrigger.create({ trigger: hero, start: 'top top', end: () => '+=' + Math.round(innerHeight * (innerWidth < 760 ? 0.55 : 0.75)), pin: !RM, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => window.Card?.scroll(flipEase(Math.min(1, s.progress * 1.08))) });
    openScene();
    if (!RM) $$('.ex figure img, .how-img img').forEach((img) => gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  // la piscina se abre desde una ventana del tamaño de la tarjeta hasta toda la pantalla
  function openScene() {
    const sec = $('#open'), frame = $('.open-frame', sec), vid = $('.open-vid', sec), v = $('.open-v', sec);
    const load = () => { if (!vid.src && vid.dataset.src) { vid.src = vid.dataset.src; vid.load(); } };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { load(); if (!RM) vid.play().catch(() => {}); } else vid.pause();
    }, { rootMargin: '200px 0px' }).observe(sec);
    if (RM) return;
    const geo = () => {
      const W = innerWidth, H = sec.querySelector('.open-pin').offsetHeight;
      const cw = Math.min(W * (W < 760 ? 0.78 : 0.42), 620), ch = cw / 1.5455;
      return { W, H, cw, ch };
    };
    const set = (p) => {
      const { W, H, cw, ch } = geo();
      const e = gsap.parseEase('power3.inOut')(Math.min(1, p / 0.82));
      const w = cw + (W - cw) * e, h = ch + (H - ch) * e;
      frame.style.setProperty('--it', `${(H - h) / 2}px`);
      frame.style.setProperty('--il', `${(W - w) / 2}px`);
      frame.style.setProperty('--vs', String(1.18 - 0.18 * e));
      v.style.setProperty('--vl', `${(W - w) / 2}px`); v.style.setProperty('--vt', `${(H - h) / 2}px`);
      v.style.setProperty('--vw', `${w}px`); v.style.setProperty('--vh', `${h}px`);
      v.style.setProperty('--vo', String(Math.max(0, 1 - e * 1.6)));
    };
    set(0);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress) });
  }

  // red de seguridad: si algo falla, que nada se quede oculto
  setTimeout(() => { if (first) { root.classList.remove('js'); document.dispatchEvent(new CustomEvent('langchange')); } }, 3500);
})();
