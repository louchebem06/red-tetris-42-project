import { ISrvToCltPayload } from './base';
import { IPlayerJSON, IPlayerPayload } from './players';

interface IRoomJSON extends ISrvToCltPayload {
	name: string;
	dateCreated: Date;
	leader: IPlayerJSON;
	gameState: boolean;
	winner: IPlayerJSON | null;
	players: IPlayerJSON[];
	totalPlayers: number;
	readys: IPlayerJSON[];
	totalReady: number;
}

interface IRoomPayload extends IPlayerPayload {
	room: IRoomJSON;
}

export { IRoomJSON, IRoomPayload };
