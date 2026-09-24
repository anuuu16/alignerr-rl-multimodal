import { chromium } from '@playwright/test';
import fs from 'fs';
const [out] = process.argv.slice(2);
const S = { original: 3300, Astra: 3301, Gemini: 3302 };
const b = await chromium.launch(); const R = {};
const state = (p) => p.evaluate(() => {
  const o = document.getElementById('mobile-menu'); const hdr = document.querySelector('header'); const hs = getComputedStyle(hdr);
  const fab = [...document.querySelectorAll('a')].find(a => getComputedStyle(a).position === 'fixed' && /whatsapp|wa\.me/i.test(a.href));
  let fabCovered = null; if (fab && o) { const r = fab.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); fabCovered = !fab.contains(el); }
  const res = { header: { h: Math.round(hdr.getBoundingClientRect().height), backdrop: hs.backdropFilter, bg: hs.backgroundColor, pos: hs.position, z: hs.zIndex }, bodyOverflow: document.body.style.overflow, fabCovered };
  if (o) { const r = o.getBoundingClientRect(); const cs = getComputedStyle(o);
    const items = [...o.querySelectorAll('a,button')].map(e => { const q = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute('aria-label')).trim().slice(0, 20), top: Math.round(q.top), bottom: Math.round(q.bottom), inViewport: q.top >= 0 && q.bottom <= innerHeight, inOverlay: q.top >= r.top && q.bottom <= r.bottom }; });
    Object.assign(res, { overlay: { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), bg: cs.backgroundColor, overflowY: cs.overflowY, scrollH: o.scrollHeight, parent: o.parentElement.tagName }, items, focused: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName }); }
  return res; });
for (const [name, port] of Object.entries(S)) {
  R[name] = {};
  const open = async (p) => { if (await p.evaluate(() => !!document.getElementById('mobile-menu'))) return 'already-open'; await p.getByRole('button', { name: /open navigation/i }).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(400); return 'opened'; };
  const safe = async (fn) => { try { return await fn(); } catch (e) { return 'ERR ' + e.message.split('\n')[0].slice(0, 80); } };
  // 1. main viewport
  for (const [w, h] of [[390, 844], [320, 568], [390, 480]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
    const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
    await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    const closed = await state(p); await open(p); const opened = await state(p);
    // can the last item be scrolled into view inside the overlay?
    opened.phoneReachable = await p.evaluate(() => { const o = document.getElementById('mobile-menu'); const tel = o?.querySelector('a[href^="tel:"]'); if (!tel) return null; tel.scrollIntoView({ block: 'end' }); const q = tel.getBoundingClientRect(); return q.bottom <= innerHeight && q.top >= 0; });
    if (w === 390 && h === 844) {
      await p.evaluate(() => document.getElementById('mobile-menu')?.scrollTo(0, 0)); await p.waitForTimeout(200);
      if (name !== 'original') { fs.mkdirSync(`${out}/${name}_MobileMenuOverlay/after_screenshots`, { recursive: true }); await p.screenshot({ path: `${out}/${name}_MobileMenuOverlay/after_screenshots/after_390x844_menu_open.png` }); }
      // tab order from the last overlay element
      const tabs = []; for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); tabs.push(await p.evaluate(() => { const a = document.activeElement; return (a.closest('#mobile-menu') ? 'IN-MENU:' : 'OUTSIDE:') + (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 18); })); }
      opened.tabSequence = tabs;
      await p.keyboard.press('Escape'); await p.waitForTimeout(300); opened.afterEscape = await state(p);
      await open(p); opened.xClick = await safe(() => p.getByRole('button', { name: /close navigation/i }).click({ timeout: 3000 })); await p.waitForTimeout(300); opened.afterX = await state(p);
      await open(p); opened.homeClick = await safe(() => p.locator('#mobile-menu a', { hasText: /^home$/i }).click({ timeout: 3000 })); await p.waitForTimeout(600); opened.afterHomeTapOnHome = await state(p);
      await open(p); opened.menuClick = await safe(() => p.locator('#mobile-menu a', { hasText: /^menu$/i }).click({ timeout: 3000 })); await p.waitForTimeout(1500); opened.afterMenuLink = { url: new URL(p.url()).pathname, ...(await state(p)) };
      if (name !== 'original') { await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' }); await p.screenshot({ path: `${out}/${name}_MobileMenuOverlay/after_screenshots/after_390x844_menu_closed.png` }); }
    }
    R[name][`${w}x${h}`] = { closed, opened, consoleErrors: errs };
    if (name !== 'original' && w !== 390) { await p.evaluate(() => document.getElementById('mobile-menu')?.scrollTo(0, 0)); await p.screenshot({ path: `${out}/${name}_MobileMenuOverlay/after_screenshots/after_${w}x${h}_menu_open.png` }); }
    await p.close();
  }
  // desktop
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  R[name].desktop = await state(p);
  R[name].desktop.hamburgerVisible = await p.getByRole('button', { name: /open navigation/i }).isVisible();
  if (name !== 'original') await p.screenshot({ path: `${out}/${name}_MobileMenuOverlay/after_screenshots/after_1440x900_desktop.png` });
  // resize while open
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(400); await open(p); await p.setViewportSize({ width: 1024, height: 800 }); await p.waitForTimeout(500);
  R[name].resizeOpenTo1024 = { menuStillInDom: await p.evaluate(() => !!document.getElementById('mobile-menu')), bodyOverflow: await p.evaluate(() => document.body.style.overflow) };
  await p.close();
}
await b.close(); console.log(JSON.stringify(R, null, 1));
