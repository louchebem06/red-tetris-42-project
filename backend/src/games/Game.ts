import { IGameJSON, IPlayerJSON } from '../eventsIO/payloads/types/IPayload';
import { logger } from '../infra';
import Player from '../players/Player';
import { GameLogic, PlayerGame, TypeAction } from './GameLogic';
import { GameService } from './GameService';
import Room from 'rooms/Room';
import { AGameState, CreatedState } from './gameStates';
import { GameStore, PlayerGameStore } from './gameStates/StartedState';

const gameStore: GameStore = new GameStore();
export default class Game {
	public gamers: Player[];
	public winner: Player | null = null;
	public state: AGameState = new CreatedState();

	protected logic: GameLogic = new GameLogic();
	protected service: GameService;
	private _id: string;
	public gameStore: GameStore = gameStore;

	public constructor(private room: Room) {
		this._id = `game_${room.name}_${this.state.date.getTime()}`;
		this.gamers = room.all;
		this.service = new GameService(this, room.io);
		this.state.context = { game: this, service: this.service, logic: this.logic };

		const log = `Game ${this._id} created`;
		logger.logContext(log, `game creation`, log);
	}

	public removePlayer(player: Player, playerGame: PlayerGame): Game {
		// jeu fini pour le joueur -> le kick du serveur le remettre dans la game room
		// sauvegarder ses donnees de jeu
		// si 0 player -> stop le jeu et designer le vainqueur
		this.service.leave(player);
		this.gamers = this.gamers.filter((gamer) => gamer !== player);

		this.room.updatePlayer(player, 'idle');
		this.room.updatePlayers(player);
		const log = `Game ${this._id}: remove player ${JSON.stringify(player)}`;
		logger.logContext(log, `game transition new state`, log);
		let gamePlayerStore = this.gameStore.get(this.id as string);
		if (!gamePlayerStore) {
			gamePlayerStore = new PlayerGameStore();
		}
		gamePlayerStore.save(player.sessionID, playerGame);
		this.gameStore.save(this.id as string, gamePlayerStore);

		// si plus de gamers -> fin du jeu
		if (this.gamers.length === 0) {
			this.stop();

			const store = this.gameStore.get(this.id as string);
			if (store) {
				const games = Object.entries(store).map(([key, value]) => {
					return { player: this.room.get(key), game: value };
				});
				const scores = games.sort((a, b) => b.game.getScore() - a.game.getScore());
				// TODO: StopGameCommand -> UpdateRoleCommand
				this.winner = scores?.[0].player ?? null;
			}
			this.finish();
		}
		return this;
	}

	public transitionTo(state: AGameState): void {
		const log = `Game ${this._id} transition to ${state.constructor.name}`;
		logger.logContext(log, `game transition new state`, log);
		// logger.log(`Game ${this._id} transition to ${state.constructor.name}`);
		state.context = { game: this, service: this.service, logic: this.logic };
		this.state = state;
	}

	public start(): Game {
		this.state.start();
		return this;
	}

	public stop(): Game {
		// TODO set le winner
		// conditions pour stopper le jeu:
		// - score le + haut
		this.state.stop();
		return this;
	}

	public finish(): Game {
		this.state.finish();
		return this;
	}

	public play(player: Player, action: TypeAction): Game {
		this.state.play(player, action);
		return this;
	}

	public get id(): string {
		return this._id;
	}

	public toJSON(): IGameJSON {
		// TODO PayloadFactory
		return {
			id: this._id,
			gamers: this.gamers.map((p) => p.toJSON() as IPlayerJSON),
			winner: this.winner?.toJSON() ?? null,
			state: this.state.constructor.name,
		};
	}
}
