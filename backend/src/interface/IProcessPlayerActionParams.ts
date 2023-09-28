import IUserData from './IUserData';
import Player from '../model/Player';

export interface IProcessPlayerActionParams {
	actionCallback: (player: Player) => void;
	userData: IUserData;
}
