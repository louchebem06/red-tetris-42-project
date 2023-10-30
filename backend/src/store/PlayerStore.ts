import IStore from '../interface/IStore';
import Player from '../model/Player';

export default class PlayerStore implements IStore<Player> {
	private players: Map<string, Player> = new Map();

	//TODO rechercher par username

	public get(id: string): Player | undefined {
		return this.players.get(id);
	}

	public save(id: string, player: Player): void {
		this.players.set(id, player);
	}

	public get all(): Player[] {
		return [...this.players.values()];
	}

	public delete(id: string): void {
		this.players.delete(id);
	}

	public get total(): number {
		return this.players.size;
	}
}
