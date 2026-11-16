// Render public/og-image.png (1200×630) from the brand mark and tagline.
// Usage: node scripts/make-og-image.mjs   (needs the Playwright Chromium already installed)
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const mark = readFileSync('src/assets/brand/haki-mark.svg', 'utf8').replace(/<\?xml[^>]*\?>/, '');
const font = readFileSync('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2').toString('base64');
const html = `<!doctype html><html><head><style>
@font-face{font-family:SG;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:300 700}
body{margin:0;width:1200px;height:630px;background:radial-gradient(700px 500px at 80% 20%,rgba(158,226,191,.12),transparent 60%),#060a08;display:flex;align-items:center;gap:64px;padding:0 90px;box-sizing:border-box;font-family:SG}
.m{width:360px;flex:none;filter:drop-shadow(0 0 40px rgba(158,226,191,.35))}
h1{color:#e8f1ec;font-size:76px;line-height:1;letter-spacing:-.03em;margin:0;font-weight:600}
p{color:#9ee2bf;font-size:26px;margin:28px 0 0;letter-spacing:.14em;text-transform:uppercase;font-weight:600}
</style></head><body><div class="m">${mark}</div><div><h1>Technology to better your business.</h1><p>Haki Tools · Maryland · US-wide</p></div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('Wrote public/og-image.png');
