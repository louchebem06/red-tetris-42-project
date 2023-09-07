import IPlayer from "../interface/IPlayer"

class Player implements IPlayer {
	username?: string | undefined;
	id?: number | undefined;
	socketId?: string | undefined;
	active?: boolean | undefined;

	static nbActivePlayers = 0;

	constructor(socketId: string, username?: string, active?: boolean, id?: number) {
		this.socketId = socketId;
		this.active = active || false;
		this.username = username;
		this.id = id || 0;
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

	getUsername(): string | undefined {
		if (this.id && this.id > 0) {
			return this.username + this.id.toString();
		}
		return this.username;
	}

}

export default Player;
