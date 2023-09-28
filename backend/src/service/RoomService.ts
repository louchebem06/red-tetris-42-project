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
		if (!this.hasRoom(roomName)) {
			this.socketService.createRoom(roomName);
		}
		console.log('all rooms', this.getAllRooms());
		console.log('public rooms', this.getRooms());
		console.log('private rooms', this.getPrivateRooms());
	}

	/**
	 * Check if the given room exists in the server.
	 *
	 * @param {string} roomName - The name of the room to check.
	 * @return {boolean} Whether the room exists or not.
	 */
	public hasRoom(roomName: string): boolean {
		return this.socketService.rooms.has(roomName);
	}

	/**
	 * Joins a socket to a room.
	 * Specific to a socket
	 *
	 * @param {Socket} socket - The socket to join the room.
	 * @param {string} roomName - The name of the room to join.
	 * @throws {Error} If the room is private.
	 * @throws {Error} If the room does not exist.
	 * @return {void}
	 */
	public joinRoom(socket: Socket, roomName: string): void {
		if (this.isPrivateRooms(roomName)) {
			throw new Error(`RoomService: ${roomName} is a private room`);
		} else if (!this.hasRoom(roomName)) {
			throw new Error(`RoomService: ${roomName} does not exist. You cannot join it`);
		} else {
			this.socketService.joinRoom(socket, roomName);
		}
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
		if (this.hasRoom(roomName) && !this.isPrivateRooms(roomName)) {
			this.socketService.leaveRoom(socket, roomName);
		} else {
			throw new Error(`RoomService: You cannot leave ${roomName} room.`);
		}
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

	/**
	 * Determines if the given room name corresponds to a private room.
	 * It can be annoying to join a room if this one is a player!
	 *
	 * @param {string} roomName - The name of the room to check.
	 * @return {boolean} Returns true if the room is a private room, false otherwise.
	 */
	public isPrivateRooms(roomName: string): boolean {
		return this.socketService.sids.has(roomName);
	}
}
