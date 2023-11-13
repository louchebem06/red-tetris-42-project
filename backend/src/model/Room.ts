import Game from './Game';
import Player from './Player';
import PlayerStore from '../store/PlayerStore';
import IPlayerJSON from '../interface/IPlayerJSON';

export default class Room {
	private _players: PlayerStore = new PlayerStore();
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
	public constructor(name: string, leader: Player) {
		this._name = name;
		leader.leads = this.name;
		this._leader = leader; // TODO a repercuter dans le player correspondant
		this._game = new Game(this._name);
	}

	/**
	 * Adds a player to the room.
	 *
	 * @param {Player} player - The player to be added.
	 * @return {void} This function does not return anything.
	 */
	public addPlayer(player: Player): void {
		if (!this.hasPlayer(player)) {
			this._players.save(player.sessionID, player);
		}
	}

	public updatePlayer(player: Player): void {
		if (this.hasPlayer(player)) {
			this._players.save(player.sessionID, player);
		}
	}

	/**
	 * Removes a player from the game.
	 *
	 * @param {Player} player - The player to be removed.
	 * @return {void}
	 */
	public removePlayer(player: Player): void {
		if (this.hasPlayer(player)) {
			this._players.delete(player.sessionID);
			if (this.isLeader(player)) {
				player.leads.splice(player.leads.indexOf(this.name), 1);
				if (this.players[0]) {
					this.leader = this.players[0];
				}
				this.leader.leads = this.name;

				if (this.totalPlayers < 2) {
					this.winner = this.leader;
				}
			}

			if (this.totalPlayers === 0 && this._game.isStarted()) {
				this.stopGame(player);
			}
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
	public set leader(player: Player) {
		this._leader = player;
	}

	private set winner(player: Player) {
		player.wins = this.name;
		this._game.winner = player;
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
		return this._players.get(player.sessionID) !== undefined;
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
			this.players.forEach((p) => {
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
	 * Returns the total number of players.
	 *
	 * @return {number} The total number of players.
	 */
	public get totalPlayers(): number {
		return this._players.total;
	}

	public get players(): Player[] {
		return this._players.all;
	}

	public get playersJSON(): IPlayerJSON[] {
		return [...this.players.map((p: Player) => p.toJSON() as IPlayerJSON)];
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
		};
	}
}
