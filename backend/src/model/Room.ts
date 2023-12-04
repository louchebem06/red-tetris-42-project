import Game from './Game';
import Player from './Player';
import PlayerStore from '../store/PlayerStore';
import IPlayerJSON from '../interface/IPlayerJSON';
import { logger } from '../controller/LogController';
import { State } from '../type/PlayerWaitingRoomState';
import { eventEmitter } from '../model/EventEmitter';
import { IRoomState } from '../interface/IRoomState';

export default class Room {
	private _players: PlayerStore = new PlayerStore();
	private _name: string;
	private _leader: Player;
	private _game: Game;
	private _dateCreated: Date = new Date();
	private _readys: PlayerStore = new PlayerStore();

	public constructor(name: string, leader: Player) {
		this._name = name;
		leader.leads = this.name;
		this._leader = leader;
		this._game = new Game(this._name);

		eventEmitter.onPlayerReady(this);
		eventEmitter.onRoomReady();
	}

	public getReadyPlayers(): number {
		let nb = 0;
		const players: Player[] = this._players.all;
		players.map((player) => {
			const valuePlayer = player.roomState(this._name);
			nb += valuePlayer?.status === 'ready' ? 1 : 0;
		});
		return nb;
	}

	public addPlayer(player: Player): void {
		this.updatePlayer(player, this.gameState ? 'idle' : 'active', !this.hasPlayer(player));
		this._players.save(player.sessionID, player);
	}

	public updatePlayer(player: Player, status: State, has: boolean = true): Player | undefined {
		if (has) {
			if (status === 'ready' && !this._readys.all.includes(player)) {
				this._readys.save(player.sessionID, player);
			} else if (status !== 'ready' && this._readys.all.includes(player)) {
				console.log(`ca passe ici ou pas?`, this._readys);
				this._readys.delete(player.sessionID);
			}
			const state: IRoomState = {
				name: this.name,
				status,
				leads: this.isLeader(player),
				readys: this.getReadyPlayers(),
				wins: this.winner?.username === player.username ?? false,
				started: this._game.isStarted(),
			};
			player.addRoomState(state);
			return player;
		}
		return undefined;
	}

	public updatePlayers(player?: Player): void {
		this.players
			.filter((p) => p !== player)
			.forEach((p) => {
				this.updatePlayer(p, p.roomState(this.name)?.status ?? 'idle', this.hasPlayer(p));
			});
	}

	public removePlayer(player: Player): Player {
		if (this.hasPlayer(player)) {
			logger.log(`[ROOM] player ${player.username} leaving room ${this.name}`);
			const state = player.roomState(this.name);
			if (!state) {
				logger.log(`[ROOM ERROR] player ${player.username} not in room ${this.name}`);
				throw new Error(`player ${player.username} is not in room ${this.name}`);
			}
			if (this.gameState && state.status?.match(/ready/)) {
				logger.log(`[ROOM ERROR] Game is started! player is '${state.status} ${this.name}`);
				throw new Error(`Game is started! player is '${state.status}'`);
			}
			if (state.status !== 'disconnected') {
				state.status = 'left';
			}
			this._players.delete(player.sessionID);
			this._readys.delete(player.sessionID);
			// this.updatePlayer(player, 'left', true);
			logger.log(`[ROOM] player ${player.username} removed room ${this.name}`);
			if (this.isLeader(player)) {
				player.leads.splice(player.leads.indexOf(this.name), 1);
				if (this.players[0]) {
					state.leads = false;
					this.leader = this.players[0];
					logger.log(`[ROOM] change leader ${player.username} removed room ${this.name}`);
				}
				this.leader.leads = this.name;

				if (this.totalPlayers < 2 && state.status === 'left') {
					this.winner = this.leader;
				}
			}

			if (this.totalPlayers === 0 && this._game.isStarted() && state.status === 'left') {
				state.started = false;
				state.wins = this.winner?.sessionID === player.sessionID;
				this.stopGame(player);
				logger.log(`[ROOM] stop ${player.username} removed room ${this.name}`);
			}
			logger.log(`player ${player.username} left room ${this.name}`);
			logger.log(`state: ${JSON.stringify(state)}`);
			logger.log(`player: ${JSON.stringify(player)}`);
		}
		return player;
	}

	public get name(): string {
		return this._name;
	}

	public get empty(): boolean {
		return this.totalPlayers === 0;
	}

	public get ready(): boolean {
		return !this.empty && this.totalReady === this.totalPlayers;
	}

	public get leader(): Player {
		return this._leader;
	}

	public set leader(player: Player) {
		this._leader = player;
	}

	public get winner(): Player | null {
		return this._game.winner;
	}

	private set winner(player: Player) {
		player.wins = this.name;
		this._game.winner = player;
	}

	public isLeader(player: Player): boolean {
		return this._leader === player;
	}

	public hasPlayer(player: Player): boolean {
		return this._players.has(player.sessionID);
	}

	private isReady(player: Player): boolean {
		return !this.gameState && this.hasPlayer(player) && (this.isLeader(player) || this.ready);
	}

	public startGame(player: Player): void {
		if (this.isReady(player)) {
			this._game.start();
			this.players.forEach((p) => {
				let status = p.roomState(this.name)?.status;
				if (status !== 'ready') {
					status = 'idle';
				}
				this.updatePlayer(p, status, this.hasPlayer(p));
				p.addGame(this._name, this._game);
			});
		}
	}

	public stopGame(player: Player): void {
		// ? est-ce que le leader peut vraiment arreter le jeu
		// ? est-ce que l'arret du jeu designe un winner
		if ((this.gameState && this.isLeader(player)) || this.totalPlayers === 0) {
			this._game.stop();
		}
	}

	public get gameState(): boolean {
		return this._game.isStarted();
	}

	public get totalPlayers(): number {
		return this._players.total;
	}

	public get players(): Player[] {
		return this._players.all;
	}

	public get playersJSON(): IPlayerJSON[] {
		return [...this.players.map((p: Player) => p.toJSON() as IPlayerJSON)];
	}

	public get totalReady(): number {
		return this._readys.total;
	}

	public get readys(): Player[] {
		return this._readys.all;
	}

	public get readyJSON(): IPlayerJSON[] {
		return [...this.readys.map((p: Player) => p.toJSON() as IPlayerJSON)];
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
				player.log(qualityColor);
				console.log(log);
				log = '';
				llog += `\t+ ${quality}: ${JSON.stringify(player)}}\n`;
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

	public toJSON(): object {
		return {
			name: this.name,
			dateCreated: this._dateCreated,
			leader: this.leader.toJSON() as IPlayerJSON,
			gameState: this.gameState,
			winner: this.winner?.toJSON() as IPlayerJSON,
			players: this.playersJSON,
			totalPlayers: this.totalPlayers,
			readys: this.readyJSON,
			totalReady: this.getReadyPlayers(),
		};
	}
}
