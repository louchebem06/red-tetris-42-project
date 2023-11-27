import { Socket } from 'socket.io';

import { logger } from '../controller/LogController';
import ClientInfosStore from '../store/ClientInfosStore';

export class Session {
	private _sid: string;
	public clientInfosStore = new ClientInfosStore();

	public constructor(sid: string, socket: Socket) {
		this._sid = sid;
		this.push(socket);
	}

	public push(socket: Socket): void {
		this.clientInfosStore.save(socket.id, {
			socket,
			disconnectTimer: null,
		});
	}

	public get sid(): string {
		return this._sid;
	}

	public disconnect(socket: Socket): void {
		this.clientInfosStore.disconnect(socket, this.sid);
	}

	public get sockets(): Socket[] {
		const session = this.clientInfosStore.all;
		const sockets: Socket[] = [];
		session.forEach((client) => {
			client.socket !== null && sockets.push(client.socket);
		});
		return sockets;
	}

	public totalSockets(): number {
		return this.clientInfosStore.total;
	}

	public totalDisconnected(): number {
		let cnt = 0;

		for (const socket of this.clientInfosStore.all) {
			!socket?.socket?.connected && ++cnt;
		}
		return cnt;
	}

	public log(reason?: string): void {
		const player = this.sockets[0]?.data.player;
		const total = this.totalSockets();
		const nbCos = total - this.totalDisconnected();
		let log = `* Session ${this.sid} associated to player ${player?.username}\n`;
		let llog = `* Session ${this.sid} associated to player ${player?.username}\n`;
		if (reason) {
			log += `\t${reason}\n`;
			llog += `\t${reason}\n`;
		}
		log += `\tsockets: ${nbCos} / ${total}:\n`;
		llog += `\tsockets: ${nbCos} / ${total}:\n`;

		this.clientInfosStore.all.forEach((socket) => {
			if (socket?.socket?.connected) {
				log += `\t\t${socket.socket.id} - connected\n`;
				llog += `\t\t${socket.socket.id} - connected\n`;
			} else {
				log += `\t\t${socket?.socket?.id} - disconnected\n`;
				llog += `\t\t${socket?.socket?.id} - disconnected\n`;
			}
		});

		if (!process.env.UNITSTESTS) {
			logger.log(llog);
			console.log(log);
			player?.log();
		}
	}
}
