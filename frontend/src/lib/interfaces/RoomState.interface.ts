export default interface RoomState {
	lead: true;
	name: string;
	readys: number;
	stated: boolean;
	status: 'ready' | 'idle';
}
