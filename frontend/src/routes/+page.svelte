<script lang="ts">
	import { page } from '$app/stores';
	import ListRoom from '$lib/listRoom/ListRoom.svelte';
	import Registration from '$lib/registration/Registration.svelte';
	import WaitingRoom from '$lib/waitingRoom/WaitingRoom.svelte';
	import { username } from '../store';

	const hashFormat: RegExp = /^#[a-zA-Z0-9]{3,}\[[a-zA-Z0-9]{3,}\]$/;
</script>

<svelte:head>
	{#if hashFormat.test($page.url.hash)}
		<title>WaitingRoom | Red Tetris</title>
	{:else if !$username}
		<title>Registration | Red Tetris</title>
	{:else if $username}
		<title>ListRoom | Red Tetris</title>
	{/if}
</svelte:head>

{#if hashFormat.test($page.url.hash)}
	<WaitingRoom />
{:else if !$username}
	<Registration />
{:else if $username}
	<ListRoom />
{/if}
