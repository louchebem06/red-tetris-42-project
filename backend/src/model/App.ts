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

	constructor() {
		this.httpServer = new HttpServer()
		this.io = new ServerIO(this.httpServer.getHttpServer())
		this.playerController = new PlayerController()
		this.socketServer = new ServerSocket(this.io, this.playerController)
	}

	start(port: string | number): void {
		this.httpServer.start(port)
	}

	getIoServer(): ServerIO {
		return this.io
	}

	getSocketServer(): ServerSocket {
		return this.socketServer
	}

	getHttpServer(): ServerHttp {
		return this.httpServer.getHttpServer()
	}

	stop(): void {
		this.io.close()
		//console.log("Server IO Stream closed");
		this.httpServer.stop()
	}
}

export default App
