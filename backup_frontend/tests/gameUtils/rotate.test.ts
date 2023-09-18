import { expect, test } from '@playwright/test';
import {
	getTetriminos,
	moveLeft,
	moveRight,
	rotate,
	type StateType,
	type TetriminosArrayType,
	type TetriminosType,
} from '../../src/lib/game/gameUtils';
import {
	defaultI,
	defaultIstep1,
	defaultIstep2,
	defaultIstep3,
	defaultJ,
	defaultJstep1,
	defaultJstep2,
	defaultJstep3,
	defaultL,
	defaultLstep1,
	defaultLstep2,
	defaultLstep3,
	defaultO,
	defaultS,
	defaultSstep1,
	defaultSstep2,
	defaultSstep3,
	defaultT,
	defaultTstep1,
	defaultTstep2,
	defaultTstep3,
	defaultZ,
	defaultZstep1,
	defaultZstep2,
	defaultZstep3,
} from './gameUtilsDefault';

interface TetriminosTest {
	type: TetriminosType;
	step: TetriminosArrayType[];
}

const tetriminos: TetriminosTest[] = [
	{
		type: 'I',
		step: [defaultIstep1, defaultIstep2, defaultIstep3, defaultI],
	},
	{
		type: 'O',
		step: [defaultO, defaultO, defaultO, defaultO],
	},
	{
		type: 'J',
		step: [defaultJstep1, defaultJstep2, defaultJstep3, defaultJ],
	},
	{
		type: 'L',
		step: [defaultLstep1, defaultLstep2, defaultLstep3, defaultL],
	},
	{
		type: 'T',
		step: [defaultTstep1, defaultTstep2, defaultTstep3, defaultT],
	},
	{
		type: 'S',
		step: [defaultSstep1, defaultSstep2, defaultSstep3, defaultS],
	},
	{
		type: 'Z',
		step: [defaultZstep1, defaultZstep2, defaultZstep3, defaultZ],
	},
];

test.describe('Rotate', () => {
	tetriminos.forEach((tetrimino: TetriminosTest) => {
		test.describe(tetrimino.type, () => {
			test.describe('Middle', () => {
				let t = getTetriminos(tetrimino.type);
				tetrimino.step.forEach((step, index) => {
					test(`Step ${index}`, () => {
						t = rotate(t, index as StateType);
						expect(t).toStrictEqual(step);
					});
				});
			});
		});
	});
});

test.describe('Rotate exception', () => {
	const sz: TetriminosType[] = ['S', 'Z'];
	sz.forEach((type) => {
		test.describe(type, () => {
			test('left', () => {
				let tetriminos = getTetriminos(type);
				for (let i = 0; i < 4; i++) tetriminos = moveLeft(tetriminos);
				expect(() => rotate(tetriminos, 0)).toThrowError();
			});
			test('right', () => {
				let tetriminos = getTetriminos(type);
				let r: StateType = 0;
				for (; r < 2; r++) tetriminos = rotate(tetriminos, r as StateType);
				for (let i = 0; i < 5; i++) tetriminos = moveRight(tetriminos);
				expect(() => rotate(tetriminos, r)).toThrowError();
			});
		});
	});

	test.describe('T', () => {
		test('left', () => {
			let tetriminos = getTetriminos('T');
			tetriminos = rotate(tetriminos, 0);
			for (let i = 0; i < 5; i++) tetriminos = moveLeft(tetriminos);
			expect(() => rotate(tetriminos, 1)).toThrowError();
		});
		test('right', () => {
			let tetriminos = getTetriminos('T');
			let r: StateType = 0;
			for (; r < 3; r++) tetriminos = rotate(tetriminos, r as StateType);
			for (let i = 0; i < 4; i++) tetriminos = moveRight(tetriminos);
			expect(() => rotate(tetriminos, r)).toThrowError();
		});
	});

	test.describe('I', () => {
		test('left', () => {
			let tetriminos = getTetriminos('I');
			for (let i = 0; i < 5; i++) tetriminos = moveLeft(tetriminos);
			expect(() => rotate(tetriminos, 0)).toThrowError();
		});
		test('right', () => {
			let tetriminos = getTetriminos('I');
			for (let i = 0; i < 4; i++) tetriminos = moveRight(tetriminos);
			expect(() => rotate(tetriminos, 0)).toThrowError();
		});
	});

	test.describe('J', () => {
		test('left', () => {
			let tetriminos = getTetriminos('J');
			let r: StateType = 0;
			for (; r < 2; r++) tetriminos = rotate(tetriminos, r as StateType);
			for (let i = 0; i < 5; i++) tetriminos = moveLeft(tetriminos);
			expect(() => rotate(tetriminos, r)).toThrowError();
		});
		test('right', () => {
			let tetriminos = getTetriminos('J');
			for (let i = 0; i < 4; i++) tetriminos = moveRight(tetriminos);
			expect(() => rotate(tetriminos, 0)).toThrowError();
		});
	});

	test.describe('L', () => {
		test('left', () => {
			let tetriminos = getTetriminos('L');
			for (let i = 0; i < 4; i++) tetriminos = moveLeft(tetriminos);
			expect(() => rotate(tetriminos, 0)).toThrowError();
		});
		test('right', () => {
			let tetriminos = getTetriminos('L');
			let r: StateType = 0;
			for (; r < 2; r++) tetriminos = rotate(tetriminos, r as StateType);
			for (let i = 0; i < 5; i++) tetriminos = moveRight(tetriminos);
			expect(() => rotate(tetriminos, r)).toThrowError();
		});
	});
});
