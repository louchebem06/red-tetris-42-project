import { Socket } from 'socket.io';
import IStore from '../interface/IStore';
import { ClientInfos } from '../type/ClientInfosTypes';
import { eventEmitter } from '../model/EventEmitter';
// import timer from '../model/Timer';

export default class ClientInfosStore implements IStore<ClientInfos> {
	private clientsInfos: Map<string, ClientInfos> = new Map();

	public get(id: string): ClientInfos | undefined {
		return this.clientsInfos.get(id);
	}

	public save(id: string, clientInfos: ClientInfos): void {
		this.clientsInfos.set(id, clientInfos);
	}

	public get all(): ClientInfos[] {
		return [...this.clientsInfos.values()];
	}

	public delete(id: string): void {
		this.clientsInfos.delete(id);
	}

	public has(id: string): boolean {
		return this.clientsInfos.has(id);
	}

	public get total(): number {
		return this.clientsInfos.size;
	}

	public disconnect(socket: Socket, sid: string): void {
		const clientInfos = this.get(socket.id);
		if (clientInfos) {
			if (clientInfos.disconnectTimer) {
				clearTimeout(clientInfos.disconnectTimer);
			}
			const disconnectTimer = setTimeout(
				() => {
					if (this.has(socket.id)) {
						socket.disconnect();
						this.delete(socket.id);
					}
					if (this.total === 0) {
						eventEmitter.emit('sessionEmpty', sid);
					}
				},
				(parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000) / (this.total + 1),
			);
			clientInfos.disconnectTimer = disconnectTimer;
		}
	}
}
