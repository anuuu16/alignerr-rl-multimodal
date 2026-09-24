import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2]; const b = await chromium.launch();
for (const [m, port] of [['Astra', 3301], ['Gemini', 3302]]) {
  const dir = `${SUB}/${m}_MobileMenuOverlay/recordings`; fs.mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, recordVideo: { dir, size: { width: 390, height: 844 } } });
  const p = await ctx.newPage(); const W = (ms) => p.waitForTimeout(ms);
  const openBtn = () => p.getByRole('button', { name: /open navigation/i }).click();
  await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' }); await W(1200);
  await openBtn(); await W(1200);                                   // open: full-screen, FAB covered
  for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); await W(350); }
  await p.keyboard.press('Escape'); await W(1000);                  // Escape closes
  await openBtn(); await W(800); await p.getByRole('button', { name: /close navigation/i }).click(); await W(1000); // X closes
  await openBtn(); await W(800); await p.locator('#mobile-menu a', { hasText: /^home$/i }).click(); await W(1000); // Home on home closes
  await p.mouse.wheel(0, 600); await W(800); await p.mouse.wheel(0, -600); await W(600); // page scroll restored
  await openBtn(); await W(800); await p.locator('#mobile-menu a', { hasText: /^menu$/i }).click(); await W(2000); // navigates + closes
  await openBtn(); await W(800); await p.setViewportSize({ width: 1024, height: 844 }); await W(1500); // resize closes, desktop nav
  await ctx.close();
  const v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !f.startsWith('interaction'));
  fs.renameSync(`${dir}/${v}`, `${dir}/interaction_390px_open_tab_escape_x_links_resize.webm`);
  console.log(m, 'recorded');
}
await b.close();
