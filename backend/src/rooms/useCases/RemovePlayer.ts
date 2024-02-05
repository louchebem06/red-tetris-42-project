import { PlayerReady } from '../../players/PlayerReady';
import Player from '../../players/Player';
import Room from '../Room';
import { RoomService } from '../RoomService';
import { RoomCommand } from './Base';
import { logger } from '../../infra';
import { UpdateRoleCommand } from '.';
// import { UpdateRoleCommand } from './UpdateLeader';

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

			console.error(
				'remove player',
				this.room,
				wasLeader,
				player,
				this.room.has(sessionID),
				this.service.isConnectedOnServer(),
				this.service.hasPlayer(player),
			);

			// if (this.room.has(sessionID) && this.service.isConnectedOnServer() && this.service.hasPlayer(player)) {
			if (this.room.has(sessionID)) {
				// && this.service.isConnectedOnServer() && this.service.hasPlayer(player)
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
					// on peut leave transkik
					if (status?.match(/ready/)) {
						player.changeRoomStatus('ready', name);
					}
					// supp event 'ready'
					const event = new PlayerReady(player, name);
					player.deleteObserver({ event, observer: this.room });
					// player.changeRoomStatus('left', this.room.name);

					// room vide apres ce depart ?
					this.room.delete(sessionID);
					this.room.updatePlayer(player, 'left');
					this.room.updatePlayers(player);
					this.service.leave(this.room, player);

					// console.error('remove player', this.room, total);
					if (total === 1) {
						if (gameState) {
							this.room.stopGame(player);
							// this.service.publishNewRole('winner', this.room, player);
							new UpdateRoleCommand(this.room, this.service, 'win').execute(player);
						}
						// this.service.close(this.room, player);

						this.service.handleRoomEmpty(this.room);
					} else if (wasLeader) {
						// this.service.publishNewRole('leader', this.room, player);
						new UpdateRoleCommand(this.room, this.service, 'lead').execute(player);
						// new UpdateLeaderCommand(this.room, this.service).execute(player);
					}

					logger.log(`player ${username} has left room ${name}`);
				} else if (!this.service.isConnectedOnServer()) {
					this.room.delete(sessionID);
					this.room.updatePlayer(player, 'left');
					this.service.handleRoomEmpty(this.room);
					// this.service.isConnectedOnServer() -> la room n'existe plus sur le serveur
					// il fsut supprimer la room sans y envoyer d'event car elle est plus reliee a un socket
				} else if (!this.service.hasPlayer(player)) {
					// this.service.hasPlayer(player) -> le player n'existe plus sur le serveur
					// En gros, faut supprimer le player de la room sans envoyer d'event
					//au player car plus de socket pour communiquer avec
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
				console.error(`${entityName}: player ${username} [${sessionID}] not in room ${name}`, this.room);
				this.service.error(`${entityName}: player ${username} [${sessionID}] not in room ${name}`);
				// throw new Error(`RemovePlayerCommand: player ${username} [${sessionID}] not in room ${name}`);
			}
		} catch (e) {
			throw new Error(`${entityName}: ${(<Error>e).message}`);
		}
	}
}
