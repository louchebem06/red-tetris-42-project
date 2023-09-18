<script lang="ts">
	import User from '$lib/componante/User.svelte';
	import { io } from '$lib/socket';
	import { onDestroy, onMount } from 'svelte';

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

<div class="users">
	<User username="Testos" master />
</div>

<style lang="scss">
	.users {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 14px;
		background: $white70;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
		height: calc(100vh - 100px);
		overflow-y: auto;
	}
</style>
