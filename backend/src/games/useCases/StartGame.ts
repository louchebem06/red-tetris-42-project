import Room from '../../rooms/Room';
import Player from '../../players/Player';
import { PlayerState } from 'players/types';
import { CreateGameCommand } from '.';
import { GameCommand } from './GameCommand';

export class StartGameCommand extends GameCommand {
	public constructor(
		protected room: Room,
		protected player: Player,
	) {
		super(room);
	}

	public execute(): void {
		const room = this.room;
		const player = this.player;
		const sid = player.sessionID;
		const username = player.username;
		const hasPlayer = room.has(sid);
		const isReadytoPlay = room.isReadytoPlay(player);
		try {
			if ((hasPlayer && isReadytoPlay) || (room.isLeader(player) && room.lock)) {
				room.all.forEach((p) => {
					let playerStatus: PlayerState = 'active';
					if (!p.status(room.name)?.includes('ready')) {
						playerStatus = 'idle';
					}
					p.changeRoomStatus(playerStatus, room.name);
				});
				const game = new CreateGameCommand(room).execute();
				room.addGame(game);
				game.start();
			} else {
				throw new Error(
					`Room: play: player ${username}(${sid}) \
					not in room ${room.name} or room not ready to play: ${hasPlayer}.`,
				);
			}
		} catch (e) {
			throw new Error((<Error>e).message);
		}
	}
}
