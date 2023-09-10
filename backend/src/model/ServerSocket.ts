import { Server, Socket } from 'socket.io'
import Player from './Player'
import PlayerController from '../controller/PlayerController'

class ServerSocket {
	private io: Server
	private sockets: Map<string, Socket> = new Map()
	private rooms: Set<string> = new Set()
	private playerController: PlayerController

	public constructor(server: Server, pc: PlayerController) {
		this.io = server
		this.playerController = pc
		this.setupSocketEvents()
	}

	private setupSocketEvents(): void {
		this.io.on('connection', (socket: Socket) => {
			this.sockets.set(socket.id, socket)
			this.handleNewConnection(socket)
			this.handleDisconnectSocket(socket)
		})
	}

	private handleNewConnection(socket: Socket): void {
		socket.on('join', (data: { username?: string; id?: string }) => {
			this.playerController
				.createPlayer(socket, data)
				.then((player: Player) => {
					socket.emit('join', { player })
					// TODO si le player est crée l'envoyer dans le lobby
				})
				.catch((error) => {
					socket.emit('error', error.message)
				})
		})
	}

	private getAvailableRooms(socket: Socket): Set<string> {
		socket.on('get available rooms', () => {
			socket.emit('get available rooms', this.rooms)
		})
		return this.rooms
	}

	private handleDisconnectSocket(socket: Socket): void {
		socket.on('disconnect', () => {
			socket.disconnect()
			this.rooms.clear()
			this.sockets.clear()
			this.sockets.delete(socket.id)
			this.playerController.deletePlayer(socket.id)
		})
	}
	public getSocket(id: string): Socket | undefined {
		return this.sockets.get(id)
	}

	public joinRoom(room: string, id: string): void {
		const socket = this.getSocket(id)
		if (socket && !socket.rooms.has(room)) {
			this.rooms.add(room)
			socket.join(room)
		}
	}
	public switchRoom(room: string, id: string): void {
		const socket = this.getSocket(id)
		if (socket && socket.rooms.has(room)) {
			socket.join(room)
		}
	}
	public quitRoom(room: string, id: string): void {
		const socket = this.getSocket(id)
		if (socket && socket.rooms.has(room)) {
			socket.leave(room)
			this.rooms.delete(room)
		}
	}
}

export default ServerSocket
