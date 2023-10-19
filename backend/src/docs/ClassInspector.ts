import * as path from 'path';
import * as fs from 'fs';

enum UmlScope {
	private = '-',
	public = '+',
	protected = '#',
}

interface IStructure {
	type: string;
	name: string;
	properties: string[];
}

interface IParseMethods {
	propName: string;
	desc: string;
	bodyStruct: string;
	datas: IStructure;
	propStr: string;
	type: string;
}

type ReplaceHandler = (substring: string, ...args: string[]) => string;

export default class ClassInspector {
	private datas: Map<string, IStructure> = new Map();

	/**
	 * Inspects the classes in the specified directory.
	 *
	 * @param {string} directoryPath - The path of the directory to inspect.
	 * @return {void} This function does not return a value.
	 */
	public inspectClassesInDirectory(directoryPath: string): void {
		//console.log(`Inspecting classes in ${directoryPath}`);
		this.inspectClasses(directoryPath);
	}

	private inspectClasses(directoryPath: string): void {
		const files = fs.readdirSync(directoryPath);
		for (const file of files) {
			// console.log(`Inspecting class ${file}`);
			const filePath = path.join(directoryPath, file);
			const stats = fs.statSync(filePath);
			//console.log(filePath, stats);
			if (stats.isDirectory()) {
				this.inspectClasses(filePath);
			} else if (stats.isFile() && filePath.endsWith('.ts')) {
				this.inspectClassesInFile(filePath);
			}
		}
	}

	/**
	 * Inspects the classes in the given file and adds them to the 'classes' array.
	 *
	 * @param {string} filePath - The path of the file to inspect.
	 * @return {void} This function does not return anything.
	 */
	private inspectClassesInFile(filePath: string): void {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const typeRegex = /((export )*(default )*|^)(\w+)+(\s+(\w+)\s+{\n((\s+.+)+\n?)+})+/g;
		let structMatch;

		while ((structMatch = typeRegex.exec(fileContent)) !== null) {
			const [, , , , typeStruct, , nameStruct, bodyStruct] = structMatch;

			const bodyRegex = /\t((p\w+)+\s+(async )?)?((\w+|\(?)(\??:| = |\()(.*))*/g;
			let match;
			const datas: IStructure = {
				type: typeStruct,
				name: nameStruct,
				properties: [],
			};
			while ((match = bodyRegex.exec(bodyStruct)) !== null) {
				const [, , scope, , line, propName, type, description] = match;
				if (!scope && typeStruct === 'class') {
					continue;
				}
				if (line) {
					let propStr = getScope(scope);
					const desc = description;
					const props = [type, scope, typeStruct, propStr, propName, desc, bodyStruct];
					propStr = parseLine(datas, ...props);
					parseTuplesAndObjects(propStr, datas, propStr);
				}
			}
			this.datas.set(nameStruct, datas);
		}

		/**
		 * Parses a line of data.
		 *
		 * @param {IStructure} datas - the data structure
		 * @param {string[]} args - the arguments for the function
		 * @return {string} the parsed line
		 */
		function parseLine(datas: IStructure, ...args: string[]): string {
			const [type, scope, typeStruct, str, propName, _desc, bodyStruct] = args;
			let propStr = str;
			let desc = _desc;
			switch (type) {
				case '(':
					if (!scope && typeStruct === 'class') {
						propStr = '';
						break;
					}
					const methodDatas: IParseMethods = {
						propName,
						desc,
						bodyStruct,
						datas,
						propStr,
						type,
					};

					({ desc, propStr } = parseMethods(methodDatas));
					break;
				case ' = ':
					propStr = parseEnum(scope, typeStruct, desc, propStr, propName, type);
					break;
				case ':':
				case '?:':
					if (!scope && typeStruct === 'class') {
						propStr = '';
						break;
					}
					propStr = parseProperties(desc, type, propStr, propName);
					break;
				default:
					console.log(`not expected: ${type}; ${propName} desc: ${desc}`);
					break;
			}
			return propStr;
		}

		/**
		 * Parses the methods based on the provided data.
		 *
		 * @param {IParseMethods} datas - The data containing the methods to be parsed.
		 * @return {{ desc: string; propStr: string }} - The parsed description and property string.
		 */
		function parseMethods(datas: IParseMethods): { desc: string; propStr: string } {
			let desc = datas.desc;
			let propStr = datas.propStr;
			if (datas.propName === 'constructor') {
				// potentiellement plusieurs lignes de params
				desc = parseConstructor(datas.bodyStruct, desc, datas.datas);
			} else {
				// autres fonctions
				desc = desc.replace(/ {$/, '');
			}
			// recup les arguments
			propStr += `${datas.propName}${datas.type}${desc}`;
			return { desc, propStr };
		}

		function parseEnum(...args: string[]): string {
			const [scope, typeStruct, desc, str, propName, type] = args;
			let propStr = str;
			if (!scope && typeStruct === 'enum') {
				desc.replace(/([^,;'\{\}]+)/g, (m, m1) => {
					propStr += `${propName}${type}${m1}`;
					return m1;
				});
			}
			return propStr;
		}

		/**
		 * Parses properties from a description string.
		 *
		 * @param {string} desc - The description string.
		 * @param {string} type - The type of the property.
		 * @param {string} str - The string to parse.
		 * @param {string} name - The name of the property.
		 * @return {string} The parsed properties.
		 */
		function parseProperties(desc: string, type: string, str: string, name: string): string {
			let propStr = str;
			desc.replace(/([^;\{\}]+)/g, (m, m1) => {
				const affect = ' = ';
				let index;
				if ((index = m1.indexOf(affect)) !== -1) {
					m1 = m1.substring(0, index);
				}
				if (type === '?:') {
					propStr += '?';
				}
				m1 = m1.trim().replace(/[,]$/, '');
				propStr += `${m1} ${name.trim()}`;
				return m1;
			});
			return propStr;
		}

		/**
		 * Parses the constructor body and generates a description.
		 *
		 * @param {string} body - The body of the constructor.
		 * @param {string} description - The initial description.
		 * @param {IStructure} datas - The structure data.
		 * @return {string} The generated description.
		 */
		function parseConstructor(body: string, description: string, datas: IStructure): string {
			const protoRegex = /\t(?:.*)\(((?:\n(?:.*))+)\n\t\) \{/g;
			let protoMatch;
			if ((protoMatch = protoRegex.exec(body)) !== null) {
				const argsRegex = /(\s*(p\w+)?\s*(\w+)\??:\s*(\w+),?)/g;
				description = protoMatch[1].replace(argsRegex, parseConstructorArgs(datas));
				description = description.replace(/, $/g, ')');
			} else {
				const argsRegex = /(\s*(p\w+)?\s*(\w+)\??:\s*(\w+(\[\])?),?)?(\)) \{\s*\}?/g;
				description = description.replace(argsRegex, parseConstructorArgs(datas));
				description = description
					.trim()
					.replace(/,$/g, ')')
					.replace(/(,)(\w)/g, '$1 $2');
			}
			return description;
		}

		/**
		 * Parses the constructor arguments.
		 *
		 * @param {IStructure} datas - The data structure.
		 * @return {ReplaceHandler} The replace handler function.
		 */
		function parseConstructorArgs(datas: IStructure): ReplaceHandler {
			return (m, _args, mod, varName, varType): string => {
				const _scope = mod ? getScope(mod) : '';
				const propUml = parseTuplesAndObjects(mod, datas, `${_scope}${varType} ${varName}`);
				if (varName && varType) {
					return `${propUml}, `;
				}
				return `)`;
			};
		}

		/**
		 * Parses tuples and objects in a given string.
		 *
		 * @param {string} mod - The modifier to apply.
		 * @param {IStructure} datas - The data structure to parse.
		 * @param {string} str - The string to parse.
		 * @return {string} The parsed string.
		 */
		function parseTuplesAndObjects(mod: string, datas: IStructure, str: string): string {
			let _propUml = str;
			if (mod && !datas.properties.includes(_propUml)) {
				const contRegex = /<(\w+)(, (.*))?>/g;
				const objectRegex = /(\{)(.*)(\})/g;
				_propUml = _propUml.replace(contRegex, (m, m1, m2, m3): string => {
					return `~${m1}~${m3 ? m3 + '~' : ''}`;
				});
				_propUml = _propUml.replace(objectRegex, (m, m1, m2): string => {
					return `object( ${m2})`;
				});
				datas.properties.push(_propUml);
			}
			return _propUml;
		}

		/**
		 * Retrieves the scope value based on the input.
		 *
		 * @param {string} scope - The input scope value.
		 * @return {string} The corresponding UmlScope value.
		 */
		function getScope(scope: string): string {
			switch (scope) {
				case 'private':
					return UmlScope.private;
				case 'protected':
					return UmlScope.protected;
				case 'public':
					return UmlScope.public;
			}
			return UmlScope.public;
		}
	}

	/**
	 * Generates a UML representation of a given class.
	 *
	 * @param {string} className - The name of the class.
	 * @return {string | undefined} - The UML representation of the class,
	 * or undefined if the class does not exist.
	 */
	public getUml(className: string): string | undefined {
		const datas = this.datas.get(className);
		let uml = '';

		if (datas) {
			uml = `class ${datas.name} {\n\t%%${datas.type}\n`;
			for (const prop of datas.properties) {
				uml += `\t${prop}\n`;
			}
			uml += `}`;
		}
		return uml;
	}
}
