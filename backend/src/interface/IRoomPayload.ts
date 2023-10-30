import IRoomJSON from './IRoomJSON';
import IPlayerJSON from './IPlayerJSON';

export default interface IRoomPayload {
	reason: string;
	room: IRoomJSON;
	player: IPlayerJSON;
}
