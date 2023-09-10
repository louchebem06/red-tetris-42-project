import { Socket } from 'socket.io'
import PlayerManager from '../model/PlayerManager'
import Player from '../model/Player'

class PlayerController {
	private playerManager: PlayerManager = new PlayerManager()

	async createPlayer(
		socket: Socket,
		userData: {
			username?: string
			id?: string
		},
	): Promise<Player> {
		return await new Promise((resolve, reject) => {
			setTimeout(() => {
				const { username, id } = userData
				if (id && socket.id !== id) {
					reject(new Error(`${id} is not valid.`))
				} else if (username && username.indexOf('#') !== -1) {
					reject(new Error(`${username} is not valid.`))
				} else {
					const player = this.playerManager.generatePlayer(socket.id, username || 'anon')
					resolve(player)
				}
			}, 1000)
		})
	}

	deletePlayer(id: string): void {
		this.playerManager.deletePlayer(id)
	}
}

export default PlayerController
