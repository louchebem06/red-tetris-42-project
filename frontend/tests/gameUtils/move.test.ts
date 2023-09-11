import { expect, test } from '@playwright/test';
import { moveRight, moveLeft, type TetriminosType } from '../../src/lib/game/gameUtils';

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
});
