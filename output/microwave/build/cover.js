// node cover.js <out.png> : TikTok cover (1080x1920) built from the hook frame
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => window.__ready);
  await page.evaluate(() => {
    window.__seek(2.8);
    const cap = document.getElementById('cap');
    cap.style.cssText = 'top:1310px;font-size:92px;font-weight:700;line-height:1.25;color:#1B2A3A;opacity:1;transform:none';
    cap.innerHTML = 'علاش <span style="color:#D0111B">الطبسيل</span><br>ماتايسخنش؟';
  });
  await page.screenshot({ path: process.argv[2] });
  await browser.close();
})();
