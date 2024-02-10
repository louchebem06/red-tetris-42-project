import { SocketBase } from '../SocketBase';
import { EventCommand } from '.';
import PlayersManager from '../../players/PlayersManager';
import RoomManager from '../../rooms/RoomsManager';
import { IAPM } from '../payloads/types/IPayload';

export class LeaveRoom extends EventCommand {
	public constructor(
		protected base: SocketBase,
		protected pm: PlayersManager,
		protected rm: RoomManager,
	) {
		super(base, pm, rm);
	}

	public execute(): IAPM[keyof IAPM] {
		return (name: string): void => {
			try {
				const room = this.rm.get(name);
				if (!room) {
					throw new Error(`room ${name} does not exist`);
				}
				room.removePlayer(this.base.getSocketData().player);
			} catch (e) {
				this.base.emit('error', `LeaveRoom error: ${(<Error>e).message}`);
			}
		};
	}
}
