import EventEmitter from 'events';
import Room from './Room';
import Player from './Player';
import timer from './Timer';
import IRoomJSON from '../interface/IRoomJSON';
import IPlayerJSON from '../interface/IPlayerJSON';
import { State } from '../type/PlayerWaitingRoomState';

class MyEventEmitter extends EventEmitter {
	public constructor() {
		super();
		this.setMaxListeners(Infinity);
	}

	public onPlayerReady(room: Room): void {
		const ready = (player: Player, state: State): void => {
			try {
				room.updatePlayer(player, state, true);
				room.updatePlayers(player);
				// this.removeListener('ready', ready);
				setTimeout(() => {
					const total = room.totalPlayers;
					const ready = room.totalReady;
					if (total > 0 && total === ready) {
						eventEmitter.emit('roomReady', player, room);
					}
				}, timer.disconnectSession);
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		this.on('ready', ready);
	}

	public onRoomReady(): void {
		const roomReady = (player: Player, room: Room): void => {
			try {
				room.startGame(player);
				room.updatePlayers();
				// this.removeListener('roomReady', roomReady);
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		eventEmitter.on('roomReady', roomReady);
	}

	public onSessionEmpty(clean: (sid: string) => void): void {
		const wrap = (sid: string): void => {
			try {
				clean(sid);
				// this.removeListener('sessionEmpty', wrap);
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		this.on('sessionEmpty', wrap);
		console.log('Event Emitter: onSessionEmpty', this);
	}

	public onRoomEmpty(close: (room: IRoomJSON, player: IPlayerJSON) => void): void {
		const wrap = (room: IRoomJSON, player: IPlayerJSON): void => {
			try {
				close(room, player);
				// this.removeListener('roomEmpty', wrap);
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		this.on('roomEmpty', wrap);
	}
}

export const eventEmitter = new MyEventEmitter();
