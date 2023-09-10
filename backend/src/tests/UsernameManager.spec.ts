import UsernameManager from '../model/UsernameManager'

const errMsg = 'UsernameManager: forbidden symbol into username'
const usersMocked = [
	{ username: 'Blibli#1', expected: errMsg, rec: 0, recTotal: 0 },
	{ username: '', expected: 'anon', rec: 1, recTotal: 1 },
	{ username: '', expected: 'anon#1', rec: 1, recTotal: 2 },
	{ username: '', expected: 'anon#2', rec: 1, recTotal: 3 },
	{ username: '', expected: 'anon#3', rec: 1, recTotal: 4 },
	{ username: 'Blibli', expected: 'Blibli', rec: 1, recTotal: 1 },
	{ username: 'Blibli', expected: 'Blibli#1', rec: 1, recTotal: 2 },
	{ username: 'Blibli', expected: 'Blibli#2', rec: 1, recTotal: 3 },
	{ username: 'Blibli', expected: 'Blibli#3', rec: 1, recTotal: 4 },
	{ username: 'Blibli', expected: 'Blibli#4', rec: 1, recTotal: 5 },
	{ username: 'Blibli', expected: 'Blibli#5', rec: 1, recTotal: 6 },
	{ username: 'Blibli', expected: 'Blibli#6', rec: 1, recTotal: 7 },
	{ username: 'Blibli', expected: 'Blibli#7', rec: 1, recTotal: 8 },
	{ username: 'Blibli', expected: 'Blibli#8', rec: 1, recTotal: 9 },
	{ username: '', expected: 'anon#4', rec: 1, recTotal: 5 },
	{ username: '', expected: 'anon#5', rec: 1, recTotal: 6 },
	{ username: '', expected: 'anon#6', rec: 1, recTotal: 7 },
	{ username: '', expected: 'anon#7', rec: 1, recTotal: 8 },
	{ username: 'Blibli', expected: 'Blibli#9', rec: 1, recTotal: 10 },
	{ username: 'Blibli', expected: 'Blibli#10', rec: 1, recTotal: 11 },
	{ username: 'Blibli', expected: 'Blibli#11', rec: 1, recTotal: 12 },
	{ username: 'Blibli#1', expected: 'Blibli#12', rec: 1, recTotal: 13 },
	{ username: 'Blibli#1', expected: 'Blibli#13', rec: 1, recTotal: 14 },
	{ username: '', expected: 'anon#8', rec: 1, recTotal: 9 },
]

describe('UsernameManager', () => {
	const usernames = new UsernameManager()
	afterAll((done) => {
		usernames.flush()
		expect(usernames.size).toBe(0)
		done()
	})

	test.each(usersMocked)('check unique username', (user) => {
		try {
			const newUsername = usernames.setNewUsername(user.username)
			expect(newUsername).toBe(user.expected)
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe(user.expected)
			}
		}
	})
})

describe('UsernameManager', () => {
	const usernames = new UsernameManager()
	afterAll((done) => {
		usernames.flush()
		done()
	})
	test.each(usersMocked)(
		'check unique recurrence - except Blibli (which is 2, according to the table config)',
		(user) => {
			try {
				const newUsername = usernames.setNewUsername(user.username)
				expect(usernames.getRecurrence(newUsername)).toBe(user.rec)
			} catch (e) {
				if (e instanceof Error) {
					expect(e?.message).toBe(user.expected)
				}
			}
		},
	)
})

describe('UsernameManager', () => {
	const usernames = new UsernameManager()
	afterAll((done) => {
		usernames.flush()
		expect(usernames.size).toBe(0)
		done()
	})
	test.each(usersMocked)('check next username available', (user) => {
		try {
			const getUsername = usernames.getNextNewUsername(user.username)
			const newUsername = usernames.setNewUsername(user.username)
			expect(getUsername).toBe(newUsername)
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe(user.expected)
			}
		}
	})
})

describe('UsernameManager', () => {
	const usernames = new UsernameManager()
	afterAll((done) => {
		usernames.flush()
		expect(usernames.size).toBe(0)
		done()
	})
	test.each(usersMocked)('check total recurrence of a given root username', (user) => {
		try {
			const newUsername = usernames.setNewUsername(user.username)
			const root = usernames.getRootUsername(newUsername)
			expect(usernames.getRecurrence(root)).toBe(user.recTotal)
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe(errMsg)
			}
		}
	})
})

describe('UsernameManager', () => {
	const usernames = new UsernameManager()
	beforeAll(() => {
		try {
			usersMocked.forEach((user) => {
				usernames.setNewUsername(user.username)
			})
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe(errMsg)
			}
		}
	})
	test('delete whole username list', () => {
		usernames.flush()
		expect(usernames.size).toBe(0)
	})
})

describe('UsernameManager', () => {
	const manager = new UsernameManager()
	const list = [
		{ username: 'Blibli#1', root: false, earned: '' },
		{ username: '', root: true, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: 'Blibli', root: true, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli', root: false, earned: '' },
		{ username: 'Blibli#1', root: false, earned: '' },
		{ username: 'Blibli#1', root: false, earned: '' },
		{ username: '', root: false, earned: '' },
	]
	const updates = [
		{ username: 'Blibli', expected: 'Blibli' },
		{ username: 'Blibli', expected: 'Blibli#2' },
		{ username: 'Blibli', expected: 'Blibli#6' },
		{ username: 'Blibli', expected: 'Blibli#14' },
		{ username: 'Blibli', expected: 'Blibli#1' },
		{ username: 'Blibli', expected: 'Blibli#3' },
		{ username: 'Blibli', expected: 'Blibli#4' },
		{ username: 'Blibli', expected: 'Blibli#5' },
		{ username: 'Blibli', expected: 'Blibli#7' },
		{ username: 'Blibli', expected: 'Blibli#8' },
		{ username: 'Blibli', expected: 'Blibli#15' },
		{ username: 'Blibli', expected: 'Blibli#16' },
		{ username: 'Blibli', expected: 'Blibli#17' },
		{ username: 'Blibli', expected: 'Blibli#18' },
		{ username: 'Blibli', expected: 'Blibli#9' },
		{ username: 'Blibli', expected: 'Blibli#10' },
		{ username: 'Blibli', expected: 'Blibli#11' },
		{ username: 'Blibli', expected: 'Blibli#12' },
		{ username: 'Blibli', expected: 'Blibli#13' },
		{ username: 'Blibli', expected: 'Blibli#19' },
		{ username: 'Blibli', expected: 'Blibli#20' },
		{ username: 'Blibli', expected: 'Blibli#21' },
		{ username: 'Blibli', expected: 'Blibli#22' },
		{ username: 'Blibli', expected: 'Blibli#23' },
		{ username: 'Blibli', expected: 'Blibli#24' },
	]
	let usernames: string[] = []
	const usernamesSet: Set<string> = new Set<string>()

	beforeAll(() => {
		list.forEach((user) => {
			try {
				user.earned = manager.setNewUsername(user.username)
				usernamesSet.add(user.earned)
			} catch (e) {
				if (e instanceof Error) {
					expect(e?.message).toBe('UsernameManager: forbidden symbol into username')
				}
			}
		})
	})

	test.each(list)('check if username is a root username', (user) => {
		expect(manager.isRootUsername(user.earned)).toBe(user.root)
	})

	test('get the usernames used list', () => {
		usernames = manager.list
		expect(usernames.length).toBe(manager.size)
	})

	test('check usernames list values', () => {
		usernames = manager.list
		const expected = [...usernamesSet.values()]
		for (let i = 0; i < expected.length; i++) {
			if (list[i].earned) {
				expect(usernames[i]).toBe(expected[i])
			}
		}
	})

	test('Delete root Blibli references', () => {
		for (const username of usernamesSet) {
			switch (username) {
				case 'Blibli':
				case 'Blibli#2':
				case 'Blibli#6':
					manager.removeRecurrence(username)
					break
			}
		}
		expect(manager.hasRecurrence('Blibli')).toBeFalsy()
	})

	test('Update usernames after deleting a root', () => {
		usernames = manager.list
		for (const i in usernames) {
			const newUpdate = manager.updateUsername(usernames[i], updates[i].username)
			expect(newUpdate).toBe(updates[i].expected)
		}
	})

	afterAll((done) => {
		manager.flush()
		usernamesSet.clear()
		expect(manager.size).toBe(0)
		done()
	})
})
