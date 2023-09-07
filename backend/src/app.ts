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

interface IUsernameRecurrence {
	username: string,
	recurrence: number
}

const users: IPlayer[] = [];
let	nbActivePlayers = 0;
const usernamesFrequency: IUsernameRecurrence[] = [];

io.on('connection', (socket: Socket) => {
	console.log(`Socket \x1b[4m${socket.id}\x1b[0m is connected`);
  
  socket.on("new user", (data: {username?: string, id?: number}) => {
  	  const { username, id } = data;

	//  if ()
  	  const player: IPlayer = {
  	  	  username: username,
  	  	  socket: socket,
  	  	  active: true
  	  };

  	  users.push(player);
  	  ++nbActivePlayers;

  	  console.log(`Hello:  ${player.username}, ${player.socket?.id}`);
  	  io.emit("new user", player);
  	  const msg: string = "A new user has joined us! Welcome " + (player.username || "anon");
  });
  socket.on('disconnect', () => {
	  console.log(`Socket \x1b[4m${socket.id}\x1b[0m is disconnected`);
  });
});

export default server;
