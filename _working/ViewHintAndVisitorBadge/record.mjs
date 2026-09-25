import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2]; const b = await chromium.launch();
for (const [m, port] of [['Astra', 3601], ['Gemini', 3602]]) {
  const dir = `${SUB}/${m}_ViewHintAndVisitorBadge/recordings`; fs.mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 500 }, recordVideo: { dir, size: { width: 1440, height: 500 } } });
  const p = await ctx.newPage(); await p.route('**/api/visit', () => {}); // request never completes
  await p.goto(`http://localhost:${port}/about`, { waitUntil: 'domcontentloaded' }); await p.evaluate(() => window.scrollTo(0, 1e6));
  await p.waitForTimeout(14000); await ctx.close();
  const v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !f.startsWith('footer')); fs.renameSync(`${dir}/${v}`, `${dir}/footer_first_visit_api_hangs_14s.webm`);
}
await b.close(); console.log('recorded');
