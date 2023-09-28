import request from 'supertest';
import app from '../app';
import App from '../model/App';
import SocketClient from './SocketClient';
import usersMocked from './usersDatasMocked';
import Player from 'model/Player';
import IPrivateMessage from 'interface/IPrivateMessage';

let socketClt: SocketClient;

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';

beforeAll(async () => {
	await new Promise<App>((resolve) => {
		//console.log(`SERVER CONNECTED`);
		resolve(app);
	});
});

afterAll((done) => {
	app.stop();
	//console.log(`SERVER DISCONNECTED`);
	done();
});

beforeEach(async () => {
	socketClt = new SocketClient(`${protocol}://${host}:${serverPort}`);
	await socketClt.connect();
});

afterEach(async () => {
	await socketClt.disconnect();
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
	});
	afterEach(() => {});
});

describe('Socket.io Simulate Echo', () => {
	test('server and client should communicate on echo event once', async () => {
		await socketClt.simulateEcho().then((message: string) => {
			expect(message).toBe('Hello World!');
		});
	});
});

describe('Socket.io Simulate Successful Connection', () => {
	test('ACK on join event', async () => {
		const user = {
			username: 'Bliblii-546',
			id: '',
		};
		const { player } = await socketClt.simulateACKJoin(user);
		expect(player).toBeDefined();
		expect(player.socketId).toBe(socketClt.id);
		expect(player.username).toBe(user.username);
		expect(player.active).toBeFalsy;
	}, 1500);
});

describe('Socket.io Simulate Same Client Several Successful Connection', () => {
	test.each(usersMocked)(
		'Checking of usernames and id handling',
		async (user) => {
			try {
				const response = await socketClt.simulateACKJoin(user);
				expect(response).toHaveProperty('player');
				expect(response).toHaveProperty('rooms');
				const { username, socketId, active } = response.player;
				expect(username).toBe(!user.username ? 'anon' : user.username);
				expect(socketId).toBe(socketClt.id);
				expect(active).toBeFalsy;
			} catch (e) {
				if (!user.id && user.username && user.username.includes('#')) {
					expect(e).toBe(`${user.username} is not valid.`);
				}
				if (user.id && user.id !== socketClt.id) {
					expect(e).toBe(`${user.id} is not valid.`);
				}
			}
		},
		1500,
	);
});

describe('Socket.io Simulate Several Clients on One Successful Connection', () => {
	const socketClts: SocketClient[] = [];
	let socket: SocketClient;
	beforeEach(async () => {
		socket = new SocketClient(`${protocol}://${host}:${serverPort}`);
		await socket.connect();
		socketClts.push(socket);
	});
	test.each(usersMocked)(
		'Checking of usernames and id handling',
		async (user) => {
			try {
				const response = await socket.simulateACKJoin(user);
				// console.log('ACK SERVEUR', response, user);
				expect(response).toHaveProperty('player');
				expect(response).toHaveProperty('rooms');
				const { username, socketId, active } = response.player;
				expect(username).toBe(!user.username ? 'anon' : user.username);
				expect(socketId).toBe(socketClt.id);
				expect(active).toBeFalsy;
				console.log(response, response.rooms);
			} catch (e) {
				if (!user.id && user.username && user.username.includes('#')) {
					expect(e).toBe(`${user.username} is not valid.`);
				}
				if (user.id && user.id !== socketClt.id) {
					expect(e).toBe(`${user.id} is not valid.`);
				}
			}
		},
		1500,
	);

	afterAll(async () => {
		for (const socket of socketClts) await socket.disconnect();
	});
});

let clt1, clt2;
describe('Try to join a room', () => {
	test('2 players entering same room', async () => {
		clt1 = new SocketClient(`${protocol}://${host}:${serverPort}`);
		clt2 = new SocketClient(`${protocol}://${host}:${serverPort}`);
		await clt1.connect();
		await clt2.connect();
		const user = {
			username: 'Blibli',
			id: '',
		};
		type PayloadPlayer = {
			player: Player;
			rooms: string[];
		};

		let payload1: PayloadPlayer = await clt1.simulateACKJoin(user);
		let payload2: PayloadPlayer = await clt2.simulateACKJoin(user);

		expect(payload1.player).not.toBe(payload2.player);
		expect(payload1.rooms).toHaveLength(0);
		expect(payload2.rooms).toHaveLength(0);

		payload1 = await clt1.createRoom('first room');
		expect(payload1.player).not.toBe(payload2.player);
		payload1 = await clt1.joinRoom('first room');
		payload2 = await clt2.joinRoom('first room');
		expect(payload1.rooms).toHaveLength(1);
		expect(payload2.rooms).toHaveLength(1);

		let activeRoomsP1 = await clt1.getRooms();
		expect(activeRoomsP1).toStrictEqual(['first room']);

		payload1 = await clt1.leaveRoom('first room');
		activeRoomsP1 = await clt1.getRooms();
		expect(activeRoomsP1).toStrictEqual(['first room']);
		payload2 = await clt2.leaveRoom('first room');
		const activeRoomsP2 = await clt2.getRooms();
		expect(activeRoomsP2).toStrictEqual([]);

		await clt1.disconnect();
		await clt2.disconnect();
	}, 15000);
});

describe('Send Error', () => {
	test('Send Error', async () => {
		const msg = 'App.spec.ts: Send Error';
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const response1 = await socketClt.sendErrorPayload(msg);
		expect(response1).toBe(`${msg}`);
		await socketClt.disconnect();
	}, 5000);
});

describe('Inexistant event', () => {
	test('Inexistant Event', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const response1 = await socketClt.sendInexistantEvent();
		expect(response1).toBe('SocketEventController: Unhandled socket event inexistantEvent');
	}, 5000);
});

describe('Unexpected room payload', () => {
	test('Send unvalid payload create room', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const response1 = await socketClt.sendUnexpectedPayload();
		expect(response1).toBe('{"room":"inexistant"} is not a valid name');
	}, 5000);
});

describe('Unexpected room name length', () => {
	test('Room name must be at least 3 characters long', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const response1 = await socketClt.sendUnvalidRoomNameLength();
		expect(response1).toBe(`Room name must be at least 3 characters long`);
	}, 5000);
});

describe('Unvalid room creation', () => {
	test('Send twice the same create room event', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const response1 = await socketClt.unvalidCreateRoom();
		expect(response1).toBe(`You cannot create valid: this room already exists`);
	}, 5000);
});

describe('Unvalid room join', () => {
	test('Send twice the same join room event', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const room = 'Nananere';
		const { player } = await socketClt.createRoom(room);
		const username = player.username;
		const response1 = await socketClt.unvalidJoinRoom(room);
		const msg = `RoomController: join room: player ${username} already in room ${room}`;
		expect(response1).toBe(`${msg}`);
	}, 5000);
});

describe('Unvalid room leave', () => {
	test('Send twice the same leave room event', async () => {
		await socketClt.simulateACKJoin({ username: 'Blibli', id: '' });
		const room = 'Gloubiboulga';
		await socketClt.createRoom(room);
		const response1 = await socketClt.unvalidLeaveRoom(room);
		const msg = `RoomController: room ${room} not found`;
		expect(response1).toBe(`${msg}`);
		const rooms = await socketClt.getRooms();
		expect(rooms).toHaveLength(1);
	}, 5000);
});

describe('Unvalid first join', () => {
	test('Unvalid first join', async () => {
		const response1 = await socketClt.unvalidFirstJoin({ username: 'Blibli', id: '' });
		expect(response1).toBe('SocketController: player Blibli#24 already joined');
	}, 5000);
});

describe.skip('Send Private Room', () => {
	test('Send Private Message', async () => {
		const clt1 = new SocketClient(`${protocol}://${host}:${serverPort}`);
		await clt1.connect();
		const msg = 'App.spec.ts: Send Private Message';
		const privateMessage: IPrivateMessage = {
			dstId: clt1.id,
			message: msg,
		};
		const response1 = await clt1.sendPrivateMessage(privateMessage);
		console.log('response1', response1);
		await clt1.disconnect();
	});
});
