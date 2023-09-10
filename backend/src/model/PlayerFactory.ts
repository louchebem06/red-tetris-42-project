import IPlayer from '../interface/IPlayer'
import Player from '../model/Player'

class PlayerFactory {
	public createPlayer(socketId: string, username: string): IPlayer {
		const player = new Player(socketId, username)
		return player
	}
}

export default PlayerFactory
