import { Socket, Server } from 'socket.io';
import RoomService from '../service/RoomService';
import Player from '../model/Player';
import Room from '../model/Room';

// TODO Repercuter les updates sur les players dans le controller principal (dans le serveur http)
export default class RoomController {
	private roomService: RoomService;
	private _rooms: Room[] = [];

	/**
	 * Creates a new instance of the class.
	 * @constructor
	 * @param {Server} io - The server object used for socket.io functionality.
	 */
	public constructor(io: Server) {
		this.roomService = new RoomService(io);
	}

	/**
	 * Retrieves a room object from the array of rooms based on the provided room name.
	 *
	 * @param {string} roomName - The name of the room to search for.
	 * @return {Room} The room object matching the provided room name,
	 * or undefined if no match is found.
	 */
	private getRoom(roomName: string): Room {
		const room = this._rooms.find((room) => {
			return room.name === roomName;
		});

		if (!room) {
			throw new Error(`Room ${roomName} not found`);
		}
		return room;
	}

	/**
	 * Creates a new room with the given name and player.
	 *
	 * @param {string} roomName - The name of the room to create.
	 * @param {Player} player - The player object to add to the room.
	 * @return {void} This function does not return a value.
	 */
	public handleCreateRoom(roomName: string, player: Player): void {
		try {
			const room = new Room(roomName, player, this.roomService);
			this._rooms.push(room);
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	/**
	 * Handles joining a room.
	 *
	 * @param {string} roomName - The name of the room to join.
	 * @return {void} This function does not return anything.
	 */
	public handleJoinRoom(socket: Socket, roomName: string, player: Player): void {
		try {
			const room = this.getRoom(roomName);
			room.addPlayer(socket, player);
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	/**
	 * Handles the event of leaving a room.
	 *
	 * @param {string} roomName - The name of the room to leave.
	 * @return {void} This function does not return anything.
	 */
	public handleLeaveRoom(socket: Socket, roomName: string, player: Player): void {
		try {
			const room = this.getRoom(roomName);
			room.removePlayer(socket, player);
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	/**
	 * Retrieves the list of rooms.
	 *
	 * @return {string[]} The array of room names.
	 */
	public getRooms(): string[] {
		return this.roomService.getRooms();
	}

	/**
	 * Retrieves an array of all rooms.
	 *
	 * @return {string[]} An array of all rooms.
	 */
	public getAllRooms(): string[] {
		return [...this.roomService.getAllRooms()];
	}

	/**
	 * Retrieves an array of private rooms.
	 *
	 * @return {string[]} An array of private room names.
	 */
	public getPrivateRooms(): string[] {
		return [...this.roomService.getPrivateRooms()];
	}

	/**
	 * Prune the room service.
	 *
	 * @param {void} - This function does not take any parameters.
	 * @return {void} - This function does not return a value.
	 */
	public prune(): void {
		this._rooms = [];
	}
}
