import { expect, test } from '@playwright/test';
import path from 'path';

test('shopping list renders and accepts items', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Shopping List')).toBeVisible();

  const input = page.getByPlaceholder('Add item');
  await expect(input).toBeVisible();

  await input.fill('Milk');
  // Pressable renders without role="button" in RN Web — target via testID
  await page.getByTestId('add-button').click();
  await expect(page.getByText('Milk')).toBeVisible();

  await page.screenshot({
    path: path.join('screenshots', 'smoke.png'),
    fullPage: true,
  });
});
