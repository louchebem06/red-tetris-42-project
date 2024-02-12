import Player from './Player';
import { IEvent } from '../base/Observer';

export class PlayerReady implements IEvent {
	public date: Date;
	public player: Player;
	public roomId: string;
	public name: string;

	public constructor(player: Player, roomId: string) {
		this.date = new Date();
		this.player = player;
		this.roomId = roomId;
		this.name = this.constructor.name;
	}
}
