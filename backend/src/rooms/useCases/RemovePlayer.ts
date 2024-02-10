import { PlayerReady } from '../../players/PlayerReady';
import Player from '../../players/Player';
import Room from '../Room';
import { RoomService } from '../RoomService';
import { RoomCommand } from './Base';
import { logger } from '../../infra';
import { UpdateRoleCommand } from '.';

// TODO: garder ce com, tant que le remove player n'est pas perfect
// endroit super sensible du code!

// function debug(room: Room, player: Player, service: RoomService): void {
// 	const wasLeader = !!room.isLeader(player);
// 	const roomStillExistsOnServer = service.isConnectedOnServer();
// 	const playerStillExistsOnServer = service.hasPlayer(player);
// 	const roomHasPlayer = room.has(player.sessionID);

// 	const log = `${player.username} [${player.sessionID}] was ${wasLeader ? '' : 'not '}leader
// - room ${room.name} ${roomStillExistsOnServer ? '' : 'does not '}exist on server
// - player ${player.username} ${playerStillExistsOnServer ? '' : 'does not '}exist on server
// - room ${room.name} ${roomHasPlayer ? '' : 'does not '}have player ${player.username} [${player.sessionID}]

// `;
// 	console.error('[RemovePlayerCommand]', log, player, room);
// }

export class RemovePlayerCommand extends RoomCommand {
	public constructor(
		protected room: Room,
		protected service: RoomService,
	) {
		super(room, service);
	}

	public execute(player: Player): void {
		const entityName = this.constructor.name;
		try {
			const { username, sessionID } = player;
			const { name, gameState, total } = this.room;
			const wasLeader = !!this.room.isLeader(player);

			// debug(this.room, player, this.service);

			if (this.room.has(sessionID)) {
				if (this.service.isConnectedOnServer() && this.service.hasPlayer(player)) {
					const status = player.status(name);
					const allowedStatusRegex = /idle/;
					// si le jeu est demarré
					// ou si le compte a rebours est lancé?
					if (gameState) {
						if (!status?.match(allowedStatusRegex)) {
							this.service.error(
								`${entityName}: player ${username} [${sessionID}] not allowed to leave room ${name}`,
							);
							return;
						}
					}
					// on peut leave trankil
					if (status?.match(/ready/)) {
						player.changeRoomStatus('ready', name);
					}
					// supp event 'ready'
					const event = new PlayerReady(player, name);
					player.deleteObserver({ event, observer: this.room });

					this.room.delete(sessionID);
					this.room.updatePlayer(player, 'left');
					this.room.updatePlayers(player);
					this.service.leave(this.room, player);

					if (total === 1) {
						if (gameState) {
							this.room.stopGame(player);
							new UpdateRoleCommand(this.room, this.service, 'win').execute(player);
						}
						this.service.handleRoomEmpty(this.room);
					} else if (wasLeader) {
						new UpdateRoleCommand(this.room, this.service, 'lead').execute(player);
					}

					logger.log(`player ${username} has left room ${name}`);
				} else if (!this.service.isConnectedOnServer()) {
					// la room n'existe plus sur le serveur
					// il faut supprimer la room sans y envoyer d'event car elle n'est plus reliée a un socket
					this.room.delete(sessionID);
					this.room.updatePlayer(player, 'left');
					this.service.handleRoomEmpty(this.room);
				} else if (!this.service.hasPlayer(player)) {
					// le player n'existe plus sur le serveur
					// Il faut supprimer le player de la room sans lui envoyer d'event
					// car le player n'est plus relié a un socket
					this.room.delete(sessionID);
					this.room.updatePlayer(player, 'left');
					this.room.updatePlayers(player);

					if (total === 1) {
						if (gameState) {
							this.room.stopGame(player);
							new UpdateRoleCommand(this.room, this.service, 'win').execute(player);
						}
						this.service.handleRoomEmpty(this.room);
					} else if (wasLeader) {
						new UpdateRoleCommand(this.room, this.service, 'lead').execute(player);
					}
				}
			} else {
				this.service.error(`${entityName}: player ${username} [${sessionID}] not in room ${name}`);
			}
		} catch (e) {
			throw new Error(`${entityName}: ${(<Error>e).message}`);
		}
	}
}
