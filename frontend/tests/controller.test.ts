import { expect, test } from '@playwright/test';
import controller from '../src/lib/game/controller';

test.describe('Controller functional', () => {
	const items = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
	const boolean: Record<string, boolean> = {};

	items.map((elem: string) => (boolean[elem] = false));

	const callback = {
		up: (): void => {
			boolean.ArrowUp = true;
		},
		down: (): void => {
			boolean.ArrowDown = true;
		},
		left: (): void => {
			boolean.ArrowLeft = true;
		},
		right: (): void => {
			boolean.ArrowRight = true;
		},
		space: (): void => {
			boolean.Space = true;
		},
	};

	test.describe('Default value callback', () => {
		items.map((elem: string) => {
			test(elem, () => {
				expect(boolean[elem]).toBe(false);
			});
		});
	});

	items.map((elem: string) => {
		test(elem, () => {
			try {
				controller(
					{
						key: elem != 'Space' ? elem : ' ',
					},
					callback,
				);
			} catch (e) {
				/* ignored */
			}
			expect(boolean[elem]).toBe(true);
		});
	});
});

// TODO Refactoriser this test
// TODO enable test
test.describe.skip('Controller componante', () => {
	let downB = false;
	let leftB = false;
	let rightB = false;
	let upB = false;
	let spaceB = false;

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const down = (): void => {
		downB = true;
	};
	const left = (): void => {
		leftB = true;
	};
	const right = (): void => {
		rightB = true;
	};
	const up = (): void => {
		upB = true;
	};
	const space = (): void => {
		spaceB = true;
	};
	/* eslint-enable @typescript-eslint/no-unused-vars */

	// TODO trouver comment monter le componante

	test('Press Down', async ({ page }) => {
		await page.keyboard.press('ArrowDown');
		expect(downB).toBe(true);
	});

	test('Press Left', async ({ page }) => {
		await page.keyboard.press('ArrowLeft');
		expect(leftB).toBe(true);
	});

	test('Press Right', async ({ page }) => {
		await page.keyboard.press('ArrowRight');
		expect(rightB).toBe(true);
	});

	test('Press Up', async ({ page }) => {
		await page.keyboard.press('ArrowUp');
		expect(upB).toBe(true);
	});

	test('Press Space', async ({ page }) => {
		await page.keyboard.press(' ');
		expect(spaceB).toBe(true);
	});
});
