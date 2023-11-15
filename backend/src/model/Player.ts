import { logger } from '../controller/LogController';
class Player {
	private _dateCreated: Date = new Date();

	// TODO definir autrement la partie object de ce Map
	// qui est cense contenir toutes les datas des games
	private _games: Map<string, object> = new Map<string, object>();
	private _leads: string[] = [];
	private _wins: string[] = [];
	public connected: boolean = true;

	public constructor(
		public username: string,
		public sessionID: string,
	) {}

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

	public get leads(): string[] {
		return this._leads;
	}

	public set leads(value: string) {
		if (typeof value === 'string' && !this.leads.includes(value)) {
			this.leads.push(value);
		}
	}

	public get wins(): string[] {
		return this._wins;
	}

	public set wins(value: string) {
		if (typeof value === 'string' && !this.wins.includes(value)) {
			this.wins.push(value);
		}
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

	public log(stateColor: string = '\x1b[0m'): void {
		const coCol = this.connected ? `\x1b[32m` : `\x1b[31m`;
		let log = `[${stateColor}${this.username}\x1b[0m`;
		let llog = `[${this.username} (${!this.connected ? 'not ' : ''}connected)`;
		llog += ` - ${this.sessionID}]\n`;
		llog += `\t+ created: ${this.dateCreated}\n`;
		log += ` - ${coCol}${this.sessionID}\x1b[0m]\n`;
		log += `\t+ \x1b[4mcreated:\x1b[0m \x1b[3m${this.dateCreated}\x1b[0m\n`;
		if (this.leads.length > 0) {
			log += `\t\t....................................\n`;
			llog += `\t\t....................................\n`;
		}
		this.leads.forEach((lead) => {
			log += `\t+ \x1b[4mleads\x1b[0m: \x1b[35m${lead}\x1b[0m\n`;
			llog += `\t+ leads: ${JSON.stringify(lead)}\n`;
		});
		if (this.wins.length > 0) {
			log += `\t\t....................................\n`;
			llog += `\t\t....................................\n`;
		}
		this.wins.forEach((win) => {
			log += `\t+ \x1b[4mwins\x1b[0m: \x1b[36m${win}\x1b[0m\n`;
			llog += `\t+ wins: ${JSON.stringify(win)}\n`;
		});
		if (this.games.length > 0) {
			log += `\t\t....................................\n`;
		}
		this.games.forEach((game) => {
			log += `\t+ \x1b[4mplays\x1b[0m: \x1b[36m${game}\x1b[0m\n`;
			llog += `\t\t....................................\n`;
		});
		log += `------------------------------------------------------------`;
		llog += `------------------------------------------------------------`;
		console.log(log);
		logger.log(llog);
	}

	public toJSON(): object {
		return {
			username: this.username,
			sessionID: this.sessionID,
			dateCreated: this.dateCreated,
			connected: this.connected,
			leads: this.leads,
			wins: this.wins,
			games: this.games,
		};
	}
}

export default Player;
