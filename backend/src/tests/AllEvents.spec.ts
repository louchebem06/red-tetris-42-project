import { Socket } from 'socket.io-client';

import App from '../model/App';
import IPlayerJSON from '../interface/IPlayerJSON';
import IRoomJSON from '../interface/IRoomJSON';
import { IRoomState } from '../interface/IRoomState';

import { createClient } from './client/utils/creation';
import { createPlayer } from './player/utils/creation';
import { createRoom } from './room/utils/creation';

import { colors } from './utils/consoleColors';

import { createIncomingAction } from './client/incomingPayload/creation';

import { sessionId } from './client/outgoingPayload/handlers';

const destroyTimer = parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000 ?? 5000;

import { expect } from '@jest/globals';
import { createOutgoingAction } from './client/outgoingPayload/creation';
import { createRoomState } from './roomState/utils/creation';
import { testOutgoingEventWithIncomingAct } from './client/events/handlers';

describe('* All Server IO Events', () => {
	let app: App;
	let client: Socket;
	let username = 'allEventsCreateClient';

	const roomName = 'Loulouville';
	const roomName2 = 'Loulouville2';

	const roomExpect: IRoomJSON = createRoom();
	const playerExpect: IPlayerJSON = createPlayer({ username });

	const config = (val: string): { [key: string]: string } => {
		return {
			client: `${colors.fCyan}${colors.bold}${val}${colors.reset}`,
			room: `${colors.fMagenta}${colors.bold}${val}${colors.reset}`,
			eventI: `${colors.fYellow}${colors.bold}${val}${colors.reset}`,
			eventO: `${colors.fBlue}${colors.bold}${val}${colors.reset}`,
		};
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
	describe('Create Socket Client', () => {
		test(`client ${config(username).client} should be created`, () => {
			client = createClient(username);
			expect(client).toBeInstanceOf(Socket);
			expect(client).toBeDefined();
			expect(client).not.toBeNull();
		});
	});
	describe('Connect to Server IO', () => {
		test(`${config(username).client} join Server\
, ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('undefined', undefined),
				expected: createOutgoingAction('join', {
					...playerExpect,
					sessionID: sessionId,
				}),
			});
		});
	});

	describe(`Create rooms`, () => {
		test(`${config(username).client} create room : ${config(roomName).room}\
, ${config('createRoom').eventI} -> ${config('roomOpened').eventO} events`, async () => {
			const player = {
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName],
			};
			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('createRoom', roomName),
				expected: createOutgoingAction('roomOpened', {
					room: {
						...roomExpect,
						name: roomName,
						leader: player,
					},
					player,
				}),
			});
		});
		test(`${config(username).client} create room : ${config(roomName2).room}\
, ${config('createRoom').eventI} -> ${config('roomChange').eventO} events`, async () => {
			const player = {
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName, roomName2],
			};

			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('createRoom', roomName2),
				expected: createOutgoingAction('roomChange', {
					reason: 'new leader',
					room: {
						...roomExpect,
						name: roomName2,
						leader: player,
					},
					player,
				}),
			});
		});
	});
	describe(`Join room & change username`, () => {
		const roomsState: IRoomState[] = [
			createRoomState({
				name: roomName,
			}),
		];
		describe('Join room', () => {
			test(`${config(username).client} join room : ${config(roomName).room}\
, ${config('joinRoom').eventI} -> ${config('roomChange').eventO} events`, async () => {
				const player = {
					...playerExpect,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				};

				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('joinRoom', roomName),
					expected: createOutgoingAction('roomChange', {
						reason: 'player incoming',
						room: {
							...roomExpect,
							name: roomName,
							players: [player],
							totalPlayers: 1,
							leader: player,
						},
						player,
					}),
				});
			});
		});
		describe('Change username', () => {
			const _username = 'allEventsChangeUsername';
			test(`${config(username).client} change username : ${config(_username).room}\
, ${config('changeUsername').eventI} -> ${config('playerChange').eventO} events`, async () => {
				username = _username;
				const player = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				};

				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('changeUsername', username),
					expected: createOutgoingAction('playerChange', {
						reason: 'change username',
						player,
					}),
				});
			});
		});
	});
	describe("Get whole rooms & get player's rooms & get room", () => {
		const roomsState: IRoomState[] = [
			createRoomState({
				name: roomName,
			}),
		];
		describe('Get rooms', () => {
			test(`${config(username).client} get rooms\
, ${config('getRooms').eventI} -> ${config('getRooms').eventO} events`, async () => {
				const player = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				};
				const room = {
					...roomExpect,
					name: roomName,
					players: [player],
					totalPlayers: 1,
					leader: player,
				};
				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('getRooms', undefined as never),
					expected: createOutgoingAction('getRooms', [
						room,
						{
							...roomExpect,
							name: roomName2,
							leader: player,
						},
					]),
				});
			});
		});
		describe("Get player's rooms", () => {
			test(`${config(username).client} get player's rooms\
, ${config('getRoomsPlayer').eventI} -> ${config('getRoomsPlayer').eventO} events`, async () => {
				const player = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				};
				const room = {
					...roomExpect,
					name: roomName,
					players: [player],
					totalPlayers: 1,
					leader: player,
				};
				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('getRoomsPlayer', undefined as never),
					expected: createOutgoingAction('getRoomsPlayer', [room]),
				});
			});
		});
		describe('get room', () => {
			test(`${config(username).client} get room ${config(roomName).room}\
, ${config('getRoom').eventI} -> ${config('roomInfo').eventO} events`, async () => {
				const player = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					roomsState,
				};
				const room = {
					...roomExpect,
					name: roomName,
					players: [player],
					totalPlayers: 1,
					leader: player,
				};
				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('getRoom', roomName),
					expected: createOutgoingAction('roomInfo', room),
				});
			});
		});
	});
	describe('Message', () => {
		const roomsState: IRoomState[] = [
			createRoomState({
				name: roomName,
			}),
		];
		test(`${config(username).client} send message to room ${config(roomName).room}\
, ${config('message').eventI} -> ${config('message').eventO} events`, async () => {
			const player = {
				...playerExpect,
				username: username,
				sessionID: sessionId,
				leads: [roomName, roomName2],
				roomsState,
			};
			const room = {
				...roomExpect,
				name: roomName,
				players: [player],
				totalPlayers: 1,
				leader: player,
			};
			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('message', {
					message: 'Hello Room!',
					receiver: roomName,
				}),
				expected: createOutgoingAction('message', {
					date: expect.any(String) as unknown as Date,
					message: 'Hello Room!',
					emitter: player,
					receiver: room,
				}),
			});
		});

		test(`${config(username).client} send message to self ${config(username).room}\
, ${config('message').eventI} -> ${config('message').eventO} events`, async () => {
			const player = {
				...playerExpect,
				username: username,
				sessionID: sessionId,
				leads: [roomName, roomName2],
				roomsState,
			};
			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('message', {
					message: 'Hello Self!',
					receiver: player.sessionID,
				}),
				expected: createOutgoingAction('message', {
					date: expect.any(String) as unknown as Date,
					message: 'Hello Self!',
					emitter: player,
					receiver: player,
				}),
			});
		});
	});
	describe('Set ready', () => {});
	describe('Game start', () => {});
	describe('Leave room', () => {
		const roomsState: IRoomState[] = [
			createRoomState({
				name: roomName,
				status: 'left',
			}),
		];
		test(`${config(username).client} leave room : ${config(roomName).room}\
, ${config('leaveRoom').eventI} -> ${config('roomClosed').eventO} events`, async () => {
			const player = {
				...playerExpect,
				sessionID: sessionId,
				leads: [roomName2, roomName],
				username: username,
				roomsState,
			};
			await testOutgoingEventWithIncomingAct({
				client,
				toSend: createIncomingAction('leaveRoom', roomName),
				expected: createOutgoingAction('roomClosed', {
					room: {
						...roomExpect,
						name: roomName,
						leader: player,
					},
					player,
				}),
			});
		});
		describe('Get rooms', () => {
			test(`${config(username).client} get rooms\
, ${config('getRooms').eventI} -> ${config('getRooms').eventO} events`, async () => {
				const player = {
					...playerExpect,
					username: username,
					sessionID: sessionId,
					leads: [roomName2, roomName],
					roomsState,
				};

				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('getRooms', undefined as never),
					expected: createOutgoingAction('getRooms', [
						{
							...roomExpect,
							name: roomName2,
							leader: player,
						},
					]),
				});
			});
		});
		describe('Join room', () => {
			test(`${config(username).client} join room : ${config(roomName2).room}\
, ${config('joinRoom').eventI} -> ${config('roomChange').eventO} events`, async () => {
				const player = {
					...playerExpect,
					sessionID: sessionId,
					username: username,
					leads: [roomName2, roomName],
					roomsState: [
						...roomsState,
						createRoomState({
							name: roomName2,
							status: 'active',
						}),
					],
				};

				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('joinRoom', roomName2),
					expected: createOutgoingAction('roomChange', {
						reason: 'player incoming',
						room: {
							...roomExpect,
							name: roomName2,
							players: [player],
							totalPlayers: 1,
							leader: player,
						},
						player,
					}),
				});
			});
		});
		describe('Leave Room', () => {
			test(`${config(username).client} leave room : ${config(roomName2).room}\
, ${config('leaveRoom').eventI} -> ${config('roomChange').eventO} events`, async () => {
				const player = {
					...playerExpect,
					sessionID: sessionId,
					leads: [roomName, roomName2],
					username: username,
					roomsState: [
						...roomsState,
						createRoomState({
							name: roomName2,
							status: 'left',
						}),
					],
				};
				await testOutgoingEventWithIncomingAct({
					client,
					toSend: createIncomingAction('leaveRoom', roomName2),
					expected: createOutgoingAction('roomChange', {
						reason: 'new winner',
						room: {
							...roomExpect,
							name: roomName2,
							leader: player,
						},
						player,
					}),
				});
			});
		});
	});

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
