import { SocketBase } from '../SocketBase';
import { EventCommand } from '.';
import PlayersManager from '../../players/PlayersManager';
import RoomManager from '../../rooms/RoomsManager';
import { IAPM } from '../payloads/types/IPayload';
import { TypeAction } from '../../games/GameLogic';

export class GameChange extends EventCommand {
	public constructor(
		protected base: SocketBase,
		protected pm: PlayersManager,
		protected rm: RoomManager,
	) {
		super(base, pm, rm);
	}

	public execute(): IAPM[keyof IAPM] {
		// TODO besoin d'avoir aussi le nom de la room dans le payload incoming
		return (data: { action: TypeAction; room: string }): void => {
			try {
				const { action, room } = data;
				const player = this.base.getSocketData().player;

				if (this.rm.get(room)) {
					// ecoute le front et
					// le donne a gameLogic.action(sid, action) -> apl au travers de room.play(player, action)
					this.rm.get(room)?.play(player, action);
				} else {
					throw new Error(`GameChange: room ${room} inexistant
payload: ${JSON.stringify(data)}`);
				}
			} catch (e) {
				this.base.emit('error', `GameChange error: ${(<Error>e).message}`);
			}
		};
	}
}
