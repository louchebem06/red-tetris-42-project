import EventEmitter from 'events';
import Room from './Room';
import Player from './Player';
import IRoomJSON from '../interface/IRoomJSON';
import IPlayerJSON from '../interface/IPlayerJSON';
import { State } from '../type/PlayerWaitingRoomState';
import IGameStartPayload from '../interface/IGameStartPayload';

class MyEventEmitter extends EventEmitter {
	public constructor() {
		super();
		this.setMaxListeners(Infinity);
		this.onReadyTimer = this.onReadyTimer.bind(this);
		this.onPlayerReady = this.onPlayerReady.bind(this);
		this.onRoomReady = this.onRoomReady.bind(this);
		this.onRoomEmpty = this.onRoomEmpty.bind(this);
		this.onSessionEmpty = this.onSessionEmpty.bind(this);
	}

	public onReadyTimer(broadcast: (data: IGameStartPayload) => void): void {
		const wrap = (data: IGameStartPayload): void => {
			broadcast(data);
		};
		this.on('readyTimer', wrap);
	}
	public onPlayerReady(room: Room): void {
		const ready = (player: Player, state: State): void => {
			try {
				room.updatePlayer(player, state);
				room.updatePlayers(player);
				const total = room.totalPlayers;
				const ready = room.totalReady;
				if (total > 0 && total === ready) {
					console.log(`starting countdown`, room.countdown, room.name);
					room.startCountdown(eventEmitter)(player, room);
				} else {
					room.resetCountdown();
				}
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
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		this.on('roomReady', roomReady);
	}

	public onSessionEmpty(clean: (sid: string) => void): void {
		const wrap = (sid: string): void => {
			try {
				clean(sid);
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
			} catch (e) {
				throw new Error(`Event Emitter Error: ${(<Error>e).message}`);
			}
		};
		this.on('roomEmpty', wrap);
	}
}

export const eventEmitter = new MyEventEmitter();
