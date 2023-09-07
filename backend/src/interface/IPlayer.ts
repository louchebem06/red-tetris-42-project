import { Socket } from "socket.io";

interface IPlayer {
	username?: string;
	socketId?: string;
	active?:boolean;
}

export default IPlayer;
