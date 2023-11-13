export default interface ICltToSrvEvts {
	error(message: string): void;
	createRoom: (roomName: string) => void;
	joinRoom: (roomName: string) => void;
	leaveRoom: (roomName: string) => void;
	getRooms: () => void;
	changeUsername: (username: string) => void;
	getRoom: (roomName: string) => void;
	getRoomsPlayer: () => void;
}
