import EventEmitter from 'events';
import Player from './Player';
import Room from './Room';

export interface Timer {
	destroySession: number;
	disconnectSession: number;
	timerId: NodeJS.Timeout | null;
	countdown: number;
	lock: boolean;
	startCountdown(eventEmitter: EventEmitter): (player: Player, room: Room) => void;
	resetCountdown(): void;
}
const timer: Timer = {
	destroySession: parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000,
	disconnectSession: parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000,
	timerId: null,
	countdown: parseInt(process.env.START_GAME_TIMER ?? '60', 10),
	lock: false,
	startCountdown: function (eventEmitter: EventEmitter): (player: Player, room: Room) => void {
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
	},
	resetCountdown: function (): void {
		if (!this.lock) {
			this.countdown = parseInt(process.env.START_GAME_TIMER ?? '60', 10);
			if (this.timerId) {
				clearTimeout(this.timerId);
			}
		}
	},
};
export default timer;
