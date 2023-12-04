import { Socket } from 'socket.io';
import Player from '../players/Player';
import { IAPM, IMIP, IMOP, IPlayerJSON, IRoomJSON, OAPM } from './payloads/types/IPayload';
import { PayloadFactory } from './payloads/PayloadFactory';
import { ISocketData, ServerService, logger } from '../infra';

export abstract class SocketBase {
	protected handlers: { [key: string]: IAPM[keyof IAPM] } = {} as IAPM;
	public constructor(
		protected socket: Socket,
		protected io: ServerService,
	) {}

	private on(e: keyof IAPM, cb: IAPM[keyof IAPM]): void {
		this.socket.on(e, cb);
	}

	public emit(e: keyof OAPM, p: OAPM[keyof OAPM]): void {
		const player: Player = this.socket.data.player;
		const sid = player.sessionID;
		switch (e) {
			case 'join': {
				this.broadcast(
					'playerChange',
					{
						reason: 'connecting player',
						player: player.toJSON(),
					},
					sid,
				);
				break;
			}
			case 'error': {
				p = `SOCKET ERROR: ${player.username} - id: \
${sid}, socket id: ${this.socket.id}\
error: ${p}`;
				break;
			}
			case 'roomInfo':
				logger.logContext(`emitting event [${e}]`, JSON.stringify(p), JSON.stringify(p));
				break;
		}
		this.socket.emit(e, p);
	}

	public broadcast<T extends keyof OAPM>(e: T, data: OAPM[T], sid?: string, room?: string): void {
		this.io.broadcast(PayloadFactory.createBroadcastFormat(e, data, sid, room));
	}

	public getSocket(): Socket {
		return this.socket;
	}

	public getSocketData(): ISocketData {
		return this.getSocket().data;
	}

	public forwardMessage(d: IMIP, e: IPlayerJSON, r: IPlayerJSON | undefined | IRoomJSON): void {
		const payload: IMOP = PayloadFactory.createIMOP(d.message, new Date(), e, r);
		this.io.forwardMessage(payload, d.receiver);
	}

	public listen(): void {
		for (const event in this.handlers) {
			this.on(event as keyof IAPM, this.handlers[event]);
		}
	}
}
