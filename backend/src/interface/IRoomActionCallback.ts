import Player from '../model/Player';

export interface IRoomActionCallback {
	(roomName: string): Promise<Player>;
}
