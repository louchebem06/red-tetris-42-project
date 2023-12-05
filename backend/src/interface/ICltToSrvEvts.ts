import { IMessageIncomingPayload } from './IMessagePayload';

export default interface ICltToSrvEvts {
	error(message: string): void;
	message(payload: IMessageIncomingPayload): void;
	ready(roomName: string): void;
	createRoom: (roomName: string) => void;
	joinRoom: (roomName: string) => void;
	leaveRoom: (roomName: string) => void;
	startGame: (roomName: string) => void;
	getRooms: () => void;
	changeUsername: (username: string) => void;
	getRoom: (roomName: string) => void;
	getRoomsPlayer: () => void;
}
