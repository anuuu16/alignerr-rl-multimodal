import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2]; const b = await chromium.launch(); const extra = {};
for (const [m, port] of [['Astra', 3401], ['Gemini', 3402]]) {
  const dir = `${SUB}/${m}_MobileAuditFixes/recordings`; fs.mkdirSync(dir, { recursive: true });
  // 1) menu: open, tap outside, reopen, Escape
  let ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, recordVideo: { dir, size: { width: 390, height: 844 } } });
  let p = await ctx.newPage(); const W = ms => p.waitForTimeout(ms);
  await p.goto(`http://localhost:${port}/about`, { waitUntil: 'networkidle' }); await W(1000);
  const burger = p.locator('button[aria-controls], button[aria-label*="menu" i], button[aria-label*="navigation" i]').filter({ hasNot: p.locator('[aria-label="Open command palette"]') }).first();
  await burger.click(); await W(1200); await p.touchscreen.tap(195, 650); await W(1200);
  await burger.click(); await W(1000); await p.keyboard.press('Escape'); await W(1200);
  await ctx.close(); let v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !f.startsWith('menu') && !f.startsWith('chat') && !f.startsWith('about')); fs.renameSync(`${dir}/${v}`, `${dir}/menu_390px_open_tap_outside_escape.webm`);
  // 2) chat at 320: row, scroll chips, send button
  ctx = await b.newContext({ viewport: { width: 320, height: 568 }, hasTouch: true, recordVideo: { dir, size: { width: 320, height: 568 } } });
  p = await ctx.newPage();
  await p.goto(`http://localhost:${port}/?view=chat`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const sc = p.locator('main .overflow-y-auto').first(); await sc.evaluate(e => e.scrollTo({ top: e.scrollHeight, behavior: 'smooth' })).catch(() => {}); await p.waitForTimeout(1200);
  await sc.evaluate(e => e.scrollTo({ top: 0, behavior: 'smooth' })).catch(() => {}); await p.waitForTimeout(800);
  await p.locator('input[placeholder], textarea').first().fill('What did you build at Ascendion?'); await p.waitForTimeout(1200);
  extra[m] = await p.evaluate(() => { const s = [...document.querySelectorAll('button')].find(e => /send/i.test(e.getAttribute('aria-label') || '') || e.type === 'submit'); const r = s.getBoundingClientRect(); return { sendLeft: Math.round(r.left), sendRight: Math.round(r.right), viewport: innerWidth, sendFullyVisible: r.right <= innerWidth }; });
  await p.screenshot({ path: `${SUB}/${m}_MobileAuditFixes/after_screenshots/after_320x568_chat_composer_typed.png` });
  await ctx.close(); v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !f.startsWith('menu') && !f.startsWith('chat')); fs.renameSync(`${dir}/${v}`, `${dir}/chat_320px_row_scroll_composer.webm`);
}
await b.close(); console.log(JSON.stringify(extra));
