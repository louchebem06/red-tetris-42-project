import Player from '../../players/Player';
import Room from '../Room';
import { RoomService } from '../RoomService';
import { RoomCommand } from './Base';
import Game from '../../games/Game';
export class StartGameCommand extends RoomCommand {
	public constructor(
		protected room: Room,
		protected service: RoomService,
		protected game: Game,
	) {
		super(room, service);
	}
	public execute(player: Player): void {
		try {
			if (this.room.isReadytoPlay(player)) {
				this.game.start();
				this.room.all.forEach((p) => {
					if (!p.status(this.room.name)?.includes('ready')) {
						p.changeRoomStatus('idle', this.room.name);
					} else {
						// game started -> active status meaning "playing"
						p.changeRoomStatus('active', this.room.name);
					}
					p.addGame(this.room.name, this.game);
				});
				this.room.updatePlayers();
			}
		} catch (e) {
			throw new Error((<Error>e).message);
		}
	}
}
