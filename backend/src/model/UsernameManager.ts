class UsernameManager {
	private _list: Map<string, number> = new Map()

	private setRecurrence(value: string, recurrence: number): void {
		this._list.set(value, recurrence)
	}

	private addRecurrence(value: string): void {
		if (this.hasRecurrence(value)) {
			let recurrence = this.getRecurrence(value)
			if (this.isAvailableRootUsername(value)) {
				const root = `${value}#`
				let recRoot = 0
				for (; this.hasRecurrence(`${root}${(recRoot + 1).toString()}`); recRoot++)
					if (this.hasRecurrence(`${root}${recRoot.toString()}`)) recRoot++
				recurrence += recRoot
			}
			this.setRecurrence(value, recurrence + 1)
		} else {
			this.setRecurrence(value, 1)
		}
	}

	private deleteRecurrence(value: string): void {
		this.hasRecurrence(value) && this._list.delete(value)
		this._list.size === 0 && this._list.clear()
	}

	public removeRecurrence(value: string): boolean {
		const hasReccurrence = this.hasRecurrence(value)
		if (hasReccurrence) {
			const root = this.getRootUsername(value)
			if (!this.isRootUsername(value) && this.hasRecurrence(root)) {
				const recur = this.getRecurrence(root)
				recur > 1 ? this.setRecurrence(root, recur - 1) : this.removeRecurrence(root)
			}
			this.deleteRecurrence(value)
		}
		return hasReccurrence
	}

	public getRecurrence(value: string): number {
		return this._list?.get(value) || 0
	}

	public hasRecurrence(value: string): boolean {
		return this._list?.has(value)
	}

	public flush(): void {
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
	public setNewUsername(value: string): string {
		// TODO Essayer de refac comme ci-dessous
		// A appliquer aussi sur getNextNewUsername
		/*const username = value ?? 'anon'
		if (!this.hasRecurrence(username)) {
			if (username.includes('#')) {
				throw new Error('UsernameManager: forbidden symbol into username')
			}
			const root = `${username}#`
			this._list.forEach((val, key) => {
				if (key.includes(root)) {
					this.addRecurrence(username)
				}
			})
			this.addRecurrence(username)
			return username
		}
		let newUsername = username.includes('#') ? this.getRootUsername(username) : username
		for (let recurrence = 1; this.hasRecurrence(newUsername); recurrence++)
			newUsername = `${username}#${recurrence}`
		this.addRecurrence(newUsername)
		return newUsername*/
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

	public getNextNewUsername(value: string): string {
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

	public updateUsername(old: string, newValue: string): string {
		const oldRoot = this.getRootUsername(old)
		if (newValue !== oldRoot || this.isAvailableRootUsername(oldRoot)) {
			this.removeRecurrence(old)
			return this.setNewUsername(newValue)
		}
		return old
	}

	public isRootUsername(value: string): boolean {
		if (!value) return false
		return !value.includes('#')
	}

	public isAvailableRootUsername(value: string): boolean {
		return this.isRootUsername(value) && !this.hasRecurrence(value)
	}

	public getRootUsername(value: string): string {
		if (this.isRootUsername(value)) return value
		return value.substring(0, value.indexOf('#'))
	}

	public get list(): string[] {
		return Array.from(this._list.keys()).map((key: string) => key)
	}

	public get size(): number {
		return this._list.size
	}

	// TODO methodes de debug (display), si non utilisees a delete en
	// fin de dev (pas de tests dessus)
	public display(): boolean {
		const it = this._list.entries()
		const size = this._list.size
		for (const i of it) {
			console.log(`username: ${i}`)
		}
		console.log(`total usernames: ${size}`)
		const values = [...this._list.values()]
		if (values && values.length > 1) {
			console.log(`total recurrences: ${values.reduce((a, b) => a + b)}`)
		}
		return size ? true : false
	}

	public displayUsername(value: string): boolean {
		const hasRecurrence = this.hasRecurrence(value)
		if (hasRecurrence) {
			const message = (i: string): string => {
				return `username: ${i}, recurrence: ${this.getRecurrence(value)}`
			}
			const it = this._list.keys()
			for (const i of it) if (i === value) console.log(message(i))
		}
		return hasRecurrence
	}
}

export default UsernameManager