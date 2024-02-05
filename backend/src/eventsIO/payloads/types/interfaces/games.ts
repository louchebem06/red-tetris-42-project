import { ISrvToCltPayload, GameStartReason } from './base';

interface IGameStartPayload extends ISrvToCltPayload {
	roomName: string;
	reason: GameStartReason;
	message?: string;
}

export { IGameStartPayload, GameStartReason };
