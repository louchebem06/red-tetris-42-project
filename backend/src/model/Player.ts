import { State } from '../type/PlayerWaitingRoomState';
import { logger } from '../controller/LogController';
import { IRoomState } from '../interface/IRoomState';
class Player {
	private _dateCreated: Date = new Date();

	// TODO definir autrement la partie object de ce Map
	// qui est cense contenir toutes les datas des games
	private _games: Map<string, object> = new Map<string, object>();
	private _leads: string[] = [];
	private _wins: string[] = [];
	public connected: boolean = true;
	private _rooms: Map<string, IRoomState> = new Map<string, IRoomState>();

	public constructor(
		public username: string,
		public sessionID: string,
	) {}

	public addRoomState(roomState: IRoomState): void {
		this._rooms.set(roomState.name, roomState);
	}

	public get roomsState(): Map<string, IRoomState> {
		return this._rooms;
	}

	public roomState(roomName: string): IRoomState | undefined {
		return this._rooms.get(roomName);
	}

	public toggleReady(room: string): void {
		const state = this.roomState(room)?.status;
		if (state === 'ready') {
			this.setRoomStatus('idle', room);
		} else if (state === 'idle') {
			this.setRoomStatus('ready', room);
		} else if (state === 'active') {
			this.setRoomStatus('ready', room);
		}
	}

	public setRoomStatus(status: State, name: string): void {
		const state = this._rooms.get(name);
		if (state) {
			state.status = status;
			this._rooms.set(name, state);
		}
	}

	public get rooms(): IRoomState[] {
		return [...this._rooms.values()];
	}

	public get dateCreated(): Date {
		return this._dateCreated;
	}

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
			llog += `\t\t....................................\n`;
		}
		this.games.forEach((game) => {
			log += `\t+ \x1b[4mplays\x1b[0m: \x1b[36m${game}\x1b[0m\n`;
			llog += `\t+ plays: ${JSON.stringify(game)}\n`;
		});
		if (this.rooms.length > 0) {
			log += `\t\t....................................\n`;
			llog += `\t\t....................................\n`;
		}
		this.rooms.forEach((room) => {
			const keys = Object.keys(room);
			const values = Object.values(room);
			log += `\t+ \x1b[4mroom\x1b[0m:\n`;
			llog += `\t+ room:\n`;
			for (let i = 0; i < keys.length; ++i) {
				log += `\t\t+ \x1b[4m${keys[i]}\x1b[0m: \x1b[36m${values[i]}\x1b[0m\n`;
				llog += `\t\t+ ${keys[i]}: ${values[i]}\n`;
			}
		});
		log += `-----------------------------------------------------------`;
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
			roomsState: this.rooms,
		};
	}
}

export default Player;
