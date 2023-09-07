import IPlayer from "../src/interface/IPlayer"

class Player implements IPlayer {
	username?: string | undefined;
	id?: number | undefined;
	socketId?: string | undefined;
	active?: boolean | undefined;

	static nbActivePlayers = 0;

	constructor(username: string, socketId: string, active?: boolean, id?: number) {
		this.socketId = socketId;
		this.active = active || false;
		this.username = username;
		this.id = id || 0;
		Player.nbActivePlayers++;
	}

	decremente(): void {
		if (Player.nbActivePlayers > 0) {
			Player.nbActivePlayers--;
		}
	}

	getNbActivePlayers(): number {
		return Player.nbActivePlayers;
	}

}

export default Player;
