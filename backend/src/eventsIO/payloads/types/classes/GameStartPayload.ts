import { GameStartReason, IGameStartPayload } from '../IPayload';

type IGSP = IGameStartPayload;
class GameStartPayload implements IGameStartPayload {
	protected constructor(
		public roomName: string,
		public reason: GameStartReason,
		public message?: string,
	) {}

	public static createPayload(roomName: string, reason: GameStartReason, message?: string): IGSP {
		return new GameStartPayload(roomName, reason, message);
	}
}

export { GameStartPayload };
