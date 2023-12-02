export interface Timer {
	destroySession: number;
	disconnectSession: number;
}
const timer: Timer = {
	destroySession: parseInt(process.env.DESTROY_TIMER ?? '3600', 10) * 1000,
	disconnectSession: parseInt(process.env.DISCO_TIMER ?? '60', 10) * 1000,
};
export default timer;
