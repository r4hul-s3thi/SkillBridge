const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const PAGES = [
  { name: 'login',       url: 'http://localhost:5173/login',       waitFor: '.login-cosmos' },
  { name: 'dashboard',   url: 'http://localhost:5173/dashboard',   waitFor: '.dashboard-shell' },
  { name: 'matches',     url: 'http://localhost:5173/matches',     waitFor: null },
  { name: 'messages',    url: 'http://localhost:5173/messages',    waitFor: null },
  { name: 'sessions',    url: 'http://localhost:5173/sessions',    waitFor: null },
  { name: 'collabs',     url: 'http://localhost:5173/collabs',     waitFor: null },
  { name: 'leaderboard', url: 'http://localhost:5173/leaderboard', waitFor: null },
  { name: 'profile',     url: 'http://localhost:5173/profile',     waitFor: null },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Login first
  console.log('Logging in...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.click('input[type="email"]', { clickCount: 3 });
  await page.type('input[type="email"]', 'aarav.patel@example.com');
  await page.click('input[type="password"]', { clickCount: 3 });
  await page.type('input[type="password"]', 'password123');

  // Screenshot login page before submitting
  await page.screenshot({ path: path.join(OUT, 'login.png'), fullPage: false });
  console.log('✅ login.png');

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot each page
  for (const p of PAGES.slice(1)) {
    console.log(`Navigating to ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUT, `${p.name}.png`), fullPage: false });
    console.log(`✅ ${p.name}.png`);
  }

  await browser.close();
  console.log('\n🎉 All screenshots saved to /screenshots/');
})();
