<script lang="ts">
	import Grid from './Grid.svelte';
	import Controller from './Controller.svelte';
	import KeysGame from './keyboard/KeysGame.svelte';
	// import Sound from './Sound.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { io } from '$lib/socket';
	import type { TetriminosArrayType } from './gameUtils';
	import NextPiece from './NextPiece.svelte';

	const up = (): void => {};

	const down = (): void => {};

	const left = (): void => {};

	const right = (): void => {};

	const space = (): void => {};

	let tab: TetriminosArrayType = [
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
		['I', '', '', '', '', 'I', '', '', '', ''],
	];
	let nextPiece: TetriminosArrayType = [
		['', 'I', '', ''],
		['', 'I', '', ''],
		['', 'I', '', ''],
		['', 'I', '', ''],
	];

	const controller = { up, down, left, right, space };

	// let effects: { [key: string]: HTMLAudioElement };

	onMount(() => {
		io.on('connect', () => {
			console.log('Connected to socket');
		});
		io.on('disconnect', () => {
			console.log('Disconect to socket');
		});
		io.on('connect_error', () => {
			console.log('Error connection socket');
		});
		io.on('reconnecting', () => {
			console.log('Reconnecting to socket');
		});
		io.on('reconnect', () => {
			console.log('reconnect to socket');
		});
	});

	onDestroy(() => {
		io.close();
	});
</script>

<Controller {...controller} />
<KeysGame />
<NextPiece bind:nextPiece />
<!-- <Sound bind:effects /> -->

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
