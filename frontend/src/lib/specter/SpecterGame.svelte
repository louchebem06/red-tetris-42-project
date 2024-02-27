<script lang="ts">
	import type Player from '$lib/interfaces/Player.interface';
	import type PlayerGame from '$lib/interfaces/PlayerGame.interface';
	import { sessionID } from '../../store';
	import PlayerSpecter from './PlayerSpecter.svelte';

	export let fixed: boolean = true;
	export let isWaitingRoom: boolean = false;

	const playerGame: PlayerGame[] = [
		{
			player: {
				username: 'BG du 06',
				sessionID: 'sessionID',
			} as Player,
			map: [
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['', '', '', '', '', '', '', '', '', ''],
				['I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I'],
				['I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I'],
			],
			score: 42,
			level: 1,
			endGame: false,
		},
	];
</script>

{#if !isWaitingRoom || (isWaitingRoom && playerGame.length != 0)}
	<div class="specterGame" class:fixed>
		{#if playerGame.length == 0}
			<p>Unable to find any opponent.</p>
		{:else}
			<p>
				Only {playerGame.filter((p) => !p.endGame).length} / {playerGame.length}
				players are still in the game.
			</p>
			<div class="players">
				{#each playerGame.filter((p) => p.player.sessionID != $sessionID) as player}
					<PlayerSpecter bind:player {isWaitingRoom} />
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.fixed {
		position: fixed;
		bottom: 15px;
		left: 15px;
	}

	.specterGame {
		box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;
		background: $white2;
		padding: 15px;
		border-radius: 10px;
		max-width: 320px;

		p {
			text-align: center;
		}

		.players {
			justify-content: center;
			margin-top: 25px;
			max-height: calc(100vh - 300px);
			overflow: auto;
			display: flex;
			flex-wrap: wrap;
		}
	}
</style>
