import fs from 'fs';

import { Socket } from 'socket.io';

export class LogController {
	private logFileName: string;
	private stream: fs.WriteStream;

	public constructor() {
		if (process.env.DEV || process.env.UNITSTESTS) {
			this.logFileName = `${process.cwd()}/logs/devlogs.txt`;
		} else {
			this.logFileName = `${process.cwd()}/logs/${Date.now()}.txt`;
		}
		this.stream = fs.createWriteStream(this.logFileName, {
			flags: 'a',
			encoding: 'utf8',
			autoClose: true,
		});
		this.log(`Starting log at ${this.logFileName}`);
	}

	public log(message: string): void {
		const ds = new Date();
		const content = `${message}\n`;
		this.write(`[${ds.toISOString()}]:\tSTART LOGGING\n`);
		this.write(content);
		const df = new Date();
		this.write(`[${df.toISOString()}]:\tEND LOGGING\n`);
		this.write(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n`);
	}

	private write(content: string, ...args: string[]): void {
		this.stream.write(content, this.logError);
		if (args.length > 0) {
			this.stream.write(args.join('\n'), this.logError);
		}
		this.stream.write('\n', this.logError);
	}

	private logError(err: Error | null | undefined): void {
		if (err) {
			console.log('LOG ERROR', err);
		}
	}

	public logSocketIO(socket: Socket): void {
		const handshake = socket.handshake;
		const request = socket.request;
		const data = socket.data;
		const id = socket.id.toString();
		const nsp = socket.nsp.name.toString();
		const rooms = socket.rooms;

		const nbCltsNsp = socket.nsp.sockets.size;
		const remoteAddr = socket.conn.remoteAddress;
		const availablesRooms = socket.nsp.adapter.rooms;
		const availablesSids = socket.nsp.adapter.sids;
		const nbCltSrvsocket = socket.nsp.server.engine.clientsCount;

		const s = {
			c: socket.connected,
			d: socket.disconnected,
			r: socket.recovered,
		};

		const a = {
			r: [...availablesRooms.keys()].join(','),
			s: [...availablesSids.keys()].join(','),
			n: nbCltsNsp.toString(),
			cl: nbCltSrvsocket.toString(),
			addr: remoteAddr.toString(),
		};
		const dd = new Date();
		let content = `[${dd.toISOString()}]:

Socket id <${id}> for namespace <${nsp}>.
state: ${s.c ? 'connected' : 'disconnected'} (${!s.r && 'not '}recovered).\n`;
		content += `handshake: ${JSON.stringify(handshake)}\n`;

		content += `rooms (on server) : ${a.r}\n`;
		content += `rooms that the socket is in: ${JSON.stringify(rooms)}\n`;
		content += `sids (on server) : ${a.s}\n`;
		content += `amount clts : namespace : ${a.n}, server : ${a.cl}\n`;
		content += `remoteAddr : ${a.addr}\n`;

		content += `request.url: ${JSON.stringify(request.url)}\n`;
		content += `request.headers: ${JSON.stringify(request.headers)}\n`;
		content += `request.method: ${JSON.stringify(request.method)}\n`;

		if (data) {
			const pc = data.playerController;
			content += `data.playerController:\n`;
			if (pc) {
				const keys = Object.keys(pc);
				const values = Object.values(pc);
				for (let i = 0; i < keys.length; i++) {
					if (typeof values[i] !== 'function') {
						if (typeof values[i] === 'object') {
							content += `${keys[i]}: ${values[i]}\n`;
						} else if (Array.isArray(values[i])) {
							content += `${keys[i]}: ${(values[i] as []).join(', ')}\n`;
						} else {
							content += `${keys[i]}: ${values[i]}\n`;
						}
					}
				}
			} else {
				content += `(null)\n`;
			}
			const rc = data.roomController;
			content += `data.roomController:\n`;
			if (rc) {
				const keys = Object.keys(rc);
				const values = Object.values(rc);
				for (let i = 0; i < keys.length; i++) {
					if (typeof values[i] !== 'function') {
						if (typeof values[i] === 'object') {
							content += `${keys[i]}: ${values[i]}\n`;
						} else if (Array.isArray(values[i])) {
							content += `${keys[i]}: ${(values[i] as []).join(', ')}\n`;
						} else {
							content += `${keys[i]}: ${values[i]}\n`;
						}
					}
				}
				// content += `${rc}\n`;
				// rc.log(socket, () => {});
			} else {
				content += `(null)\n`;
			}
			const pl = data.player;
			content += `data.player:\n`;
			if (rc) {
				content += `${JSON.stringify(pl)}\n`;
			} else {
				content += `(null)\n`;
			}
		}
		content += `
********************************************************************************`;
		this.write(content);
	}
}

export const logger = new LogController();
