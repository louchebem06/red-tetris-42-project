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
