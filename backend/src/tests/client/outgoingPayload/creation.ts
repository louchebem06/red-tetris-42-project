import { createOutgoingPayloadFactory } from './factory';
import { OAPM, OutgoingAction } from './types';

function createOutgoingPayload<T extends keyof OAPM>(settings: Partial<OAPM[T]>): OAPM[T] {
	return createOutgoingPayloadFactory<T>()(settings);
}

function createOutgoingAction<T extends keyof OAPM>(event: T, payload: OAPM[T]): OutgoingAction<T> {
	// if (event === 'getRooms') console.error('createOutgoingAction', event, payload);
	return { event, payload: createOutgoingPayload<T>(payload) };
}

export { createOutgoingPayload, createOutgoingAction };
