import Player from '../../players/Player';
import { FinishedState, StoppedState } from '.';
import { IStatePlayer, PlayerGame, TypeAction } from '../../games/GameLogic';
import { AGameState } from './AGameState';
import { logger } from '../../infra';
import IStore from '../../base/IStore';

function debugPlayerGame(playerGame: PlayerGame): string {
	return `level: ${playerGame?.getLevel()}, 
score: ${playerGame?.getScore()},
map:
${playerGame
	?.getMap()
	?.render()
	?.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join(''))
	.join('|\n')}|`;
}

function debugIStatePlayer(state: IStatePlayer): string {
	return `level: ${state.level}, 
score: ${state.score},
nextPiece:
${state.nextPiece.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|
map:
${state.map.map((row: string[]) => '|' + row.map((cell) => (cell ? cell : ' ')).join('')).join('|\n')}|`;
}

export class PlayerGameStore implements IStore<PlayerGame> {
	public store: Map<string, PlayerGame> = new Map();

	public get(id: string): PlayerGame | undefined {
		return this.store.get(id);
	}

	public save(id: string, playerGame: PlayerGame): void {
		this.store.set(id, playerGame);
	}

	public get all(): PlayerGame[] {
		return [...this.store.values()];
	}

	public delete(id: string): void {
		this.store.delete(id);
	}

	public has(id: string): boolean {
		return this.store.has(id);
	}

	public get total(): number {
		return this.store.size;
	}
}

export class GameStore implements IStore<PlayerGameStore> {
	public store: Map<string, PlayerGameStore> = new Map();

	public get(id: string): PlayerGameStore | undefined {
		return this.store.get(id);
	}

	public save(id: string, playerGameStore: PlayerGameStore): void {
		this.store.set(id, playerGameStore);
	}

	public get all(): PlayerGameStore[] {
		return [...this.store.values()];
	}

	public delete(id: string): void {
		this.store.delete(id);
	}

	public has(id: string): boolean {
		return this.store.has(id);
	}

	public get total(): number {
		return this.store.size;
	}
}

export class StartedState extends AGameState {
	public start(): void {
		// console.log('Game already started');
		throw new Error(`Started {StartedState}: Game ${this.game?.id} already started`);
	}

	public play(player: Player, action: TypeAction): void {
		// console.log('Game started', player, action);
		// console.log("Champi here")
		// console.log('BEGIN PLAY')
		// console.log(this.game?.gamers);
		// console.log('END PLAY');
		const id = this.game?.id;
		try {
			const playerGame = this.logic?.endGame(player.sessionID);

			if (!playerGame?.getEndGame()) {
				this.logic?.action(player.sessionID, action);
			} else {
				this.game?.removePlayer(player, playerGame);
			}

			const stateGame = this.state(player);
			const log = `Play ${playerGame?.getEndGame() ? 'ended' : 'not ended'}[${action}
{StartedState}: Game ${this.game?.id} played: ${JSON.stringify(player)}
${playerGame && debugPlayerGame(playerGame)}
${stateGame && debugIStatePlayer(stateGame)}
`;
			logger.logContext(log, `Play {StartedState}: Game ${id}`);
		} catch (error) {
			throw new Error(
				`Play [${action}]{StartedState}: Game ${this.game?.id} failed when playing: ${JSON.stringify(player)}
${(<Error>error).message}`,
			);
		}
	}

	public stop(): void {
		// met le jeu en pause et stopper l'update + envoi * 128 ticks
		if (this.game) {
			console.log('Game stopped');
			this.clear(); // stop l'update tous les x ticks
			this.game.transitionTo(new StoppedState());
		}
	}

	public finish(): void {
		if (this.game && this.service) {
			// TODO: designer le winner
			this.service.finish();
			console.log('Game finished');
			this.game.transitionTo(new FinishedState());
			// TODO: set tous les players de la game en status idle
		}
	}
}
