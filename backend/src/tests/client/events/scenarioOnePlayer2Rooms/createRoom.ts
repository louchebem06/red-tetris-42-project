import { createGames } from '../../../game/utils/creation';
import {
	IPlayerJSON,
	IRoomJSON,
	IRoomState,
	Socket,
	createIncomingAction,
	createOutgoingAction,
	sessionId,
	testOutgoingEventWithIncomingAct,
} from '..';

export async function createdRoomToBeOpened(data: {
	client: Socket;
	roomName: string;
	playerExpect: IPlayerJSON;
	roomExpect: IRoomJSON;
}): Promise<void> {
	const { client, roomName, playerExpect, roomExpect } = data;

	roomExpect.name = roomName;
	if (roomExpect.games) {
		roomExpect.games[0].id = roomName;
	}
	const player = {
		...playerExpect,
		sessionID: sessionId,
		leads: [roomName],
	};
	roomExpect.leader = player;

	await testOutgoingEventWithIncomingAct({
		client,
		toSend: createIncomingAction('createRoom', roomName),
		expected: createOutgoingAction('roomOpened', {
			room: {
				...roomExpect,
			},
			player,
		}),
	});
}

export async function createdRoomToBeChanged(data: {
	client: Socket;
	roomName: string;
	roomName2: string;
	playerExpect: IPlayerJSON;
	roomExpect: IRoomJSON;
}): Promise<void> {
	const { client, roomName, roomName2, playerExpect, roomExpect } = data;

	roomExpect.name = roomName2;
	if (roomExpect.games) {
		roomExpect.games[0].id = roomName2;
	}
	const player = {
		...playerExpect,
		sessionID: sessionId,
		leads: [roomName, roomName2],
	};
	roomExpect.leader = player;

	await testOutgoingEventWithIncomingAct({
		client: client as Socket,
		toSend: createIncomingAction('createRoom', roomName2),
		expected: createOutgoingAction('roomChange', {
			reason: 'new leader',
			room: {
				...roomExpect,
			},
			player,
		}),
	});
}

export async function createdRoomToBeClosedNobodyIn(data: {
	client: Socket;
	roomName: string;
	roomName2: string;
	playerExpect: IPlayerJSON;
	roomExpect: IRoomJSON;
	roomsState: IRoomState[];
}): Promise<void> {
	const { client, roomName, roomName2, playerExpect, roomExpect, roomsState } = data;
	const player = {
		...playerExpect,
		sessionID: sessionId,
		leads: [roomName, roomName2, roomName + 'Closed'],
		roomsState,
		username: 'allEventsChangeUsername',
	};
	const games = createGames([{ id: roomName + 'Closed' }]);
	await testOutgoingEventWithIncomingAct({
		client,
		toSend: createIncomingAction('createRoom', roomName + 'Closed'),
		expected: createOutgoingAction('roomClosed', {
			room: {
				...roomExpect,
				name: roomName + 'Closed',
				leader: player,
				players: [],
				totalPlayers: 0,
				games,
			},
			player,
		}),
	}).catch((e) => {
		console.error(e);
	});
}
