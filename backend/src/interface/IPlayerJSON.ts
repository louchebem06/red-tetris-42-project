export default interface IPlayerJSON {
	username: string;
	sessionID: string;
	dateCreated: Date;
	leads: string[];
	wins: string[];
	connected: boolean;
	games: Map<string, object>;
}
