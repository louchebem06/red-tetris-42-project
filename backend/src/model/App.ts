import { Server as ServerHttp } from 'http'
import { Server as ServerIO } from 'socket.io'
import HttpServer from './HttpServer'
import ServerSocket from './ServerSocket'
import PlayerController from '../controller/PlayerController'

class App {
	private httpServer: HttpServer
	private io: ServerIO
	private socketServer: ServerSocket
	private playerController: PlayerController

	public constructor() {
		this.httpServer = new HttpServer()

		const base = this.httpServer.getHttpServer()
		const corsOpt = this.httpServer.getCorsOpts()
		this.io = new ServerIO(base, {
			cors: {
				origin: corsOpt.origin,
			},
		})

		this.playerController = new PlayerController()
		this.socketServer = new ServerSocket(this.io, this.playerController)
	}

	public start(port?: number): void {
		this.httpServer.start(port)
	}

	public getIoServer(): ServerIO {
		return this.io
	}

	public getSocketServer(): ServerSocket {
		return this.socketServer
	}

	public getHttpServer(): ServerHttp {
		return this.httpServer.getHttpServer()
	}

	public stop(): void {
		this.io.close()
		//console.log("Server IO Stream closed");
		this.httpServer.stop()
	}
}

export default App
