import { chromium } from "playwright-extra";
import StealthPlugin from "playwright-extra-plugin-stealth";
import { exec } from "child_process";

chromium.use(StealthPlugin());

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9222;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Step 1: Launch Chrome via PowerShell Start-Process (works from bash env)
  console.log("Launching Chrome with remote debugging port...");
  const chromeProc = exec(
    `powershell.exe -Command "Start-Process -FilePath 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--remote-debugging-port=${DEBUG_PORT}','--remote-allow-origins=*','--no-first-run','--user-data-dir=C:\\Temp\\chromedebug','about:blank'"`,
    { shell: "cmd.exe" }
  );
  chromeProc.on("error", (e) => console.error("Chrome launch error:", e));

  // Give Chrome time to start
  console.log("Waiting for Chrome to start...");
  await sleep(5000);

  // Step 2: Connect Playwright to the running Chrome via TCP
  console.log(`Connecting to Chrome on port ${DEBUG_PORT}...`);
  const browser = await chromium.connectOverCDP(`http://localhost:${DEBUG_PORT}`, {
    timeout: 30000,
  });
  console.log("Connected!");

  const context = browser.contexts()[0] || await browser.newContext();
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // ── Step 3: Navigate to landing page ──
  console.log("Step 1: Opening http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await sleep(1500);

  // ── Step 4: Click NEW PLAYER ──
  console.log("Step 2: Clicking NEW PLAYER...");
  await page.locator("a[href='/setup']").click();
  await page.waitForURL("**/setup", { timeout: 5000 });
  await sleep(1000);

  // ── Step 5: Fill player name ──
  console.log("Step 3: Typing player name: marcu_sabin");
  await page.locator('input[id="name"]').click();
  await page.locator('input[id="name"]').type("marcu_sabin", { delay: 100 });
  await sleep(600);

  // ── Step 6: Fill email ──
  console.log("Step 4: Typing email: marcu_sabin@yahoo.com");
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').type("marcu_sabin@yahoo.com", { delay: 100 });
  await sleep(600);

  // ── Step 7: Fill password ──
  console.log("Step 5: Typing password...");
  const pwds = page.locator('input[type="password"]');
  await pwds.nth(0).click();
  await pwds.nth(0).type("PolitiaRomana", { delay: 100 });
  await sleep(500);

  // ── Step 8: Confirm password ──
  console.log("Step 6: Confirming password...");
  await pwds.nth(1).click();
  await pwds.nth(1).type("PolitiaRomana", { delay: 100 });
  await sleep(800);

  // ── Step 9: Submit ──
  console.log("Step 7: Clicking ACTIVATE ACCOUNT...");
  await page.locator('button[type="submit"]').click();

  // ── Step 10: Wait for redirect ──
  await page.waitForURL(/\/(select-game|dashboard|tetris|pacman)/, { timeout: 10000 });
  console.log(`Step 8: Redirected to: ${page.url()}`);
  await sleep(1500);

  // ── Step 11: Select game if prompted ──
  if (page.url().includes("select-game")) {
    console.log("Step 9: Selecting PAC-MAN...");
    await page.locator("button", { hasText: /PAC.MAN/i }).click();
    await page.waitForURL(/\/(pacman|dashboard)/, { timeout: 8000 });
    console.log(`Final URL: ${page.url()}`);
    await sleep(2000);
  }

  console.log("✅ Done! Keeping browser open for 5 seconds...");
  await sleep(5000);

  await browser.close();
  chromeProc.kill();
  console.log("Browser closed.");
}

main().catch(console.error);
