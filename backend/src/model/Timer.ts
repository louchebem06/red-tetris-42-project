import EventEmitter from 'events';
import Player from './Player';
import Room from './Room';

export interface Timer {
	destroySession: number;
	disconnectSession: number;
	timerId: NodeJS.Timeout | null;
	countdown: number;
	startCountdown(eventEmitter: EventEmitter): (player: Player, room: Room) => void;
	resetCountdown(): void;
}
const timer: Timer = {
	destroySession: parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000,
	disconnectSession: parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000,
	timerId: null,
	countdown: 60,
	startCountdown: function (eventEmitter: EventEmitter): (player: Player, room: Room) => void {
		return (player: Player, room: Room): void => {
			this.resetCountdown();
			const updateCountdown = (): void => {
				this.countdown--;
				// console.log('countdown', this.countdown);
				const readyTimerPayload = {
					roomName: room.name,
					reason: this.countdown > 0 ? 'time' : 'start',
					message:
						this.countdown > 0
							? `The game will start in ${this.countdown} seconds.`
							: 'The game has started.',
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
		};
	},
	resetCountdown: function (): void {
		this.countdown = 60;
		if (this.timerId) {
			clearTimeout(this.timerId);
		}
	},
};
export default timer;
