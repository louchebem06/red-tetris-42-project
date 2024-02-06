import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

const persitedUsername: string = browser ? localStorage.getItem('username') ?? '' : '';
export const username: Writable<string> = writable(persitedUsername);

username.subscribe((value: string) => {
	if (browser) {
		localStorage.setItem('username', value);
	}
});

const persitedSessionID: string = browser ? localStorage.getItem('sessionID') ?? '' : '';
export const sessionID: Writable<string> = writable(persitedSessionID);

sessionID.subscribe((value: string) => {
	if (browser) {
		localStorage.setItem('sessionID', value);
	}
});

const persitedMusic: string = browser ? localStorage.getItem('music') ?? 'song BR' : 'song BR';
export const music: Writable<string> = writable(persitedMusic);

music.subscribe((value: string) => {
	if (browser) {
		localStorage.setItem('music', value);
	}
});

const persitedMusicLevel: number = browser
	? Number.parseFloat(localStorage.getItem('musicLevel') ?? '1')
	: 1;
export const musicLevel: Writable<number> = writable(persitedMusicLevel);

musicLevel.subscribe((value: number) => {
	if (browser) {
		localStorage.setItem('musicLevel', value.toString());
	}
});

const persitedMusicMute: boolean = browser
	? localStorage.getItem('musicMute') == 'true' ?? false
	: false;
export const musicMute: Writable<boolean> = writable(persitedMusicMute);

musicMute.subscribe((value: boolean) => {
	if (browser) {
		localStorage.setItem('musicMute', value.toString());
	}
});

const persitedEffectLevel: number = browser
	? Number.parseFloat(localStorage.getItem('effectLevel') ?? '1')
	: 1;
export const effectLevel: Writable<number> = writable(persitedEffectLevel);

effectLevel.subscribe((value: number) => {
	if (browser) {
		localStorage.setItem('effectLevel', value.toString());
	}
});

const persitedEffectMute: boolean = browser
	? localStorage.getItem('effectMute') == 'true' ?? false
	: false;
export const effectMute: Writable<boolean> = writable(persitedEffectMute);

effectMute.subscribe((value: boolean) => {
	if (browser) {
		localStorage.setItem('effectMute', value.toString());
	}
});

if (browser) {
	window.addEventListener('storage', (event) => {
		const key = event.key;
		const value = event.newValue;
		if (value != null) {
			switch (key) {
				case 'username':
					username.set(value);
					break;
				case 'sessionID':
					sessionID.set(value);
					break;
				case 'music':
					music.set(value);
					break;
				case 'musicLevel':
					music.set(value);
					break;
				case 'musicMute':
					musicMute.set(value == 'true');
					break;
				case 'effectLevel':
					effectLevel.set(Number.parseFloat(value));
					break;
				case 'effectMute':
					effectMute.set(value == 'true');
					break;
			}
		}
	});
}
