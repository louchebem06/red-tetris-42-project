import PlayerManager from '../model/PlayerManager'
import Player from '../model/Player'

type DataPlayer = { pos: number; username: string; id: string }
const pool: DataPlayer[] = [
	{ pos: 1, username: 'Blibli', id: '6P4I-snlewpocxnnAAAH' },
	{ pos: 2, username: 'Blibli', id: '6P4I-sABCDkgAAAH' },
	{ pos: 3, username: 'Blibli', id: '' },
	{ pos: 4, username: 'Blibli', id: '6P4I-snhy8uGZxkgAAAH' },
	{ pos: 5, username: 'Blibli', id: '6P4I-snhy8uGZxkgAAAH' },
	{ pos: 6, username: 'Blibli', id: '6P4I-snhy8uGZxkgAbcH' },
	{ pos: 7, username: 'Blibli#1', id: '6P4I-snhy8uGZxkgABAH' },
	{ pos: 8, username: 'Blibli#1', id: '6P4I-snhy8uGZxkgAAAH' },
	{ pos: 9, username: '', id: '' },
]

const poolUpdates: DataPlayer[] = [
	{ pos: 1, username: 'Marvin', id: '6P4I-snl545mfxnnAAAH' },
	{ pos: 1, username: 'Marvin', id: '6P4I-snl822mfxnnAAAH' },
	{ pos: 1, username: 'Marvin', id: '9P4I-snl822mfxnnAAAH' },
	{ pos: 1, username: 'Marvin', id: '9P4I-snfgdljy98sdAAH' },
]

const collected: Player[] = []
const usernames: string[] = []

// TODO voir pour tester les fonctions de display via jest.mock et
// utilitaires
describe('Player Manager', () => {
	const manager: PlayerManager = new PlayerManager()

	beforeAll((done) => {
		done()
	})
	afterAll((done) => {
		done()
	})

	test('No user yet', () => {
		expect(manager.displayPlayers()).toBeFalsy()
		expect(manager.hasPlayer('6P4I-snlewpocxnnAAAH')).toBeFalsy()
		expect(manager.getPlayerUsername('6P4I-snlewpocxnnAAAH')).toBeUndefined()
		expect(manager.isEmpty()).toBeTruthy()
	})

	test.each(pool)('generatePlayer', (user) => {
		try {
			const player = manager.generatePlayer(user.id, user.username)
			expect(player?.socketId).toBe(user.id)
			expect(player?.username).toBe(user.username)
			manager.displayPlayers()
		} catch (e) {
			if (e?.message?.includes('Player')) {
				expect(e).toBeInstanceOf(Error)
				expect(e?.message).toContain('PlayerManager')
				console.log(e.message)
			}
		}
	})

	test('getNbActivePlayers', (done) => {
		expect(manager.getNbActivePlayers()).toBe(3)
		expect(collected.length).toBe(0)
		expect(usernames.length).toBe(0)
		done()
	})

	test.each(pool)('getPlayerId #1', (user) => {
		const player = manager.getPlayerById(user.id)
		if (player) {
			if (!collected.find((val) => val.socketId === player.socketId)) {
				collected.push(player)
				expect(player.socketId).toBe(user.id)
			}
		}
	})

	test('getPlayerId #2', (done) => {
		expect(collected.length).toBe(manager.getNbActivePlayers())
		expect(manager.isEmpty()).toBeFalsy()
		done()
	})

	test('getUsername #1', (done) => {
		for (const user of collected) {
			const usrnm = manager.getPlayerUsername(user.socketId)
			if (usrnm) {
				usernames.push(usrnm)
				expect(usrnm).toBe(user.username)
			}
		}
		done()
	})

	test('getUsername #2', (done) => {
		expect(usernames.length).toBe(manager.getNbActivePlayers())
		expect(manager.displayPlayers()).toBeTruthy()
		done()
	})

	test('getState Players', (done) => {
		for (const user of collected) {
			const state = manager.getPlayerState(user.socketId)
			if (state) {
				expect(state).toBeFalsy()
			}
		}
		done()
	})

	test('update Players', () => {
		for (const user of collected) {
			manager.generatePlayer(user.socketId, "Changement de Pseudos! Blibli c'est fini")
		}
		for (const user of poolUpdates) {
			const player = manager.generatePlayer(user.id, user.username)
			if (player && !collected.find((val) => val.socketId === player.socketId)) {
				collected.push(player)
				expect(player.socketId).toBe(user.id)
			}
		}
		expect(manager.getNbActivePlayers()).toBe(7)
		expect(manager.displayPlayers()).toBeTruthy()
	})

	test('delete Players', () => {
		for (const user of collected) {
			manager.deletePlayer(user.socketId)
		}
		manager.deletePlayer('Imaginary-player')
		expect(manager.isEmpty()).toBeTruthy()
	})
})
