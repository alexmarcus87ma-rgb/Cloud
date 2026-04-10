import { firefox } from "playwright-extra";
import StealthPlugin from "playwright-extra-plugin-stealth";

firefox.use(StealthPlugin());

async function main() {
  const browser = await firefox.launch({ headless: false, slowMo: 150 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  console.log("Opening emag.ro...");
  await page.goto("https://www.emag.ro", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);

  // Accept cookies if popup appears
  try {
    await page.locator("#onetrust-accept-btn-handler, button:has-text('Accept'), button:has-text('Accepta')").first().click({ timeout: 4000 });
    console.log("Accepted cookies");
    await page.waitForTimeout(1000);
  } catch { /* no cookie popup */ }

  console.log("Searching for Xiaomi 14 Pro...");
  const searchBox = page.locator('#searchboxTrigger, input[name="searchboxTrigger"], input[placeholder*="cauta"], input[type="search"]').first();
  await searchBox.click();
  await searchBox.fill("xiaomi 14 pro");
  await page.waitForTimeout(500);
  await searchBox.press("Enter");

  await page.waitForURL(/search/, { timeout: 15000 });
  console.log("Search results loaded:", page.url());

  await new Promise(() => {}); // keep open
}

main().catch(console.error);
