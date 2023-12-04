import { ServerService, logger } from '../infra';
import Player from '../players/Player';
import Room from './Room';

import { IRoomJSON } from '../eventsIO/payloads/types/IPayload';
import { RoomStore } from './stores';
import { Server } from 'socket.io';
import { RoomJSON } from '../eventsIO/payloads/types/Payloads';
import { RoomEmptyEventListener } from './events/emptyRoom';
import { CreateRoom } from './useCases';

export default class RoomManager extends RoomStore {
	public roomEmptyListener: RoomEmptyEventListener;
	public constructor(
		private _ss: ServerService,
		private io: Server,
	) {
		super();

		this.roomEmptyListener = new RoomEmptyEventListener(this);
		this.log = this.log.bind(this);
		this.getRoomsWithPlayer = this.getRoomsWithPlayer.bind(this);
		this.create = this.create.bind(this);
	}

	public getRoomJSON(roomName: string): Promise<RoomJSON> {
		return new Promise<RoomJSON>((resolve, reject) => {
			const room = this.get(roomName);
			if (room) {
				resolve(room.toJSON());
			} else {
				reject(new Error(`getRoomJSON: ${roomName} does not exists`));
			}
		});
	}

	public get roomsJSON(): IRoomJSON[] {
		return this.all.map((room: Room) => room.toJSON() as IRoomJSON);
	}

	private getRoomsWithPlayer(player: Player): Room[] {
		return this.all.filter((room: Room) => room.all.includes(player));
	}

	public roomsPlayerPayload(player: Player): IRoomJSON[] {
		const rooms = this.getRoomsWithPlayer(player);
		return rooms.map((room) => room.toJSON()) as IRoomJSON[];
	}

	public create(name: string, player: Player): void {
		// console.error(player)
		new CreateRoom<RoomManager>(this, this.io).execute(player, name);
	}

	public log(): void {
		const total = this.total;
		const rooms = this.all;
		const s = total > 1 ? 's' : '';

		const log = `\n\x1b[33mroom manager:\t[${total} room${s}]\x1b[0m`;
		logger.log(`\n[${total} room${s}]`);
		console.log(log);
		rooms.forEach((room) => {
			room.log('log from manager');
		});
		logger.log(`============================================================`);
		console.log(`\x1b[34m============================================================\x1b[0m`);
	}
}
export type RM = RoomManager;
