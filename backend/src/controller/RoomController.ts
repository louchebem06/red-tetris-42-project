import { logger } from './LogController';
import Player from '../model/Player';
import Room from '../model/Room';
import ServerService from '../service/ServerService';
import RoomStore from '../store/RoomStore';

import IRoomJSON from '../interface/IRoomJSON';
import IPlayerJSON from '../interface/IPlayerJSON';
import { IBrodacastFormat } from '../interface/IBrodacastFormat';
import { Payload } from '../type/PayloadsTypes';
import { eventEmitter } from '../model/EventEmitter';
import IGameStartPayload from 'interface/IGameStartPayload';
import IPlayerPayload from 'interface/IPlayerPayload';

export default class RoomController {
	private _ss: ServerService;
	private roomStore: RoomStore = new RoomStore();

	public constructor(serverService: ServerService) {
		this._ss = serverService;

		this.log = this.log.bind(this);
		this.getRoom = this.getRoom.bind(this);
		this.getRoomJSON = this.getRoomJSON.bind(this);
		this.hasRoom = this.hasRoom.bind(this);
		this.sendRooms = this.sendRooms.bind(this);
		this.sendRoom = this.sendRoom.bind(this);
		this.getRoomsWithPlayer = this.getRoomsWithPlayer.bind(this);
		this.broadcast = this.broadcast.bind(this);
		this.broadcastAll = this.broadcastAll.bind(this);
		this.broadcastRoom = this.broadcastRoom.bind(this);
		this.onRoomEmpty = this.onRoomEmpty.bind(this);
		this.onReadyTimer = this.onReadyTimer.bind(this);
		this.readyTimer = this.readyTimer.bind(this);
		this.close = this.close.bind(this);
		this.create = this.create.bind(this);
		this.join = this.join.bind(this);
		this.leave = this.leave.bind(this);
		this.emitLeaveRoomEvents = this.emitLeaveRoomEvents.bind(this);
		this.removePlayer = this.removePlayer.bind(this);
		this.playerChange = this.playerChange.bind(this);
		this.disconnectPlayer = this.disconnectPlayer.bind(this);

		this.onRoomEmpty();
		this.onReadyTimer();
	}

	public toggleCountdownGame(name: string, player: Player): void {
		try {
			const room = this.getRoom(name);
			if (room?.isLeader(player)) {
				if (room.countdown === parseInt(process.env.START_GAME_TIMER ?? '60', 10)) {
					room.startCountdown(eventEmitter)(player, room);
				} else {
					room.resetCountdown();
				}
				room.lock = !room.lock;
			} else {
				throw new Error(`Countdown can only be toggled by the room leader`);
			}
		} catch (e) {
			throw new Error(`RoomController toggleCountdownGame Error: ${(<Error>e).message}`);
		}
	}

	private onRoomEmpty(): void {
		eventEmitter.onRoomEmpty(this.close.bind(this));
	}
	private onReadyTimer(): void {
		try {
			eventEmitter.onReadyTimer(this.readyTimer.bind(this));
		} catch (e) {
			throw new Error(`RoomController onReadyTimer Error: ${(<Error>e).message}`);
		}
	}

	private readyTimer(data: IGameStartPayload): void {
		try {
			// console.log('Event Emitter: readyTimer', data);
			this.broadcast({
				event: 'gameStart',
				data,
				sid: '',
				room: data.roomName,
			});
		} catch (e) {
			this.broadcastAll('error', `RoomController readyTimer Error: ${(<Error>e).message}`);
		}
	}

	private close(room: IRoomJSON, lastPlayer: IPlayerJSON): void {
		logger.log(`Room ${room.name} closed by ${lastPlayer.username}`);
		console.log(`Room ${room.name} closed by ${lastPlayer.username}`);
		if (room?.totalPlayers === 0) {
			this.roomStore.delete(room.name);
			this.broadcastAll('roomClosed', {
				room: room,
				player: lastPlayer,
			});
		}
	}

	private getRoom(roomName: string): Room | undefined {
		return this.roomStore.get(roomName);
	}

	public hasRoom(roomName: string): boolean {
		return this.roomStore.has(roomName);
	}

	public getRoomJSON(roomName: string): IRoomJSON {
		return this.roomStore.get(roomName)?.toJSON() as IRoomJSON;
	}

	public get roomsJSON(): IRoomJSON[] {
		return this.roomStore.all.map((room: Room) => room.toJSON() as IRoomJSON);
	}

	public sendRooms(sid: string): void {
		this._ss.emit(sid, 'getRooms', this.roomsJSON);
	}

	public sendRoom(name: string, sid: string): void {
		const room = this.getRoom(name);
		this._ss.emit(sid, 'roomInfo', room?.toJSON() as IRoomJSON);
	}

	public get rooms(): Room[] {
		return [...this.roomStore.all];
	}

	private getRoomsWithPlayer(player: Player): Room[] {
		return this.rooms.filter((room: Room) => room.players.includes(player));
	}

	public roomsPlayerPayload(player: Player): IRoomJSON[] {
		const rooms = this.getRoomsWithPlayer(player);
		return rooms.map((room) => room.toJSON()) as IRoomJSON[];
	}

	private broadcast(format: IBrodacastFormat): void {
		this._ss.broadcast(format);
	}

	private broadcastAll(event: string, data: Payload): void {
		this.broadcast({ event, data });
	}
	private broadcastRoom(data: Payload, name: string, sid?: string): void {
		this.broadcast({
			event: 'roomChange',
			data,
			sid,
			room: name,
		});
	}

	public create(name: string, player: Player): void {
		try {
			this._ss.createRoom(name);

			const room = new Room(name, player);
			// console.log(`check du roomState:`, room, player)
			this.roomStore.save(name, room);

			const roomJSON = room.toJSON() as IRoomJSON;
			const playerJSON = player.toJSON() as IPlayerJSON;
			const payloadOpen: Payload = {
				room: roomJSON,
				player: playerJSON,
			};
			const payloadChange: Payload = {
				reason: 'new leader',
				...payloadOpen,
			};
			this.broadcastAll('roomOpened', payloadOpen);
			this.broadcastAll('roomChange', payloadChange);
			setTimeout(() => {
				if (room.empty) {
					eventEmitter.emit('roomEmpty', room.toJSON(), player.toJSON());
				}
			}, room.disconnectSession);
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public join(name: string, player: Player): void {
		try {
			const room = this.getRoom(name);
			if (room && room.canJoin(player)) {
				this._ss
					.changeRoom(player.sessionID, name, 'join')
					.then(() => {
						console.log('changeRoom join ca passe la promise', player.sessionID, name);
						room.addPlayer(player);
						this.roomStore.save(name, room);
						this.broadcastAll('roomChange', {
							reason: 'player incoming',
							room: room.toJSON() as IRoomJSON,
							player: player.toJSON() as IPlayerJSON,
						});
					})
					.catch((e) => {
						// TODO: rediriger vers  event error
						const msg = `${(<Error>e).message}`;
						this._ss.emit(player.sessionID, 'error', msg);
						console.log('changeRoom join error', e);
					});
				room.addPlayer(player);
				this.roomStore.save(name, room);
				this.broadcastAll('roomChange', {
					reason: 'player incoming',
					room: room.toJSON() as IRoomJSON,
					player: player.toJSON() as IPlayerJSON,
				});
			}
		} catch (e) {
			throw new Error(`RoomController join Error: ${(<Error>e).message}`);
		}
	}

	public leave(name: string, player: Player): Player {
		try {
			// on ne peut leave la room que si le jeu est pas demarre
			// ou si le jeu est demarré et le state est idle!
			const {
				room,
				leader,
				playerPayload,
			}: {
				room: Room | undefined;
				leader: Player;
				playerPayload: IPlayerPayload;
			} = this.removePlayer(name, player);

			this.emitLeaveRoomEvents(room, leader, player, name, playerPayload);
			return player;
		} catch (e) {
			throw new Error(`RoomController leave Error: ${(<Error>e).message}`);
		}
	}

	private emitLeaveRoomEvents(
		room: Room,
		leader: Player,
		player: Player,
		name: string,
		playerPayload: IPlayerPayload,
	): void {
		const roomPayload = { ...playerPayload, room: room.toJSON() as IRoomJSON };
		if (room.totalPlayers > 0) {
			roomPayload.reason = 'player outgoing';
			this.broadcastAll('roomChange', roomPayload);

			if (!room.isLeader(leader)) {
				roomPayload.reason = 'new leader';
				this.broadcastAll('roomChange', roomPayload);
			}
		} else {
			const status = player.status(name);
			if (!status?.includes('disconnected')) {
				roomPayload.reason = 'new winner';
				this.broadcastAll('roomChange', roomPayload);
			}
			eventEmitter.emit('roomEmpty', room.toJSON(), player.toJSON());
		}
	}

	private removePlayer(
		name: string,
		player: Player,
	): {
		room: Room;
		leader: Player;
		playerPayload: IPlayerPayload;
	} {
		try {
			const room = this.getRoom(name);
			if (!room) {
				throw new Error(`room ${name} does not exist`);
			}
			const leader = room.leader;
			const status = player.status(name);

			let reason: string;
			if (status?.includes('ready')) {
				reason = 'ready';
			} else {
				reason = 'left';
			}
			room.removePlayer(player);

			this._ss
				.changeRoom(player.sessionID, name, 'leave')
				.then(() => {
					console.log('changeRoom leave ca passe la promise', player.sessionID, name);
					const playerPayload: Payload = this.playerChange(reason, player);
					return { room, leader, playerPayload };
				})
				.catch((e) => {
					// TODO: rediriger vers  event error
					console.log('changeRoom leave error', e);
					const msg = `${(<Error>e).message}`;
					this._ss.emit(player.sessionID, 'error', msg);
				});
			const playerPayload: Payload = this.playerChange(reason, player);
			return { room, leader, playerPayload };
		} catch (e) {
			throw new Error(`RoomController: removePlayer error: ${(<Error>e).message}`);
		}
	}

	private playerChange(reason: string, player: Player): IPlayerPayload {
		const payloadPlayer: Payload = {
			reason,
			player: player.toJSON() as IPlayerJSON,
		};
		this.broadcastAll('playerChange', payloadPlayer);
		return payloadPlayer;
	}

	public disconnectPlayer(player: Player): void {
		try {
			player?.roomsState?.forEach((state) => {
				const isPlayerDisconnected = state.status?.match(/left|disconnect/);
				const room = this.getRoom(state.name);
				if (!isPlayerDisconnected && room?.hasPlayer(player)) {
					room.updatePlayer(player, 'disconnected');
					this.leave(room.name, player);
				}
			});
		} catch (e) {
			throw new Error(`RoomController: disconnectPlayer error: ${(<Error>e).message}`);
		}
	}
	public log(): void {
		const total = this.roomStore.total;
		const rooms = this.roomStore.all;
		const s = total > 1 ? 's' : '';

		const log = `\n\x1b[33mroom controller:\t[${total} room${s}]\x1b[0m`;
		logger.log(`\n[${total} room${s}]`);
		console.log(log);
		rooms.forEach((room) => {
			room.log();
		});
		logger.log(`============================================================`);
		console.log(`\x1b[34m============================================================\x1b[0m`);
	}
}
export type RC = RoomController;
