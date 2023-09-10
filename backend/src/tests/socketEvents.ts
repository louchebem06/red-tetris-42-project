const socketEvents = {
	connect: 'connect',
	disconnect: 'disconnect',
	join: 'join',
	echo: 'echo',
	lobby: 'lobby',
	error: 'error',

	// requests
	reqJoin: '#join',
	reqEcho: '#echo',
	reqBello: '#bello',

	// responses
	resJoin: '@join',
	resEcho: '@echo',
	resBello: '@bello',
}

export default socketEvents
