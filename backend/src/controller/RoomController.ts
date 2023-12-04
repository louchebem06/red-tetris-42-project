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
import timer from '../model/Timer';

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

		eventEmitter.onRoomEmpty((room: IRoomJSON, lastPlayer: IPlayerJSON) => {
			// console.log('roomEmpty, room controller', room, lastPlayer);
			this.close(room, lastPlayer);
		});
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
			this.roomStore.save(name, room);

			this.broadcastAll('roomOpened', {
				room: room.toJSON() as IRoomJSON,
				player: player.toJSON() as IPlayerJSON,
			});
			this.broadcastAll('roomChange', {
				reason: 'new leader',
				room: room.toJSON() as IRoomJSON,
				player: player.toJSON() as IPlayerJSON,
			});
			setTimeout(() => {
				if (room.empty) {
					eventEmitter.emit('roomEmpty', room.toJSON(), player.toJSON());
				}
			}, timer.disconnectSession);
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public join(name: string, player: Player): void {
		try {
			const room = this.getRoom(name);
			if (room && !room.hasPlayer(player)) {
				this._ss.changeRoom(player.sessionID, name, 'join');
				room.addPlayer(player);
				this.roomStore.save(name, room);
				this.broadcastAll('roomChange', {
					reason: 'player incoming',
					room: room.toJSON() as IRoomJSON,
					player: player.toJSON() as IPlayerJSON,
				});
			}
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public leave(name: string, player: Player): Player {
		try {
			// on ne peut leave la room que si le jeu est pas demarre
			// ou si le jeu est demarré et le state est idle!
			logger.log(`[ROOMCONTROLLER (begin scope)]: player ${player} try left room ${name}`);
			const room = this.getRoom(name);
			if (!room) {
				logger.log(`[ROOMCONTROLLER] room ${name} does not exist`);
				throw new Error(`room ${name} does not exist`);
			}
			const leader = room.leader;
			room.removePlayer(player);

			this._ss.changeRoom(player.sessionID, name, 'leave');
			logger.log(`[ROOMCONTROLLER (room.remove + ss.changeRoom)]: ${name}`);
			this.broadcastAll('playerChange', {
				reason: 'ready',
				player: player.toJSON() as IPlayerJSON,
			});
			if (room.totalPlayers > 0) {
				this.broadcastAll('roomChange', {
					reason: 'player outgoing',
					room: room.toJSON() as IRoomJSON,
					player: player.toJSON() as IPlayerJSON,
				});

				if (!room.isLeader(leader)) {
					this.broadcastAll('roomChange', {
						reason: 'new leader',
						room: room.toJSON() as IRoomJSON,
						player: player.toJSON() as IPlayerJSON,
					});
				}
				logger.log(`[ROOMCONTROLLER (il reste encore des joueurs)]: room ${name}`);
			} else {
				const state = player.roomState(name);
				if (state?.status !== 'disconnected') {
					this.broadcastAll('roomChange', {
						reason: 'new winner',
						room: room.toJSON() as IRoomJSON,
						player: player.toJSON() as IPlayerJSON,
					});
				}
				logger.log(`[ROOMCONTROLLER (il n'y a plus de joueurs)]:  ${name}`);
				eventEmitter.emit('roomEmpty', room.toJSON(), player.toJSON());
			}
			return player;
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public disconnectPlayer(player: Player): void {
		player?.roomsState?.forEach((state) => {
			const isPlayerDisconnected = state.status?.match(/left|disconnect/);
			const room = this.getRoom(state.name);
			if (!isPlayerDisconnected && room) {
				room.updatePlayer(player, 'disconnected', room.hasPlayer(player));
				this.leave(room.name, player);
			}
		});
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
