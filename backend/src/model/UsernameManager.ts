class UsernameManager {
	private _list: Map<string, number> = new Map()

	private setRecurrence(value: string, recurrence: number): void {
		if (value && recurrence) {
			this._list.set(value, recurrence)
		}
	}

	private addRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			let recurrence = this.getRecurrence(value)
			if (this.isAvailableRootUsername(value)) {
				const root = value + '#'
				let recRoot = 0
				console.log()
				for (; this.hasRecurrence(root + (recRoot + 1).toString()); recRoot++)
					if (this.hasRecurrence(root + recRoot.toString())) ++recRoot
				recurrence += recRoot
			}
			this.setRecurrence(value, recurrence + 1)
		} else {
			this.setRecurrence(value, 1)
		}
	}

	private deleteRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			this._list.delete(value)
			if (this._list.size === 0) {
				this._list.clear()
			}
		}
	}

	removeRecurrence(value: string): boolean {
		if (this.hasRecurrence(value)) {
			const root = this.getRootUsername(value)
			if (!this.isRootUsername(value) && this.hasRecurrence(root)) {
				const recurrence = this.getRecurrence(root)
				if (recurrence > 1) {
					this.setRecurrence(root, recurrence - 1)
				} else {
					this.removeRecurrence(root)
				}
			}
			this.deleteRecurrence(value)
			return true
		}
		return false
	}

	getRecurrence(value: string): number {
		if (this.hasRecurrence(value)) {
			return this._list.get(value) || 0
		}
		return 0
	}

	hasRecurrence(value: string): boolean {
		if (this._list?.has(value)) return true
		return false
	}

	flush(): void {
		if (this.list) this._list.clear()
	}

	/*
	 * Si value undefined ou "" -> devient anon
	 * Si # dans le username et 1er ajout dans la liste -> Erreur
	 * symbole, sinon on peut etre dans le cas d'un update
	 * Si creation et username unique -> retour tel quel
	 * Sinon on ajout #x derriere le username.
	 * Dans le cas d'un update root#number, et recup root et on update
	 * le number si pris (donc devient root si libéré, sinon num
	 * suivant)
	 * On maintient à jour la liste des usernames à utiliser
	 */
	setNewUsername(value: string = 'anon'): string {
		if (!value) value = 'anon'
		let username = value
		if (!this.hasRecurrence(username)) {
			if (username.includes('#')) {
				throw new Error('UsernameManager: forbidden symbol into username')
			}
			const root = username + '#'
			this._list.forEach((val, key) => {
				if (key.includes(root)) {
					this.addRecurrence(username)
				}
			})
			this.addRecurrence(username)
			return username
		} else {
			if (username.includes('#')) {
				username = this.getRootUsername(username)
			}
			let newUsername = username
			let recurrence = 1
			while (this.hasRecurrence(newUsername)) {
				newUsername = username + '#' + recurrence.toString()
				recurrence++
			}
			if (username !== newUsername) this.addRecurrence(username)
			this.addRecurrence(newUsername)
			return newUsername
		}
	}

	getNextNewUsername(value: string = 'anon'): string {
		if (!value) value = 'anon'
		let username = value
		if (!this.hasRecurrence(username)) {
			if (username.includes('#')) {
				throw new Error('UsernameManager: forbidden symbol into username')
			}
			return username
		} else {
			if (username.includes('#')) {
				username = this.getRootUsername(username)
			}
			let newUsername = username
			let recurrence = 1
			while (this.hasRecurrence(newUsername)) {
				newUsername = username + '#' + recurrence.toString()
				recurrence++
			}
			return newUsername
		}
	}

	updateUsername(old: string, newValue: string): string {
		const oldRoot = this.getRootUsername(old)
		if (newValue !== oldRoot || this.isAvailableRootUsername(oldRoot)) {
			this.removeRecurrence(old)
			return this.setNewUsername(newValue)
		}
		return old
	}

	isRootUsername(value: string): boolean {
		if (!value) return false
		return !value.includes('#')
	}

	isAvailableRootUsername(value: string): boolean {
		return this.isRootUsername(value) && !this.hasRecurrence(value)
	}

	getRootUsername(value: string): string {
		if (this.isRootUsername(value)) return value
		return value.substring(0, value.indexOf('#'))
	}

	get list(): string[] {
		return Array.from(this._list.keys()).map((key: string) => key) || []
	}

	get size(): number {
		return this._list.size
	}

	// TODO methodes de debug (display), si non utilisees a delete en
	// fin de dev (pas de tests dessus)
	display(): void {
		const it = this._list.entries()
		for (const i of it) {
			console.log(`username: ${i}`)
		}
		console.log(`total usernames: ${this._list.size}`)
		const values = [...this._list.values()]
		if (values && values.length > 1) {
			console.log(`total recurrences: ${values.reduce((a, b) => a + b)}`)
		}
	}

	displayUsername(value: string): void {
		if (this.hasRecurrence(value)) {
			const it = this._list.keys()
			for (const i of it) {
				if (i === value) {
					console.log(`username: ${i}, recurrence: ${this.getRecurrence(value)}`)
				}
			}
		}
	}
}

export default UsernameManager
