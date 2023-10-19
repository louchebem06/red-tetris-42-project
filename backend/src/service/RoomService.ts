import { Server, Socket } from 'socket.io';
import SocketService from './SocketService';

// Gere les operations liees aux salles
export default class RoomService {
	private socketService: SocketService;

	/**
	 * Constructs a new instance of the class.
	 *
	 * @param {Server} io - The server instance.
	 */
	public constructor(io: Server) {
		this.socketService = new SocketService(io);
	}

	/**
	 * Creates a new room with the given name (available in the server).
	 *
	 * @param {string} roomName - The name of the room to be created.
	 * @return {void} This function does not return a value.
	 */
	public createRoom(roomName: string): void {
		this.socketService.createRoom(roomName);
		console.log('all rooms', this.getAllRooms());
		console.log('public rooms', this.getRooms());
		console.log('private rooms', this.getPrivateRooms());
	}

	public joinRoom(socket: Socket, roomName: string): void {
		this.socketService.joinRoom(socket, roomName);
	}

	/**
	 * Leave a room.
	 * Specific to a socket
	 *
	 * @param {Socket} socket - The socket to leave the room.
	 * @param {string} roomName - The name of the room to leave.
	 * @throws {Error} If the room is private or does not exist.
	 */
	public leaveRoom(socket: Socket, roomName: string): void {
		this.socketService.leaveRoom(socket, roomName);
	}

	public alertRoom(room: string, event: string, data: unknown): void {
		this.socketService.broadcastToRoom(room, event, data);
	}

	public alertAll(event: string, data: unknown): void {
		this.socketService.broadcastToAll(event, data);
	}

	public alertRoomButSelf(socket: Socket, room: string, event: string, data: unknown): void {
		this.socketService.brdcstRoomButSender(socket, room, event, data);
	}

	public alertPlayer(socket: Socket, event: string, data: unknown): void {
		this.socketService.emitToSocket(socket, event, data);
	}

	/**
	 * Returns an array of rooms by filtering out private rooms.
	 * All the "public" rooms of the server are returned.
	 *
	 * @return {string[]} An array of room names.
	 */
	public getRooms(): string[] {
		return [...this.getAllRooms()].filter((val) => ![...this.getPrivateRooms()].includes(val));
	}

	/**
	 * Returns an iterable iterator that contains the keys
	 * of all the rooms in the socket.io server. (publics and privates)
	 *
	 * @return {IterableIterator<string>} An iterable iterator that contains
	 * the keys of all the rooms.
	 */
	public getAllRooms(): IterableIterator<string> {
		return this.socketService.rooms.keys();
	}

	/**
	 * Returns an iterable iterator of all private rooms on the server.
	 * A private room is the socket id of a player connected to the server
	 * cf Socket.io documentation
	 *
	 * @return {IterableIterator<string>} An iterable iterator of private rooms.
	 */
	public getPrivateRooms(): IterableIterator<string> {
		return this.socketService.sids.keys();
	}

	public getPlayerSocket(id: string): Socket {
		return this.socketService.getSocket(id);
	}
}
