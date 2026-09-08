import { test, expect } from '@playwright/test';

test.describe('Product Detail Page Experience', () => {
  test('navigates to product detail, interacts with swatches and specs tabs', async ({ page }) => {
    // Intercept product detail API
    await page.route('**/products/e2e-prod-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'e2e-prod-1',
          name: 'Apple AirPods Max Sky Blue',
          description: 'Acoustic masterpiece with spatial audio and active noise cancellation.',
          price: 49999,
          compareAtPrice: 59900,
          currency: 'INR',
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
          ],
          categoryId: 'headphones',
          categoryName: 'Headphones',
          stock: 10,
          inStock: true,
          rating: 4.9,
          reviewCount: 258,
          badge: 'BESTSELLER',
        }),
      });
    });

    await page.goto('/product/e2e-prod-1');

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
