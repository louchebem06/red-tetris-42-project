import Player from '../../players/Player';
import Room from '../Room';
import { RoomService } from '../RoomService';
// import { logger } from '../../infra';
import { RoomCommand } from './Base';

export type RoleRoom = 'lead' | 'win';
export class UpdateRoleCommand extends RoomCommand {
	public constructor(
		protected room: Room,
		protected service: RoomService,
		protected role: RoleRoom,
	) {
		super(room, service);
	}
	public execute(player: Player): void {
		const roleArrayProp = this.role.concat('s');
		const reason: 'leader' | 'winner' = this.role.concat(this.role.endsWith('n') ? 'ner' : 'er') as
			| 'leader'
			| 'winner';
		// console.error(`Update role Player ${player.username}`, roleArrayProp, this.room, player);
		(player[roleArrayProp] as string[]).push(this.room.name);
		if (!Object.keys(this.room).includes(reason)) {
			Object.defineProperty(this.room, roleArrayProp, player);
		} else {
			this.room[reason] = this.room.all[0];
		}
		this.room.updatePlayer(player, player.status(this.room.name));
		this.room.updatePlayers(player);
		if (this.service.isConnectedOnServer()) {
			this.service.publishNewRole(reason, this.room, player);
		}
		player.log(`[PLAYER] change role ${player.username} ${reason} room ${this.room.name}`);
		this.room.log(`[ROOM] change role ${player.username} ${reason} room ${this.room.name}`);
	}
}
// export class UpdateLeaderCommand extends RoomCommand {
// 	public constructor(
// 		protected room: Room,
// 		protected service: RoomService,
// 	) {
// 		super(room, service);
// 	}
// 	public execute(player: Player): void {
// 		// update leader

// 		if (this.room.isLeader(player)) {
// 			player.leads.splice(player.leads.indexOf(this.room.name), 1);
// 			if (this.room.total > 0) {
// 				this.room.leader = this.room.all[0];
// 				logger.log(`[ROOM] change leader ${player.username} removed room \
// ${this.room.name}`);
// 			}
// 			this.room.leader.leads = this.room.name;
// 		}
// 	}
// }
