import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Server, Socket } from "socket.io";
import IPlayer from "./interface/IPlayer";

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
let	nbActivePlayers = 0;

function getAllUsernames(users: IPlayer[]): string[] {
	return users.map(elt => elt.username || "");
}

function filterUsernames(username: string, usernames: string[]): string[] {
	return usernames.filter(e => e.includes(username));
}

function setNewUsername(username: string, users: IPlayer[]): string {
	// si le username est trouvé 	
	// on l'update avec le nb d'users ayant le meme pseudo
	const usernames = filterUsernames(username, getAllUsernames(users));
	console.log(`username is ${username} and users are ${usernames}`);
	if (users.map(elt => elt.username).indexOf(username) !== -1) {
	//if (users.map(elt => elt.username).includes(username)) {
		//const usernames = users.filter(e => e.username?.includes(username))
		//						.map(e => e.username);
		const lastUsername = usernames[usernames.length - 1];
		const regexId = `/${username}(\d)*$/`;
		const results = lastUsername?.match(regexId);
		if (results || lastUsername === username) {
			let nextPos = 1;
			if (results) {
				const order = parseInt(results[1]);
				nextPos = order + 1;
			}
			console.log(`last username is ${lastUsername} next post available: ${nextPos}, ${regexId}`, usernames);
			username += nextPos.toString();
		}

		//username += users.map(elt => elt.username?.indexOf(username) !== -1).length.toString();
	}
	return username;
}

function removeUser(socketId: string, users: IPlayer[]): boolean {
	const idx = users.map(elt => elt.socketId).indexOf(socketId);
	if (idx != -1) {
		console.log(`${users[idx].username} is leaving us`);
		users.splice(idx, 1);
		if (nbActivePlayers > 0)
			--nbActivePlayers;
		return true;
	}
	return false;
}

io.on('connection', (socket: Socket) => {
	console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is connected`);
  
  socket.on("join", (data: {username?: string, id?: string}) => {
  	  const { username } = data;

	 // console.log(`data: ${data} - ${username} - ${data.username}`, data);
	  // soit on trouve le player avec la socket, soit on en cree un nouveau
	  // (data.id || socket.id) permet de verif qu'on usurpe pas la socket
	  // si on laisse data.id seulement, ca va creer plusieurs users sur la meme
	  // socket pas sure que ce soit ce qu'on veut
	  // const player: IPlayer = users.find(elt => elt.socketId === (data.id)) || {
	  const player: IPlayer = users.find(elt => elt.socketId === (data.id || socket.id)) || {
		  username: "",
		  socketId: socket.id,
		  active: true
	  };

	  if (users.indexOf(player) == -1) {
		  player.username = setNewUsername(username || "anon", users);
		  users.push(player);
		  ++nbActivePlayers;
	  }

	  const be = `${nbActivePlayers < 2 ? "is" : "are"}`;
	  const s = `${nbActivePlayers < 2 ? "" : "s"}`;
  	  console.log(`${player.username} has just joined on ${player.socketId} socket
There ${be} ${nbActivePlayers} player${s} on the server`);

  	  io.emit("join", {username: player.username, id: player.socketId});

  	  const msg: string = `${player.username} has just joined on ${player.socketId} socket
There ${be} ${nbActivePlayers} player${s} on the server`;
  	  socket.broadcast.emit("join", msg);
  });
  socket.on('disconnect', (data) => {
	  removeUser(socket.id, users)
	  console.log(`Socket \x1b[96;4m${socket.id}\x1b[0m is disconnected`, nbActivePlayers, data);
  });
});

export default server;
