# Events

## emit (Client -> Server)

### connect

C'est la premiere action à mener côté client afin d'obtenir une réponse du serveur **socketio**`

```js
// Code coté client
import io, { Socket } from 'socket.io-client';
const socketClient: Socket<ISrvToCltEvts, ICltToSrvEvts> = io('ws://localhost:8080/', {
    autoConnect: false,
    auth: {
        username: string // A faire saisir par user et recuperer
        sessionID: string // null a la 1ere connexion, puis retourné par le serveur
    }
});
socketClient.connect() // -> Le serveur attend une connexion et repond en émettant un event **join**
socketClient.on('join', (data) => {...})
```

### createRoom

```js
socketClient.emit('createRoom', roomName);

/*
    -> Si room OK: (reponse attendue du serveur)
        * roomOpened                                    BROADCAST ALL
        * roomChange (reason: room created)             PLAYER
        * leaderChange                                  PLAYER
    -> Si room KO:
        * error                                         PLAYER
*/
```

### joinRoom

```js
socketClient.emit('joinRoom', roomName);

/*
    -> Si room OK:
        * roomChange (reason: player incoming)          BROADCAST ALL IN ROOM
    -> Si room KO:
        * error                                         PLAYER
*/
```

### leaveRoom

```js
socketClient.emit('leaveRoom', roomName);

/*
    -> Si room OK: (reponse attendue du serveur)
        + Si dernier joueur de la room:
            * winner                                    WINNER 
            * roomChange (reason: room closed)          PLAYER
            * roomClosed                                BROADCAST ALL
        + Si la room contient encore des joueurs:
            * roomChange (reason: player outgoing)      BROADCAST ALL IN ROOM
            + Si le leader a changé
                * leaderChange                          NOUVEAU LEADER
    -> Si room KO:
        * error                                         PLAYER
*/
```

### getRooms

```js
socketClient.emit('getRooms');

/*
    -> reponse attendue du serveur:
        * getRooms                                      PLAYER
*/
```

## on (Server -> Client)

### join

```js
// Reponse à une demande de connexion client
{
    player: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueurr lead
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    },
    roomNames: string[]
}
```

### getRooms

```js
// Reponse à l'event getRooms
[
	'room1',
	'room2',
	//etc... peut aussi etre vide
];
```

### error

```js
'Message décrivant l\'erreur';
```

### roomOpened

```js
{
    name: string,
    dateCreated: string,
    leader: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueur lead, le nom de cette room open doit apparaitre ici
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    }, // le player qui cree une room en devient le leader
    gameState: false, // Le jeu ne peut etre demarré/arrété par le leader de la room, et si il est dans la room
    winner: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueurr lead
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    }, // Aucun winner ne peut exister tant qu'au moins un joueur n'a pas cherché à joindre et quitter la room
    players: [
        {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueurr lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        },
    ], // Devrait etre vide a l'ouverture d'une room, socketio distingue ouverture de room et rejoindre cette meme room. En gros, on ouvre la room, puis on la rejoint, ou non
    totalPlayer: number // Nombre de player de la room, doit etre 0 a l'ouverture
}
```

### roomChange

Des qu'un changement intervient dans la room

-   room created
-   player incoming
-   player outgoing
-   room closed

```js
{
    reason: string,
    room: {
        name: string,
        dateCreated: string,
        leader: {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueur lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        }, // le leader de la room. Si le leader quitte la room, le joueur arrivé juste apres le leader devient leader
        gameState: false, // Le jeu ne peut etre demarré/arrété par le leader de la roon
        winner: {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueur lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        }, // Aucun winner ne peut exister tant qu'au moins un joueur n'a pas cherché à joindre et quitter la room. Le joueur est designé lorsqu'il reste 1 joueur ou moins dans la room
        players: [
            {
                username: string, // username
                sessionId: string, // uuid
                dateCreated: string,
                connected: boolean, // connecté ou non
                leads: string[] // nom des rooms que le joueur lead
                wins: string[] // nom des rooms gagnées
                games: object[] // Non defini encore
            },
        ], // liste des joueurs etant dans la room
        totalPlayer: number // Nombre de player de la room
    },
    player: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueur lead
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    }, // joueur concerné par le changement
}
```

### leaderChange

```js
'You are the new leader of (roomname)';
```

### winner

```js
'You are the winner of (roomname)';
```

### roomClosed

```js
{
    name: string,
    dateCreated: string,
    leader: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueur lead, la room doit y etre
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    }, // leader de la room
    gameState: false, // Le jeu ne peut etre demarré/arrété par le leader de la roon
    winner: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueur lead, la room doit apparaitre
        wins: string[] // nom des rooms gagnées, la room doit apparaitre
        games: object[] // Non defini encore
    }, // Un winner est désigné lorsque le dernier joueur quitte la room
    players: [
        {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueurr lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        },
    ], // doit etre vide a la fermeture de la room
    totalPlayer: number // Nombre de player de la room, doit etre 0 a l'ouverture
}
```

### roomChange

Des qu'un changement intervient dans la room

```js
{
    reason: string, // room created, player incoming, player outgoing, room closed
    room: {
        name: string,
        dateCreated: string,
        leader: {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueurr lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        },
        gameState: false, // Le jeu ne peut etre demarré/arrété par le leader de la roon
        winner: {
            username: string, // username
            sessionId: string, // uuid
            dateCreated: string,
            connected: boolean, // connecté ou non
            leads: string[] // nom des rooms que le joueurr lead
            wins: string[] // nom des rooms gagnées
            games: object[] // Non defini encore
        }, // Aucun winner ne peut exister tant qu'au moins un joueur n'a pas cherché à joindre et quitter la room
        players: [
            {
                username: string, // username
                sessionId: string, // uuid
                dateCreated: string,
                connected: boolean, // connecté ou non
                leads: string[] // nom des rooms que le joueurr lead
                wins: string[] // nom des rooms gagnées
                games: object[] // Non defini encore
            },
        ], // Devrait etre vide a la fermeture d'une room, socketio distingue ouverture de room et rejoindre cette meme room. En gros, on ouvre la room, puis on la rejoint, ou non
        totalPlayer: number // Nombre de player de la room, doit etre 0 a l'ouverture
    },
    player: {
        username: string, // username
        sessionId: string, // uuid
        dateCreated: string,
        connected: boolean, // connecté ou non
        leads: string[] // nom des rooms que le joueurr lead
        wins: string[] // nom des rooms gagnées
        games: object[] // Non defini encore
    },
}
```
