import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2]; const b = await chromium.launch();
for (const [m, port] of [['Astra', 3701], ['Gemini', 3702]]) {
  const dir = `${SUB}/${m}_MenuTabsStateAndOverflow/recordings`; fs.mkdirSync(dir, { recursive: true });
  for (const [tag, fn] of [
    ['back_after_three_tab_clicks_1440', async (p) => { await p.goto(`http://localhost:${port}/`, { waitUntil: 'load' }); await p.waitForTimeout(1000); await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200); for (const t of ['Mains', 'Desserts', 'Drinks']) { await p.getByRole('tab', { name: new RegExp('^' + t + '$', 'i') }).click(); await p.waitForTimeout(700); } await p.goBack(); await p.waitForTimeout(1800); }],
    ['desserts_reserve_back_390', async (p) => { await p.setViewportSize({ width: 390, height: 844 }); await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200); await p.getByRole('tab', { name: /^desserts$/i }).click(); await p.waitForTimeout(800); const l = p.locator('[role=tabpanel]:not([hidden]) a', { hasText: /reserve a table/i }).nth(1); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await l.click(); await p.waitForURL(/reserve/); await p.waitForTimeout(1200); await p.goBack(); await p.waitForTimeout(1800); }],
    ['tabs_320_keyboard_end_home', async (p) => { await p.setViewportSize({ width: 320, height: 640 }); await p.goto(`http://localhost:${port}/menu`, { waitUntil: 'load' }); await p.waitForTimeout(1200); await p.getByRole('tab', { name: /^starters$/i }).scrollIntoViewIfNeeded(); await p.getByRole('tab', { name: /^starters$/i }).focus(); await p.waitForTimeout(600); await p.keyboard.press('End'); await p.waitForTimeout(1200); await p.keyboard.press('Home'); await p.waitForTimeout(1000); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1200); }],
  ]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
    const p = await ctx.newPage(); await fn(p); await ctx.close();
    const v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !/^(back_|desserts_|tabs_)/.test(f)); fs.renameSync(`${dir}/${v}`, `${dir}/${tag}.webm`);
  }
}
await b.close(); console.log('recorded');
