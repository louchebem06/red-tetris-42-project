import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 2;

export const createZ = (): TetriminosArrayType => {
	const map = newMap(addLine);
	map[0][5] = 'Z';
	map[1][5] = 'Z';
	map[1][4] = 'Z';
	map[2][4] = 'Z';
	return map;
};

export const rotateZ = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateZ1(tetriminos);
		case 1:
			return rotateZ2(tetriminos);
		case 2:
			return rotateZ3(tetriminos);
		case 3:
			return rotateZ0(tetriminos);
	}
};

const rotateZ0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y + 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y }, 'Z');
	return map;
};

const rotateZ1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y }, 'Z');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'Z');
	return map;
};

const rotateZ2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y }, 'Z');
	return map;
};

const rotateZ3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'Z');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y - 1 }, 'Z');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'Z');
	return map;
};
