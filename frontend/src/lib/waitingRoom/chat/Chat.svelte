<script lang="ts">
	import Message from './Message.svelte';
	import { sessionID } from '../../../store';
	import type Player from '$lib/interfaces/Player.interface';
	import { onDestroy, onMount } from 'svelte';
	import { io } from '$lib/socket';
	import type RoomType from '$lib/interfaces/Room.interface';
	import type RoomChange from '$lib/interfaces/RoomChange.interface';

	export let master: Player;
	export let players: Player[];
	export let room: string;
	export let ready = 0;
	export let userIsReady: boolean;

	let chat: HTMLDivElement;
	let msgs: { message: string; username: string | undefined; me?: boolean; system?: boolean }[] =
		[];
	let inputMessage: HTMLElement;

	const autoScrollDown = (): void => {
		if (typeof chat != 'undefined') {
			chat.scrollTop = chat.scrollHeight;
		}
	};

	let newMessage: string = '';

	const addSystemMessage = (msg: string): void => {
		msgs = [
			...msgs,
			{
				message: msg,
				username: undefined,
				system: true,
			},
		];
		setTimeout(() => {
			autoScrollDown();
		}, 100);
	};

	onMount(() => {
		io.on('message', (data: { message: string; emitter: Player; receiver: RoomType }) => {
			// console.log('message', data);
			if (data.receiver.name != room) return;
			msgs = [
				...msgs,
				{
					message: data.message,
					username: data.emitter.username,
					me: data.emitter.sessionID == $sessionID,
				},
			];
			setTimeout(() => {
				autoScrollDown();
				inputMessage.focus();
			}, 100);
		});
		io.on('roomChange', (data: RoomChange) => {
			// console.log('change', data);
			if (data.room.name != room || data.reason == 'ready') return;
			addSystemMessage(
				`${data.reason}: ${
					data.reason != 'new leader' ? data.player.username : data.room.leader.username
				}
				`,
			);
		});
		io.on('playerChange', (data: { reason: string; player: Player }) => {
			// console.log('player change', data);
			if (data.reason != 'ready') return;
			const statusRoom = data.player?.roomsState.filter((e) => e.name == room)[0];
			ready = statusRoom.readys;
			if ($sessionID == data.player.sessionID) {
				userIsReady = statusRoom.status == 'ready';
			}
			addSystemMessage(
				`${data.player.username} ${statusRoom.status == 'ready' ? 'set' : 'unset'} ready`,
			);
		});
	});

	onDestroy(() => {
		io.off('message');
		io.off('roomChange');
		io.off('playerChange');
	});

	const onSubmit = (): void => {
		if (!newMessage) return;
		io.emit('message', {
			message: newMessage,
			receiver: room,
		});
		newMessage = '';
	};

	const toggleReady = (): void => {
		io.emit('ready', room);
	};
</script>

<div class="content">
	<div class="ready">
		<p>{ready} player{ready > 1 ? 's' : ''} ready of {players.length}</p>
		<button on:click={toggleReady}>
			{#if userIsReady}
				Unset ready
			{:else}
				Set ready
			{/if}
		</button>
		{#if $sessionID == master?.sessionID}
			<button>Run Game</button>
		{/if}
	</div>

	<div class="chat" bind:this={chat}>
		{#if msgs.length == 0}
			<p>No messages</p>
		{/if}
		{#each msgs as message}
			<Message {...message} />
		{/each}
	</div>

	<form on:submit={onSubmit}>
		<input
			bind:this={inputMessage}
			bind:value={newMessage}
			type="text"
			placeholder="your message"
		/>
		<button type="submit">Send</button>
	</form>
</div>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		height: calc(100vh - 100px);

		.ready {
			width: calc(50vw - 10px);
			height: 50px;
			background: $white70;
			padding: 10px;
			box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.chat {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 4px;
			border-radius: 14px;
			background: $white70;
			box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
			height: 100%;
			width: 50vw;
			overflow-y: auto;
		}

		form {
			padding: 10px;
			width: calc(50vw - 10px);
			border-radius: 10px;
			background: $white70;
			display: flex;
			justify-content: space-between;
			gap: 10px;
			align-items: center;

			input {
				padding: 10px;
				border-radius: 10px;
				width: 100%;
			}
		}
	}
</style>
