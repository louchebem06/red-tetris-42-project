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
}

export async function createdRoomToBeChanged(data: {
	client: Socket;
	roomName: string;
	roomName2: string;
	playerExpect: IPlayerJSON;
	roomExpect: IRoomJSON;
}): Promise<void> {
	const { client, roomName, roomName2, playerExpect, roomExpect } = data;

	const player = {
		...playerExpect,
		sessionID: sessionId,
		leads: [roomName, roomName2],
	};

	await testOutgoingEventWithIncomingAct({
		client: client as Socket,
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
	await testOutgoingEventWithIncomingAct({
		client,
		toSend: createIncomingAction('createRoom', roomName + 'Closed'),
		expected: createOutgoingAction('roomClosed', {
			room: {
				...roomExpect,
				name: roomName + 'Closed',
				leader: player,
			},
			player,
		}),
	}).catch((e) => {
		console.error(e);
	});
}
