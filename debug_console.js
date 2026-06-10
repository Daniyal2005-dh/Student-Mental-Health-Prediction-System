const { chromium } = require('playwright');
(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[UNCAUGHT EXCEPTION] ${err.stack}`);
  });
  
  try {
    console.log("Navigating to http://127.0.0.1:5173/...");
    await page.goto('http://127.0.0.1:5173/', { timeout: 10000 });
    console.log("Navigation successful. Waiting for 3 seconds...");
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error("Navigation error:", e.message);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
})();
