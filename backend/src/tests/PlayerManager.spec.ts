import PlayerManager from '../model/PlayerManager'
import Player from '../model/Player'

describe.skip('Player Manager', () => {
	const manager: PlayerManager = new PlayerManager()

	beforeAll((done) => {
		done()
	})
	afterAll((done) => {
		done()
	})

	test('Init', (done) => {
		const player: Player = new Player('6P4I-snhy8uGZxkgAAA', 'Blibli')
		manager.addPlayer(player)
		done()
	})
})
