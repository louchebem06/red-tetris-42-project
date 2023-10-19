import { Socket } from 'socket.io';
import PlayerManager from '../service/PlayerManager';
import Player from '../model/Player';
import IUserData from '../interface/IUserData';

class PlayerController {
	private playerManager: PlayerManager = new PlayerManager();

	/**
	 * Creates a new player using the provided socket and user data.
	 *
	 * @param {Socket} socket - The socket object representing the connection.
	 * @param {IUserData} userData - The user data object containing the username and id.
	 * @returns {Promise<Player>} A promise that resolves to the created player object.
	 */
	public async createPlayer(socket: Socket, userData: IUserData): Promise<Player> {
		return await new Promise((resolve, reject) => {
			const { username, id } = userData;
			if (id && socket.id !== id) {
				reject(new Error(`${id} is not valid.`));
			} else if (username && username.indexOf('#') !== -1) {
				reject(new Error(`${username} is not valid.`));
			} else {
				const player = this.playerManager.generatePlayer(socket.id, username || 'anon');
				player && resolve(player);
			}
		});
	}

	/**
	 * Updates a player's data.
	 *
	 * @param {string} id - The ID of the player.
	 * @param {object} datas - The new data for the player.
	 * @return {void|string[]} - Returns void or an array of strings.
	 */
	public update(id: string, datas: object): void | string[] {
		return this.playerManager.updatePlayer(id, datas);
	}

	/**
	 * Delete a player with the given id.
	 *
	 * @param {string} id - The id of the player to delete.
	 * @return {void}
	 */
	public deletePlayer(id: string): void {
		this.playerManager.deletePlayer(id);
	}

	/**
	 * Retrieves a player by their ID.
	 *
	 * @param {string} id - The ID of the player.
	 * @return {Promise<Player>} A promise that
	 * resolves with the player if found, or rejects with an error if not found.
	 */
	public getPlayerById(id: string): Promise<Player> {
		return new Promise<Player>((resolve, reject) => {
			const player = this.playerManager.getPlayerById(id);
			if (player) {
				resolve(player);
			} else {
				reject(new Error(`PlayerController: Player ${id} not found`));
			}
		});
	}

	/**
	 * Check if a player with the given ID exists.
	 *
	 * @param {string} id - The ID of the player to check.
	 * @return {boolean} Returns true if a player with the given ID exists, otherwise false.
	 */
	public hasPlayer(id: string): boolean {
		return this.playerManager.hasPlayer(id);
	}

	/**
	 * Prunes the player manager.
	 *
	 * @param {void} - No parameters.
	 * @return {void} - No return value.
	 */
	public prune(): void {
		this.playerManager.prune();
	}
}

export default PlayerController;
