const socketEvents = {
	connect: 'connect',
	disconnect: 'disconnect',
	firstJoin: 'first join',
	createRoom: 'create room',
	joinRoom: 'join room',
	leaveRoom: 'leave room',
	getRooms: 'get rooms',
	sendPrivateMessage: 'send private message',
	echo: 'echo',
	error: 'error',

	// requests
	reqJoin: '#join',
	reqEcho: '#echo',
	reqBello: '#bello',

	// responses
	resJoin: '@join',
	resEcho: '@echo',
	resBello: '@bello',
};

export default socketEvents;
