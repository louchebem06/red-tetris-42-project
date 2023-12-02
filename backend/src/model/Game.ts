import { logger } from '../controller/LogController';
import Player from './Player';

export default class Game {
	private _started: boolean = false;
	private _dateCreated: Date = new Date();
	private _dateStarted: Date | null = null;
	private _dateStopped: Date | null = null;
	public winner: Player | null = null;

	public constructor(private _id: string) {
		// console.log('Game initialized');
	}

	public start(): void {
		// console.log('Game started');
		this._started = true;
		this._dateStarted = new Date();
	}

	public stop(): void {
		// console.log('Game stopped');
		this._started = false;
		this._dateStopped = new Date();
	}

	public isStarted(): boolean {
		return this._started;
	}

	public log(): void {
		const t = `\x1b[31m`;
		const f = `\x1b[32m`;
		const m = `\x1b[35m`;
		const u = `\x1b[3m`;
		const z = `\x1b[0m`;
		let log = `Game ${m}${this._id}${z}\n`;
		let llog = `Game ${this._id}\n`;
		const show = (id: string | null | undefined): string => {
			return ` ${u}${this._started ? t : f}${id}${z}`;
		};

		log += `\t-> created:${show(this._dateCreated.toDateString())}\n`;
		log += `\t-> started:${show(this._dateStarted?.toDateString())}\n`;
		log += `\t-> stopped:${show(this._dateStopped?.toDateString())}\n`;
		llog += `\t-> created:${this._dateCreated.toDateString()}\n`;
		llog += `\t-> started:${this._dateStarted?.toDateString()}\n`;
		llog += `\t-> stopped:${this._dateStopped?.toDateString()}\n`;
		console.log(log);
		logger.log(llog);
		log = '';
		if (this.winner) {
			log = `\t-> winner:${this.winner.username}\n`;
			llog = `\t-> winner:${this.winner.username}\n`;
			logger.log(llog);
			console.log(log);
			log = '';
			this.winner.log(m);
		}
	}
}
