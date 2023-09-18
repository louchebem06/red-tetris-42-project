import { expect, test } from '@playwright/test';

const registration = 'Registration | Red Tetris';
const waitingRoom = 'WaitingRoom | Red Tetris';
const listRoom = 'ListRoom | Red Tetris';

const validRooms = ['room', 'room0', '012345', 'Room', 'Room0', 'r00M', '123', 'ROOM'];
const invalidRooms = ['', '12', '#room', 'ro%om0', '01&2345', 'R*oom', 'Ro@om0', 'r@0M'];
const validUsername = ['usr', 'username', 'Username', 'username42', 'User42'];
const invalidUsername = ['', '42', 'u', 'U', 'uu', 'UUu#21', 'UuUuuU42@'];

test.describe('registration', () => {
	test.describe.parallel('Room invalid', () => {
		invalidRooms.forEach((room) => {
			test(room, async ({ page }) => {
				await page.goto(`/#${room}[username]`);
				expect(await page.title()).toBe(registration);
			});
		});
	});

	test.describe.parallel('user invalid', () => {
		invalidUsername.forEach((user) => {
			test(user, async ({ page }) => {
				await page.goto(`/#room[${user}]`);
				expect(await page.title()).toBe(registration);
			});
		});
	});

	test.describe.parallel('room invalid + user invalid', () => {
		invalidRooms.forEach((room) => {
			invalidUsername.forEach((user) => {
				test(`${room} ${user}`, async ({ page }) => {
					await page.goto(`/#${room}[${user}]`);
					expect(await page.title()).toBe(registration);
				});
			});
		});
	});

	test.describe.parallel('room valid + user invalid', () => {
		validRooms.forEach((room) => {
			invalidUsername.forEach((user) => {
				test(`${room} ${user}`, async ({ page }) => {
					await page.goto(`/#${room}[${user}]`);
					expect(await page.title()).toBe(registration);
				});
			});
		});
	});

	test.describe.parallel('room invalid + user valid', () => {
		invalidRooms.forEach((room) => {
			validUsername.forEach((user) => {
				test(`${room} ${user}`, async ({ page }) => {
					await page.goto(`/#${room}[${user}]`);
					expect(await page.title()).toBe(registration);
				});
			});
		});
	});
});

test.describe('waitingRoom', () => {
	test.describe.parallel('Room valid', () => {
		validRooms.forEach((room) => {
			test(room, async ({ page }) => {
				await page.goto(`/#${room}[username]`);
				expect(await page.title()).toBe(waitingRoom);
			});
		});
	});

	test.describe.parallel('user valid', () => {
		validUsername.forEach((user) => {
			test(user, async ({ page }) => {
				await page.goto(`/#room[${user}]`);
				expect(await page.title()).toBe(waitingRoom);
			});
		});
	});

	test.describe.parallel('room valid + user valid', () => {
		validRooms.forEach((room) => {
			validUsername.forEach((user) => {
				test(`${room} ${user}`, async ({ page }) => {
					await page.goto(`/#${room}[${user}]`);
					expect(await page.title()).toBe(waitingRoom);
				});
			});
		});
	});
});

test.describe('listRoom', () => {
	test('localstorage not empty', async ({ page }) => {
		await page.goto(`/`);
		await page.evaluate(() => {
			window.localStorage.setItem('username', 'Playwright');
		});
		await page.goto(`/`);
		expect(await page.title()).toBe(listRoom);
	});
});
