import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 2;

export const createJ = (): TetriminosArrayType => {
	const map = newMap(addLine);
	for (let i = 0; i < 3; i++) map[i][5] = 'J';
	map[2][4] = 'J';
	return map;
};

export const rotateJ = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateJ1(tetriminos);
		case 1:
			return rotateJ2(tetriminos);
		case 2:
			return rotateJ3(tetriminos);
		case 3:
			return rotateJ0(tetriminos);
	}
};

const rotateJ0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'J');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y }, 'J');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 2 }, 'J');
	changeElementInTetriminos(map, { x: pos.x - 2, y: pos.y }, 'J');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'J');
	return map;
};

const rotateJ1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'J');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'J');
	return map;
};

const rotateJ2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y + 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'J');
	return map;
};

const rotateJ3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'J');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'J');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'J');
	return map;
};
