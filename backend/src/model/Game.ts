import Player from './Player';

export default class Game {
	private _started: boolean = false;
	private _dateCreated: Date = new Date();
	private _dateStarted: Date | null = null;
	private _dateStopped: Date | null = null;
	public winner: Player | null = null;

	/**
	 * Initializes a new instance of the Game class.
	 *
	 * @param {string} _id - The ID of the game.
	 */
	public constructor(private _id: string) {
		// console.log('Game initialized');
	}
	/**
	 * Starts the game.
	 *
	 * This function sets the "_started" property to true
	 *  and initializes the "_dateStarted" property with the current date and time.
	 */
	public start(): void {
		// console.log('Game started');
		this._started = true;
		this._dateStarted = new Date();
	}

	/**
	 * Stops the game.
	 *
	 * @return {void} No return value.
	 */
	public stop(): void {
		// console.log('Game stopped');
		this._started = false;
		this._dateStopped = new Date();
	}

	/**
	 * Checks if the function is started.
	 *
	 * @return {boolean} The boolean value indicating whether the function is started or not.
	 */
	public isStarted(): boolean {
		return this._started;
	}
}
