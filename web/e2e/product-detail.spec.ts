import { test, expect } from '@playwright/test';

test.describe('Product Detail Page Experience', () => {
  test('navigates to product detail, interacts with swatches and specs tabs', async ({ page }) => {
    await page.goto('/products');

    // Wait for products to load and click on first product link
    const firstProduct = page.locator('.product-card a').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Verify breadcrumbs are visible
    await expect(page.getByRole('navigation', { name: /Breadcrumb/i })).toBeVisible();

    // Verify color swatches section exists
    await expect(page.getByText(/Pick a Color:/i)).toBeVisible();

    // Verify specs table tab is visible and clickable
    const specsTab = page.getByRole('button', { name: /Additional Information/i });
    await expect(specsTab).toBeVisible();
    await specsTab.click();

    // Verify specification table headers
    await expect(page.getByRole('columnheader', { name: 'Specification' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Details' })).toBeVisible();

    // Verify description tab switch
    const descTab = page.getByRole('button', { name: /^Description/i });
    await descTab.click();
    await expect(page.getByText(/Lossless Fidelity/i)).toBeVisible();
  });
});
