import { State } from 'type/PlayerWaitingRoomState';

export interface IRoomState {
	name: string;
	status: State;
	leads: boolean;
	wins?: boolean | undefined;
	readys: number;
	started: boolean;
}
