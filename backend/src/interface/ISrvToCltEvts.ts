import IPlayerJSON from './IPlayerJSON';
import IRoomJSON from './IRoomJSON';
import IRoomPayload from './IRoomPayload';

export type JSONPayload = IRoomPayload | IPlayerJSON | IRoomJSON | IRoomJSON[] | JSON;
export type Payload = JSONPayload | string | string[];

export default interface ISrvToCltEvts {
	// emits by the server
	join: (player: IPlayerJSON) => void;
	playerChange: (player: IPlayerJSON) => void;
	getRooms: (rooms: IRoomJSON[]) => void;
	getRoomsPlayer: (rooms: IRoomJSON[]) => void;
	leaderChange: (message: string) => void;
	roomChange: (payload: IRoomPayload) => void;
	roomOpened: (room: IRoomJSON) => void;
	roomClosed: (room: IRoomJSON) => void;
	roomInfo: (room: IRoomJSON) => void;
	winner: (message: string) => void;
	error: (message: string) => void;
}
