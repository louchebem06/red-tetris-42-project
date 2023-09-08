class UsernamesList {
	static datas: Map<string, number> = new Map();

	static setRecurrence(value: string, recurrence: number): void {
		if (value && recurrence) {
			this.datas.set(value, recurrence);
		}
	}

	static addRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			const recurrence = this.getRecurrence(value);
			this.setRecurrence(value, recurrence + 1);
		} else {
			this.setRecurrence(value, 1);
		}
	}

	static removeRecurrence(value: string): boolean {
		if (this.hasRecurrence(value)) {
			const recurrence = this.getRecurrence(value);
			if (recurrence > 1) {
				this.setRecurrence(value, recurrence - 1);
				return true;
			} else {
				this.deleteRecurrence(value);
			}
		}
		return false;
	}

	static getRecurrence(value: string): number {
		if (this.hasRecurrence(value)) {
			return this.datas.get(value) || 0;
		}
		return 0;
	}

	static hasRecurrence(value: string): boolean {
		if (this.datas?.has(value))
			return true;
		return false;
	}

	static deleteRecurrence(value: string): void {
		console.log(`deleteRecurrence: ${value}`);
		if (this.hasRecurrence(value)) {
			this.datas.delete(value);
			console.log(`deleted: ${value} - ${this.hasRecurrence(value)}`);
			if (this.datas.size === 0) {
				this.datas.clear();
				console.log(`all clear: ${value} - ${this.hasRecurrence(value)}`);
			}
		}
	}

	static getNewUsername(value: string): string {
		if (!this.hasRecurrence(value)) {
			this.addRecurrence(value);
			return value;
		}

		let newUsername = value;
		while (this.hasRecurrence(newUsername)) {
			const recurrence = this.getRecurrence(newUsername);

			newUsername = value + "#" + recurrence.toString();
			this.addRecurrence(value);
		}
		this.addRecurrence(newUsername);
		return newUsername;
	}

	static get list(): string[] {
		return Array.from(this.datas.keys()).map((key: string) => key) || [];
	}
}

export default UsernamesList;
