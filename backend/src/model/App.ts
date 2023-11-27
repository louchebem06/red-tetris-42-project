import { Server as ServerHttp } from 'http';
import { Server as ServerIO } from 'socket.io';

import HttpServer from './HttpServer';
import ServerController from '../controller/ServerController';

import ISrvToCltEvts from '../interface/ISrvToCltEvts';
import ICltToSrvEvts from '../interface/ICltToSrvEvts';
import IInterSrvEvts from '../interface/IInterSrvEvts';
import ISocketData from '../interface/ISocketData';

import { signals } from '../type/SignalsTypes';
import { logger } from '../controller/LogController';
import { eventEmitter } from './EventEmitter';

class App {
	private httpServer: HttpServer;
	private io: ServerIO;
	private serverController: ServerController;

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
		this.io = new ServerIO<ICltToSrvEvts, ISrvToCltEvts, IInterSrvEvts, ISocketData>(base, {
			cors: {
				origin: corsOpt.origin,
			},
		});
		this.serverController = new ServerController(this.io);
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
		this.gracefulShutdown();
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
	public stop(cb?: () => void): void {
		eventEmitter.removeAllListeners();
		this.io.close();
		this.httpServer.stop(cb);
	}

	public gracefulShutdown(): void {
		signals.forEach((signal) => {
			process.on(signal, () => {
				this.stop((): void => {
					logger.log(`[SHUTDOWN] Received ${signal} signal`);

					// TODO: kill le front aussi!
					setTimeout(() => {
						process.exit(0);
					}, 2000);
				});
			});
		});
	}
}

export default App;
