<script lang="ts">
	import ImageUser from '$lib/componante/ImageUser.svelte';
	import type { ItemLeaderBoard } from '$lib/leaderBoardApi';

	export let item: ItemLeaderBoard;
</script>

<div class="item">
	<ImageUser username={item.username} />
	<div class="info">
		<p>{item.username}</p>
		<p>{item.score}pts</p>
	</div>
</div>

<style lang="scss">
	@import '../../lib/scss/variables';

	.item {
		padding: 10px 2px;
		border-radius: 4px;
		width: 80%;
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 15px;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
		background: $background;

		.info {
			color: $white2;
			width: 100%;
			display: flex;
			justify-content: space-around;
		}
	}
</style>
