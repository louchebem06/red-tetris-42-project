<script lang="ts">
	export let show: boolean;

	const close = (): void => {
		show = false;
	};
</script>

{#if show}
	<div class="modal">
		<button on:click={close}>Close</button>
		<slot />
	</div>
{/if}

<style lang="scss">
	.modal {
		z-index: 10;
		background: white;
		border: 1px solid black;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 40px 30px 30px 30px;

		button {
			position: fixed;
			top: 10px;
			right: 10px;
		}
	}
</style>
