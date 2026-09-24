import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2];
const models = { Astra: 3101, Gemini: 3102 };
const T = 'CmdPaletteMobileClip';
const b = await chromium.launch();
const results = {};
const open = async (p) => {
  await p.getByRole('button', { name: 'Open command palette', exact: true }).first().click();
  await p.waitForSelector('[cmdk-root]'); await p.waitForTimeout(600);
};
const measure = (p) => p.evaluate(() => {
  const card = document.querySelector('[cmdk-root] > div.relative').getBoundingClientRect();
  const items = [...document.querySelectorAll('[cmdk-item]')];
  const trunc = [];
  for (const it of items) for (const s of it.querySelectorAll('span')) {
    if (s.children.length === 0 && s.textContent.trim() && s.scrollWidth > s.clientWidth + 1) trunc.push(s.textContent.trim());
  }
  const input = document.querySelector('[cmdk-input]');
  return {
    vw: innerWidth, cardLeft: Math.round(card.left), cardRight: Math.round(card.right), cardWidth: Math.round(card.width),
    gapLeft: Math.round(card.left), gapRight: Math.round(innerWidth - card.right),
    pageScrollWidth: document.documentElement.scrollWidth,
    itemsOutsideViewport: items.filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.left < 0 || r.right > innerWidth); }).length,
    truncatedTexts: trunc,
    placeholder: input.placeholder, placeholderFits: input.scrollWidth <= input.clientWidth + 1,
    firstRowHeight: Math.round(items[0].getBoundingClientRect().height),
  };
});
for (const [m, port] of Object.entries(models)) {
  const dir = `${SUB}/${m}_${T}/after_screenshots`; fs.mkdirSync(dir, { recursive: true });
  results[m] = { static: {}, interaction: {} };
  for (const [w, h] of [[320, 640], [375, 720], [768, 900], [1440, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await open(p);
    results[m].static[w] = await measure(p);
    await p.screenshot({ path: `${dir}/after_${w}px_palette_open.png` });
    if (w === 320) {
      await p.locator('[cmdk-list]').evaluate(e => e.scrollTop = e.scrollHeight); await p.waitForTimeout(300);
      await p.screenshot({ path: `${dir}/after_320px_palette_scrolled_bottom.png` });
    }
    await p.close();
  }
  // interaction run, recorded
  const vdir = `${SUB}/${m}_${T}/recordings`; fs.mkdirSync(vdir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, recordVideo: { dir: vdir, size: { width: 320, height: 640 } } });
  const p = await ctx.newPage(); const I = results[m].interaction;
  await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  await open(p); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.keyboard.press('Meta+k'); await p.waitForTimeout(700);
  I.cmdKOpens = await p.locator('[cmdk-root]').isVisible();
  I.inputFocused = await p.evaluate(() => document.activeElement?.hasAttribute('cmdk-input'));
  const sel = () => p.evaluate(() => document.querySelector('[cmdk-item][data-selected=true]')?.textContent.trim().slice(0, 30));
  const s0 = await sel(); for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(250); }
  const s1 = await sel(); I.arrowDownMovesSelection = s0 !== s1; I.selectionAfter3Down = s1;
  const selBox = await p.evaluate(() => { const r = document.querySelector('[cmdk-item][data-selected=true]').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
  I.selectedRowInsideViewport = selBox[0] >= 0 && selBox[1] <= 320;
  for (let i = 0; i < 6; i++) await p.keyboard.press('Tab');
  I.focusStaysInDialogAfter6Tabs = await p.evaluate(() => !!document.activeElement?.closest('[role=dialog]'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  I.escapeCloses = !(await p.locator('[cmdk-root]').isVisible().catch(() => false));
  await p.keyboard.press('Meta+k'); await p.waitForTimeout(600);
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(700);
  I.afterResizeTo1440 = await measure(p);
  await p.setViewportSize({ width: 320, height: 640 }); await p.waitForTimeout(700);
  I.afterResizeBackTo320 = await measure(p);
  await p.keyboard.type('about'); await p.waitForTimeout(400); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  I.enterRunsCommand_urlAfter = new URL(p.url()).pathname;
  await ctx.close();
  const vids = fs.readdirSync(vdir).filter(f => f.endsWith('.webm'));
  if (vids.length) fs.renameSync(`${vdir}/${vids[0]}`, `${vdir}/interaction_320px_open_keyboard_escape_resize_enter.webm`);
}
await b.close();
fs.writeFileSync(process.argv[3], JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
