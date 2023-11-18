import { test, expect } from './baseFixtures';

test('Error Page', async ({ page }) => {
	const response = await page.goto('/pageNotFound');

	expect(await page.title()).toEqual(
		`${response?.status()} - ${response?.statusText()} | Red Tetris`,
	);
});
