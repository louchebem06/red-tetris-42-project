import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import http, { Server as ServerHttp } from 'http'

// TODO inserer le vrai port par default (process.env.PORT)
class HttpServer {
	private app: Express
	private server: ServerHttp

	public constructor() {
		this.app = express()
		this.server = http.createServer(this.app)

		this.setupHttpConfig()
		this.setupHttpRoutes()
	}

	public start(port: string | number = 8181): void {
		this.server.listen(port, () => {
			//	console.log(`Server is running at http://localhost:${port}`);
		})
	}

	public stop(): void {
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

	public getHttpServer(): ServerHttp {
		return this.server
	}

	public getExpressApp(): Express {
		return this.app
	}
}

export default HttpServer
