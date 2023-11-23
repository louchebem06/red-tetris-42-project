import { Server, Socket } from 'socket.io';

import PlayerController from '../controller/PlayerController';
import RoomController from '../controller/RoomController';
import { sessionController } from './SessionController';
import ServerService from '../service/ServerService';

import SocketController from './SocketController';

export default class ServerController {
	private _pc: PlayerController;
	private _rc: RoomController;
	private _io: Server;
	private _ss: ServerService;

	public constructor(io: Server) {
		this._io = io;

		this._ss = new ServerService(this._io);
		this._pc = new PlayerController();
		this._rc = new RoomController(this._ss);

		this.use(sessionController.startSession(this._pc, this._rc));
		this.use(this._pc.log);
		this.use(this._rc.log);
		this._io.on('connection', (socket: Socket) => {
			try {
				const mySocket = new SocketController(socket, this._ss, this._pc, this._rc);
				mySocket.join();
			} catch (e) {
				console.log('ca bubble la', (<Error>e).message);
				// throw new Error(`${(<Error>e).message}`);
			}
		});
	}

	public use(middleware: (socket: Socket, next: (err?: Error) => void) => void): void {
		this._io.use(middleware);
	}
}
