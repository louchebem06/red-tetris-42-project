import {
	ISrvToCltPayload,
	IPlayerPayload,
	IRoomPayload,
	IMIP,
	IMOP,
	IGameStartPayload,
} from '../../eventsIO/payloads/types/IPayload';
import Player from '../../players/Player';

interface ISocketData {
	player: Player;
}

interface ISocketAuth {
	username: string;
	sessionId?: string;
}

interface IInterSrvEvts {
	error: (error: Error) => void;
	ping: () => void;
}

interface ISrvToCltEvts {
	// emits by the server
	join: (player: ISrvToCltPayload) => void;
	playerChange: (payload: IPlayerPayload) => void;
	getRooms: (rooms: ISrvToCltPayload[]) => void;
	getRoomsPlayer: (rooms: ISrvToCltPayload[]) => void;
	roomChange: (payload: IRoomPayload) => void;
	roomOpened: (payload: IRoomPayload) => void;
	roomClosed: (payload: IRoomPayload) => void;
	roomInfo: (room: ISrvToCltPayload) => void;
	message: (payload: IMOP) => void;
	error: (message: string) => void;
	gameStart: (payload: IGameStartPayload) => void;
}

interface ICltToSrvEvts {
	error(message: string): void;
	message(payload: IMIP): void;
	ready(roomName: string): void;
	createRoom: (roomName: string) => void;
	joinRoom: (roomName: string) => void;
	leaveRoom: (roomName: string) => void;
	startGame: (roomName: string) => void;
	getRooms: () => void;
	changeUsername: (username: string) => void;
	getRoom: (roomName: string) => void;
	getRoomsPlayer: () => void;
	disconnect: (reason: string) => void;
}

export { ISrvToCltEvts, ISocketData, ICltToSrvEvts, IInterSrvEvts, ISocketAuth };
