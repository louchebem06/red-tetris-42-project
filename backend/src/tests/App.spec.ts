import request from 'supertest';
import { Socket, io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import { expect } from '@jest/globals';
import type { MatcherFunction as MF } from 'expect';
import { diff } from 'jest-diff';

import app from '../app';
import App from '../model/App';
import IPlayerJSON from '../interface/IPlayerJSON';
import { eventEmitter } from '../model/EventEmitter';
import IRoomJSON from '../interface/IRoomJSON';

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';

const destroyTimer = parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000 ?? 5000;
const discoTimer = parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000 ?? 5000;

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

function isPlayerJSON(player: unknown): player is IPlayerJSON {
	const _player = player as IPlayerJSON;
	return (
		'username' in _player &&
		'sessionID' in _player &&
		'dateCreated' in _player &&
		'connected' in _player &&
		'leads' in _player &&
		'wins' in _player &&
		'games' in _player &&
		'roomsState' in _player
	);
}

const toBeIPlayerJSON: MF<[unknown]> = function (received: unknown, expected: unknown) {
	if (!isPlayerJSON(received) || !isPlayerJSON(expected)) {
		throw new Error('toBeIPlayerJSON matcher expects an IPlayerJSON');
	}
	const roomsRec = received.roomsState;

	roomsRec.forEach((room) => {
		if (received.leads.includes(room.name)) {
			expect(room.leads).toBeTruthy();
		}
		if (received.wins.includes(room.name)) {
			expect(room.wins).toBeTruthy();
		}
		if (room.started) {
			expect(room.status).toBe(expect.arrayContaining(['ready', 'idle']));
			expect(room.readys).toBeGreaterThanOrEqual(1);
		}
	});
	const roomsExp = received.roomsState;

	const pass = this.equals(received, expected) && this.equals(roomsRec, roomsExp);
	const printExp = `\x1b[32m${this.utils.printExpected(expected)}\x1b[0m`;
	const printRec = `\x1b[33m${this.utils.printReceived(received)}\x1b[0m`;
	const msgExp = `Expected: ${pass ? 'not' : ''} ${printExp}\n`;
	const msgRec = `Received: ${printRec}\n`;
	const matcher = `${this.utils.matcherHint('toBeIRoomJSON')}\n\n${msgExp}${msgRec}`;
	const message = pass
		? (): string => {
				return matcher;
		  }
		: (): string => {
				const regex = /(\+(?:[\s\S\w\W])+,{1})/g;
				const strRepl = `\x1b[31m$1\x1b[0m`;
				const diffStr = diff(expected, received)?.replace(regex, strRepl);
				return matcher + '\n\n' + diffStr;
		  };
	return { actual: received, expected, message, pass };
};

function isIRoomJSON(room: unknown): room is IRoomJSON {
	const _room = room as IRoomJSON;
	return (
		'leader' in _room &&
		'name' in _room &&
		'dateCreated' in _room &&
		'players' in _room &&
		'gameState' in _room &&
		'totalPlayers' in _room &&
		'readys' in _room &&
		'totalReady' in _room
	);
}

const toBeIRoomJSON: MF<[unknown]> = function (received: unknown, expected: unknown) {
	if (!isIRoomJSON(received) || !isIRoomJSON(expected)) {
		throw new Error('toBeIRoomJSON matcher expects an IRoomJSON');
	}

	const pass = this.equals(received, expected);
	const printExp = `\x1b[32m${this.utils.printExpected(expected)}\x1b[0m`;
	const printRec = `\x1b[33m${this.utils.printReceived(received)}\x1b[0m`;

	const msgExp = `Expected: ${pass ? 'not' : ''} ${printExp}\n`;
	const msgRec = `Received: ${printRec}\n`;
	const matcher = `${this.utils.matcherHint('toBeIRoomJSON')}\n\n${msgExp}${msgRec}`;
	const message = pass
		? (): string => {
				return matcher;
		  }
		: (): string => {
				const regex = /(\+(?:[\s\S\w\W])+,{1})/g;
				const strRepl = `\x1b[31m$1\x1b[0m`;
				const diffStr = diff(expected, received)?.replace(regex, strRepl);
				return matcher + '\n\n' + diffStr;
		  };
	return { actual: received, expected, message, pass };
};

const toBeArrayOfIRoomJSON: MF<[unknown]> = function (received: unknown, expected: unknown) {
	if (
		!Array.isArray(received) ||
		!Array.isArray(expected) ||
		received.length !== expected.length ||
		!received.every(isIRoomJSON) ||
		!expected.every(isIRoomJSON)
	) {
		throw new Error(`toBeArrayOfIRoomJSON matcher expects an array
!Array.isArray(received): ${!Array.isArray(received)}
!Array.isArray(expected): ${!Array.isArray(expected)}
r.length !== e.length: ${(<IRoomJSON[]>received).length !== (<IRoomJSON[]>expected).length}
!received.every(isIRoomJSON): ${!(<IRoomJSON[]>received).every(isIRoomJSON)}
!expected.every(isIRoomJSON): ${!(<IRoomJSON[]>received).every(isIRoomJSON)}`);
	}
	const pass = this.equals(received, expected);
	const printExp = `\x1b[32m${this.utils.printExpected(expected)}\x1b[0m`;
	const printRec = `\x1b[33m${this.utils.printReceived(received)}\x1b[0m`;
	const msgExp = `Expected: ${pass ? 'not' : ''} ${printExp}\n`;
	const msgRec = `Received: ${printRec}\n`;
	const matcher = `${this.utils.matcherHint('toBeArrayOfIRoomJSON')}\n\n${msgExp}${msgRec}`;
	const message = pass
		? (): string => {
				return matcher;
		  }
		: (): string => {
				const regex = /(\+(?:[\s\S\w\W])+,{1})/g;
				const strRepl = `\x1b[31m$1\x1b[0m`;
				const diffStr = diff(expected, received)?.replace(regex, strRepl);
				return matcher + '\n\n' + diffStr;
		  };
	return { actual: received, expected, message, pass };
};

expect.extend({
	toBeIRoomJSON,
	toBeIPlayerJSON,
	toBeArrayOfIRoomJSON,
	// toBeLeaderOfRoom,
});

declare module 'expect' {
	interface Matchers<R> {
		toBeIRoomJSON(room: IRoomJSON): R;
		toBeArrayOfIRoomJSON(rooms: IRoomJSON[]): R;
		toBeIPlayerJSON(player: IPlayerJSON): R;
	}
	interface AsymmetricMatchers {
		toBeIRoomJSON(room: IRoomJSON): void;
		toBeArrayOfIRoomJSON(rooms: IRoomJSON[]): void;
		toBeIPlayerJSON(player: IPlayerJSON): void;
	}
}

const createClient = (username: string, done: (e?: Error) => void): Socket => {
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

	const updatePlayer = (player: IPlayerJSON): void => {
		if ((playerJSON && playerJSON.sessionID === player.sessionID) || !playerJSON) {
			playerJSON = player;
			expect(player).toBeIPlayerJSON(playerJSON);
		}
	};

	const initPlayer = (data: IPlayerJSON): void => {
		updatePlayer(data);
		console.log('player join: ', playerJSON, data);
		const u = data?.username;
		const i = data?.sessionID;
		socket.auth = { username: u, sessionID: i };
		sessions.push({ username: u, id: i });
		socketsClients.push(socket);
		players.push(playerJSON);
		expect(data).toBeIPlayerJSON(playerJSON);
	};

	const removePlayer = (player: IPlayerJSON): void => {
		if (players.includes(player)) {
			players.splice(players.indexOf(player), 1);
			expect(player).toBeIPlayerJSON(playerJSON);
		}
	};

	const addRoom = (room: IRoomJSON): void => {
		if (!roomsJSON.includes(room)) {
			roomsJSON.push(room);
			expect(roomsJSON[roomsJSON.length - 1]).toBeIRoomJSON(room);

			console.log('add room: ', room, roomsJSON[roomsJSON.length - 1]);
		}
	};

	const updateRoom = (room: IRoomJSON): void => {
		const idx = roomsJSON.findIndex((r) => r.name === room.name);
		if (idx !== -1) {
			roomsJSON.fill(room, idx, idx + 1);
			expect(roomsJSON[idx]).toBeIRoomJSON(room);
			console.log('update room: ', room, roomsJSON[idx]);
		}
	};

	const removeRoom = (room: IRoomJSON): void => {
		const idx = roomsJSON.findIndex((r) => r.name === room.name);
		if (roomsJSON.includes(room)) {
			if (idx !== -1) {
				expect(roomsJSON[idx]).toBeIRoomJSON(room);
				roomsJSON.splice(roomsJSON.indexOf(room), 1);
				console.log('remove room: ', room, roomsJSON[idx]);
			}
		}
	};
	socket.connect();

	socket.onAny((event, ...data) => {
		console.log(`event: ${event}`, data);
		switch (event) {
			case 'join': {
				initPlayer(data[0]);
				done();
				break;
			}
			case 'playerChange': {
				const { reason, player } = data[0];
				const old = player.username !== playerJSON.username ? playerJSON.username : '';
				updatePlayer(player);
				console.log(`reason of player change: ${reason}`, player, playerJSON, data);
				switch (reason) {
					case 'ready':
						break;
					case 'change username':
						expect(playerJSON.username).not.toBe(old);
						break;
				}
				// change username
				// ready
				// connecting player
				// left
				break;
			}
			case 'roomChange': {
				const { reason, room, player } = data[0];
				updateRoom(room);
				updatePlayer(player);
				console.log(`reason of room change: ${reason}`, room, player);
				switch (reason) {
					case 'new leader': {
						if (player.sessionID === playerJSON.sessionID) {
							expect(room.leader).toBeIPlayerJSON(playerJSON);
						}
						break;
					}
					case 'player incoming':
						break;
					case 'player outgoing':
						break;
					case 'new winner':
						if (player.sessionID === playerJSON.sessionID) {
							expect(room.leader).toBeIPlayerJSON(playerJSON);
							expect(room.winner).toBeIPlayerJSON(playerJSON);
						}
						break;
				}
				// new leader
				// player incoming
				// player outgoing
				// new winner
				break;
			}
			case 'roomOpened':
				{
					const r = data[0]?.room;
					const p = data[0]?.player;
					addRoom(r);
					updatePlayer(p);
					console.log('new room: ', r, p, playerJSON);
				}
				break;
			case 'roomClosed':
				{
					const r = data[0]?.room;
					const p = data[0]?.player;
					removeRoom(r);
					updatePlayer(p);
					console.log('close room: ', r, p, playerJSON);
				}
				break;
			case 'message':
				// message {date, message, emitter, receiver}
				console.log('message: ', data[0]);
				break;
			case 'gameStart':
				// {roomName, reason: time|start, message}
				console.log('gameStart: ', data[0]);
				break;
			case 'error':
				// Invalid new room a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;a&;: name can only contain letters, numbers, hyphens and underscores
				// Invalid new room 6LVhbUGtnt2P7QFEAAAB: private room
				// Invalid new room 36a708cf-cafb-42bf-a3d7-4fe1667b7603: already in use
				// Invalid new room aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: name must be at most 256 characters long
				// Invalid new room aa: name must be at least 3 characters long
				// receiver not found
				console.log('error: ', data);
				break;
			case 'getRooms':
				console.log('getRooms: ', JSON.stringify({ data }), JSON.stringify({ roomsJSON }));
				data[0].forEach((room: IRoomJSON) => {
					updateRoom(room);
				});

				expect(data[0]).toBeArrayOfIRoomJSON(roomsJSON);
				break;
			case 'getRoom':
				console.log('getRoom: ', JSON.stringify({ data }));
				break;
			case 'getRoomsPlayer':
				console.log('getRoomsPlayer: ', data, playerJSON);
				// data.forEach((room: IRoomJSON) => {
				// 	updateRoom(room);
				// });
				// names roomState === aux nomes des rooms renvoyees. Si le leader c'est le player, le roomsState correspondant doit etre set a true pour la prop leader
				break;
			case 'roomInfo':
				console.log('roomInfo: ', data);
		}
	});
	socket.on('disconnect', () => {
		removePlayer(playerJSON);
		console.log('disconnect: ', playerJSON, roomsJSON, players);
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

describe.only(`New Client ${usernames[indexPlayer]}`, () => {
	let socket: Socket;
	const entities: string[] = [];
	beforeAll((done) => {
		socket = createClient(usernames[indexPlayer], done);
	});

	test(`socketClients has 1 element`, (done) => {
		[
			rooms[indexRoom],
			rooms[indexRoom],
			rooms[indexRoom],
			usernames[indexPlayer],
			sessions[indexPlayer].id,
			socket.id,
			'a&;'.repeat(25),
			'a'.repeat(300),
			'a'.repeat(2),
			'a'.repeat(25),
		].forEach((entity) => {
			entities.push(entity);
		});
		console.log('entities', entities);
		expect(socketsClients).toHaveLength(1);
		done();
	});

	test(`create room`, (done) => {
		entities.forEach((room) => {
			socket.emit('createRoom', room);
		});
		done();
	});
	test(`join room `, (done) => {
		entities.forEach((room) => {
			socket.emit('joinRoom', room);
		});
		done();
	});

	test(`change username `, (done) => {
		entities.forEach((username) => {
			socket.emit('changeUsername', username);
		});
		done();
	});

	test(`get rooms`, (done) => {
		socket.emit('getRooms');
		done();
	});

	test(`get rooms player`, (done) => {
		socket.emit('getRoomsPlayer');
		done();
	});

	test(`getRoom`, (done) => {
		entities.forEach((username) => {
			socket.emit('getRoom', username);
		});
		done();
	});

	test(`message`, (done) => {
		[
			{
				message: 'Hello Room!',
				receiver: rooms[indexRoom],
			},
			{
				message: 'Hello Nawak!',
				receiver: 'Nawak',
			},
			{
				message: 'Hello Player!',
				receiver: sessions[indexPlayer].id,
			},
		].forEach((message) => {
			socket.emit('message', message);
		});
		done();
	});

	test(`set ready`, (done) => {
		// TODO: gros pb => c'est le meme countdown pour toutes les rooms...
		entities.forEach((room) => {
			const i = -1;
			function update(): void {
				socket.on('playerChange', (data) => {
					console.log('playerChange event received: ', data);
				});
				console.log('set/unset ready emit', i, room);
				socket.emit('ready', room);
				setTimeout(() => {
					done();
				}, 10000);
			}
			setTimeout(() => {
				update();
			}, 500);
		});
	}, 12500);

	test('leave room', (done) => {
		setTimeout(() => {
			try {
				entities.forEach((room) => {
					console.log('leave room ouou ', room);
					socket.emit('leave', room);
					socket.emit('leaveRoom', room);
					socket.emit('leaveRoom', room);
				});
				done();
			} catch (e) {
				console.log('leave room', e);
				done(e);
			}
		});
	});

	afterAll((done) => {
		setTimeout(() => {
			for (const socket of socketsClients) {
				socket.disconnect();
			}
			indexPlayer = ++indexPlayer % usernames.length;
			indexRoom = ++indexRoom % rooms.length;

			done();
		});
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
			createClient(usernames[indexPlayer], done);
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
