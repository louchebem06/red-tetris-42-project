import request from 'supertest'
import app from './app'
import SocketClient from './tests/SocketClient'
import usersMocked from './tests/usersDatasMocked'

let socketClt: SocketClient

const protocol = process.env.PROTOCOL || 'ws'
const host = process.env.HOST || 'localhost'
const serverPort = process.env.PORT || '8080'

beforeAll(async () => {
	await new Promise<void>((resolve) => {
		//console.log(`SERVER CONNECTED`);
		resolve(app)
	})
})

afterAll((done) => {
	app.stop()
	//console.log(`SERVER DISCONNECTED`);
	done()
})

beforeEach(async () => {
	socketClt = new SocketClient(`${protocol}://${host}:${serverPort}`)
	await socketClt.connect()
})

afterEach(async () => {
	await socketClt.disconnect()
})

// TODO jest n'aime pas le setTimeout que j'utilise dans la class test de client
// (si je ne le fait pas la promis de connection est rejetee). POur le moment
// j'ai essayé tout ce que j'ai pu trouver sur le net pour combler le warning,
// mais rien n'y fait pour le moment...
jest.useFakeTimers()
jest.runAllTimers()
describe('Home page', () => {
	const rejectPromise = jest.fn()
	beforeEach(() => {})
	test('Hello World!', (done) => {
		request(app.getHttpServer())
			.get('/')
			.then((response) => {
				expect(response.statusCode).toBe(200)
				expect(response.text).toBe(JSON.stringify({ message: 'Hello World!' }))
			})
			.catch((e) => {
				expect(e.message).toBe('Failed to connect within 5 seconds')
				expect(rejectPromise).toBeCalled()
				expect(rejectPromise).toHaveBeenCalled()
			})
		expect(rejectPromise).not.toBeCalled()
		expect(rejectPromise).not.toHaveBeenCalled()
		done()
	})
	afterEach(() => {})
})

describe('Socket.io Simulate Echo', () => {
	test('server and client should communicate on echo event once', async () => {
		app.getIoServer().emit('echo', 'Hello World')
		await socketClt.simulateEcho().then((message: string) => {
			//console.log("MESSAGE", message);
			expect(message).toBe('Hello World')
		})
	})
})

describe('Socket.io Simulate Successful Connection', () => {
	test('ACK on join event', async () => {
		const user = {
			username: 'Blibli',
			id: '',
		}
		const { player } = await socketClt.simulateACKJoin(user)
		expect(player).toBeDefined()
		expect(player.socketId).toBe(socketClt.id)
		expect(player.username).toBe(user.username)
		expect(player.active).toBeFalsy
	})
})

describe('Socket.io Simulate Same Client Several Successful Connection', () => {
	test.each(usersMocked)(
		'Checking of usernames and id handling',
		async (user) => {
			try {
				const response = await socketClt.simulateACKJoin(user)
				//console.log("ACK SERVEUR", response, user)
				expect(response).toHaveProperty('player')
				const { username, socketId, active } = response.player
				if (!user.username) {
					expect(username).toBe('anon')
				} else {
					expect(username).toBe(user.username)
				}
				expect(socketId).toBe(socketClt.id)
				expect(active).toBeFalsy
			} catch (e) {
				if (!user.id && user.username && user.username.includes('#')) {
					expect(e).toBe(`${user.username} is not valid.`)
				}
				if (user.id && user.id !== socketClt.id) {
					expect(e).toBe(`${user.id} is not valid.`)
				}
			}
		},
		25000,
	)
})

describe('Socket.io Simulate Several Clients on One Successful Connection', () => {
	const socketClts: SocketClient[] = []
	let socket: SocketClient
	beforeEach(async () => {
		socket = new SocketClient(`${protocol}://${host}:${serverPort}`)
		await socket.connect()
		socketClts.push(socket)
	})
	test.each(usersMocked)(
		'Checking of usernames and id handling',
		async (user) => {
			try {
				const response = await socket.simulateACKJoin(user)
				//console.log("ACK SERVEUR", response, user)
				expect(response).toHaveProperty('player')
				const { username, socketId, active } = response.player
				if (!user.username) {
					expect(username).toBe('anon')
				} else {
					expect(username).toBe(user.username)
				}
				expect(socketId).toBe(socketClt.id)
				expect(active).toBeFalsy
			} catch (e) {
				if (!user.id && user.username && user.username.includes('#')) {
					expect(e).toBe(`${user.username} is not valid.`)
				}
				if (user.id && user.id !== socketClt.id) {
					expect(e).toBe(`${user.id} is not valid.`)
				}
			}
		},
		25000,
	)

	afterAll(async () => {
		for (const socket of socketClts) {
			await socket.disconnect()
		}
	})
})

jest.useRealTimers()
// TODO tests deco / reco / deco a faire
