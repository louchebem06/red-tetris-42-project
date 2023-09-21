import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import http, { Server as ServerHttp } from 'http'
import cors, { CorsOptions } from 'cors'
import AsyncAPICustomDocumentation from '../docs/AsyncAPIDocumentation'

// TODO inserer le vrai port par default (process.env.PORT)
class HttpServer {
	private app: Express
	private server: ServerHttp
	private whiteList: string[] = []
	private port: number = 8181
	private corsOpt: CorsOptions = {}

	public constructor() {
		this.app = express()
		this.server = http.createServer(this.app)

		this.setupHttpConfig()
		this.setupHttpRoutes()
	}

	public start(port?: number): void {
		this.port = port || this.port
		this.server.listen(this.port.toString(), () => {
			//console.log(`Server is running at http://localhost:${port}`);
		})
	}

	public stop(): void {
		this.server.close()
		this.server.closeAllConnections()
		this.server.closeIdleConnections()
	}

	private setupHttpConfig(): void {
		this.setupCors()
		this.app.use(bodyParser.urlencoded({ extended: false }))
		this.app.use(bodyParser.json())
	}

	private setupCors(): void {
		this.setCorsOpts()
		this.app.use(cors(this.getCorsOpts()))
	}

	private setCorsOpts(): void {
		this.whiteList = [
			`http://127.0.0.1:${this.port}`,
			'http://127.0.0.1:80',
			'http://127.0.0.1:4173',
			'http://127.0.0.1:5173',
			`http://localhost:${this.port}`,
			'http://localhost:80',
			'http://localhost:4173',
			'http://localhost:5173',
		]
		this.corsOpt = {
			origin: (orig, cb): void => {
				if ((orig && this.whiteList.includes(orig)) || !orig) {
					cb(null, true)
				} else {
					cb(new Error(`${orig} not allowed by CORS`))
				}
			},
		}
	}

	public getCorsOpts(): CorsOptions {
		return this.corsOpt
	}

	private setupHttpRoutes(): void {
		this.app.get('/', (req: Request, res: Response) => {
			res.json({ message: 'Hello World!' })
		})

		this.app.get('/ws-docs', async (req: Request, res: Response) => {
			const doc = new AsyncAPICustomDocumentation()
			await doc.generateDoc('asyncapi.yaml')
			res.send(doc.html)
		})

		this.app.get('/leaderboard', (req: Request, res: Response) => {
			res.json({ message: 'Leaderboard coming soon' })
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
