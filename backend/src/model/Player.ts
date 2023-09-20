import IPlayer from '../interface/IPlayer'

class Player implements IPlayer {
	public username: string
	public socketId: string
	public active: boolean

	public constructor(socketId: string, username: string = 'anon', active: boolean = false) {
		if (!socketId) throw new Error('Player: id socket is mandatory')
		if (socketId.length != 20) throw new Error('Player: format socket is invalid')
		this.socketId = socketId
		this.active = active
		this.username = !username ? 'anon' : username
	}
}

export default Player
