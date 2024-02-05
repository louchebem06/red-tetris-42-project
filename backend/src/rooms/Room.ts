import Player from '../players/Player';

import { logRoom, logger } from '../infra/';

import { IGameStartPayload, IRoomJSON } from '../eventsIO/payloads/types/IPayload';
import { PlayerState } from '../players/types';
import { PayloadFactory } from '../eventsIO/payloads/PayloadFactory';
import { RoomState } from './roomState/RoomState';
import { RoomService } from './RoomService';
import Game from '../games/Game';
import { RoomEventsManager } from './events/manager';
import { AddPlayerCommand, RemovePlayerCommand } from './useCases';
import { RoomPropsBase } from './RoomPropsBase';
import { PlayGameCommand, StartGameCommand, StartedState, StopGameCommand } from '../games';
import { TypeAction } from '../games/GameLogic';

export default class Room extends RoomPropsBase {
	private _games: Record<string, Game> = {};

	public constructor(
		name: string,
		leader: Player,
		protected service: RoomService,
		public events: RoomEventsManager = new RoomEventsManager(),
	) {
		super(name, service, leader);

		this.service.create(this, leader);
		this.timer.room = this;

		setTimeout(() => {
			if (this.empty) {
				this.events.notifyObserver('roomEmpty', this);
			}
		}, this.disconnectSession);
	}

	public close(): void {
		this.service.close(this, this.leader);
	}

	public sendTimer(payload: IGameStartPayload): void {
		this.service.timer(payload);
	}

	public isReadytoPlay(player: Player): boolean {
		return !this.gameState && this.has(player.sessionID) && this.canStartGame(player);
	}

	public addPlayer(player: Player): void {
		new AddPlayerCommand(this, this.service).execute(player);
	}

	public updatePlayer(player: Player, status: PlayerState): Player | undefined {
		player.addRoomState(
			new RoomState({
				name: this.name,
				status,
				leads: this.isLeader(player),
				readys: this.totalReady,
				wins: this.winner?.username === player.username ?? false,
				started: this.gameState,
			}),
		);

		return player;
	}

	public updatePlayers(player?: Player): void {
		this.all
			.filter((p) => p !== player)
			.forEach((p) => {
				this.updatePlayer(p, p.roomState(this.name)?.status ?? 'idle');
			});
	}

	public removePlayer(player: Player): Room {
		new RemovePlayerCommand(this, this.service).execute(player);
		return this;
	}

	// Methods related to the game

	public get gameState(): boolean {
		return this.game ? true : false;
	}

	public get winner(): Player | null {
		return this.game?.winner ?? null;
	}

	public set winner(player: Player) {
		player.wins = this.name;

		if (this.game) {
			this.game.winner = player;
		}
	}

	public startGame(player: Player): void {
		try {
			new StartGameCommand(this, player).execute();
		} catch (e) {
			if (this.service.isConnectedOnServer() && !this.service.isEmpty()) {
				throw new Error((<Error>e).message);
			}
		}
	}

	public stopGame(player: Player): void {
		// si le jeu est demarré
		// et que le joueur est le leader ou que la room est vide
		// et que le player a la status 'left' pour la room
		// alors on autorise l'arret du jeu
		try {
			new StopGameCommand(this, player).execute();
		} catch (e) {
			if (this.service.isConnectedOnServer() && !this.service.isEmpty()) {
				throw new Error((<Error>e).message);
			}
		}
	}

	public addGame(game: Game): void {
		this._games[game.id] = game;
	}

	public play(player: Player, action: TypeAction): Room {
		try {
			if (this.has(player.sessionID) && this.gameState) {
				// this.game?.play(player, action);
				new PlayGameCommand(this, player, action).execute();
			} else {
				throw new Error(`Room: play: player ${player.username}(${player.sessionID}) not in room ${this.name}`);
			}
		} catch (e) {
			if (this.service.isConnectedOnServer() && !this.service.isEmpty()) {
				throw new Error((<Error>e).message);
			}
		}
		return this;
	}

	public get game(): Game | undefined {
		return this.games?.find((game) => game.state instanceof StartedState);
	}

	public get games(): Game[] | null {
		return Object.values(this._games);
	}

	public log(ctx: string): void {
		const { raw, pretty } = logRoom(this);
		logger.logContext(raw, ctx, pretty);
	}

	public toJSON(): IRoomJSON {
		return PayloadFactory.createRoomJSON(this);
	}
}
