import Player from '../model/Player';
import UsernameManager from './UsernameManager';

class PlayerManager {
	private players: Map<string, Player> = new Map();
	private usernamesList: UsernameManager = new UsernameManager();

	/**
	 * Adds a player to the list of players.
	 *
	 * @param {Player} player - The player to add.
	 * @return {void} - This function does not return anything.
	 */
	private addPlayer(player: Player): void {
		this.players.set(player.socketId, player);
	}

	/**
	 * Retrieves a player object by their ID.
	 *
	 * @param {string} id - The ID of the player.
	 * @return {Player | undefined} The player object with the specified ID,
	 * or undefined if no player is found.
	 */
	public getPlayerById(id: string): Player | undefined {
		return this.players.get(id);
	}

	/**
	 * Retrieves the username of a player with the specified ID.
	 *
	 * @param {string} id - The ID of the player.
	 * @return {string | undefined} The username of the player,
	 * or undefined if the player does not exist.
	 */
	public getPlayerUsername(id: string): string | undefined {
		const player = this.getPlayerById(id);
		return player?.username || undefined;
	}

	/**
	 * Retrieves the state of a player.
	 *
	 * @param {string} id - The ID of the player.
	 * @return {boolean} The state of the player. Returns `true` if the player
	 * is active, `false` otherwise.
	 */
	public getPlayerState(id: string): boolean {
		const player = this.getPlayerById(id);
		return player?.active || false;
	}

	/**
	 * Get the number of active players.
	 *
	 * @return {number} The number of active players.
	 */
	public getNbActivePlayers(): number {
		return this.players.size;
	}

	/**
	 * Checks if a player with the given ID exists.
	 *
	 * @param {string} id - The ID of the player.
	 * @return {boolean} Returns true if a player with the given ID exists, otherwise false.
	 */
	public hasPlayer(id: string): boolean {
		return this.players.has(id);
	}

	/**
	 * Determines if the current instance of the class is empty.
	 *
	 * @return {boolean} True if the instance is empty, false otherwise.
	 */
	public isEmpty(): boolean {
		return !this.players.size;
	}

	/**
	 * Creates a player with the given id and username.
	 *
	 * @param {string} id - The id of the player.
	 * @param {string} username - The username of the player.
	 * @returns {Player | undefined} The created player object or undefined if there was an error.
	 */
	private createPlayer(id: string, username: string): Player | undefined {
		/**
		 * Displays information about a player.
		 *
		 * @param {Player} player - The player object.
		 * @param {string} username - The username of the player.
		 * @param {string} id - The ID of the player.
		 * @return {void} This function does not return anything.
		 */
		const display = (player: Player, username: string, id: string): void => {
			const received = `[${username} / ${id}]`;
			const action = 'will be created as';
			const sent = `{${player.username} / ${player.socketId}}`;
			console.log(`${received} ${action} ${sent}`);
		};
		if (username.includes('#')) {
			throw new Error('PlayerManager: forbidden symbol into username');
		}
		let player = undefined;
		try {
			player = new Player(id, '');
			player.username = this.usernamesList.setNewUsername(username);
			this.addPlayer(player);
			display(player, username, id);
		} catch (e) {
			if (e instanceof Error && e.message?.includes('Player')) {
				throw new Error(`PlayerManager: troubles when create player: <${e?.message}>`);
			}
		}
		return player;
	}

	/**
	 * Updates the username of a player with the given ID.
	 *
	 * @param {string} id - The ID of the player.
	 * @param {string} username - The new username to update to.
	 * @return {void} This function does not return anything.
	 */
	private updatePlayerUsername(id: string, username: string): void {
		const player = this.getPlayerById(id);
		if (player && player.username !== username) {
			player.username = this.usernamesList.updateUsername(player.username, username);
			this.players.set(id, player);
		}
	}

	/**
	 * Updates a player by their id with the given data.
	 *
	 * @param {string} id - The id of the player to be updated.
	 * @param {object} datas - The data to update the player with.
	 * @return {void} This function does not return anything.
	 */
	public updatePlayer(id: string, datas: object): void {
		// TODO voir ou et comment le player aura a etre update
		const player = this.getPlayerById(id);
		if (player) {
			console.log(`(${player.username} / ${id}) is updating; datas:`, datas);
			this.players.set(id, player);
		}
	}

	/**
	 * Generates a player object with the given id and username.
	 * Ne permets pas le changement de pseudo si la nouvelle valeur est anon
	 *
	 * @param {string} id - The id of the player.
	 * @param {string} username - The username of the player.
	 * @return {Player | undefined} - The generated player object,
	 * or undefined if player does not exist.
	 */
	public generatePlayer(id: string, username: string): Player | undefined {
		if (this.hasPlayer(id)) {
			const previous = this.getPlayerUsername(id) || '';
			if (previous.length > 0 && username.includes('anon')) return this.getPlayerById(id);
			this.updatePlayerUsername(id, username);
		}
		return this.getPlayerById(id) || this.createPlayer(id, username);
	}

	/**
	 * Delete a player from the list of players.
	 *
	 * @param {string} id - The ID of the player to delete.
	 * @return {void} This function does not return anything.
	 */
	public deletePlayer(id: string): void {
		const username = this.getPlayerUsername(id);
		if (this.hasPlayer(id) && username) {
			this.usernamesList.removeRecurrence(username);
			this.players.delete(id);
		}
	}

	/**
	 * Displays the number of active players and logs their values.
	 *
	 * @return {boolean} Returns true if there are active players, otherwise false.
	 */
	public displayPlayers(): boolean {
		const nb = this.getNbActivePlayers();
		if (nb) {
			const player = nb > 1 ? 'players' : 'player';
			const msg = `${nb} ${player} ${nb > 1 ? 'are' : 'is'} online: `;
			console.log(msg, this.players.values());
		}
		return nb ? true : false;
	}

	/**
	 * Removes any unused data from the object.
	 */
	public prune(): void {
		this.usernamesList.prune();
		this.players.clear();
	}
}

export default PlayerManager;
