import { logger } from '../../infra';
import { FinishedState, StartedState } from '.';
import Player from '../../players/Player';
import { TypeAction } from '../GameLogic';
import { AGameState } from './AGameState';

export class StoppedState extends AGameState {
	public start(): void {
		console.log('Game restarted');
		if (this.game) {
			this.update();
			this.game.transitionTo(new StartedState());
			const log = `Game ${this.game.id}[state: ${this.constructor.name}] started`;
			logger.logContext(log, 'Game Started', log);
		}
	}

	public play(player: Player, action: TypeAction): void {
		throw new Error(`Play [${action}]{StoppedState}: Game ${this.game?.id} not started: ${JSON.stringify(player)}`);
		// console.log('Game not started', player, action);
	}

	public stop(): void {
		throw new Error(`Play {StoppedState}: Game ${this.game?.id} already stopped`);
		// console.log('Game already stopped');
	}

	public finish(): void {
		if (this.game) {
			this.clear();
			this.game.transitionTo(new FinishedState());
			const log = `Game ${this.game.id}[state: ${this.constructor.name}] finished`;
			logger.logContext(log, 'Game Finished', log);
			this.service?.finish();
		}
	}
}
