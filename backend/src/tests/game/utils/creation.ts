import { IGameJSON } from '../../../games/Game';

// TODO: Le payload va changer apres le merge de la branche gameRoom
export function createGame(overrides: Partial<IGameJSON> = {}): IGameJSON {
	return {
		id: expect.any(String) as unknown as string,
		dateCreated: expect.any(String) as unknown as Date,
		dateStarted: null,
		dateStopped: null,
		winner: null,
		...overrides,
	};
}

export function createGames(overrides: Partial<IGameJSON>[] = []): IGameJSON[] {
	if (overrides.length === 0) {
		return [createGame()];
	}
	return overrides.map((game) => createGame(game));
}
