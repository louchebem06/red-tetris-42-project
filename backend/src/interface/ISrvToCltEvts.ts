import IPlayerJSON from './IPlayerJSON';
import IRoomJSON from './IRoomJSON';
import IRoomPayload from './IRoomPayload';

export interface IIncomingPayload {
	player: IPlayerJSON;
	rooms: string[];
}

export type JSONPayload = IRoomPayload | IPlayerJSON | IRoomJSON | JSON;
export type Payload = JSONPayload | string | string[] | IIncomingPayload;

export default interface ISrvToCltEvts {
	// emits by the server
	join: (data: IIncomingPayload) => void;
	getRooms: (rooms: string[]) => void;
	leaderChange: (message: string) => void;
	roomChange: (payload: IRoomPayload) => void;
	roomOpened: (room: IRoomJSON) => void;
	roomClosed: (room: IRoomJSON) => void;
	winner: (message: string) => void;
	error: (message: string) => void;
}
