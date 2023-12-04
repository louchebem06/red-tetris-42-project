import Room from 'rooms/Room';
import { IRoomJSON, IPlayerJSON } from '../IPayload';
import Player from 'players/Player';

// export default interface IRoomJSON {
// 	name: string;
// 	dateCreated: Date;
// 	leader: IPlayerJSON;
// 	gameState: boolean;
// 	winner: IPlayerJSON | null;
// 	players: IPlayerJSON[];
// 	totalPlayers: number;
// 	readys: IPlayerJSON[];
// 	totalReady: number;
// }

class RoomJSON {
	public name: string;
	public dateCreated: Date;
	public leader: IPlayerJSON;
	public gameState: boolean;
	public winner: IPlayerJSON | null;
	public players: IPlayerJSON[];
	public totalPlayers: number;
	public readys: IPlayerJSON[];
	public totalReady: number;

	public constructor(room: Room) {
		this.name = room.name;
		this.dateCreated = room.dateCreated;
		// this.dateCreated = room._dateCreated;
		this.leader = room.leader.toJSON() as IPlayerJSON;
		this.gameState = room.gameState;
		this.winner = (room.winner?.toJSON() as IPlayerJSON) ?? null;
		this.players = room.all.map((p: Player) => p.toJSON() as IPlayerJSON);
		// this.players = room.players.map((p: Player) => p.toJSON() as IPlayerJSON);
		this.totalPlayers = room.total;
		// this.totalPlayers = room.totalPlayers;
		this.readys = room.readyJSON;
		this.totalReady = room.totalReady;
	}

	// public static create(overrides: Partial<IRoomJSON> = {}): RoomJSON {
	// 	return {
	// 		name: undefined as unknown as string,
	// 		dateCreated: expect.any(String) as unknown as Date,
	// 		leader: undefined as unknown as IPlayerJSON,
	// 		winner: null,
	// 		gameState: false,
	// 		players: [],
	// 		totalPlayers: 0,
	// 		readys: [],
	// 		totalReady: 0,
	// 		update: (room: Room):RoomJSON => { return new RoomJSON(room)},
	// 		...overrides,
	// 	};
	// }
	// public update(room: Room): RoomJSON {
	// 	return new RoomJSON(room);
	// }

	public static createPayload(room: Room): IRoomJSON {
		return new RoomJSON(room);
	}
}

export { RoomJSON };
