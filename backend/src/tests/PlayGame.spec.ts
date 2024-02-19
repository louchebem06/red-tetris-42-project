import { Socket } from 'socket.io-client';

import { expect } from '@jest/globals';
import { handleAppLifeCycle } from './app/handlers';
import { clientConfig, config } from './utils/configs';
import { destroyTimer } from './utils/env';
import {
	createClient,
	createIncomingAction,
	createOutgoingAction,
	createPlayer,
	createRoomState,
} from './client/events';
import { testSeveralOutgoingEvents } from './client/outgoingPayload/testers';
import { disconnectAllClients } from './client/utils/creation';
describe('* Disconnect Players State', () => {
	let client1: Socket;
	let client2: Socket;
	let client3: Socket;
	let client4: Socket;

	const username1 = 'First';
	const username2 = 'Second';
	const username3 = 'Third';
	const username4 = 'Fourth';

	const room1 = 'Choupinou';
	const { playerExpect, roomExpect } = clientConfig('First');
	const playerExpect1 = { ...playerExpect, username: username1 };
	const playerExpect2 = { ...playerExpect, username: username2 };
	const playerExpect3 = { ...playerExpect, username: username3 };
	const playerExpect4 = { ...playerExpect, username: username4 };

	roomExpect.name = room1;
	roomExpect.leader = playerExpect1;

	// different states
	const leaderState = createRoomState({
		name: room1,
	});

	const playerState = createRoomState({
		name: room1,
		leads: false,
	});

	// const leaderReadyState = createRoomState({
	// 	name: room1,
	// 	status: 'ready',
	// 	readys: 4,
	// });

	// const playerReadyState = createRoomState({
	// 	name: room1,
	// 	leads: false,
	// 	status: 'ready',
	// 	readys: 4,
	// });

	const leads = [room1];

	// different players
	const player1CreateRoom = {
		...playerExpect1,
		leads,
	};

	// player join form
	const player1Join = {
		...playerExpect1,
		leads,
		roomsState: [leaderState],
	};

	const player2Join = createPlayer({
		username: username2,
		roomsState: [playerState],
	});

	const player3Join = createPlayer({
		username: username3,
		roomsState: [playerState],
	});

	const player4Join = createPlayer({
		username: username4,
		roomsState: [playerState],
	});

	handleAppLifeCycle();

	describe('Create Sockets Clients', () => {
		test(`client ${config(username1).client} should be created`, () => {
			client1 = createClient({ username: username1 });
			expect(client1).toBeInstanceOf(Socket);
			expect(client1).toBeDefined();
			expect(client1).not.toBeNull();
		});

		test(`client ${config(username2).client} should be created`, () => {
			client2 = createClient({ username: username2 });
			expect(client2).toBeInstanceOf(Socket);
			expect(client2).toBeDefined();
			expect(client2).not.toBeNull();
		});

		test(`client ${config(username3).client} should be created`, () => {
			client3 = createClient({ username: username3 });
			expect(client3).toBeInstanceOf(Socket);
			expect(client3).toBeDefined();
			expect(client3).not.toBeNull();
		});

		test(`client ${config(username4).client} should be created`, () => {
			client4 = createClient({ username: username4 });
			expect(client4).toBeInstanceOf(Socket);
			expect(client4).toBeDefined();
			expect(client4).not.toBeNull();
		});
	});

	describe('Connect to Server IO', () => {
		test(`${config(username1).client} join Server\
	, ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
			await testSeveralOutgoingEvents(client1, createIncomingAction('undefined', undefined), [
				createOutgoingAction('join', {
					...playerExpect1,
				}),
			]);
		}, 1000);

		test(`${config(username2).client} join Server\
	, ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
			await testSeveralOutgoingEvents(client2, createIncomingAction('undefined', undefined), [
				createOutgoingAction('join', {
					...playerExpect2,
				}),
			]);
		}, 1000);
	});

	describe('Clients enter room 1', () => {
		test(`${config(username1).client} should create room ${room1} and be leader\
	, ${config('createRoom').eventI} -> [${config('roomOpened').eventO}, ${config('roomChange').eventO}: ${
		config('new leader').eventO
	}] events`, async () => {
			await testSeveralOutgoingEvents(client1, createIncomingAction('createRoom', room1), [
				createOutgoingAction('roomOpened', {
					room: {
						...roomExpect,
						leader: player1CreateRoom,
					},
					player: player1CreateRoom,
				}),
				createOutgoingAction('roomChange', {
					reason: 'new leader',
					room: {
						...roomExpect,
						leader: player1CreateRoom,
					},
					player: player1CreateRoom,
				}),
			]);
		});

		test(`${config(username1).client} should join room ${room1} and be alone inside\
		, ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
			config('player incoming').eventO
		}] events`, async () => {
			await testSeveralOutgoingEvents(client1, createIncomingAction('joinRoom', room1), [
				createOutgoingAction('roomChange', {
					reason: 'player incoming',
					room: {
						...roomExpect,
						players: [player1Join],
						totalPlayers: 1,
						leader: player1Join,
					},
					player: player1Join,
				}),
			]);
		});

		test(`${config(username2).client} should join room ${room1} and be with ${config(username1).client} in\
		, ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
			config('player incoming').eventO
		}] events`, async () => {
			await testSeveralOutgoingEvents(client2, createIncomingAction('joinRoom', room1), [
				createOutgoingAction('roomChange', {
					reason: 'player incoming',
					room: {
						...roomExpect,
						players: [player1Join, player2Join],
						totalPlayers: 2,
						leader: player1Join,
					},
					player: player2Join,
				}),
			]);
		});

		test(`${config(username1).client} should listen ${config(username2).client} joining room ${room1}\
		, ${config('no one').eventI} -> [${config('roomChange').eventO}: ${
			config('player incoming').eventO
		}] events`, async () => {
			await testSeveralOutgoingEvents(
				client1,
				createIncomingAction('undefined', undefined),
				[
					createOutgoingAction('roomChange', {
						reason: 'player incoming',
						room: {
							...roomExpect,
							players: [player1Join, player2Join],
							totalPlayers: 2,
							leader: player1Join,
						},
						player: player2Join,
					}),
				],
				{
					name: room1,
					toWatch: [client2.id ?? ''],
				},
			);
		});
	});

	describe('Connect to Server IO', () => {
		// si je le passe audessus,
		// a la suite logique des autres connexions au serveur de client1 et client2
		// -> le teste ne passe plus du tout: comportement bizarre
		// car ils sont regroupes sous les meme describe en analyse de tests
		test(`${config(username3).client} join Server\
		, ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
			await testSeveralOutgoingEvents(client3, createIncomingAction('undefined', undefined), [
				createOutgoingAction('join', {
					...playerExpect3,
				}),
			]);
		}, 1000);

		test(`${config(username4).client} join Server\
		, ${config('no one').eventI} -> ${config('join').eventO} events`, async () => {
			await testSeveralOutgoingEvents(client4, createIncomingAction('undefined', undefined), [
				createOutgoingAction('join', {
					...playerExpect4,
				}),
			]);
		}, 1000);
	});

	describe('Clients enter room 1', () => {
		test(`${config(username3).client} should join room ${room1} and be alone inside\
		, ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
			config('player incoming').eventO
		}] events`, async () => {
			await testSeveralOutgoingEvents(client3, createIncomingAction('joinRoom', room1), [
				createOutgoingAction('roomChange', {
					reason: 'player incoming',
					room: {
						...roomExpect,
						players: [player1Join, player2Join, player3Join],
						totalPlayers: 3,
						leader: player1Join,
					},
					player: player3Join,
				}),
			]);
		});
	});

	describe('Clients enter room 1', () => {
		test(`${config(username4).client} should join room ${room1} and be with others in\
, ${config('joinRoom').eventI} -> [${config('roomChange').eventO}: ${
			config('player incoming').eventO
		}] events`, (done) => {
			setTimeout(async () => {
				await testSeveralOutgoingEvents(client4, createIncomingAction('joinRoom', room1), [
					createOutgoingAction('roomChange', {
						reason: 'player incoming',
						room: {
							...roomExpect,
							players: [player1Join, player2Join, player3Join, player4Join],
							totalPlayers: 4,
							leader: player1Join,
						},
						player: player4Join,
					}),
				]);
				done();
			}, 500);
		}, 1000);
	});

	describe(`Clients should set as ready`, () => {
		test(`${config(username1).client} should set as ready \
		, ${config('ready').eventI} -> [${config('playerChange').eventO}] events`, (done) => {
			client4.on('playerChange', (payload): void => {
				// console.log(payload);
				if (payload.reason === 'ready' && payload.player.username === username4) {
					setTimeout(() => {
						setTimeout(() => {
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'space', room: room1 });
							client1.emit('gameChange', { action: 'right', room: room1 });
						}, 8000);

						setTimeout(() => {
							client4.emit('gameChange', { action: 'down', room: room1 });
							client4.emit('gameChange', { action: 'left', room: room1 });
							client4.emit('gameChange', { action: 'up', room: room1 });
							client4.emit('gameChange', { action: 'up', room: room1 });
							client4.emit('gameChange', { action: 'up', room: room1 });
							client4.emit('gameChange', { action: 'left', room: room1 });
							client4.emit('gameChange', { action: 'left', room: room1 });
							client4.emit('gameChange', { action: 'up', room: room1 });
							client4.emit('gameChange', { action: 'right', room: room1 });
							client4.emit('gameChange', { action: 'right', room: room1 });
							client4.emit('gameChange', { action: 'right', room: room1 });
							client4.emit('gameChange', { action: 'right', room: room1 });
							client4.emit('gameChange', { action: 'up', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'right', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
							client4.emit('gameChange', { action: 'space', room: room1 });
						}, 8000);

						setTimeout(() => {
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'space', room: room1 });
							client1.emit('gameChange', { action: 'right', room: room1 });
						}, 8000);

						setTimeout(() => {
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'space', room: room1 });
							client1.emit('gameChange', { action: 'right', room: room1 });
						}, 8000);

						setTimeout(() => {
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'down', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'left', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'up', room: room1 });
							client1.emit('gameChange', { action: 'space', room: room1 });
							client1.emit('gameChange', { action: 'right', room: room1 });
						}, 8000);
						setTimeout(() => {
							done();
						}, 75000);
					}, 8000);
				}
			});

			client1.on('gameChange', (payload): void => {
				const { level, score, map, nextPiece } = payload;

				console.error(
					`level: ${level}, 
score: ${score},
nextPiece:
${nextPiece.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|
map:
${map.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|`,
				);
			});

			client4.on('gameChange', (payload): void => {
				const { level, score, map, nextPiece } = payload;

				console.error(
					`level: ${level}, 
score: ${score},
nextPiece:
${nextPiece.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|
map:
${map.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|`,
				);
			});
			client1.emit('ready', room1);
			client2.emit('ready', room1);
			client3.emit('ready', room1);
			client4.emit('ready', room1);
		}, 250000);
	});

	describe('disconnect all clients', () => {
		test(
			'disconnect',
			(done) => {
				try {
					console.log('disconnect all clients');
					disconnectAllClients(done);
				} catch (e) {
					console.error(e);
					done(e);
				}
			},
			destroyTimer + 1000,
		);
	});
});
