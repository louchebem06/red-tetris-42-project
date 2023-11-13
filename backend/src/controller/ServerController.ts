import { Server, Socket } from 'socket.io';
import PlayerController from '../controller/PlayerController';
import RoomController from '../controller/RoomController';
import ServerService from '../service/ServerService';
import Player from '../model/Player';

export default class ServerController {
	private _pc: PlayerController;
	private _rc: RoomController;
	private _io: Server;
	private _ss: ServerService;

	public constructor(io: Server) {
		this._io = io;

		this._ss = new ServerService(this._io);
		this._pc = new PlayerController(this._ss);
		this._rc = new RoomController(this._ss);

		this.updateInternals = this.updateInternals.bind(this);
		this.sendRooms = this.sendRooms.bind(this);

		this.use(this._rc.catchState);
		this.use(this._pc.catchSessionDatas);
		this.use(this._pc.log);
		this.use(this._rc.log);
		this._io.on('connection', (socket: Socket) => {
			const player = socket.data.player;
			const sessionID = player?.sessionID;
			player.connected = true;

			this._pc.startSession(socket, sessionID);
			this._ss.log();
			socket.emit('join', player.toJSON());

			socket.onAny((event, ...args) => {
				console.log('EVENT', event);
				this.updateInternals(socket);
				switch (event) {
					case 'createRoom':
						this.createRoom(args[0], socket);
						break;

					case 'joinRoom':
						this.joinRoom(args[0], socket);
						break;

					case 'leaveRoom':
						this.leaveRoom(args[0], socket);
						break;

					case 'getRooms':
						this.sendRooms(socket);
						break;

					case 'getRoom':
						this.sendRoom(args[0], socket);
						break;

					case 'getRoomsPlayer':
						this.getRoomsPlayer(socket);
						break;

					case 'changeUsername':
						this.changeUsername(args[0], socket);
						break;

					default:
						this.sendError(sessionID, `[EVENT NOT HANDLED]: ${event} ${args}`);
						console.log('[EVENT NOT HANDLED]:', event, args);
						break;
				}
				this.updateSocketData(socket, player);
				this._ss.log();
				this._pc.log(socket, () => {});
				this._rc.log(socket, () => {});
			});

			socket.on('disconnect', () => {
				this.updateInternals(socket);
				this._pc.getPlayerById(sessionID).then((player: Player) => {
					player.connected = false;
					this._pc.savePlayer(sessionID, player);
					this._pc.log(socket, () => {});
					this._rc.log(socket, () => {});
					this._ss.log();
					console.log(`[DISCONNECTED] - ${player.username} ${sessionID}`);
				});
			});
		});
	}

	public use(middleware: (socket: Socket, next: (err?: Error) => void) => void): void {
		this._io.use(middleware);
	}

	private updateSocketData(socket: Socket, player: Player): void {
		socket.data = {
			player: player,
			playerController: this._pc,
			roomController: this._rc,
		};
	}

	private updateInternals(socket: Socket): void {
		this._rc = socket.data.roomController;
		if (socket.data.playerController) {
			this._pc = socket.data.playerController;
		}
		this._pc.getPlayerById(socket.data.player?.sessionID).then((player: Player) => {
			this._pc.savePlayer(player.sessionID, socket.data.player);
			this._pc.catchRoomControllerState(this._rc);
		});
	}

	public sendError(sid: string, message: string): void {
		this._ss.emit(sid, 'error', message);
	}

	public sendRooms(socket: Socket): void {
		const player = socket.data.player;
		const sid = player?.sessionID;
		try {
			this._rc.sendRooms(sid);
		} catch (e) {
			this.sendError(sid, `${(<Error>e).message}`);
		}
	}

	public sendRoom(name: string, socket: Socket): void {
		const player = socket.data.player;
		const sid = player?.sessionID;
		try {
			this._rc.sendRoom(name, sid);
		} catch (e) {
			this.sendError(sid, `${(<Error>e).message}`);
		}
	}

	public getRoomsPlayer(socket: Socket): void {
		try {
			this._pc.sendRoomsPlayer(socket);
		} catch (e) {
			this.sendError(socket.data.player?.sessionID, `${(<Error>e).message}`);
		}
	}

	public changeUsername(username: string, socket: Socket): void {
		try {
			this._pc.changeUsername(username, socket);
		} catch (e) {
			this.sendError(socket.data.player?.sessionID, `${(<Error>e).message}`);
		}
	}

	public createRoom(name: string, socket: Socket): void {
		const player = socket.data.player;
		const sessionID = player?.sessionID;
		try {
			this._rc.create(name, player);
			this._pc.catchRoomControllerState(this._rc);
		} catch (e) {
			this.sendError(sessionID, `${(<Error>e).message}`);
		}
	}

	public joinRoom(name: string, socket: Socket): void {
		const player = socket.data.player;
		const sessionID = player?.sessionID;
		try {
			this._rc.join(name, player);
			this._pc.catchRoomControllerState(this._rc);
		} catch (e) {
			this.sendError(sessionID, `${(<Error>e).message}`);
		}
	}

	public leaveRoom(name: string, socket: Socket): void {
		const player = socket.data.player;
		const sessionID = player?.sessionID;
		try {
			this._rc.leave(name, player);
			this._pc.catchRoomControllerState(this._rc);
		} catch (e) {
			this.sendError(sessionID, `${(<Error>e).message}`);
		}
	}
}
