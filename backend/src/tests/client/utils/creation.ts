import { Socket, io } from 'socket.io-client';

const protocol = process.env.PROTOCOL || 'ws';
const host = process.env.HOST || 'localhost';
const serverPort = process.env.PORT || '8080';
const createClient = (username: string): Socket => {
	const socket: Socket = io(`${protocol}://${host}:${serverPort}`, {
		forceNew: true,
		reconnectionDelay: 0,
		reconnection: true,
		auth: {
			username: username,
		},
		autoConnect: false,
	});
	return socket;
};

export { createClient };
