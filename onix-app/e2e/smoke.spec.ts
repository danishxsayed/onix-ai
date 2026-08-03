import { test, expect } from '@playwright/test';

/**
 * SOW D9 — Smoke test: login → dashboard → create deal → advance stage
 *
 * Requires env vars:
 *   E2E_EMAIL    — a valid Supabase test user email
 *   E2E_PASSWORD — that user's password
 */

const EMAIL    = process.env.E2E_EMAIL    ?? 'test@onixai.co.in';
const PASSWORD = process.env.E2E_PASSWORD ?? 'TestPassword123!';

test.describe('ONIX AI — MVP smoke journey', () => {
  test('login → dashboard loads metrics', async ({ page }) => {
    /* ── 1. Login ── */
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);

    await page.getByPlaceholder(/email/i).fill(EMAIL);
    await page.getByPlaceholder(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    /* ── 2. Dashboard renders ── */
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
    await expect(page.getByText('Active Deals')).toBeVisible();
    await expect(page.getByText('Total Value')).toBeVisible();
    await expect(page.getByText('Avg Fit Score')).toBeVisible();
    await expect(page.getByText('Closed This Month')).toBeVisible();
  });

  test('pipeline → create deal → deal appears in table', async ({ page }) => {
    /* ── Login first ── */
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill(EMAIL);
    await page.getByPlaceholder(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });

    /* ── Navigate to Pipeline ── */
    await page.getByRole('link', { name: /pipeline/i }).click();
    await expect(page).toHaveURL(/pipeline/);
    await expect(page.getByText('+ New Deal')).toBeVisible();

    /* ── Open New Deal modal ── */
    await page.getByText('+ New Deal').click();
    await expect(page.getByText('New Deal')).toBeVisible();

    /* ── Fill form ── */
    const dealName = `E2E Deal ${Date.now()}`;
    await page.getByPlaceholder('Acme Corp Acquisition').fill(dealName);
    await page.getByPlaceholder('$5M').fill('$3M');
    await page.getByLabel('Sector').selectOption('Technology');

    /* ── Submit ── */
    await page.getByRole('button', { name: /create deal/i }).click();

    /* ── Modal closes, new deal appears at top of table ── */
    await expect(page.getByText('New Deal')).not.toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(dealName)).toBeVisible({ timeout: 8_000 });
  });

  test('advance deal stage optimistically updates the strip', async ({ page }) => {
    /* ── Login ── */
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill(EMAIL);
    await page.getByPlaceholder(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });

    /* ── Pipeline ── */
    await page.getByRole('link', { name: /pipeline/i }).click();
    await expect(page).toHaveURL(/pipeline/);

    /* ── Create a deal so there's something to advance ── */
    const dealName = `Advance Test ${Date.now()}`;
    await page.getByText('+ New Deal').click();
    await page.getByPlaceholder('Acme Corp Acquisition').fill(dealName);
    await page.getByPlaceholder('$5M').fill('$1M');
    await page.getByLabel('Sector').selectOption('Finance');
    await page.getByRole('button', { name: /create deal/i }).click();
    await expect(page.getByText(dealName)).toBeVisible({ timeout: 8_000 });

    /* ── Click the stage button to advance it ── */
    const stageBtn = page
      .getByRole('row')
      .filter({ hasText: dealName })
      .getByTitle('Click to advance stage');
    await stageBtn.click();

    /* ── Stage should now show Prepare ── */
    await expect(stageBtn).toHaveText(/Prepare →/, { timeout: 5_000 });
  });
});
