import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Server, Socket } from "socket.io";
import IPlayer from "./interface/IPlayer";
import Player from "./model/Player";
import UsernamesList from './model/UsernamesList';

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

const server = app.listen(8080, () => {
  console.log('Server is running at http://localhost:8080');
});

const io = new Server(server);

const users: IPlayer[] = [];

/*class UsernamesList {
	static datas: Map<string, number> = new Map();

	static setRecurrence(value: string, recurrence: number): void {
		if (value && recurrence) {
			this.datas.set(value, recurrence);
		}
	}

	static addRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			const recurrence = this.getRecurrence(value);
			this.setRecurrence(value, recurrence + 1);
		} else {
			this.setRecurrence(value, 1);
		}
	}

	static removeRecurrence(value: string): boolean {
		if (this.hasRecurrence(value)) {
			const recurrence = this.getRecurrence(value);
			if (recurrence > 1) {
				this.setRecurrence(value, recurrence - 1);
				return true;
			} else {
				this.deleteRecurrence(value);
			}
		}
		return false;
	}

	static getRecurrence(value: string): number {
		if (this.hasRecurrence(value)) {
			return this.datas.get(value) || 0;
		}
		return 0;
	}

	static hasRecurrence(value: string): boolean {
		if (this.datas?.has(value))
			return true;
		return false;
	}

	static deleteRecurrence(value: string): void {
		console.log(`deleteRecurrence: ${value}`);
		if (this.hasRecurrence(value)) {
			this.datas.delete(value);
			console.log(`deleted: ${value} - ${this.hasRecurrence(value)}`);
			if (this.datas.size === 0) {
				this.datas.clear();
				console.log(`all clear: ${value} - ${this.hasRecurrence(value)}`);
			}
		}
	}

	static getNewUsername(value: string): string {
		if (!this.hasRecurrence(value)) {
			this.addRecurrence(value);
			return value;
		}

		let newUsername = value;
		while (this.hasRecurrence(newUsername)) {
			const recurrence = this.getRecurrence(newUsername);

			newUsername = value + "#" + recurrence.toString();
			this.addRecurrence(value);
		}
		this.addRecurrence(newUsername);
		return newUsername;
	}

	static get list(): string[] {
		return Array.from(this.datas.keys()).map((key: string) => key) || [];
	}
}*/

function removeUser(socketId: string, users: IPlayer[]): boolean {
   const player = users.find(user => user.socketId === socketId);

   if (!player) {
	   return false;
   }
   const { username } = player;

   if (username) {
	   console.log(`${username} is leaving us.`);
	   const sharpIdx = username.indexOf("#");

	   UsernamesList.removeRecurrence(username);
	   if (sharpIdx !== -1) {
		   const root = username.substring(0, sharpIdx);
		   if (UsernamesList.hasRecurrence(root)) {
			   UsernamesList.removeRecurrence(root);
		   }
	   }
   }
   users.splice(users.indexOf(player), 1);
   Player.decremente();
   console.log(`${Player.getNbActivePlayers()} players still active: ${JSON.stringify(users)}`);
   return true;
}

function getNbUsersInfo(): string {
	const be = `${Player.getNbActivePlayers() < 2 ? "is" : "are"}`;
	const s = `${Player.getNbActivePlayers() < 2 ? "" : "s"}`;
	return `There ${be} ${Player.getNbActivePlayers()} player${s} on the server`;
}
function getConnectionUserInfos(username: string, socketId: string): string {
	let msg = `${username} has just joined on ${socketId} socket`;
	msg += "\n" + getNbUsersInfo();
	return msg;
}

io.on('connection', (socket: Socket) => {
	console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is connected`);
  
  socket.on("join", (data: {username?: string, id?: string}) => {
	 const { username, id } = data;
	
	 if (id && id !== socket.id) {
	 	 socket.emit("error id", {id: id});
	 } else if (username && username.indexOf("#") !== -1) {
	 	 socket.emit("error username", {username: username});
	 } else {
		const player: IPlayer = users.find(elt => elt.socketId === socket.id) 
			|| new Player(socket.id);

		if (users.indexOf(player) === -1) {
			player.username = UsernamesList.getNewUsername(username || "anon");
			users.push(player);
			console.log(player, users);
		} else if (username && player.username) {
			const oldUsername = player.username;
			if (oldUsername !== username) {
				player.username = UsernamesList.getNewUsername(username) || oldUsername;
				UsernamesList.removeRecurrence(oldUsername);
			}
		}
		console.log(`${getConnectionUserInfos(player.username || "", player.socketId || "")}`);
		io.emit("join", {username: player.username, id: player.socketId});
	 }
  });

  socket.on('disconnect', (data) => {
	  removeUser(socket.id, users);
	  console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is disconnected`, 
	  			  Player.getNbActivePlayers(), data);
  });
});

export default server;
