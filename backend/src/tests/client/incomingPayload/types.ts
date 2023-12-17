import { IMessageIncomingPayload as IMIP } from '../../../interface/IMessagePayload';

type IncomingActionPayloadMap = {
	error: string;
	message: IMIP;
	ready: string;
	createRoom: string;
	joinRoom: string;
	leaveRoom: string;
	startGame: string;
	getRooms: never;
	changeUsername: string;
	getRoom: string;
	getRoomsPlayer: never;
	undefined: undefined;
};

type IncomingAction<T extends keyof IncomingActionPayloadMap> = {
	event: T;
	payload: IncomingActionPayloadMap[T];
};

export { IncomingActionPayloadMap, IncomingAction };
