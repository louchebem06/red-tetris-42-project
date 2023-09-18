<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { username } from '../../store';
	import { io } from '$lib/socket';

	const rooms = ['First', 'Second', '42342', '4dsfsdfsa4234'];

	const resetUsername = (): void => {
		username.set('');
	};

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

<div class="main">
	<p>Choose a room</p>
	<div class="rooms">
		{#each rooms as room}
			<a href={`#${room}[${$username}]`}>{room}</a>
		{/each}
	</div>
	<button>Create a room</button>
	<button class="resetUsername" on:click={resetUsername}>Reset your username</button>
</div>

<style lang="scss">
	.main {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: 100vh;
		gap: 10px;

		p,
		a {
			color: $white2;
		}

		.resetUsername {
			position: absolute;
			top: 10px;
			right: 10px;
		}

		.rooms {
			display: flex;
			flex-direction: column;
		}
	}
</style>
