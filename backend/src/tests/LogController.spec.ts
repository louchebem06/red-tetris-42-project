import { logger } from '../controller/LogController';

describe('logger', () => {
	// TODO chck path file
	test('basic log', (done) => {
		const env = process.env;
		const log = `Hello World! A little look at the env? ${JSON.stringify(env)}`;
		logger.log(log);
		done();
	});
});
