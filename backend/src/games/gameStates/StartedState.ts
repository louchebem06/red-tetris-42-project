import Player from '../../players/Player';
import { FinishedState } from '.';
// import { IStatePlayer, PlayerGame, TypeAction } from '../../games/GameLogic';
import { TypeAction } from '../../games/GameLogic';
import { AGameState } from './AGameState';
import { logger } from '../../infra';

// function debugPlayerGame(playerGame: PlayerGame): string {
// 	return `level: ${playerGame?.getLevel()},
// score: ${playerGame?.getScore()},
// map:
// ${playerGame
// 	?.getMap()
// 	?.render()
// 	?.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join(''))
// 	.join('|\n')}|`;
// }

// function debugIStatePlayer(state: IStatePlayer): string {
// 	return `level: ${state.level},
// score: ${state.score},
// nextPiece:
// ${state.nextPiece.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|
// map:
// ${state.map.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|`;
// }

export class StartedState extends AGameState {
	public start(): void {
		throw new Error(`Game ${this.game?.id} already started`);
	}

	public play(player: Player, action: TypeAction): void {
		const id = this.game?.id;
		try {
			const playerGame = this.logic?.endGame(player.sessionID);

			if (!playerGame?.getEndGame()) {
				this.logic?.action(player.sessionID, action);
			} else {
				this.game?.removePlayer(player, playerGame);
			}

			const log = `Player ${player.username} (${player.sessionID}) \
game ${this.game?.id} status: ${playerGame?.getEndGame() ? 'ended' : 'not ended'} [${action}]
`;
			logger.logContext(log, `Play {StartedState}: Game ${id}`);
		} catch (error) {
			throw new Error(`${(<Error>error).message}`);
		}
	}

	public finish(): void {
		if (this.game && this.service) {
			this.game.transitionTo(new FinishedState());
			this.game.release();
			this.clear();
			const self = this.service?.self();
			if (self && self.size > 0) this.service?.finish();

			const log = `Game ${this.game.id}: finish \nwinner:${JSON.stringify(this.game.winner)}`;
			logger.logContext(log, `finish game`, log);
		}
	}
}
