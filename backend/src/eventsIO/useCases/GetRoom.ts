import { SocketBase } from '../SocketBase';
import { EventCommand } from '.';
import PlayersManager from '../../players/PlayersManager';
import RoomManager from '../../rooms/RoomsManager';
import { IAPM } from '../payloads/types/IPayload';

export class GetRoom extends EventCommand {
	public constructor(
		protected base: SocketBase,
		protected pm: PlayersManager,
		protected rm: RoomManager,
	) {
		super(base, pm, rm);
	}

	public execute(): IAPM[keyof IAPM] {
		return (name: string): void => {
			this.rm
				.getRoomJSON(name)
				.then((payload) => {
					this.base.emit('roomInfo', payload);
				})
				.catch((e) => {
					this.base.emit('error', `GetRoom error: ${(<Error>e).message}`);
				});
		};
	}
}
