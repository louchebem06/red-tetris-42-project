import IPlayerJSON from './IPlayerJSON';
import IPlayerPayload from './IPlayerPayload';
import IRoomJSON from './IRoomJSON';
import IRoomPayload from './IRoomPayload';

export type JSONPayload = IRoomPayload | IPlayerJSON | IRoomJSON | IRoomJSON[] | JSON;
export type Payload = JSONPayload | string | string[] | IPlayerPayload;

export default interface ISrvToCltEvts {
	// emits by the server
	join: (player: IPlayerJSON) => void;
	playerChange: (payload: IPlayerPayload) => void;
	getRooms: (rooms: IRoomJSON[]) => void;
	getRoomsPlayer: (rooms: IRoomJSON[]) => void;
	roomChange: (payload: IRoomPayload) => void;
	roomOpened: (payload: IRoomPayload) => void;
	roomClosed: (payload: IRoomPayload) => void;
	roomInfo: (room: IRoomJSON) => void;
	error: (message: string) => void;
}
