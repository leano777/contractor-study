import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';

const PAGES_TO_CAPTURE = [
  { name: 'landing', path: '/' },
  { name: 'register', path: '/register' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'challenge', path: '/challenge' },
  { name: 'study', path: '/study' },
  { name: 'chat', path: '/chat' },
  { name: 'leaderboard', path: '/leaderboard' },
  { name: 'achievements', path: '/achievements' },
  { name: 'progress', path: '/progress' },
  { name: 'settings', path: '/settings' },
  { name: 'admin-qr', path: '/admin/qr' },
];

async function captureScreenshots() {
  const outputDir = path.join(__dirname, '../audit-screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  console.log('📸 Starting screenshot audit...\n');

  for (const pageInfo of PAGES_TO_CAPTURE) {
    const url = `${BASE_URL}${pageInfo.path}`;

    try {
      // Desktop screenshot
      const desktopPage = await desktopContext.newPage();
      await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await desktopPage.waitForTimeout(500); // Wait for animations
      await desktopPage.screenshot({
        path: path.join(outputDir, `${pageInfo.name}-desktop.png`),
        fullPage: true,
      });
      await desktopPage.close();
      console.log(`✅ ${pageInfo.name} (desktop)`);

      // Mobile screenshot
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({
        path: path.join(outputDir, `${pageInfo.name}-mobile.png`),
        fullPage: true,
      });
      await mobilePage.close();
      console.log(`✅ ${pageInfo.name} (mobile)`);
    } catch (error) {
      console.log(`❌ ${pageInfo.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  await browser.close();
  console.log(`\n📁 Screenshots saved to: ${outputDir}`);
}

captureScreenshots().catch(console.error);
