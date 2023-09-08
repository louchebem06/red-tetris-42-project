import { newMap, type StateType, type TetriminosArrayType } from '../gameUtils';
import { changeElementInTetriminos, positionForRotate } from './utils';

export const addLine = 2;

export const createS = (): TetriminosArrayType => {
	const map = newMap(addLine);
	map[0][4] = 'S';
	map[1][4] = 'S';
	map[1][5] = 'S';
	map[2][5] = 'S';
	return map;
};

export const rotateS = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	switch (stateTetriminos) {
		case 0:
			return rotateS1(tetriminos);
		case 1:
			return rotateS2(tetriminos);
		case 2:
			return rotateS3(tetriminos);
		case 3:
			return rotateS0(tetriminos);
	}
};

const rotateS0 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'S');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 2, y: pos.y + 1 }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'S');
	return map;
};

const rotateS1 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'S');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y }, 'S');
	changeElementInTetriminos(map, { x: pos.x - 2, y: pos.y }, 'S');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'S');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'S');
	return map;
};

const rotateS2 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'S');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'S');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 1 }, 'S');
	return map;
};

const rotateS3 = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const map = newMap(addLine);
	const pos = positionForRotate(tetriminos, 'S');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 2 }, 'S');
	changeElementInTetriminos(map, { x: pos.x + 1, y: pos.y - 2 }, 'S');
	changeElementInTetriminos(map, { x: pos.x, y: pos.y - 1 }, 'S');
	changeElementInTetriminos(map, { x: pos.x - 1, y: pos.y - 1 }, 'S');
	return map;
};
