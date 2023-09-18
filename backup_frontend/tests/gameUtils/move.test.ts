import { expect, test } from '@playwright/test';
import {
	moveRight,
	moveLeft,
	moveDown,
	type TetriminosType,
	getTetriminos,
} from '../../src/lib/game/gameUtils';
import { generateMove } from './gameUtilsDefault';

test.describe('Moving', () => {
	const tetriminosType: TetriminosType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

	test.describe('Right', () => {
		tetriminosType.forEach((type) => {
			test(type, () => {
				expect(moveRight([[type, '']])).toStrictEqual([['', type]]);
			});
			test(`${type} exception`, () => {
				expect(() => {
					moveRight([[type]]);
				}).toThrowError();
			});
		});
	});

	test.describe('Left', () => {
		tetriminosType.forEach((type) => {
			test(type, () => {
				expect(moveLeft([['', type]])).toStrictEqual([[type, '']]);
			});
			test(`${type} exception`, () => {
				expect(() => {
					moveLeft([[type]]);
				}).toThrowError();
			});
		});
	});

	test.describe('Down', () => {
		tetriminosType.forEach((type) => {
			test.describe(type, () => {
				for (let i = 1; i <= 10; i++) {
					let tetriminos = getTetriminos(type);
					for (let j = 0; j < i; j++) {
						tetriminos = moveDown(tetriminos);
					}
					test(i.toString(), () => {
						expect(tetriminos).toStrictEqual(generateMove(type, i));
					});
				}
			});
		});
	});
});
