import Game from './Game';
import Player from './Player';
import { Socket } from 'socket.io';
import RoomService from '../service/RoomService';

export default class Room {
	private _players: Player[] = [];
	private _name: string;
	private _leader: Player;
	private _game: Game;
	private _dateCreated: Date = new Date();

	/**
	 * Create a new instance of the constructor.
	 *
	 * @param {string} name - The name of the constructor.
	 * @param {Player} leader - The leader of the constructor.
	 */
	public constructor(
		name: string,
		leader: Player,
		private _rs: RoomService,
	) {
		try {
			this._name = name;
			this._leader = leader; // TODO a repercuter dans le player correspondant
			this._game = new Game(this._name);
			this._rs.createRoom(this.name);
			this._rs.alertAll('room opened', { room: this.toJSON() });
			this.alertLeaderChange();
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	/**
	 * Adds a player to the room.
	 *
	 * @param {Player} player - The player to be added.
	 * @return {void} This function does not return anything.
	 */
	public addPlayer(socket: Socket, player: Player): void {
		try {
			if (this.hasPlayer(player)) {
				throw new Error(`player ${player.username} already exists in this room`);
			}
			this._players.push(player);
			this._rs.joinRoom(socket, this.name);
			this.alertRoom('player incoming', player);
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	private alertLeaderChange(): void {
		const message = `You are the new leader of ${this.name}`;
		const socket = this._rs.getPlayerSocket(this.leader.socketId);
		// TODO A repercuter dans le player correspondant (ajoute de la room ou jsp encore)
		this._rs.alertPlayer(socket, 'leader change', { message });
	}

	private alertAll(event: string): void {
		const payload = { room: this.toJSON() };
		this._rs.alertAll(event, payload);
	}

	private alertRoom(event: string, player: Player): void {
		const payload = {
			reason: event,
			room: this.toJSON(),
			player: player.toJSON(),
		};
		this._rs.alertRoom(this.name, 'room change', payload);
	}

	/**
	 * Removes a player from the game.
	 *
	 * @param {Player} player - The player to be removed.
	 * @return {void}
	 */
	public removePlayer(socket: Socket, player: Player): void {
		try {
			const idx = this._players.indexOf(player);
			if (idx === -1) {
				const msg = `Cannot leave room: player ${player.username} not found`;
				throw new Error(msg);
			}
			this._players.splice(idx, 1);
			const nbRemainingPlayers = this.totalPlayers;
			if (nbRemainingPlayers > 0 && this.isLeader(player)) {
				this.leader = this._players[0];
				this.alertRoom('new leader', this.leader);
				this.alertLeaderChange();
			}

			if (nbRemainingPlayers === 1) {
				this.winner = this.leader;
			}

			if (nbRemainingPlayers === 0) {
				this._game.stop();
				this.alertAll('room closed');
				const message = `You win the game ${this.name}`;
				const id = this.winner?.socketId || this.leader.socketId;
				const socket = this._rs.getPlayerSocket(id);
				this._rs.alertPlayer(socket, 'winner', { message });
			}
			this.alertRoom('player outgoing', player);
			this._rs.leaveRoom(socket, this.name);
		} catch (e) {
			throw new Error(`${e instanceof Error && e.message}`);
		}
	}

	/**
	 * Retrieves the name of the Room.
	 *
	 * @return {string} The name of the Room.
	 */
	public get name(): string {
		return this._name;
	}

	/**
	 * Retrieves the leader of the team.
	 *
	 * @return {Player} The current leader.
	 */
	public get leader(): Player {
		return this._leader;
	}

	/**
	 * Sets the leader player.
	 *
	 * @param {Player} player - The player to set as the leader.
	 */
	private set leader(player: Player) {
		this._leader = player;
	}

	/**
	 * Checks if the given player is the leader.
	 *
	 * @param {Player} player - The player to check.
	 * @return {boolean} Returns true if the given player is the leader, otherwise false.
	 */
	public isLeader(player: Player): boolean {
		return this._leader === player;
	}

	/**
	 * Determines whether the given player is in the list of players.
	 *
	 * @param {Player} player - The player to check.
	 * @return {boolean} Returns true if the player
	 * is in the list of players, otherwise returns false.
	 */
	public hasPlayer(player: Player): boolean {
		return this._players.includes(player);
	}

	/**
	 * Starts the game if the player is the leader and the game is not already in progress.
	 *
	 * @param {Player} player - The player who wants to start the game.
	 * @return {void} This function does not return anything.
	 */
	public startGame(player: Player): void {
		if (!this.gameState && this.isLeader(player) && this.hasPlayer(player)) {
			this._game.start();
			this._players.forEach((p) => {
				p.addGame(this._name, this._game);
			});
		}
	}

	/**
	 * Stops the game.
	 *
	 * @param {Player} player - The player requesting to stop the game.
	 */
	public stopGame(player: Player): void {
		// ? est-ce que le leader peut vraiment arreter le jeu
		// ? est-ce que l'arret du jeu designe un winner
		if ((this.gameState && this.isLeader(player)) || this.totalPlayers === 0) {
			this._game.stop();
		}
	}

	/**
	 * Returns the current state of the game.
	 *
	 * @return {boolean} The current state of the game.
	 */
	public get gameState(): boolean {
		return this._game.isStarted();
	}

	/**
	 * Returns the winner of the game.
	 *
	 * @return {Player | null} The winner of the game. Returns null if there is no winner yet.
	 */
	public get winner(): Player | null {
		return this._game.winner;
	}

	/**
	 * Sets the winner of the game.
	 *
	 * @param {Player | null} player - The player who won the game or null if it's a tie.
	 */
	private set winner(player: Player | null) {
		this._game.winner = player;
	}

	/**
	 * Returns the total number of players.
	 *
	 * @return {number} The total number of players.
	 */
	public get totalPlayers(): number {
		return this._players.length;
	}

	public toJSON(): object {
		return {
			name: this.name,
			dateCreated: this._dateCreated,
			leader: this.leader,
			gameState: this.gameState,
			winner: this.winner,
			players: this._players,
			totalPlayers: this.totalPlayers,
		};
	}
}
