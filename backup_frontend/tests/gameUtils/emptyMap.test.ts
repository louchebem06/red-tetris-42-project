import { expect, test } from '@playwright/test';
import { newMap } from '../../src/lib/game/gameUtils';
import { defaultMap } from './gameUtilsDefault';

test('Generate empty map', () => {
	expect(newMap()).toStrictEqual(defaultMap);
});
