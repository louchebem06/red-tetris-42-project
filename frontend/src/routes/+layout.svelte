<script lang="ts">
	import '$lib/scss/app.scss';
	import Notifications from 'svelte-notifications';
</script>

<Notifications zIndex="100">
	<slot />
</Notifications>
