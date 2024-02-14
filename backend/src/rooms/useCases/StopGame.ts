// import Player from '../../players/Player';
// import Room from '../Room';
// import { RoomService } from '../RoomService';
// import Game from '../../games/Game';
// import { RoomCommand } from './Base';
// export class StopGameCommand extends RoomCommand {
// 	public constructor(
// 		protected room: Room,
// 		protected service: RoomService,
// 		protected game: Game,
// 	) {
// 		super(room, service);
// 	}
// 	public execute(player: Player): void {
// 		const status = player.status(this.room.name);
// 		const started = this.room.gameState;
// 		if (started && (this.room.isLeader(player) || this.room.empty) && status === 'left') {
// 			this.room.winner = player;
// 			this.room.resetCountdown();
// 			this.room.toggleCountDownLock();
// 			this.game.finish();
// 		}
// 	}
// }
