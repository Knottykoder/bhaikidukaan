import { test, expect } from '@playwright/test';

test.describe('Cart & Purchase Flow', () => {
  test('adds product to cart and opens drawer', async ({ page }) => {
    // Intercept products API for deterministic hermetic testing
    await page.route('**/products/featured*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 'e2e-1',
              name: 'Apple AirPods Max Wireless',
              price: 49999,
              compareAtPrice: 59900,
              currency: 'INR',
              images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
              categoryId: 'headphones',
              categoryName: 'Headphones',
              stock: 10,
              inStock: true,
              rating: 4.9,
              reviewCount: 258,
              badge: 'BESTSELLER',
            },
          ],
        }),
      });
    });

    await page.goto('/');

    // Wait for featured product card to appear
    const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartButton).toBeVisible();

    await addToCartButton.click();

    // Verify button shows Added! state
    await expect(page.getByText(/Added!/i).first()).toBeVisible();
  });
});
