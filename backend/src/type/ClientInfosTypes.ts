import { Socket } from 'socket.io';

export type ClientInfos = {
	socket: Socket | null;
	disconnectTimer: NodeJS.Timeout | null;
};
