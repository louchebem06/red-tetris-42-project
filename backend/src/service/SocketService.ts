import { Server, Socket } from 'socket.io';

export default class SocketService {
	private io: Server;
	/**
	 * Constructor function for creating an instance of the class.
	 *
	 * @param {Server} server - The server object.
	 */
	public constructor(server: Server) {
		this.io = server;
	}

	/**
	 * Emits an event to a socket.
	 *
	 * @param {Socket} socket - The socket to emit the event to.
	 * @param {string} event - The name of the event to emit.
	 * @param {unknown} [data] - Optional data to send along with the event.
	 * @return {void}
	 */
	public emitToSocket(socket: Socket, event: string, data?: unknown): void {
		socket.emit(event, data);
	}

	/**
	 * Sends an event with optional data to a specific socket in a private room.
	 *
	 * @param {Socket} socket - The socket to send the event to.
	 * @param {string} dstId - The ID of the destination private room.
	 * @param {string} event - The name of the event to emit.
	 * @param {unknown} [data] - Optional data to send with the event.
	 * @return {void}
	 */
	public emitToPrivateSocket(socket: Socket, dstId: string, event: string, data?: unknown): void {
		socket.to(dstId).emit(event, data);
	}

	/**
	 * Sends a broadcast message to all clients in a specified room.
	 *
	 * @param {string} room - The name of the room.
	 * @param {string} event - The name of the event to emit.
	 * @param {unknown} data - The data to send with the event.
	 * @return {void} This function does not return a value.
	 */
	public broadcastToRoom(room: string, event: string, data: unknown): void {
		this.io.to(room).emit(event, data);
	}

	/**
	 * Broadcasts an event and data to all connected clients.
	 *
	 * @param {string} event - The name of the event to broadcast.
	 * @param {unknown} data - The data to be sent along with the event.
	 * @return {void} This function does not return anything.
	 */
	public broadcastToAll(event: string, data: unknown): void {
		this.io.emit(event, data);
	}

	/**
	 * Disconnects the given socket.
	 *
	 * @param {Socket} socket - The socket to disconnect.
	 * @return {void} This function does not return a value.
	 */
	public disconnectSocket(socket: Socket): void {
		socket.disconnect();
	}

	/**
	 * Creates a new room with the specified name.
	 *
	 * @param {string} roomName - The name of the room to create.
	 * @return {void} This function does not return a value.
	 */
	public createRoom(roomName: string): void {
		this.io.sockets.adapter.rooms.set(roomName, new Set());
	}

	/**
	 * Joins a socket to a room.
	 *
	 * @param {Socket} socket - The socket to join the room.
	 * @param {string} roomName - The name of the room to join.
	 * @return {void} This function does not return a value.
	 */
	public joinRoom(socket: Socket, roomName: string): void {
		socket.join(roomName);
	}

	/**
	 * Leaves a room for a given socket.
	 *
	 * @param {Socket} socket - The socket to leave the room.
	 * @param {string} roomName - The name of the room to leave.
	 * @return {void} This function does not return a value.
	 */
	public leaveRoom(socket: Socket, roomName: string): void {
		socket.leave(roomName);
	}

	/**
	 * Returns the rooms available in the current socket.io server.
	 *
	 * @return {Map<string, Set<string>>} The map containing the available rooms,
	 * where the keys are the room names and the values are sets of socket IDs
	 * belonging to that room.
	 */
	public get rooms(): Map<string, Set<string>> {
		return this.io.sockets.adapter.rooms;
	}

	/**
	 * Returns the Map object containing all connected socket IDs grouped by namespace.
	 *
	 * @return {Map<string, Set<string>>} The Map object where the keys are namespace names
	 * and the values are Set objects containing the socket IDs connected to that namespace.
	 */
	public get sids(): Map<string, Set<string>> {
		return this.io.sockets.adapter.sids;
	}

	/**
	 * Method to attach a callback to handle any event on the socket.
	 *
	 * @param {Socket} socket - The socket object.
	 * @param {(event: string, data: unknown) => void} callback -
	 * The callback function to be executed when an event occurs.
	 * @return {void} This function does not return a value.
	 */
	public onAny(socket: Socket, callback: (event: string, data: unknown) => void): void {
		socket.onAny(callback);
	}
}
