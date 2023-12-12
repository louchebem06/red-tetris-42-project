import { Server } from 'socket.io';

import { logger } from '../controller/LogController';
import { sessionController } from '../controller/SessionController';

import { IBrodacastFormat } from '../interface/IBrodacastFormat';
import { IMessageOutgoingPayload } from '../interface/IMessagePayload';
import { Payload } from '../type/PayloadsTypes';
import { ChangeRoom } from '../type/RoomActionsTypes';

export default class ServerService {
	private io: Server;

	public constructor(io: Server) {
		this.io = io;
	}

	private get sids(): Map<string, Set<string>> {
		return this.io.sockets.adapter.sids;
	}

	private get rooms(): Map<string, Set<string>> {
		return this.io.sockets.adapter.rooms;
	}

	private isRoom(sid: string): boolean {
		return this.rooms.has(sid);
	}

	private isSid(sid: string): boolean {
		return this.sids.has(sid);
	}

	private isSession(sid: string): boolean {
		return sessionController.hasSession(sid);
	}

	private isPublicRoom(room: string): boolean {
		return this.isRoom(room) && !this.isSid(room) && !this.isSession(room);
	}

	private throwError(message: string): never {
		// console.trace('server Service throwError:', message);
		throw new Error(message);
	}

	public emit(sid: string, event: string, data: Payload): void {
		if (!this.isSession(sid)) {
			this.throwError(`Session ${sid} not found`);
		}
		this.io.to(sid).emit(event, data);
	}

	public broadcast(datas: IBrodacastFormat): void {
		try {
			const { event, data, sid, room } = datas;
			// console.log('SService', event, data, sid, room);
			if (room) {
				// broadcast to room
				if (!this.isPublicRoom(room)) {
					this.throwError(`Invalid public room ${room}`);
				}
				if (sid) {
					// send to all but self

					const except = this.io.sockets.adapter.rooms.get(sid);

					if (except) {
						const self = [...except.values()];

						if (self) {
							this.io.except(sid).except(self).to(room).emit(event, data);
						}
					} else {
						this.throwError(`Room ${sid} not found`);
					}
				} else {
					// send to all
					// console.log(
					// 	`SService send to all (no sid)', event: ${event}, data: ${JSON.stringify(
					// 		data,
					// 	)}, sid: ${sid}, room: ${room}`,
					// 	`sids: ${JSON.stringify(this.io.sockets.adapter.sids)}`,
					// 	`rooms: ${JSON.stringify(this.io.sockets.adapter.rooms)}`,
					// );
					this.io.in(room).emit(event, data);
				}
			} else {
				// broadcast to all
				if (sid) {
					// send to all but self
					const except = this.io.sockets.adapter.rooms.get(sid);
					if (except) {
						const self = [...except.values()];

						if (self) {
							this.io.except(sid).emit(event, data);
						}
					} else {
						this.throwError(`Room ${sid} not found`);
					}
				} else {
					// send to all
					this.io.emit(event, data);
				}
			}
		} catch (e) {
			console.log('SService broadcast error', e);
			this.throwError(`${e instanceof Error && e.message}`);
		}
	}

	public createRoom(sessionID: string): void {
		try {
			this.validateNewNameRoom(sessionID);
			this.io.sockets.adapter.rooms.set(sessionID, new Set());
		} catch (e) {
			this.throwError(`${e instanceof Error && e.message}`);
		}
	}

	public async changeRoom(sid: string, room: string, change: ChangeRoom): Promise<void> {
		// tableau de socket de la session
		const self = await this.io.in(sid).fetchSockets();

		// les sids (Set sid socket) de la room demandee
		const sids = this.io.sockets.adapter.rooms.get(room);
		switch (change) {
			case 'leave':
				self.forEach((socket) => {
					if (!sids?.has(socket.id)) {
						this.throwError(`Session ${sid} not found in room ${room}`);
					}
				});
				this.io.in(sid).socketsLeave(room);
				break;

			case 'join':
				// console.log(
				// 	'ServerService, changeRoom, -> case join',
				// sids,
				// self,
				// room,
				// sid;
				self.forEach((socket) => {
					if (sids?.has(socket.id)) {
						const msg = `ServerService Session ${sid} already found in room ${room}`;
						this.throwError(msg);
					}
				});
				this.io.in(sid).socketsJoin(room);
				break;
		}
	}

	public forwardMessage(datas: IMessageOutgoingPayload, sid: string): void {
		if (this.isSession(sid)) {
			this.emit(sid, 'message', datas);
		} else if (this.isPublicRoom(sid)) {
			this.broadcast({
				event: 'message',
				data: datas,
				room: sid,
			});
		}
	}

	public log(): void {
		let log = `[server service]\n${this.rooms.size} rooms(s) registered`;
		let llog = `[server service]\n${this.rooms.size} rooms(s) registered`;
		this.rooms.forEach((room, sid) => {
			log += `\n ** \x1b[4m${sid}\x1b[0m contains:`;
			llog += `\n ** ${sid} contains:`;
			[...room.values()].forEach((r) => {
				log += `\n       \x1b[3m ->    ${r}\x1b[0m`;
				llog += `\n        ->    ${r}`;
			});
		});
		log += `\n\n${this.sids.size} sid(s) registered`;
		llog += `\n\n${this.sids.size} sid(s) registered`;
		this.sids.forEach((sid, room) => {
			log += `\n ** \x1b[4m${room}\x1b[0m is in:`;
			llog += `\n ** ${room} is in:`;
			[...sid.values()].forEach((sid) => {
				log += `\n       \x1b[3m ->    ${sid}\x1b[0m`;
				llog += `\n        ->    ${sid}`;
			});
		});
		logger.log(llog);
		logger.log(`============================================================`);
		console.log(log);
		console.log(`\x1b[34m============================================================\x1b[0m`);
	}

	private validateNewNameRoom(sid: string): void {
		if (this.isSid(sid)) {
			this.throwError(`Invalid new room ${sid}: private room`);
		}
		if (this.isRoom(sid)) {
			this.throwError(`Invalid new room ${sid}: already in use`);
		}

		if (sid.match(/[^a-zA-Z0-9 _-]/g)) {
			const allowed = `letters, numbers, hyphens and underscores`;
			this.throwError(`Invalid new room ${sid}: name can only contain ${allowed}`);
		}
		if (sid.length < 3) {
			this.throwError(`Invalid new room ${sid}: name must be at least 3 characters long`);
		}
		if (sid.length > 256) {
			this.throwError(`Invalid new room ${sid}: name must be at most 256 characters long`);
		}
	}
}
