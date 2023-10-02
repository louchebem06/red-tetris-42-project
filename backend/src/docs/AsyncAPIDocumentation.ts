import { Parser, fromFile, ChannelInterface, ServerInterface } from '@asyncapi/parser'

type Event = {
	name: string
	description: string
	payload: unknown[]
}

type ObjectPayloadProperties = {
	type: string[]
	keys: unknown[]
	typeValues: unknown[]
}

export default class AsyncAPICustomDocumentation {
	private parser = new Parser()
	private _title: string = ''
	private _html: string = ''

	public async generateDoc(asyncapiYaml: string): Promise<void> {
		await this.setTitleDoc(asyncapiYaml)
		this._html = `
<html>
	${this.head}
    <body>
        <h1>${this._title} Documentation</h1>`
		await this.setHTMLDatasServer(asyncapiYaml)
		await this.setHTMLPayloads(asyncapiYaml)
		this._html += `
    </body>
</html>
`
	}

	public get html(): string {
		return this._html
	}

	private async setTitleDoc(asyncapiYaml: string): Promise<void> {
		const { document } = await fromFile(this.parser, asyncapiYaml).parse()
		if (document) {
			this._title = document.info().title()
		}
	}

	private async getChannels(asyncapiYaml: string): Promise<ChannelInterface[] | undefined> {
		const { document } = await fromFile(this.parser, asyncapiYaml).parse()
		if (document) {
			return Object.values(document.allChannels())
		}
		return undefined
	}

	private async getServers(asyncapiYaml: string): Promise<ServerInterface[] | undefined> {
		const { document } = await fromFile(this.parser, asyncapiYaml).parse()
		if (document) {
			return Object.values(document.servers())
		}
		return undefined
	}

	private getPayloads(channels: ChannelInterface[]): unknown[] {
		const _channels = channels
			.filter((c, i) => i === 3)
			.map((c) => Object.values(c))
			.flat()
			.filter((c, i, arr) => i < arr.length - 2)
			.map((c) => Object.values(c))

		const payloads = _channels
			.map((p) => Object.values(p))
			.flat()
			.filter((p, i) => i % 2 === 0)
			.map((p) => Object.values(p as object))
			.flat()
			.map((p) => Object.values(p as object))
			.flat()

		return payloads
	}

	private getOperation(mainPayload: unknown): Event | undefined {
		if (mainPayload && typeof mainPayload === 'object') {
			const details = Object.values(mainPayload)
			const name = details[0]
			const description = details[1]
			const payload = Object.values(details[2])
			return { name, description, payload }
		}
		return undefined
	}

	private getPayloadType(payload: unknown[]): string | undefined {
		if (payload && payload[0]) return payload[0].toString()
		return undefined
	}

	private getPropertiesPayload(payload: unknown[]): unknown[] {
		return payload.filter((p) => p as object).flat()
	}

	private getPropertiesName(properties: unknown[]): unknown[] {
		return properties
			.map((p) => p && typeof p === 'object' && Object.keys(p as object))
			.filter((p) => p && typeof p === 'object')
			.flat()
	}

	private getPropertiesValues(properties: unknown[]): unknown[] {
		return properties
			.map((p) => p && typeof p === 'object' && Object.values(p))
			.flat()
			.map((p) => p && typeof p === 'object' && Object.values(p))
			.filter((p) => p && typeof p === 'object')
			.map((v) => v && Object.values(v))
	}

	private getObjectPayloadProperties(deepDetails: unknown[]): ObjectPayloadProperties {
		const type = Object.keys(deepDetails)

		const keys = Object.values(deepDetails)
			.map((p) => p && typeof p === 'object' && Object.values(p))
			.flat()
			.filter((p) => p && typeof p === 'object')
			.map((p) => p && typeof p === 'object' && Object.keys(p))
			.flat()

		const typeValues = Object.values(deepDetails)
			.map((p) => p && typeof p === 'object' && Object.values(p))
			.flat()
			.filter((p) => p && typeof p === 'object')
			.map((p) => p && typeof p === 'object' && Object.values(p))
			.flat()

		return { type, keys, typeValues }
	}

	private async setHTMLDatasServer(asyncapiYaml: string): Promise<void> {
		const servers = await this.getServers(asyncapiYaml)
		if (servers) {
			const datasServer = Object.values(servers.flat()[0] as object)[0]
			const hostNames = Object.values(datasServer.variables.url.enum)
			const ports = Object.values(datasServer.variables.port.enum)
			const defaultPort = datasServer.variables.port.default
			const defaultHostName = datasServer.variables.url.default

			this._html += `<h2>Requests</h2>
			<p>Make your request here: <span class="serverDatas">${datasServer.url}</span></p>
			<p>Default hostname: <span class="serverDatas">${defaultHostName}</span></p>
			<p>Default port: <span class="serverDatas">${defaultPort}</span></p>
			<p>May be also accessible: `
			for (const host of hostNames) {
				this._html += `<span class="serverDatas">${host}</span>, `
			}
			this._html = this._html.substring(0, this._html.length - 3) as string
			this._html += `</p><p>May be also accessible: `
			for (const port of ports) {
				this._html += `<span class="serverDatas">${port}</span>, `
			}
			this._html = this._html.substring(0, this._html.length - 3) as string
			this._html += `</p>`
		}
	}

	private async setHTMLPayloads(asyncapiYaml: string): Promise<void> {
		const allChannels = await this.getChannels(asyncapiYaml)
		if (allChannels) {
			const payloads = this.getPayloads(allChannels)
			this._html += `<h2>Payloads</h2><ul>`
			for (const p of payloads) {
				if (p && typeof p === 'object') {
					const operation = this.getOperation(p)
					if (operation) {
						const { name, description, payload } = operation
						const type = this.getPayloadType(payload)

						this._html += `
						<li><h3>Event <span class="eventName">${name}</span></h3>
						<h4>${description}</h4>
						<p>Expected payload type: <span class="eventType">[${type}]</span></p>`

						this.displayPayloadExample(payload, type)
						this._html += `</li>`
					}
					this._html += `<hr/>`
				}
			}
			this._html += `</ul>`
		}
	}

	private setHTMLObjectProperties(typesProp: unknown): void {
		const details = typesProp
		if (details) {
			const { type, keys, typeValues } = this.getObjectPayloadProperties(details as unknown[])
			this._html += `{
		${type}: {`
			for (const i in keys) {
				if (typeValues[i] && typeof typeValues[i] === 'object') {
					const typeObjectProp = Object.values(typeValues[i] as object)[0]
					//console.log("typeObjectProp", typeObjectProp)
					this._html += `
			${keys[i]}: <span class="keywordsType">${typeObjectProp}</span>,`
				}
			}
			this._html += `
		}
	}`
		}
	}

	private displayPayloadExample(payload: unknown[], type: unknown): void {
		if (type === 'object') {
			const properties = this.getPropertiesPayload(payload)
			const nameProp = this.getPropertiesName(properties)
			const valueProp = this.getPropertiesValues(properties)

			const typesProp = []
			for (const v of valueProp) {
				if (v && typeof v === 'object') {
					const elt = Object.values(v)
					typesProp.push(elt.flat())
				}
			}
			this._html += `<pre>
{`
			for (const i in nameProp) {
				this._html += `
	${nameProp[i]}: `
				const typeProp = Object.values(typesProp[i] as object)[0]
				if (typeProp && typeProp === 'string') {
					const descProp = typesProp[i][1]
					this._html += `<span class="keywordsType">${typeProp}</span>`
					if (descProp.length > 0 && !descProp.includes('<anonymous-schema-')) {
						this._html += ` <span class="comment">// ${descProp}</span>`
					}
				} else if (typeProp === 'object') {
					this.setHTMLObjectProperties(typesProp[i][2])
				}
			}
			this._html += `
}
</pre>`
		}
	}

	private get head(): string {
		return `
<head>
	<title>${this._title} Documentation</title>
	${this.css}
</head>`
	}

	private get css(): string {
		return ` 
<style>
	body { /* degradé purple */
		background: linear-gradient(259deg, #312244 -11.45%, #3e1f47 112.96%);
		font-family: Arial, sans-serif;
		color: #f4f4f4;
	}

	h1 {
		text-align: center; 
		color: #ff8228 /* orange */
	}

	h2, h3 {
		color: #ffca28 /* jaune */
	}

	h3 > .eventName, .eventType {
		color: #4bff53 /* vert */
	}
	
	h4 {
		text-decoration: underline;
	}

	ul {
		list-style-type: disc;
		padding: 20px;
	}

	li {
		margin: 10px 0;
	}

	pre {
		background-color: #333;
		color: rgba(255, 255, 255, 0.7);
		padding: 1.5em 3em;
		margin: 3em 6em;
		width: fit-content;
	}

	hr {
		margin: 3em;
		border: 1px dashed rgba(255, 202, 40, 0.7);
	}

	.comment {
		font-style: italic;
		color: #787;
	}

	.keywordsType {
		color: #ff7171; /* rouge */
		font-weight: bold;
	}

	.serverDatas {
		color: #ff8228;
		font-weight: bold;
	}

</style>`
	}
}