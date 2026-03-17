import { test, expect } from '@playwright/test';

test.describe('EdgeVision Core Navigation', () => {

  test('home page loads correctly with all tools visible', async ({ page }) => {
    await page.goto('/');

    // Verify Title Text Gradient
    await expect(page.locator('text=EdgeVision').first()).toBeVisible();

    // Verify all 7 tools are listed
    const tools = [
      'Remove Background',
      'Replace Background',
      'Auto Enhance',
      'Smart Crop',
      'Compress',
      'Upscale',
      'Denoise'
    ];

    for (const tool of tools) {
      await expect(page.getByText(tool, { exact: true })).toBeVisible();
    }
  });

  test('remove background tool hydrates correctly', async ({ page }) => {
    // Navigate directly to the tool
    await page.goto('/remove-background');

    // Ensure the dropzone is loaded and ready
    await expect(page.getByText(/Drag & drop an image here/)).toBeVisible();
    await expect(page.getByText(/Supports JPG, PNG, WEBP/)).toBeVisible();
  });

});
