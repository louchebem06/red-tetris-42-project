import { Socket } from 'socket.io';

import { logger } from './LogController';
import Player from '../model/Player';
import PlayerStore from '../store/PlayerStore';
import RoomController from './RoomController';

import IPlayerJSON from '../interface/IPlayerJSON';
import { State as RoomState } from '../type/PlayerWaitingRoomState';

class PlayerController {
	private playerStore: PlayerStore = new PlayerStore();

	public constructor() {
		this.getPlayerById = this.getPlayerById.bind(this);
		this.all = this.all.bind(this);
		this.savePlayer = this.savePlayer.bind(this);
		this.log = this.log.bind(this);
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

	public changeUsername(username: string, socket: Socket): Player {
		const player = socket.data.player;
		const sid = player?.sessionID;
		try {
			if (player.username !== username) {
				player.username = username;
				this.savePlayer(sid, player);
			}
			return player;
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public changeRoomStatus(state: RoomState, room: string, socket: Socket): Player {
		const player = socket.data.player;
		const sid = player?.sessionID;

		try {
			if (state === 'ready' || state === 'idle') {
				player.toggleReady(room);
			} else {
				player.setRoomStatus(room, state);
			}
			this.savePlayer(sid, player);
			return player;
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public catchRoomControllerState(roomController: RoomController): void {
		roomController.players.forEach((player) => {
			this.savePlayer(player.sessionID, player);
		});
	}

	public log(socket: Socket, next: (err?: Error) => void): void {
		const total = this.playerStore.total;
		const s = total > 1 ? 's' : '';
		const llog = `\n[playercontroller]: (currently registered: ${total} player${s})\n`;
		const log = `\n\x1b[34m[playercontroller]\x1b[0m
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
export type PC = PlayerController;
