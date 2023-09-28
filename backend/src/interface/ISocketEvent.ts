export default interface ISocketEvent {
	name: string;
	middleware: (data: unknown) => void;
}
