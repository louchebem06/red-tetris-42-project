import { Server, Socket } from 'socket.io';
import PlayerController from '../controller/PlayerController';
import SocketController from '../controller/SocketController';
import RoomController from '../controller/RoomController';

class ServerSocket {
	private io: Server;
	private socketController?: SocketController;
	private roomController: RoomController;

	/**
	 * Constructs a new instance of the class.
	 *
	 * @param {Server} server - The server object.
	 * @param {PlayerController} pc - The player controller object.
	 */
	public constructor(server: Server, pc: PlayerController) {
		this.io = server;
		this.roomController = new RoomController(this.io);
		this.setupSocketEvents(pc);
	}

	/**
	 * Sets up socket events for the player controller.
	 *
	 * @param {PlayerController} pc - The player controller object.
	 * @return {void} This function does not return any value.
	 */
	private setupSocketEvents(pc: PlayerController): void {
		this.io.on('connection', (socket: Socket) => {
			this.socketController = new SocketController(socket, pc, this.roomController, this.io);
		});
	}
}

export default ServerSocket;
