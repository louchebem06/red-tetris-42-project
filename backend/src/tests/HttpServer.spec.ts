import HttpServer from '../model/HttpServer'
import request from 'supertest'
import { AddressInfo } from 'net'

function getServerPort(server: HttpServer): number {
	const base = server.getHttpServer()
	const address = base.address() as AddressInfo
	return address.port
}

describe('HttpServer Basic Connection Home Page port 4242', () => {
	let server: HttpServer
	beforeAll((done) => {
		server = new HttpServer()
		done()
	})

	test('Server start', (done) => {
		server.start(4242)
		expect(server.getHttpServer().listening).toBeTruthy()
		done()
	})

	test('Port listening', (done) => {
		expect(getServerPort(server)).toBe(4242)
		done()
	})

	test('Hello World!', (done) => {
		request(server.getHttpServer())
			.get('/')
			.then((response) => {
				expect(response.statusCode).toBe(200)
				expect(response.text).toBe(JSON.stringify({ message: 'Hello World!' }))
				done()
			})
	})

	test.skip('Hello World! Fail cors', (done) => {
		request(server.getHttpServer())
			.get('http://localhost:7777')
			.catch((error) => {
				if (error instanceof Error) {
					console.log(`***[ERROR]*** ${error}`)
					expect(error.message).toBe('connect ECONNREFUSED 127.0.0.1:80')
					done()
				}
			})
	})

	test('Server get Express app', () => {
		expect(server.getExpressApp()).toBeInstanceOf(Function)
		expect(server.getExpressApp()).toHaveProperty('listen')
	})

	test('Server stop', (done) => {
		server.stop()
		expect(server.getHttpServer().listening).toBeFalsy()
		done()
	})
})
// TODO inserer le vrai port par default (process.env.PORT)
describe('HttpServer Basic Connection Home Page default port', () => {
	let server: HttpServer
	beforeAll((done) => {
		server = new HttpServer()
		done()
	})

	test('Server start', (done) => {
		server.start()
		expect(server.getHttpServer().listening).toBeTruthy()
		done()
	})

	test('Port listening', (done) => {
		expect(getServerPort(server)).toBe(8181)
		done()
	})

	test('Hello World!', (done) => {
		request(server.getHttpServer())
			.get('/')
			.then((response) => {
				expect(response.statusCode).toBe(200)
				expect(response.text).toBe(JSON.stringify({ message: 'Hello World!' }))
				done()
			})
	})

	test('Server stop', (done) => {
		server.stop()
		expect(server.getHttpServer().listening).toBeFalsy()
		done()
	})
})
