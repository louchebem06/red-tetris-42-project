import { Server as ServerHttp } from 'http';
import { Server as ServerIO } from 'socket.io';
import HttpServer from './HttpServer';
import ServerSocket from './ServerSocket';
import PlayerController from '../controller/PlayerController';

class App {
	private httpServer: HttpServer;
	private io: ServerIO;
	private socketServer: ServerSocket;
	private playerController: PlayerController;

	/**
	 * Constructor for the class.
	 *
	 * Initializes the HttpServer, creates a base for the server,
	 * sets up CORS options, initializes the ServerIO and
	 * ServerSocket, and initializes the PlayerController.
	 */
	public constructor() {
		this.httpServer = new HttpServer();

		const base = this.httpServer.getHttpServer();
		const corsOpt = this.httpServer.getCorsOpts();
		this.io = new ServerIO(base, {
			cors: {
				origin: corsOpt.origin,
			},
		});

		this.playerController = new PlayerController();
		this.socketServer = new ServerSocket(this.io, this.playerController);
	}

	/**
	 * Starts the server on the specified port.
	 *
	 * @param {number} port - The port number to listen on.
	 * If not provided, a random available port will be used.
	 * @return {void} This function does not return anything.
	 */
	public start(port?: number): void {
		this.httpServer.start(port);
	}

	/**
	 * Returns the `ServerIO` instance for this object.
	 *
	 * @return {ServerIO} The `ServerIO` instance.
	 */
	public getIoServer(): ServerIO {
		return this.io;
	}

	/**
	 * Returns the `ServerSocket` instance of the current object.
	 *
	 * @return {ServerSocket} The `ServerSocket` instance.
	 */
	public getSocketServer(): ServerSocket {
		return this.socketServer;
	}

	/**
	 * Returns the HTTP server instance.
	 *
	 * @return {ServerHttp} The HTTP server instance.
	 */
	public getHttpServer(): ServerHttp {
		return this.httpServer.getHttpServer();
	}

	/**
	 * Stops the function.
	 *
	 * @return {void} - No return value.
	 */
	public stop(): void {
		this.io.close();
		this.httpServer.stop();
	}
}

export default App;
