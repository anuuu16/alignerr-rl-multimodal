import { chromium } from '@playwright/test';
import fs from 'fs';
const [SUB, OUT] = process.argv.slice(2);
const S = { original: 3400, Astra: 3401, Gemini: 3402 };
const pages = ['/about', '/resume', '/projects', '/work', '/articles', '/projects/trelix', '/'];
const views = ['/?view=chat', '/?view=developer'];
const b = await chromium.launch(); const R = {};
const overlap = (p) => p.evaluate(() => {
  const fl = [...document.querySelectorAll('button,a')].filter(e => getComputedStyle(e).position === 'fixed' && /ask my portfolio|command palette/i.test(e.getAttribute('aria-label') || e.textContent)).map(e => e.getBoundingClientRect());
  const cands = [...document.querySelectorAll('a,button,input,textarea,p,span,small,li,h1,h2,h3')].filter(e => {
    if (e.closest('button,a') && e.tagName !== 'A' && e.tagName !== 'BUTTON') { /* leaf inside control handled by control */ }
    const cs = getComputedStyle(e); if (cs.position === 'fixed' || e.closest('[aria-label="Ask my portfolio"],[aria-label="Open command palette"]')) return false;
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
    const leaf = e.tagName === 'A' || e.tagName === 'BUTTON' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    return leaf && r.bottom > 0 && r.top < innerHeight;
  });
  const hits = new Set();
  for (const e of cands) { const r = e.getBoundingClientRect(); for (const f of fl) if (r.left < f.right - 2 && r.right > f.left + 2 && r.top < f.bottom - 2 && r.bottom > f.top + 2) hits.add((e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || e.tagName).trim().slice(0, 40)); }
  return [...hits];
});
for (const [name, port] of Object.entries(S)) {
  R[name] = { overlaps: {}, drawer: {}, chatRow: {}, chips: {}, errors: [] };
  const shotDir = name === 'original' ? `${OUT}/original_shots` : `${SUB}/${name}_MobileAuditFixes/after_screenshots`; fs.mkdirSync(shotDir, { recursive: true });
  for (const [w, h] of [[390, 844], [320, 568]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
    p.on('console', m => { if (m.type() === 'error') R[name].errors.push(m.text().slice(0, 120)); });
    for (const u of pages) {
      await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' }); await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(500);
      R[name].overlaps[`${w} ${u} (bottom)`] = await overlap(p);
      if (u === '/about') await p.screenshot({ path: `${shotDir}/after_${w}x${h}_about_bottom.png` });
    }
    for (const u of views) {
      await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      R[name].overlaps[`${w} ${u}`] = await overlap(p);
      if (u.includes('chat')) {
        R[name].chatRow[w] = await p.evaluate(() => { const c = [...document.querySelectorAll('*')].find(e => /AI Concierge/i.test(e.textContent) && e.children.length === 0); if (!c) return 'no concierge'; let row = c; while (row && !(row.textContent.includes('Back to') && row.textContent.includes('Talk'))) row = row.parentElement; const items = [...row.querySelectorAll('a,button,span')].filter(e => e.children.length === 0 || e.tagName !== 'SPAN').filter(e => e.textContent.trim()); const vw = innerWidth;
          const r = row.getBoundingClientRect(); return { rowH: Math.round(r.height), rowOverflow: row.scrollWidth - row.clientWidth, conciergeRight: Math.round(c.getBoundingClientRect().right), vw, clippedItems: items.filter(e => { const q = e.getBoundingClientRect(); return q.right > vw || q.left < 0 || e.scrollWidth > e.clientWidth + 1; }).map(e => e.textContent.trim().slice(0, 20)), backToClassicLines: (() => { const b = [...row.querySelectorAll('a,button')].find(e => /Back to/.test(e.textContent)); return b ? Math.round(b.getBoundingClientRect().height) : null; })() }; });
        R[name].chips[w] = await p.evaluate(() => { const chips = [...document.querySelectorAll('button')].filter(e => e.textContent.trim().endsWith('?') || /Tell me about/.test(e.textContent)); const vis = chips.filter(e => { const r = e.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= 0 && r.bottom <= innerHeight && el && (e === el || e.contains(el)); }); const inp = document.querySelector('input[placeholder*="Ask"], textarea'); const ir = inp?.getBoundingClientRect(); return { total: chips.length, fullyVisibleAndClickable: vis.length, inputBottom: ir && Math.round(ir.bottom), vh: innerHeight, pageScrollH: document.documentElement.scrollHeight }; });
        await p.screenshot({ path: `${shotDir}/after_${w}x${h}_chat_view.png` });
      }
    }
    // drawer
    await p.goto(`http://localhost:${port}/about`, { waitUntil: 'networkidle' });
    const burger = p.locator('button[aria-controls], button[aria-label*="menu" i], button[aria-label*="navigation" i]').filter({ hasNot: p.locator('[aria-label="Open command palette"]') }).first();
    await burger.click(); await p.waitForTimeout(700);
    const d = await p.evaluate(() => { const bd = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && /inset-0|backdrop|bg-bg-base\//.test(e.className?.toString?.() || '') && !/panel|inset-x/.test(e.className.toString())).map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { h: Math.round(r.height), top: Math.round(r.top), bg: cs.backgroundColor, parent: e.parentElement.tagName }; }); return { backdrops: bd, bodyOverflow: document.body.style.overflow || getComputedStyle(document.body).overflow, htmlOverflow: document.documentElement.style.overflow }; });
    await p.screenshot({ path: `${shotDir}/after_${w}x${h}_menu_open.png` });
    // tap outside: below the drawer panel, centre-ish, avoiding floating buttons
    const panelBottom = await p.evaluate(() => Math.max(...[...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && /inset-x-0/.test(e.className?.toString?.() || '')).map(e => e.getBoundingClientRect().bottom), 0));
    const ty = Math.min(h - 120, Math.round(panelBottom + (h - panelBottom) / 2)); d.tapPoint = [Math.round(w / 2), ty];
    await p.touchscreen.tap(Math.round(w / 2), ty).catch(() => p.mouse.click(Math.round(w / 2), ty)); await p.waitForTimeout(600);
    d.closedByTapOutside = await burger.getAttribute('aria-expanded').then(v => v === 'false' || v === null).catch(() => null);
    d.urlAfterTap = new URL(p.url()).pathname;
    await burger.click(); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    d.closedByEscape = await burger.getAttribute('aria-expanded').then(v => v === 'false' || v === null).catch(() => null);
    d.bodyOverflowAfterClose = await p.evaluate(() => document.body.style.overflow);
    R[name].drawer[w] = d;
    await p.close();
  }
  // desktop
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [u, tag] of [['/about', 'about_bottom'], ['/?view=chat', 'chat_view'], ['/?view=developer', 'developer_view']]) {
    await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    if (u === '/about') await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(400);
    R[name][`desktop_${tag}`] = await p.evaluate(() => { const m = document.querySelector('main'); const f = document.querySelector('footer'); const q = (e) => e && (({ top, height }) => ({ top: Math.round(top), h: Math.round(height) }))(e.getBoundingClientRect()); return { main: q(m), mainPad: m && getComputedStyle(m).padding, footer: q(f), footerInner: f && [...f.querySelectorAll('div')].map(d => getComputedStyle(d).paddingBottom).join(','), docH: document.documentElement.scrollHeight }; });
    await p.screenshot({ path: `${shotDir}/after_1440x900_${tag}.png` });
  }
  await p.close();
}
await b.close(); fs.writeFileSync(`${OUT}/comparison.json`, JSON.stringify(R, null, 2));
