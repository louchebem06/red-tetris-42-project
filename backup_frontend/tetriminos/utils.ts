import type { TetriminosArrayType, TetriminosType } from '../gameUtils';

export interface IPosition {
	x: number;
	y: number;
}

export const copy = (map: TetriminosArrayType): TetriminosArrayType => {
	const newMap: TetriminosArrayType = [];
	map.map((item) => newMap.push([...item]));
	return newMap;
};

export const getType = (tetriminos: TetriminosArrayType): TetriminosType => {
	let letter: TetriminosType | undefined;
	for (const y in tetriminos) {
		for (const x in tetriminos[y]) {
			const current = tetriminos[y][x];
			if (current != '' && current != letter) {
				if (letter != undefined)
					throw new Error('This is not Tetriminos getType is impossible');
				letter = tetriminos[y][x] as TetriminosType;
			}
		}
	}
	if (typeof letter == 'undefined') throw new Error('Not type found');
	return letter;
};

export const positionForRotate = (
	tetriminos: TetriminosArrayType,
	search: TetriminosType,
): IPosition => {
	for (let y = tetriminos.length - 1; y >= 0; y--) {
		for (let x = 0; x < tetriminos[y].length; x++) {
			if (tetriminos[y][x] == search) {
				return { x, y };
			}
		}
	}
	throw new Error('Rotate impossible');
};

export const changeElementInTetriminos = (
	tetriminos: TetriminosArrayType,
	position: IPosition,
	newValue: TetriminosType | '' = '',
): void => {
	if (
		position.x < 0 ||
		position.y < 0 ||
		position.x >= tetriminos[0].length ||
		position.y >= tetriminos.length
	)
		throw new Error('Rotate impossible');
	tetriminos[position.y][position.x] = newValue;
};
