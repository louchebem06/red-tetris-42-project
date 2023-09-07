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

function removeUser(socketId: string, users: IPlayer[]): boolean {
   const player = users.find(user => user.socketId === socketId);

   if (!player) {
	   return false;
   }
   const { username } = player;

   if (username) {
	   console.log(`${username} is leaving us.`);
	   UsernamesList.removeRecurrence(username);
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

function debugPlayers(users: IPlayer[]): void {

	const _users = JSON.stringify(users);
	console.log(`\x1b[33musers\x1b[0m: ${_users}\n\x1b[33musernames\x1b[0m:`);
	UsernamesList.display();
}

io.on('connection', (socket: Socket) => {
  
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
			player.username = UsernamesList.setNewUsername(username || "anon");
			users.push(player);
		} else if (username && player.username) {
			player.username = UsernamesList.updateUsername(player.username, username);
		}
		console.log(`${getConnectionUserInfos(player.username || "", player.socketId || "")}`);
		// TODO je sais pas si on doit a tous les users l'arrivée du joueur 
		//io.emit("join", {username: player.username, id: player.socketId});
		 
		socket.emit("join", {username: player.username, id: player.socketId});
	 }
  });

  socket.on('disconnect', () => {
	  removeUser(socket.id, users);
  });
});

export default server;
