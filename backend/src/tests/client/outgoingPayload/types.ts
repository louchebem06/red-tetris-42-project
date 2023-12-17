import IPlayerJSON from '../../../interface/IPlayerJSON';
import IPlayerPayload from '../../../interface/IPlayerPayload';
import IRoomJSON from '../../../interface/IRoomJSON';
import IRoomPayload from '../../../interface/IRoomPayload';
import IGameStartPayload from '../../../interface/IGameStartPayload';
import { IMessageOutgoingPayload } from '../../../interface/IMessagePayload';
import { IncomingActionPayloadMap } from '../incomingPayload/types';

type OutgoingActionPayloadMap = {
	join: IPlayerJSON;
	playerChange: IPlayerPayload;
	getRooms: IRoomJSON[];
	getRoomsPlayer: IRoomJSON[];
	roomChange: IRoomPayload;
	roomOpened: IRoomPayload;
	roomClosed: IRoomPayload;
	roomInfo: IRoomJSON;
	message: IMessageOutgoingPayload;
	error: string;
	gameStart: IGameStartPayload;
};

// linter qui rale
type OAPM = OutgoingActionPayloadMap;

type OutgoingAction<T extends keyof OAPM> = {
	event: T;
	payload: OAPM[T];
};

// abstraction du callaback a utiliser dans l'event écouté
// ex: OutgoingActionCallback['join] => (payload: OutgoingActionPayloadMap['join']) => void
// ce qui "traduit", donne: IPlayerJSON => (payload: IPlayerJSON) => void
type OutgoingActionCallback<T extends keyof OAPM> = (payload: OAPM[T]) => void;

type OutgoingHandlerData<T extends keyof OAPM> = {
	resolve: (payload: OAPM[T] | PromiseLike<OAPM[T]>) => void;
	sessionId?: string;
	data?: IncomingActionPayloadMap[keyof IncomingActionPayloadMap];
};

type OutgoingPayloadFactory<T extends keyof OAPM> = (settings: Partial<OAPM[T]>) => OAPM[T];

export {
	OutgoingActionPayloadMap,
	OAPM,
	OutgoingAction,
	OutgoingActionCallback,
	OutgoingHandlerData,
	OutgoingPayloadFactory,
};
