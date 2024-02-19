import { GameService } from '../GameService';
import Game from '../Game';
import { GameLogic, IStatePlayer, TypeAction } from '../GameLogic';
import Player from '../../players/Player';
// import { logger } from '../../infra';

// https://refactoring.guru/fr/design-patterns/state
export abstract class AGameState {
	private ticks = parseInt(process.env.TICKS as string) ?? 128;
	private intervalMs = parseInt(process.env.TICKS_INTERVAL_MS as string) ?? 1000;
	private intervalID: NodeJS.Timeout | null = null;
	protected game: Game | null = null;
	protected service: GameService | null = null;
	protected logic: GameLogic | null = null;

	protected _date: Date = new Date();

	public set context(ctx: { game: Game; service: GameService; logic: GameLogic }) {
		const { game, service } = ctx;
		this.game = game;
		this.service = service;
		this.logic = ctx.logic;
	}

	public get date(): Date {
		return this._date;
	}

	protected update(): void {
		if (this.game) {
			this.intervalID = setInterval(() => {
				if (this.game?.gamers.length === 0 || this.service?.self()?.size === 0) {
					this.game?.stop();
					this.clear();
					return;
				}

				this.logic?.update();
				this.game?.gamers.forEach((gamer: Player) => {
					const stateGame = this.state(gamer);
					this.service?.emitStatePlayer(stateGame, gamer.sessionID);
				});
			}, this.intervalMs / this.ticks);
		}
	}

	protected clear(): void {
		if (this.intervalID) {
			clearInterval(this.intervalID);
		}
	}

	public abstract start(): void;
	public abstract stop(): void;
	public abstract finish(): void;
	public abstract play(player: Player, action: TypeAction): void;

	public state(player: Player): IStatePlayer {
		if (!this.logic) throw new Error('AGameState: game logic is not defined');
		return this.logic.statePlayer(player);
	}
}
