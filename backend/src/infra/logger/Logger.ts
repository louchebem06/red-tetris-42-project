import fs from 'fs';

import { Socket } from 'socket.io';

// TODO helpers pour log a socket et game a faire1
export class Logger {
	private logFileName: string;
	private stream: fs.WriteStream;
	private endSymbols: string = `${'>'.repeat(60)}>\n`;

	public constructor() {
		if (process.env.DEV || process.env.UNITSTESTS) {
			this.logFileName = `${process.cwd()}/logs/devlogs.txt`;
			console.log(`Starting log at ${this.logFileName}`);
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

	private stamp(): string {
		return new Date().toISOString();
	}

	private addStamp(content: string): string {
		return `[${this.stamp()}]:${content.toString().toUpperCase()}`;
	}

	private setContent(message: string, context: string = 'logging'): string {
		let content = this.addStamp(`start ${context}\n`);
		content += `${message}\n`;
		content += this.addStamp(`end ${context}\n`);
		content += this.endSymbols;
		return content;
	}

	public log(message: string): void {
		this.write(this.setContent(message));
	}

	public logContext(message: string, context?: string, format?: string): void {
		if (!format && !context) {
			this.log(message);
		} else {
			this.write(this.setContent(message, context));
			if (format) console.log(`${context}\n${format}`);
		}
	}

	private write(content: string): void {
		this.stream.write(content, this.logError);

		// this.stream.write('\n', this.logError);
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

		const pl = data.player;
		content += `data.player:\n${JSON.stringify(pl)}\n`;
		content += `
********************************************************************************`;
		this.write(content);
	}
}
export const logger = new Logger();
