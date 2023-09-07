import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Server, Socket } from "socket.io";
import IPlayer from "./interface/IPlayer";
import Player from "./model/Player";

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

const usernamesRecurrence = new Map<string, number>();

function setNewUsername(username: string, usernamesRecurrence: Map<string, number>): string {
	let recurrence = getNewPlayerId(username, usernamesRecurrence);
	++recurrence;
	if (recurrence === 1) {
		usernamesRecurrence.set(username, recurrence);
		return username;
	}
	let newUsername = username + "#" + (recurrence - 1).toString();

	usernamesRecurrence.set(username, recurrence);
	while (usernamesRecurrence.has(newUsername)) {
		newUsername = username + "#" + (++recurrence - 1).toString(); 
	}
	usernamesRecurrence.set(newUsername, 1);
   return newUsername;
}

function getNewPlayerId(username: string, usernames: Map<string, number>): number {
	return usernamesRecurrence.get(username) || 0;
}

function removeUser(socketId: string, users: IPlayer[], usernames: Map<string, number>): boolean {
   const player = users.find(user => user.socketId === socketId);

   if (!player) {
   	   return false;
   }

   const { username } = player;
   const recurrence = usernames.get(username || "") || 0;

   console.log(`${username} is leaving us.`);

   if (username && recurrence > 0) {
   	   usernames.set(username, recurrence - 1);

   	   const sharpIdx = username.indexOf("#");
   	   if (sharpIdx !== -1) {
		   const root = username.substring(0, sharpIdx);
		   if (usernames.has(root)) {
			   const recRoot = usernames.get(root) || 1;
			   usernames.set(root, recRoot - 1);
			   if (recRoot === 1) {
				   usernames.delete(root)
			   }
		   }
   	   }
	   if (recurrence === 1)
		   usernames.delete(username);
   }
   users.splice(users.indexOf(player), 1);
   Player.decremente();
/*   console.log(`Les users restants sont: ${JSON.stringify(users)},
{${Player.getNbActivePlayers()}}
${recurrence}, les usernames restant ${JSON.stringify([...usernames.keys()])}`);*/
   return true;
}

io.on('connection', (socket: Socket) => {
	console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is connected`);
  
  socket.on("join", (data: {username?: string, id?: string}) => {
  	  const { username } = data;

	  // soit on trouve le player avec la socket, soit on en cree un nouveau
	  // (data.id || socket.id) permet de verif qu'on usurpe pas la socket
	  // si on laisse data.id seulement, ca va creer plusieurs users sur la meme
	  // socket pas sure que ce soit ce qu'on veut
	  // const player: IPlayer = users.find(elt => elt.socketId === (data.id)) || {
	  /*const player: IPlayer = users.find(elt => elt.socketId === (data.id || socket.id)) || {
		  username: "",
		  socketId: socket.id,
		  active: true
	  };*/
	 const player: IPlayer = users.find(elt => elt.socketId === (data.id || socket.id)) 
	 	 || new Player(socket.id);

	  if (users.indexOf(player) === -1) {
		  player.username = setNewUsername(username || "anon", usernamesRecurrence);
		  player.id = getNewPlayerId(username || "anon", usernamesRecurrence);
		  users.push(player);
	  } else {
	  	  // changement de pseudo?
	  }

	  const be = `${Player.getNbActivePlayers() < 2 ? "is" : "are"}`;
	  const s = `${Player.getNbActivePlayers() < 2 ? "" : "s"}`;
  	  console.log(`${player.username} has just joined on ${player.socketId} socket
There ${be} ${Player.getNbActivePlayers()} player${s} on the server`);

  	  io.emit("join", {username: player.username, id: player.socketId});

  	  const msg: string = `${player.username} has just joined on ${player.socketId} socket
There ${be} ${Player.getNbActivePlayers()} player${s} on the server`;
  	  socket.broadcast.emit("join", msg);
  });

  socket.on('disconnect', (data) => {
	  removeUser(socket.id, users, usernamesRecurrence);
	  console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is disconnected`, 
	  			  Player.getNbActivePlayers(), data);
  });
});

export default server;
