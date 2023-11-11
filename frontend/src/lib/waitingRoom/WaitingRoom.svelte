<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Game from '$lib/game/Game.svelte';
	import { username, sessionID } from '../../store';
	import Chat from './chat/Chat.svelte';
	import Room from './room/Room.svelte';
	import { io } from '$lib/socket';
	import { onDestroy, onMount } from 'svelte';
	import type RoomChange from '$lib/interfaces/RoomChange.interface';
	import type Player from '$lib/interfaces/Player.interface';
	import type RoomType from '$lib/interfaces/Room.interface';

	let room: string;
	let user: string;
	let game: boolean = false;

	let players: Player[] = [];
	let master: Player;

	const getHashValue = (): void => {
		const hash = $page.url.hash;
		const values = hash.replace('#', '').replace(']', '').split('[');
		room = values[0].replaceAll('%20', ' ');
		user = values[1];
	};

	const goHome = (): void => {
		io.emit('leaveRoom', room);
		goto('/');
	};

	onMount(() => {
		getHashValue();
		io.emit('changeUsername', user);
		io.emit('getRoom', room);
		io.on('roomInfo', (data: RoomType) => {
			// console.log('roomInfo', data);
			if (data == null) {
				io.emit('createRoom', room);
				io.emit('getRoom', room);
				return;
			}
			if (data.name != room) return;
			const index = data.players.findIndex((x) => x.sessionID == $sessionID);
			if (index < 0) {
				io.emit('joinRoom', room);
			}
			players = data.players;
			master = data.leader;
		});
		io.on('roomChange', (data: RoomChange) => {
			console.log('change', data);
			if (data.room.name != room) return;
			switch (data.reason) {
				case 'player incoming':
					players = [...players, data.player];
					break;
				case 'player outgoing':
					players.splice(
						players.findIndex((x) => x.sessionID == data.player.sessionID),
						1,
					);
					players = players;
					break;
				case 'new leader':
					master = data.room.leader;
					break;
			}
		});
	});

	onDestroy(() => {
		io.off('roomInfo');
		io.off('roomChange');
	});

	$: if ($page.url.hash) {
		getHashValue();
	}
	$: if (user && user != $username) {
		username.set(user);
	}
</script>

{#if !game}
	<button class="btnListRoom" on:click={goHome}>Leave</button>
	<div>
		<Room bind:players bind:master />
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
