import { Socket } from 'socket.io';

export type ClientInfos = {
	socket: Socket | null;
	start: Date | number;
	end?: Date | number;
};
