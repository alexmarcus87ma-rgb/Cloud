import { firefox } from "playwright-extra";
import StealthPlugin from "playwright-extra-plugin-stealth";

firefox.use(StealthPlugin());

async function main() {
  console.log("Launching Firefox...");
  const browser = await firefox.launch({
    headless: false,
    slowMo: 200,
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  console.log("Firefox is open at localhost:3000");

  // Keep browser open — don't close it
  await new Promise(() => {}); // wait forever
}

main().catch(console.error);
