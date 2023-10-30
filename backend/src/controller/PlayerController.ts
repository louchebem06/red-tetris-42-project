import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import PlayerStore from '../store/PlayerStore';
import Player from '../model/Player';
import ServerService from '../service/ServerService';
import RoomController from './RoomController';
import Room from '../model/Room';

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

	public startSession(socket: Socket, sessionID: string): void {
		this._ss.startSession(socket, sessionID);
		this.savePlayer(sessionID, socket.data.player);
	}

	public log(socket: Socket, next: (err?: Error) => void): void {
		const total = this.playerStore.total;
		const current = this.playerStore.get(socket.data.player?.sessionID);
		const s = total > 1 ? 's' : '';
		let username = current?.username || `NEW ${socket.handshake.auth.username}`;
		username += ` - Socket communication`;
		const log = `\n\x1b[34m[${username}]\x1b[0m
\x1b[4m(currently registered: ${total} player${s})\x1b[0m\n`;
		console.log(log);
		this.all().forEach((player) => {
			player.log();
		});
		console.log(`\x1b[34m============================================================\x1b[0m`);

		next();
	}

	public catchRoomControllerState(roomController: RoomController): void {
		roomController.players.forEach((player) => {
			this.savePlayer(player.sessionID, player);
		});
	}

	public catchSessionDatas(socket: Socket, next: (err?: Error) => void): void {
		this.getPlayerById(socket.handshake.auth.sessionID)
			.then((session) => {
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
				console.log('[NO SESSION]', err.message);

				const username = socket.handshake.auth.username;
				if (!username) {
					return next(new Error('invalid username'));
				}
				// create new session
				socket.data.player = new Player(username, uuidv4());
				next();
			});
	}

	public all(): Player[] {
		return this.playerStore.all;
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
	public savePlayer(sessionID: string, player: Player): void {
		this.playerStore.save(sessionID, player);
	}
}

export default PlayerController;
