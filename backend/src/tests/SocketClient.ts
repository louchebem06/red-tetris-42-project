import io, { Socket as SocketClt } from 'socket.io-client';
import socketEvents from './socketEvents';
import Player from '../model/Player';
import IUserData from '../interface/IUserData';
import IPrivateMessage from 'interface/IPrivateMessage';

type DataPlayer = {
	player: Player;
	rooms: string[];
};

class SocketClient {
	private socket: SocketClt | null = null;

	public constructor(private url: string) {}

	public async connect(): Promise<SocketClt> {
		return await new Promise<SocketClt>((resolve, reject) => {
			this.socket = io(this.url, {
				reconnectionDelay: 0,
				forceNew: true,
				reconnection: true,
				timeout: 500,
			});

			// successful connection
			this.socket.on(socketEvents.connect, () => {
				//	console.log(`CLIENT SOCKET CONNECTED`);
				if (this.socket) {
					resolve(this.socket);
				}
			});

			// unsuccessful connection
			setTimeout(() => {
				reject(new Error('Failed to connect within 5 seconds'));
			}, 500);
		});
	}

	public async disconnect(): Promise<boolean> {
		return await new Promise<boolean>((resolve) => {
			if (this.socket && this.socket.connected) {
				this.socket.disconnect();
				this.socket.close();
				this.socket = null;
				// console.log(`CLIENT SOCKET DISCONNECTED`);
				resolve(true);
			} else {
				// console.log(`NOTHING TO DISCONNECT`);
				resolve(false);
			}
		});
	}

	public async simulateEcho(): Promise<string> {
		return await new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit(socketEvents.echo);
				this.socket.on(socketEvents.echo, (data: string) => {
					resolve(data);
				});
				this.socket.on(socketEvents.error, (error: Error) => {
					reject(error);
				});
			} else {
				reject(new Error('Socket error while simulateEcho'));
			}
		});
	}

	public async simulateACKJoin(userData: IUserData): Promise<DataPlayer> {
		{
			return await new Promise<DataPlayer>((resolve, reject) => {
				if (this.socket) {
					this.socket.emit(socketEvents.firstJoin, userData);
					this.socket.on(socketEvents.firstJoin, (data: DataPlayer) => {
						resolve({ player: data.player, rooms: data.rooms });
					});
					this.socket.on(socketEvents.error, (error: Error) => {
						reject(error);
					});
				} else {
					reject(new Error('Socket error while simulateACKJoin'));
				}
			});
		}
	}

	public get id(): string {
		if (this.socket && this.socket.connected) {
			return this.socket.id;
		} else {
			throw new Error('Socket error while researching id');
		}
	}

	public createRoom(name: string): Promise<DataPlayer> {
		return new Promise<DataPlayer>((resolve, reject) => {
			if (this.socket) {
				this.socket?.emit(socketEvents.createRoom, name);
				this.socket?.on(socketEvents.createRoom, (data: DataPlayer) => {
					resolve(data);
				});
			} else {
				reject(new Error('Socket error while client try to create room'));
			}
		});
	}

	public joinRoom(name: string): Promise<DataPlayer> {
		return new Promise<DataPlayer>((resolve, reject) => {
			if (this.socket) {
				this.socket?.emit(socketEvents.joinRoom, name);
				this.socket?.on(socketEvents.joinRoom, (data: DataPlayer) => {
					resolve(data);
				});
				this.socket?.on(socketEvents.error, (data: Error) => {
					reject(data);
				});
			} else {
				reject(new Error('Socket error while client try to join room'));
			}
		});
	}

	public leaveRoom(name: string): Promise<DataPlayer> {
		return new Promise<DataPlayer>((resolve, reject) => {
			if (this.socket) {
				this.socket?.emit(socketEvents.leaveRoom, name);
				this.socket?.on(socketEvents.leaveRoom, (data: DataPlayer) => {
					resolve(data);
				});
			} else {
				reject(new Error('Socket error while client try to leave room'));
			}
		});
	}

	public getRooms(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit(socketEvents.getRooms);
				this.socket.on(socketEvents.getRooms, (message) => {
					resolve(message);
				});
			} else {
				reject(new Error('Socket Client inexistant'));
			}
		});
	}

	public sendErrorPayload(message: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit(socketEvents.error, new Error(message));
				this.socket.on(socketEvents.error, () => {
					resolve(message);
				});
			} else {
				reject(new Error('Socket error while client try to create room'));
			}
		});
	}

	public sendPrivateMessage(message: IPrivateMessage): Promise<IPrivateMessage> {
		return new Promise<IPrivateMessage>((resolve, reject) => {
			if (this.socket) {
				this.socket?.emit(socketEvents.sendPrivateMessage, message);
				this.socket?.on(socketEvents.sendPrivateMessage, (data: IPrivateMessage) => {
					console.log('client sendPrivateMessage', data);
					resolve(data);
				});
			} else {
				reject(new Error('Socket error while client try to send private message'));
			}
		});
	}

	public sendInexistantEvent(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('inexistantEvent', 'inexistant event');
				this.socket.on(socketEvents.error, (msg) => {
					resolve(msg);
				});
			} else {
				reject(new Error('Socket error while client try to join inexistant event'));
			}
		});
	}
	public sendUnexpectedPayload(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('create room', { room: 'inexistant' });
				this.socket.on(socketEvents.error, (msg) => {
					resolve(msg);
				});
			} else {
				reject(new Error('Socket error while client try to send unexpected payload'));
			}
		});
	}

	public sendPrivatePayload(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('create room', this.socket.id);
				this.socket.on(socketEvents.error, (msg) => {
					resolve(msg);
				});
			} else {
				reject(new Error('Socket error while client try to join private socket'));
			}
		});
	}
	public sendUnvalidRoomNameLength(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('create room', 'in');
				this.socket.on(socketEvents.error, (msg) => {
					resolve(msg);
				});
			} else {
				reject(new Error('Socket error while client try to create unvalid room'));
			}
		});
	}

	public unvalidCreateRoom(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('create room', 'valid');
				this.socket.on(socketEvents.createRoom, () => {
					this.socket?.emit('create room', 'valid');
					this.socket?.on(socketEvents.error, (msg) => {
						resolve(msg);
					});
				});
			} else {
				reject(new Error('Socket error while client try to create unvalid room'));
			}
		});
	}
	public unvalidJoinRoom(roomName: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('join room', roomName);
				this.socket.on(socketEvents.joinRoom, () => {
					this.socket?.emit('join room', roomName);
					this.socket?.on(socketEvents.error, (msg) => {
						resolve(msg);
					});
				});
			} else {
				reject(new Error('Socket error while client try to join unvalid room'));
			}
		});
	}

	public unvalidLeaveRoom(roomName: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('join room', roomName);
				this.socket.on(socketEvents.joinRoom, () => {
					this.socket?.emit('leave room', roomName);
					this.socket?.on(socketEvents.leaveRoom, () => {
						this.socket?.emit('leave room', roomName);
						this.socket?.on(socketEvents.error, (msg) => {
							resolve(msg);
						});
					});
				});
			} else {
				reject(new Error('Socket error while client try to leave unvalid room'));
			}
		});
	}

	public unvalidFirstJoin(userData: IUserData): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.socket) {
				this.socket.emit('first join', userData);
				this.socket.on(socketEvents.firstJoin, () => {
					this.socket?.emit('first join', userData);
					this.socket?.on(socketEvents.error, (msg) => {
						resolve(msg);
					});
				});
			} else {
				reject(new Error('Socket error while client try to join unvalid room'));
			}
		});
	}
}

export default SocketClient;
