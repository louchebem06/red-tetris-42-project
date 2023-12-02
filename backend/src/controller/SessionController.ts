import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import Player from '../model/Player';
import { Session } from '../model/Session';

import { IRoomState } from '../interface/IRoomState';
import { IoMiddleware } from '../type/MiddlewareTypes';

import { PC } from './PlayerController';
import { RC } from './RoomController';
import { logger } from './LogController';
import { eventEmitter } from '../model/EventEmitter';
import timer from '../model/Timer';
import SessionStore from '../store/SessionStore';

class SessionController {
	private sessionStore = new SessionStore();
	// private _sessions: Map<string, Session> = new Map();
	// <sid, <session, player>>
	// TODO A VIRER _leftTooSoon une fois que la bdd sera installée
	private _leftTooSoon: Map<string, { s: Session; p: Player }> = new Map();

	private add(sid: string, socket: Socket): void {
		socket.join(sid);
		if (!this.hasSession(sid)) {
			this.sessionStore.save(sid, new Session(sid, socket));
		} else {
			const session = this.sessionStore.get(sid);
			if (session) {
				session.push(socket);
				this.sessionStore.save(sid, session);
			}
		}
	}

	private get sessions(): Session[] {
		return this.sessionStore.all;
	}

	public startSession(pc: PC, rc: RC): IoMiddleware {
		const microLog = (p: Player, pc: PC, rc: RC, s: boolean): void => {
			const state = s ? 'NO ' : '';
			logger.log(`[${state}SESSION] - ${JSON.stringify({ p, sess: this })}, ${rc}, ${pc}`);
			console.log(`[${state}SESSION] - ${JSON.stringify({ p, sess: this })}, ${rc}, ${pc}`);
			rc.log();
			pc.log();
			p.log();
			this.log();
		};

		return (socket: Socket, next: (err?: Error) => void): void => {
			eventEmitter.onSessionEmpty(this.closeSession(socket, pc, rc));
			const save = (p: Player): void => {
				p.connected = true;
				socket.data = {
					player: p,
				};
				p.log();
				pc.savePlayer(p.sessionID, p);
				this.add(p.sessionID, socket);
			};

			const createPlayer = (sid: string): Player => {
				try {
					let player: Player;
					const data = this._leftTooSoon.get(sid) ?? null;
					if (data) {
						logger.log(`[LEFT TOO SOON ONLINE] - ${JSON.stringify({ data })}`);
						player = this.restoreSession(data, rc);
					} else {
						const username = socket.handshake.auth?.username;
						if (!username) {
							throw new Error('invalid username');
						}
						player = new Player(username, uuidv4());
					}
					player.log();
					return player;
				} catch (err) {
					throw new Error((<Error>err).message);
				}
			};

			logger.logSocketIO(socket);

			pc.getPlayerById(socket.handshake.auth.sessionID)
				.then((player) => {
					player.connected = true;
					rc.rooms.forEach((room) => {
						if (room.players.includes(player)) {
							socket.join(room.name);
						}
					});
					save(player);
					microLog(player, pc, rc, false);
					return next();
				})
				.catch(() => {
					try {
						const player: Player = createPlayer(socket.handshake.auth.sessionID);
						save(player);

						microLog(socket.data.player, pc, rc, true);

						next();
					} catch (err) {
						next(<Error>err);
					}
				});
		};
	}

	private closeSession(socket: Socket, pc: PC, rc: RC): (sid: string) => void {
		return (sid: string): void => {
			try {
				const player = socket.data.player;
				const session = this.sessionStore.get(sid);

				if (session && session.sockets.length === 0) {
					rc.disconnectPlayer(player);

					setTimeout(() => {
						if (session && session.sockets.length === 0) {
							this.sessionStore.delete(sid);
							this._leftTooSoon.set(sid, { s: session, p: player });
							logger.log(`[LEFT TOO SOON] - ${JSON.stringify({ player, sid })}`);
							pc.removePlayer(sid);
						}
					}, timer.destroySession);
				}
			} catch (e) {
				const msg = `[SESSION EMPTY] - Something has disturbed: ${(<Error>e).message}`;
				logger.log(msg);
			}
		};
	}

	private restoreSession(data: { s: Session; p: Player }, rc: RC): Player {
		try {
			const player = data.p;
			const roomsState = player.roomsState;
			roomsState.forEach((state: IRoomState) => {
				if (state.leads) {
					rc.create(state.name, player);
					rc.join(state.name, player);
				} else if (rc.hasRoom(state.name)) {
					rc.join(state.name, player);
				}
			});
			this._leftTooSoon.delete(player.sessionID);
			return player;
		} catch (err) {
			throw <Error>err;
		}
	}

	public hasSession(sid: string): boolean {
		return this.sessionStore.has(sid);
	}

	public disconnectSocket(sid: string, socket: Socket): void {
		this.sessionStore.get(sid)?.disconnect(socket);
	}

	public log(): void {
		const llog = `${this.sessionStore.total} session(s) registered:\n`;
		const log = `${this.sessionStore.total} session(s) registered:\n`;
		logger.log(llog);
		console.log(log);
		this.sessions.forEach((session) => {
			session.log();
		});
	}
}
export const sessionController = new SessionController();
