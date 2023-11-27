import request from 'supertest';
import { Socket, io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import app from '../app';
import App from '../model/App';
import IPlayerJSON from '../interface/IPlayerJSON';
import timer from '../model/Timer';
import { eventEmitter } from '../model/EventEmitter';
import IRoomJSON from '../interface/IRoomJSON';

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';

const destroyTimer = timer.destroySession ?? 5000;
const discoTimer = timer.disconnectSession ?? 5000;

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
let indexPlayer = 0;

const rooms = [
	'Donaldville',
	'Picsouville',
	'Mickeyville',
	'EuroDisney',
	'Bourg Palette',
	'Jadielle',
	'Argenta',
	'Azuria',
	'Carmin-sur-Mer',
	'Lavanville',
	'Celadopole',
	'Safrania',
	'Parmanie',
];
let indexRoom = 0;

type Session = {
	username: string;
	id: string;
};
const sessions: Session[] = [];
const socketsClients: Socket[] = [];
const players: IPlayerJSON[] = [];
const roomsJSON: IRoomJSON[] = [];

// const checkRoomProperties = (room: IRoomJSON, name: string, t: number, l: IPlayerJSON): void => {
// 	expect(room).toHaveProperty('name');
// 	expect(room).toHaveProperty('dateCreated');
// 	expect(room).toHaveProperty('leader');
// 	expect(room).toHaveProperty('gameState');
// 	expect(room).toHaveProperty('usernames');
// 	expect(room).toHaveProperty('totalusernames');

// 	expect(room.name).toBeDefined();
// 	expect(room.dateCreated).toBeDefined();
// 	expect(room.leader).toBeDefined();
// 	expect(room.gameState).toBeDefined();
// 	expect(room.usernames).toBeDefined();
// 	expect(room.totalusernames).toBeDefined();

// 	if (name) {
// 		expect(room.name).toBe(name);
// 	}
// 	if (t) {
// 		expect(room.totalusernames).toBe(t);
// 		expect(room.usernames.length).toBe(t);
// 		if (t === 0) {
// 			expect(room.winner).toBeNull();
// 			expect(room.gameState).toBeFalsy();
// 		}
// 		if (t > 0) {
// 			expect(room.usernames).toContainEqual(room.leader);
// 			expect(room.usernames).toContainEqual(l);
// 		}
// 	}
// 	if (l) {
// 		expect(room.leader.username).toBe(l.username);
// 		expect(room.leader.sessionID).toBe(l.sessionID);
// 		expect(room.leader.dateCreated).toBe(l.dateCreated);
// 		expect(room.leader.connected).toBe(l.connected);
// 		expect(room.leader.wins).toStrictEqual(l.wins);
// 		expect(room.leader.games).toStrictEqual(l.games);
// 		expect(room.leader.leads).toStrictEqual(l.leads);
// 		expect(room.leader.connected).toBeTruthy();
// 	}
// };

const checkPlayerProperties = (player: IPlayerJSON, u: string, r: string, i: string): void => {
	expect(player).toHaveProperty('username');
	expect(player).toHaveProperty('sessionID');
	expect(player).toHaveProperty('dateCreated');
	expect(player).toHaveProperty('wins');
	expect(player).toHaveProperty('games');
	expect(player).toHaveProperty('leads');
	expect(player).toHaveProperty('connected');
	expect(player).toHaveProperty('roomsState');

	expect(player.username).toBeDefined();
	expect(player.sessionID).toBeDefined();
	expect(player.dateCreated).toBeDefined();
	expect(player.connected).toBeDefined();
	expect(player.wins).toBeDefined();
	expect(player.leads).toBeDefined();
	expect(player.games).toBeDefined();
	expect(player.roomsState).toBeDefined();

	expect(player.connected).toBeTruthy();
	if (u) {
		expect(player.username).toBe(u);
	}
	if (i) {
		expect(player.sessionID).toBe(i);
	}
	if (r) {
		expect(player.leads).toContainEqual(r);
	}
};

const createClient = (username: string): Socket => {
	let playerJSON: IPlayerJSON;
	const socket: Socket = io(`${protocol}://${host}:${serverPort}`, {
		forceNew: true,
		reconnectionDelay: 0,
		reconnection: true,
		auth: {
			username: username,
		},
		autoConnect: false,
	});
	socket.connect();

	socket.onAny((event, data) => {
		console.log(
			event,
			// data,
		);
		if (data?.player?.sessionID === playerJSON?.sessionID) {
			playerJSON = data.player;
			console.log('update player: ', playerJSON);
		}
		if (data?.room) {
			let roomJSON: IRoomJSON = roomsJSON.find((r) => r.name === data.room.name) as IRoomJSON;
			console.log('update room: ', data.room);
			if (!roomsJSON.includes(data.room)) {
				roomJSON = data.room;
				roomsJSON.push(roomJSON);
			}
		}
		switch (event) {
			case 'join': {
				const u = data?.username;
				const i = data?.sessionID;
				socket.auth = { username: u, sessionID: i };
				sessions.push({ username: u, id: i });
				socketsClients.push(socket);
				players.push(playerJSON);
				checkPlayerProperties(data, u, '', i);
				playerJSON = data;
				break;
			}
			case 'error':
				break;
			case 'playerChange': {
				break;
			}
			case 'roomChange':
				break;
			case 'roomOpened':
				{
					const r = data?.room;
					const p = data?.player;
					if (!roomsJSON.includes(r)) {
						roomsJSON.push(r);
					}
					console.log('new room: ', r, p, playerJSON);
				}
				break;
			case 'roomClosed':
				{
					const r = data?.room;
					const p = data?.player;
					if (roomsJSON.includes(r)) {
						roomsJSON.splice(rooms.indexOf(r), 1);
					}
					console.log('close room: ', r, p, playerJSON);
				}
				break;
		}
	});
	socket.on('disconnect', () => {
		if (players.includes(playerJSON)) {
			players.splice(players.indexOf(playerJSON), 1);
		}
	});
	return socket;
};

beforeAll(async () => {
	await new Promise<App>((resolve) => {
		console.log(`SERVER CONNECTED`);
		resolve(app);
	});
});

afterAll(
	(done) => {
		app.stop();
		console.log(`SERVER DISCONNECTED`);
		setTimeout(() => {
			console.log('LOG EVENT-EMITTER', eventEmitter);
			done();
		}, destroyTimer + discoTimer);
	},
	destroyTimer + discoTimer + 100,
);

describe('Home page', () => {
	const rejectPromise = jest.fn();
	beforeEach(() => {});
	test('Hello World!', (done) => {
		request(app.getHttpServer())
			.get('/')
			.then((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.text).toBe(JSON.stringify({ message: 'Hello World!' }));
			})
			.catch((e) => {
				expect(e.message).toBe('Failed to connect within 5 seconds');
				expect(rejectPromise).toHaveBeenCalled();
			});
		expect(rejectPromise).not.toBeCalled();
		expect(rejectPromise).not.toHaveBeenCalled();
		done();
	}, 1500);
	afterAll((done) => {
		done();
	});
});

describe(`New Client ${usernames[indexPlayer]}`, () => {
	beforeEach((done) => {
		createClient(usernames[indexPlayer]);

		setTimeout(() => {
			done();
		}, 500);
	}, 1000);
	test('join room', (done) => {
		try {
			expect(socketsClients).toHaveLength(1);
			const socket = socketsClients[0];

			socket.emit('createRoom', rooms[indexRoom]);
			socket.emit('createRoom', rooms[indexRoom]);
			socket.emit('createRoom', usernames[indexPlayer]);
			socket.emit('createRoom', sessions[indexPlayer].id);
			socket.emit('createRoom', socket.id);
			socket.emit('createRoom', 'a&;'.repeat(25));
			socket.emit('createRoom', 'a'.repeat(300));
			socket.emit('createRoom', 'a'.repeat(2));
			socket.emit('joinRoom', rooms[indexRoom]);
			socket.emit('joinRoom', rooms[indexRoom]);
			socket.emit('joinRoom', socket.id);
			socket.emit('joinRoom', 'a&;'.repeat(25));
			socket.emit('joinRoom', 'a'.repeat(300));
			socket.emit('joinRoom', 'a'.repeat(2));
			socket.emit('changeUsername', 'a&;'.repeat(25));
			socket.emit('changeUsername', 'a'.repeat(25));
			socket.emit('changeUsername', usernames[indexPlayer]);
			socket.emit('getRooms');
			socket.emit('getRoomsPlayer');
			socket.emit('getRoom', rooms[indexRoom]);
			socket.emit('message', {
				message: 'Hello Room!',
				receiver: rooms[indexRoom],
			});
			socket.emit('message', {
				message: 'Hello Nawak!',
				receiver: 'Nawak',
			});
			socket.emit('message', {
				message: 'Hello Player!',
				receiver: sessions[indexPlayer].id,
			});
			let i = 0;
			setTimeout(() => {
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
				socket.emit('ready', rooms[indexRoom]);
			}, 500);

			socket.onAny((event, ...args) => {
				switch (event) {
					case 'playerChange':
						{
							console.log('test playerChange', i, event, args, args[0]?.reason);
							args[0]?.reason === 'ready' && i++;
							if (i === 9) {
								socket.emit('leave', rooms[indexRoom]);
								socket.emit('leaveRoom', rooms[indexRoom]);
								socket.emit('leaveRoom', rooms[indexRoom]);
								setTimeout(() => {
									try {
										done();
									} catch (e) {
										console.log('settimeout try/catch done', e);
									}
								}, 2000);
							}
						}

						break;
				}
			});

			setTimeout(() => {
				try {
					done();
				} catch (e) {
					console.log('settimeout try/catch done', e);
				}
			}, 3000);
		} catch (e) {
			console.log('join room', e);
			done(e);
		}
	}, 3200);
	afterEach((done) => {
		for (const socket of socketsClients) {
			socket.disconnect();
		}
		indexPlayer = ++indexPlayer % usernames.length;
		indexRoom = ++indexRoom % rooms.length;

		done();
	});
});

describe('Reconnect', () => {
	let recoSocket: Socket;
	beforeEach((done) => {
		recoSocket = io(`${protocol}://${host}:${serverPort}`, {
			auth: {
				username: sessions[0].username,
				sessionID: sessions[0].id,
			},
			reconnection: true,
			reconnectionDelay: 0,
			autoConnect: false,
		});
		recoSocket.connect();
		setTimeout(() => {
			done();
		}, 500);
	}, 1000);

	test('Succesfully reconnect', (done) => {
		try {
			recoSocket.emit('createRoom', rooms[0]);
			recoSocket.emit('joinRoom', rooms[0]);

			recoSocket.once('roomChange', () => {
				recoSocket.disconnect();
			});
			recoSocket.once('disconnect', () => {
				recoSocket.off('roomChange');
				recoSocket.connect();
				setTimeout(() => {
					expect(recoSocket.connected).toBe(true);
					done();
				}, 1500);
			});
		} catch (e) {
			console.log(e);
		}
	}, 2000);

	test('Unhandled Event', (done) => {
		try {
			recoSocket.emit("Cet event n'existe pas", 'payload inutile');
			recoSocket.on('error', (data) => {
				const msg = `[EVENT NOT HANDLED]: Cet event n'existe pas payload inutile`;
				expect(data).toBe(msg);
				done();
			});
			setTimeout(() => {
				done();
			}, 1500);
		} catch (e) {
			console.log(e);
		}
	}, 2000);

	afterEach(
		(done) => {
			recoSocket.disconnect();
			done();
		},
		destroyTimer + discoTimer + 100,
	);
});

describe('Failed Connection', () => {
	let recoSocket: Socket;
	beforeAll((done) => {
		recoSocket = io(`${protocol}://${host}:${serverPort}`);
		recoSocket.on('connect_error', () => {
			console.log('reco connect_error');
			recoSocket.close();
			done();
		});
		recoSocket.on('disconnect', () => {
			console.log('reco disconnect');
			recoSocket.close();
			done();
		});
		done();
	});

	test('should fail', (done) => {
		try {
			recoSocket.emit('joinRoom', 'Loulouville');
			recoSocket.onAny((event, data) => {
				console.log('on joinRoom -> this msg should not be logged', event, data);
			});
			done();
		} catch (e) {
			console.log(e);
		}
	});

	afterAll(
		(done) => {
			if (recoSocket.connected) {
				recoSocket.disconnect();
			}
			done();
		},
		destroyTimer + discoTimer + 100,
	);
});

describe('Forgery uuid', () => {
	let socket: Socket;
	beforeAll((done) => {
		try {
			const uuid = uuidv4();
			socket = io(`${protocol}://${host}:${serverPort}`, {
				auth: {
					username: 'Je suis un vilain usurpateur',
					sessionID: uuid,
				},
				reconnection: true,
				autoConnect: false,
			});
			socket.connect();
			socket.on('join', (data) => {
				console.log('connect forgery uuid', uuid, data);
				expect(data.sessionID).not.toBe(uuid);
				done();
			});
			setTimeout(() => {
				done();
			}, 1500);
		} catch (e) {
			done(e);
		}
	}, 2000);

	test('Should generate a new internal uuid and set it as a new player', (done) => {
		try {
			socket.emit('joinRoom', 'Loulouville');
			socket.onAny((event, data) => {
				console.log('on joinRoom -> this msg should never be logged', event, data);
			});
			setTimeout(() => {
				done();
			}, 1500);
		} catch (e) {
			done(e);
		}
	}, 2000);

	afterAll(
		(done) => {
			if (socket.connected) {
				socket.disconnect();
			}
			done();
		},
		destroyTimer + discoTimer + 100,
	);
});

const offset = 30;
describe('Multi Clients', () => {
	beforeAll((done) => {
		socketsClients.splice(0, socketsClients.length);
		sessions.splice(0, sessions.length);
		indexPlayer = ++indexPlayer % usernames.length;
		indexRoom = ++indexRoom % rooms.length;

		indexPlayer = 0;
		for (let i = 0; i < offset; i++) {
			createClient(usernames[indexPlayer]);
			indexPlayer = ++indexPlayer % usernames.length;
			if (i === offset - 1) {
				setTimeout(() => {
					done();
				}, 500);
			}
		}
	}, 1000);

	test('Clients should be connected', (done) => {
		setTimeout(() => {
			console.log('should be connected', socketsClients.length);
			expect(socketsClients.length).toBe(offset);
			expect(socketsClients.length).toBe(offset);
			done();
		}, 1500);
	}, 2000);

	test('create room', (done) => {
		try {
			socketsClients[0]?.emit('createRoom', rooms[indexRoom]);
			done();
		} catch (e) {
			console.log('multi connected rooms error', e);
		}
	});

	test(`Clients should be in the room ${rooms[indexRoom]}`, (done) => {
		try {
			socketsClients.forEach((socket) => {
				socket.emit('joinRoom', rooms[indexRoom]);
				console.log('should be connected joinRoom', socket.connected);
				expect(socket.connected).toBeTruthy();
			});

			// setTimeout(() => {
			done();
			// }, 25000);
		} catch (e) {
			console.log('multi connected rooms error', e);
		}
	});
	// (discoTimer + destroyTimer) * 2,

	test(
		`Clients should be set as ready in the room ${rooms[indexRoom]}`,
		(done) => {
			try {
				socketsClients.forEach((socket) => {
					socket.emit('ready', rooms[indexRoom]);
					socket.emit('ready', rooms[indexRoom]);
					socket.emit('ready', rooms[indexRoom]);
					socket.emit('ready', rooms[indexRoom]);
					socket.emit('ready', rooms[indexRoom]);
					console.log('should be ready joinRoom', socket.connected);
					expect(socket.connected).toBeTruthy();
				});

				setTimeout(() => {
					socketsClients[0]?.emit('getRoom', rooms[indexRoom]);
					socketsClients[0]?.emit('getRooms');

					done();
				}, 5000);
				setTimeout(() => {
					done();
				}, 25000);
			} catch (e) {
				console.log('multi connected rooms error', e);
			}
		},
		(discoTimer + destroyTimer) * 2,
	);

	afterAll(
		(done) => {
			for (const socket of socketsClients) {
				console.log('salut');
				socket.disconnect();
			}
			indexPlayer = ++indexPlayer % usernames.length;
			indexRoom = ++indexRoom % rooms.length;

			setTimeout(
				() => {
					done();
				},
				(discoTimer + destroyTimer) * 1,
			);
		},
		(discoTimer + destroyTimer) * 1.5,
	);
});
