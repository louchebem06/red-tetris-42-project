import fs from 'fs'

// TODO Ask this info before starting server!
const controller = new AbortController()
const { signal } = controller

type Env = {
	key: string
	value: string
}

const env: Env[] = [
	{ key: 'PORT', value: '8080' },
	{ key: 'HOST', value: 'localhost' },
	{ key: 'PROTOCOL', value: 'ws' },
]

let body: string = ''

for (const e of env) {
	body += `${e.key}=${e.value}\n`
}

fs.access('./.env', fs.constants.F_OK, (err) => {
	if (err) {
		fs.writeFile('./.env', body, { signal }, (error) => {
			console.log(`\x1b[33m*** .env created ***\x1b[0m`)
			if (error) {
				console.error(`***[${error?.name}:${error?.message}]***`)
				controller.abort()
			}
		})
	} else {
		console.log(`\x1b[31m*** .env already exists ***\x1b[0m`)
	}
})
