class UsernamesList {
	static datas: Map<string, number> = new Map();

	static setRecurrence(value: string, recurrence: number): void {
		if (value && recurrence) {
			this.datas.set(value, recurrence);
		}
	}

	static addRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			let recurrence = this.getRecurrence(value);
			if (this.isAvailableRootUsername(value)) {
				const root = value + "#";
				let recRoot = 0;
				console.log()
				for (;this.hasRecurrence(root + (recRoot + 1).toString());recRoot++)
				if (this.hasRecurrence(root + (recRoot).toString()))
					++recRoot
				recurrence += recRoot;
			}
			this.setRecurrence(value, recurrence + 1);
		} else {
			this.setRecurrence(value, 1)
		}
	}

	static removeRecurrence(value: string): boolean {
		if (this.hasRecurrence(value)) {
			const root = this.getRootUsername(value);
			if (!this.isRootUsername(value) && this.hasRecurrence(root)) {
				const recurrence = this.getRecurrence(root);
				if (recurrence > 1) {
					this.setRecurrence(root, recurrence - 1);
				} else {
					this.removeRecurrence(root);
				}
			}
			this.deleteRecurrence(value);
			return true;
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
		if (this.hasRecurrence(value)) {
			this.datas.delete(value);
			if (this.datas.size === 0) {
				this.datas.clear();
			}
		}
	}

	static setNewUsername(value: string): string {
		if (!this.hasRecurrence(value)) {
			const root = value + "#";
			this.datas.forEach((val, key) => {
				if (key.includes(root)) {
					this.addRecurrence(value)
				}
			});
			this.addRecurrence(value);
			return value;
		} else {
			let newUsername = value;
			let recurrence = 1;
			while (this.hasRecurrence(newUsername)) {
				newUsername = value + "#" + recurrence.toString();
				recurrence++;
			}
			if (value !== newUsername)
				this.addRecurrence(value);
			this.addRecurrence(newUsername);
			return newUsername;
		}
	}

	static updateUsername(old: string, newValue: string): string {
		const oldRoot = this.getRootUsername(old);
		if (newValue !== oldRoot || this.isAvailableRootUsername(oldRoot)) {
			this.removeRecurrence(old);
			return this.setNewUsername(newValue);
		}
		return old;
	}

	/*static getNewUsername(value: string): string {
		if (!this.hasRecurrence(value)) {
			return value;
		}

		let newUsername = value;
		let recurrence = this.getRecurrence(newUsername);
		while (this.hasRecurrence(newUsername)) {
			newUsername = value + "#" + recurrence.toString();
			recurrence++;
		}
		return newUsername;
	}*/

	static isRootUsername(value: string): boolean {
		return !value.includes("#");
	}

	static isAvailableRootUsername(value: string): boolean {
		return this.isRootUsername(value) && !this.hasRecurrence(value);
	}

	static getRootUsername(value: string): string {
		if (this.isRootUsername(value))
			return value;
		return value.substring(0, value.indexOf("#"));
	}

	static get list(): string[] {
		return Array.from(this.datas.keys()).map((key: string) => key) || [];
	}

	static display(): void {
		const it = this.datas.entries();
		for (const i of it) {
			console.log(`username: ${i}`);
		}
		console.log(`total usernames: ${this.datas.size}`);
		const values = [...this.datas.values()];
		if (values && values.length > 1)
			console.log(`total recurrences: ${values.reduce((a, b) => a + b)}`);
	}

	static displayUsername(value: string): void {
		if (this.hasRecurrence(value)) {
			const it = this.datas.keys();
			for (const i of it) {
				if (i === value) {
					console.log(`username: ${i}, recurrence: ${this.getRecurrence(value)}`);
				}
			}
		}
	}
}

export default UsernamesList;
