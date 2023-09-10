import App from '../model/App'
import { Server as ServerHttp } from 'http'
import { Server as ServerIO } from 'socket.io'
import ServerSocket from '../model/ServerSocket'

const app: App = new App()

describe('App Basic on / off', () => {
	beforeAll((done) => {
		app.start(9999)
		done()
	})
	test('getIoServer', (done) => {
		expect(app.getIoServer()).toBeInstanceOf(ServerIO)
		done()
	})
	test('getSocketServer', (done) => {
		expect(app.getSocketServer()).toBeInstanceOf(ServerSocket)
		done()
	})
	test('getHttServer', (done) => {
		expect(app.getHttpServer()).toBeInstanceOf(ServerHttp)
		done()
	})
	afterAll((done) => {
		app.stop()
		done()
	})
})
