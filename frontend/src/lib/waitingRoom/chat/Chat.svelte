<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Message from './Message.svelte';
	import { io } from '$lib/socket';
	import { username } from '../../../store';

	let chat: HTMLDivElement;
	let msgs = [
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: true,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
		{
			message: 'Je suis un message',
			username: 'user1',
			me: false,
		},
	];

	const autoScrollDown = (): void => {
		if (typeof chat != 'undefined') {
			chat.scrollTop = chat.scrollHeight;
		}
	};

	let newMessage: string = '';

	const onSubmit = (): void => {
		if (!newMessage) return;
		msgs = [...msgs, { message: newMessage, username: $username, me: true }];
		newMessage = '';
	};

	onMount(() => {
		autoScrollDown();
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

	$: if (msgs) {
		setTimeout(() => autoScrollDown(), 100);
	}
</script>

<div class="content">
	<div class="chat" bind:this={chat}>
		{#each msgs as message}
			<Message {...message} />
		{/each}
	</div>

	<form on:submit={onSubmit}>
		<input bind:value={newMessage} type="text" placeholder="your message" />
		<button type="submit">Send</button>
	</form>
</div>

<style lang="scss">
	.chat {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 14px;
		background: $white70;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
		height: calc(100vh - 175px);
		width: 50vw;
		overflow-y: auto;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 10px;

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
