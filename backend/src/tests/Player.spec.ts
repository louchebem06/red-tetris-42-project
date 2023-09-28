import Player from '../model/Player';

let player: Player;

describe('Player instantiation', () => {
	test('Correct instantiation', (done) => {
		player = new Player('6P4I-snhy8uGZxkgAAAH', 'blibli', false);
		expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
		expect(player.username).toBe('blibli');
		expect(player.active).toBeFalsy();
		done();
	});

	test('Correct instantiation without state', (done) => {
		player = new Player('6P4I-snhy8uGZxkgAAAH', 'blibli');
		expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
		expect(player.username).toBe('blibli');
		expect(player.active).toBeFalsy();
		done();
	});

	test('Correct instantiation with true state', (done) => {
		player = new Player('6P4I-snhy8uGZxkgAAAH', 'blibli', true);
		expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
		expect(player.username).toBe('blibli');
		expect(player.active).toBeTruthy();
		done();
	});

	test('Correct instantiation with empty username', (done) => {
		player = new Player('6P4I-snhy8uGZxkgAAAH', '');
		expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
		expect(player.username).toBe('anon');
		expect(player.active).toBeFalsy();
		done();
	});

	test('Correct instantiation without username', (done) => {
		player = new Player('6P4I-snhy8uGZxkgAAAH');
		expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
		expect(player.username).toBe('anon');
		expect(player.active).toBeFalsy();
		done();
	});

	test('Incorrect instantiation without socketId', (done) => {
		try {
			player = new Player('', 'blibli');
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe('Player: id socket is mandatory');
			}
		}
		done();
	});

	test('Incorrect instantiation with invalid socketId', (done) => {
		try {
			player = new Player('snhy8uGZxkgAAAH', 'blibli');
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe('Player: format socket is invalid');
			}
		}
		done();
	});

	test('Incorrect instantiation without socketId', (done) => {
		try {
			player = new Player('');
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe('Player: id socket is mandatory');
			}
		}
		done();
	});

	test(`Setters and getters`, (done) => {
		try {
			player = new Player('abcdefghijklmnopqrst', 'Tartempion', false);

			console.log('GETTER TEST');
			player.username = 'blibli';
			player.socketId = '6P4I-snhy8uGZxkgAAAH';
			player.active = true;
			const games = player.games;
			const creation = player.dateCreated;
			const playerJSON = player.toJSON();
			expect(player.username).toBe('blibli');
			expect(player.socketId).toBe('6P4I-snhy8uGZxkgAAAH');
			expect(player.active).toBeTruthy();
			expect(games).toHaveLength(0);
			expect(creation).toBeInstanceOf(Date);
			expect(playerJSON).toEqual({
				username: 'blibli',
				socketId: '6P4I-snhy8uGZxkgAAAH',
				active: true,
				dateCreated: creation,
				games: [],
			});
		} catch (e) {
			if (e instanceof Error) {
				expect(e?.message).toBe('Player: id socket is mandatory');
			}
		}
		done();
	});
});
