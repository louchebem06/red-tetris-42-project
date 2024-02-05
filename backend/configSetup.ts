import * as fs from 'fs';

// TODO Ask this info before starting server!
const controller = new AbortController();
const { signal } = controller;

type Env = {
	key: string;
	value: string;
};

const env: Env[] = [
	// { key: 'PORT', value: '32769' },
	{ key: 'PORT', value: '8080' },
	{ key: 'HOST', value: 'localhost' },
	{ key: 'PROTOCOL', value: 'ws' },
];

if (process.env.UNITSTESTS) {
	env.push({ key: 'DESTROY_TIMER', value: '9' });
	env.push({ key: 'DISCO_TIMER', value: '5' });
	env.push({ key: 'START_GAME_TIMER', value: '5' });
} else if (process.env.DEV) {
	env.push({ key: 'DESTROY_TIMER', value: '60' });
	env.push({ key: 'DISCO_TIMER', value: '30' });
	env.push({ key: 'START_GAME_TIMER', value: '15' });
} else {
	env.push({ key: 'DESTROY_TIMER', value: '3600' });
	env.push({ key: 'DISCO_TIMER', value: '60' });
	env.push({ key: 'START_GAME_TIMER', value: '60' });
}

const body = env
	.map((e) => `${e.key}=${e.value}`)
	.toString()
	.split(',')
	.join('\n');

fs.access('./.env', fs.constants.F_OK, (err) => {
	if (err) {
		if (process.env.DEV || process.env.UNITSTESTS) {
			fs.writeFile('./.env', body, { signal }, (error) => {
				console.log(`\x1b[33m*** .env created ***\x1b[0m`);
				if (error) {
					console.error(`***[${error?.name}:${error?.message}]***`);
					controller.abort();
				}
			});
		} else {
			console.log(`\x1b[31m*** YOU SHOULD BE IN PROD (ask to sysadmin) ***\x1b[0m`);
		}
	} else {
		console.log(`\x1b[31m*** .env already exists ***\x1b[0m`);
	}
});
