import { IGameJSON } from '../../../../games/Game';
import { IRoomState } from '../../../../rooms/roomState/IRoomState';
import { Change, ISrvToCltPayload } from './base';

interface IPlayerJSON extends ISrvToCltPayload {
	username: string;
	sessionID: string;
	dateCreated: Date;
	leads: string[];
	wins: string[];
	connected: boolean;
	games: IGameJSON[] | null; // TODO: change to IGame
	roomsState: IRoomState[];
}

interface IPlayerPayload extends ISrvToCltPayload {
	reason?: Change;
	player: IPlayerJSON;
}

export { IPlayerJSON, IPlayerPayload };
