import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('test-results/native-a11y/screenshots',{recursive:true});
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
const paths=[...sitemap.matchAll(/<loc>https:\/\/assistenciadorus\.com\.br([^<]*)<\/loc>/g)].map(m=>m[1]||'/');
const pages=[...new Set(paths.includes('/')?paths:['/',...paths])];
const sizes=[['mobile-390',390,844],['desktop-1366',1366,768]];
const browser=await chromium.launch({headless:true});
const report=[],failures=[];
const label=path=>path==='/'?'home':path.replace(/^\//,'').replace(/\/$/,'').replace(/\//g,'--');
for(const [size,width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',forcedColors:'active'});
  for(const path of pages){
    const page=await context.newPage();
    const runtime=[];
    page.on('pageerror',e=>runtime.push(e.message));
    const response=await page.goto('http://127.0.0.1:4174'+path,{waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForTimeout(300);
    await page.evaluate(()=>{document.documentElement.style.fontSize='200%'});
    const metrics=await page.evaluate(()=>{
      const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const clipped=[];
      document.querySelectorAll('main h1,main h2,main h3,main p,main a,main label,main button,main summary').forEach(e=>{
        if(!visible(e)||!e.textContent.trim())return;
        const s=getComputedStyle(e);
        if(/hidden|clip/.test(`${s.overflow} ${s.overflowX} ${s.overflowY}`)&&(e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2))clipped.push(e.textContent.trim().slice(0,80));
      });
      return {
        native:document.documentElement.dataset.a11yNative,
        reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
        forced:matchMedia('(forced-colors: active)').matches,
        widget:document.querySelectorAll('.a11y-tools,[data-a11y-launcher]').length,
        h1:document.querySelectorAll('main h1').length,
        overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
        clipped,
        outside:[...document.querySelectorAll('main h1,main h2,main h3,main p,main button')].filter(e=>visible(e)&&!e.closest('.carousel-track')&&e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,text:e.textContent.trim().slice(0,80),right:Math.round(e.getBoundingClientRect().right),width:Math.round(e.getBoundingClientRect().width)})).slice(0,15)
      };
    });
    const reasons=[];
    if(response?.status()!==200)reasons.push(`HTTP ${response?.status()}`);
    if(metrics.native!=='ready'||!metrics.reduced||!metrics.forced)reasons.push('preferências nativas não aplicadas');
    if(metrics.widget!==0)reasons.push('widget legado presente');
    if(metrics.h1!==1)reasons.push(`H1 esperado 1, encontrado ${metrics.h1}`);
    if(metrics.overflow>1)reasons.push(`overflow em 200%: ${metrics.overflow}px`);
    if(metrics.clipped.length)reasons.push(`texto cortado em 200%: ${metrics.clipped.length}`);
    if(runtime.length)reasons.push(`runtime: ${runtime.join(' | ')}`);
    const row={size,path,metrics,runtime,reasons,failed:reasons.length>0};
    report.push(row);if(row.failed)failures.push(row);
    await page.screenshot({path:`test-results/native-a11y/screenshots/${size}-${label(path)}.png`,fullPage:true});
    await page.close();
  }
  await context.close();
}
await browser.close();
fs.writeFileSync('test-results/native-a11y/report.json',JSON.stringify(report,null,2));
fs.writeFileSync('test-results/native-a11y/high-severity-failures.json',JSON.stringify(failures,null,2));
fs.writeFileSync('test-results/native-a11y/summary.md',`# QA acessibilidade nativa — HIGH\n\nPáginas: ${pages.length}\nCenários: ${report.length}\nFalhas HIGH: ${failures.length}\n\nCritérios: preferências do sistema, cores forçadas, redução de movimento, ausência do widget e texto em 200% sem corte ou rolagem horizontal.`);
if(failures.length){console.error(JSON.stringify(failures.slice(0,30),null,2));process.exit(1)}
console.log(`OK: ${report.length} cenários de acessibilidade nativa.`);
