import Room from '../../rooms/Room';
import Player from '../../players/Player';
import { GameCommand } from './GameCommand';

export class StopGameCommand extends GameCommand {
	public constructor(
		protected room: Room,
		protected player: Player,
	) {
		super(room);
	}
	public execute(): void {
		const status = this.player.status(this.room.name);
		const started = this.room.gameState;
		if (started && (this.room.isLeader(this.player) || this.room.empty) && status === 'left') {
			this.room.winner = this.player;
			this.room.game?.stop();
		}
	}
}
