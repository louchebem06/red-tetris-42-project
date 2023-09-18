import { expect, test } from '@playwright/test';

test.describe('Error Page', () => {
	test('Check code error', async ({ page }) => {
		const p = await page.goto('/pageNotFound');
		expect(p?.status()).toBe(404);
	});

	test('Check title page', async ({ page }) => {
		await page.goto('/pageNotFound');
		expect(await page.title()).toBe('404 - Not Found | Red Tetris');
	});
});
