import { chromium } from '@playwright/test';
import fs from 'fs';
const SUB = process.argv[2]; const b = await chromium.launch();
for (const [m, port] of [['Astra', 3501], ['Gemini', 3502]]) {
  const dir = `${SUB}/${m}_ScrollbarAndResumeSeam/recordings`; fs.mkdirSync(dir, { recursive: true });
  for (const [w, h, tag] of [[320, 568, 'chat_320x568_try_to_reach_input'], [1440, 900, 'chat_and_developer_1440_wheel']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500, recordVideo: { dir, size: { width: w, height: h } } });
    const p = await ctx.newPage(); const W = ms => p.waitForTimeout(ms);
    await p.goto(`http://localhost:${port}/?view=chat`, { waitUntil: 'networkidle' }); await W(1500);
    await p.mouse.move(w / 2, h * 0.75); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 300); await W(500); }
    const cdp = await ctx.newCDPSession(p); await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(w / 2), y: Math.round(h * 0.8), yDistance: -500, speed: 800, gestureSourceType: w < 500 ? 'touch' : 'mouse' }).catch(() => {}); await W(1200);
    if (w > 500) { await p.goto(`http://localhost:${port}/?view=developer`, { waitUntil: 'networkidle' }); await W(1200); await p.mouse.move(w / 2, h / 2); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 300); await W(500); } }
    await ctx.close(); const v = fs.readdirSync(dir).find(f => f.endsWith('.webm') && !f.startsWith('chat')); fs.renameSync(`${dir}/${v}`, `${dir}/${tag}.webm`);
  }
}
await b.close(); console.log('recorded');
