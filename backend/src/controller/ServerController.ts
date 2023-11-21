import { Server, Socket } from 'socket.io';

import { logger } from './LogController';
import Player from '../model/Player';
import PlayerController from '../controller/PlayerController';
import RoomController from '../controller/RoomController';
import ServerService from '../service/ServerService';

import { IMessageIncomingPayload, IMessageOutgoingPayload } from '../interface/IMessagePayload';
import { Payload } from '../type/PayloadsTypes';

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
		this.forwardMessage = this.forwardMessage.bind(this);

		this.use(this._rc.catchState);
		this.use(this._pc.catchSessionDatas);
		this.use(this._pc.log);
		this.use(this._rc.log);
		this._io.on('connection', (socket: Socket) => {
			logger.logSocketIO(socket);
			const player = socket.data.player;
			const sessionID = player?.sessionID;
			player.connected = true;

			const playerState = this._pc.startSession(socket, sessionID);
			this._ss.log();
			socket.emit('join', player.toJSON());
			this._ss.broadcast({
				event: 'playerChange',
				data: {
					reason: `${playerState} player`,
					player: player.toJSON(),
				},
				sid: sessionID,
			});

			socket.onAny((event, ...args) => {
				logger.log(`EVENT: ${event} ${JSON.stringify(args)} * ${socket.id}`);
				console.log('EVENT', event);
				this.updateInternals(socket);
				try {
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

						case 'message':
							this.forwardMessage(args[0], socket);
							break;

						case 'ready':
							this.setPlayerReady(args[0], socket);
							break;

						default:
							const _args = `${JSON.stringify(args)} * ${socket.id}`;
							logger.log(`[EVENT NOT HANDLED]: ${event} ${_args}`);
							this.sendError(sessionID, `[EVENT NOT HANDLED]: ${event} ${args}`);
							console.log('[EVENT NOT HANDLED]:', event, args);
							break;
					}
				} catch (e) {
					this.sendError(sessionID, `${(<Error>e).message}`);
				}
				this.updateSocketData(socket, player);
				this._ss.log();
				this._pc.log(socket, () => {});
				this._rc.log(socket, () => {});
			});

			socket.on('disconnecting', () => {
				logger.logSocketIO(socket);
			});

			socket.on('disconnect', async (reason) => {
				this.updateInternals(socket);

				const player = await this._pc.getPlayerById(sessionID);
				let _reason = '';
				if (player) {
					player.connected = false;
					if (reason.includes(`transport`) || reason.includes(`ping timeout`)) {
						_reason = `disconnected`;
						this._pc.savePlayer(sessionID, player);
					} else if (reason.includes('server') || reason.includes('client')) {
						_reason = `disconnected`;
						this._pc.savePlayer(sessionID, player);
						// _reason = `leaving server`;
						// this._pc.deletePlayer(sessionID);
					}
					this._ss.broadcast({
						event: 'playerChange',
						data: {
							reason: `${_reason} player`,
							player: player.toJSON(),
						} as Payload,
					});
				}
				this._pc.log(socket, () => {});
				this._rc.log(socket, () => {});
				this._ss.log();
				let msg = `[DISCONNECTED] - (${reason}) ${player.username}`;
				msg += ` * ${sessionID} * ${socket.id}`;
				logger.log(msg);
				console.log(msg);
				// const handle = setInterval(() => {
				// 	logger.log(`La socket a été deconnecté depuis 5000 ms`);
				// 	console.log(`La socket a été deconnecté depuis 5000 ms`, socket.connected);
				// 	testInterval(socket);
				// 	clearInterval(handle);
				// }, 10000);
			});

			// const testInterval = async (socket: Socket): Promise<void> => {
			// 	return await new Promise((resolve) => {
			// 		logger.log(`[TEST INTERVAL] - ${socket.id}`);
			// 		logger.logSocketIO(socket);
			// 		resolve();
			// 	});
			// };

			// const interval = setInterval(() => {
			// 	console.log('interval declenché au bout de 5000 ms');
			// 	testInterval(socket);
			// 	clearInterval(interval);
			// }, 5000);
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

	public setPlayerReady(sid: string, socket: Socket): void {
		try {
			if (this._rc.hasRoom(sid)) {
				this._pc.changeRoomStatus('ready', sid, socket);
			}
		} catch (e) {
			this.sendError(sid, `${(<Error>e).message}`);
		}
	}
	public forwardMessage(datas: IMessageIncomingPayload, socket: Socket): void {
		const player = socket.data.player;
		const sid = player?.sessionID;
		const payload: IMessageOutgoingPayload = {
			date: new Date(),
			message: datas.message,
			emitter: player,
			receiver: undefined,
		};
		try {
			if (datas.receiver === sid) {
				// mp perso -> perso
				payload.receiver = player.toJSON();
			} else if (this._pc.hasPlayer(datas.receiver)) {
				// mp player -> player
				payload.receiver = this._pc.getPlayerByIdJSON(datas.receiver);
			} else if (this._rc.hasRoom(datas.receiver)) {
				// mp player -> room
				payload.receiver = this._rc.getRoomJSON(datas.receiver);
			}
			if (!payload.receiver) {
				throw new Error('receiver not found');
			}
			this._ss.forwardMessage(payload, datas.receiver);
		} catch (e) {
			this.sendError(sid, `${(<Error>e).message}`);
		}
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
