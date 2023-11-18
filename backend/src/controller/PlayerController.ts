import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './LogController';
import Player from '../model/Player';
import Room from '../model/Room';
import PlayerStore from '../store/PlayerStore';
import ServerService from '../service/ServerService';
import RoomController from './RoomController';

import IRoomJSON from '../interface/IRoomJSON';
import IPlayerJSON from '../interface/IPlayerJSON';
import { State } from '../type/PlayerConnectionState';

class PlayerController {
	private playerStore: PlayerStore = new PlayerStore();
	private _ss: ServerService;

	public constructor(serverService: ServerService) {
		this._ss = serverService;

		this.catchSessionDatas = this.catchSessionDatas.bind(this);
		this.getPlayerById = this.getPlayerById.bind(this);
		this.all = this.all.bind(this);
		this.savePlayer = this.savePlayer.bind(this);
		this.startSession = this.startSession.bind(this);
		this.log = this.log.bind(this);
	}

	public startSession(socket: Socket, sessionID: string): State {
		let state: State = 'new';
		if (this._ss.sessions.has(sessionID)) {
			state = 'reconnected';
		}
		this._ss.setSession(socket, sessionID);
		this.savePlayer(sessionID, socket.data.player);
		return state;
	}

	public updateSession(socket: Socket, sid: string): void {
		try {
			this._ss.updateSession(socket, sid);
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public getPlayerById(sessionID: string): Promise<Player> {
		return new Promise<Player>((resolve, reject) => {
			const player = this.playerStore.get(sessionID);
			if (player) {
				resolve(player);
			}
			reject(new Error(`Player ${sessionID} not found`));
		});
	}

	public hasPlayer(sessionID: string): boolean {
		return this.playerStore.get(sessionID) ? true : false;
	}

	public getPlayerByIdJSON(sessionID: string): IPlayerJSON {
		return this.playerStore.get(sessionID)?.toJSON() as IPlayerJSON;
	}

	public getPlayersByUsernames(username: string): Player[] {
		return this.playerStore.all.filter((p) => p.username.includes(username));
	}

	public savePlayer(sessionID: string, player: Player): void {
		this.playerStore.save(sessionID, player);
	}

	public all(): Player[] {
		return this.playerStore.all;
	}

	public deletePlayer(sessionID: string): void {
		this._ss.deleteSession(sessionID).then(() => {
			const pl = this.playerStore.get(sessionID);
			if (pl) {
				pl.sessionID = `FREE-${pl.username}-${sessionID}`;
				this.savePlayer(pl.sessionID, pl);
				this.playerStore.delete(sessionID);
			}
		});
	}

	public changeUsername(username: string, socket: Socket): void {
		const player = socket.data.player;
		const sid = player?.sessionID;
		try {
			if (player.username !== username) {
				player.username = username;
				this.savePlayer(sid, player);
				this.updateSession(socket, sid);
				socket.data.roomController.updateRoomsWithPlayer(player);
				this._ss.emit(sid, 'playerChange', {
					reason: 'change username',
					player: player.toJSON(),
				});
			}
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public sendRoomsPlayer(socket: Socket): void {
		const player = socket.data.player;
		const sid = player?.sessionID;
		const rc = socket.data.roomController;
		try {
			const rooms = rc.getRoomsWithPlayer(player);
			const roomsJSON: IRoomJSON[] = rooms.map((room: Room) => room.toJSON());
			this._ss.emit(sid, 'getRoomsPlayer', roomsJSON);
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public catchRoomControllerState(roomController: RoomController): void {
		roomController.players.forEach((player) => {
			this.savePlayer(player.sessionID, player);
		});
	}

	public catchSessionDatas(socket: Socket, next: (err?: Error) => void): void {
		logger.logSocketIO(socket);
		console.log('[SESSION DATA] - handshake', socket.handshake);
		this.getPlayerById(socket.handshake.auth.sessionID)
			.then((session) => {
				logger.log(`[SESSION] - ${JSON.stringify(session)}`);
				console.log('[SESSION]', session);
				this.catchRoomControllerState(socket.data.roomController);
				socket.data.playerController = this;
				session.connected = true;
				socket.data.player = session;

				socket.data.roomController.rooms.forEach((room: Room) => {
					if (room.players.includes(session)) {
						socket.join(room.name);
					}
				});
				return next();
			})
			.catch((err) => {
				logger.log(`[NO SESSION] - ${JSON.stringify(err)}`);
				console.log('[NO SESSION]', err.message);

				const username = socket.handshake.auth.username;
				if (!username) {
					return next(new Error('invalid username'));
				}

				// const pls = this.getPlayersByUsernames(username);
				// const player = pls?.find((p) => p.sessionID.includes(`FREE - ${p.username}`));
				// if (player) {
				// 	this.playerStore.delete(player.sessionID);
				// 	player.username = username;
				// 	player.sessionID = uuidv4();
				// 	socket.data.player = player;
				// } else {
				// create new session
				socket.data.player = new Player(username, uuidv4());
				// }
				next();
			});
	}

	public log(socket: Socket, next: (err?: Error) => void): void {
		const total = this.playerStore.total;
		const current = this.playerStore.get(socket.data.player?.sessionID);
		const s = total > 1 ? 's' : '';
		let username = current?.username || `NEW ${socket.handshake.auth.username}`;
		username += ` - Socket communication`;
		const llog = `\n[${username}]
(currently registered: ${total} player${s})\n`;
		const log = `\n\x1b[34m[${username}]\x1b[0m
\x1b[4m(currently registered: ${total} player${s})\x1b[0m\n`;
		console.log(log);
		logger.log(llog);
		this.all().forEach((player) => {
			player.log();
		});
		logger.log(`============================================================`);
		console.log(`\x1b[34m============================================================\x1b[0m`);

		next();
	}
}

export default PlayerController;
