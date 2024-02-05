import { Server } from 'socket.io';
import { ServerService } from '../infra/io';
import Game from './Game';
import { TetriminosArrayType } from './tetriminos/tetriminos.interface';
import Player from '../players/Player';
import { logger } from '../infra';
import { IStatePlayer } from './GameLogic';

export type Pieces = TetriminosArrayType;
export type GameRoomAction = 'join' | 'leave';

export class GameService extends ServerService {
	public constructor(
		protected game: Game,
		protected io: Server,
	) {
		super(io);

		// creation d'une room sur le serveur
		this.createRoom(this.game.id);

		const log = `GameRoom ${this.game.id} created on server`;
		logger.logContext(log, `creation game room`, log);

		// ajout des joueurs dans la room
		this.game.gamers.forEach((gamer) => {
			this.setGamer(gamer, 'join');
		});
	}

	public self(): Set<string> | undefined {
		return this.getRoom(this.game.id);
	}

	private setGamer(player: Player, action: GameRoomAction): void {
		// ajout du joueur dans la room
		// TODO: verif le player state?
		const username = player.username;
		const id = this.game.id;
		const sid = player.sessionID;
		try {
			const log = `GameRoom ${id} ${username}(${sid}): ${action}`;
			logger.logContext(log, `gameservice ${id}: setgamer ${username}`, log);
			this.changeRoom(player.sessionID, this.game.id, action);
		} catch (error) {
			const log = `Error: GameRoom ${id} ${username}(${sid}): ${action} failed ${(error as Error).message}`;
			logger.logContext(log, `ERROR: gameservice ${id}: setgamer ${username}`, log);
			throw error;
		}
	}

	public leave(player: Player): void {
		// player quitte la room
		this.setGamer(player, 'leave');
	}

	// arreter la game -> fin de la partie
	public finish(): void {
		this.game.gamers.forEach((gamer) => {
			this.leave(gamer);
		});
		logger.log(`GameRoom ${this.game.id} finished`);
	}

	// game publish generique a la room
	public publish(data: IStatePlayer): void {
		const id = this.game.id;
		try {
			this.broadcast({
				event: 'gameChange',
				data,
				room: this.game.id,
			});
			const log = `GameRoom ${id} publish ${JSON.stringify(data)}`;
			logger.logContext(log, `gameservice ${id}: publish gameChange`, log);
		} catch (error) {
			const log = `Error: GameRoom ${id} publish failed ${(error as Error).message}
datas: ${JSON.stringify(data)}`;
			logger.logContext(log, `ERROR: gameservice ${id}: publish `, log);
			throw error;
		}
	}

	// emet gameChange a un player en particulier
	public emitStatePlayer(data: IStatePlayer, playerOrSid: Player | string): void {
		const id = this.game.id;
		try {
			let sid: string;
			if (typeof playerOrSid === 'string') {
				sid = playerOrSid;
			} else {
				sid = playerOrSid.sessionID;
			}
			this.emit(sid, 'gameChange', data);

			const { level, score, map, nextPiece } = data;
			const log = `GameRoom ${id} emitStatePlayer player: ${JSON.stringify(playerOrSid)}
level: ${level}, 
score: ${score},
nextPiece:
${nextPiece.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|
map:
${map.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}| 
`;
			logger.logContext(log, `gameservice ${id}: emitStatePlayer gameChange`);
		} catch (error) {
			const log = `Error: GameRoom ${id} publish failed ${(error as Error).message}`;
			logger.logContext(log, `ERROR: gameservice ${id}: emitStatePlayer `, log);
			throw error;
		}
	}
}
