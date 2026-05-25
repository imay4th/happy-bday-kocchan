import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

// テスト全体の timeout を 3 分に拡大
test.setTimeout(180_000);

/**
 * 4フェーズすべてを巡回してスクリーンショット保存。
 * speed パラメータを 0.5 にしてタメを短縮。
 */
test('全フェーズスクリーンショット撮影 (iPhone 12 縦画面)', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('debug_speed', '0.5');
  });

  // 画面1 (Idle)
  await page.goto('?debug=1');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.idle-screen', { timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-idle.png') });

  // 画面1 タップ → 画面2
  await page.locator('.idle-screen').click({ position: { x: 195, y: 400 } });
  await page.waitForSelector('.charge-screen', { timeout: 5000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-charge-empty.png') });

  // 画面2: スワイプして 100% まで (回数を抑えつつ大半径で稼ぐ)
  const swipeBox = await page.locator('.charge-screen').boundingBox();
  if (swipeBox) {
    const cx = swipeBox.x + swipeBox.width / 2;
    const cy = swipeBox.y + swipeBox.height * 0.7;
    const radius = 100;
    await page.mouse.move(cx + radius, cy);
    await page.mouse.down();
    // 1周あたり 2π * 100 ≒ 628px、12周で約 7540px、SWIPE_MAX_DISTANCE 8000 にほぼ届く
    // 中間 (6周終了 = 約 3770px ≒ 47%) で 1枚
    const TOTAL_LAPS = 18; // 余裕めに 8000 を越える ≒ 11300px
    const STEPS_PER_LAP = 12; // 1ステップで約 52px (mouse.move の steps はデフォルト 1 で送出)
    const HALF_LAPS = 7;

    for (let lap = 0; lap < HALF_LAPS; lap++) {
      for (let i = 0; i < STEPS_PER_LAP; i++) {
        const t = ((lap * STEPS_PER_LAP + i) / STEPS_PER_LAP) * Math.PI * 2;
        await page.mouse.move(cx + Math.cos(t) * radius, cy + Math.sin(t) * radius);
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-charge-mid.png') });

    for (let lap = HALF_LAPS; lap < TOTAL_LAPS; lap++) {
      for (let i = 0; i < STEPS_PER_LAP; i++) {
        const t = ((lap * STEPS_PER_LAP + i) / STEPS_PER_LAP) * Math.PI * 2;
        await page.mouse.move(cx + Math.cos(t) * radius, cy + Math.sin(t) * radius);
      }
    }
    // 100%発光中のスクショ (mouseup 前)
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-charge-full.png') });
    await page.mouse.up();
  }

  // Cake 画面へ遷移待ち
  await page.waitForSelector('.cake-screen', { timeout: 5000 });
  await page.waitForTimeout(1500); // ケーキせり上がり完了待ち
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-cake.png') });

  // 画面3 タップ → 画面4
  await page.locator('.cake-screen').click({ position: { x: 195, y: 400 } });
  await page.waitForSelector('.finale-screen', { timeout: 5000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-finale-early.png') });

  // 日付ワイプ後
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-finale-late.png') });

  const files = fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith('.png'));
  expect(files.length).toBeGreaterThanOrEqual(7);
});
