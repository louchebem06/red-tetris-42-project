import { logger } from '../../infra';
import { TypeAction } from '../GameLogic';
import Player from '../../players/Player';
import { AGameState } from './AGameState';
import { StartedState } from '.';

export class CreatedState extends AGameState {
	// Le jeu demarre dans cette classe, c'est ici qu'il faut spammer update pour les joueurs
	public start(): void {
		const id = this.game?.id;
		try {
			if (this.game) {
				this.game.transitionTo(new StartedState());
				let log = `Start {CreatedState}: Game ${id} transition to StartedState\n`;

				// ajout des joueurs dans la logique
				this.game.gamers.forEach((gamer: Player) => {
					log += `add gamer: ${JSON.stringify(gamer)}\n`;
					this.logic?.addPlayer(gamer);
				});
				logger.logContext(log, `Start {CreatedState}: Game ${id}`, log);

				// TODO: le jeu est ici est spam ici (via gameLogic.update)
				this.update();
			}
		} catch (error) {
			const log = `Start {CreatedState}: Game ${id} failed ${(error as Error).message}`;
			logger.logContext(log, `error starting game`, log);
			throw error;
		}
	}

	public play(player: Player, action: TypeAction): void {
		throw new Error(
			`Play {CreatedState}: Game ${this.game?.id} not started [${action}]: ${JSON.stringify(player)}`,
		);
	}

	public stop(): void {
		throw new Error(`Stop {CreatedState}: Game ${this.game?.id} not started`);
	}

	public finish(): void {
		throw new Error(`Finish {CreatedState}: Game ${this.game?.id} not started`);
	}
}
