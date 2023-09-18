import type { TetriminosArrayType, TetriminosType } from '../../src/lib/game/gameUtils';
import { addLine as addLineI } from '../../src/lib/game/tetriminos/tetriminosI';
import { addLine as addLineJ } from '../../src/lib/game/tetriminos/tetriminosJ';
import { addLine as addLineL } from '../../src/lib/game/tetriminos/tetriminosL';
import { addLine as addLineO } from '../../src/lib/game/tetriminos/tetriminosO';
import { addLine as addLineS } from '../../src/lib/game/tetriminos/tetriminosS';
import { addLine as addLineT } from '../../src/lib/game/tetriminos/tetriminosT';
import { addLine as addLineZ } from '../../src/lib/game/tetriminos/tetriminosZ';

const line: TetriminosArrayType = [['', '', '', '', '', '', '', '', '', '']];

const createLines = (nbOfLine: number): TetriminosArrayType => {
	let newLines: TetriminosArrayType = [];
	for (let i = 0; i < nbOfLine; i++) newLines = [...newLines, ...line];
	return newLines;
};

const compliteMap = (removeLine: number = 0): TetriminosArrayType => {
	return createLines(16 - removeLine);
};

const compliteForTetriminos = (tretrimonos: TetriminosType): TetriminosArrayType => {
	let newLines: TetriminosArrayType = [];
	switch (tretrimonos) {
		case 'I':
			for (let i = 0; i < addLineI; i++) newLines = [...newLines, ...line];
			break;
		case 'J':
			for (let i = 0; i < addLineJ; i++) newLines = [...newLines, ...line];
			break;
		case 'L':
			for (let i = 0; i < addLineL; i++) newLines = [...newLines, ...line];
			break;
		case 'O':
			for (let i = 0; i < addLineO; i++) newLines = [...newLines, ...line];
			break;
		case 'S':
			for (let i = 0; i < addLineS; i++) newLines = [...newLines, ...line];
			break;
		case 'T':
			for (let i = 0; i < addLineT; i++) newLines = [...newLines, ...line];
			break;
		case 'Z':
			for (let i = 0; i < addLineZ; i++) newLines = [...newLines, ...line];
			break;
	}
	return newLines;
};

const generateIMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', '', 'I', '', '', '', ''],
		['', '', '', '', '', 'I', '', '', '', ''],
		['', '', '', '', '', 'I', '', '', '', ''],
		['', '', '', '', '', 'I', '', '', '', ''],
		...compliteMap(m),
		...compliteForTetriminos('I'),
	];
};

const generateOMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', 'O', 'O', '', '', '', ''],
		['', '', '', '', 'O', 'O', '', '', '', ''],
		...line,
		...line,
		...compliteMap(m),
		...compliteForTetriminos('O'),
	];
};

const generateTMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', '', 'T', '', '', '', ''],
		['', '', '', '', 'T', 'T', 'T', '', '', ''],
		...line,
		...line,
		...compliteMap(m),
		...compliteForTetriminos('T'),
	];
};

const generateLMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', 'L', '', '', '', '', ''],
		['', '', '', '', 'L', '', '', '', '', ''],
		['', '', '', '', 'L', 'L', '', '', '', ''],
		...line,
		...compliteMap(m),
		...compliteForTetriminos('L'),
	];
};

const generateJMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', '', 'J', '', '', '', ''],
		['', '', '', '', '', 'J', '', '', '', ''],
		['', '', '', '', 'J', 'J', '', '', '', ''],
		...line,
		...compliteMap(m),
		...compliteForTetriminos('J'),
	];
};

const generateSMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', 'S', '', '', '', '', ''],
		['', '', '', '', 'S', 'S', '', '', '', ''],
		['', '', '', '', '', 'S', '', '', '', ''],
		...line,
		...compliteMap(m),
		...compliteForTetriminos('S'),
	];
};

const generateZMove = (m: number): TetriminosArrayType => {
	return [
		...createLines(m),
		['', '', '', '', '', 'Z', '', '', '', ''],
		['', '', '', '', 'Z', 'Z', '', '', '', ''],
		['', '', '', '', 'Z', '', '', '', '', ''],
		...line,
		...compliteMap(m),
		...compliteForTetriminos('Z'),
	];
};

export const generateMove = (type: TetriminosType, m: number): TetriminosArrayType => {
	switch (type) {
		case 'I':
			return generateIMove(m);
		case 'J':
			return generateJMove(m);
		case 'L':
			return generateLMove(m);
		case 'O':
			return generateOMove(m);
		case 'S':
			return generateSMove(m);
		case 'T':
			return generateTMove(m);
		case 'Z':
			return generateZMove(m);
	}
};

export const defaultMap: TetriminosArrayType = [
	...line,
	...line,
	...line,
	...line,
	...compliteMap(),
];

export const defaultI: TetriminosArrayType = [
	['', '', '', '', '', 'I', '', '', '', ''],
	['', '', '', '', '', 'I', '', '', '', ''],
	['', '', '', '', '', 'I', '', '', '', ''],
	['', '', '', '', '', 'I', '', '', '', ''],
	...compliteMap(),
	...compliteForTetriminos('I'),
];

export const defaultIstep1: TetriminosArrayType = [
	...line,
	...line,
	['', '', '', 'I', 'I', 'I', 'I', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('I'),
];

export const defaultIstep2: TetriminosArrayType = [
	['', '', '', '', 'I', '', '', '', '', ''],
	['', '', '', '', 'I', '', '', '', '', ''],
	['', '', '', '', 'I', '', '', '', '', ''],
	['', '', '', '', 'I', '', '', '', '', ''],
	...compliteMap(),
	...compliteForTetriminos('I'),
];

export const defaultIstep3: TetriminosArrayType = [
	...line,
	['', '', '', 'I', 'I', 'I', 'I', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('I'),
];

export const defaultO: TetriminosArrayType = [
	['', '', '', '', 'O', 'O', '', '', '', ''],
	['', '', '', '', 'O', 'O', '', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('O'),
];

export const defaultT: TetriminosArrayType = [
	['', '', '', '', '', 'T', '', '', '', ''],
	['', '', '', '', 'T', 'T', 'T', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('T'),
];

export const defaultTstep1: TetriminosArrayType = [
	['', '', '', '', '', 'T', '', '', '', ''],
	['', '', '', '', '', 'T', 'T', '', '', ''],
	['', '', '', '', '', 'T', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('T'),
];

export const defaultTstep2: TetriminosArrayType = [
	...line,
	['', '', '', '', 'T', 'T', 'T', '', '', ''],
	['', '', '', '', '', 'T', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('T'),
];

export const defaultTstep3: TetriminosArrayType = [
	['', '', '', '', '', 'T', '', '', '', ''],
	['', '', '', '', 'T', 'T', '', '', '', ''],
	['', '', '', '', '', 'T', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('T'),
];

export const defaultL: TetriminosArrayType = [
	['', '', '', '', 'L', '', '', '', '', ''],
	['', '', '', '', 'L', '', '', '', '', ''],
	['', '', '', '', 'L', 'L', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('L'),
];

export const defaultLstep1: TetriminosArrayType = [
	...line,
	['', '', '', 'L', 'L', 'L', '', '', '', ''],
	['', '', '', 'L', '', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('L'),
];

export const defaultLstep2: TetriminosArrayType = [
	['', '', '', 'L', 'L', '', '', '', '', ''],
	['', '', '', '', 'L', '', '', '', '', ''],
	['', '', '', '', 'L', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('L'),
];

export const defaultLstep3: TetriminosArrayType = [
	['', '', '', '', '', 'L', '', '', '', ''],
	['', '', '', 'L', 'L', 'L', '', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('L'),
];

export const defaultJ: TetriminosArrayType = [
	['', '', '', '', '', 'J', '', '', '', ''],
	['', '', '', '', '', 'J', '', '', '', ''],
	['', '', '', '', 'J', 'J', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('J'),
];

export const defaultJstep1: TetriminosArrayType = [
	['', '', '', '', 'J', '', '', '', '', ''],
	['', '', '', '', 'J', 'J', 'J', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('J'),
];

export const defaultJstep2: TetriminosArrayType = [
	['', '', '', '', '', 'J', 'J', '', '', ''],
	['', '', '', '', '', 'J', '', '', '', ''],
	['', '', '', '', '', 'J', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('J'),
];

export const defaultJstep3: TetriminosArrayType = [
	...line,
	['', '', '', '', 'J', 'J', 'J', '', '', ''],
	['', '', '', '', '', '', 'J', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('J'),
];

export const defaultZ: TetriminosArrayType = [
	['', '', '', '', '', 'Z', '', '', '', ''],
	['', '', '', '', 'Z', 'Z', '', '', '', ''],
	['', '', '', '', 'Z', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('Z'),
];

export const defaultZstep1: TetriminosArrayType = [
	...line,
	['', '', '', 'Z', 'Z', '', '', '', '', ''],
	['', '', '', '', 'Z', 'Z', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('Z'),
];

export const defaultZstep2: TetriminosArrayType = [
	['', '', '', '', 'Z', '', '', '', '', ''],
	['', '', '', 'Z', 'Z', '', '', '', '', ''],
	['', '', '', 'Z', '', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('Z'),
];

export const defaultZstep3: TetriminosArrayType = [
	['', '', '', 'Z', 'Z', '', '', '', '', ''],
	['', '', '', '', 'Z', 'Z', '', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('Z'),
];

export const defaultS: TetriminosArrayType = [
	['', '', '', '', 'S', '', '', '', '', ''],
	['', '', '', '', 'S', 'S', '', '', '', ''],
	['', '', '', '', '', 'S', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('S'),
];

export const defaultSstep1: TetriminosArrayType = [
	...line,
	['', '', '', '', 'S', 'S', '', '', '', ''],
	['', '', '', 'S', 'S', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('S'),
];

export const defaultSstep2: TetriminosArrayType = [
	['', '', '', 'S', '', '', '', '', '', ''],
	['', '', '', 'S', 'S', '', '', '', '', ''],
	['', '', '', '', 'S', '', '', '', '', ''],
	...line,
	...compliteMap(),
	...compliteForTetriminos('S'),
];

export const defaultSstep3: TetriminosArrayType = [
	['', '', '', '', 'S', 'S', '', '', '', ''],
	['', '', '', 'S', 'S', '', '', '', '', ''],
	...line,
	...line,
	...compliteMap(),
	...compliteForTetriminos('S'),
];
