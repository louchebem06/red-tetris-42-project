import IPlayer from "../interface/IPlayer"

class Player implements IPlayer {
	username?: string;
	socketId?: string;
	active?: boolean;

	static nbActivePlayers = 0;

	constructor(socketId: string, username?: string, active: boolean = false) {
		this.socketId = socketId;
		this.active = active;
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
