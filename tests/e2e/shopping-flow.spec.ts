import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for the complete shopping flow
 * Tests the critical path from product browsing to order completion
 */

test.describe('Shopping Flow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test('Complete purchase flow - Guest checkout', async () => {
    // Performance timing
    const startTime = Date.now();
    
    // 1. Browse products
    await test.step('Browse products', async () => {
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Check that products load within 3 seconds
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 3000 });
      const products = await page.locator('[data-testid="product-card"]').count();
      expect(products).toBeGreaterThan(0);
    });

    // 2. View product details
    await test.step('View product details', async () => {
      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await firstProduct.click();
      
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
    });

    // 3. Add to cart
    await test.step('Add to cart', async () => {
      const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
      await addToCartBtn.click();
      
      // Wait for cart update
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
      
      // Check for success notification
      await expect(page.locator('[data-testid="notification"]')).toContainText('Added to cart');
    });

    // 4. View cart
    await test.step('View cart', async () => {
      await page.locator('[data-testid="cart-button"]').click();
      
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
      
      // Check cart calculations
      const itemPrice = await page.locator('[data-testid="item-price"]').textContent();
      const cartTotal = await page.locator('[data-testid="cart-total"]').textContent();
      expect(itemPrice).toBeTruthy();
      expect(cartTotal).toBeTruthy();
    });

    // 5. Proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await page.locator('[data-testid="checkout-btn"]').click();
      
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    });

    // 6. Fill shipping information
    await test.step('Fill shipping information', async () => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.fill('[data-testid="address-input"]', '123 Test St');
      await page.fill('[data-testid="city-input"]', 'Test City');
      await page.fill('[data-testid="postal-code-input"]', '12345');
      await page.selectOption('[data-testid="country-select"]', 'US');
    });

    // 7. Select shipping method
    await test.step('Select shipping method', async () => {
      await page.locator('[data-testid="shipping-standard"]').check();
      
      // Wait for shipping calculation
      await page.waitForSelector('[data-testid="order-total"]');
    });

    // 8. Payment information (test mode)
    await test.step('Enter payment information', async () => {
      // Switch to Stripe iframe
      const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
      
      // Use Stripe test card
      await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242');
      await stripeFrame.locator('[name="exp-date"]').fill('12/34');
      await stripeFrame.locator('[name="cvc"]').fill('123');
      await stripeFrame.locator('[name="postal"]').fill('12345');
    });

    // 9. Place order
    await test.step('Place order', async () => {
      await page.locator('[data-testid="place-order-btn"]').click();
      
      // Wait for order processing
      await page.waitForSelector('[data-testid="order-success"]', { timeout: 30000 });
      
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-success"]')).toContainText('Thank you');
    });

    // Performance check - entire flow should complete within reasonable time
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(45000); // Less than 45 seconds for complete flow
  });

  test('Add multiple items and modify cart', async () => {
    await test.step('Add multiple products to cart', async () => {
      // Add first product
      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await firstProduct.click();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      await page.goBack();

      // Add second product
      const secondProduct = page.locator('[data-testid="product-card"]').nth(1);
      await secondProduct.click();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      
      // Check cart count
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');
    });

    await test.step('Modify cart quantities', async () => {
      await page.locator('[data-testid="cart-button"]').click();
      
      // Increase quantity
      const increaseBtn = page.locator('[data-testid="increase-quantity"]').first();
      await increaseBtn.click();
      
      // Check that quantity and total updated
      await expect(page.locator('[data-testid="item-quantity"]').first()).toContainText('2');
    });

    await test.step('Remove item from cart', async () => {
      const removeBtn = page.locator('[data-testid="remove-item"]').first();
      await removeBtn.click();
      
      // Confirm removal
      await page.locator('[data-testid="confirm-remove"]').click();
      
      // Check cart updated
      const cartItems = await page.locator('[data-testid="cart-item"]').count();
      expect(cartItems).toBe(1);
    });
  });

  test('Guest checkout with promo code', async () => {
    // Add product to cart
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    await page.locator('[data-testid="cart-button"]').click();
    
    await test.step('Apply promo code', async () => {
      // Expand promo code section
      await page.locator('[data-testid="promo-code-toggle"]').click();
      
      // Enter test promo code
      await page.fill('[data-testid="promo-code-input"]', 'TEST10');
      await page.locator('[data-testid="apply-promo-btn"]').click();
      
      // Check discount applied
      await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
      await expect(page.locator('[data-testid="promo-success"]')).toContainText('Promo code applied');
    });

    await test.step('Verify discount in checkout', async () => {
      await page.locator('[data-testid="checkout-btn"]').click();
      
      // Check that discount shows in order summary
      await expect(page.locator('[data-testid="order-discount"]')).toBeVisible();
      const discountText = await page.locator('[data-testid="order-discount"]').textContent();
      expect(discountText).toContain('-');
    });
  });

  test('Mobile responsive checkout', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await test.step('Mobile product browsing', async () => {
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
      
      // Check that product grid adapts to mobile
      const productGrid = page.locator('[data-testid="product-grid"]');
      await expect(productGrid).toHaveClass(/mobile/);
    });

    await test.step('Mobile cart interaction', async () => {
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      
      // Open mobile cart drawer
      await page.locator('[data-testid="cart-button"]').click();
      await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    });

    await test.step('Mobile checkout form', async () => {
      await page.locator('[data-testid="checkout-btn"]').click();
      
      // Check that form fields are properly sized for mobile
      const emailInput = page.locator('[data-testid="email-input"]');
      const inputWidth = await emailInput.boundingBox();
      expect(inputWidth?.width).toBeGreaterThan(250); // Should be wide enough on mobile
    });
  });

  test('Performance benchmarks', async () => {
    await test.step('Page load performance', async () => {
      const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
      const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
      const loadTime = loadComplete - navigationStart;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    await test.step('Product search performance', async () => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('t-shirt');
      
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="search-results"]');
      const searchTime = Date.now() - startTime;
      
      // Search should complete within 1 second
      expect(searchTime).toBeLessThan(1000);
    });

    await test.step('Cart operations performance', async () => {
      await page.locator('[data-testid="product-card"]').first().click();
      
      const startTime = Date.now();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      await page.waitForSelector('[data-testid="cart-count"]');
      const addToCartTime = Date.now() - startTime;
      
      // Add to cart should complete within 500ms
      expect(addToCartTime).toBeLessThan(500);
    });
  });

  test('Error handling and recovery', async () => {
    await test.step('Handle payment failures', async () => {
      // Add product and proceed to checkout
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      await page.locator('[data-testid="cart-button"]').click();
      await page.locator('[data-testid="checkout-btn"]').click();
      
      // Fill required information
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.fill('[data-testid="address-input"]', '123 Test St');
      await page.fill('[data-testid="city-input"]', 'Test City');
      await page.fill('[data-testid="postal-code-input"]', '12345');
      
      // Use declined test card
      const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
      await stripeFrame.locator('[name="cardnumber"]').fill('4000000000000002');
      await stripeFrame.locator('[name="exp-date"]').fill('12/34');
      await stripeFrame.locator('[name="cvc"]').fill('123');
      
      await page.locator('[data-testid="place-order-btn"]').click();
      
      // Check error handling
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('declined');
    });

    await test.step('Handle network errors', async () => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-btn"]').click();
      
      // Check error message appears
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      
      // Check retry functionality
      await page.unroute('**/api/**');
      await page.locator('[data-testid="retry-btn"]').click();
      
      // Should succeed after retry
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    });
  });

  test('Accessibility compliance', async () => {
    await test.step('Keyboard navigation', async () => {
      // Navigate using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should navigate to product page
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      
      // Tab to add to cart button and activate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should add to cart
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    });

    await test.step('Screen reader support', async () => {
      // Check for proper ARIA labels
      const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
      await expect(addToCartBtn).toHaveAttribute('aria-label');
      
      // Check for form labels
      await page.locator('[data-testid="cart-button"]').click();
      await page.locator('[data-testid="checkout-btn"]').click();
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('aria-describedby');
    });

    await test.step('Color contrast and focus indicators', async () => {
      // Check focus indicators are visible
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      const outline = await focusedElement.evaluate(el => {
        return window.getComputedStyle(el).outline;
      });
      
      expect(outline).not.toBe('none');
    });
  });
});