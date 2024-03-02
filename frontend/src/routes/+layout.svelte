<script lang="ts">
	import LeaderBoard from '$lib/leaderBoard/LeaderBoard.svelte';
	import '$lib/scss/app.scss';
	import Notifications from 'svelte-notifications';
</script>

<Notifications zIndex="100">
	<LeaderBoard />
	<slot />
</Notifications>
