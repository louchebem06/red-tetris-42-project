<script lang="ts">
	import controller from '$lib/game/controller';

	export let up: () => void;
	export let down: () => void;
	export let space: () => void;
	export let left: () => void;
	export let right: () => void;

	const keydown = (e: KeyboardEvent & { currentTarget: EventTarget & Window }): void => {
		controller(e, { up, down, left, right, space });
	};
</script>

<svelte:window on:keydown={keydown} />
