import Player from './Player'
import PlayerFactory from './PlayerFactory'
import UsernameManager from './UsernameManager'

class PlayerManager {
	private players: Map<string, Player> = new Map()
	private usernamesList: UsernameManager = new UsernameManager()
	private factory: PlayerFactory = new PlayerFactory()

	addPlayer(player: Player): void {
		//console.log(`${player.username} is joining us.`);
		//this.displayPlayers()
		this.players.set(player.socketId, player)
	}

	getPlayerById(id: string): Player | undefined {
		return this.players.get(id)
	}

	getPlayerUsername(id: string): string | undefined {
		const player = this.getPlayerById(id)
		return player?.username || undefined
	}

	getPlayerState(id: string): boolean {
		const player = this.getPlayerById(id)
		return player?.active || false
	}

	// TODO methode getPlayerId depuis le username vu qu'ils sont censes
	// etre uniques

	getNbActivePlayers(): number {
		return this.players.size
	}

	hasPlayer(id: string): boolean {
		return this.players.has(id)
	}

	createPlayer(id: string, username: string): Player | undefined {
		try {
			const player = this.factory.createPlayer(id, '')
			player.username = this.usernamesList.setNewUsername(username)
			this.addPlayer(player)
			return player
		} catch (e) {
			if (e instanceof Error) {
				throw new Error(`PlayerManager: troubles when create player: <${e?.message}>`)
			}
		}
		return undefined
	}

	updatePlayer(id: string, username: string): void {
		if (this.hasPlayer(id)) {
			const player = this.getPlayerById(id)
			if (player && player.username !== username) {
				player.username = this.usernamesList.updateUsername(player.username, username)
				this.players.set(id, player)
			}
		}
	}

	generatePlayer(id: string, username: string): Player | undefined {
		if (this.hasPlayer(id)) {
			this.updatePlayer(id, username)
		}
		return this.getPlayerById(id) || this.createPlayer(id, username)
	}

	deletePlayer(id: string): void {
		const username = this.getPlayerUsername(id)
		if (this.hasPlayer(id) && username) {
			this.usernamesList.removeRecurrence(username)
			this.players.delete(id)
			//console.log(`${username} is leaving us.`);
		}
		//this.displayPlayers();
	}

	displayPlayers(): void {
		const nb = this.getNbActivePlayers()
		const s = nb > 1 ? 's' : ''
		const be = nb > 1 ? 'are' : 'is'
		console.log(`${nb} player${s} ${be} online: `, this.players.values())
	}
}

export default PlayerManager
