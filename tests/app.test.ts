import { firefox, Browser, Page } from "playwright-extra";
import StealthPlugin from "playwright-extra-plugin-stealth";

firefox.use(StealthPlugin());

const BASE = "http://localhost:3000";
const TEST_EMAIL = `test_${Date.now()}@arcade.net`;
const TEST_PASS = "Password123";
const TEST_NAME = "TESTPLAYER";

let browser: Browser;
let page: Page;

const results: { test: string; status: "PASS" | "FAIL"; detail?: string }[] = [];

function pass(test: string, detail?: string) {
  results.push({ test, status: "PASS", detail });
  console.log(`  ✅ PASS: ${test}${detail ? " — " + detail : ""}`);
}

function fail(test: string, detail: string) {
  results.push({ test, status: "FAIL", detail });
  console.error(`  ❌ FAIL: ${test} — ${detail}`);
}

async function run() {
  browser = await firefox.launch({ headless: true });
  page = await browser.newPage();

  // ── 1. Landing page ──────────────────────────────────────────────────────────
  console.log("\n[1] Landing page /");
  try {
    await page.goto(BASE, { waitUntil: "networkidle" });
    const title = await page.title();
    const body = await page.content();
    const hasCyberpunk =
      body.includes("ARCADE") ||
      body.includes("GAMING") ||
      body.includes("TETRIS") ||
      body.includes("PAC-MAN") ||
      body.includes("#00FF41") ||
      body.includes("00FF41");
    const hasDefaultTemplate = body.includes("edit the page.tsx") || body.includes("vercel.com/templates");
    if (hasDefaultTemplate) {
      fail("Landing page is cyberpunk-themed", "Shows default Next.js starter template instead of cyberpunk arcade theme");
    } else if (hasCyberpunk) {
      pass("Landing page is cyberpunk-themed");
    } else {
      fail("Landing page is cyberpunk-themed", "Unknown content — missing cyberpunk arcade elements");
    }
    const hasLoginLink = body.includes("/login") || body.includes("LOGIN");
    hasLoginLink ? pass("Landing page has login link") : fail("Landing page has login link", "No link to /login");
    const hasRegisterLink = body.includes("/setup") || body.includes("/register") || body.includes("REGISTER") || body.includes("INITIALIZE");
    hasRegisterLink ? pass("Landing page has register link") : fail("Landing page has register link", "No link to register");
  } catch (e) {
    fail("Landing page loads", String(e));
  }

  // ── 2. Login page ──────────────────────────────────────────────────────────
  console.log("\n[2] Login page /login");
  try {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    const emailInput = await page.locator('input[type="email"]').count();
    const passInput = await page.locator('input[type="password"]').count();
    emailInput > 0 ? pass("Login: email field present") : fail("Login: email field present", "No email input");
    passInput > 0 ? pass("Login: password field present") : fail("Login: password field present", "No password input");
    const submitBtn = page.locator('button[type="submit"]');
    const btnCount = await submitBtn.count();
    btnCount > 0 ? pass("Login: submit button present") : fail("Login: submit button present", "No submit button");

    // Test bad credentials
    await page.fill('input[type="email"]', "wrong@arcade.net");
    await page.fill('input[type="password"]', "wrongpass123");
    await submitBtn.click();
    await page.waitForTimeout(2000);
    const errorVisible = await page.locator("text=/FAILED|ERROR|INVALID/i").count();
    errorVisible > 0 ? pass("Login: shows error on bad credentials") : fail("Login: shows error on bad credentials", "No error message shown");
  } catch (e) {
    fail("Login page", String(e));
  }

  // ── 3. Register page ────────────────────────────────────────────────────────
  console.log("\n[3] Register page /setup");
  try {
    await page.goto(`${BASE}/setup`, { waitUntil: "networkidle" });
    const nameInput = await page.locator('input[id="name"]').count();
    const emailInput = await page.locator('input[type="email"]').count();
    const passInputs = await page.locator('input[type="password"]').count();
    nameInput > 0 ? pass("Register: name field present") : fail("Register: name field present", "No name input");
    emailInput > 0 ? pass("Register: email field present") : fail("Register: email field present", "No email input");
    passInputs >= 2 ? pass("Register: both password fields present") : fail("Register: both password fields present", `Only ${passInputs} password input(s)`);

    // Test password mismatch
    await page.fill('input[id="name"]', "TESTUSER");
    await page.fill('input[type="email"]', "test@arcade.net");
    const pwds = page.locator('input[type="password"]');
    await pwds.nth(0).fill("Password123");
    await pwds.nth(1).fill("Different123");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    const mismatchErr = await page.locator("text=/MATCH|mismatch/i").count();
    mismatchErr > 0 ? pass("Register: validates password mismatch") : fail("Register: validates password mismatch", "No mismatch error shown");

    // Test short password
    await pwds.nth(0).fill("short");
    await pwds.nth(1).fill("short");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    const shortErr = await page.locator("text=/8 CHAR|8 char|length/i").count();
    shortErr > 0 ? pass("Register: validates min password length") : fail("Register: validates min password length", "No length error shown");
  } catch (e) {
    fail("Register page", String(e));
  }

  // ── 4. Full register flow ────────────────────────────────────────────────────
  console.log("\n[4] Full registration flow");
  try {
    await page.goto(`${BASE}/setup`, { waitUntil: "networkidle" });
    await page.fill('input[id="name"]', TEST_NAME);
    await page.fill('input[type="email"]', TEST_EMAIL);
    const pwds = page.locator('input[type="password"]');
    await pwds.nth(0).fill(TEST_PASS);
    await pwds.nth(1).fill(TEST_PASS);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(select-game|dashboard)/, { timeout: 8000 });
    const url = page.url();
    url.includes("select-game") ? pass("Register: redirects to /select-game after signup") :
      url.includes("dashboard") ? pass("Register: redirects to /dashboard after signup") :
      fail("Register: redirects after signup", `Redirected to unexpected URL: ${url}`);
  } catch (e) {
    fail("Full register flow", String(e));
  }

  // ── 5. Game selection ────────────────────────────────────────────────────────
  console.log("\n[5] Game selection /select-game");
  try {
    const url = page.url();
    if (url.includes("select-game")) {
      const tetrisBtn = page.locator("button", { hasText: /TETRIS/i });
      const pacBtn = page.locator("button", { hasText: /PAC-MAN|PACMAN/i });
      const tCount = await tetrisBtn.count();
      const pCount = await pacBtn.count();
      tCount > 0 ? pass("Select game: Tetris button present") : fail("Select game: Tetris button present", "No Tetris button");
      pCount > 0 ? pass("Select game: Pac-Man button present") : fail("Select game: Pac-Man button present", "No Pac-Man button");
      const permanentWarning = await page.locator("text=/PERMANENT|permanent/i").count();
      permanentWarning > 0 ? pass("Select game: shows permanent warning") : fail("Select game: shows permanent warning", "No warning about permanent selection");

      // Select tetris
      await tetrisBtn.click();
      await page.waitForURL(/\/dashboard/, { timeout: 8000 });
      pass("Select game: redirects to /dashboard after selection");
    } else {
      fail("Select game: redirect to select-game", `Was on: ${url}`);
    }
  } catch (e) {
    fail("Game selection", String(e));
  }

  // ── 6. Dashboard ──────────────────────────────────────────────────────────
  console.log("\n[6] Dashboard /dashboard");
  try {
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    const url = page.url();

    // Per CLAUDE.md: "After login → redirect directly to user's game"
    // Check if dashboard redirects to game or shows both buttons
    await page.waitForTimeout(2000);
    const afterUrl = page.url();

    if (afterUrl.includes("/tetris") || afterUrl.includes("/pacman")) {
      pass("Dashboard: redirects to user's game directly");
    } else {
      // Check if dashboard at least has navigation to the game
      const tetrisLink = await page.locator("a[href='/tetris'], a[href*='tetris']").count();
      const pacLink = await page.locator("a[href='/pacman'], a[href*='pacman']").count();
      if (tetrisLink > 0 || pacLink > 0) {
        fail("Dashboard: redirects to user's game directly", "Dashboard shows game links instead of redirecting to user's game");
      } else {
        fail("Dashboard: shows game navigation", "No game links found on dashboard");
      }
    }

    const leaderboardLink = await page.locator("a[href='/leaderboard'], text=LEADERBOARD").count();
    leaderboardLink > 0 ? pass("Dashboard: has leaderboard link") : fail("Dashboard: has leaderboard link", "No leaderboard link");
    const signOutBtn = await page.locator("button", { hasText: /SIGN OUT|LOGOUT/i }).count();
    signOutBtn > 0 ? pass("Dashboard: has sign out button") : fail("Dashboard: has sign out button", "No sign out button");
  } catch (e) {
    fail("Dashboard", String(e));
  }

  // ── 7. Tetris game page ────────────────────────────────────────────────────
  console.log("\n[7] Tetris game /tetris");
  try {
    await page.goto(`${BASE}/tetris`, { waitUntil: "networkidle" });
    const canvas = await page.locator("canvas").count();
    canvas > 0 ? pass("Tetris: canvas element present") : fail("Tetris: canvas element present", "No canvas");
    const header = await page.locator("text=/TETRIS/i").count();
    header > 0 ? pass("Tetris: title present") : fail("Tetris: title present", "No TETRIS header");
    const scorePanel = await page.locator("text=/SCORE/i").count();
    scorePanel > 0 ? pass("Tetris: score panel present") : fail("Tetris: score panel present", "No score display");
    const backBtn = await page.locator("button", { hasText: /BACK/i }).count();
    backBtn > 0 ? pass("Tetris: back button present") : fail("Tetris: back button present", "No back button");
    // Check bg color is black
    const bgBlack = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return false;
      const style = window.getComputedStyle(main);
      return style.backgroundColor === "rgb(0, 0, 0)";
    });
    bgBlack ? pass("Tetris: black background (cyberpunk)") : fail("Tetris: black background (cyberpunk)", "Background is not black");
  } catch (e) {
    fail("Tetris page", String(e));
  }

  // ── 8. Pac-Man game page ────────────────────────────────────────────────────
  console.log("\n[8] Pac-Man game /pacman");
  try {
    await page.goto(`${BASE}/pacman`, { waitUntil: "networkidle" });
    const canvas = await page.locator("canvas").count();
    canvas > 0 ? pass("Pac-Man: canvas element present") : fail("Pac-Man: canvas element present", "No canvas");
    const header = await page.locator("text=/PAC.MAN/i").count();
    header > 0 ? pass("Pac-Man: title present") : fail("Pac-Man: title present", "No PAC-MAN header");
    const livesDisplay = await page.locator("text=/SCORE/i").count();
    livesDisplay > 0 ? pass("Pac-Man: score display present") : fail("Pac-Man: score display present", "No score display");
  } catch (e) {
    fail("Pac-Man page", String(e));
  }

  // ── 9. Leaderboard ──────────────────────────────────────────────────────────
  console.log("\n[9] Leaderboard /leaderboard");
  try {
    await page.goto(`${BASE}/leaderboard`, { waitUntil: "networkidle" });
    const header = await page.locator("text=/LEADERBOARD/i").count();
    header > 0 ? pass("Leaderboard: title present") : fail("Leaderboard: title present", "No leaderboard header");
    const tetrisSection = await page.locator("text=/TETRIS/i").count();
    tetrisSection > 0 ? pass("Leaderboard: Tetris section present") : fail("Leaderboard: Tetris section present", "No Tetris section");
    const pacSection = await page.locator("text=/PAC.MAN/i").count();
    pacSection > 0 ? pass("Leaderboard: Pac-Man section present") : fail("Leaderboard: Pac-Man section present", "No Pac-Man section");
    const backBtn = await page.locator("button", { hasText: /BACK/i }).count();
    backBtn > 0 ? pass("Leaderboard: back button present") : fail("Leaderboard: back button present", "No back button");
  } catch (e) {
    fail("Leaderboard page", String(e));
  }

  // ── 10. Auth guard: unauthenticated access ──────────────────────────────────
  console.log("\n[10] Auth guards");
  try {
    // Sign out first
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const signOutBtn = page.locator("button", { hasText: /SIGN OUT/i });
    if (await signOutBtn.count() > 0) {
      await signOutBtn.click();
      await page.waitForTimeout(2000);
    }

    // New context — no session
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();

    await page2.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(2000);
    const url2 = page2.url();
    url2.includes("/login") ? pass("Auth guard: /dashboard redirects unauthenticated to /login") :
      fail("Auth guard: /dashboard redirects unauthenticated to /login", `Stayed on: ${url2}`);

    await page2.goto(`${BASE}/tetris`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(2000);
    const url3 = page2.url();
    url3.includes("/login") ? pass("Auth guard: /tetris redirects unauthenticated to /login") :
      fail("Auth guard: /tetris redirects unauthenticated to /login", `Stayed on: ${url3}`);

    await ctx2.close();
  } catch (e) {
    fail("Auth guards", String(e));
  }

  // ── 11. Login flow ──────────────────────────────────────────────────────────
  console.log("\n[11] Login flow (with created test user)");
  try {
    const ctx3 = await browser.newContext();
    const page3 = await ctx3.newPage();
    await page3.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page3.fill('input[type="email"]', TEST_EMAIL);
    await page3.fill('input[type="password"]', TEST_PASS);
    await page3.locator('button[type="submit"]').click();
    await page3.waitForURL(/\/(dashboard|tetris|pacman)/, { timeout: 8000 });
    const afterUrl = page3.url();
    afterUrl.includes("/tetris") || afterUrl.includes("/pacman")
      ? pass("Login: redirects to game after login (correct per spec)")
      : afterUrl.includes("/dashboard")
      ? fail("Login: should redirect to user's game", "Redirected to /dashboard instead of /tetris or /pacman")
      : fail("Login: redirects after login", `Unexpected URL: ${afterUrl}`);
    await ctx3.close();
  } catch (e) {
    fail("Login flow", String(e));
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  console.log(`\n${"─".repeat(60)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  console.log("─".repeat(60));
  if (failed > 0) {
    console.log("\nFAILURES:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ❌ ${r.test}: ${r.detail}`));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
