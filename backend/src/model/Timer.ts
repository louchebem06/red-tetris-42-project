import EventEmitter from 'events';
import Player from './Player';
import Room from './Room';

export class Timer {
	public destroySession: number = parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000;
	public disconnectSession: number = parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000;
	public timerId: NodeJS.Timeout | null = null;
	public countdown: number = parseInt(process.env.START_GAME_TIMER ?? '60', 10);
	public lock: boolean = false;

	public startCountdown(eventEmitter: EventEmitter): (player: Player, room: Room) => void {
		return (player: Player, room: Room): void => {
			if (!this.lock) {
				this.resetCountdown();
				const updateCountdown = (): void => {
					this.countdown--;
					// console.log('countdown', this.countdown);
					const s = this.countdown > 1 ? 's' : '';
					const msg = `The game will start in ${this.countdown} second${s}.`;
					const readyTimerPayload = {
						roomName: room.name,
						reason: this.countdown > 0 ? 'time' : 'start',
						message: this.countdown > 0 ? msg : undefined,
					};
					eventEmitter.emit('readyTimer', readyTimerPayload);
					if (this.countdown === 0) {
						eventEmitter.emit('roomReady', player, room);
						this.resetCountdown();
					} else {
						this.timerId = setTimeout(updateCountdown, 1000);
					}
				};
				updateCountdown();
			}
		};
	}
	public resetCountdown(): void {
		if (!this.lock) {
			this.countdown = parseInt(process.env.START_GAME_TIMER ?? '60', 10);
			if (this.timerId) {
				clearTimeout(this.timerId);
			}
		}
	}
}
