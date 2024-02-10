import Player from 'players/Player';
import { RoomService } from './RoomService';
import { RoomPlayersBase } from './stores';
import { Timer } from './Timer';
import { Observable } from '../base/Observer';
import Room from './Room';
import { logger } from '../infra';

export class RoomPropsBase extends RoomPlayersBase {
	public destroySession: number;
	public disconnectSession: number;
	public timerId: NodeJS.Timeout | null;
	public countdown: number;
	public lock: boolean;
	public constructor(
		public name: string,
		protected service: RoomService,
		public leader: Player,
		public dateCreated: Date = new Date(),
		protected timer: Timer = new Timer(),
	) {
		super(name);
		this.leader.leads = this.name;

		this.destroySession = timer.destroySession;
		this.disconnectSession = timer.disconnectSession;
		this.timerId = timer.timerId;
		this.countdown = timer.countdown;
		this.lock = timer.lock;
	}

	public update(eventId: string, observable: Observable): void {
		this.timer.update(eventId, observable);
	}

	public startCountdown(player: Player, room: Room): void {
		try {
			this.timer.startCountdown(player, room);
		} catch (e) {
			throw new Error((<Error>e).message);
		}
	}

	public resetCountdown(): void {
		this.timer.resetCountdown();
	}

	public isLeader(player: Player): boolean {
		return this.leader === player;
	}

	// TODO => faire ca! (player a enlever du proto et repercuter les diff apls)
	public canStartGame(player: Player): boolean {
		logger.logContext('RoomPropsBase.canStartGame', `player: ${player.username}, room: ${this.name}`);
		return this.arePlayersReady;
		// return this.isLeader(player) || this.arePlayersReady;
	}
}
