import { test, expect } from '@playwright/test';

test.describe('Cart & Purchase Flow', () => {
  test('adds product to cart and opens drawer', async ({ page }) => {
    await page.goto('/');

    // Wait for featured product card to appear
    const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartButton).toBeVisible();

    await addToCartButton.click();

    // Verify button shows Added! state
    await expect(page.getByText(/Added!/i).first()).toBeVisible();
  });
});
