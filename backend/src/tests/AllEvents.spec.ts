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

let sessionId: string;

async function testPromise<T>(
	client: Socket,
	eventListener: string,
	emit: { name: string; value?: unknown } | undefined,
	checkIsRoom: boolean,
	roomName: string | undefined,
	connect: boolean = false,
): Promise<T> {
	const promise = new Promise<T>((resolve, reject) => {
		if (connect) client.connect();
		client.on(eventListener, (data: T) => {
			if (data && connect) {
				sessionId = (data as unknown as IPlayerJSON).sessionID;
				resolve(data);
			} else if (!checkIsRoom || (checkIsRoom && (data as unknown as IRoomPayload).room.name == roomName)) {
				resolve(data);
			}
		});
		client.on('error', (msg) => {
			reject(msg);
		});
		if (typeof emit != 'undefined') {
			emit?.value ? client.emit(emit.name, emit?.value) : client.emit(emit.name);
		}
	});
	return promise;
}

async function testValuePromise<T>(
	client: Socket,
	promise: Promise<T>,
	value: {
		reason?: boolean;
		reasonValue?: string;
		room?: boolean;
		roomValue?: Object;
		player?: boolean;
		playerValue?: Object;
	},
	eventListener: string,
) {
	const [reason, room, player] = await promise
		.then((data: T) => {
			return [
				value?.reason ? ((data as IRoomPayload).reason as string) : undefined,
				value?.room ? ((data as IRoomPayload).room as IRoomJSON) : undefined,
				value?.player ? ((data as IPlayerPayload).player as IPlayerJSON) : undefined,
			];
		})
		.catch(() => {
			expect(false).toBe(true);
			return [undefined, undefined, undefined];
		})
		.finally(() => {
			client.off(eventListener);
			client.off('error');
		});
	if (typeof reason != 'undefined') expect(reason).toBe(value.reasonValue);
	if (typeof room != 'undefined') expect(room).toMatchObject<IRoomJSON>(value.roomValue as IRoomJSON);
	if (typeof player != 'undefined') expect(player).toMatchObject<IPlayerJSON>(value.playerValue as IPlayerJSON);
}

describe('all Events', () => {
	let app: App;
	let client: Socket;

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
			const promise = testPromise<IPlayerJSON>(client, 'join', undefined, false, undefined, true);
			const playerValue = {
				...playerExpect,
				username: 'allEventsCreateClient',
				sessionID: sessionId,
			};
			await testValuePromise<IPlayerJSON>(
				client,
				promise,
				{
					player: true,
					playerValue,
				},
				'join',
			);
		});
	});

	describe('create room', () => {
		test(`allEventsCreateClient create room : ${roomName}, roomOpened event`, async () => {
			const promise = testPromise<IRoomPayload>(
				client,
				'roomOpened',
				{ name: 'createRoom', value: roomName },
				true,
				roomName,
			);
			const playerValue = {
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName],
			};
			const roomValue = {
				...roomExpect,
				name: roomName,
				leader: playerValue,
			};
			await testValuePromise<IRoomPayload>(
				client,
				promise,
				{ room: true, player: true, roomValue, playerValue },
				'roomOpened',
			);
		});
		test(`allEventsCreateClient create room : ${roomName2}, roomChange event`, async () => {
			const promise = testPromise<IRoomPayload>(
				client,
				'roomChange',
				{ name: 'createRoom', value: roomName2 },
				true,
				roomName2,
			);
			const reasonValue = "new leader";
			const playerValue = {
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName, roomName2],
			}
			const roomValue = {
				...roomExpect,
				name: roomName2,
				leader: playerValue
			}
			await testValuePromise<IRoomPayload>(client, promise, {reason: true, player: true, room: true, reasonValue, playerValue, roomValue}, 'createRoom')
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
				const promise = testPromise<IRoomPayload>(
					client,
					'roomChange',
					{ name: 'joinRoom', value: roomName },
					true,
					roomName,
				);
				const reasonValue = 'player incoming';
				const playerValue = {
					...playerExpect,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				}
				const roomValue = {
					...roomExpect,
					name: roomName,
					players: [playerValue],
					totalPlayers: 1,
					leader: playerValue,
				}
				await testValuePromise<IRoomPayload>(client, promise, {
					reason: true,
					player: true,
					room: true,
					reasonValue,
					playerValue,
					roomValue
				}, 'roomChange')
			});
		});
		describe('change username', () => {
			const username = 'AllEventsChangeUsername';
			test(`allEventsCreateClient change username : \
${username}, playerChange event`, async () => {
				const promise = testPromise<IPlayerPayload>(
					client,
					'playerChange',
					{ name: 'changeUsername', value: 'AllEventsChangeUsername' },
					false,
					roomName,
				);

				const reasonValue = 'change username';
				const playerValue = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				}

				await testValuePromise<IPlayerPayload>(client, promise, {
					reason: true,
					player: true,
					reasonValue,
					playerValue
				}, 'playerChange');
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
