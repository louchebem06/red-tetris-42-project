import IStore from '../interface/IStore';
import Room from '../model/Room';

export default class RoomStore implements IStore<Room> {
	private rooms: Map<string, Room> = new Map();

	public get(id: string): Room | undefined {
		return this.rooms.get(id);
	}

	public save(id: string, room: Room): void {
		this.rooms.set(id, room);
	}

	public get all(): Room[] {
		return [...this.rooms.values()];
	}

	public delete(id: string): void {
		this.rooms.delete(id);
	}

	public has(id: string): boolean {
		return this.rooms.has(id);
	}

	public get total(): number {
		return this.rooms.size;
	}
}
