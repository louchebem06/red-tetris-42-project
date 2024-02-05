import { Server } from 'socket.io';

import { logger } from '../';

import { IBrodacastFormat, IMOP, OAPM } from 'eventsIO/payloads/types/IPayload';
import { ChangeRoom } from '../../rooms/types';

export class ServerService {
	public constructor(protected io: Server) {}

	protected get sids(): Map<string, Set<string>> {
		/*
		 * key: socket id
		 * value: set of rooms which socket.id is in
		 * Map(1) {
		 *	'62mwJK-wkNinwAKSAAAB' => Set(3) {
		 *		'3eda937c-f71d-401c-9e54-df71d498fa19',
		 *		'62mwJK-wkNinwAKSAAAB',
		 *		'Donaldville'
		 *	}
		 * }
		 */
		return this.io.sockets.adapter.sids;
	}

	protected get rooms(): Map<string, Set<string>> {
		/*
		 * key: room name
		 * value: set of socket ids that are in the room
		 * Map(5) {
		 * '3eda937c-f71d-401c-9e54-df71d498fa19' => Set(1) { '62mwJK-wkNinwAKSAAAB' },
		 * '62mwJK-wkNinwAKSAAAB' => Set(1) { '62mwJK-wkNinwAKSAAAB' },
		 * 'Donaldville' => Set(1) { '62mwJK-wkNinwAKSAAAB' },
		 * 'Minnie' => Set(0) {},
		 * 'aaaaaaaaaaaaaaaaaaaaaaaaa' => Set(0) {}
		 * }
		 */
		return this.io.sockets.adapter.rooms;
	}

	protected getRoom(name: string): Set<string> | undefined {
		return this.rooms.get(name);
	}

	protected isRoom(sid: string): boolean {
		return this.rooms.has(sid);
	}

	protected isSid(sid: string): boolean {
		return this.sids.has(sid);
	}

	// protected isSession(sid: string): boolean {
	// 	return session.hasSession(sid);
	// }

	protected isPublicRoom(room: string): boolean {
		return this.isRoom(room) && !this.isSid(room);
		// return this.isRoom(room) && !this.isSid(room) && !this.isSession(room);
	}

	protected throwError(message: string): never {
		// console.trace('server Service throwError:', message);
		throw new Error(message);
	}

	public emit(sid: string, event: string, data: OAPM[keyof OAPM]): void {
		// if (!this.isSession(sid)) {
		// 	this.throwError(`Session ${sid} not found`);
		// }
		this.io.to(sid).emit(event, data);
	}

	public broadcast(datas: IBrodacastFormat): void {
		try {
			const { event, data, sid, room } = datas;
			// console.log('SService', event, data, sid, room);
			if (room) {
				// broadcast to room
				if (!this.isPublicRoom(room)) {
					// console.error(``, this.rooms, this.sids, this.io, this.io.sockets, this.io.sockets.adapter)
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
			// console.log('SService broadcast error', e);
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

	/**
	 * Change the room for a given session.
	 *
	 * @param {string} sid - The session ID.
	 * 					-> expected like cb3334ef-a7ca-428f-8589-849823de80c9
	 * @param {string} room - The name of the room to change to.
	 * 					-> expected like room-1
	 * @param {ChangeRoom} change - The type of change to make (leave or join).
	 * @return {Promise<void>} A Promise that resolves once the room change is complete.
	 */
	public changeRoom(sid: string, name: string, change: ChangeRoom): void {
		// tableau de socket de la session
		const self = this.rooms.get(sid);
		if (!self) {
			this.throwError(`Session ${sid} not found`);
		}
		// const self = await this.io.in(sid).fetchSockets();

		// les sids (Set sid socket) de la room demandee
		// const sids = this.io.sockets.adapter.rooms.get(room);
		const room = this.rooms.get(name);
		switch (change) {
			case 'leave': {
				if (!room) {
					this.throwError(`Cannot leave room that does not exist: ${name}`);
				}
				self.forEach((sid) => {
					if (!room.has(sid)) {
						this.throwError(`Session ${sid} not found in room ${room}`);
					}
				});
				this.io.in(sid).socketsLeave(name);
				break;
			}

			case 'join': {
				if (!room) {
					this.throwError(`Cannot join room that does not exist: ${name}`);
				}
				self.forEach((sid) => {
					if (room.has(sid)) {
						this.throwError(`Cannot join room which you already are in: ${name}`);
					}
				});
				// console.error('join', sid, room, this.sids);
				this.io.in(sid).socketsJoin(name);
				// console.error('join', sid, room, this.sids);
				break;
			}
		}
	}

	public forwardMessage(datas: IMOP, sid: string): void {
		if (this.isSid(sid)) {
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

	protected validateNewNameRoom(sid: string): void {
		if (this.isSid(sid)) {
			this.throwError(`Invalid new room ${sid}: protected room`);
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
