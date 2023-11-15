import IPlayerJSON from './IPlayerJSON';

export default interface IPlayerPayload {
	reason: string;
	player: IPlayerJSON;
}
