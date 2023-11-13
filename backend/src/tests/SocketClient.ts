import io, { Socket as SocketClt } from 'socket.io-client';
import ISrvToCltEvts from '../interface/ISrvToCltEvts';
import ICltToSrvEvts from '../interface/ICltToSrvEvts';
import IPlayerJSON from '../interface/IPlayerJSON';
import IRoomJSON from '../interface/IRoomJSON';
import IRoomPayload from 'interface/IRoomPayload';

type SocketClientLike = SocketClient | PromiseLike<SocketClient>;

class SocketClient {
	private socket: SocketClt<ISrvToCltEvts, ICltToSrvEvts> | null = null;

	public player: IPlayerJSON | null = null;
	public roomsIn: IRoomJSON[] = [];
	public rooms: IRoomJSON[] = [];
	public messages: string[] = [];
	public errors: string[] = [];

	public constructor(private url: string) {}

	public async connect(username: string): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			this.socket = io(this.url, {
				reconnectionDelay: 0,
				forceNew: true,
				reconnection: true,
				timeout: 500,
				auth: {
					username: username,
				},
			});

			// successful connection
			this.socket.on('connect', () => {
				console.log(`CLIENT SOCKET CONNECTED`);
			});

			this.socket.once('join', (player) => {
				if (this.socket) {
					console.log(`CLIENT SOCKET JOIN`, player, player.sessionID);
					this.player = player as IPlayerJSON;
					this.socket.auth = { username, sessionID: this.player.sessionID };
					resolve(this);
				}
			});

			// unsuccessful connection
			setTimeout(() => {
				reject(new Error('Failed to connect within 5 seconds'));
			}, 500);
		});
	}

	public async createRoom(name: string): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			if (this.socket?.connected) {
				this.socket.emit('createRoom', name);
				this.socket.once('roomOpened', (data) => {
					console.log(`CLIENT SOCKET OPENED ROOM`);
					const room = this.rooms.find((room) => room.name === data.name);
					if (!room) {
						this.rooms.push(data);
					}
					this.onRoomChange(resolve);
					this.onError(resolve);
				});
				this.onError(resolve);
			} else {
				reject(new Error('Socket not connected'));
			}
		});
	}

	public async joinRoom(name: string): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			if (this.socket?.connected) {
				this.socket?.emit('joinRoom', name);
				this.onRoomChange(resolve);
				this.onError(resolve);
				this.resolve(resolve);
			} else {
				reject(new Error('Socket not connected'));
			}
		});
	}

	private resolve(resolve: (value: SocketClient | PromiseLike<SocketClient>) => void): void {
		setTimeout(() => {
			this.socket?.off('error');
			this.socket?.off('roomChange');
			this.socket?.off('roomOpened');
			this.socket?.off('winner');
			this.socket?.off('roomClosed');
			this.socket?.off('leaderChange');
			this.socket?.off('getRooms');
			resolve(this);
		}, 500);
	}

	public async getRooms(): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			if (this.socket?.connected) {
				this.socket.emit('getRooms');
				this.socket.once('getRooms', (data) => {
					this.rooms = data;
					console.log(`CLIENT SOCKET ROOMS`);
					this.resolve(resolve);
				});
			} else {
				reject(new Error('Socket not connected'));
			}
		});
	}

	public async leaveRoom(name: string): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			const room = this.rooms.find((room) => room.name === name);
			if (this.socket?.connected) {
				this.socket?.emit('leaveRoom', name);

				if (room?.totalPlayers === 1) {
					this.onWinner(resolve);
					this.onError(resolve);
				} else {
					this.onRoomChange(resolve);
					this.onError(resolve);
				}
			} else {
				reject(new Error('Socket not connected'));
			}
		});
	}

	private onWinner(resolve: (value: SocketClient | PromiseLike<SocketClient>) => void): void {
		this.socket?.once('winner', (data) => {
			const player = this.player;
			console.log(`PLAYER: [${player?.username}]\tCLIENT - WINNER`, data);
			this.messages.push(data);
			this.onRoomChange(resolve);
		});
	}

	private onLeaderChange(resolve: (value: SocketClientLike) => SocketClientLike | void): void {
		this.socket?.once('leaderChange', (data) => {
			if (this.socket) {
				const player = this.player;
				console.log(`PLAYER: [${player?.username}]\tCLIENT - CHANGE LEADER`, data);
				this.messages.push(data);

				this.socket.off('error');
				this.socket.off('roomChange');
				this.socket.off('roomOpened');
				this.socket.off('roomClosed');
				this.socket.off('leaderChange');
				this.socket.off('winner');
				resolve(this);
			}
		});
	}

	private onRoomClosed(resolve: (value: SocketClient | PromiseLike<SocketClient>) => void): void {
		this.socket?.once('roomClosed', (data) => {
			this.socket?.off('error');
			this.socket?.off('roomChange');
			this.socket?.off('roomClosed');
			this.socket?.off('roomOpened');
			this.socket?.off('winner');
			this.socket?.off('leaderChange');

			this.rooms = this.rooms.filter((room) => room.name !== data.name);
			const player = this.player;
			console.log(`PLAYER: [${player?.username}]\tCLIENT - ROOM CLOSED`, data);
			resolve(this);
		});
	}

	private onRoomChange(resolve: (value: SocketClient | PromiseLike<SocketClient>) => void): void {
		this.socket?.once('roomChange', (data) => {
			const player = this.player;
			console.log(`PLAYER: [${player?.username}]\tCLIENT - CHANGE ROOM`, data);
			this.updateDatasOnRoomChange(data);
			this.onLeaderChange(resolve);
			this.onRoomClosed(resolve);
			this.onError(resolve);
			resolve(this);
		});
	}

	private onError(resolve: (value: SocketClient | PromiseLike<SocketClient>) => void): void {
		this.socket?.once('error', (data) => {
			const player = this.player;
			console.log(`PLAYER: [${player?.username}]\tCLIENT - ERROR`, data);
			this.socket?.off('error');
			this.socket?.off('roomChange');
			this.socket?.off('roomOpened');
			this.socket?.off('winner');
			this.socket?.off('roomClosed');
			this.socket?.off('leaderChange');
			this.errors.push(data);
			resolve(this);
		});
	}

	private updateDatasOnRoomChange(data: IRoomPayload): void {
		const room = this.rooms.find((room) => room.name === data.room.name);
		if (room) {
			this.rooms = this.rooms.filter((r) => r.name !== data.room.name);
			this.rooms.push(data.room);
			let msg = `${data.room.name} - ${data.reason}: `;
			msg += `${data.player.username}, ${data.player.sessionID}`;
			this.messages.push(msg);

			if (this.player?.sessionID === data.player.sessionID) {
				this.player = data.player;
			}
		}
	}

	public getSocket(): SocketClt<ISrvToCltEvts, ICltToSrvEvts> | null {
		return this.socket;
	}

	public async reconnect(): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			if (!this.socket?.connected) {
				this.socket?.connect();
				resolve(this);
			} else {
				reject(new Error('Socket already connected'));
			}
		});
	}

	public async softDisconnect(): Promise<SocketClient> {
		return await new Promise<SocketClient>((resolve, reject) => {
			if (this.socket?.connected) {
				this.socket.disconnect();
				resolve(this);
			} else {
				reject(new Error('Socket already disconnected'));
			}
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
}

export default SocketClient;
