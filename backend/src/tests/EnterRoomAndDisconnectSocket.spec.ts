// import { Socket } from 'socket.io-client';

// import { IRoomState } from '../rooms/roomState/IRoomState';

// import { expect } from '@jest/globals';
// import { handleAppLifeCycle } from './app/handlers';
// import { clientConfig, config } from './utils/configs';
// import { destroyTimer } from './utils/env';
// import { createClient, createIncomingAction, createOutgoingAction, createRoomState } from './client/events';
// import { testReconnectingClient, testSeveralOutgoingEvents } from './client/outgoingPayload/testers';
// import { datasClients, disconnectAllClients } from './client/utils/creation';
// import { testDuplicateClient } from './client/outgoingPayload/testers/testDuplicateClient';
// import { testSeveralOutgoingEventsSeveralTimes } from './client/outgoingPayload/testers/testSeveralOutgoingEvents';

// describe('* Disconnect Players State', () => {
// 	let client1: Socket;
// 	let client2: Socket;
// 	let client3: Socket;
// 	let client4: Socket;

// 	const username1 = 'First';
// 	const username2 = 'Second';
// 	const username3 = 'Third';
// 	const username4 = 'Fourth';

// 	const room1 = 'Choupinou';
// 	const { playerExpect, roomExpect } = clientConfig('First');
// 	const playerExpect1 = { ...playerExpect, username: username1 };
// 	const playerExpect2 = { ...playerExpect, username: username2 };
// 	const playerExpect3 = { ...playerExpect, username: username3 };
// 	const playerExpect4 = { ...playerExpect, username: username4 };

// 	roomExpect.name = room1;
// 	roomExpect.leader = playerExpect1;

// 	handleAppLifeCycle();

describe(`Create Sockets Clients`, () => {
	test(`shut down`, () => {
		console.log('... no comment');
	});
});

// 	describe('Create Sockets Clients', () => {
// 		test(`client ${config(username1).client} should be created`, () => {
// 			// client1 = createClient( username1 );
// 			client1 = createClient({ username: username1 });
// 			expect(client1).toBeInstanceOf(Socket);
// 			expect(client1).toBeDefined();
// 			expect(client1).not.toBeNull();
// 		});
// 		test(`client ${config(username2).client} should be created`, () => {
// 			// client2 = createClient( username2 );
// 			client2 = createClient({ username: username2 });
// 			expect(client2).toBeInstanceOf(Socket);
// 			expect(client2).toBeDefined();
// 			expect(client2).not.toBeNull();
// 		});
// 	});

// 	describe('Connect to Server IO', () => {
// 		test(`${config(username1).client} join Server\
// , ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
// 			await testSeveralOutgoingEvents(client1, createIncomingAction('undefined', undefined), [
// 				createOutgoingAction('join', {
// 					...playerExpect1,
// 					sessionID: expect.any(String) as unknown as string,
// 				}),
// 			]);
// 		});

// 		test(`${config(username2).client} join Server\
// , ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
// 			await testSeveralOutgoingEvents(client2, createIncomingAction('undefined', undefined), [
// 				createOutgoingAction('join', {
// 					...playerExpect2,
// 					sessionID: expect.any(String) as unknown as string,
// 				}),
// 			]);
// 		});
// 	});

// 	describe('Clients enter room 1', () => {
// 		test(`${config(username1).client} should create room ${room1} and be leader\
// , ${config('createRoom').eventI} -> [${config('roomOpened').eventO}, ${config('roomChange').eventO}: ${
// 			config('new leader').eventO
// 		}] events`, async () => {
// 			const player = {
// 				...playerExpect1,
// 				leads: [room1],
// 				sessionID: expect.any(String) as unknown as string,
// 			};

// 			await testSeveralOutgoingEvents(client1, createIncomingAction('createRoom', room1), [
// 				createOutgoingAction('roomOpened', {
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						leader: player,
// 					},
// 					player,
// 				}),
// 				createOutgoingAction('roomChange', {
// 					reason: 'new leader',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						leader: player,
// 					},
// 					player,
// 				}),
// 			]);
// 		});

// 		test(`${config(username1).client} should join room ${room1} and be alone inside\
// , ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
// 			config('player incoming').eventO
// 		}] events`, async () => {
// 			const roomsState: IRoomState[] = [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 0,
// 				}),
// 			];
// 			const player = {
// 				...playerExpect1,
// 				sessionID: expect.any(String) as unknown as string,
// 				leads: [room1],
// 				roomsState,
// 			};

// 			await testSeveralOutgoingEvents(client1, createIncomingAction('joinRoom', room1), [
// 				createOutgoingAction('roomChange', {
// 					reason: 'player incoming',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						players: [player],
// 						totalPlayers: 1,
// 						leader: player,
// 					},
// 					player,
// 				}),
// 			]);
// 		});

// 		test(`${config(username2).client} should join room ${room1} and be with ${config(username1).client} in\
// , ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
// 			config('player incoming').eventO
// 		}] events`, async () => {
// 			const roomsState: IRoomState[] = [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 0,
// 				}),
// 			];
// 			const player = {
// 				...playerExpect1,
// 				sessionID: expect.any(String) as unknown as string,
// 				leads: [room1],
// 				roomsState,
// 			};
// 			const player2 = {
// 				...playerExpect2,
// 				sessionID: expect.any(String) as unknown as string,
// 				roomsState,
// 			};
// 			await testSeveralOutgoingEvents(client2, createIncomingAction('joinRoom', room1), [
// 				createOutgoingAction('roomChange', {
// 					reason: 'player incoming',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						players: [player, player2],
// 						totalPlayers: 2,
// 						leader: player,
// 					},
// 					player: player2,
// 				}),
// 			]);
// 		});

// 		test(`${config(username1).client} should listen ${config(username2).client} joining room ${room1}\
// , ${config('no one').eventI} -> [${config('roomChange').eventO}: ${
// 			config('player incoming').eventO
// 		}] events`, async () => {
// 			const roomsState: IRoomState[] = [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 0,
// 				}),
// 			];
// 			const player = {
// 				...playerExpect1,
// 				sessionID: expect.any(String) as unknown as string,
// 				leads: [room1],
// 				roomsState,
// 			};
// 			const player2 = {
// 				...playerExpect2,
// 				sessionID: expect.any(String) as unknown as string,
// 				roomsState: [
// 					createRoomState({
// 						name: room1,
// 						status: 'active',
// 						readys: 0,
// 						leads: false,
// 					}),
// 				],
// 			};
// 			await testSeveralOutgoingEvents(
// 				client1,
// 				createIncomingAction('undefined', undefined),
// 				[
// 					createOutgoingAction('roomChange', {
// 						reason: 'player incoming',
// 						room: {
// 							...roomExpect,
// 							name: room1,
// 							players: [player, player2],
// 							totalPlayers: 2,
// 							leader: player,
// 						},
// 						player: player2,
// 					}),
// 				],
// 				{
// 					name: room1,
// 					toWatch: [client2.id ?? ''],
// 				},
// 			);
// 		});
// 	});

// 	describe.skip('Client2 disconnect and reconnect', () => {
// 		const roomsState: IRoomState[] = [
// 			createRoomState({
// 				name: room1,
// 				status: 'active',
// 				readys: 0,
// 				leads: false,
// 			}),
// 		];

// 		test(`${config(username2).client} should disconnect and reconnect\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, async () => {
// 			await testReconnectingClient({
// 				client: client2,
// 				expected: createOutgoingAction('join', {
// 					...playerExpect2,
// 					sessionID: expect.any(String) as unknown as string,
// 					roomsState,
// 				}),
// 			});
// 		});

// 		test(`${config(username2).client} should listen ${room1} infos and retrieve self inside\
// , ${config('getRoom').eventI} -> [${config('roomInfo').eventO}] events`, async () => {
// 			const roomsState: IRoomState[] = [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 0,
// 				}),
// 			];
// 			const roomsState2: IRoomState[] = [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 0,
// 					leads: false,
// 				}),
// 			];
// 			const player = {
// 				...playerExpect1,
// 				sessionID: expect.any(String) as unknown as string,
// 				leads: [room1],
// 				roomsState,
// 			};
// 			const player2 = {
// 				...playerExpect2,
// 				sessionID: expect.any(String) as unknown as string,
// 				roomsState: roomsState2,
// 			};
// 			// console.error('datasClient', datasClients);
// 			client2 = datasClients[1].clients[1];
// 			await testSeveralOutgoingEvents(client2, createIncomingAction('getRoom', room1), [
// 				createOutgoingAction('roomInfo', {
// 					...roomExpect,
// 					name: room1,
// 					players: [player, player2],
// 					totalPlayers: 2,
// 					leader: player,
// 				}),
// 			]);
// 		});

// 		test(
// 			`${
// 				config(username1).client
// 			} should disconnect and reconnect and should still be the leader of room ${room1}\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`,
// 			async () => {
// 				const roomsState: IRoomState[] = [
// 					createRoomState({
// 						name: room1,
// 						status: 'active',
// 						readys: 0,
// 					}),
// 				];

// 				const player = {
// 					...playerExpect1,
// 					sessionID: expect.any(String) as unknown as string,
// 					leads: [room1],
// 					roomsState,
// 				};

// 				// console.error('datasClient', datasClients);
// 				await testReconnectingClient({
// 					client: client1,
// 					expected: createOutgoingAction('join', {
// 						...player,
// 						sessionID: expect.any(String) as unknown as string,
// 						roomsState,
// 					}),
// 				});
// 			},
// 			destroyTimer + 1000,
// 		);
// 	});

// 	describe(`Client1 and Client 2 set as ready then disconnect`, () => {
// 		const roomsState: IRoomState[] = [
// 			createRoomState({
// 				name: room1,
// 				status: 'active',
// 				readys: 1,
// 			}),
// 		];
// 		const player = {
// 			...playerExpect1,
// 			sessionID: expect.any(String) as unknown as string,
// 			leads: [room1],
// 			roomsState,
// 		};
// 		const player2 = {
// 			...playerExpect2,
// 			sessionID: expect.any(String) as unknown as string,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'ready',
// 					readys: 1,
// 					leads: false,
// 				}),
// 			],
// 		};
// 		const player1Ready = {
// 			...player,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'ready',
// 					readys: 2,
// 				}),
// 			],
// 		};
// 		test(`${config(username1).client} and ${config(username2).client} should set as ready then ${
// 			config(username2).client
// 		} should disconnect and reconnect\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, async () => {
// 			client2 = datasClients[1].clients[1];

// 			// clt2 se met ready
// 			await testSeveralOutgoingEvents(client2, createIncomingAction('ready', room1), [
// 				createOutgoingAction('playerChange', {
// 					reason: 'ready',
// 					player: player2,
// 				}),
// 			]);

// 			// on recup la socket connectee (on laisse la deconnectée pr pas galerer a recup le sessionId)
// 			// clt1 recoit le playerChange de clt2
// 			client1 = datasClients[0].clients[1];
// 			await testSeveralOutgoingEvents(
// 				client1,
// 				createIncomingAction('undefined', undefined),
// 				[
// 					createOutgoingAction('playerChange', {
// 						reason: 'ready',
// 						player: player2,
// 					}),
// 				],
// 				{
// 					name: room1,
// 					toWatch: [client2.id ?? ''],
// 				},
// 			);
// 		});

// 		test(`${config(username1).client} should set as ready then ${
// 			config(room1).client
// 		}'s countdown should be triggered\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, async () => {
// 			// le compte a rebours est censé démarrer
// 			// apres que player1 se set ready(motif: tous les joueurs de la room sont ready)
// 			await testSeveralOutgoingEvents(client1, createIncomingAction('ready', room1), [
// 				createOutgoingAction('playerChange', {
// 					reason: 'ready',
// 					player: player1Ready,
// 				}),
// 			]);
// 		});

// 		test(`${config(username2).client} should disconnect and reconnect and stay ready\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, async () => {
// 			await testReconnectingClient({
// 				client: client2,
// 				expected: createOutgoingAction('join', {
// 					...playerExpect2,
// 					sessionID: expect.any(String) as unknown as string,
// 					roomsState: [
// 						createRoomState({
// 							name: room1,
// 							status: 'ready',
// 							readys: 2,
// 							leads: false,
// 						}),
// 					],
// 				}),
// 			});
// 		});

// 		test(
// 			`${config(username2).client} should listen the countdown 2 times then unset as ready\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`,
// 			async () => {
// 				client2 = datasClients[1].clients[2];
// 				await testSeveralOutgoingEventsSeveralTimes(
// 					client2,
// 					createIncomingAction('undefined', undefined),
// 					[
// 						{
// 							event: 'gameStart',
// 							times: 2,
// 							payloads: [
// 								{
// 									roomName: room1,
// 									reason: 'time',
// 									message: 'The game will start in 3 seconds.',
// 								},
// 								{
// 									reason: 'time',
// 									message: 'The game will start in 2 seconds.',
// 									roomName: room1,
// 								},
// 								// {
// 								// 	reason: 'time',
// 								// 	message: 'The game will start in 1 second.',
// 								// 	roomName: room1,
// 								// },
// 								// {
// 								// 	reason: 'start',
// 								// 	roomName: room1,
// 								// },
// 							],
// 						},
// 					],
// 					{
// 						name: room1,
// 						toWatch: [client2.id ?? ''],
// 					},
// 				);
// 				// clt2 se unset ready
// 				await testSeveralOutgoingEvents(client2, createIncomingAction('ready', room1), [
// 					createOutgoingAction('playerChange', {
// 						reason: 'ready',
// 						player: {
// 							...player2,
// 							roomsState: [
// 								createRoomState({
// 									name: room1,
// 									status: 'idle',
// 									readys: 1,
// 									leads: false,
// 								}),
// 							],
// 						},
// 					}),
// 				]);
// 			},
// 			destroyTimer + 1000,
// 		);
// 	});

// 	describe.skip(`Client 3 should income in room ${room1}, set as ready, leave room, disconnect and reconnect`, () => {
// 		const roomsState: IRoomState[] = [
// 			createRoomState({
// 				name: room1,
// 				status: 'ready',
// 				readys: 1,
// 			}),
// 		];

// 		const player = {
// 			...playerExpect1,
// 			sessionID: expect.any(String) as unknown as string,
// 			leads: [room1],
// 			roomsState,
// 		};

// 		const player2 = {
// 			...playerExpect2,
// 			sessionID: expect.any(String) as unknown as string,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'idle',
// 					readys: 1,
// 					leads: false,
// 				}),
// 			],
// 		};

// 		const player3 = {
// 			...playerExpect3,
// 			sessionID: expect.any(String) as unknown as string,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 1,
// 					leads: false,
// 				}),
// 			],
// 		};

// 		test(`client ${config(username3).client} should be created`, () => {
// 			// client1 = createClient( username1 );
// 			client3 = createClient({ username: username3 });
// 			expect(client3).toBeInstanceOf(Socket);
// 			expect(client3).toBeDefined();
// 			expect(client3).not.toBeNull();
// 		});

// 		test(`${config(username3).client} join Server\
// , ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
// 			await testSeveralOutgoingEvents(client3, createIncomingAction('undefined', undefined), [
// 				createOutgoingAction('join', {
// 					...playerExpect3,
// 					sessionID: expect.any(String) as unknown as string,
// 				}),
// 			]);
// 		});

// 		test(`${config(username3).client} should join room ${room1}\
// , ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
// 			config('player incoming').eventO
// 		}] events`, async () => {
// 			await testSeveralOutgoingEvents(client3, createIncomingAction('joinRoom', room1), [
// 				createOutgoingAction('roomChange', {
// 					reason: 'player incoming',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						players: [player, player2, player3],
// 						readys: [player],
// 						totalPlayers: 3,
// 						totalReady: 1,
// 						leader: player,
// 					},
// 					player: player3,
// 				}),
// 			]);
// 		});

// 		test(`${config(username3).client} should set as ready\ , ${config('ready').eventI} -> [${
// 			config('playerChange').eventO
// 		}: ${config('ready').eventO}] events`, async () => {
// 			await testSeveralOutgoingEvents(client3, createIncomingAction('ready', room1), [
// 				createOutgoingAction('playerChange', {
// 					reason: 'ready',
// 					player: {
// 						...player3,
// 						roomsState: [
// 							createRoomState({
// 								name: room1,
// 								status: 'ready',
// 								readys: 2,
// 								leads: false,
// 							}),
// 						],
// 					},
// 				}),
// 			]);
// 		});

// 		test(`${config(username3).client} should leave room ${room1}\ , ${config('leaveRoom').eventI} -> [${
// 			config('roomChange').eventO
// 		}: ${config('player outgoing').eventO}] events`, async () => {
// 			const player3Left = {
// 				...player3,
// 				roomsState: [
// 					createRoomState({
// 						name: room1,
// 						status: 'left',
// 						readys: 1,
// 						leads: false,
// 					}),
// 				],
// 			};

// 			await testSeveralOutgoingEvents(client3, createIncomingAction('leaveRoom', room1), [
// 				createOutgoingAction('roomChange', {
// 					reason: 'player outgoing',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						players: [player, player2],
// 						readys: [player],
// 						totalPlayers: 2,
// 						totalReady: 1,
// 						leader: player,
// 					},
// 					player: player3Left,
// 				}),
// 			]);
// 		});

// 		test(`${config(username3).client} should disconnect and reconnect with the same socket\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, (done) => {
// 			client3.on('disconnect', () => {
// 				client3.connect();
// 				client3.off('disconnect');
// 				client3.on('join', () => {
// 					// console.error('client3', reason, client3, payload);
// 					client3.off('join');
// 					done();
// 				});
// 			});
// 			client3.disconnect();
// 		});

// 		test(`${config(username3).client} should disconnect and reconnect and stay left from the room\
// , ${config('disconnect').eventI} -> [${config('join').eventO}] events`, async () => {
// 			await testReconnectingClient({
// 				client: client3,
// 				expected: createOutgoingAction('join', {
// 					...player3,
// 					sessionID: expect.any(String) as unknown as string,
// 					roomsState: [
// 						createRoomState({
// 							name: room1,
// 							status: 'left',
// 							readys: 1,
// 							leads: false,
// 						}),
// 					],
// 				}),
// 			});

// 			client3 = datasClients[2].clients[1];
// 			// client3.onAny((event, payload) => {
// 			// 	console.error("next socket",event, payload);
// 			// });
// 			await testSeveralOutgoingEvents(client3, createIncomingAction('getRoom', room1), [
// 				createOutgoingAction('roomInfo', {
// 					...roomExpect,
// 					name: room1,
// 					players: [player, player2],
// 					readys: [player],
// 					totalPlayers: 2,
// 					totalReady: 1,
// 					leader: player,
// 				}),
// 			]);
// 		});
// 	});

// 	describe.skip(`Client 4 should income in room ${room1} while game is started and disconnect and reconnect`, () => {
// 		const roomsState: IRoomState[] = [
// 			createRoomState({
// 				name: room1,
// 				status: 'ready',
// 				readys: 2,
// 			}),
// 		];

// 		const player = {
// 			...playerExpect1,
// 			sessionID: expect.any(String) as unknown as string,
// 			leads: [room1],
// 			roomsState,
// 		};

// 		const player2Ready = {
// 			...playerExpect2,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'ready',
// 					readys: 2,
// 					leads: false,
// 				}),
// 			],
// 		};

// 		const player4 = {
// 			...playerExpect4,
// 			sessionID: expect.any(String) as unknown as string,
// 			roomsState: [
// 				createRoomState({
// 					name: room1,
// 					status: 'active',
// 					readys: 2,
// 					leads: false,
// 				}),
// 			],
// 		};

// 		test(`client ${config(username4).client} should be created`, () => {
// 			client4 = createClient({ username: username4 });
// 			expect(client4).toBeInstanceOf(Socket);
// 			expect(client4).toBeDefined();
// 			expect(client4).not.toBeNull();
// 		});

// 		test(`${config(username4).client} join Server\
// , ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
// 			await testSeveralOutgoingEvents(client4, createIncomingAction('undefined', undefined), [
// 				createOutgoingAction('join', {
// 					...playerExpect4,
// 					sessionID: expect.any(String) as unknown as string,
// 				}),
// 			]);
// 		});

// 		test(`${config(username4).client} should join room ${room1}\
// , ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
// 			config('player incoming').eventO
// 		}] events`, async () => {
// 			client2 = datasClients[1].clients[2];
// 			await testSeveralOutgoingEvents(client2, createIncomingAction('ready', room1), [
// 				createOutgoingAction('playerChange', {
// 					reason: 'ready',
// 					player: player2Ready,
// 				}),
// 			]);
// 			await testSeveralOutgoingEventsSeveralTimes(
// 				client2,
// 				createIncomingAction('undefined', undefined),
// 				[
// 					{
// 						event: 'gameStart',
// 						times: 4,
// 						payloads: [
// 							{
// 								roomName: room1,
// 								reason: 'time',
// 								message: 'The game will start in 3 seconds.',
// 							},
// 							{
// 								reason: 'time',
// 								message: 'The game will start in 2 seconds.',
// 								roomName: room1,
// 							},
// 							{
// 								reason: 'time',
// 								message: 'The game will start in 1 second.',
// 								roomName: room1,
// 							},
// 							{
// 								reason: 'start',
// 								roomName: room1,
// 							},
// 						],
// 					},
// 				],
// 				{
// 					name: room1,
// 					toWatch: [client2.id ?? ''],
// 				},
// 			);

// 			const player1InGame = {
// 				...player,
// 				roomsState: [
// 					createRoomState({
// 						name: room1,
// 						started: true,
// 					}),
// 				],
// 			};
// 			const player2InGame = {
// 				...player,
// 				roomsState: [
// 					createRoomState({
// 						name: room1,
// 						leads: false,
// 						started: true,
// 					}),
// 				],
// 			};
// 			await testSeveralOutgoingEvents(client4, createIncomingAction('getRoom', room1), [
// 				createOutgoingAction('roomInfo', {
// 					...roomExpect,
// 					name: room1,
// 					players: [player1InGame, player2InGame],
// 					readys: [],
// 					totalPlayers: 2,
// 					totalReady: 0,
// 					leader: player1InGame,
// 					// games: [
// 					// 	{
// 					// 		_dateCreated: expect.any(Date) as unknown as string,
// 					// 		_dateStarted: expect.any(Date) as unknown as string,
// 					// 		_dateStopped: expect.any(Date) as unknown as string,
// 					// 		_id: room1,
// 					// 		winner: null,
// 					// 	}
// 					// ],
// 					gameState: true,
// 				}),
// 			]);

// 			// await testSeveralOutgoingEvents(client4, createIncomingAction('joinRoom', room1), [
// 			// 	createOutgoingAction('roomChange', {
// 			// 		reason: 'player incoming',
// 			// 		room: {
// 			// 			...roomExpect,
// 			// 			name: room1,
// 			// 			players: [player, player2Ready, player4],
// 			// 			readys: [player, player2Ready],
// 			// 			totalPlayers: 3,
// 			// 			totalReady: 2,
// 			// 			leader: player,
// 			// 		},
// 			// 		player: player4,
// 			// 	}),
// 			// ]);
// 		});

// 		// test(`${config(username3).client} should set as ready\ , ${config('ready').eventI} -> [${
// 		// 	config('playerChange').eventO
// 		// }: ${config('ready').eventO}] events`, async () => {
// 		// 	await testSeveralOutgoingEvents(client3, createIncomingAction('ready', room1), [
// 		// 		createOutgoingAction('playerChange', {
// 		// 			reason: 'ready',
// 		// 			player: {
// 		// 				...player3,
// 		// 				roomsState: [
// 		// 					createRoomState({
// 		// 						name: room1,
// 		// 						status: 'ready',
// 		// 						readys: 2,
// 		// 						leads: false,
// 		// 					}),
// 		// 				],
// 		// 			},
// 		// 		}),
// 		// 	]);
// 		// });

// 		test.skip(`${config(username4).client} should leave room ${room1}\ , ${config('leaveRoom').eventI} -> [${
// 			config('roomChange').eventO
// 		}: ${config('player outgoing').eventO}] events`, async () => {
// 			const player4Left = {
// 				...player4,
// 				roomsState: [
// 					createRoomState({
// 						name: room1,
// 						status: 'left',
// 						readys: 2,
// 						leads: false,
// 					}),
// 				],
// 			};

// 			await testSeveralOutgoingEvents(client4, createIncomingAction('leaveRoom', room1), [
// 				createOutgoingAction('roomChange', {
// 					reason: 'player outgoing',
// 					room: {
// 						...roomExpect,
// 						name: room1,
// 						players: [player, player2Ready, player4],
// 						readys: [player, player2Ready],
// 						totalPlayers: 3,
// 						totalReady: 2,
// 						leader: player,
// 					},
// 					player: player4Left,
// 				}),
// 			]);
// 		});
// 	});

// 	describe.skip('Client 1 should connect with several sockets in same time,\
// then disconnecting all, allowing destroying session, then Client 2 should become leader of the room', () => {
// 		test(
// 			`${
// 				config(username1).client
// 			} should connect with 2 others client socket, simulating several browser tabs opened\
// , ${config('no one').eventI} -> [${config('join').eventO}, ${config('join').eventO}] events`,
// 			async () => {
// 				const roomsState: IRoomState[] = [
// 					createRoomState({
// 						name: room1,
// 						status: 'ready',
// 						readys: 1,
// 					}),
// 				];

// 				const player = {
// 					...playerExpect1,
// 					sessionID: expect.any(String) as unknown as string,
// 					leads: [room1],
// 					roomsState,
// 				};

// 				// console.error('datasClient', datasClients);
// 				await testDuplicateClient(
// 					{
// 						client: client1,
// 						username: username1,
// 						nbDuplicate: 2,
// 					},
// 					[
// 						createOutgoingAction('join', {
// 							...player,
// 							sessionID: expect.any(String) as unknown as string,
// 							roomsState,
// 						}),
// 						createOutgoingAction('join', {
// 							...player,
// 							sessionID: expect.any(String) as unknown as string,
// 							roomsState,
// 						}),
// 					],
// 				);

// 				// client1 = datasClients[0].clients[0];
// 				// console.error('client1', client1);
// 				// client1.connect();
// 				// await testSeveralOutgoingEvents(client1, createIncomingAction('undefined', undefined), [
// 				// 	createOutgoingAction('join', {
// 				// 		...player,
// 				// 		sessionID: expect.any(String) as unknown as string,
// 				// 		roomsState,
// 				// 	}),
// 				// ]);
// 			},
// 			destroyTimer * 2 + 1000,
// 		);
// 	});

// 	describe('disconnect all clients', () => {
// 		test(
// 			'disconnect',
// 			(done) => {
// 				try {
// 					console.log('disconnect all clients');
// 					disconnectAllClients(done);
// 				} catch (e) {
// 					console.error(e);
// 					done(e);
// 				}
// 			},
// 			destroyTimer + 1000,
// 		);
// 	});
// });