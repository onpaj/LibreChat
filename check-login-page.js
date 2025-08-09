const { chromium } = require('playwright');

async function checkLoginPage() {
  let browser;
  try {
    console.log('🚀 Spouštím Playwright test...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Jít na přihlašovací stránku
    console.log('📄 Naviguji na přihlašovací stránku...');
    await page.goto('http://localhost:3080/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Počkat na načtení stránky
    await page.waitForTimeout(3000);
    
    // Screenshot přihlašovací stránky
    await page.screenshot({ 
      path: 'login-page-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Screenshot uložen jako login-page-screenshot.png');
    
    // Zkontrolovat přítomnost OpenID/Microsoft tlačítka
    console.log('🔍 Hledám MS Entra ID tlačítko...');
    
    const microsoftButtons = await page.locator('button:has-text("Microsoft")').all();
    const openidButtons = await page.locator('button:has-text("OpenID")').all();
    const signInButtons = await page.locator('button:has-text("Sign in with")').all();
    
    console.log(`Nalezeno ${microsoftButtons.length} tlačítek s textem "Microsoft"`);
    console.log(`Nalezeno ${openidButtons.length} tlačítek s textem "OpenID"`);
    console.log(`Nalezeno ${signInButtons.length} tlačítek s textem "Sign in with"`);
    
    // Zkontrolovat všechna tlačítka na stránce
    const allButtons = await page.locator('button').all();
    console.log(`\\n📋 Všechna tlačítka na stránce (${allButtons.length}):`);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const isVisible = await allButtons[i].isVisible();
      console.log(`  ${i + 1}. "${text}" (visible: ${isVisible})`);
    }
    
    // Zkontrolovat OAuth sekci
    const oauthSection = page.locator('[data-testid*="social"], [class*="social"], [class*="oauth"]');
    const oauthExists = await oauthSection.count();
    console.log(`\\n🔗 OAuth/Social sekce: ${oauthExists > 0 ? 'Nalezena' : 'Nenalezena'}`);
    
    // Zkontrolovat network requests
    console.log('\\n🌐 Zkouším načíst startup config...');
    const response = await page.goto('http://localhost:3080/api/startup');
    if (response.ok()) {
      const config = await response.json();
      console.log('⚙️ Startup konfigurace:');
      console.log(`  - openidLoginEnabled: ${config.openidLoginEnabled}`);
      console.log(`  - openidLabel: ${config.openidLabel}`);
      console.log(`  - openidImageUrl: ${config.openidImageUrl}`);
      console.log(`  - serverDomain: ${config.serverDomain}`);
    } else {
      console.log('❌ Nepodařilo se načíst startup config');
    }
    
    // Zkontrolovat console logy
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Console error:', msg.text());
      }
    });
    
    console.log('\\n✅ Test dokončen. Zkontrolujte screenshot pro detaily.');
    
  } catch (error) {
    console.error('❌ Chyba během testu:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkLoginPage();