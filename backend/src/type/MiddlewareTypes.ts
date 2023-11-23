import { Socket } from 'socket.io';

export type IoMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
