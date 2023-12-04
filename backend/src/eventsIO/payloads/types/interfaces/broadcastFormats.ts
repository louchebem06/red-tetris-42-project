import { IGameStartPayload } from './games';
import { IMIP, IMOP } from './messages';
import { IPlayerJSON, IPlayerPayload } from './players';
import { IRoomJSON, IRoomPayload } from './rooms';

type IncomingActionPayloadMap = {
	error: (reason: string) => void;
	message: (datas: IMIP) => void;
	ready: (room: string) => void;
	createRoom: (room: string) => void;
	joinRoom: (room: string) => void;
	leaveRoom: (room: string) => void;
	gameStart: (room: string) => void;
	getRooms: () => void;
	changeUsername: (username: string) => void;
	getRoom: (room: string) => void;
	getRoomsPlayer: () => void;
	disconnect: (reason: string) => void;
};

type IAPM = IncomingActionPayloadMap;
type IncomingAction<T extends keyof IAPM> = {
	event: T;
	callback: IAPM[T];
};

type OutgoingActionPayloadMap = {
	join: IPlayerJSON;
	playerChange: IPlayerPayload;
	getRooms: IRoomJSON[];
	getRoomsPlayer: IRoomJSON[];
	roomChange: IRoomPayload;
	roomOpened: IRoomPayload;
	roomClosed: IRoomPayload;
	roomInfo: IRoomJSON;
	message: IMOP;
	error: string;
	gameStart: IGameStartPayload;
};

type OAPM = OutgoingActionPayloadMap;
interface IBrodacastFormat {
	event: keyof OAPM;
	data: OAPM[keyof OAPM];
	sid?: string;
	room?: string;
}

export { IAPM, IncomingAction, OAPM, IBrodacastFormat };
