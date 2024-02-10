import { IPlayerJSON } from '../eventsIO/payloads/types/IPayload';
import Player from '../players/Player';

export interface IGameJSON {
	id: string;
	dateCreated: Date | string;
	dateStarted: Date | string | null;
	dateStopped: Date | string | null;
	winner: IPlayerJSON | null;
}
export default class Game {
	private _started: boolean = false;
	private _dateCreated: Date = new Date();
	private _dateStarted: Date | null = null;
	private _dateStopped: Date | null = null;
	public winner: Player | null = null;

	public constructor(private _id: string) {}

	public start(): void {
		this._started = true;
		this._dateStarted = new Date();
	}

	public stop(): void {
		this._started = false;
		this._dateStopped = new Date();
	}

	public isStarted(): boolean {
		return this._started;
	}

	public toJSON(): IGameJSON {
		// TODO PayloadFactory
		return {
			id: this._id,
			dateCreated: this._dateCreated,
			dateStarted: this._dateStarted,
			dateStopped: this._dateStopped,
			winner: this.winner?.toJSON() ?? null,
		};
	}
}
