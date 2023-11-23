import { Server /*, Socket*/ } from 'socket.io';

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

	public throwError(message: string): never {
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
		// console.log('createRoom', sessionID);
		this.validateNewNameRoom(sessionID);
		this.io.sockets.adapter.rooms.set(sessionID, new Set());
		// console.log('createRoom', this.io.sockets.adapter.rooms);
	}

	public async changeRoom(sessionID: string, room: string, change: ChangeRoom): Promise<void> {
		if (!this.isPublicRoom(room)) {
			this.throwError(`Invalid public room ${room}`);
		}

		const sockets = await this.io.to(sessionID).fetchSockets();
		const rooms = new Set();
		sockets.forEach((s) => {
			s.rooms.forEach((r) => {
				if (r !== s.id) {
					rooms.add(r);
				}
			});
		});
		try {
			switch (change) {
				case 'leave':
					if (rooms.has(room)) {
						this.io.in(sessionID).socketsLeave(room);
					} else {
						const msg = `Cannot leave room: you are not in ${room}`;
						this.emit(sessionID, 'error', msg);
					}
					break;

				case 'join':
					if (!rooms.has(room)) {
						this.io.in(sessionID).socketsJoin(room);
					} else {
						const msg = `Cannot join room: you are already in ${room}`;
						this.emit(sessionID, 'error', msg);
					}
					break;
			}
		} catch (e) {
			this.throwError(`${e instanceof Error && e.message}`);
		}
	}

	public forwardMessage(datas: IMessageOutgoingPayload, sid: string): void {
		try {
			if (this.isSession(sid)) {
				this.emit(sid, 'message', datas);
			} else if (this.isPublicRoom(sid)) {
				this.broadcast({
					event: 'message',
					data: datas,
					room: sid,
				});
			} else {
				this.throwError(`Recipient ${sid} not found`);
			}
		} catch (e) {
			this.throwError(`${e instanceof Error && e.message}`);
		}
	}

	public log(): void {
		let log = `${this.rooms.size} rooms(s) registered`;
		let llog = `${this.rooms.size} rooms(s) registered`;
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
		// logger.log(`ServerService::log:185`);
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
		if (this.isSession(sid)) {
			this.throwError(`Invalid new room ${sid}: already in use`);
		}
		if (sid.length < 3) {
			this.throwError(`Invalid new room ${sid}: name must be at least 3 characters long`);
		}
		if (sid.length > 256) {
			this.throwError(`Invalid new room ${sid}: name must be at most 256 characters long`);
		}
	}
}
