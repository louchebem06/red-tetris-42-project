import { expect, test } from '@playwright/test';

test('Home page title navigator', async ({ page }) => {
	await page.goto('/');
	expect(await page.title()).toBe('Red Tetris');
});
