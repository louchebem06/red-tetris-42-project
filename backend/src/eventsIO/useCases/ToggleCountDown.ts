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
			// 		(name: string, player: Player): void {
			// 	try {
			// 		const room = this.get(name);
			// 		if (room?.isLeader(player)) {
			// 			if (room.countdown === parseInt(process.env.START_GAME_TIMER ?? '60', 10)) {
			// 				room.startCountdown(eventEmitter)(player, room);
			// 			} else {
			// 				room.resetCountdown();
			// 			}
			// 			room.lock = !room.lock;
			// 		} else {
			// 			throw new Error(`Countdown can only be toggled by the room leader`);
			// 		}
			// 	} catch (e) {
			// 		throw new Error(`RoomController \
			// toggleCountdownGame Error: ${ (<Error>e).message }`);
			// 	}
			// }
			// public toggleCountDownGame(rc: RC): (name: string) => void {
			// 	return (name: string): void => {
			// 		try {
			// 			// TODO a implementer depuis la room
			// 			console.log('c kiki ', name, this.socket.data.player);
			// 			// rc.toggleCountdownGame(name, this.socket.data.player);
			// 		} catch (e) {
			// 			this.emitError(`${(<Error>e).message}`);
			// 		}
			// 	};
			// }
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
							// console.error(player.roomState(room));
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
