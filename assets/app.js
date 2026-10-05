(() => {
  'use strict';

  /* ======================================================================
     Setup
     ====================================================================== */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Never let an exit animation block navigation (background tabs pause animations)
  const settle = (anim, ms) => Promise.race([anim.finished.catch(() => {}), new Promise(r => setTimeout(r, ms))]);

  const ICON = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
    down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  };

  const MODULES = [
    { n: 1, title: 'Introduksjon', path: 'bedriftsregnskap/modul-01-introduksjon/' },
    { n: 2, title: 'Inntekts- og kostnadsbegreper', path: 'bedriftsregnskap/modul-02-inntekts-og-kostnadsbegreper/' },
  ];
  // Formula-sheet section number → example workbook sheet (1-based)
  const SECTION_TO_SHEET = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7 };
  const HF_URL = 'https://cdn.jsdelivr.net/npm/hyperformula@3.4.0/dist/hyperformula.full.min.js';
  const XLSX_URL = 'eksempler/HSM122_eksempeloppgaver.xlsx';

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    try { lenis = new Lenis({ autoRaf: true, lerp: 0.11 }); } catch (e) { lenis = null; }
  }
  const scrollToEl = (el, offset = -140) => {
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.3 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: reduced ? 'auto' : 'smooth' });
  };
  const scrollTop = () => { if (lenis) lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0); };

  /* ---------- Theme ---------- */
  const themeBtn = $('#themeBtn');
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const paintTheme = () => { themeBtn.innerHTML = isDark() ? ICON.sun : ICON.moon; };
  const savedTheme = store.get('hsm122:theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  paintTheme();
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('hsm122:theme', next);
    paintTheme();
  });

  /* ---------- Sliding pills (nav + segmented control) ---------- */
  function movePill(container, pill, active, instant) {
    if (!container || !pill) return;
    if (!active) { pill.style.width = '0px'; return; }
    const cr = container.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    if (instant) pill.style.transition = 'none';
    pill.style.width = ar.width + 'px';
    pill.style.transform = `translateX(${ar.left - cr.left + container.scrollLeft}px)`;
    if (instant) { void pill.offsetWidth; pill.style.transition = ''; }
  }
  let navPlaced = false;
  function setTab(name) {
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    movePill($('.tabs'), $('.tab-pill'), $('.tab.active'), !navPlaced);
    navPlaced = true;
  }
  const placePills = () => {
    movePill($('.tabs'), $('.tab-pill'), $('.tab.active'), true);
    const seg = $('#seg');
    if (seg) movePill(seg, $('.seg-pill', seg), $('a.active', seg), true);
  };
  addEventListener('resize', placePills);
  if (document.fonts) document.fonts.ready.then(placePills);

  /* ---------- Scroll reveal ---------- */
  const io = ('IntersectionObserver' in window && !reduced)
    ? new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach((e, k) => {
        e.target.style.setProperty('--i', k);
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 })
    : null;
  function reveal(els) {
    els.forEach(el => {
      el.classList.add('reveal');
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- Data loading ---------- */
  const cache = {};
  const load = path => (cache[path] ||= fetch(path).then(r => {
    if (!r.ok) throw new Error(path + ': ' + r.status);
    return r.text();
  }));
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  /* ---------- Markdown ---------- */
  function md(src) {
    const div = document.createElement('div');
    div.innerHTML = marked.parse(src, { gfm: true });
    div.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/formelark\.md/.test(h)) a.setAttribute('href', '#formler');
      else { const m = h.match(/modul-0?(\d+)/); if (m && !/^https?:/.test(h)) a.setAttribute('href', '#modul-' + m[1]); }
    });
    return div;
  }
  function toSections(div) {
    const out = [];
    let cur = null;
    [...div.children].forEach(el => {
      if (el.tagName === 'H1' || el.tagName === 'HR') return;
      if (el.tagName === 'H2') { cur = { title: el.textContent, nodes: [] }; out.push(cur); return; }
      if (!cur) { cur = { title: null, nodes: [] }; out.push(cur); }
      cur.nodes.push(el);
    });
    return out;
  }

  /* ---------- Hero ---------- */
  function heroHTML({ eyebrow, lines, lead, cta = '', stats = '', compact = false }) {
    let d = 80;
    const h1 = lines.map((ln, li) => {
      const words = ln.split(' ').map(w => { const s = `<span class="w" style="--d:${d}">${esc(w)}</span>`; d += 70; return s; });
      return `<span class="line${li ? ' dim' : ''}">${words.join(' ')}</span>`;
    }).join('');
    return `<section class="hero${compact ? ' compact' : ''}">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1>${h1}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
      ${cta ? `<div class="cta">${cta}</div>` : ''}
      ${stats}
    </section>`;
  }

  /* ======================================================================
     Number formatting (mirrors the Excel number formats)
     ====================================================================== */
  const nfCache = {};
  const nf = (min, max = min) => (nfCache[min + ':' + max] ||= new Intl.NumberFormat('nb-NO', { minimumFractionDigits: min, maximumFractionDigits: max }));
  const compact = new Intl.NumberFormat('nb-NO', { notation: 'compact', maximumFractionDigits: 1 });
  const infoCache = {};
  function fmtInfo(fmt) {
    if (!fmt) return { kind: 'gen' };
    if (infoCache[fmt]) return infoCache[fmt];
    const parts = fmt.split(';');
    const first = parts[0];
    const dec = ((first.match(/\.(0+)/) || [])[1] || '').length;
    const zeroDash = parts.length >= 3 && /"-"/.test(parts[2]);
    let info;
    if (/%/.test(first)) info = { kind: 'pct', dec, zeroDash };
    else if (/kr/.test(first)) info = { kind: 'kr', dec, zeroDash };
    else { const pre = first.match(/^"([^"]*)"/); info = pre ? { kind: 'pre', pre: pre[1], dec, zeroDash } : { kind: 'num', dec, zeroDash }; }
    return (infoCache[fmt] = info);
  }
  function fmtVal(v, fmt, keepZero) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'object') return v.value || '#FEIL';
    if (typeof v !== 'number') return String(v);
    const i = fmtInfo(fmt);
    if (i.kind === 'gen') return nf(0, 2).format(v);
    if (i.zeroDash && !keepZero && Math.abs(v) < 1e-9) return '–';
    if (i.kind === 'pct') return nf(i.dec).format(v * 100) + ' %';
    if (i.kind === 'kr') return nf(i.dec).format(v) + ' kr';
    if (i.kind === 'pre') return i.pre + nf(i.dec).format(v);
    return nf(i.dec).format(v);
  }
  function valueHTML(v, fmt) {
    if (v === 'Gunstig') return '<span class="pill pos">Gunstig</span>';
    if (v === 'Ugunstig') return '<span class="pill neg">Ugunstig</span>';
    if (v === '–') return '<span class="pill neu">Ingen avvik</span>';
    return esc(fmtVal(v, fmt));
  }
  const inputUnit = fmt => ({ pct: '%', kr: 'kr' }[fmtInfo(fmt).kind] || '');
  const inputText = (v, fmt) => (typeof v !== 'number' ? '' : nf(0, 2).format(fmtInfo(fmt).kind === 'pct' ? v * 100 : v));
  function parseInput(str, fmt) {
    const s = String(str).replace(/[\s  ]/g, '').replace(/−/g, '-').replace(',', '.');
    if (s === '' || s === '-' || !/^-?\d*\.?\d*$/.test(s)) return NaN;
    const n = Number(s);
    return fmtInfo(fmt).kind === 'pct' ? n / 100 : n;
  }

  /* ======================================================================
     View: Formler
     ====================================================================== */
  async function renderFormler() {
    const src = await load('formelark.md');
    const sections = toSections(md(src));
    let legend = '';
    let formulaCount = 0;
    const cards = [];

    sections.forEach(s => {
      if (!s.title) {
        legend = s.nodes.map(n => n.textContent).join(' ').replace(/.*?Forkortelser:/s, 'Forkortelser:');
        return;
      }
      const m = s.title.match(/^(\d+)\.\s*(.*)$/);
      const num = m ? +m[1] : null;
      const title = m ? m[2] : s.title;
      const card = document.createElement('section');
      card.className = 'card' + (num ? '' : ' dashed');
      card.id = slug(title);
      card.dataset.title = title;
      card.dataset.num = num || '';
      card.innerHTML = `<div class="card-head"><span class="card-num">${num ? String(num).padStart(2, '0') : '+'}</span><h2></h2></div>`;
      $('h2', card).textContent = title;
      s.nodes.forEach(n => card.appendChild(n));
      $$('table', card).forEach(t => {
        t.classList.add('ftable');
        if (/kalkyle/i.test(t.querySelector('th')?.textContent || '')) t.classList.add('kalkyle');
      });
      if (num) formulaCount += $$('tbody tr', card).length + $$('pre', card).length;
      if (num && SECTION_TO_SHEET[num]) {
        card.insertAdjacentHTML('beforeend', `<div class="card-foot"><a class="link-arrow" href="#oppgave-${SECTION_TO_SHEET[num]}">Regn eksempeloppgave ${ICON.arrow}</a></div>`);
      }
      cards.push(card);
    });

    const topics = cards.filter(c => c.dataset.num).length;
    app.innerHTML = heroHTML({
      eyebrow: 'HSM122 — Innføring i bedriftsøkonomi',
      lines: ['Alle formlene.', 'Ett sted.'],
      lead: 'Hele formelarket, ordnet etter tema. Søk, slå opp og regn eksempler – fra avanse og avskrivninger til standardkost og ABC.',
      cta: `<a class="btn" href="#oppgaver">Regn eksempler ${ICON.arrow}</a>
            <a class="btn ghost" href="${XLSX_URL}" download>${ICON.down} Last ned Excel</a>`,
      stats: `<div class="stats">
        <div class="stat"><b>${topics}</b><span>temaer</span></div>
        <div class="stat"><b>${formulaCount}</b><span>formler</span></div>
        <div class="stat"><b>7</b><span>regneark</span></div>
      </div>`,
    }) + `
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" type="search" placeholder="Søk – f.eks. dekningspunkt, avvik, saldo" autocomplete="off"><kbd>/</kbd></div>
        <div class="chips" id="chips"></div>
      </div>
      <p class="legend-line">${esc(legend)}</p>
      <div class="stack" id="grid"></div>
      <div class="empty hidden" id="none">Ingen formler matcher søket.</div>`;

    const grid = $('#grid');
    const chips = $('#chips');
    cards.forEach(card => {
      grid.appendChild(card);
      const chip = document.createElement('a');
      chip.className = 'chip';
      chip.innerHTML = `<span class="n">${card.dataset.num ? String(card.dataset.num).padStart(2, '0') : '+'}</span>`;
      chip.append(card.dataset.title.replace(/\s*\(.*\)/, ''));
      chip.addEventListener('click', e => { e.preventDefault(); scrollToEl(card); });
      chip._card = card;
      chips.appendChild(chip);
    });
    reveal(cards);

    // Scrollspy: highlight the chip of the card in view
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          $$('.chip', chips).forEach(c => {
            const on = c._card === e.target;
            c.classList.toggle('active', on);
            if (on) chips.scrollTo({ left: c.offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' });
          });
        });
      }, { rootMargin: '-42% 0px -52% 0px' });
      cards.forEach(c => spy.observe(c));
    }

    // Search
    const units = $$('tbody tr, pre, blockquote, .card > p', grid);
    units.forEach(u => (u._html = u.innerHTML));
    const q = $('#q');
    q.addEventListener('input', () => {
      const term = norm(q.value.trim());
      let any = false;
      $$('.card', grid).forEach(card => {
        const headHit = term && norm(card.dataset.title).includes(term);
        let hits = 0;
        $$('tbody tr, pre, blockquote, .card > p', card).forEach(u => {
          u.innerHTML = u._html;
          const hit = !term || headHit || norm(u.textContent).includes(term);
          u.classList.toggle('hidden', !hit);
          if (hit) hits++;
          if (term && hit && !headHit) highlight(u, term);
        });
        $$('table', card).forEach(t => t.classList.toggle('hidden', !t.querySelector('tbody tr:not(.hidden)')));
        $$('h3', card).forEach(h => {
          let n = h.nextElementSibling, vis = false;
          while (n && n.tagName !== 'H3') { if (!n.classList.contains('hidden') && !n.classList.contains('card-foot')) vis = true; n = n.nextElementSibling; }
          h.classList.toggle('hidden', !vis);
        });
        const show = !term || headHit || hits > 0;
        card.classList.toggle('hidden', !show);
        if (show) any = true;
      });
      $('#none').classList.toggle('hidden', any);
    });
  }

  function highlight(root, term) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const i = norm(node.nodeValue).indexOf(term);
      if (i < 0) return;
      const after = node.splitText(i);
      after.splitText(term.length);
      const mark = document.createElement('mark');
      mark.textContent = after.nodeValue;
      after.replaceWith(mark);
    });
  }

  document.addEventListener('keydown', e => {
    const q = $('#q');
    if (!q) return;
    if (e.key === '/' && document.activeElement !== q && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; q.dispatchEvent(new Event('input')); q.blur(); }
  });

  /* ======================================================================
     View: Oppgaver – the Excel workbook, live in the browser
     ====================================================================== */
  let DATA = null;
  let HF = null;
  let hfPromise = null;
  let hfFailed = false;
  const sheetIds = {};
  let curSheet = 0;

  async function loadData() {
    if (!DATA) DATA = JSON.parse(await load('eksempler/oppgaver.json'));
    return DATA;
  }
  function ensureEngine() {
    if (!hfPromise) {
      hfPromise = (async () => {
        await loadScript(HF_URL);
        const sheets = {};
        DATA.sheets.forEach(s => { sheets[s.name] = s.grid; });
        HF = HyperFormula.buildFromSheets(sheets, { licenseKey: 'gpl-v3' });
        DATA.sheets.forEach(s => { sheetIds[s.name] = HF.getSheetId(s.name); });
        verifyEngine();
        return HF;
      })().catch(err => { hfFailed = true; console.warn('Formelmotor kunne ikke lastes', err); throw err; });
    }
    return hfPromise;
  }
  const valueAt = (s, r, c) => (HF ? HF.getCellValue({ sheet: sheetIds[s.name], row: r, col: c }) : s.cache[r]?.[c]);

  // Compare every formula the engine computes with the values Excel saved
  function verifyEngine() {
    let checked = 0;
    const mismatches = [];
    DATA.sheets.forEach(s => s.grid.forEach((row, r) => row.forEach((g, c) => {
      if (typeof g !== 'string' || g[0] !== '=') return;
      checked++;
      const a = valueAt(s, r, c), b = s.cache[r][c];
      const same = (typeof a === 'number' && typeof b === 'number') ? Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)) : (a ?? '') === (b ?? '');
      if (!same) mismatches.push({ sheet: s.name, r, c, engine: a, excel: b });
    })));
    window.__hfCheck = { checked, mismatches };
    if (mismatches.length) console.warn('Avvik mellom formelmotor og Excel', mismatches);
  }

  function engineStatus() {
    const el = $('#engine');
    if (!el) return;
    el.classList.toggle('on', !!HF);
    el.lastChild.textContent = HF ? 'Regner live' : hfFailed ? 'Viser verdier fra Excel' : 'Starter formelmotor…';
  }

  async function renderOppgaver(idx) {
    const d = await loadData();
    curSheet = Math.min(Math.max(idx, 0), d.sheets.length - 1);
    app.innerHTML = heroHTML({
      eyebrow: 'Eksempeloppgaver',
      lines: ['Regn direkte.', 'Som i Excel.'],
      lead: 'Endre tallene i feltene, så regnes alle svar ut på nytt – med nøyaktig de samme formlene som i Excel-filen.',
      cta: `<a class="btn" href="${XLSX_URL}" download>${ICON.down} Last ned Excel</a>`,
      compact: true,
    }) + `<div class="seg-wrap"><nav class="seg" id="seg"><span class="seg-pill"></span>${d.sheets.map((s, i) => {
      const [, ...rest] = s.name.split(' ');
      return `<a href="#oppgave-${i + 1}" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(rest.join(' '))}</a>`;
    }).join('')}</nav></div><div id="sheet"></div>`;
    showSheet(curSheet, false);
    ensureEngine().then(() => { engineStatus(); syncDisplayed(); }).catch(engineStatus);
  }

  async function showSheet(idx, animate = true) {
    const d = DATA;
    curSheet = idx;
    const seg = $('#seg');
    $$('a', seg).forEach(a => a.classList.toggle('active', +a.dataset.i === idx));
    const active = $('a.active', seg);
    movePill(seg, $('.seg-pill', seg), active, !animate);
    if (active) seg.scrollTo({ left: active.offsetLeft - 24, behavior: reduced ? 'auto' : 'smooth' });

    const host = $('#sheet');
    if (animate && !reduced) {
      await settle(host.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 160, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }), 220);
    }
    host.innerHTML = '';
    host.appendChild(buildSheet(d.sheets[idx]));
    host.getAnimations().forEach(a => a.cancel());
    if (animate) {
      if (!reduced) host.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      const top = $('.seg-wrap').getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.6) scrollToEl($('.seg-wrap'), -60);
    }
    reveal($$('.card', host));
    engineStatus();
  }

  function taskHTML(text) {
    return text.split('\n').map(ln => {
      let h = esc(ln).replace(/^Oppgave:\s*/, '');
      h = h.replace(/^(Oppgave [A-Z][^:]*):\s*/, '<strong>$1.</strong> ');
      h = h.replace(/(^|\s)([a-e]\))(?=\s)/g, '$1<b class="q">$2</b>');
      return `<p>${h}</p>`;
    }).join('');
  }

  function buildSheet(s) {
    const [num, ...rest] = s.title.split(/\s{2,}/);
    const frag = document.createElement('div');
    frag.innerHTML = `
      <div class="sheet-head">
        <div><div class="k">Regneark ${esc(num)}</div><h2>${esc(rest.join(' '))}</h2></div>
        <div class="sheet-tools">
          <span class="engine" id="engine"><i></i><span></span></span>
          <button class="btn ghost small" id="reset" type="button">Tilbakestill</button>
        </div>
      </div>
      <div class="stack">
        <section class="card task"><div class="label">Oppgave</div>${taskHTML(s.task)}</section>
        ${s.blocks.map((b, bi) => `
          <section class="card">
            <div class="card-head"><h2 class="sm">${esc(b.title)}</h2></div>
            ${b.parts.map((p, pi) => p.type === 'note'
              ? `<p class="note">${esc(p.text)}</p>`
              : tableHTML(p, s) + (/^Diagram/i.test(b.title) ? `<figure class="chart" data-b="${bi}" data-p="${pi}"></figure>` : '')).join('')}
          </section>`).join('')}
      </div>
      <p class="note" style="margin-top:20px">Feltene med ramme kan endres. Svarene regnes ut med HyperFormula, en formelmotor som bruker Excel-formlene fra arket.</p>`;

    $$('input[data-cell]', frag).forEach(inp => {
      inp.addEventListener('input', () => onInput(inp, s));
      inp.addEventListener('blur', () => {
        const v = parseInput(inp.value, inp.dataset.fmt);
        if (!Number.isNaN(v)) inp.value = inputText(v, inp.dataset.fmt);
      });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
    });
    $$('.field', frag).forEach(f => f.addEventListener('click', () => $('input', f).focus()));
    $('#reset', frag).addEventListener('click', () => resetSheet(s));
    $$('figure.chart', frag).forEach(fig => {
      const part = s.blocks[+fig.dataset.b].parts[+fig.dataset.p];
      fig._draw = () => drawChart(fig, part, s);
      setTimeout(fig._draw, 0); // after the sheet is attached to the page
    });
    return frag;
  }

  function tableHTML(part, s) {
    const ncols = Math.max(part.cols.length, ...part.rows.map(r => (r.cells ? r.cells.length : 0)));
    const numCol = Array(ncols).fill(false);
    const descCol = Array(ncols).fill(false);
    part.rows.forEach(r => (r.cells || []).forEach((c, i) => {
      if (!c) return;
      if (c.role === 'input' || c.role === 'formula') numCol[i] = true;
      if (c.role === 'desc') descCol[i] = true;
    }));
    const isCompact = ncols <= 4 && descCol.some(Boolean);
    const cls = ['xtable', isCompact ? 'compact' : '', ncols >= 5 ? 'wide' : ''].join(' ');
    const colCls = i => [numCol[i] ? 'r' : '', descCol[i] ? 'desc' : ''].join(' ').trim();
    const head = part.cols.some(Boolean)
      ? `<thead><tr>${Array.from({ length: ncols }, (_, i) => `<th class="${colCls(i)}">${esc(part.cols[i] || '')}</th>`).join('')}</tr></thead>`
      : '';
    const body = part.rows.map(row => {
      if (row.kind === 'sub') return `<tr class="sub"><td colspan="${ncols}">${esc(row.text)}</td></tr>`;
      const descText = (row.cells.find(c => c && c.role === 'desc') || {}).text;
      const tds = Array.from({ length: ncols }, (_, i) => {
        const c = row.cells[i];
        if (!c) return `<td class="${colCls(i)}"></td>`;
        if (c.role === 'input') {
          const v = s.cache[c.r][c.c];
          const unit = inputUnit(c.fmt);
          return `<td class="r"><label class="field"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
            data-cell="${c.r}:${c.c}" data-fmt="${esc(c.fmt || '')}" value="${esc(inputText(v, c.fmt))}"
            aria-label="${esc((row.cells[0] && row.cells[0].text) || 'Inndata')}">${unit ? `<span class="unit">${unit}</span>` : ''}</label></td>`;
        }
        if (c.role === 'formula') {
          return `<td class="val r" data-cell="${c.r}:${c.c}" data-fmt="${esc(c.fmt || '')}">${valueHTML(valueAt(s, c.r, c.c), c.fmt)}</td>`;
        }
        if (c.role === 'desc') return `<td class="desc">${esc(c.text)}</td>`;
        const txt = typeof c.text === 'number' ? fmtVal(c.text, c.fmt, true) : c.text;
        if (i === 0) {
          return `<td class="lbl${c.bold ? ' b' : ''}">${esc(txt)}${isCompact && descText ? `<span class="m-desc">${esc(descText)}</span>` : ''}</td>`;
        }
        return `<td class="${typeof c.text === 'number' ? 'val r' : ''}">${esc(txt)}</td>`;
      }).join('');
      return `<tr class="${row.result ? 'result' : ''}">${tds}</tr>`;
    }).join('');
    return `<div class="tbl-wrap"><table class="${cls}">${head}<tbody>${body}</tbody></table></div>`;
  }

  async function onInput(inp, s) {
    const v = parseInput(inp.value, inp.dataset.fmt);
    const bad = Number.isNaN(v);
    inp.classList.toggle('bad', bad);
    if (bad) return;
    try { await ensureEngine(); } catch (e) { return; }
    const [r, c] = inp.dataset.cell.split(':').map(Number);
    const changes = HF.setCellContents({ sheet: sheetIds[s.name], row: r, col: c }, [[v]]);
    applyChanges(changes, s);
  }

  function resetSheet(s) {
    if (!HF) return;
    const id = sheetIds[s.name];
    const inputs = $$('input[data-cell]', $('#sheet'));
    const changes = HF.batch(() => {
      inputs.forEach(inp => {
        const [r, c] = inp.dataset.cell.split(':').map(Number);
        HF.setCellContents({ sheet: id, row: r, col: c }, [[s.grid[r][c]]]);
      });
    });
    inputs.forEach(inp => {
      const [r, c] = inp.dataset.cell.split(':').map(Number);
      inp.value = inputText(s.grid[r][c], inp.dataset.fmt);
      inp.classList.remove('bad');
    });
    applyChanges(changes, s);
  }

  function applyChanges(changes, s) {
    const id = sheetIds[s.name];
    const host = $('#sheet');
    changes.forEach(ch => {
      const a = ch.address;
      if (!a || a.sheet !== id) return;
      const el = host.querySelector(`td[data-cell="${a.row}:${a.col}"]`);
      if (el) setCell(el, ch.newValue, true);
    });
    $$('figure.chart', host).forEach(f => f._draw && f._draw());
  }

  // After the engine boots, make sure what is shown matches what it computes
  function syncDisplayed() {
    const s = DATA.sheets[curSheet];
    $$('td[data-cell]', $('#sheet')).forEach(el => {
      const [r, c] = el.dataset.cell.split(':').map(Number);
      setCell(el, valueAt(s, r, c), false);
    });
  }

  function setCell(el, v, animate) {
    const fmt = el.dataset.fmt;
    const old = el._v !== undefined ? el._v : null;
    el._v = v;
    cancelAnimationFrame(el._raf);
    if (animate && !reduced && !document.hidden && typeof v === 'number' && typeof old === 'number' && Math.abs(v - old) > 1e-9) {
      const t0 = performance.now();
      const dur = 650;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmtVal(old + (v - old) * e, fmt);
        if (p < 1) el._raf = requestAnimationFrame(step);
        else el.innerHTML = valueHTML(v, fmt);
      };
      el._raf = requestAnimationFrame(step);
    } else {
      el.innerHTML = valueHTML(v, fmt);
    }
    if (animate) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  }

  /* ---------- Chart (KVR: revenue vs. costs) ---------- */
  let tipEl = null;
  function tip() {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'chart-tip'; document.body.appendChild(tipEl); }
    return tipEl;
  }
  function niceStep(max, count) {
    const raw = max / count;
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }
  function drawChart(fig, part, s) {
    const rows = part.rows.filter(r => r.kind === 'row');
    const xs = rows.map(r => Number(r.cells[0].text));
    const series = [1, 2, 3].map(j => ({
      name: part.cols[j],
      color: `var(--series-${j})`,
      vals: rows.map(r => { const c = r.cells[j]; const v = valueAt(s, c.r, c.c); return typeof v === 'number' ? v : 0; }),
    }));
    const W = 760, H = 340, m = { t: 20, r: 132, b: 36, l: 62 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const allMax = Math.max(1, ...series.flatMap(se => se.vals));
    const step = niceStep(allMax, 5);
    const yMax = Math.ceil(allMax / step) * step;
    const x0 = xs[0], x1 = xs[xs.length - 1];
    const X = x => m.l + ((x - x0) / (x1 - x0 || 1)) * iw;
    const Y = y => m.t + ih - (y / yMax) * ih;

    let grid = '', axis = '';
    for (let y = 0; y <= yMax + 1e-9; y += step) {
      grid += `<line x1="${m.l}" x2="${m.l + iw}" y1="${Y(y)}" y2="${Y(y)}"/>`;
      axis += `<text x="${m.l - 12}" y="${Y(y) + 4}" text-anchor="end">${compact.format(y)}</text>`;
    }
    xs.forEach((x, i) => {
      if (xs.length > 7 && i % 2) return;
      axis += `<text x="${X(x)}" y="${H - 10}" text-anchor="middle">${nf(0).format(x)}</text>`;
    });
    const paths = series.map(se => `<path d="${se.vals.map((v, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')}" stroke="${se.color}"/>`).join('');

    // Direct end labels, nudged apart so they never collide
    const ends = series.map(se => ({ name: se.name, color: se.color, y: Y(se.vals[se.vals.length - 1]) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 18) ends[i].y = ends[i - 1].y + 18;
    const endDots = series.map(se => `<circle cx="${X(x1)}" cy="${Y(se.vals[se.vals.length - 1])}" r="4" fill="${se.color}" stroke="var(--surface)" stroke-width="2"/>`).join('');
    const endLabels = ends.map(e => `<text class="end-label" x="${X(x1) + 12}" y="${e.y + 4}">${esc(e.name)}</text>`).join('');

    // Break-even: where revenue (series 1) meets total cost (series 2)
    let bep = '';
    const a = series[0].vals, b = series[1].vals;
    for (let i = 1; i < xs.length; i++) {
      const d0 = a[i - 1] - b[i - 1], d1 = a[i] - b[i];
      if (d0 < 0 && d1 >= 0) {
        const t = d0 / (d0 - d1);
        const bx = xs[i - 1] + t * (xs[i] - xs[i - 1]);
        const by = a[i - 1] + t * (a[i] - a[i - 1]);
        const px = X(bx), py = Y(by);
        const anchor = px > m.l + iw * 0.6 ? 'end' : 'start';
        const dx = anchor === 'end' ? -12 : 12;
        bep = `<g class="bep"><line x1="${px}" x2="${px}" y1="${py}" y2="${m.t + ih}" stroke="var(--line-2)" stroke-dasharray="0"/>
          <circle cx="${px}" cy="${py}" r="5.5" fill="var(--text)" stroke="var(--surface)" stroke-width="2.5"/>
          <text class="bep-label" x="${px + dx}" y="${py - 22}" text-anchor="${anchor}">Dekningspunkt</text>
          <text class="bep-sub" x="${px + dx}" y="${py - 8}" text-anchor="${anchor}">${nf(0).format(bx)} enh. · ${nf(0).format(by)} kr</text></g>`;
        break;
      }
    }

    fig.innerHTML = `
      <div class="chart-legend">${series.map(se => `<span><i style="background:${se.color}"></i>${esc(se.name)}</span>`).join('')}</div>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Linjediagram: salgsinntekt, totale kostnader og faste kostnader etter mengde, med dekningspunktet markert">
        <g class="grid">${grid}</g><g class="axis">${axis}</g>
        <g class="series">${paths}</g>${bep}${endDots}${endLabels}
        <g class="hover" style="display:none"><line class="cross" y1="${m.t}" y2="${m.t + ih}"/>${series.map(se => `<circle r="4.5" fill="${se.color}" stroke="var(--surface)" stroke-width="2"/>`).join('')}</g>
        <rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>
      </svg>`;

    // Draw-in the lines once; skipped in hidden tabs so they never stay invisible
    if (!reduced && !fig._drawn && !document.hidden) {
      $$('.series path', fig).forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        const anim = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1400, delay: 120 * i, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        anim.finished.then(() => { p.style.strokeDasharray = ''; }).catch(() => {});
      });
    }
    fig._drawn = true;

    const svg = $('svg', fig), hover = $('.hover', fig), hit = $('.hit', fig);
    const cross = $('line', hover), dots = $$('circle', hover);
    const move = ev => {
      const pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
      let best = 0;
      xs.forEach((x, i) => { if (Math.abs(X(x) - loc.x) < Math.abs(X(xs[best]) - loc.x)) best = i; });
      const px = X(xs[best]);
      hover.style.display = '';
      cross.setAttribute('x1', px); cross.setAttribute('x2', px);
      dots.forEach((d, j) => { d.setAttribute('cx', px); d.setAttribute('cy', Y(series[j].vals[best])); });
      const t = tip();
      t.innerHTML = `<div class="t">Mengde ${nf(0).format(xs[best])}</div>` + series.map(se =>
        `<div class="row"><span><i style="background:${se.color}"></i>${esc(se.name)}</span><b>${nf(0).format(se.vals[best])} kr</b></div>`).join('');
      const tw = t.offsetWidth || 200;
      const left = ev.clientX + 18 + tw > innerWidth ? ev.clientX - tw - 18 : ev.clientX + 18;
      t.style.left = left + 'px';
      t.style.top = Math.max(70, ev.clientY - 40) + 'px';
      t.classList.add('on');
    };
    const leave = () => { hover.style.display = 'none'; tip().classList.remove('on'); };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', leave);
  }

  /* ======================================================================
     View: Moduler
     ====================================================================== */
  const countTasks = src => (src.match(/^\s*- \[[ xX]\]/gm) || []).length;
  function progressOf(n, total) {
    let done = 0;
    for (let i = 0; i < total; i++) if (store.get(`hsm122:m${n}:${i}`) === '1') done++;
    return done;
  }
  const RING = 2 * Math.PI * 19;

  async function renderModuler() {
    const info = await Promise.all(MODULES.map(async m => {
      let total = 0;
      try { total = countTasks(await load(m.path + 'README.md')); } catch (e) {}
      return { ...m, total, done: progressOf(m.n, total) };
    }));
    app.innerHTML = heroHTML({
      eyebrow: 'Pensum',
      lines: ['Modul for modul.', 'I ditt tempo.'],
      lead: 'Kryss av videoer, PDF-er og quizer etter hvert. Fremdriften lagres i nettleseren din.',
      compact: true,
    }) + `<div class="mod-grid">${info.map(m => {
      const p = m.total ? m.done / m.total : 0;
      return `<a class="mod-card" href="#modul-${m.n}">
        <div class="k">Modul ${String(m.n).padStart(2, '0')}</div>
        <h3>${esc(m.title)}</h3>
        <div class="foot">
          <svg class="ring" viewBox="0 0 44 44"><circle class="track" cx="22" cy="22" r="19"/><circle class="bar" cx="22" cy="22" r="19" stroke-dasharray="${RING}" stroke-dashoffset="${RING}" data-p="${p}"/></svg>
          <div class="meta"><b>${Math.round(p * 100)} %</b>${m.done} av ${m.total} fullført</div>
          <span class="go">${ICON.arrow}</span>
        </div></a>`;
    }).join('')}</div>`;
    const cards = $$('.mod-card');
    reveal(cards);
    setTimeout(() => $$('.ring .bar').forEach(b => { b.style.strokeDashoffset = RING * (1 - +b.dataset.p); }), reduced ? 0 : 450);
  }

  async function renderModul(n) {
    const m = MODULES.find(x => x.n === n);
    if (!m) return renderModuler();
    let src = '', notes = '';
    try { src = await load(m.path + 'README.md'); } catch (e) {}
    try { notes = await load(m.path + 'notater.md'); } catch (e) {}

    app.innerHTML = `<a class="back" href="#moduler">${ICON.back} Alle moduler</a>` + heroHTML({
      eyebrow: `Modul ${String(m.n).padStart(2, '0')}`,
      lines: [m.title],
      compact: true,
      stats: '<div class="progress"><div id="pbar"></div></div><div class="progress-label" id="plabel"></div>',
    }) + '<div class="stack" id="grid"></div>';

    const grid = $('#grid');
    if (!src) { grid.innerHTML = '<div class="empty">Kunne ikke laste modulen.</div>'; return; }
    const sections = toSections(md(src));
    const notesDiv = md(notes.replace(/^# .*\n/, ''));
    const written = [...notesDiv.children].some(el => !/^H\d$/.test(el.tagName) && el.textContent.replace(/[-\s]/g, ''));
    if (written) sections.push({ title: 'Mine notater', nodes: [...notesDiv.children] });

    let idx = 0;
    const boxes = [];
    sections.forEach(s => {
      const card = document.createElement('section');
      card.className = 'card';
      if (s.title) { card.innerHTML = '<div class="card-head"><h2 class="sm"></h2></div>'; $('h2', card).textContent = s.title; }
      s.nodes.forEach(nd => card.appendChild(nd));
      $$('ul', card).forEach(ul => {
        const items = [...ul.children].filter(li => li.querySelector('input[type=checkbox]'));
        if (!items.length) return;
        ul.classList.add('tasks');
        items.forEach(li => {
          const key = `hsm122:m${m.n}:${idx++}`;
          li.querySelector('input').remove();
          const html = li.innerHTML.trim();
          li.innerHTML = '';
          const label = document.createElement('label');
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = store.get(key) === '1';
          input.addEventListener('change', () => { store.set(key, input.checked ? '1' : '0'); update(); });
          const span = document.createElement('span');
          span.innerHTML = html;
          label.append(input, span);
          li.appendChild(label);
          boxes.push(input);
        });
      });
      $$('table', card).forEach(t => t.classList.add('ftable'));
      if (s.title && card.textContent.replace(s.title, '').replace(/[-\s]/g, '') === '') return;
      grid.appendChild(card);
    });
    reveal($$('.card', grid));

    function update() {
      const done = boxes.filter(b => b.checked).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      $('#pbar').style.width = pct + '%';
      $('#plabel').textContent = `${done} av ${boxes.length} fullført · ${pct} %`;
    }
    setTimeout(update, reduced ? 0 : 400);
  }

  /* ======================================================================
     Router with smooth page transitions
     ====================================================================== */
  let current = { tab: null };
  let routeId = 0;
  function parse(h) {
    let m;
    if ((m = h.match(/^oppgave-(\d+)$/))) return { tab: 'oppgaver', sheet: +m[1] - 1 };
    if (h === 'oppgaver') return { tab: 'oppgaver', sheet: 0 };
    if ((m = h.match(/^modul-(\d+)$/))) return { tab: 'moduler', modul: +m[1] };
    if (h === 'moduler') return { tab: 'moduler' };
    return { tab: 'formler' };
  }
  async function route() {
    const id = ++routeId;
    const view = parse(location.hash.slice(1));
    setTab(view.tab);
    tip().classList.remove('on');

    if (view.tab === 'oppgaver' && current.tab === 'oppgaver' && DATA && $('#seg')) {
      current = view;
      return showSheet(Math.min(view.sheet, DATA.sheets.length - 1));
    }

    let out = null;
    if (!reduced && app.childElementCount) {
      out = app.animate([{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: 'translateY(-10px)', filter: 'blur(6px)' }],
        { duration: 220, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      await settle(out, 280);
      if (id !== routeId) return;
    }
    try {
      if (view.tab === 'oppgaver') await renderOppgaver(view.sheet);
      else if (view.tab === 'moduler' && view.modul) await renderModul(view.modul);
      else if (view.tab === 'moduler') await renderModuler();
      else await renderFormler();
    } catch (err) {
      console.error(err);
      app.innerHTML = '<div class="empty">Noe gikk galt under lasting. Prøv å laste siden på nytt.</div>';
    }
    if (id !== routeId) return;
    current = view;
    scrollTop();
    if (out) out.cancel();
    if (!reduced && out) app.animate([{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
    requestAnimationFrame(placePills);
  }
  addEventListener('hashchange', route);
  route();
})();
