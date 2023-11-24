import http, { Server as ServerHttp } from 'http';
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';

import 'dotenv/config';

import MermaidDocumentation from '../docs/MermaidDocumentation';
import { logger } from '../controller/LogController';

// TODO inserer le vrai port par default (process.env.PORT)
class HttpServer {
	private app: Express;
	private server: ServerHttp;
	private whiteList: string[] = [];
	private port: number = parseInt(process.env.PORT || '8080', 10);
	private corsOpt: CorsOptions = {};

	/**
	 * Initializes the constructor.
	 *
	 * set up the http server and cors options.
	 * set up the routes for the http server.
	 */
	public constructor() {
		this.app = express();
		this.server = http.createServer(this.app);

		this.setupHttpConfig();
		this.setupHttpRoutes();
	}

	/**
	 * Starts the server on the specified port.
	 *
	 * @param {number} port - The port number to start the server on. If not
	 * provided, the default port will be used.
	 * @return {void} This function does not return anything.
	 */
	public start(port?: number): void {
		this.port = port || this.port;
		this.server.listen(this.port.toString(), () => {
			logger.log(`Server is running at http://localhost:${this.port}`);
			console.log(`Server is running at http://localhost:${this.port}`);
		});
	}

	/**
	 * Stops the server and closes all connections.
	 *
	 * @param {void} None
	 * @return {void} None
	 */
	public stop(cb?: () => void): void {
		this.server.close(cb);
		this.server.closeAllConnections();
		this.server.closeIdleConnections();
	}

	/**
	 * Sets up the HTTP configuration for the application.
	 *
	 * This function sets up the Cross-Origin Resource Sharing (CORS) policy,
	 * and configures the application to parse URL-encoded and JSON request bodies.
	 *
	 * @param {type} paramName - description of parameter
	 * @return {type} description of return value
	 */
	private setupHttpConfig(): void {
		this.setupCors();
		this.app.use(bodyParser.urlencoded({ extended: false }));
		this.app.use(bodyParser.json());
	}

	/**
	 * Sets up Cross-Origin Resource Sharing (CORS) for the application.
	 *
	 * This function sets the CORS options and applies them to the application.
	 *
	 * @return {void} This function does not return anything.
	 */
	private setupCors(): void {
		this.setCorsOpts();
		this.app.use(cors(this.getCorsOpts()));
	}

	/**
	 * Set the CORS options for the server.
	 *
	 * This function sets up the whitelist of allowed origins
	 * and the CORS options object for the server. The whitelist
	 * contains a list of URLs that are allowed to make requests
	 * to the server. The CORS options object specifies how the
	 * server should handle CORS requests.
	 *
	 * @return {void} This function does not return anything.
	 */
	private setCorsOpts(): void {
		this.whiteList = [
			`http://127.0.0.1:${this.port}`,
			'http://127.0.0.1',
			'http://127.0.0.1:4173',
			'http://127.0.0.1:5173',
			`http://localhost:${this.port}`,
			'http://localhost',
			'http://localhost:4173',
			'http://localhost:5173',
			'https://red-tetris-frontend.onrender.com',
		];
		this.corsOpt = {
			/**
			 * A function that checks the origin of a request
			 *  and determines if it is allowed by CORS.
			 *
			 * @param {any} orig - The origin value to be checked.
			 * @param {Function} cb - The callback function to be called after checking the origin.
			 * @returns {void}
			 */
			origin: (orig, cb): void => {
				if (this.whiteList.includes(orig || '') || !orig) {
					cb(null, true);
				} else {
					cb(new Error(`${orig} not allowed by CORS`));
				}
			},
		};
	}

	/**
	 * Retrieves the CORS options for the current instance.
	 *
	 * @return {CorsOptions} The CORS options.
	 */
	public getCorsOpts(): CorsOptions {
		return this.corsOpt;
	}

	/**
	 * Sets up the HTTP routes for the application.
	 *
	 * @param {void} - This function does not take any parameters.
	 * @return {void} - This function does not return any value.
	 */
	private setupHttpRoutes(): void {
		// TODO log error?
		this.app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
			const html = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Error</title>
	</head>
	<body>
		<h1>Oops!</h1>
		<p>It seems that something went wrong!</p>
		<p>Contact your administrator if it is not expected.</p>
	</body>
</html>`;
			res.status(403).send(html);
			next();
		});

		this.app.get('/', (req: Request, res: Response) => {
			res.json({ message: 'Hello World!' });
		});

		this.app.get('/mermaid', (req: Request, res: Response) => {
			const doc = new MermaidDocumentation('');
			res.send(doc.html);
		});

		this.app.get('/leaderboard', (req: Request, res: Response) => {
			res.json({ message: 'Leaderboard coming soon' });
		});
	}

	/**
	 * Retrieves the HTTP server.
	 *
	 * @return {ServerHttp} The HTTP server.
	 */
	public getHttpServer(): ServerHttp {
		return this.server;
	}

	/**
	 * Retrieves the Express app instance.
	 *
	 * @return {Express} The Express app instance.
	 */
	public getExpressApp(): Express {
		return this.app;
	}
}

export default HttpServer;
