import IPlayerJSON from './IPlayerJSON';

export default interface IRoomJSON {
	name: string;
	dateCreated: Date;
	leader: IPlayerJSON;
	gameState: boolean;
	winner: IPlayerJSON | null;
	players: IPlayerJSON[];
	totalPlayers: number;
	readys: IPlayerJSON[];
	totalReady: number;
}
