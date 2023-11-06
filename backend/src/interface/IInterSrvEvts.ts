export default interface IInterSrvEvts {
	error: (error: Error) => void;
	ping: () => void;
}
