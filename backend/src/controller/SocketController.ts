import { Socket, Server } from 'socket.io';

import IUserData from '../interface/IUserData';
import ISocketEvent from '../interface/ISocketEvent';

import Player from '../model/Player';

import PlayerController from './PlayerController';
import SocketEventController from './SocketEventController';
import RoomController from './RoomController';

import SocketService from '../service/SocketService';
import { PlayerActions } from '../interface/PlayerActionsEnum';
import { IRoomAction } from '../interface/IRoomAction';
import { IProcessPlayerActionParams } from '../interface/IProcessPlayerActionParams';

export default class SocketController {
	private socketService: SocketService;
	private events: ISocketEvent[];
	private eventController: SocketEventController;
	/**
	 * Constructor function for the class.
	 *
	 * @param {Socket} socket - The socket object for the connection.
	 * @param {PlayerController} playerController - The player controller object.
	 * @param {RoomController} roomController - The room controller object.
	 * @param {Server} io - The server object.
	 */
	public constructor(
		private socket: Socket,
		private playerController: PlayerController,
		private roomController: RoomController,
		io: Server,
	) {
		// handshake
		this.socketService = new SocketService(io);
		this.events = [
			{ name: 'join', middleware: this.join.bind(this) },
			{ name: 'echo', middleware: this.echo.bind(this) },
			{ name: 'create room', middleware: this.createRoom.bind(this) },
			{ name: 'join room', middleware: this.joinRoom.bind(this) },
			{ name: 'leave room', middleware: this.leaveRoom.bind(this) },
			{ name: 'get rooms', middleware: this.getRooms.bind(this) },
			{ name: 'error', middleware: this.error.bind(this) },
			{ name: 'disconnect', middleware: this.disconnect.bind(this) },
		];

		this.eventController = new SocketEventController(this.events);

		this.socketService.onAny(this.socket, (event, data) => {
			try {
				const msg = `Event ${event} received with payload ${JSON.stringify(data)}`;
				console.log(`\x1b[35m${msg}\x1b[0m`);
				this.eventController.handleEvent(event, data);
			} catch (e) {
				// console.error(`Socket Controller: ${e instanceof Error && e.message}`);
				this.sendErrorPayload(`${e instanceof Error && e.message}`);
			}
		});
	}

	/**
	 * Processes a player action.
	 *
	 * @param {IProcessPlayerActionParams} params - The parameters for processing the player action.
	 * @param {Function} params.actionCallback -
	 * The callback function to be executed after processing the player action.
	 * @param {any} params.userData - The user data for creating the player.
	 * @return {void}
	 */
	private processPlayerAction({ actionCallback, userData }: IProcessPlayerActionParams): void {
		this.playerController
			.createPlayer(this.socket, userData)
			.then((player: Player) => actionCallback(player))
			.catch((e) => this.sendErrorPayload(e.message));
	}

	/**
	 * Returns a callback function that sends to a client
	 * the payload with its player datas and rooms list.
	 *
	 * @param {string} eventName - The name of the event to emit.
	 * @return {(player: Player) => void} - The callback function
	 */
	private sendPlayerPayload(
		eventName: string,
	): (player: Player) => Player | PromiseLike<Player> | null | undefined | void {
		return (player: Player) => {
			// console.log(`Player: ${player.socketId} emitted ${eventName}`);
			const payload = { player, rooms: this.roomController.getRooms() };
			this.socketService.emitToSocket(this.socket, eventName, payload);
		};
	}

	/**
	 * Sends an error payload through the socket.
	 *
	 * @param {string} description - The description of the error.
	 * @return {void} This function does not return anything.
	 */
	private sendErrorPayload(description: string): void {
		this.socketService.emitToSocket(this.socket, `error`, description);
	}

	/**
	 * Processes a room action.
	 *
	 * @param {IRoomAction} roomAction - The room action to process.
	 * @return {void} This function does not return a value.
	 */
	private processRoomAction(roomAction: IRoomAction): void {
		if (typeof roomAction.roomName !== 'string') {
			this.sendErrorPayload(`${JSON.stringify(roomAction.roomName)} is not a valid name`);
			return;
		}

		let channel = '';

		switch (roomAction.action) {
			case 'create':
				channel = 'create room';
				break;
			case 'join':
				channel = 'join room';
				break;
			case 'leave':
				channel = 'leave room';
				break;
		}

		roomAction
			.roomActionCb(roomAction.roomName)
			.then(this.sendPlayerPayload(channel))
			.catch((e) => this.sendErrorPayload(e.message));
	}

	/**
	 * Joins the socket connection with the provided data.
	 *
	 * @param {unknown} data - The data to join the socket connection.
	 * @return {void} This function does not return anything.
	 */
	private join(data: unknown): void {
		const id = this.socket.id;
		this.playerController
			.getPlayerById(id)
			.then((player: Player) => {
				this.sendPlayerPayload('join')(player);
			})
			.catch(() => {
				const playerAction: IProcessPlayerActionParams = {
					actionCallback: this.sendPlayerPayload('join'),
					userData: data as IUserData,
				};
				this.processPlayerAction(playerAction);
			});
	}

	/**
	 * Error handler function.
	 *
	 * @param {unknown} data - the data to handle the error.
	 * @return {void} This function does not return anything.
	 */
	private error(data: unknown): void {
		const _data = data instanceof Error ? data.message : data;
		this.sendErrorPayload(_data as string);
		this.disconnect();
	}

	/**
	 * Echoes the message 'Hello World!' to the socket.
	 *
	 * @param {void} - No parameters
	 * @return {void} - Does not return a value
	 */
	private echo(): void {
		this.socketService.emitToSocket(this.socket, 'echo', 'Hello World!');
	}

	/**
	 * Disconnects the socket and deletes the player associated with it.
	 *
	 * @param {void} - No parameters
	 * @return {void} - No return value
	 */
	private disconnect(): void {
		this.socketService.disconnectSocket(this.socket);
		this.playerController.deletePlayer(this.socket.id);
	}

	/**
	 * Creates a room with the given room name.
	 *
	 * @param {unknown} roomName - The name of the room to be created.
	 * @return {void} This function does not return anything.
	 */
	private createRoom(roomName: unknown): void {
		const roomAction: IRoomAction = {
			roomName: roomName as string,
			action: PlayerActions.create,
			/**
			 * Executes a room action callback.
			 *
			 * @param {string} roomName - The name of the room.
			 * @return {Promise<Player>} A promise that resolves with the player object.
			 */
			roomActionCb: (roomName: string): Promise<Player> => {
				return new Promise((resolve, reject) => {
					const id = this.socket.id;
					this.playerController
						.getPlayerById(id)
						.then((player: Player) => {
							this.roomController.handleCreateRoom(roomName, player);
							resolve(player);
						})
						.catch((e) => {
							reject(e);
						});
				});
			},
		};
		this.processRoomAction(roomAction);
	}

	/**
	 * Joins a room.
	 *
	 * @param {unknown} roomName - The name of the room to join.
	 * @return {void} This function does not return anything.
	 */
	private joinRoom(roomName: unknown): void {
		const roomAction: IRoomAction = {
			roomName: roomName as string,
			action: PlayerActions.join,
			/**
			 * Executes a room action callback.
			 *
			 * @param {string} roomName - The name of the room.
			 * @return {Promise<Player>} A promise that resolves to the player.
			 */
			roomActionCb: (roomName: string): Promise<Player> => {
				return new Promise((resolve, reject) => {
					const id = this.socket.id;
					this.playerController
						.getPlayerById(id)
						.then((player: Player) => {
							this.roomController.handleJoinRoom(this.socket, roomName, player);
							resolve(player);
						})
						.catch((e) => {
							reject(e);
						});
				});
			},
		};
		this.processRoomAction(roomAction);
	}

	/**
	 * Leave a room.
	 *
	 * @param {unknown} roomName - The name of the room to leave.
	 * @return {void} This function does not return anything.
	 */
	private leaveRoom(roomName: unknown): void {
		const roomAction: IRoomAction = {
			roomName: roomName as string,
			action: PlayerActions.leave,
			/**
			 * Executes a room action callback for a given room name
			 * and returns a Promise that resolves with the Player object.
			 *
			 * @param {string} roomName - The name of the room.
			 * @return {Promise<Player>} A Promise that resolves with the Player object.
			 */
			roomActionCb: (roomName: string): Promise<Player> => {
				return new Promise(
					/*async*/ (resolve, reject) => {
						const id = this.socket.id;
						this.playerController
							.getPlayerById(id)
							.then((player: Player) => {
								this.roomController.handleLeaveRoom(this.socket, roomName, player);
								resolve(player);
							})
							.catch((e) => {
								reject(e);
							});
					},
				);
			},
		};
		this.processRoomAction(roomAction);
	}

	/**
	 * Retrieves the rooms from the room controller and emits them to the socket.
	 */
	private getRooms(): void {
		const data = this.roomController.getRooms();
		this.socketService.emitToSocket(this.socket, 'get rooms', data);
	}
}
