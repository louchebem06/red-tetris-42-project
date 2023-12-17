import {
	OAPM, //OutgoingActionPayloadMap
	OutgoingActionCallback,
	OutgoingHandlerData,
} from './types';

// id unique du client (pas trop d'autres choix que de le mettre ici)
let sessionId: string;
const outgoingJoinHandler =
	<T extends keyof OAPM>(data: OutgoingHandlerData<T>): OutgoingActionCallback<T> =>
	(payload) => {
		if ((<OAPM['join']>payload).sessionID !== data.sessionId) {
			sessionId = (<OAPM['join']>payload).sessionID;
			data.resolve(payload);
		}
	};

const outgoingPlayerChangeHandler =
	<T extends keyof OAPM>(data: OutgoingHandlerData<T>): OutgoingActionCallback<T> =>
	(payload) => {
		if ((<OAPM['playerChange']>payload).player.sessionID === data.sessionId) {
			data.resolve(payload);
		}
	};

const outgoingRoomChangeHandler =
	<T extends keyof OAPM>(data: OutgoingHandlerData<T>): OutgoingActionCallback<T> =>
	(payload) => {
		if ((<OAPM['roomChange']>payload).room.name === data.data) {
			data.resolve(payload);
		}
	};

// gestionnaire generique pour combler les tests pas encore montés a virer une fois tout defini
const outgoingBasicHandler =
	<T extends keyof OAPM>(data: OutgoingHandlerData<T>): OutgoingActionCallback<T> =>
	(payload) => {
		// console.error('outgoingBasicHandler', payload);
		data.resolve(payload);
	};

export { outgoingJoinHandler, outgoingPlayerChangeHandler, outgoingRoomChangeHandler, outgoingBasicHandler, sessionId };
