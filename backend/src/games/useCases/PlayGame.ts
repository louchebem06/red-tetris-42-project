import Room from '../../rooms/Room';
import Player from '../../players/Player';
import { GameCommand } from './GameCommand';
import { TypeAction } from '../GameLogic';

export class PlayGameCommand extends GameCommand {
	public constructor(
		protected room: Room,
		protected player: Player,
		protected action: TypeAction,
	) {
		super(room);
	}

	public execute(): void {
		try {
			const room = this.room;
			const player = this.player;
			const sid = player.sessionID;
			const started = room.gameState;
			const game = room.game;
			const gamers = game?.gamers;
			const username = player.username;
			const hasPlayer = room.has(sid);
			const isInGame = gamers?.includes(player) ?? false;
			const action = this.action;
			if (hasPlayer && started && game && isInGame) {
				game.play(player, action);
			} else {
				const errMsg = `PlayGameCommand: player ${username}(${sid}) 
in room ${room.name}: ${hasPlayer}
game started: ${started}
is in game: ${isInGame}`;
				throw new Error(errMsg);
			}
		} catch (e) {
			throw new Error((<Error>e).message);
		}
	}
}
