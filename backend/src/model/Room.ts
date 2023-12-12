import Game from './Game';
import Player from './Player';

import PlayerStore from '../store/PlayerStore';
import { logger } from '../controller/LogController';
import { eventEmitter } from '../model/EventEmitter';

import IPlayerJSON from '../interface/IPlayerJSON';
import { IRoomState } from '../interface/IRoomState';
import IRoomJSON from '../interface/IRoomJSON';
import { State } from '../type/PlayerWaitingRoomState';
import { Timer } from './Timer';

export default class Room extends Timer {
	private _players: PlayerStore = new PlayerStore();
	private _name: string;
	private _leader: Player;
	private _game: Game;
	private _dateCreated: Date = new Date();

	public constructor(name: string, leader: Player) {
		super();
		this._name = name;
		leader.leads = this.name;
		this._leader = leader;
		this.addPlayer(leader);
		this._game = new Game(this._name);

		this.canStartGame = this.canStartGame.bind(this);
		this.isReadytoPlay = this.isReadytoPlay.bind(this);

		this.hasPlayer = this.hasPlayer.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.updatePlayer = this.updatePlayer.bind(this);
		this.removePlayer = this.removePlayer.bind(this);
		this.updatePlayers = this.updatePlayers.bind(this);

		this.isLeader = this.isLeader.bind(this);
		this.startGame = this.startGame.bind(this);
		this.stopGame = this.stopGame.bind(this);
		this.log = this.log.bind(this);

		eventEmitter.onPlayerReady(this);
		eventEmitter.onRoomReady();
	}

	// getters and setters directly related to the room
	public get name(): string {
		return this._name;
	}

	public get empty(): boolean {
		return this.totalPlayers === 0;
	}

	private get arePlayersReady(): boolean {
		return !this.empty && this.totalReady === this.totalPlayers;
	}

	private canStartGame(player: Player): boolean {
		return this.isLeader(player) || this.arePlayersReady;
	}

	private isReadytoPlay(player: Player): boolean {
		return !this.gameState && this.hasPlayer(player) && this.canStartGame(player);
	}

	public get gameState(): boolean {
		return this._game?.isStarted() ?? false;
	}

	// accessors for handling players
	public get players(): Player[] {
		return this._players.all;
	}

	public hasPlayer(player: Player): boolean {
		return this._players.has(player.sessionID);
	}

	public get totalPlayers(): number {
		return this._players.total;
	}

	public get readys(): Player[] {
		return this._players.all.filter((player) => {
			return player.status(this._name)?.includes('ready');
		});
	}

	public get totalReady(): number {
		return this.readys.length;
	}

	public get readyJSON(): IPlayerJSON[] {
		return [...this.readys.map((p: Player) => p.toJSON() as IPlayerJSON)];
	}

	public get leader(): Player {
		return this._leader;
	}

	public set leader(player: Player) {
		this._leader = player;
	}

	public isLeader(player: Player): boolean {
		return this._leader === player;
	}

	public get winner(): Player | null {
		return this._game?.winner ?? null;
	}

	private set winner(player: Player) {
		player.wins = this.name;
		this._game.winner = player;
	}

	public addPlayer(player: Player): void {
		if (!this.hasPlayer(player)) {
			this.updatePlayer(player, this.gameState ? 'idle' : 'active');
			this._players.save(player.sessionID, player);
		}
	}

	public updatePlayer(player: Player, status: State): Player | undefined {
		const state: IRoomState = {
			name: this.name,
			status,
			leads: this.isLeader(player),
			readys: this.totalReady,
			wins: this.winner?.username === player.username ?? false,
			started: this.gameState,
		};
		player.addRoomState(state);
		return player;
	}

	private updateLeader(player: Player): void {
		if (this.isLeader(player)) {
			player.leads.splice(player.leads.indexOf(this.name), 1);
			if (this.totalPlayers > 0) {
				this.leader = this.players[0];
				logger.log(`[ROOM] change leader ${player.username} removed room ${this.name}`);
			}
			this.leader.leads = this.name;
		}
	}

	public updatePlayers(player?: Player): void {
		this.players
			.filter((p) => p !== player)
			.forEach((p) => {
				this.updatePlayer(p, p.roomState(this.name)?.status ?? 'idle');
			});
	}

	public canJoin(player: Player): boolean {
		return (this.isLeader(player) && this.totalPlayers === 1) || !this.hasPlayer(player);
	}

	public removePlayer(player: Player): Player {
		if (this.hasPlayer(player)) {
			const status = player.status(this.name);
			// On peut pas remove un player set as ready
			// si la game est commencée(faudra gerer son depart depuis la game)
			if (this.gameState && status?.match(/ready/)) {
				throw new Error(`Game is started! player is '${status}'`);
			} else if (!status?.includes('disconnected')) {
				player.changeRoomStatus('left', this.name);
			}
			this._players.delete(player.sessionID);
			this.updateLeader(player);

			this.stopGame(player);
			this.updatePlayer(player, player.status(this.name));
			logger.log(`player ${player.username} has left room ${this.name}`);
		}
		return player;
	}

	// Methods related to the game
	public startGame(player: Player): void {
		if (this.isReadytoPlay(player)) {
			this._game.start();
			this.players.forEach((p) => {
				if (!p.status(this.name)?.includes('ready')) {
					p.changeRoomStatus('idle', this.name);
				}
				p.addGame(this._name, this._game);
			});
			this.updatePlayers();
		}
	}

	public stopGame(player: Player): void {
		// si le jeu est demarré
		// et que le joueur est le leader ou que la room est vide
		// et que le player a la status 'left' pour la room
		// alors on autorise l'arret du jeu
		const status = player.status(this.name);
		if (this.gameState && (this.isLeader(player) || this.empty) && status?.includes('left')) {
			this.winner = player;
			this._game.stop();
		}
	}

	public log(msg?: string): void {
		// const f = `\x1b[31m`;
		const t = `\x1b[32m`;
		const i = `\x1b[4m`;
		// const y = `\x1b[33m`;
		const m = `\x1b[35m`;
		const c = `\x1b[36m`;
		const z = `\x1b[0m`;

		let qualityColor = '';
		function logPlayer(player: Player, quality: string): void {
			if (player) {
				log += `\t\t....................................\n`;
				llog += `\t\t....................................\n`;
				log += `\t+ \x1b[4m${quality}\x1b[0m: \x1b[36m${player.username}\x1b[0m\n`;
				llog += `\t+ ${quality}: ${player.username}}\n`;
				player.log(qualityColor);
				console.log(log);
				log = '';
			}
		}

		const logPlayers = (players: Player[]): void => {
			if (players.length > 0) {
				log = `\t\t....................................\n`;
				llog += `\t\t....................................\n`;
				console.log(log);
				log = '';
				players.forEach((p) => {
					qualityColor = ``;
					let q = 'player';
					if (this.isLeader(p)) {
						qualityColor = m;
						q = 'leader';
					} else if (this.winner === p) {
						qualityColor = c;
						q = 'winner';
					}
					logPlayer(p, q);
				});
			}
		};

		const header = (logging: boolean = false): string => {
			const name = this.name;
			const total = this.totalPlayers;
			const ready = this.totalReady;

			if (logging) {
				return `[room ${name} - ${ready} / ${total}]\n`;
			}
			return `${i}[room ${name}${z} - ${t}${ready}${z} / ${total}]\n`;
		};
		let log = header();
		let llog = header(true);

		logPlayers(this.players);
		logPlayers(this.readys);

		if (this._game) {
			log += `\t\t....................................\n`;
			llog += `\t\t....................................\n`;
			console.log(log);
			log = '';
			this._game.log();
		}
		qualityColor = m;
		logPlayer(this.leader, 'leader');
		if (this.winner) {
			qualityColor = c;
			logPlayer(this.winner, 'winner');
		}
		log += `-----------------------------------------------------------`;
		llog += `------------------------------------------------------------`;
		console.log(log);
		logger.log(llog);
		logger.log(msg ?? ' ');
	}

	public toJSON(): IRoomJSON {
		return {
			name: this.name,
			dateCreated: this._dateCreated,
			leader: this.leader.toJSON() as IPlayerJSON,
			gameState: this.gameState,
			winner: this.winner?.toJSON() as IPlayerJSON,
			players: this._players.toJSON(),
			totalPlayers: this.totalPlayers,
			readys: this.readyJSON,
			totalReady: this.totalReady,
		};
	}
}
