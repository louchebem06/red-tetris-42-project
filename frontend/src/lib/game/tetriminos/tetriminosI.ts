import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 3;

export const createI = (): TetriminosArrayType => {
	const map = newMap(addLine);
	for (let i = 0; i < 4; i++) map[i][5] = 'I';
	return map;
};

export const rotateI = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateIStep1(tetriminos);
		case 1:
			return rotateIStep2(tetriminos);
		case 2:
			return rotateIStep3(tetriminos);
		case 3:
			return rotateIStep0(tetriminos);
	}
};

const rotateIStep0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'I');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y - 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y + 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y + 2 }, 'I');
	return map;
};

const rotateIStep1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'I');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x - 2, y: pos.y - 1 }, 'I');
	return map;
};

const rotateIStep2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y + 1 }, 'I');
	return map;
};

const rotateIStep3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'I');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'I');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 2 }, 'I');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'I');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y - 2 }, 'I');
	return map;
};
