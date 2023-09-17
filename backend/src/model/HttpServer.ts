import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import http, { Server as ServerHttp, Socket } from 'http'

class HttpServer {
	private app: Express
	private server: ServerHttp
	private sockets: Set<Socket>

	constructor() {
		this.app = express()
		this.server = http.createServer(this.app)

		this.setupHttpConfig()
		this.setupHttpRoutes()
		this.sockets = new Set<Socket>()
	}

	start(port: string | number = 8080): void {
		this.server.listen(port, () => {
			//	console.log(`Server is running at http://localhost:${port}`);
		})
		this.server.on('connection', (socket) => {
			this.sockets.add(socket)
		})
	}

	stop(): void {
		this.server.on('close', (socket: Socket) => {
			//console.log("Server HTTP Stream closed");
			if (socket && socket.connected) {
				socket.disconnect()
				this.sockets.delete(socket)
			}
			this.sockets.clear()
		})
		this.server.close()
		this.server.closeAllConnections()
		this.server.closeIdleConnections()
	}

	private setupHttpConfig(): void {
		this.app.use(bodyParser.urlencoded({ extended: false }))
		this.app.use(bodyParser.json())
	}

	private setupHttpRoutes(): void {
		this.app.get('/', (req: Request, res: Response) => {
			res.json({ message: 'Hello World!' })
		})
	}

	getHttpServer(): ServerHttp {
		return this.server
	}

	getExpressApp(): Express {
		return this.app
	}
}

export default HttpServer
