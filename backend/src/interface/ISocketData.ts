import PlayerController from '../controller/PlayerController';
import RoomController from '../controller/RoomController';
import Player from '../model/Player';

export default interface ISocketData {
	player: Player;

	playerController: PlayerController;
	roomController: RoomController;
}
