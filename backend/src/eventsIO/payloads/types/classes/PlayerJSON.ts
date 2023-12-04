// import { State } from "type/PlayerWaitingRoomState";

import Player from '../../../../players/Player';
import { IRoomState } from '../../../../rooms/roomState/IRoomState';
import { IPlayerJSON } from '../IPayload';

class PlayerJSON implements IPlayerJSON {
	public username: string;
	public sessionID: string;
	public dateCreated: Date;
	public leads: string[];
	public wins: string[];
	public connected: boolean;
	public games: object[]; // TODO: change to IGame
	public roomsState: IRoomState[];

	private constructor(player: Player) {
		this.username = player.username;
		this.sessionID = player.sessionID;
		this.dateCreated = player.dateCreated;
		this.leads = player.leads;
		this.wins = player.wins;
		this.connected = player.connected;
		this.games = player.games;
		this.roomsState = player.rooms;
	}

	// public static create(overrides: Partial<IPlayerJSON> = {}): PlayerJSON {
	// 	return {
	// 		username: undefined as unknown as string,
	// 		sessionID: undefined as unknown as string,
	// 		dateCreated: expect.any(String) as unknown as Date,
	// 		leads: [],
	// 		wins: [],
	// 		connected: true,
	// 		games: [],
	// 		roomsState: [],
	// 		update: (player: Player): PlayerJSON => {
	// 			return new PlayerJSON(player);
	// 		},
	// 		...overrides,
	// 	};
	// }

	// public update(player: Player): PlayerJSON {
	// 	return new PlayerJSON(player);
	// }

	public static createPayload(player: Player): IPlayerJSON {
		return new PlayerJSON(player);
	}
}

export { PlayerJSON };
