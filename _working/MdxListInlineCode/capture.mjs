import { chromium } from '@playwright/test';
import fs from 'fs';
const [SUB, allPagesJson] = process.argv.slice(2);
const T = 'MdxListInlineCode';
const models = { Astra: 3201, Gemini: 3202 };
const pages = ['/projects/mindforge','/projects/agent-forge','/projects/contextos','/projects/tombstone','/projects/graph-forge','/projects/ag-bash','/projects/trelix','/projects/grpc-microservices','/projects/not-humans-lab','/projects/commandvault','/projects/inkforge','/work/pensieve','/work/aava-code','/work/wireframe-generator','/work/prompt-to-react','/work/execution-engine'];
const all = JSON.parse(fs.readFileSync(allPagesJson));
const b = await chromium.launch();
for (const [m, port] of Object.entries(models)) {
  const dir = `${SUB}/${m}_${T}/after_screenshots`; fs.mkdirSync(dir, { recursive: true });
  const meas = { bulletDots: {}, layoutAllPages: { '390': all[m]['390'], '1440': all[m]['1440'] }, originalAllPages: { '390': all.original['390'], '1440': all.original['1440'] } };
  for (const w of [390, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    let visible = 0, invisible = 0, colors = new Set();
    for (const u of pages) {
      await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => [...document.querySelectorAll('ul > li')].filter(li => getComputedStyle(li, '::before').width === '4px').map(li => getComputedStyle(li, '::before').backgroundColor));
      r.forEach(c => { colors.add(c); (c === 'rgba(0, 0, 0, 0)' ? invisible++ : visible++); });
      if (u === '/projects/trelix' || u === '/work/aava-code') {
        const slug = u.split('/').pop();
        const ul = p.locator('ul:has(> li)').filter({ has: p.locator('li') }).nth(u === '/projects/trelix' ? 1 : 0);
        const target = u === '/projects/trelix' ? p.locator('li:has(code)').first().locator('xpath=..') : p.locator('article ul, main ul').filter({ has: p.locator('li') }).last();
        await target.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
        await target.screenshot({ path: `${dir}/after_${w}px_${slug}_list.png` });
        if (u === '/projects/trelix') await target.locator('li').nth(3).screenshot({ path: `${dir}/after_${w}px_trelix_bullet_closeup.png` });
      }
    }
    meas.bulletDots[w] = { visibleDots: visible, invisibleDots: invisible, dotColors: [...colors] };
    await p.close();
  }
  fs.writeFileSync(`${SUB}/${m}_${T}/measurements.json`, JSON.stringify(meas, null, 2));
  console.log(m, JSON.stringify(meas.bulletDots));
}
// originals for reference (same crops)
for (const w of [390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  for (const u of ['/projects/trelix', '/work/aava-code']) {
    await p.goto(`http://localhost:3200${u}`, { waitUntil: 'networkidle' });
    const slug = u.split('/').pop();
    const target = u === '/projects/trelix' ? p.locator('li:has(code)').first().locator('xpath=..') : p.locator('article ul, main ul').filter({ has: p.locator('li') }).last();
    await target.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    for (const m of Object.keys(models)) await target.screenshot({ path: `${SUB}/${m}_${T}/after_screenshots/before_${w}px_${slug}_list.png` });
  }
  await p.close();
}
await b.close();
