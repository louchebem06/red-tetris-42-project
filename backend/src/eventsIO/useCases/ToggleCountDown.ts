import { SocketBase } from '../SocketBase';
import { PayloadFactory } from '../payloads/PayloadFactory';
import { IAPM } from '../payloads/types/IPayload';
import PlayersManager from '../../players/PlayersManager';
import RoomManager from '../../rooms/RoomsManager';
import { EventCommand } from '.';

export class ToggleCountDown extends EventCommand {
	public constructor(
		protected base: SocketBase,
		protected pm: PlayersManager,
		protected rm: RoomManager,
	) {
		super(base, pm, rm);
	}

	public execute(): IAPM[keyof IAPM] {
		return (room: string): void => {
			try {
				if (this.rm.has(room)) {
					this.pm
						.getPlayerById(this.base.getSocketData().player.sessionID)
						.then((player) => {
							player.changeRoomStatus('ready', room);
							this.base.broadcast(
								'playerChange',
								PayloadFactory.createPlayerPayload(player, 'ready'),
								'',
								room,
							);
						})
						.catch((e) =>
							this.base.emit(
								'error',
								`Ready error: \
								${(<Error>e).message}`,
							),
						);
				}
			} catch (e) {
				this.base.emit('error', `Ready error: ${(<Error>e).message}`);
			}
		};
	}
}
