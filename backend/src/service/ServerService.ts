import { Server, Socket } from 'socket.io';
// import IRoomPayload from '../interface/IRoomPayload';
import { Payload } from '../interface/ISrvToCltEvts';
import { IBrodacastFormat } from '../interface/IBrodacastFormat';

export type ChangeRoom = 'join' | 'leave';

export default class ServerService {
	private io: Server;
	private _sessions: Map<string, Socket> = new Map();
	public constructor(io: Server) {
		this.io = io;
	}

	public setSession(socket: Socket, sessionID: string): void {
		this.sessions.set(sessionID, socket);
	}

	public updateSession(socket: Socket, sessionID: string): void {
		if (this.sessions.has(sessionID)) {
			this.sessions.set(sessionID, socket);
		} else {
			this.throwError(`Session ${sessionID} not found`);
		}
	}

	public get sessions(): Map<string, Socket> {
		return this._sessions;
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
		return this.sessions.has(sid);
	}

	private isPublicRoom(room: string): boolean {
		return this.isRoom(room) && !this.isSid(room) && !this.isSession(room);
	}

	public throwError(message: string): never {
		throw new Error(message);
	}

	private getSocket(sessionID: string): Socket {
		// console.log('sessionID', sessionID, this.sessions.entries());
		const session = this.sessions.get(sessionID);
		if (!session) {
			this.throwError(`Session ${sessionID} not found`);
		}
		const socket = this.io.sockets.sockets.get(session.id);
		if (!socket) {
			this.throwError(`Socket ${session.id} not found`);
		}
		return socket;
	}

	public emit(sid: string, event: string, data: Payload): void {
		try {
			const socket = this.getSocket(sid);
			socket.emit(event, data);
		} catch (e) {
			this.throwError(`${e instanceof Error && e.message}`);
		}
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
					const socket = this.getSocket(sid);
					socket.broadcast.to(room).emit(event, data);
				} else {
					// send to all
					this.io.in(room).emit(event, data);
				}
			} else {
				// broadcast to all
				if (sid) {
					// send to all but self
					const socket = this.getSocket(sid);
					socket.broadcast.emit(event, data);
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

	public changeRoom(sessionID: string, room: string, change: ChangeRoom): void {
		if (!this.isPublicRoom(room)) {
			this.throwError(`Invalid public room ${room}`);
		}
		const socket = this.getSocket(sessionID);
		const rooms = socket.rooms;
		try {
			switch (change) {
				case 'leave':
					if (rooms.has(room)) {
						socket.leave(room);
					} else {
						this.throwError(`Cannot leave room: you are not in ${room}`);
					}
					break;

				case 'join':
					if (!rooms.has(room)) {
						socket.join(room);
					} else {
						this.throwError(`Cannot join room: you are already in ${room}`);
					}
					break;
			}
		} catch (e) {
			this.throwError(`${e instanceof Error && e.message}`);
		}
	}

	public log(): void {
		let log = `${this.sessions.size} session(s) registered:`;
		this.sessions.forEach((session, sid) => {
			log += `\n ** \x1b[4m ${session.id} - ${sid}\x1b[0m:`;
		});
		log += `\n\n${this.rooms.size} rooms(s) registered`;
		this.rooms.forEach((room, sid) => {
			log += `\n ** \x1b[4m${sid}\x1b[0m contains:`;
			[...room.values()].forEach((r) => {
				log += `\n       \x1b[3m ->    ${r}\x1b[0m`;
			});
		});
		log += `\n\n${this.sids.size} sid(s) registered`;
		this.sids.forEach((sid, room) => {
			log += `\n ** \x1b[4m${room}\x1b[0m is in:`;
			[...sid.values()].forEach((sid) => {
				log += `\n       \x1b[3m ->    ${sid}\x1b[0m`;
			});
		});
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
