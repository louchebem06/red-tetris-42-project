import { SocketBase } from '../SocketBase';
import { EventCommand } from '.';
import PlayersManager from '../../players/PlayersManager';
import RoomManager from '../../rooms/RoomsManager';
import { IAPM } from '../payloads/types/IPayload';
// import { PayloadFactory } from '../payloads/PayloadFactory';

export class GameChange extends EventCommand {
	public constructor(
		protected base: SocketBase,
		protected pm: PlayersManager,
		protected rm: RoomManager,
	) {
		super(base, pm, rm);
	}

	public execute(): IAPM[keyof IAPM] {
		return (data: any): void => {
			// data === payload recu event gameChange
			this.pm
				.getPlayerById(this.base.getSocketData().player.sessionID)
				.then((p) => {
					p.username = data; // a changer !!!!! ne fonctionnera  sans dout pas
					// pour recup la room : this.rm.getRoom(roomId)
					// pour recup le game : room.game
					this.base.emit('gameChange', {}); // envoyer des payloads sur event gameChange
				})
				.catch((e) =>
					this.base.emit(
						'error',
						`GameChange error: \
					${(<Error>e).message}`,
					),
				);
		};
	}
}
