import { Socket } from "socket.io";

interface IPlayer {
	username?: string;
	socket?: Socket;
	active?:boolean;
}

export default IPlayer;
