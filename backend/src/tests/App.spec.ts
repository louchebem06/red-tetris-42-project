import request from 'supertest';
import app from '../app';
import App from '../model/App';
import SocketClient from './SocketClient';
import IPlayerJSON from '../interface/IPlayerJSON';
import IRoomJSON from '../interface/IRoomJSON';
import { Socket, io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

let socketClt: SocketClient;

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';

const players = ['Minnie', 'Daisy', 'Donald', 'Riri', 'Fifi', 'Loulou', 'Mickey', 'Picsou'];
let indexPlayer = 0;

const rooms = ['Donaldville', 'Loulouville', 'Mickeyville', 'Pikachuville'];
let indexRoom = 0;

type Session = {
	username: string;
	id: string;
};
const sessions: Session[] = [];

const checkProperties = (socketClt: SocketClient): void => {
	expect(socketClt).toHaveProperty('player');
	expect(socketClt).toHaveProperty('rooms');
	expect(socketClt).toHaveProperty('roomNames');
	expect(socketClt).toHaveProperty('rooms');
	expect(socketClt).toHaveProperty('messages');
	expect(socketClt).toHaveProperty('errors');
};

const checkRoomProperties = (room: IRoomJSON, name: string, t: number, l: IPlayerJSON): void => {
	expect(room).toHaveProperty('name');
	expect(room).toHaveProperty('dateCreated');
	expect(room).toHaveProperty('leader');
	expect(room).toHaveProperty('gameState');
	expect(room).toHaveProperty('players');
	expect(room).toHaveProperty('totalPlayers');

	expect(room.name).toBeDefined();
	expect(room.dateCreated).toBeDefined();
	expect(room.leader).toBeDefined();
	expect(room.gameState).toBeDefined();
	expect(room.players).toBeDefined();
	expect(room.totalPlayers).toBeDefined();

	if (name) {
		expect(room.name).toBe(name);
	}
	if (t) {
		expect(room.totalPlayers).toBe(t);
		expect(room.players.length).toBe(t);
		if (t === 0) {
			expect(room.winner).toBeNull();
			expect(room.gameState).toBeFalsy();
		}
		if (t > 0) {
			expect(room.players).toContainEqual(room.leader);
			expect(room.players).toContainEqual(l);
		}
	}
	if (l) {
		expect(room.leader.username).toBe(l.username);
		expect(room.leader.sessionID).toBe(l.sessionID);
		expect(room.leader.dateCreated).toBe(l.dateCreated);
		expect(room.leader.connected).toBe(l.connected);
		expect(room.leader.wins).toStrictEqual(l.wins);
		expect(room.leader.games).toStrictEqual(l.games);
		expect(room.leader.leads).toStrictEqual(l.leads);
		expect(room.leader.connected).toBeTruthy();
	}
};

const checkPlayerProperties = (player: IPlayerJSON, u: string, r: string, i: string): void => {
	expect(player).toHaveProperty('username');
	expect(player).toHaveProperty('sessionID');
	expect(player).toHaveProperty('dateCreated');
	expect(player).toHaveProperty('wins');
	expect(player).toHaveProperty('games');
	expect(player).toHaveProperty('leads');
	expect(player).toHaveProperty('connected');

	expect(player.username).toBeDefined();
	expect(player.sessionID).toBeDefined();
	expect(player.dateCreated).toBeDefined();
	expect(player.connected).toBeDefined();
	expect(player.wins).toBeDefined();
	expect(player.leads).toBeDefined();
	expect(player.games).toBeDefined();

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

let flagHttpTest = false;
beforeAll(async () => {
	await new Promise<App>((resolve) => {
		console.log(`SERVER CONNECTED`);
		flagHttpTest = true;
		resolve(app);
	});
});

afterAll((done) => {
	app.stop();
	console.log(`SERVER DISCONNECTED`);
	done();
});

beforeEach(async () => {
	if (!flagHttpTest) {
		socketClt = new SocketClient(`${protocol}://${host}:${serverPort}`);
		socketClt = await socketClt.connect(players[indexPlayer]);
		if (socketClt.player) {
			sessions.push({ username: socketClt.player.username, id: socketClt.player.sessionID });
		}
	}
});

afterEach(async () => {
	if (!flagHttpTest) {
		indexPlayer = ++indexPlayer % players.length;
		indexRoom = ++indexRoom % rooms.length;
		await socketClt.disconnect();
	}
});

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
		flagHttpTest = false;
		done();
	});
});

describe(`App`, () => {
	beforeAll((done) => {
		indexPlayer = indexRoom = 0;
		done();
	});
	test('Basic successful create - join - leave room', async () => {
		try {
			socketClt = await socketClt.createRoom(rooms[indexRoom]);
			checkProperties(socketClt);

			let player = socketClt.player;
			let args = [players[indexPlayer], rooms[indexRoom]];
			if (player) {
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);

				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(2);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				expect(socketClt?.errors).toHaveLength(0);
			}

			let roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(indexRoom + 1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}

			socketClt = await socketClt.joinRoom(rooms[indexRoom]);
			player = socketClt.player;
			if (player) {
				args = [players[indexPlayer], rooms[indexRoom]];
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);
			}
			roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(indexRoom + 1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 1, player);
					}
				});
			}

			socketClt = await socketClt.getRooms();
			// expect(socketClt?.roomNames).toContainEqual(rooms[indexRoom]);

			socketClt = await socketClt.leaveRoom(rooms[indexRoom]);
			player = socketClt.player;
			if (player) {
				args = [players[indexPlayer], rooms[indexRoom]];
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);
				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(5);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				const win = `You are the winner of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				expect(msgs).toContainEqual(win);
			}
			roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(0);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}
			socketClt = await socketClt.getRooms();
			// expect(socketClt?.roomNames).not.toContainEqual(rooms[indexRoom]);
			// expect(socketClt?.roomNames).toHaveLength(indexRoom);

			expect(socketClt?.errors).toHaveLength(0);
		} catch (e) {
			console.log(e);
		}
	}, 5000);

	test('Unsuccessful create room', async () => {
		try {
			socketClt = await socketClt.createRoom(rooms[indexRoom]);
			checkProperties(socketClt);

			const player = socketClt.player;
			let args = [players[indexPlayer], rooms[indexRoom]];
			if (player) {
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);

				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(2);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				socketClt = await socketClt.createRoom(player?.sessionID);
			}

			const roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}
			socketClt = await socketClt.createRoom(rooms[indexRoom]);
			const sid = socketClt?.getSocket()?.id;
			if (sid) {
				socketClt = await socketClt.createRoom(sid);
			}
			socketClt = await socketClt.createRoom('a');
			socketClt = await socketClt.createRoom('a'.repeat(500));
			expect(socketClt?.errors).toHaveLength(5);
		} catch (e) {
			console.log(e);
		}
	}, 5000);

	test('Unsuccessful join room', async () => {
		try {
			socketClt = await socketClt.createRoom(rooms[indexRoom]);
			checkProperties(socketClt);

			let player = socketClt.player;
			let args = [players[indexPlayer], rooms[indexRoom]];
			if (player) {
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);

				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(2);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				expect(socketClt?.errors).toHaveLength(0);
				socketClt = await socketClt.joinRoom(player?.sessionID);
			}

			let roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}

			socketClt = await socketClt.joinRoom(rooms[indexRoom]);
			player = socketClt.player;
			if (player) {
				args = [players[indexPlayer], rooms[indexRoom]];
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);
			}
			roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 1, player);
					}
				});
			}
			const sid = socketClt?.getSocket()?.id;
			if (sid) {
				socketClt = await socketClt.joinRoom(sid);
			}
			socketClt = await socketClt.joinRoom(rooms[indexRoom]);
			socketClt = await socketClt.joinRoom("Cette room n'existe pas");
			expect(socketClt?.errors?.length).toBeGreaterThanOrEqual(1);
		} catch (e) {
			console.log(e);
		}
	}, 5000);

	test('Unsuccessful leave room', async () => {
		try {
			socketClt = await socketClt.createRoom(rooms[indexRoom]);
			checkProperties(socketClt);

			let player = socketClt.player;
			let args = [players[indexPlayer], rooms[indexRoom]];
			if (player) {
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);

				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(2);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				expect(socketClt?.errors).toHaveLength(0);
			}

			let roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}

			socketClt = await socketClt.joinRoom(rooms[indexRoom]);
			player = socketClt.player;
			if (player) {
				args = [players[indexPlayer], rooms[indexRoom]];
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);
			}
			roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(1);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 1, player);
					}
				});
			}

			socketClt = await socketClt.leaveRoom(rooms[indexRoom]);
			player = socketClt.player;
			if (player) {
				args = [players[indexPlayer], rooms[indexRoom]];
				args.push(sessions[indexPlayer].id);
				checkPlayerProperties(player, args[0], args[1], args[2]);
				const msgs = socketClt.messages;
				expect(msgs).toHaveLength(5);
				const msg = `You are the new leader of ${rooms[indexRoom]}`;
				const win = `You are the winner of ${rooms[indexRoom]}`;
				expect(msgs).toContainEqual(msg);
				expect(msgs).toContainEqual(win);
				socketClt = await socketClt.leaveRoom(player?.sessionID);
			}
			roomsJSON = socketClt?.rooms;
			if (roomsJSON) {
				expect(roomsJSON).toHaveLength(0);
				roomsJSON.forEach((room) => {
					args = [room.name];
					if (player) {
						checkRoomProperties(room, room.name, 0, player);
					}
				});
			}
			const sid = socketClt?.getSocket()?.id;
			if (sid) {
				socketClt = await socketClt.leaveRoom(sid);
			}
			socketClt = await socketClt.leaveRoom(rooms[indexRoom]);
			socketClt = await socketClt.leaveRoom(rooms[indexRoom - 1]);
			socketClt = await socketClt.leaveRoom(rooms[indexRoom - 2]);
			expect(socketClt?.errors?.length).toBeGreaterThanOrEqual(1);
		} catch (e) {
			console.log(e);
		}
	}, 5000);
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
			autoConnect: false,
		});
		recoSocket.connect();
		done();
	});

	test('Succesfully reconnect', (done) => {
		try {
			recoSocket.emit('joinRoom', 'Loulouville');

			recoSocket.once('roomChange', () => {
				recoSocket.disconnect();
			});
			recoSocket.once('disconnect', () => {
				recoSocket.off('roomChange');
				recoSocket.connect();
				setTimeout(() => {
					done();
				}, 1000);
			});
		} catch (e) {
			console.log(e);
		}
	}, 2500);

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
			}, 4000);
		} catch (e) {
			console.log(e);
		}
	}, 5000);

	afterEach((done) => {
		recoSocket.disconnect();
		done();
	});
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

	afterAll((done) => {
		if (recoSocket.connected) {
			recoSocket.disconnect();
		}
		done();
	});
});

describe('App - Multiple Clients', () => {
	let socket: Socket;
	const sockets: Socket[] = [];
	let room: IRoomJSON;

	beforeAll((done) => {
		sessions.forEach((session) => {
			socket = io(`${protocol}://${host}:${serverPort}`, {
				auth: {
					username: session.username,
					sessionID: session.id,
				},
				reconnection: true,
				autoConnect: false,
			});
			sockets.push(socket);
			socket.connect();
		});

		setTimeout(() => {
			sockets[0].emit('createRoom', 'EuroDisney');
			sockets[0].on('roomChange', (data) => {
				room = JSON.parse(JSON.stringify(data));
				setTimeout(() => {
					done();
				}, 500);
			});
		}, 1000);
	}, 2000);

	test('Joining and leaving room', (done) => {
		const players: IPlayerJSON[] = [];
		sockets.forEach((s, i) => {
			s.emit('joinRoom', 'EuroDisney');
			s.on('roomChange', (data) => {
				if (data.reason === 'player incoming') {
					if (!players.find((player) => player.sessionID === data.player.sessionID)) {
						players.push(data.player);
					}
				}
				if (data.reason === 'player outgoing') {
					room = JSON.parse(JSON.stringify(data.room));
				}
			});
			if (!(i % 2)) {
				setTimeout(() => {
					s.emit('leaveRoom', 'EuroDisney');
				}, 200);
			}
			setTimeout(() => {}, 5000);
		});
		setTimeout(() => {
			sockets.forEach((s) => {
				s.emit('leaveRoom', 'EuroDisney');
			});
		}, 2000);
		setTimeout(() => {
			if (room.winner) {
				expect(room.winner.sessionID).toBe(players[5].sessionID);
				expect(room.leader.sessionID).toBe(players[5].sessionID);
			}
			done();
		}, 20000);
	}, 50000);

	afterAll((done) => {
		sockets.forEach((socket) => {
			socket.close();
		});
		done();
	}, 2000);
});

describe('Forgery uuid', () => {
	let socket: Socket;
	beforeAll((done) => {
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
			setTimeout(() => {
				done();
			}, 1000);
		});
		setTimeout(() => {
			done();
		}, 1000);
	}, 3000);

	test('Should generate a new internal uuid and set it as a new player', (done) => {
		try {
			socket.emit('joinRoom', 'Loulouville');
			socket.onAny((event, data) => {
				console.log('on joinRoom -> this msg should never be logged', event, data);
			});
			done();
		} catch (e) {
			console.log(e);
		}
	}, 5000);

	afterAll((done) => {
		if (socket.connected) {
			socket.disconnect();
			done();
		}
	});
});
