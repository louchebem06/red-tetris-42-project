<script lang="ts">
	import ImageUser from '$lib/componante/ImageUser.svelte';

	export let username: string;
	export let master = false;
</script>

<div class:master>
	<ImageUser {username} />
	<p>{username}</p>
</div>

<style lang="scss">
	.master {
		background: $orange;
	}

	div {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background: $white70;
		padding: 10px 20px;
		border-radius: 10px;

		p {
			color: $black;
		}
	}
</style>
