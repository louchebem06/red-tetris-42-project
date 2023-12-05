type Reason = "time" | "start";

export default interface IGameStartPayload {
	roomName: string,
	reason: Reason,
	message?: string
}
