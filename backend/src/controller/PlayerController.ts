import { Socket } from 'socket.io'
import PlayerManager from '../model/PlayerManager'
import Player from '../model/Player'

class PlayerController {
	private playerManager: PlayerManager = new PlayerManager()

	async createPlayer(
		socket: Socket,
		userData: {
			usrnm?: string
			id?: string
		},
	): Promise<Player> {
		return await new Promise((resolve, reject) => {
			setTimeout(() => {
				let msg = `PlayerController: troubles when create player`
				const { usrnm, id } = userData
				if (id && socket.id !== id) {
					reject(new Error(`${id} is not valid.`))
				} else if (usrnm && usrnm.indexOf('#') !== -1) {
					reject(new Error(`${usrnm} is not valid.`))
				} else {
					try {
						const player = this.playerManager.generatePlayer(socket.id, usrnm || 'anon')
						if (player) {
							resolve(player)
						} else {
							reject(new Error(msg))
						}
					} catch (e) {
						if (e instanceof Error) {
							msg += ` <${e?.message}>`
							throw new Error(msg)
						}
					}
				}
			}, 1000)
		})
	}

	deletePlayer(id: string): void {
		this.playerManager.deletePlayer(id)
	}
}

export default PlayerController
