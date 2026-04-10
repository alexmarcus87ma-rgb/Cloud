import { chromium } from "playwright-extra";
import StealthPlugin from "playwright-extra-plugin-stealth";

chromium.use(StealthPlugin());

async function register() {
  // Try system Edge or Chrome first, fall back to downloaded chromium
  let browser;
  try {
    browser = await chromium.launch({ channel: "msedge", headless: false, slowMo: 80 });
    console.log("Using Microsoft Edge");
  } catch {
    try {
      browser = await chromium.launch({ channel: "chrome", headless: false, slowMo: 80 });
      console.log("Using Google Chrome");
    } catch {
      browser = await chromium.launch({ headless: false, slowMo: 80 });
      console.log("Using Playwright Chromium");
    }
  }

  const page = await browser.newPage();

  console.log("Navigating to /setup ...");
  await page.goto("http://localhost:3000/setup", { waitUntil: "networkidle" });

  console.log("Filling in registration form...");

  // Player name
  await page.fill('input[id="name"]', "marcu_sabin");

  // Email
  await page.fill('input[type="email"]', "marcu_sabin@yahoo.com");

  // Password fields
  const pwdFields = page.locator('input[type="password"]');
  await pwdFields.nth(0).fill("PolitiaRomana");
  await pwdFields.nth(1).fill("PolitiaRomana");

  console.log("Submitting form...");
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to select-game or dashboard
  try {
    await page.waitForURL(/\/(select-game|dashboard|tetris|pacman)/, { timeout: 10000 });
    const url = page.url();
    console.log(`✅ Registration successful! Redirected to: ${url}`);

    if (url.includes("select-game")) {
      console.log("Game selection page reached — picking PAC-MAN...");
      await page.waitForTimeout(1000);
      const pacBtn = page.locator("button", { hasText: /PAC.MAN/i });
      await pacBtn.click();
      await page.waitForURL(/\/(dashboard|pacman)/, { timeout: 8000 });
      console.log(`✅ Game selected! Now at: ${page.url()}`);
    }
  } catch {
    // Check for error message
    const errText = await page.locator("text=/FAILED|ERROR|ALREADY|EXIST/i").textContent().catch(() => null);
    if (errText) {
      console.error(`❌ Registration failed: ${errText}`);
    } else {
      console.error(`❌ Unexpected state. Current URL: ${page.url()}`);
    }
  }

  await page.waitForTimeout(3000);
  await browser.close();
}

register().catch(console.error);
