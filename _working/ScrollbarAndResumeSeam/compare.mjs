import { chromium } from '@playwright/test';
import fs from 'fs';
const [SUB, OUT] = process.argv.slice(2);
const S = { original: 3500, Astra: 3501, Gemini: 3502 }; const R = {};
const b = await chromium.launch();
const metrics = (p) => p.evaluate(() => {
  const de = document.documentElement, bd = document.body, cs = getComputedStyle(de), bs = getComputedStyle(bd);
  const nav = document.querySelector('header').getBoundingClientRect();
  const main = document.querySelector('#main-content') || document.querySelector('main');
  const inp = document.querySelector('main input, main textarea, [role="log"] ~ * input, input[placeholder]');
  const ir = inp?.getBoundingClientRect();
  // anything visible pushed below the fold inside main (clipped by overflow hidden?)
  const below = [...document.querySelectorAll('main button, main input, main a, main textarea')].filter(e => e.offsetParent && e.getBoundingClientRect().top >= innerHeight - 1 && !e.closest('[role="log"]') && !e.closest('.overflow-y-auto')).length;
  return { vh: innerHeight, docScrollH: de.scrollHeight, overflowPx: de.scrollHeight - innerHeight, bodyScrollMinusClient: bd.scrollHeight - bd.clientHeight, htmlOverflow: cs.overflowY, bodyOverflow: bs.overflowY, navTop: Math.round(nav.top), inputBottom: ir && Math.round(ir.bottom), inputVisible: ir ? ir.bottom <= innerHeight && ir.top >= 0 : null, controlsBelowFold: below };
});
for (const [n, port] of Object.entries(S)) {
  R[n] = {};
  const dir = n === 'original' ? `${OUT}/original_shots` : `${SUB}/${n}_ScrollbarAndResumeSeam/after_screenshots`; fs.mkdirSync(dir, { recursive: true });
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844], [320, 568]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    for (const v of ['chat', 'developer']) {
      await p.goto(`http://localhost:${port}/?view=${v}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      const m = await metrics(p);
      await p.mouse.move(Math.round(w / 2), Math.round(h / 2)); await p.mouse.wheel(0, 500); await p.waitForTimeout(400);
      m.scrollYAfterWheel = await p.evaluate(() => scrollY); m.navTopAfterWheel = await p.evaluate(() => Math.round(document.querySelector('header').getBoundingClientRect().top));
      if (v === 'developer') { // fill terminal
        const inp = p.locator('input[placeholder*="command" i], [role="log"] ~ * input, input').first();
        for (let i = 0; i < 4; i++) { await inp.fill('help').catch(() => {}); await inp.press('Enter').catch(() => {}); await p.waitForTimeout(250); }
        m.afterCommands = await p.evaluate(() => { const log = document.querySelector('[role="log"]'); return { docOverflow: document.documentElement.scrollHeight - innerHeight, logScroll: log ? [log.scrollHeight, log.clientHeight] : null, inputVisible: (() => { const i = document.querySelector('input'); const r = i?.getBoundingClientRect(); return r ? r.bottom <= innerHeight : null; })() }; });
      }
      R[n][`${w}x${h} ${v}`] = m;
      if ([1440, 390].includes(w)) await p.screenshot({ path: `${dir}/after_${w}x${h}_${v}_after_wheel.png` });
    }
    await p.close();
  }
  // resume pages
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    await p.goto(`http://localhost:${port}/resume`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /^web/i }).first().click().catch(() => {}); await p.waitForTimeout(1200);
    R[n][`${w} resume web`] = await p.evaluate(() => { const op = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); const bg = getComputedStyle(e).backgroundColor; return r.height > 400 && r.width > 300 && bg !== 'rgba(0, 0, 0, 0)' && !/,\s*0\)$/.test(bg); }).map(e => ({ cls: e.className.toString().slice(0, 50), bg: getComputedStyle(e).backgroundColor, h: Math.round(e.getBoundingClientRect().height) })); return { opaqueLargeBlocks: op, docH: document.documentElement.scrollHeight }; });
    await p.evaluate(() => window.scrollTo(0, 60)); await p.waitForTimeout(300);
    await p.screenshot({ path: `${dir}/after_${w}x${h}_resume_web_tab.png` });
    await p.goto(`http://localhost:${port}/?view=resume`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    R[n][`${w} ?view=resume`] = await p.evaluate(() => { const m = [...document.querySelectorAll('main')].find(e => e.offsetParent !== null && /min-h-screen/.test(e.className)); return m ? { cls: m.className.slice(0, 80), bg: getComputedStyle(m).backgroundColor } : 'no main.min-h-screen found'; });
    await p.screenshot({ path: `${dir}/after_${w}x${h}_view_resume_standalone.png` });
    await p.close();
  }
}
await b.close(); fs.writeFileSync(`${OUT}/comparison.json`, JSON.stringify(R, null, 2));
