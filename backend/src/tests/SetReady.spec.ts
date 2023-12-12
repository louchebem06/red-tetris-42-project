import { Socket, io } from 'socket.io-client';
import { expect } from '@jest/globals';
import App from '../model/App';
import { IRoomState } from '../interface/IRoomState';
import { Payload } from '../type/PayloadsTypes';

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';

const usernames = [
	'Minnie',
	'Daisy',
	'Donald',
	'Riri',
	'Fifi',
	'Loulou',
	'Mickey',
	'Picsou',
	'Plutot',
	'Tic',
	'Tac',
	'Clarabelle',
	'Dingo',
	'Bulbizarre',
	'Salameche',
	'Dracofeu',
	'Carapuce',
	'Pikachu',
	'Rondoudou',
	'Papillusion',
	'Magicarpe',
	'Evoli',
	'Poissirene',
	'Ronflex',
];

const createClient = (username: string): Socket => {
	const socket: Socket = io(`${protocol}://${host}:${serverPort}`, {
		forceNew: true,
		reconnectionDelay: 0,
		reconnection: true,
		auth: {
			username: username,
		},
		autoConnect: false,
	});
	return socket;
};

describe('E2E Set Ready', () => {
	let app: App;
	beforeAll((): void => {
		app = new App();
		app.start();
	});

	afterAll(() => {
		app.stop();
		console.log('Close app');
	});

	describe('Set Ready', () => {
		// const room = 'maSuperRoomSetReady';
		// const sockets: Record<string, Socket> = {};
		// usernames.forEach((username) => {
		// 	it(`Define socket ${username}`, () => {
		// 		sockets[username] = createClient(username);
		// 	});
		// });
		// usernames.forEach((username) => {
		// 	it(`Connect Socket ${username}`, async () => {
		// 		await expect(
		// 			new Promise((resolve, reject) => {
		// 				sockets[username].connect();
		// 				sockets[username].on('connect', () => {
		// 					resolve(true);
		// 				});
		// 				sockets[username].on('error', () => {
		// 					reject(false);
		// 				});
		// 			}),
		// 		).resolves.toBe(true);
		// 		expect(sockets[username].connected).toBe(true);
		// 		sockets[username].off('connect');
		// 		sockets[username].off('error');
		// 	});
		// });
		// it(`${usernames[0]} create room`, async () => {
		// 	await expect(
		// 		new Promise((resolve, reject) => {
		// 			sockets[usernames[0]].on('roomOpened', (data: Payload) => {
		// 				resolve(data);
		// 			});
		// 			sockets[usernames[0]].on('error', () => {
		// 				reject(false);
		// 			});
		// 			sockets[usernames[0]].emit('createRoom', room);
		// 		}),
		// 	).resolves.toMatchObject({
		// 		room: {
		// 			name: room,
		// 			leader: {
		// 				username: usernames[0],
		// 				sessionID: expect.any(String),
		// 			},
		// 		},
		// 		player: {
		// 			username: usernames[0],
		// 			sessionID: expect.any(String),
		// 		},
		// 	});
		// 	sockets[usernames[0]].off('roomOpened');
		// 	sockets[usernames[0]].off('error');
		// });
		// it(`${room} check informations`, async () => {
		// 	await expect(
		// 		new Promise((resolve, reject) => {
		// 			sockets[usernames[0]].on('roomInfo', (data) => {
		// 				resolve(data);
		// 			});
		// 			sockets[usernames[0]].on('error', () => {
		// 				reject(false);
		// 			});
		// 			sockets[usernames[0]].emit('getRoom', room);
		// 		}),
		// 	).resolves.toMatchObject({
		// 		name: room,
		// 		leader: {
		// 			username: usernames[0],
		// 		},
		// 		totalPlayers: 1,
		// 		totalReady: 0,
		// 	});
		// 	sockets[usernames[0]].off('roomOpened');
		// 	sockets[usernames[0]].off('error');
		// });
		// usernames.forEach((username, index) => {
		// 	if (index == 0) return;
		// 	it(`${username} Join room`, async () => {
		// 		await expect(
		// 			new Promise((resolve, reject) => {
		// 				sockets[username].on('roomChange', (data) => {
		// 					if (data.room.name == room) resolve(data);
		// 				});
		// 				sockets[username].on('error', () => {
		// 					reject(false);
		// 				});
		// 				sockets[username].emit('joinRoom', room);
		// 			}),
		// 		).resolves.toMatchObject({
		// 			reason: 'player incoming',
		// 		});
		// 		sockets[username].off('roomChange');
		// 		sockets[username].off('error');
		// 	});
		// });
		// usernames.forEach((username, index) => {
		// 	if (index == 0) return;
		// 	it(`${username} set ready`, async () => {
		// 		await expect(
		// 			new Promise((resolve, reject) => {
		// 				sockets[username].on('playerChange', (data) => {
		// 					const status =
		// 						data.player?.roomsState?.find((r: IRoomState) => {
		// 							return r.name === room;
		// 						})?.status ?? null;
		// 					if (status?.match(/ready|idle/)) resolve(true);
		// 					else reject(false);
		// 				});
		// 				sockets[username].on('error', () => {
		// 					reject(false);
		// 				});
		// 				sockets[username].emit('ready', room);
		// 			}),
		// 		).resolves.toBe(true);
		// 		sockets[username].off('playerChange');
		// 		sockets[username].off('error');
		// 	});
		// });
		// it(`${room} check informations 2`, async () => {
		// 	await expect(
		// 		new Promise((resolve, reject) => {
		// 			sockets[usernames[0]].on('roomInfo', (data) => {
		// 				resolve(data);
		// 			});
		// 			sockets[usernames[0]].on('error', () => {
		// 				reject(false);
		// 			});
		// 			sockets[usernames[0]].emit('getRoom', room);
		// 		}),
		// 	).resolves.toMatchObject({
		// 		name: room,
		// 		leader: {
		// 			username: usernames[0],
		// 		},
		// 		totalPlayers: usernames.length,
		// 		totalReady: usernames.length - 1,
		// 	});
		// 	sockets[usernames[0]].off('roomOpened');
		// 	sockets[usernames[0]].off('error');
		// });
		// it(`${room} closed`, async () => {
		// 	usernames.forEach((username) => {
		// 		sockets[username].emit('leaveRoom', room);
		// 	});
		// 	await expect(
		// 		new Promise((resolve, reject) => {
		// 			sockets[usernames[0]].on('roomClosed', (data) => {
		// 				if (data.room.name == room) resolve(true);
		// 			});
		// 			sockets[usernames[0]].on('error', (msg) => {
		// 				console.log('error', msg);
		// 				reject(false);
		// 			});
		// 		}),
		// 	).resolves.toBe(true);
		// 	sockets[usernames[0]].off('roomClosed');
		// 	sockets[usernames[0]].off('error');
		// }, 2000);
		// afterAll((done) => {
		// 	usernames.forEach((username) => {
		// 		sockets[username].disconnect();
		// 	});
		// 	done();
		// });
	});
});
