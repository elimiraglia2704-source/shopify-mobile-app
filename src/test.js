const { chromium } = require('playwright');

(async () => {
  console.log("Lancio browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log("Navigazione a localhost:8000...");
  try {
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 5000 });
    console.log("DOM caricato. Attendo 2 secondi per vedere se si blocca...");
    await page.waitForTimeout(2000);
    
    console.log("Provo a eseguire JS nella pagina...");
    const result = await page.evaluate(() => {
      return "JS è responsivo!";
    });
    console.log("Risultato:", result);
  } catch (err) {
    console.error("Errore durante il test:", err.message);
  }

  await browser.close();
  console.log("Test terminato.");
})();
