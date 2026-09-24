import { chromium } from '@playwright/test';
import fs from 'fs';
const [outJson] = process.argv.slice(2);
const servers = { original: 3200, Astra: 3201, Gemini: 3202 };
const pages = ['/projects/mindforge','/projects/agent-forge','/projects/contextos','/projects/tombstone','/projects/graph-forge','/projects/ag-bash','/projects/trelix','/projects/grpc-microservices','/projects/not-humans-lab','/projects/commandvault','/projects/inkforge','/work/pensieve','/work/aava-code','/work/wireframe-generator','/work/prompt-to-react','/work/execution-engine'];
const b = await chromium.launch(); const res = {};
for (const [name, port] of Object.entries(servers)) {
  res[name] = {};
  for (const w of [390, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    let tot = { li: 0, splitLi: 0, maxCodeH: 0, codeStretched: 0, dotMisaligned: 0, liHeightSum: 0, textLeftSet: new Set(), dotLeftSet: new Set() };
    for (const u of pages) {
      await p.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => {
        const lis = [...document.querySelectorAll('ul > li')].filter(li => getComputedStyle(li, '::before').content !== 'none' && getComputedStyle(li, '::before').width === '4px');
        const out = { li: lis.length, splitLi: 0, maxCodeH: 0, codeStretched: 0, dotMisaligned: 0, liHeightSum: 0, textLeft: [], dotLeft: [] };
        for (const li of lis) {
          const lr = li.getBoundingClientRect(); out.liHeightSum += lr.height;
          // split = two inline descendants that start on different x columns but overlap vertically at the top line with a gap > 20px AND are not on the same text line
          const range = document.createRange(); range.selectNodeContents(li); const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
          const lineH = parseFloat(getComputedStyle(li).lineHeight) || 24;
          const tops = rects.map(r => Math.round(r.top));
          const firstTop = Math.min(...tops);
          const firstLine = rects.filter(r => Math.abs(r.top - firstTop) < lineH / 2);
          // in normal flow, first line fragments are contiguous; flex-split gives multiple columns each with multi-line content -> rects on first line separated but also stacked
          const cols = new Set(rects.map(r => Math.round(r.left / 4)));
          const multiLineLeftEdges = new Set(rects.filter(r => r.top > firstTop + lineH / 2).map(r => Math.round(r.left)));
          if (multiLineLeftEdges.size > 1) out.splitLi++;
          for (const c of li.querySelectorAll('code')) { const h = c.getBoundingClientRect().height; out.maxCodeH = Math.max(out.maxCodeH, h); if (h > lineH * 1.5) out.codeStretched++; }
          const bs = getComputedStyle(li, '::before');
          // dot position: approximate using li padding/left and before margin-top/top
          const textLeft = Math.round(Math.min(...rects.map(r => r.left)) - lr.left); out.textLeft.push(textLeft);
          const dotTop = bs.position === 'absolute' ? parseFloat(bs.top) : parseFloat(bs.marginTop);
          out.dotLeft.push(`${bs.position}:${dotTop}`);
          if (Math.abs(dotTop - 8) > 1) out.dotMisaligned++;
        }
        return out;
      });
      for (const k of ['li','splitLi','codeStretched','dotMisaligned']) tot[k] += r[k];
      tot.maxCodeH = Math.max(tot.maxCodeH, r.maxCodeH); tot.liHeightSum += r.liHeightSum;
      r.textLeft.forEach(x => tot.textLeftSet.add(x)); r.dotLeft.forEach(x => tot.dotLeftSet.add(x));
    }
    tot.textLeftSet = [...tot.textLeftSet]; tot.dotLeftSet = [...tot.dotLeftSet]; tot.liHeightSum = Math.round(tot.liHeightSum); tot.consoleErrors = [...new Set(errs)];
    res[name][w] = tot; await p.close();
  }
}
await b.close(); fs.writeFileSync(outJson, JSON.stringify(res, null, 2)); console.log(JSON.stringify(res, null, 1));
