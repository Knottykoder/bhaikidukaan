import { test, expect } from '@playwright/test';

test.describe('Storefront Landing Experience', () => {
  test('loads home page with hero section and branding', async ({ page }) => {
    await page.goto('/');

    // Check main title & header
    await expect(page).toHaveTitle(/BhaiKiDukaan/i);

    // Verify Hero headline
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('Upgrade Your');
    await expect(heroHeading).toContainText('Everyday Tech');

    // Verify dual CTA buttons
    await expect(page.getByRole('link', { name: /Shop Now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Collection/i })).toBeVisible();
  });

  test('displays trust pillars bar with all 5 assurances', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Free Express Shipping')).toBeVisible();
    await expect(page.getByRole('heading', { name: '7-Day Easy Returns' }).first()).toBeVisible();
    await expect(page.getByText('Secure Payments')).toBeVisible();
    await expect(page.getByText('24/7 Bhai AI Support')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Official Warranty' })).toBeVisible();
  });

  test('displays shop by category section and links', async ({ page }) => {
    await page.goto('/');

    const categoryHeading = page.getByRole('heading', { name: /Shop by Category/i });
    await expect(categoryHeading).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wireless Audio' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smart Watches' })).toBeVisible();
  });

  test('displays flash sale banner with live ticking countdown', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/LIMITED FLASH SALE • UP TO 60% OFF/i)).toBeVisible();
    await expect(page.getByText('DEAL EXPIRES IN')).toBeVisible();
    await expect(page.getByText('Days')).toBeVisible();
    await expect(page.getByText('Hours')).toBeVisible();
    await expect(page.getByText('Minutes')).toBeVisible();
    await expect(page.getByText('Seconds')).toBeVisible();
  });

  test('displays partner brand logos', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('APPLE')).toBeVisible();
    await expect(page.getByText('SAMSUNG')).toBeVisible();
    await expect(page.getByText('SONY')).toBeVisible();
  });
});
