import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import Player from '../model/Player';
import { Session } from '../model/Session';

import { IoMiddleware } from '../type/MiddlewareTypes';

import { PC } from './PlayerController';
import { RC } from './RoomController';
import { logger } from './LogController';

class SessionController {
	private _sessions: Map<string, Session> = new Map();

	public add(sid: string, socket: Socket): void {
		socket.join(sid);
		if (!this.hasSession(sid)) {
			this._sessions.set(sid, new Session(sid, socket));
		} else {
			const session = this._sessions.get(sid);
			if (session) {
				session.push(socket);
				this._sessions.set(sid, session);
			}
		}
	}

	public update(sid: string, socket: Socket): void {
		if (this.hasSession(sid)) {
			const session = this._sessions.get(sid);
			if (session) {
				session.update(socket);
				this._sessions.set(sid, session);
			}
		}
	}

	public startSession(pc: PC, rc: RC): IoMiddleware {
		return (socket: Socket, next: (err?: Error) => void): void => {
			logger.logSocketIO(socket);
			pc.getPlayerById(socket.handshake.auth.sessionID)
				.then((player) => {
					player.connected = true;
					rc.players.forEach((player) => {
						pc.savePlayer(player.sessionID, player);
					});
					rc.rooms.forEach((room) => {
						if (room.players.includes(player)) {
							socket.join(room.name);
						}
					});
					pc.savePlayer(player.sessionID, player);
					socket.data = {
						player: player,
						playerController: pc,
						roomController: rc,
					};
					this.add(player.sessionID, socket);
					logger.log(`[SESSION] - ${JSON.stringify(player)}`);
					logger.log(`[SESSION] - ${JSON.stringify(this)}`);
					console.log('[SESSION]', player, this);
					return next();
				})
				.catch((err) => {
					const username = socket.handshake.auth.username;
					if (!username) {
						return next(new Error('invalid username'));
					}
					socket.data = {
						player: new Player(username, uuidv4()),
						playerController: pc,
						roomController: rc,
					};
					pc.savePlayer(socket.data.player.sessionID, socket.data.player);
					socket.data.player.connected = true;
					this.add(socket.data.player.sessionID, socket);
					logger.log(`[NO SESSION] - ${JSON.stringify(socket.data.player)}`);
					logger.log(`[NO SESSION] - ${JSON.stringify(this)}`);
					console.log('[NO SESSION]', socket.data.player, this, err.message);
					console.log('[NO SESSION]', pc, rc);
					next();
				});
		};
	}

	public hasSession(sid: string): boolean {
		return this._sessions.has(sid);
	}

	public disconnectSocket(sid: string, socket: Socket): void {
		if (this.hasSession(sid)) {
			const session = this._sessions.get(sid);
			if (session) {
				session.disconnect(socket);
				this._sessions.set(sid, session);
			}
		}
	}

	public log(): void {
		const llog = `${this._sessions.size} session(s) registered:\n`;
		const log = `${this._sessions.size} session(s) registered:\n`;
		logger.log(llog);
		console.log(log);
		this._sessions.forEach((session) => {
			session.log();
		});
	}
}
export const sessionController = new SessionController();
