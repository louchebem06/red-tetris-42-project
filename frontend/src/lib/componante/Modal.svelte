<script lang="ts">
	import Button from '$lib/componante/Button.svelte';
	export let show: boolean;

	const close = (): void => {
		show = false;
	};
</script>

{#if show}
	<div class="modal">
		<Button class="button" on:click={close}>Close</Button>
		<slot />
	</div>
{/if}

<style lang="scss">
	@import '../scss/variables.scss';
	.modal {
		z-index: 10;
		background: white;
		border: 0.5px solid $orange;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 40px 30px 30px 30px;
		border-radius: 10px;
		box-shadow: rgba(255, 162, 0, 0.2) 0px 7px 29px 0px;

		:global(.button) {
			position: fixed;
			top: 10px;
			right: 10px;
		}
	}
</style>
