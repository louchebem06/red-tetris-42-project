import { ISrvToCltPayload, GameStartReason } from './base';
import { IPlayerJSON } from './players';

interface IGameStartPayload extends ISrvToCltPayload {
	roomName: string;
	reason: GameStartReason;
	message?: string;
}

export interface IGameJSON {
	id: string;
	gamers: IPlayerJSON[];
	winner: IPlayerJSON | null;
	state: string;
}

export { IGameStartPayload, GameStartReason };
