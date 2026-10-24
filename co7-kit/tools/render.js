// CO7 renderer. Run from anywhere:
//   node render.js <buildDir> stills <outDir> t1 t2 ...       -> PNG stills
//   node render.js <buildDir> video <out.mp4> <voice.wav> [fps] -> final MP4 (H.264 + AAC, -14 LUFS)
//   node render.js <buildDir> cover <out.png>                  -> 9:16 cover from VIDEO.cover
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [buildDir, mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.resolve(buildDir, 'index.html'));
  await page.evaluate(() => window.__ready);

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest.map(Number)) {
      await page.evaluate(t => window.__seek(t), t);
      await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(5, '0')}.png`) });
    }
  } else if (mode === 'cover') {
    await page.evaluate(() => {
      window.__seek(VIDEO.cover.t);
      const cap = document.getElementById('cap');
      cap.style.cssText = 'top:1310px;font-size:92px;font-weight:700;line-height:1.25;color:#1B2A3A;opacity:1;transform:none';
      cap.innerHTML = VIDEO.cover.html;
    });
    await page.screenshot({ path: out });
  } else if (mode === 'video') {
    const [audio, fpsArg] = rest;
    const fps = Number(fpsArg || 30);
    const end = await page.evaluate(() => window.__END);
    const frames = Math.ceil(end * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-i', audio, '-filter_complex', `[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,apad=whole_dur=${end}[a]`, '-map', '0:v', '-map', '[a]',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps),
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(end), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < frames; f++) {
      await page.evaluate(t => window.__seek(t), f / fps);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  } else {
    console.error('mode must be stills | video | cover'); process.exitCode = 2;
  }
  await browser.close();
})();
