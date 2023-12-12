import { Socket, io } from 'socket.io-client';
import App from '../model/App';
import IPlayerJSON from '../interface/IPlayerJSON';
import IRoomPayload from '../interface/IRoomPayload';
import IRoomJSON from '../interface/IRoomJSON';
import { IRoomState } from '../interface/IRoomState';
import IPlayerPayload from 'interface/IPlayerPayload';

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';
const destroyTimer = parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000 ?? 5000;

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

describe('all Events', () => {
	let app: App;
	let client: Socket;
	let sessionId: string;

	const roomName = 'Loulouville';
	const roomName2 = 'Loulouville2';
	const roomExpect: IRoomJSON = {
		name: undefined as unknown as string,
		dateCreated: expect.any(String),
		leader: undefined as unknown as IPlayerJSON,
		winner: null,
		gameState: false,
		players: [],
		totalPlayers: 0,
		readys: [],
		totalReady: 0,
	};

	const playerExpect: IPlayerJSON = {
		username: 'allEventsCreateClient',
		sessionID: undefined as unknown as string,
		dateCreated: expect.any(String),
		leads: [],
		wins: [],
		connected: true,
		games: [],
		roomsState: [],
	};
	beforeAll((): void => {
		app = new App();
		app.start();
	});

	afterAll((done) => {
		app.stop();
		setTimeout(() => {
			console.log(`SERVER DISCONNECTED`);
			done();
		}, destroyTimer);
	}, destroyTimer + 1000);
	describe('create client', () => {
		test('create allEventsCreateClient', () => {
			client = createClient('allEventsCreateClient');
			expect(client).toBeInstanceOf(Socket);
		});
	});
	describe('join', () => {
		test('join allEventsCreateClient', async () => {
			const promise = new Promise<IPlayerJSON>((resolve, reject) => {
				client.connect();
				client.on('join', (data: IPlayerJSON) => {
					if (data) sessionId = data.sessionID;
					resolve(data);
				});
				client.on('error', (msg) => {
					reject(msg);
				});
			});
			const player = await promise.then((data: IPlayerJSON) => data);

			expect(player).toMatchObject<IPlayerJSON>({
				username: 'allEventsCreateClient',
				sessionID: sessionId,
				dateCreated: expect.any(String),
				leads: [],
				wins: [],
				connected: true,
				games: [],
				roomsState: [],
			});
			client.off('join');
			client.off('error');
		});
	});

	describe('create room', () => {
		test(`allEventsCreateClient create room : ${roomName}, roomOpened event`, async () => {
			const promise = new Promise<IRoomPayload>((resolve, reject) => {
				client.on('roomOpened', (data: IRoomPayload) => {
					if (data.room.name === roomName) resolve(data);
				});

				client.on('error', (msg) => {
					reject(msg);
				});
				client.emit('createRoom', roomName);
			});
			const [room, player] = await promise
				.then((data: IRoomPayload) => {
					return [data.room, data.player];
				})
				.catch(() => {
					return [undefined, undefined];
				})
				.finally(() => {
					client.off('roomOpened');
					client.off('error');
				});
			expect(room).toMatchObject<IRoomJSON>({
				...roomExpect,
				name: roomName,
				leader: player as IPlayerJSON,
			});

			expect(player).toMatchObject<IPlayerJSON>({
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName],
			});
		});
		test(`allEventsCreateClient create room : ${roomName2}, roomChange event`, async () => {
			const promise = new Promise<IRoomPayload>((resolve, reject) => {
				client.on('roomChange', (data: IRoomPayload) => {
					if (data.room.name === roomName2) resolve(data);
				});

				client.on('error', (msg) => {
					reject(msg);
				});
				client.emit('createRoom', roomName2);
			});
			const [reason, room, player] = await promise
				.then((data: IRoomPayload) => {
					return [data.reason, data.room, data.player];
				})
				.catch(() => {
					return [undefined, undefined, undefined];
				})
				.finally(() => {
					client.off('roomChange');
					client.off('error');
				});
			expect(reason).toBe('new leader');
			expect(room).toMatchObject<IRoomJSON>({
				...roomExpect,
				name: roomName2,
				leader: player as IPlayerJSON,
			});

			expect(player).toMatchObject<IPlayerJSON>({
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName, roomName2],
			});
		});
	});
	describe(`join room and change username AllEventsChangeUsername`, () => {
		const roomsState: IRoomState[] = [
			{
				name: roomName,
				status: 'active',
				leads: true,
				wins: false,
				readys: 0,
				started: false,
			},
		];
		describe('join room', () => {
			test(`allEventsCreateClient join room : ${roomName}, roomChange event`, async () => {
				const promise = new Promise<IRoomPayload>((resolve, reject) => {
					client.on('roomChange', (data: IRoomPayload) => {
						if (data.room.name === roomName) resolve(data);
					});

					client.on('error', (msg) => {
						reject(msg);
					});
					client.emit('joinRoom', roomName);
				});
				const [reason, room, player] = await promise
					.then((data: IRoomPayload) => {
						return [data.reason, data.room, data.player];
					})
					.catch(() => {
						return [undefined, undefined, undefined];
					})
					.finally(() => {
						client.off('roomChange');
						client.off('error');
					});
				expect(reason).toBe('player incoming');
				expect(room).toMatchObject<IRoomJSON>({
					...roomExpect,
					name: roomName,
					players: [player as IPlayerJSON],
					totalPlayers: 1,
					leader: player as IPlayerJSON,
				});

				expect(player).toMatchObject<IPlayerJSON>({
					...playerExpect,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				});
			});
		});
		describe('change username', () => {
			const username = 'AllEventsChangeUsername';
			test(`allEventsCreateClient change username : \
${username}, playerChange event`, async () => {
				const promise = new Promise<IPlayerPayload>((resolve, reject) => {
					client.on('playerChange', (data: IPlayerPayload) => {
						resolve(data);
					});

					client.on('error', (msg) => {
						reject(msg);
					});
					client.emit('changeUsername', username);
				});
				const [reason, player] = await promise
					.then((data: IPlayerPayload) => {
						return [data.reason, data.player];
					})
					.catch(() => {
						return [undefined, undefined];
					})
					.finally(() => {
						client.off('playerChange');
						client.off('error');
					});
				expect(reason).toBe('change username');

				expect(player).toMatchObject<IPlayerJSON>({
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				});
			});
		});
	});
	describe('get rooms', () => {});
	describe('get rooms player', () => {});
	describe('get room', () => {});
	describe('message', () => {});
	describe('set ready', () => {});
	describe('game start', () => {});
	describe('leave room', () => {});

	describe('disconnect', () => {
		test(
			'disconnect',
			(done) => {
				client.on('disconnect', () => {
					setTimeout(() => {
						done();
					}, destroyTimer);
				});
				client.disconnect();
			},
			destroyTimer + 1000,
		);
	});
});
