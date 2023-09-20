import Player from './Player'
import PlayerFactory from './PlayerFactory'
import UsernameManager from './UsernameManager'

class PlayerManager {
	private players: Map<string, Player> = new Map()
	private usernamesList: UsernameManager = new UsernameManager()
	private factory: PlayerFactory = new PlayerFactory()

	private addPlayer(player: Player): void {
		//console.log(`${player.username} is joining us.`);
		//this.displayPlayers()
		this.players.set(player.socketId, player)
	}

	public getPlayerById(id: string): Player | undefined {
		return this.players.get(id)
	}

	public getPlayerUsername(id: string): string | undefined {
		const player = this.getPlayerById(id)
		return player?.username || undefined
	}

	public getPlayerState(id: string): boolean {
		const player = this.getPlayerById(id)
		return player?.active || false
	}

	// TODO methode getPlayerId depuis le username vu qu'ils sont censes
	// etre uniques

	public getNbActivePlayers(): number {
		return this.players.size
	}

	public hasPlayer(id: string): boolean {
		return this.players.has(id)
	}

	public isEmpty(): boolean {
		return !this.players.size
	}

	private createPlayer(id: string, username: string): Player | undefined {
		try {
			const display = (player: Player, username: string, id: string): void => {
				const received = `[${username} / ${id}]`
				const action = 'will be created as'
				const sent = `{${player.username} / ${player.socketId}}`
				console.log(`${received} ${action} ${sent}`)
			}
			if (username.includes('#')) {
				throw new Error('PlayerManager: forbidden symbol into username')
			}
			const player = this.factory.createPlayer(id, '')
			player.username = this.usernamesList.setNewUsername(username)
			this.addPlayer(player)
			display(player, username, id)
			return player
		} catch (e) {
			throw new Error(`PlayerManager: troubles when create player: <${e?.message}>`)
		}
	}

	private updatePlayer(id: string, username: string): void {
		const player = this.getPlayerById(id)
		if (player && player.username !== username) {
			player.username = this.usernamesList.updateUsername(player.username, username)
			this.players.set(id, player)
		}
	}

	public generatePlayer(id: string, username: string): Player | undefined {
		if (this.hasPlayer(id)) {
			//console.log(`((${username} / ${id})) already exists`)
			this.updatePlayer(id, username)
		}
		return this.getPlayerById(id) || this.createPlayer(id, username)
	}

	public deletePlayer(id: string): void {
		const username = this.getPlayerUsername(id)
		if (this.hasPlayer(id) && username) {
			this.usernamesList.removeRecurrence(username)
			this.players.delete(id)
			//console.log(`${username} is leaving us.`);
		}
		//this.displayPlayers();
	}

	public displayPlayers(): boolean {
		const nb = this.getNbActivePlayers()
		if (nb) {
			const player = nb > 1 ? 'players' : 'player'
			const msg = `${nb} ${player} ${nb > 1 ? 'are' : 'is'} online: `
			console.log(msg, this.players.values())
		}
		return nb
	}
}

export default PlayerManager
