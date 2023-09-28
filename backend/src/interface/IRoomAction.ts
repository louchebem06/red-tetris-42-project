import { PlayerActions } from './PlayerActionsEnum';
import { IRoomActionCallback } from './IRoomActionCallback';

export interface IRoomAction {
	roomName: string;
	action: PlayerActions;
	roomActionCb: IRoomActionCallback;
}
