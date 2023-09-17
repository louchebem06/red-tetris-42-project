import io, { Socket as SocketClt } from 'socket.io-client'
import socketEvents from './socketEvents'
import Player from '../model/Player'

type DataPlayer = { player: Player; };

class SocketClient {
	private socket: SocketClt | null = null

	constructor(private url: string) {}

	async connect(): Promise<SocketClt> {
		return await new Promise<SocketClt>((resolve, reject) => {
			this.socket = io(this.url, {
				reconnectionDelay: 0,
				forceNew: true,
				reconnection: false,
			})

			// successful connection
			this.socket.on(socketEvents.connect, () => {
				//	console.log(`CLIENT SOCKET CONNECTED`);
				if (this.socket) {
					resolve(this.socket);
				}
			})

			// unsuccessful connection
			setTimeout(() => {
				reject(new Error('Failed to connect within 5 seconds'))
			}, 5000)
		})
	}

	async disconnect(): Promise<boolean> {
		return await new Promise<boolean>((resolve) => {
			if (this.socket && this.socket.connected) {
				this.socket.disconnect()
				this.socket.close()
				this.socket = null
				//	console.log(`CLIENT SOCKET DISCONNECTED`);
				resolve(true)
			} else {
				//	console.log(`NOTHING TO DISCONNECT`);
				resolve(false)
			}
		})
	}

	async simulateEcho(): Promise<string> {
		return await new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.on(socketEvents.echo, (data: string) => {
					resolve(data)
				})
				this.socket.on(socketEvents.error, (error: Error) => {
					reject(error)
				})
			} else {
				reject(new Error('Socket error while simulateEcho'))
			}
		})
	}

	async simulateACKJoin(userData: { username?: string; id?: string }): Promise<DataPlayer> {
		{
			return await new Promise((resolve, reject) => {
				if (this.socket) {
					this.socket.emit(socketEvents.join, userData)
					this.socket.on(socketEvents.join, (data: DataPlayer) => {
						//	console.log("CLIENT DATA ONJOIN", userData, data)
						resolve({ player: data.player })
					})
					this.socket.on(socketEvents.error, (error: Error) => {
						//	console.log("CLIENT DATA ONERROR", userData, error)
						reject(error)
					})
				} else {
					reject(new Error('Socket error while simulateACKJoin'))
				}
			})
		}
	}

	get id(): string {
		if (this.socket && this.socket.connected) {
			return this.socket.id
		} else {
			throw new Error('Socket error while researching id')
		}
	}
}

export default SocketClient
