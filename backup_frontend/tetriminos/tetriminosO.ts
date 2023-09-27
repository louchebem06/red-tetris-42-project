import { newMap, type TetriminosArrayType } from '../gameUtils';

export const addLine = 1;

export const createO = (): TetriminosArrayType => {
	const map = newMap(addLine);
	map[0][4] = 'O';
	map[0][5] = 'O';
	map[1][4] = 'O';
	map[1][5] = 'O';
	return map;
};
