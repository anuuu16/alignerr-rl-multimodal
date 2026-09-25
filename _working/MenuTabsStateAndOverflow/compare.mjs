import { chromium } from '@playwright/test';
import fs from 'fs';
const [SUB, OUT] = process.argv.slice(2);
const S = { original: 3700, Astra: 3701, Gemini: 3702 }; const R = {};
const b = await chromium.launch();
const sel = (p) => p.evaluate(() => { const t = document.querySelector('[role=tab][aria-selected="true"]'); if (!t) return null; const r = t.getBoundingClientRect(); return { label: t.textContent.trim(), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, fullyVisible: r.left >= 0 && r.right <= innerWidth, url: location.pathname + location.search + location.hash, scrollY: Math.round(scrollY) }; });
const tab = (p, name) => p.getByRole('tab', { name: new RegExp('^' + name + '$', 'i') });
for (const [n, port] of Object.entries(S)) {
  const r = R[n] = {}; const errs = [];
  const dir = n === 'original' ? `${OUT}/original_shots` : `${SUB}/${n}_MenuTabsStateAndOverflow/after_screenshots`; fs.mkdirSync(dir, { recursive: true });
  // 1. tabs at 320 and 360: tap Drinks; End key
  for (const w of [320, 360]) {
    const c = await b.newContext({ viewport: { width: w, height: 640 }, deviceScaleFactor: 2, hasTouch: true }); const p = await c.newPage(); p.on('console', m => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
    await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await tab(p, 'Starters').scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -120)); await p.waitForTimeout(300);
    const y0 = await p.evaluate(() => Math.round(scrollY));
    await tab(p, 'Drinks').tap(); await p.waitForTimeout(900);
    const s = await sel(p); s.pageJumpPx = s.scrollY - y0; r[`${w} tap Drinks`] = s;
    if (w === 320) await p.screenshot({ path: `${dir}/after_320_drinks_tapped.png` });
    await tab(p, 'Starters').click(); await p.waitForTimeout(500); await tab(p, 'Starters').focus(); await p.keyboard.press('End'); await p.waitForTimeout(900);
    r[`${w} End key`] = await sel(p);
    await p.keyboard.press('Home'); await p.waitForTimeout(500); r[`${w} Home key`] = (await sel(p))?.label;
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400); r[`${w} ArrowRight`] = (await sel(p))?.label;
    r[`${w} focusedIsSelected`] = await p.evaluate(() => document.activeElement?.getAttribute('aria-selected') === 'true');
    await c.close();
  }
  // 2. tab strip unchanged at 390 / 1440 (initial)
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const p = await c.newPage();
    await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    r[`${w} tab rects`] = await p.evaluate(() => [...document.querySelectorAll('[role=tab]')].map(t => { const q = t.getBoundingClientRect(); return [t.textContent.trim(), Math.round(q.left), Math.round(q.width)]; }));
    await p.locator('[role=tablist]').screenshot({ path: `${dir}/after_${w}_tabstrip_initial.png` });
    await c.close();
  }
  // 3. Back flow at 390 and 1440
  for (const [w, h] of [[390, 844], [1440, 900], [320, 640]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const p = await c.newPage();
    await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await tab(p, 'Desserts').click(); await p.waitForTimeout(600);
    const link = p.locator('[role=tabpanel]:not([hidden]) a', { hasText: /reserve a table/i }).nth(1);
    await link.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); const before = await sel(p);
    await link.click(); await p.waitForURL(/reserve/); await p.waitForTimeout(800); r[`${w} reserve url`] = new URL(p.url()).pathname + new URL(p.url()).search;
    await p.goBack(); await p.waitForTimeout(1500); const after = await sel(p);
    r[`${w} back`] = { selected: after?.label, url: after?.url, scrollBefore: before.scrollY, scrollAfter: after?.scrollY };
    if (w === 390) await p.screenshot({ path: `${dir}/after_390_after_back.png` });
    await c.close();
  }
  // 4. history flooding: / -> /menu -> 3 tab clicks -> Back once
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
    await p.goto(`http://localhost:${port}/`, { waitUntil: 'load' }); await p.waitForTimeout(1200); await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    for (const t of ['Mains', 'Desserts', 'Drinks']) { await tab(p, t).click(); await p.waitForTimeout(400); }
    await p.goBack(); await p.waitForTimeout(1200);
    r['history: after 3 tab clicks, Back once lands on'] = new URL(p.url()).pathname + new URL(p.url()).search + ' | selected=' + ((await sel(p))?.label ?? '-');
    await c.close(); }
  // 5. deep links
  for (const q of ['?category=desserts', '?category=nonsense', '#desserts']) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
    await p.goto(`http://localhost:${port}/menu${q}`, { waitUntil: 'load' }); await p.waitForTimeout(1200); await p.waitForTimeout(600);
    r[`deep link ${q}`] = (await sel(p))?.label; await c.close();
  }
  // 6. first HTML / no-JS render
  { const c = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, deviceScaleFactor: 2 }); const p = await c.newPage();
    await p.goto(`http://localhost:${port}/menu?category=desserts`); await p.waitForTimeout(500);
    r['no-JS render'] = await p.evaluate(() => ({ tabs: document.querySelectorAll('[role=tab]').length, reserveLinks: [...document.querySelectorAll('a')].filter(a => /reserve a table/i.test(a.textContent)).length, visibleDishes: [...document.querySelectorAll('[role=tabpanel]:not([hidden]) h3, [role=tabpanel]:not([hidden]) li')].length }));
    await p.evaluate(() => { const s = document.querySelector('[role=tablist]') || document.querySelector('section'); s?.scrollIntoView(); }); await p.screenshot({ path: `${dir}/after_390_menu_without_javascript.png` });
    await c.close(); }
  r.consoleErrors = [...new Set(errs)];
}
await b.close(); fs.writeFileSync(`${OUT}/comparison.json`, JSON.stringify(R, null, 2)); console.log(JSON.stringify(R, null, 1));
