<script lang="ts">
	import Grid from './Grid.svelte';
	import Controller from './Controller.svelte';
	import {
		getTetriminos,
		joinMapTetriminos,
		moveDown,
		moveLeft,
		moveRight,
		newMap,
		rotate,
		type StateType,
		type TetriminosArrayType,
		type TetriminosType,
	} from './gameUtils';
	import KeysGame from './keyboard/KeysGame.svelte';

	const up = (): void => {
		if (!comandIsEnable) return;
		try {
			const newTetriminos = rotate(tetriminos, stateTetriminos);
			tab = joinMapTetriminos(map, newTetriminos);
			tetriminos = newTetriminos;
			stateTetriminos < 3 ? stateTetriminos++ : (stateTetriminos = 0);
		} catch (e) {
			if (e instanceof Error) console.error(e?.message);
		}
	};

	const down = (): void => {
		if (!comandIsEnable) return;
		try {
			const newTetriminos = moveDown(tetriminos);
			tab = joinMapTetriminos(map, newTetriminos);
			tetriminos = newTetriminos;
		} catch (e) {
			if (e instanceof Error) console.error(e?.message);
		}
	};

	const left = (): void => {
		if (!comandIsEnable) return;
		try {
			const newTetriminos = moveLeft(tetriminos);
			tab = joinMapTetriminos(map, newTetriminos);
			tetriminos = newTetriminos;
		} catch (e) {
			if (e instanceof Error) console.error(e?.message);
		}
	};

	const right = (): void => {
		if (!comandIsEnable) return;
		try {
			const newTetriminos = moveRight(tetriminos);
			tab = joinMapTetriminos(map, newTetriminos);
			tetriminos = newTetriminos;
		} catch (e) {
			if (e instanceof Error) console.error(e?.message);
		}
	};

	const space = (): void => {
		if (!comandIsEnable) return;
		for (let i = 0; i < 24; i++) {
			try {
				const newTetriminos = moveDown(tetriminos);
				tab = joinMapTetriminos(map, newTetriminos);
				tetriminos = newTetriminos;
			} catch (e) {
				if (e instanceof Error) {
					checkTouchDown(e);
					return;
				}
			}
		}
	};

	const tetriminosFactory = (): TetriminosArrayType => {
		const tetriminosType: TetriminosType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
		const select = Math.random() * tetriminosType.length;
		const floor = Math.floor(select);
		return getTetriminos(tetriminosType[floor]);
	};

	const checkTouchDown = (e: Error, isNotTouche = false): void => {
		if (
			e?.message == 'Move down is not possible' ||
			e?.message == 'An object is blocking this movement'
		) {
			map = joinMapTetriminos(map, tetriminos);
			console.log(checkIfLine());
			tetriminos = tetriminosFactory();
			try {
				tab = joinMapTetriminos(map, tetriminos);
				if (isNotTouche) setTimeout(game, 1000);
			} catch (e) {
				comandIsEnable = false;
				console.log('End Game');
			}
		}
	};

	const checkIfLine = (): number => {
		let nbOfLine = 0;
		for (let y = map.length - 1; y >= 0; y--) {
			let found = true;
			for (let x = 0; x < map[y].length; x++) {
				if (map[y][x] == '') found = false;
			}
			if (found) {
				for (let yy = y; yy - 1 >= 0; yy--) {
					map[yy] = map[yy - 1];
				}
				map[0] = ['', '', '', '', '', '', '', '', '', ''];
				nbOfLine++;
				y++;
			}
		}
		return nbOfLine;
	};

	const game = (): void => {
		if (!comandIsEnable) return;
		try {
			const newTetriminos = moveDown(tetriminos);
			tab = joinMapTetriminos(map, newTetriminos);
			tetriminos = newTetriminos;
			setTimeout(game, 1000);
		} catch (e) {
			if (e instanceof Error) {
				checkTouchDown(e, true);
			}
		}
	};

	const controller = { up, down, left, right, space };

	let comandIsEnable = false;

	let map = newMap();
	let stateTetriminos: StateType = 0;
	let tetriminos = tetriminosFactory();
	let tab = joinMapTetriminos(map, tetriminos);

	comandIsEnable = true;
	setTimeout(game, 1000);
</script>

<Controller {...controller} />
<KeysGame />

<div class="content">
	<div class="game">
		<Grid bind:tab />
	</div>
</div>

<style lang="scss">
	@use 'sass:map';

	.content {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;

		.game {
			width: map.get($tetrisSize, 'width');
			height: map.get($tetrisSize, 'height');
			border: 1px solid $black;
			border-radius: 3px;
			overflow: hidden;
			position: relative;
		}
	}
</style>
