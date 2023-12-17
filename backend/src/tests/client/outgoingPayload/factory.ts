import { OAPM, OutgoingPayloadFactory } from './types';

function createOutgoingPayloadFactory<T extends keyof OAPM>(): OutgoingPayloadFactory<T> {
	return (settings) => {
		if (typeof settings === 'string') {
			return settings;
		} else if (Array.isArray(settings)) {
			return [...settings] as OAPM[T];
		}
		return { ...settings } as OAPM[T];
	};
}

export { createOutgoingPayloadFactory };
