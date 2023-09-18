import { expect, test } from '@playwright/test';
import { getTetriminos, type TetriminosType } from '../../src/lib/game/gameUtils';
import {
	defaultI,
	defaultJ,
	defaultL,
	defaultO,
	defaultS,
	defaultT,
	defaultZ,
} from './gameUtilsDefault';

test.describe('Tetriminos generator', () => {
	const results = [defaultI, defaultJ, defaultL, defaultO, defaultS, defaultT, defaultZ];
	const tests: TetriminosType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

	tests.forEach((name: TetriminosType, index: number) => {
		test(`Generate ${name}`, () => {
			expect(getTetriminos(name)).toStrictEqual(results[index]);
		});
	});
});
