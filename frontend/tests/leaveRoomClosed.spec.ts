import { test, expect } from '@playwright/test';

test('End-to-End Test: Connection, Room Creation, and Multi-Tab Management', async ({
	context,
}) => {
	const page = await context.newPage();

	await page.goto('/');

	expect(await page.title()).toEqual('Registration | Red Tetris');

	await page.getByPlaceholder('username').click();
	await page.getByPlaceholder('username').fill('master');
	await page.getByRole('button', { name: 'Enter in Red Tetris' }).click();

	expect(await page.title()).toEqual('ListRoom | Red Tetris');

	await page.getByRole('button', { name: 'Create a room' }).click();
	await page.getByRole('textbox').click();
	await page.getByRole('textbox').fill('testos');
	await page.getByRole('button', { name: 'send' }).click();

	expect(await page.title()).toEqual('WaitingRoom | Red Tetris');

	const page1 = await context.newPage();

	await page1.goto('/');

	expect(await page1.title()).toEqual('ListRoom | Red Tetris');

	await page1.getByRole('button', { name: 'testos 1 player' }).click();

	expect(await page1.title()).toEqual('WaitingRoom | Red Tetris');

	await page1.getByRole('button', { name: 'Leave' }).click();

	expect(await page1.title()).toEqual('ListRoom | Red Tetris');
	expect(await page.title()).toEqual('ListRoom | Red Tetris');
});
