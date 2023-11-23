import { Socket } from 'socket.io';

import { logger } from '../controller/LogController';
import { ClientInfos } from '../type/ClientInfosTypes';

export class Session {
	private _sid: string;
	private _sockets: Map<string, ClientInfos> = new Map();

	public constructor(sid: string, socket: Socket) {
		this._sid = sid;
		this.push(socket);
	}

	public push(socket: Socket): void {
		this._sockets.set(socket.id, {
			socket,
			start: Date.parse(socket.handshake.time),
		});
	}

	public update(socket: Socket, end?: number): void {
		const cltInf = this._sockets.get(socket.id);
		if (cltInf) {
			cltInf.socket = socket;
			cltInf.end = end ?? undefined;
			this._sockets.set(socket.id, cltInf);
		}
	}

	public get sid(): string {
		return this._sid;
	}

	public disconnect(socket: Socket): void {
		this.update(socket, Date.now());
	}

	public has(socket: Socket): boolean {
		return this._sockets.has(socket.id);
	}

	public delete(socket: Socket): void {
		if (this.has(socket)) {
			this._sockets.delete(socket.id);
		}
	}

	public totalSockets(): number {
		return this._sockets.size;
	}

	public totalDisconnected(): number {
		let cnt = 0;

		for (const socket of this._sockets.values()) {
			if (!socket?.socket?.connected) {
				++cnt;
			}
		}
		return cnt;
	}

	public lastConnection(): ClientInfos | null {
		let last: ClientInfos = {
			socket: null,
			start: 0,
		};

		for (const socket of this._sockets.values()) {
			if (socket.start > last.start) {
				last = socket;
			}
		}
		return last ?? null;
	}

	public lastDisconnection(): ClientInfos | null {
		let last: ClientInfos = {
			socket: null,
			start: 0,
			end: 0,
		};

		for (const socket of this._sockets.values()) {
			if (socket.end) {
				if (socket.end > (last.end ?? 0)) {
					last = socket;
				}
			}
		}
		return last ?? null;
	}

	public prune(): void {
		if (this.totalDisconnected() === this.totalSockets()) {
			setTimeout(() => {
				if (this.totalDisconnected() === this.totalSockets()) {
					const lastDisconnection = this.lastDisconnection();
					const socket = lastDisconnection?.socket;
					if (socket) {
						// remove player des rooms du room controller
						// remove player du player controller
						// remove session du session controller
					}
				}
			}, 5000);
			// attendre une reconnexion
			// purger si elle vient pas: playercontroller + roomcontroller
		} else {
			const lastDisconnection = this.lastDisconnection();
			const lastConnection = this.lastConnection();

			if (lastConnection && lastDisconnection?.end) {
				if (lastDisconnection.end >= lastConnection.start) {
					// pas eu de reco encore;
					// si nb deco === nb sockets -> pas de reco encore
				} else if (lastDisconnection.end < lastConnection.start) {
					//il y a eu reco on peut virer la ClientInfos;
					if (lastDisconnection.socket) {
						this.delete(lastDisconnection.socket);
					}
				}
			}
		}
	}

	public log(): void {
		const lastConnection = this.lastConnection();
		const lastDisconnection = this.lastDisconnection();

		const player = lastConnection?.socket?.data?.player;
		const username = player?.username ?? '[null]';

		const total = this.totalSockets();
		const nbCos = total - this.totalDisconnected();
		let log = `* Session ${this.sid} associated to player ${username}\n`;
		let llog = `* Session ${this.sid} associated to player ${username}\n`;
		log += `\tsockets: ${nbCos} / ${total}:\n`;
		llog += `\tsockets: ${nbCos} / ${total}:\n`;

		this._sockets.forEach((socket) => {
			if (socket?.socket?.connected) {
				log += `\t\t${socket.socket.id} - connected\n`;
				llog += `\t\t${socket.socket.id} - connected\n`;
			} else {
				log += `\t\t${socket?.socket?.id} - disconnected\n`;
				llog += `\t\t${socket?.socket?.id} - disconnected\n`;
			}
		});

		log += `\tlast connection: ${lastConnection?.start}\n`;
		llog += `\tlast connection: ${lastConnection?.start}\n`;
		log += `\tlast disconnection: ${lastDisconnection?.end}\n`;
		llog += `\tlast disconnection: ${lastDisconnection?.end}\n`;
		logger.log(llog);
		console.log(log);
		player.log();
	}
}
