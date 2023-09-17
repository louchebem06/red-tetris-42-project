import HttpServer from '../model/HttpServer'
import request from 'supertest'

describe('HttpServer Basic Connection Home Page', () => {
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
		// npx tsc met adress().port en erreur jsp pq car dans le console.log,
		// la prop existe bien... Et on a besoin de tester qu'on atteint bien le
		// port qu'on souhaite
		// console.log("client: address(): ", server.getHttpServer()?.address());
		expect(server.getHttpServer()?.address()?.port).toBe(4242)
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
