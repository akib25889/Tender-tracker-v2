/**
 * screenshot_pages.js
 * Takes full-page screenshots of all TenderTracker pages.
 * Usage: node scripts/screenshot_pages.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const API_URL  = 'http://localhost:8000/api';
const OUT_DIR  = path.resolve(__dirname, '../screenshots');
const VIEWPORT = { width: 1440, height: 900 };

const LOGIN_EMAIL = 'admin@tendertracker.org';
const LOGIN_PASS  = 'Admin@1234!';

// All pages: [filename-prefix, route]
const PAGES = [
  ['01-login',                      '/login'],
  ['02-dashboard',                  '/dashboard'],
  ['03-tender-list',                '/tenders'],
  ['04-tender-registry',            '/registry'],
  ['05-my-tasks',                   '/tasks/my-tasks'],
  ['06-calendar',                   '/calendar'],
  ['07-reports',                    '/reports'],
  ['08-notifications',              '/notifications'],
  ['09-documents-vault',            '/documents'],
  ['09b-documents-credentials',     '/documents?tab=credentials'],
  ['09c-documents-defaults',        '/documents?tab=defaults'],
  ['10-discussions',                '/discussions'],
  ['11-team-allocation',            '/team'],
  ['12-client-visits',              '/clients/visits'],
  ['13-organizations',              '/tools/organizations'],
  ['14-categories',                 '/tools/categories'],
  ['15-company-profiles',           '/tools/company-profiles'],
  ['16-permissions',                '/tools/permissions'],
  ['17-archived-tenders',           '/tools/archive'],
  ['18-partner-portal',             '/tools/partner-portal'],
  ['19-settings',                   '/settings'],
  ['20-user-profile',               '/profile'],
  ['21-access-denied',              '/403'],
  ['22-not-found',                  '/404'],
];

const TENDER_TABS = ['requirements', 'tasks', 'documents', 'partners', 'submission', 'result'];

async function getToken() {
  const http = require('http');
  return new Promise((resolve) => {
    const body = JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASS });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 3000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed);
          else resolve({ access_token: 'dummy', user: { name: 'System Admin', email: LOGIN_EMAIL, role: 'SYSTEM_ADMIN' } });
        } catch (e) {
          resolve({ access_token: 'dummy', user: { name: 'System Admin', email: LOGIN_EMAIL, role: 'SYSTEM_ADMIN' } });
        }
      });
    });
    req.on('error', () => {
      resolve({ access_token: 'dummy', user: { name: 'System Admin', email: LOGIN_EMAIL, role: 'SYSTEM_ADMIN' } });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ access_token: 'dummy', user: { name: 'System Admin', email: LOGIN_EMAIL, role: 'SYSTEM_ADMIN' } });
    });
    req.write(body);
    req.end();
  });
}

async function injectAuth(page, token, user) {
  try {
    await page.evaluate(([t, u]) => {
      localStorage.setItem('tendertracker_token', t);
      localStorage.setItem('tendertracker_auth_user', JSON.stringify(u));
    }, [token, user]);
  } catch (_) {}
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching auth token from API...');
  const tokenData = await getToken();
  console.log(`  ✓ Auth session configured (user: ${tokenData.user?.name || 'Admin'})`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // Navigate to base origin first to set up localStorage
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await injectAuth(page, tokenData.access_token, tokenData.user);
  } catch (err) {
    console.warn('Initial load warning:', err.message);
  }

  // Screenshot all pages
  for (const [name, route] of PAGES) {
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await injectAuth(page, tokenData.access_token, tokenData.user);
      await page.waitForTimeout(1500);

      const file = path.join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ✓ ${name}.png (${page.url()})`);
    } catch (err) {
      console.warn(`  ✗ ${name} failed: ${err.message}`);
    }
  }

  // Tender detail workspace + tabs
  let tenderId = 'TDR-2026-RHD-001';
  try {
    await page.goto(`${BASE_URL}/tenders`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await injectAuth(page, tokenData.access_token, tokenData.user);
    await page.waitForTimeout(1500);

    const firstLink = await page.$('a[href*="/tenders/TDR"]') ||
                      await page.$('a[href*="/tenders/"][href!="/tenders"]');
    if (firstLink) {
      const href = await firstLink.getAttribute('href');
      const parts = href.split('/tenders/');
      if (parts[1]) tenderId = parts[1].split('/')[0];
    }
  } catch (_) {}

  console.log(`\n  Target tender workspace ID: ${tenderId}`);

  try {
    await page.goto(`${BASE_URL}/tenders/${tenderId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await injectAuth(page, tokenData.access_token, tokenData.user);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '23-tender-detail-overview.png'), fullPage: true });
    console.log('  ✓ 23-tender-detail-overview.png');

    let i = 24;
    for (const tab of TENDER_TABS) {
      try {
        await page.goto(`${BASE_URL}/tenders/${tenderId}/${tab}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await injectAuth(page, tokenData.access_token, tokenData.user);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(OUT_DIR, `${String(i).padStart(2,'0')}-tender-${tab}.png`), fullPage: true });
        console.log(`  ✓ ${String(i).padStart(2,'0')}-tender-${tab}.png`);
        i++;
      } catch (err) {
        console.warn(`  ✗ tender/${tab}: ${err.message}`);
      }
    }

    // Registry summary
    try {
      await page.goto(`${BASE_URL}/registry/summary/${tenderId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await injectAuth(page, tokenData.access_token, tokenData.user);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, `${String(i).padStart(2,'0')}-registry-summary.png`), fullPage: true });
      console.log(`  ✓ ${String(i).padStart(2,'0')}-registry-summary.png`);
    } catch (err) {
      console.warn(`  ✗ registry-summary: ${err.message}`);
    }
  } catch (err) {
    console.warn(`  ✗ Tender detail capture failed: ${err.message}`);
  }

  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n✅ Done! ${files.length} screenshots saved to:\n   ${OUT_DIR}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
