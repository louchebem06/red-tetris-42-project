import { Socket } from 'socket.io-client';

import { isTypeOfUndefined } from '../../utils/typeGuards';

import { OutgoingActionPayloadMap as OAPM, OutgoingAction } from '../outgoingPayload/types';
import { IncomingActionPayloadMap as IAPM, IncomingAction } from '../incomingPayload/types';

import {
	sessionId,
	outgoingJoinHandler,
	outgoingPlayerChangeHandler,
	outgoingRoomChangeHandler,
	outgoingBasicHandler,
} from '../outgoingPayload/handlers';

import { expect } from '@jest/globals';

async function listentOutgoingEvent<T extends keyof OAPM, U extends keyof IAPM>(
	client: Socket,
	eventListener: string,
	emit: IncomingAction<U> | undefined,
): Promise<OAPM[T]> {
	return await new Promise<OAPM[T]>((resolve, reject) => {
		let handler;
		switch (eventListener) {
			case 'join':
				client.connect();
				handler = outgoingJoinHandler({ resolve });
				break;
			case 'playerChange':
				handler = outgoingPlayerChangeHandler({ resolve, sessionId });
				break;
			case 'roomChange' || 'roomOpened' || 'roomClosed':
				handler = outgoingRoomChangeHandler({ resolve, data: emit?.payload });
				break;
			default:
				handler = outgoingBasicHandler({ resolve });
		}
		const errorHandler = outgoingBasicHandler<'error'>({ resolve: reject });
		client.on(eventListener, handler);
		client.on('error', errorHandler);
		if (!isTypeOfUndefined(emit)) {
			client.emit(emit.event, emit?.payload);
		}
	});
}

async function validateOutgoingPayload<T extends keyof OAPM>(
	client: Socket,
	promise: Promise<OAPM[T]>,
	expected: OutgoingAction<T>,
): Promise<void> {
	return await promise
		.then((data: OAPM[T]) => {
			if (!isTypeOfUndefined(data)) {
				if (expected.event === 'join' && !(<OAPM['join']>expected.payload).sessionID) {
					const payload = {
						...(<OAPM['join']>expected.payload),
						sessionID: (<OAPM['join']>data).sessionID,
					};
					expect(data).toBeOutgoingPayload(payload);
				} else {
					// console.error('promise', promise, expected, data);
					expect(data).toBeOutgoingPayload(expected.payload);
				}
			}
		})
		.finally(() => {
			client.off(expected.event);
			client.off('error');
		});
}

async function testOutgoingEventWithIncomingAct<T extends keyof OAPM, U extends keyof IAPM>(data: {
	client: Socket;
	toSend: IncomingAction<U>;
	expected: OutgoingAction<T>;
}): Promise<void> {
	await validateOutgoingPayload<T>(
		data.client,
		listentOutgoingEvent<T, U>(data.client, data.expected.event, data.toSend),
		data.expected,
	);
}

export { testOutgoingEventWithIncomingAct };
