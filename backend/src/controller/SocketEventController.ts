import ISocketEvent from '../interface/ISocketEvent';

export default class SocketEventController {
	private eventHandler: Map<string, (data: unknown) => void> = new Map();

	/**
	 * Initializes a new instance of the constructor.
	 *
	 * @param {ISocketEvent[]} events - The array of socket events.
	 */
	public constructor(events: ISocketEvent[]) {
		events.forEach((e) => this.registerEvent(e));
	}

	/**
	 * Registers an event with the specified name and middleware.
	 *
	 * @param {ISocketEvent} event - The event to register.
	 * @return {void}
	 */
	public registerEvent(event: ISocketEvent): void {
		this.eventHandler.set(event.name, event.middleware);
	}

	/**
	 * Handles an event by calling the associated event handler function.
	 *
	 * @param {string} eventName - The name of the event.
	 * @param {unknown} data - The data associated with the event.
	 * @return {void} This function does not return anything.
	 */
	public handleEvent(eventName: string, data: unknown): void {
		const handler = this.eventHandler.get(eventName);
		if (handler) {
			handler(data);
		} else {
			throw new Error(`SocketEventController: Unhandled socket event ${eventName}`);
		}
	}
}
