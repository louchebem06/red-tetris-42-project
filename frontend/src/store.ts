import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const persitedUsername: string = browser ? localStorage.getItem('username') ?? '' : '';
export const username = writable(persitedUsername) ?? '';

username.subscribe((value: string) => {
	if (browser) {
		window.localStorage.setItem('username', value);
	}
});
