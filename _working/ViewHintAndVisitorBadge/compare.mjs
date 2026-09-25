import { chromium } from '@playwright/test';
import fs from 'fs';
const [SUB, OUT] = process.argv.slice(2);
const S = { original: 3600, Astra: 3601, Gemini: 3602 }; const R = {};
const b = await chromium.launch();
const KEY = 'anvilry:visits:total';
const badge = (p) => p.evaluate((KEY) => { const f = document.querySelector('footer'); const sk = f.querySelector('.animate-pulse'); const t = [...f.querySelectorAll('span')].find(e => /visited/.test(e.textContent)); const name = [...f.querySelectorAll('p')].find(e => /Engineer/.test(e.textContent)); const nb = name?.getBoundingClientRect(); const row = f.querySelector('div').getBoundingClientRect(); return { skeleton: !!sk, text: t?.textContent.trim() || null, cache: localStorage.getItem(KEY), footerRowH: Math.round(row.height) }; }, KEY);
const states = {
  'A first visit, API total 0': { route: null },
  'B cached 1234, API total 0': { cache: '1234', route: null },
  'C first visit, API 500': { route: r => r.fulfill({ status: 500, body: 'x' }) },
  'C2 first visit, network error': { route: r => r.abort() },
  'D first visit, API 4321': { route: r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"total":4321,"today":3}' }) },
  'E first visit, API hangs': { route: () => {} },
  'E2 cached 1234, API hangs': { cache: '1234', route: () => {} },
  'F cached 1234, API 500': { cache: '1234', route: r => r.fulfill({ status: 500, body: 'x' }) },
};
for (const [n, port] of Object.entries(S)) {
  R[n] = { hint: {}, badge: {}, errors: [] };
  const dir = n === 'original' ? `${OUT}/original_shots` : `${SUB}/${n}_ViewHintAndVisitorBadge/after_screenshots`; fs.mkdirSync(dir, { recursive: true });
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    // hint on routes
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error') R[n].errors.push(m.text().slice(0, 120)); });
    for (const u of ['/work', '/projects', '/articles', '/work/pensieve', '/']) {
      await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(8500);
      R[n].hint[`${w} ${u}`] = await p.evaluate(() => !![...document.querySelectorAll('div')].find(e => /Try a different view/.test(e.textContent) && getComputedStyle(e).position === 'fixed'));
      if (['/work', '/projects', '/'].includes(u)) await p.screenshot({ path: `${dir}/after_${w}_${u === '/' ? 'home' : u.slice(1)}_after_8s.png` });
    }
    // dismiss on home, reload, still dismissed; then client-nav to /work and back
    const close = p.locator('button[aria-label*="ismiss" i], button[aria-label*="close" i]').filter({ has: p.locator('svg') }).first();
    R[n].hint[`${w} dismiss works`] = await close.click({ timeout: 3000 }).then(async () => { await p.waitForTimeout(400); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(8500); return !(await p.evaluate(() => !![...document.querySelectorAll('div')].find(e => /Try a different view/.test(e.textContent) && getComputedStyle(e).position === 'fixed'))); }).catch(e => 'ERR ' + e.message.slice(0, 50));
    await ctx.close();
    // badge states
    for (const [sname, st] of Object.entries(states)) {
      const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const q = await c.newPage();
      if (st.route) await q.route('**/api/visit', st.route);
      if (st.cache) await c.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, [KEY, st.cache]);
      await q.goto(`http://localhost:${port}/about`, { waitUntil: 'domcontentloaded' }); await q.evaluate(() => window.scrollTo(0, 1e6));
      await q.waitForTimeout(sname.startsWith('E') ? 15000 : 4000);
      R[n].badge[`${w} ${sname}`] = await badge(q);
      if (w === 1440 && ['A first visit, API total 0', 'B cached 1234, API total 0', 'D first visit, API 4321', 'E first visit, API hangs'].includes(sname)) await q.locator('footer').screenshot({ path: `${dir}/after_1440_footer_${sname.split(' ')[0]}_${sname.replace(/[^a-z0-9]+/gi, '_').slice(2, 40)}.png` });
      await c.close();
    }
  }
}
await b.close(); fs.writeFileSync(`${OUT}/comparison.json`, JSON.stringify(R, null, 2));
