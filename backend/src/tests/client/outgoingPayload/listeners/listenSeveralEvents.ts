import { IncomingActionPayloadMap as IAPM, IncomingAction } from '../../incomingPayload/types';
import { Socket } from 'socket.io-client';
import { OEvent, OPayload, OutgoingActionCallback } from '..';
import { datasClients, updateDatasClients } from '../../utils/creation';
import { isTypeOfUndefined } from '../../../../base/typeGuards';
import {
	outgoingGameStartRejectHandler,
	outgoingPlayerChangeRejectHandler,
	outgoingRoomChangeRejectHandler,
	outgoingRoomClosedRejectHandler,
	outgoingRoomOpenedRejectHandler,
} from '../handlers';

export async function listenSeveralEvents<U extends keyof IAPM>(
	client: Socket,
	events: OEvent[],
	emit: IncomingAction<U> | undefined,
	config?: {
		name: string; // il peut arriver, que les types ne permettent pas de
		//faire un test sur le nom de la room via emit.payload,
		// on peut alors mettre le nom de la room ici
		toWatch: string[]; // tab de sockets ids a surveiller:
		// ex le client veut ecouter si le client2 fait bien une action "collective",
		//on met le socket id du client 2 dans ce tableau, sinon on laisse le tableau vide
	},
): Promise<Array<OPayload<OEvent>>> {
	return await new Promise<Array<OPayload<OEvent>>>((resolve, reject) => {
		const payloads: Array<OPayload<OEvent>> = [];

		// trouve dans datasClients la sessionID du client
		// const data = datasClients.find((d) => d.clients.some((cl) => cl.id === client.id));

		// trouve dans datasClients le session id du/des clients watched, sinon du client

		const clientsToCheck = config && config?.toWatch.length > 0 ? config.toWatch : [client.id];
		const data = datasClients.find((d) => d.clients.some((cl) => clientsToCheck.includes(cl.id)));

		let sid = events[0] !== 'join' ? data?.sessionID : '';

		if (events.includes('join')) {
			client.connect();
		}

		const name = !isTypeOfUndefined(emit?.payload) ? emit?.payload : !isTypeOfUndefined(config) ? config?.name : '';

		events.forEach((event) => {
			const eventListener: OutgoingActionCallback<OEvent> = (payload: OPayload<typeof event>) => {
				switch (event) {
					case 'join':
						// recup sessionid
						sid = (<OPayload<typeof event>>payload).sessionID;
						updateDatasClients(client, sid);
						client.off('join');
						// console.error(datasClients);
						break;
					case 'playerChange':
						// console.error(event, config, emit, client, payload, datasClients);
						// console.error(payload.player.roomsState);
						outgoingPlayerChangeRejectHandler({ resolve: reject, sessionId: sid })(payload);
						// reason surveillée == payload.reason
						// check les diff raisons
						break;
					case 'getRooms':
						break;
					case 'getRoomsPlayer':
						// sessionId surveillé == payload.player.sessionId
						break;
					case 'roomInfo':
						// nom de room surveillé == payload.room.name
						if ((<OPayload<typeof event>>payload).name !== name) {
							console.error(event, config, emit, client, payload);
							reject(payload);
						}
						break;
					case 'error':
						break;
					case 'message':
						// sessionId surveillé == payload.player.sessionId
						// nom de room surveillé == payload.room.name
						// if (
						// 	(<OPayload<typeof event>>payload).receiver
						// !== sid || <OPayload<typeof event>>payload.receiver !== emit?.payload.receiver
						// ) {
						// 	reject(payload);
						// }
						break;
					case 'roomOpened':
						// nom de room surveillé == payload.room.name
						outgoingRoomOpenedRejectHandler({ resolve: reject, data: name })(payload);
						break;
					case 'roomChange':
						// nom de room surveillé == payload.room.name
						// reason surveillée == payload.reason
						outgoingRoomChangeRejectHandler({ resolve: reject, data: name })(payload);

						break;
					case 'roomClosed':
						// nom de room surveillé == payload.room.name
						outgoingRoomClosedRejectHandler({ resolve: reject, data: name })(payload);
						break;
					case 'gameStart':
						console.error(event, config, emit, client, payload, datasClients);
						// nom de room surveillé == payload.room.name
						// client.off('gameStart');
						outgoingGameStartRejectHandler({ resolve: reject, data: name })(payload);
						// if ((<OPayload<typeof event>>payload).roomName !== name) {
						// 	reject(payload);
						// }
						// reason surveillée == payload.reason

						break;
					default:
						break;
				}
				payloads.push(payload);
				if (payloads.length === events.length) {
					// console.error(
					// 	datasClients,
					// 	payloads,
					// 	events,
					// 	emit,
					// 	config,
					// 	event,
					// 	client.id,
					// 	sid,
					// 	payloads.length,
					// 	events.length,
					// );
					resolve(payloads);
				}
			};
			client.on(event, eventListener);
		});
		client.on('error', (message) => {
			reject(message);
		});
		if (!isTypeOfUndefined(emit) && !isTypeOfUndefined(emit?.event) && emit?.event !== 'undefined') {
			client.emit(emit.event, emit?.payload);
		}
	});
}
