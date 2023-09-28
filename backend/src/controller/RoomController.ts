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
	 * Creates a room with the given name.
	 *
	 * @param {string} roomName - The name of the room to be created.
	 * @return {void} This function does not return a value.
	 */
	public handleCreateRoom(roomName: string, player: Player): void {
		this.createRoom(roomName, player);
	}

	/**
	 * Check if there is room with a given name in the array of rooms.
	 *
	 * @param {string} roomName - The name of the room to check for.
	 * @return {boolean} Returns true if a room with the given name
	 * is found in the array, otherwise returns false.
	 */
	private hasRoomInArray(roomName: string): boolean {
		return this._rooms.some((room) => {
			return room.name === roomName;
		});
	}

	/**
	 * Retrieves a room object from the array of rooms based on the provided room name.
	 *
	 * @param {string} roomName - The name of the room to search for.
	 * @return {Room} The room object matching the provided room name,
	 * or undefined if no match is found.
	 */
	private getRoomInArray(roomName: string): Room {
		return this._rooms.filter((room) => {
			return room.name === roomName;
		})[0];
	}

	/**
	 * Creates a new room with the given name and player.
	 *
	 * @param {string} roomName - The name of the room to create.
	 * @param {Player} player - The player object to add to the room.
	 * @return {void} This function does not return a value.
	 */
	private createRoom(roomName: string, player: Player): void {
		if (this.isAvailable(roomName)) {
			if (roomName.length < 3) {
				throw new Error(`Room name must be at least 3 characters long`);
			}
			const room = new Room(roomName, player);
			this._rooms.push(room);
			this.roomService.createRoom(room.name);
			// console.log(`la room a creer existe?`, room, this._rooms);
		} else {
			throw new Error(`You cannot create ${roomName}: this room already exists`);
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
			if (this.hasRoom(roomName) && this.hasRoomInArray(roomName)) {
				const room = this.getRoomInArray(roomName);
				if (!room.hasPlayer(player)) {
					room.addPlayer(player);
					this.roomService.joinRoom(socket, roomName);
					// console.log(`la room a join existe?`, room, this._rooms);
				} else {
					throw new Error(`player ${player.username} already in room ${room.name}`);
				}
			}
		} catch (e) {
			throw new Error(`RoomController: join room: ${e instanceof Error && e.message}`);
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
			if (this.hasRoom(roomName) && this.hasRoomInArray(roomName)) {
				const room = this.getRoomInArray(roomName);
				if (room.hasPlayer(player)) {
					room.removePlayer(player);
					this.roomService.leaveRoom(socket, roomName);
					// ? Comment on transmet le winner
					if (room.winner) {
						console.log(`Le winner du game est ${room.winner.username}`);
					}
					if (room.totalPlayers === 0) {
						// this.roomService.deleteRoom(room.name);
						this._rooms.splice(this._rooms.indexOf(room), 1);
					}
					// console.log(`la room a leave existe?`, room, this._rooms);
					// est ce qu'on remove la room ou on la met dans un historique?
					// de toute facon faudra recup les stats du game et les enregistrer
					// et ce sera ici qu'il faudra le faire
				} else {
					throw new Error(`player ${player.username} not in room ${room.name}`);
				}
			} else {
				throw new Error(`room ${roomName} not found`);
			}
		} catch (e) {
			throw new Error(`RoomController: ${e instanceof Error && e.message}`);
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
	 * Determines whether a room is private or not.
	 *
	 * @param {string} roomName - The name of the room.
	 * @return {boolean} True if the room is private, false otherwise.
	 */
	public isPrivate(roomName: string): boolean {
		return this.roomService.isPrivateRooms(roomName);
	}

	/**
	 * Checks if a room is available.
	 *
	 * @param {string} roomName - The name of the room.
	 * @return {boolean} Returns true if the room is available, false otherwise.
	 */
	public isAvailable(roomName: string): boolean {
		return !this.roomService.hasRoom(roomName);
	}

	public hasRoom(roomName: string): boolean {
		return this.roomService.hasRoom(roomName);
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
