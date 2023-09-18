import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 2;

export const createL = (): TetriminosArrayType => {
	const map = newMap(addLine);
	for (let i = 0; i < 3; i++) map[i][4] = 'L';
	map[2][5] = 'L';
	return map;
};

export const rotateL = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateL1(tetriminos);
		case 1:
			return rotateL2(tetriminos);
		case 2:
			return rotateL3(tetriminos);
		case 3:
			return rotateL0(tetriminos);
	}
};

const rotateL0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y + 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y + 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'L');
	return map;
};

const rotateL1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y }, 'L');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'L');
	return map;
};

const rotateL2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'L');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'L');
	return map;
};

const rotateL3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'L');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'L');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'L');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'L');
	return map;
};
