import { expect, test } from '@playwright/test';
import { joinMapTetriminos, type TetriminosArrayType } from '../../src/lib/game/gameUtils';

const fakeMap: TetriminosArrayType = [
	['I', '', '', 'I'],
	['', 'I', 'I', ''],
	['', 'I', 'I', ''],
	['I', '', '', 'I'],
];
const fakeTetriminos: TetriminosArrayType = [
	['', 'S', 'S', ''],
	['S', '', '', 'S'],
	['S', '', '', 'S'],
	['', 'S', 'S', ''],
];
const fakeTetriminos2: TetriminosArrayType = [
	['', 'S', 'S', ''],
	['S', '', '', 'S'],
	['S', '', '', 'S'],
	['S', 'S', 'S', ''],
];
const result = [
	['I', 'S', 'S', 'I'],
	['S', 'I', 'I', 'S'],
	['S', 'I', 'I', 'S'],
	['I', 'S', 'S', 'I'],
];

test.describe('Join Map Tetriminos', () => {
	test('Valid joinMapTetriminos', () => {
		expect(joinMapTetriminos(fakeMap, fakeTetriminos)).toStrictEqual(result);
	});

	test('Exception joinMapTetriminos', () => {
		expect(() => {
			joinMapTetriminos(fakeMap, fakeTetriminos2);
		}).toThrowError();
	});
});
