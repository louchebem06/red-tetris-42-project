import type { TetriminosArrayType, TetriminosType } from '../../src/lib/game/gameUtils';
import { addLine as addLineI } from '../../src/lib/game/tetriminos/tetriminosI';
import { addLine as addLineJ } from '../../src/lib/game/tetriminos/tetriminosJ';
import { addLine as addLineL } from '../../src/lib/game/tetriminos/tetriminosL';
import { addLine as addLineO } from '../../src/lib/game/tetriminos/tetriminosO';
import { addLine as addLineS } from '../../src/lib/game/tetriminos/tetriminosS';
import { addLine as addLineT } from '../../src/lib/game/tetriminos/tetriminosT';
import { addLine as addLineZ } from '../../src/lib/game/tetriminos/tetriminosZ';

const line: TetriminosArrayType = [['', '', '', '', '', '', '', '', '', '']];

const compliteMap = (): TetriminosArrayType => {
	let newLines: TetriminosArrayType = [];
	for (let i = 0; i < 16; i++) newLines = [...newLines, ...line];
	return newLines;
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
	['', '', '', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', '', '', ''],
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
