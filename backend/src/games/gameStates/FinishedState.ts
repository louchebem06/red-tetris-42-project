import Player from '../../players/Player';
import { TypeAction } from '../GameLogic';
import { AGameState } from './AGameState';

export class FinishedState extends AGameState {
	public start(): void {
		throw new Error(`Started {FinishedState}: Game ${this.game?.id} already finished`);
	}

	public stop(): void {
		throw new Error(`Stopped {FinishedState}: Game ${this.game?.id} already finished`);
	}

	public play(player: Player, action: TypeAction): void {
		throw new Error(
			`Play [${action}]{FinishedState}: Game ${this.game?.id} already finished: ${JSON.stringify(player)}`,
		);
	}

	public finish(): void {
		throw new Error(`Finished {FinishedState}: Game ${this.game?.id} already finished`);
	}
}
