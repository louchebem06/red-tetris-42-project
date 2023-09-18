import type { ComponentProps } from 'svelte';
import { render } from '@testing-library/svelte';
import Controller from './Controller.svelte';
import { expect, test, describe } from 'vitest';

describe('Controller componente', () => {
	const tests: { [key: string]: { bool: boolean; name: string; key: string }[] } = {
		keydown: [
			{
				bool: false,
				name: 'UP',
				key: 'ArrowUp',
			},
			{
				bool: false,
				name: 'DOWN',
				key: 'ArrowDown',
			},
			{
				bool: false,
				name: 'LEFT',
				key: 'ArrowLeft',
			},
			{
				bool: false,
				name: 'RIGHT',
				key: 'ArrowRight',
			},
			{
				bool: false,
				name: 'SPACE',
				key: ' ',
			},
		],
		keyup: [
			{
				bool: false,
				name: 'UP',
				key: 'ArrowUp',
			},
			{
				bool: false,
				name: 'DOWN',
				key: 'ArrowDown',
			},
			{
				bool: false,
				name: 'LEFT',
				key: 'ArrowLeft',
			},
			{
				bool: false,
				name: 'RIGHT',
				key: 'ArrowRight',
			},
			{
				bool: false,
				name: 'SPACE',
				key: ' ',
			},
		],
	};

	const props: ComponentProps<Controller> = {
		up: () => {
			tests.keydown[0].bool = true;
		},
		down: () => {
			tests.keydown[1].bool = true;
		},
		left: () => {
			tests.keydown[2].bool = true;
		},
		right: () => {
			tests.keydown[3].bool = true;
		},
		space: () => {
			tests.keydown[4].bool = true;
		},
		upUp: () => {
			tests.keyup[0].bool = true;
		},
		downUp: () => {
			tests.keyup[1].bool = true;
		},
		leftUp: () => {
			tests.keyup[2].bool = true;
		},
		rightUp: () => {
			tests.keyup[3].bool = true;
		},
		spaceUp: () => {
			tests.keyup[4].bool = true;
		},
	};

	Object.keys(tests).forEach((d) => {
		describe(d, () => {
			tests[d].forEach((t) => {
				test(t.name, () => {
					render(Controller, props);
					window.dispatchEvent(new KeyboardEvent(d, { key: t.key }));
					expect(t.bool).toBe(true);
				});
			});
		});
	});
});
