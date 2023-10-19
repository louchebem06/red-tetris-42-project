/*
 * https://www.guru99.com/association-aggregation-composition-difference.html
 * https://mermaid.js.org/syntax/classDiagram.html
 * https://mermaid.js.org/config/theming.html
 */

import ClassInspector from './ClassInspector';
export default class MermaidDocumentation {
	private inspector: ClassInspector = new ClassInspector();
	/**
	 * Initializes the instance of the class.
	 *
	 * @param {string} _html - The HTML string.
	 */
	public constructor(private _html: string) {
		this.inspector.inspectClassesInDirectory('src/interface');
		this.inspector.inspectClassesInDirectory('src/model');
		this.inspector.inspectClassesInDirectory('src/controller');
		this.inspector.inspectClassesInDirectory('src/service');

		// console.log('inspector:', this.inspector.getUml('SocketController'));
		this.document();
	}

	/**
	 * Returns the HTML representation of the object.
	 *
	 * @return {string} The HTML representation of the object.
	 */
	public get html(): string {
		return this._html;
	}

	/**
	 * Sets the HTML content of the element.
	 *
	 * @param {string} content - The HTML content to be added.
	 */
	private set html(content: string) {
		this._html += content;
	}

	/**
	 * Returns the CSS styles for the component.
	 *
	 * @return {string} The CSS styles.
	 */
	private get css(): string {
		return `
		<style>
			body { /* degradé purple */
				background: linear-gradient(259deg, #312244 -11.45%, #3e1f47 112.96%);
				font-family: Arial, sans-serif;
				color: #f4f4f4;
			}

			h1 {
				text-align: center; 
				color: #ff8228 /* orange */
			}

			h2, h3 {
				color: #ffca28 /* jaune */
			}

			h3 > .eventName, .eventType {
				color: #4bff53 /* vert */
			}
			
			h4 {
				text-decoration: underline;
			}

			ul {
				list-style-type: disc;
				padding: 20px;
			}

			li {
				margin: 10px 0;
			}

			pre {
				background-color: #333;
				color: rgba(255, 255, 255, 0.7);
				padding: 1.5em 3em;
				margin: 3em 6em;
				width: fit-content;
			}

			hr {
				margin: 3em;
				border: 1px dashed rgba(255, 202, 40, 0.7);
			}

			.comment {
				font-style: italic;
				color: #787;
			}

			.keywordsType {
				color: #ff7171; /* rouge */
				font-weight: bold;
			}

			.serverDatas {
				color: #ff8228;
				font-weight: bold;
			}
		</style>
		`;
	}

	/**
	 * Retrieves the UML diagram for the App class.
	 *
	 * @return {string} The UML diagram as a string.
	 */
	private get docApp(): string {
		return `
				App "1" o-- "1" HttpServer
				App "1" o-- "1" ServerIO
				App "1" o-- "1" ServerSocket
				App "1" o-- "1" PlayerController
				${this.getClassUml('App')}`;
	}

	/**
	 * Returns the documentation for the HttpServer.
	 *
	 * @return {string} The documentation for the HttpServer.
	 */
	private get docHttpServer(): string {
		return `
				HttpServer "1" \*-- "1" Express
				HttpServer "1" \*-- "1" http
				HttpServer "1" \*-- "1" CorsOptions

				${this.getClassUml('HttpServer')}`;
	}

	/**
	 * Retrieves the UML data for a given class.
	 *
	 * @param {string} className - The name of the class.
	 * @return {string} The UML data for the class.
	 */
	private getClassUml(className: string): string {
		const datas = this.inspector.getUml(className) || '';
		return datas.replace(/(\t)/g, '$1$1$1$1$1').replace(/\}/g, '\t\t\t\t}');
	}

	/**
	 * Retrieves the docServerSocket.
	 *
	 * @return {string} The docServerSocket.
	 */
	private get docServerSocket(): string {
		return `ServerSocket "1" ..> "1" ServerIO
				ServerSocket "1" ..> "*" Socket
				ServerSocket "1" ..> "1" PlayerController
				ServerSocket "1" o-- "1" SocketController
				ServerSocket "1" o-- "1" RoomController

				${this.getClassUml('ServerSocket')}`;
	}

	/**
	 * Retrieves the docIUserData property.
	 *
	 * @return {string} The value of the docIUserData property.
	 */
	private get docIUserData(): string {
		return `${this.getClassUml('IUserData')}`;
	}

	/**
	 * Returns the documentation for the player class.
	 *
	 * @return {string} The documentation for the player class.
	 */
	private get docPlayer(): string {
		return `${this.getClassUml('Player')}`;
	}

	/**
	 * Returns the UML diagram representation of the docPlayerController property.
	 *
	 * @return {string} The UML diagram representation of the docPlayerController property.
	 */
	private get docPlayerController(): string {
		return `PlayerController "1" o-- "1" PlayerManager
				PlayerController "1" ..> "1" IUserData
				PlayerController "1" ..> "1" Player
				PlayerController "1" ..> "1" Socket
				${this.getClassUml('PlayerController')}`;
	}

	/**
	 * Returns the UML representation of the docPlayerManager property.
	 *
	 * @return {string} The UML representation of the docPlayerManager property.
	 */
	private get docPlayerManager(): string {
		return `PlayerManager o-- Player
				PlayerManager o-- UsernameManager
				${this.getClassUml('PlayerManager')}`;
	}

	/**
	 * Retrieves the doc socket service.
	 *
	 * @return {string} The doc socket service.
	 */
	private get docSocketService(): string {
		return `SocketService ..> ServerIO
				SocketService "1" ..> "1" Socket
				${this.getClassUml('SocketService')}`;
	}

	/**
	 * Returns the `IPrivateMessage` class UML as a string.
	 *
	 * @return {string} The class UML as a string.
	 */
	private get docIPrivateMessage(): string {
		return `${this.getClassUml('IPrivateMessage')}`;
	}

	/**
	 * Returns the docISocketEvent.
	 *
	 * @return {string} The docISocketEvent as a string.
	 */
	private get docISocketEvent(): string {
		return `${this.getClassUml('ISocketEvent')}`;
	}

	/**
	 * Returns a string representation of the 'IProcessPlayerActionParams' class
	 * that is used internally by the 'docIProcessPlayerActionParams' getter function.
	 *
	 * @return {string} The string representation of the 'IProcessPlayerActionParams' class.
	 */
	private get docIProcessPlayerActionParams(): string {
		return `${this.getClassUml('IProcessPlayerActionParams')}`;
	}

	/**
	 * Returns a string representation of the PlayerActions class UML diagram.
	 *
	 * @return {string} The class UML diagram as a string.
	 */
	private get docPlayerActionsEnum(): string {
		return `${this.getClassUml('PlayerActions')}`;
	}

	/**
	 * Returns the string representation of the IRoomAction class.
	 *
	 * @return {string} The string representation of the IRoomAction class.
	 */
	private get docIRoomAction(): string {
		return `IRoomAction o-- IRoomActionCallback
				${this.getClassUml('IRoomAction')}`;
	}

	/**
	 * Returns a string representation of the IRoomActionCallback class.
	 *
	 * @return {string} - The string representation of the IRoomActionCallback class.
	 */
	private get docIRoomActionCallback(): string {
		return `${this.getClassUml('IRoomActionCallback')}`;
	}

	/**
	 * Returns the UML diagram string representation of the docSocketController function.
	 *
	 * @return {string} The UML diagram string representation.
	 */
	private get docSocketController(): string {
		return `SocketController o-- SocketService
				SocketController o-- SocketEventController
				SocketController "1" \*-- "1" Socket
				SocketController "1" ..> "1" ServerIO
				SocketController ..> PlayerController
				SocketController ..> RoomController
				SocketController "1" ..> "*" Player
				SocketController "1" ..> "1" IUserData
				SocketController "1" ..> "*" ISocketEvent
				SocketController "1" ..> "*" IPrivateMessage
				SocketController "1" ..> "*" PlayerActions
				SocketController "1" ..> "*" IRoomAction
				SocketController "1" ..> "*" IProcessPlayerActionParams

				${this.getClassUml('SocketController')}`;
	}

	/**
	 * Returns the definition of the `docSocketEventController` property as a string.
	 *
	 * @return {string} The definition of the `docSocketEventController` property.
	 */
	private get docSocketEventController(): string {
		return `SocketEventController "1" o-- "*" ISocketEvent
				${this.getClassUml('SocketEventController')}`;
	}

	/**
	 * Returns a string representation of the docRoomController.
	 *
	 * @return {string} A string representation of the docRoomController.
	 */
	private get docRoomController(): string {
		return `RoomController ..> ServerIO
				RoomController ..> Socket
				RoomController ..> "*" Player
				RoomController o-- "*" Room
				RoomController o-- RoomService
				${this.getClassUml('RoomController')}`;
	}

	private get docRoom(): string {
		return `Room o-- Game
				Room ..> "*" Player
				${this.getClassUml('Room')}`;
	}

	private get docGame(): string {
		return `Game ..> Room
				Game ..> "*" Player
				${this.getClassUml('Game')}`;
	}

	/**
	 * Returns the docRoomService as a string.
	 *
	 * @return {string} The docRoomService as a string.
	 */
	private get docRoomService(): string {
		return `RoomService ..> ServerIO
				${this.getClassUml('RoomService')}`;
	}

	/**
	 * Returns the name of the document username manager.
	 *
	 * @return {string} The name of the document username manager.
	 */
	private get docUsernameManager(): string {
		return `${this.getClassUml('UsernameManager')}`;
	}

	/**
	 * Initializes the Mermaid library and returns a script tag.
	 *
	 * @return {string} The script tag that imports and initializes the Mermaid library.
	 */
	private initMermaid(): string {
		return `<script type="module">
			import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'
			mermaid.initialize({
				startOnLoad: true,
				theme: 'base',
				themeVariables: {
					primaryColor: '#ffca28',
					primaryTextColor: '#312244',
					primaryBorderColor: '#3e1f47',
					lineColor: '#ff8228',
					secondaryColor: '#ff8228',
					tertiaryColor: '#4bff53'
				}
			})
		</script>`;
	}

	/**
	 * Retrieves the title of the RedTetris Backend.
	 *
	 * @return {string} The title of the RedTetris Backend.
	 */
	private get title(): string {
		return `---
			title: RedTetris Backend
			---`;
	}

	/**
	 * Returns the diagram as a string representing a Mermaid diagram.
	 *
	 * @return {string} The Mermaid diagram as a string.
	 */
	private get diagram(): string {
		return `<div class="mermaid">
			${this.title}
			classDiagram
				${this.docApp}
				${this.docHttpServer}
				${this.docServerSocket}

				${this.docGame}

				${this.docPlayerController}
				${this.docPlayerManager}
				${this.docPlayer}
				${this.docUsernameManager}				

				${this.docRoom}
				${this.docRoomController}
				${this.docRoomService}

				${this.docSocketController}
				${this.docSocketService}
				${this.docSocketEventController}

				${this.docIPrivateMessage}
				${this.docISocketEvent}
				${this.docIUserData}
				${this.docIProcessPlayerActionParams}
				${this.docIRoomAction}
				${this.docIRoomActionCallback}
				${this.docPlayerActionsEnum}
		</div>`;
	}

	/**
	 * Creates the HTML document for the class diagram with Mermaid.
	 *
	 * @return {void} This function does not return anything.
	 */
	private document(): void {
		this.html = `
<html>
	<head>
		<title>Class Diagram with Mermaid</title>
		<meta charset="utf-8" />
		${this.css}
	</head>
	<body>
		<h1>Red Tetris Backend</h1>	
		${this.diagram}		
		${this.initMermaid()}		
	</body>
</html>`;
	}
}
