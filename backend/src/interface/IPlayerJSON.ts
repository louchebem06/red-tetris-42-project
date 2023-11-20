// import { State } from "type/PlayerWaitingRoomState";

import { IRoomState } from './IRoomState';

export default interface IPlayerJSON {
	username: string;
	sessionID: string;
	dateCreated: Date;
	leads: string[];
	wins: string[];
	connected: boolean;
	games: Map<string, object>;
	roomsState: IRoomState[];
}
