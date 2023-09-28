import Room from '../model/Room';
import Player from '../model/Player';

describe('Room', () => {
	let room: Room;
	let player: Player;

	beforeEach(() => {
		player = new Player('abcdefghijklmnopqrst', 'Blibli');
		room = new Room('Paradise', player);
	});

	it('should add a player to the room if the player does not already exist', () => {
		room.addPlayer(player);

		expect(room.hasPlayer(player)).toBeTruthy();
	});

	it('should throw an error if the player already exists in the room', () => {
		room.addPlayer(player);

		expect(() => {
			room.addPlayer(player);
		}).toThrowError('Room: Player already exists in this room');
	});

	it('should remove a player from the room', () => {
		room.addPlayer(player);
		room.removePlayer(player);
		expect(room.hasPlayer(player)).toBeFalsy();
	});

	it(`should update the leader of the room if the removed player was the leader`, () => {
		const player2 = new Player('tsrqponmlkjihgfedcba', 'John');
		room.addPlayer(player);
		room.addPlayer(player2);
		room.removePlayer(player);
		expect(room.leader).toBe(player2);
		expect(room.winner).toBe(player2);
	});

	it('should not update the leader of the room if the removed player was not the leader', () => {
		const player2 = new Player('tsrqponmlkjihgfedcba', 'John');
		room.addPlayer(player);
		room.addPlayer(player2);
		room.removePlayer(player2);
		expect(room.leader).toBe(player);
		expect(room.winner).toBe(player);
	});

	it(`should start the game if it is the leader to do so`, () => {
		room.addPlayer(player);
		room.startGame(player);
		expect(room.gameState).toBeTruthy();
	});

	it(`should not start the game if it is not the leader to do so`, () => {
		const player2 = new Player('tsrqponmlkjihgfedcba', 'John');
		room.addPlayer(player);
		room.addPlayer(player2);
		room.startGame(player2);
		expect(room.gameState).toBeFalsy();
	});

	it(`should stop the game if it is the leader to do so`, () => {
		room.addPlayer(player);
		room.startGame(player);
		room.stopGame(player);
		expect(room.gameState).toBeFalsy();
	});

	it(`should stop the game if it is not the leader to do so`, () => {
		const player2 = new Player('tsrqponmlkjihgfedcba', 'John');
		room.addPlayer(player);
		room.addPlayer(player2);
		room.stopGame(player2);
		expect(room.gameState).toBeFalsy();
	});
});
