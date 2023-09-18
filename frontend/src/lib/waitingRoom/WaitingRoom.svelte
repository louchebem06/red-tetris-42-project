<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Game from '$lib/game/Game.svelte';
	import { username } from '../../store';
	import Chat from './chat/Chat.svelte';
	import Room from './room/Room.svelte';

	const getHashValue = (): void => {
		const hash = $page.url.hash;
		const values = hash.replace('#', '').replace(']', '').split('[');
		// room = values[0];
		user = values[1];
	};

	const goHome = (): void => {
		goto('/');
	};

	// let room: string;
	let user: string;
	let game: boolean = false;

	$: if ($page.url.hash) {
		getHashValue();
	}
	$: if (user) {
		username.set(user);
	}
</script>

{#if !game}
	<button class="btnListRoom" on:click={goHome}>Return list rooms</button>

	<div>
		<Room />
		<Chat />
	</div>
{:else}
	<Game />
{/if}

<style lang="scss">
	.btnListRoom {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	div {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}
</style>
