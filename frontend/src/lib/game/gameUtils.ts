import { createI, rotateI } from './tetriminos/tetriminosI';
import { createJ, rotateJ } from './tetriminos/tetriminosJ';
import { createL, rotateL } from './tetriminos/tetriminosL';
import { createO } from './tetriminos/tetriminosO';
import { createS, rotateS } from './tetriminos/tetriminosS';
import { createT, rotateT } from './tetriminos/tetriminosT';
import { createZ, rotateZ } from './tetriminos/tetriminosZ';
import { copy, getType } from './tetriminos/utils';

export type TetriminosType = 'I' | 'O' | 'T' | 'L' | 'J' | 'Z' | 'S';
export type TetriminosArrayType = (TetriminosType | '')[][];
export type StateType = 0 | 1 | 2 | 3;

export const newMap = (addLine = 0): TetriminosArrayType => {
	const nbOfColumn = 10;
	const nbOfLine = 20;
	const map: ''[][] = [];
	const line: ''[] = [];
	for (let i = 0; i < nbOfColumn; i++) line.push('');
	for (let i = 0; i < nbOfLine + addLine; i++) map.push([...line]);
	return map;
};

export const getTetriminos = (letter: TetriminosType): TetriminosArrayType => {
	switch (letter) {
		case 'I':
			return createI();
		case 'O':
			return createO();
		case 'T':
			return createT();
		case 'L':
			return createL();
		case 'J':
			return createJ();
		case 'Z':
			return createZ();
		case 'S':
			return createS();
	}
};

export const joinMapTetriminos = (
	map: TetriminosArrayType,
	tetriminos: TetriminosArrayType,
): TetriminosArrayType => {
	const newMap = copy(map);
	let yTetriminos = tetriminos.length - 1;
	for (let y = newMap.length - 1; y >= 0; y--, yTetriminos--) {
		for (let x = 0; x < newMap[y].length; x++) {
			if (tetriminos[yTetriminos][x] != '') {
				if (newMap[y][x] != '') throw new Error('An object is blocking this movement');
				newMap[y][x] = tetriminos[yTetriminos][x];
			}
		}
	}
	return newMap;
};

export const moveRight = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const tetriminosCopy = copy(tetriminos);
	for (let y = 0; y < tetriminosCopy.length; y++)
		if (tetriminosCopy[y][tetriminosCopy[y].length - 1] != '')
			throw new Error('Move right not possible');
	for (let y = tetriminosCopy.length - 1; y >= 0; y--) {
		for (let x = tetriminosCopy[y].length - 1; x >= 0; x--) {
			if (tetriminosCopy[y][x] !== '') {
				tetriminosCopy[y][x + 1] = tetriminosCopy[y][x];
				tetriminosCopy[y][x] = '';
			}
		}
	}
	return tetriminosCopy;
};

export const moveLeft = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	const tetriminosCopy = copy(tetriminos);
	for (let y = 0; y < tetriminosCopy.length; y++)
		if (tetriminosCopy[y][0] != '') throw new Error('Move left not possible');
	for (let y = 0; y < tetriminosCopy.length; y++) {
		for (let x = 0; x < tetriminosCopy[y].length; x++) {
			if (tetriminosCopy[y][x] != '') {
				tetriminosCopy[y][x - 1] = tetriminosCopy[y][x];
				tetriminosCopy[y][x] = '';
			}
		}
	}
	return tetriminosCopy;
};

export const moveDown = (tetriminos: TetriminosArrayType): TetriminosArrayType => {
	let tetriminosCopy = copy(tetriminos);
	const endLineIsEmpty = (): boolean => {
		const y = tetriminosCopy.length - 1;
		for (let x = 0; x < tetriminosCopy[tetriminosCopy.length - 1].length; x++)
			if (tetriminosCopy[y][x] != '') return false;
		return true;
	};
	if (!endLineIsEmpty()) throw Error('Move down is not possible');
	tetriminosCopy = [['', '', '', '', '', '', '', '', '', ''], ...tetriminosCopy];
	tetriminosCopy.pop();
	return tetriminosCopy;
};

export const rotate = (
	tetriminos: TetriminosArrayType,
	stateTetriminos: StateType,
): TetriminosArrayType => {
	const type: TetriminosType = getType(tetriminos);
	switch (type) {
		case 'I':
			return rotateI(tetriminos, stateTetriminos);
		case 'J':
			return rotateJ(tetriminos, stateTetriminos);
		case 'L':
			return rotateL(tetriminos, stateTetriminos);
		case 'O':
			return tetriminos;
		case 'S':
			return rotateS(tetriminos, stateTetriminos);
		case 'T':
			return rotateT(tetriminos, stateTetriminos);
		case 'Z':
			return rotateZ(tetriminos, stateTetriminos);
	}
};
