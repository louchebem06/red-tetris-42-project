import { Socket } from 'socket.io';

import Player from '../model/Player';

import { Payload } from '../type/PayloadsTypes';
import { State as CoState } from '../type/PlayerConnectionState';
import { IMIP } from '../type/PayloadsTypes';
import { IMOP } from '../type/PayloadsTypes';

import IRoomJSON from '../interface/IRoomJSON';

import ServerService from '../service/ServerService';
import { PC } from './PlayerController';
import { RC } from './RoomController';
import { sessionController } from './SessionController';
import { logger } from './LogController';

export default class SocketController {
	public constructor(
		private socket: Socket,
		private io: ServerService,
		pc: PC,
		rc: RC,
	) {
		this.disconnect = this.disconnect.bind(this);
		this.error = this.error.bind(this);
		this.message = this.message.bind(this);
		this.ready = this.ready.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.leaveRoom = this.leaveRoom.bind(this);
		this.getRoom = this.getRoom.bind(this);
		this.getRooms = this.getRooms.bind(this);
		this.getRoomsPlayer = this.getRoomsPlayer.bind(this);
		this.changeUsername = this.changeUsername.bind(this);
		this.emitError = this.emitError.bind(this);
		this.emit = this.emit.bind(this);
		this.on = this.on.bind(this);

		try {
			this.on('disconnect', this.disconnect(pc));
			this.on('message', this.message(pc, rc));
			this.on('ready', this.ready(pc, rc));
			this.on('createRoom', this.createRoom(pc, rc));
			this.on('joinRoom', this.joinRoom(pc, rc));
			this.on('leaveRoom', this.leaveRoom(pc, rc));
			this.on('getRoom', this.getRoom(rc));
			this.on('getRooms', this.getRooms(rc));
			this.on('getRoomsPlayer', this.getRoomsPlayer(pc, rc));
			this.on('changeUsername', this.changeUsername(pc, rc));
			this.on('error', this.error);

			this.socket.onAny((event, ...args) => {
				const player = this.socket.data.player;
				const sid = player?.sessionID;
				const u = player?.username;
				const _sid = this.socket.id;
				let log = `\x1b[34m[${u}, ${sid} (socket: ${_sid}) - ${event}]\x1b[0m\n`;
				let llog = `[${u}, ${sid} (socket: ${_sid}) - ${event}]\n`;
				llog += `received arguments: ${JSON.stringify(args)}\n`;
				log += `\x1b[4mreceived arguments: ${JSON.stringify(args)}\x1b[0m\n`;
				logger.log(llog);
				console.log(log);

				pc.log(this.socket, () => void {});
				rc.log(this.socket, () => void {});
				this.io.log();
				sessionController.log();
			});
		} catch (e) {
			this.emitError(`${(<Error>e).message}`);
		}
	}

	public on<T extends Payload>(e: string, cb: (p: T) => void): void {
		this.socket.on(e, cb);
	}

	private emit(e: string, p: Payload): void {
		this.socket.emit(e, p);
	}

	public join(): void {
		const player: Player = this.socket.data.player;
		const sid = player.sessionID;
		if (!player.connected) {
			player.connected = true;
		}
		let playerState: CoState = 'new';
		if (sessionController.hasSession(sid)) {
			playerState = 'reconnected';
		}
		this.emit('join', <Payload>player.toJSON());
		this.io.broadcast({
			event: 'playerChange',
			data: {
				reason: `${playerState} player`,
				player: player.toJSON(),
			} as Payload,
			sid: sid,
		});
	}

	public error(message: string): void {
		console.log(`Receiving client error: ${message}`);
	}

	public disconnect(pc: PC): (reason: string) => void {
		return (reason: string) => {
			this.socket.data.player.connected = false;
			pc.savePlayer(this.socket.data.player.sessionID, this.socket.data.player);
			sessionController.disconnectSocket(this.socket.data.player.sessionID, this.socket);
			this.io.broadcast({
				event: 'playerChange',
				data: {
					reason: `${reason} player`,
					player: this.socket.data.player.toJSON(),
				},
			});
		};
	}

	public message(pc: PC, rc: RC): (datas: IMIP) => void {
		return (datas: IMIP): void => {
			const payload: IMOP = {
				date: new Date(),
				message: datas.message,
				emitter: this.socket.data.player,
				receiver: undefined,
			};

			try {
				if (datas.receiver === this.socket.data.player.sessionID) {
					// mp perso -> perso
					payload.receiver = this.socket.data.player.toJSON();
				} else if (pc.hasPlayer(datas.receiver)) {
					// mp player -> player
					payload.receiver = pc.getPlayerByIdJSON(datas.receiver);
				} else if (rc.hasRoom(datas.receiver)) {
					// mp player -> room
					payload.receiver = rc.getRoomJSON(datas.receiver);
				}
				if (!payload.receiver) {
					throw new Error('receiver not found');
				}
				this.io.forwardMessage(payload, datas.receiver);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public ready(pc: PC, rc: RC): (room: string) => void {
		return (room: string): void => {
			try {
				if (rc.hasRoom(room)) {
					const player = pc.changeRoomStatus('ready', room, this.socket);
					rc.updatePlayer(room, player);
					this.io.broadcast({
						event: 'playerChange',
						data: {
							reason: 'ready',
							player: player.toJSON(),
						} as Payload,
						sid: '',
						room: room,
					});
					this.socket.data.player = player;
					sessionController.update(player.sessionID, this.socket);
					sessionController.log();
				}
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public createRoom(pc: PC, rc: RC): (name: string) => void {
		return (name: string): void => {
			try {
				rc.create(name, this.socket.data.player);
				pc.catchRoomControllerState(rc);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public joinRoom(pc: PC, rc: RC): (name: string) => void {
		return (name: string): void => {
			try {
				rc.join(name, this.socket.data.player);
				pc.catchRoomControllerState(rc);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}
	public leaveRoom(pc: PC, rc: RC): (name: string) => void {
		return (name: string): void => {
			try {
				rc.leave(name, this.socket.data.player);
				pc.catchRoomControllerState(rc);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}
	public getRooms(rc: RC): () => void {
		return (): void => {
			try {
				rc.sendRooms(this.socket.data.player.sessionID);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public getRoom(rc: RC): (name: string) => void {
		return (name: string): void => {
			try {
				rc.sendRoom(name, this.socket.data.player.sessionID);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public getRoomsPlayer(pc: PC, rc: RC): () => void {
		return (): void => {
			try {
				pc.getPlayerById(this.socket.data.player.sessionID)
					.then((player) => {
						const rooms = rc.getRoomsWithPlayer(player);
						const roomsJSON = rooms.map((room) => room.toJSON());
						this.io.emit(player.sessionID, 'getRoomsPlayer', roomsJSON as IRoomJSON[]);
						this.socket.data.player = player;
						sessionController.update(player.sessionID, this.socket);
					})
					.catch((e) => {
						this.emitError(`${(<Error>e).message}`);
					});
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public changeUsername(pc: PC, rc: RC): (username: string) => void {
		return (username: string): void => {
			try {
				const player = pc.changeUsername(username, this.socket);
				rc.updateRoomsWithPlayer(player);
				this.io.emit(player.sessionID, 'playerChange', {
					reason: 'change username',
					player: player.toJSON(),
				} as Payload);
				this.socket.data.player = player;
				sessionController.update(player.sessionID, this.socket);
			} catch (e) {
				this.emitError(`${(<Error>e).message}`);
			}
		};
	}

	public emitError(message: string): void {
		const sid = this.socket.data.player?.sessionID;
		this.io.emit(sid, 'error', message);
	}
}
