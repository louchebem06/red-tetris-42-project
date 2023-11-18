import IPlayerJSON from './IPlayerJSON';
import IRoomJSON from './IRoomJSON';

export interface IMessageOutgoingPayload {
	date: Date;
	message: string;
	emitter: IPlayerJSON;
	receiver: IPlayerJSON | IRoomJSON | undefined;
}

export interface IMessageIncomingPayload {
	message: string;
	receiver: string; // session id of the player or name of the room
}
