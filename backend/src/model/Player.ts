class Player {
	private _username: string;
	private _socketId: string;
	private _active: boolean;
	private _dateCreated: Date = new Date();
	// TODO definir autrement la partie object de ce Map
	// qui est cense contenir toutes les datas des games
	private _games: Map<string, object> = new Map<string, object>();

	/**
	 * Creates a new instance of the Player class.
	 *
	 * @param {string} socketId - The socket ID of the player.
	 * @param {string} [username='anon'] - The username of the player. Defaults to 'anon'.
	 * @param {boolean} [active=false] - Indicates whether the player is active. Defaults to false.
	 * @throws {Error} If socketId is not provided or if its length is not 20 characters.
	 */
	public constructor(socketId: string, username: string = 'anon', active: boolean = false) {
		if (!socketId) throw new Error('Player: id socket is mandatory');
		if (socketId.length != 20) throw new Error('Player: format socket is invalid');
		this._socketId = socketId;
		this._active = active;
		this._username = !username ? 'anon' : username;
	}

	/**
	 * Returns the socket ID associated with this instance.
	 *
	 * @return {string} The socket ID.
	 */
	public get socketId(): string {
		return this._socketId;
	}

	/**
	 * Sets the socket ID for the object.
	 *
	 * @param {string} id - The ID of the socket.
	 */
	public set socketId(id: string) {
		this._socketId = id;
	}

	/**
	 * Get the username.
	 *
	 * @return {string} The username.
	 */
	public get username(): string {
		return this._username;
	}
	/**
	 * Sets the username.
	 *
	 * @param {string} username - The new username.
	 */
	public set username(username: string) {
		this._username = username;
	}

	/**
	 * Returns the value of the 'active' property.
	 *
	 * @return {boolean} The value of the 'active' property.
	 */
	public get active(): boolean {
		return this._active;
	}
	/**
	 * Sets the active state of the function.
	 *
	 * @param {boolean} state - The new active state.
	 */
	public set active(state: boolean) {
		this._active = state;
	}

	/**
	 * Returns the date the object was created.
	 *
	 * @return {Date} The date the object was created.
	 */
	public get dateCreated(): Date {
		return this._dateCreated;
	}

	/**
	 * Returns an array of all games.
	 *
	 * @return {object[]} An array of game objects.
	 */
	public get games(): object[] {
		return [...this._games.values()];
	}

	/**
	 * Adds a game to the collection.
	 *
	 * @param {string} id - The ID of the game.
	 * @param {object} game - The game object to be added.
	 * @return {void}
	 */
	public addGame(id: string, game: object): void {
		this._games.set(id, game);
	}

	/**
	 * Converts the object to a JSON representation.
	 *
	 * @return {object} The JSON representation of the object.
	 */
	// Qd un obj est serialisé, il est converti en string
	// et il perd toutes ses fonctionnalités!, il ne garde que ses propriétés
	// donc pour acceder aux accesseurs et mutateurs,
	// (ici c'est la socket client qui essaye d'acceder a ses props), on retourne au travers
	// d'une methode toJSON() les datas qu'on souhaite rendre public
	public toJSON(): object {
		return {
			username: this.username,
			socketId: this.socketId,
			active: this.active,
			dateCreated: this._dateCreated,
			games: [...this._games.values()],
		};
	}
}

export default Player;
