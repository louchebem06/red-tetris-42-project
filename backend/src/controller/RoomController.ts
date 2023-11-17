import { Socket } from 'socket.io';
import Player from '../model/Player';
import Room from '../model/Room';
import ServerService from '../service/ServerService';
import RoomStore from '../store/RoomStore';
import { Payload } from '../interface/ISrvToCltEvts';
import IRoomJSON from '../interface/IRoomJSON';
import IPlayerJSON from '../interface/IPlayerJSON';
import { IBrodacastFormat } from '../interface/IBrodacastFormat';
import { logger } from './LogController';

// TODO Repercuter les updates sur les players dans le controller principal (dans le serveur http)
export default class RoomController {
	private _ss: ServerService;
	private roomStore: RoomStore = new RoomStore();

	public constructor(serverService: ServerService) {
		this._ss = serverService;
		this.log = this.log.bind(this);
		this.catchState = this.catchState.bind(this);
	}

	private getRoom(roomName: string): Room | undefined {
		return this.roomStore.get(roomName);
	}

	public get roomsJSON(): IRoomJSON[] {
		return this.roomStore.all.map((room: Room) => room.toJSON() as IRoomJSON);
	}

	public sendRooms(sid: string): void {
		this._ss.emit(sid, 'getRooms', this.roomsJSON);
	}

	public sendRoom(name: string, sid: string): void {
		try {
			const room = this.getRoom(name);
			this._ss.emit(sid, 'roomInfo', room?.toJSON() as IRoomJSON);
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public get rooms(): Room[] {
		return [...this.roomStore.all];
	}

	public get players(): Player[] {
		const rooms = this.rooms;
		const players = rooms.reduce((acc: Player[], room: Room) => {
			room.players.forEach((player: Player) => {
				acc.push(player);
			});
			return acc;
		}, []);
		return players;
	}

	public getRoomsWithPlayer(player: Player): Room[] {
		const rooms: Room[] = [];
		this.rooms.forEach((room: Room) => {
			if (room.players.includes(player)) {
				rooms.push(room);
			}
		});
		return rooms;
	}

	public updateRoomsWithPlayer(player: Player): void {
		this.rooms.forEach((room: Room) => {
			if (room.players.includes(player)) {
				room.updatePlayer(player);
				this.roomStore.save(room.name, room);
			}
		});
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

	public inform(id: string, event: string, info: string): void {
		this._ss.emit(id, event, info);
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
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public join(name: string, player: Player): void {
		try {
			const room = this.getRoom(name);
			if (room) {
				room.addPlayer(player);
				this.roomStore.save(name, room);

				this._ss.changeRoom(player.sessionID, name, 'join');
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

	public leave(name: string, player: Player): void {
		try {
			const room = this.getRoom(name);
			if (!room) {
				throw new Error(`room ${name} does not exist`);
			}
			const leader = room.leader;
			room.removePlayer(player);
			this.roomStore.save(name, room);
			this._ss.changeRoom(player.sessionID, name, 'leave');
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
			} else {
				this.broadcastAll('roomChange', {
					reason: 'new winner',
					room: room.toJSON() as IRoomJSON,
					player: player.toJSON() as IPlayerJSON,
				});

				this.roomStore.delete(name);
				this.broadcastAll('roomClosed', {
					room: room.toJSON() as IRoomJSON,
					player: player.toJSON() as IPlayerJSON,
				});
			}
		} catch (e) {
			throw new Error(`${(<Error>e).message}`);
		}
	}

	public catchState(socket: Socket, next: (err?: Error) => void): void {
		socket.data.roomController = this;
		next();
	}

	public log(socket: Socket, next: (err?: Error) => void): void {
		const total = this.roomStore.total;
		const rooms = this.roomStore.all;
		const s = total > 1 ? 's' : '';

		const log = `\n\x1b[33m[${total} room${s}]\x1b[0m`;
		logger.log(`\n[${total} room${s}]`);
		console.log(log);
		rooms.forEach((room) => {
			logger.log(`\n ** ${room.name}:\n`);
			console.log(`\n ** \x1b[4m${room.name}\x1b[0m:\n`);
			const players = room.players;
			const leadColor = `\x1b[35m`;
			players.forEach((player) => {
				let stateCol = '';

				if (player === room.leader) {
					stateCol = leadColor;
				}
				player.log(stateCol);
			});
			logger.log(`\n\t^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n`);
			console.log(`\n\t^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n`);
		});
		logger.log(`============================================================`);
		console.log(`\x1b[34m============================================================\x1b[0m`);
		next();
	}
}
