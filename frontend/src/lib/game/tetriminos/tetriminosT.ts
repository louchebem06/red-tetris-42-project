import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 1;

export const createT = (): TetriminosArrayType => {
	const map = newMap(addLine);
	map[0][5] = 'T';
	map[1][4] = 'T';
	map[1][5] = 'T';
	map[1][6] = 'T';
	return map;
};

export const rotateT = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateT1(tetriminos);
		case 1:
			return rotateT2(tetriminos);
		case 2:
			return rotateT3(tetriminos);
		case 3:
			return rotateT0(tetriminos);
	}
};

const rotateT0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'T');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'T');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'T');
	return map;
};

const rotateT1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'T');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y + 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'T');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y }, 'T');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'T');
	return map;
};

const rotateT2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'T');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y }, 'T');
	return map;
};

const rotateT3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'T');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y }, 'T');
	return map;
};
