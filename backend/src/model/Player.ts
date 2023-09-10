import IPlayer from '../interface/IPlayer'

class Player implements IPlayer {
	username: string
	socketId: string
	active: boolean

	constructor(socketId: string, username: string = 'anon', active: boolean = false) {
		if (!socketId) throw new Error('Player: id socket is mandatory')
		if (socketId.length < 20) throw new Error('Player: format socket is invalid')
		this.socketId = socketId
		this.active = active
		if (!username) username = 'anon'
		this.username = username
	}
}

export default Player
