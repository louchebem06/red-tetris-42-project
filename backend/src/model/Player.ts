import IPlayer from "../interface/IPlayer"

class Player implements IPlayer {
	username?: string | undefined;
	socketId?: string | undefined;
	active?: boolean | undefined;

	static nbActivePlayers = 0;

	constructor(socketId: string, username?: string, active?: boolean) {
		this.socketId = socketId;
		this.active = active || false;
		this.username = username;
		Player.nbActivePlayers++;
	}

	static decremente(): void {
		if (Player.nbActivePlayers > 0) {
			Player.nbActivePlayers--;
		}
	}

	static getNbActivePlayers(): number {
		return Player.nbActivePlayers;
	}
}

export default Player;
