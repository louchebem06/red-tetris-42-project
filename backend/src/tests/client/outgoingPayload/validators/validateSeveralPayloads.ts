import { expect } from '@jest/globals';
import { Socket } from 'socket.io-client';
import { OEvent, OPayload, OutgoingAction } from '..';
import { datasClients } from '../../utils/creation';
import { isTypeOfUndefined } from '../../../../base/typeGuards';
export async function validateSeveralPayloads(
	client: Socket,
	promise: Promise<Array<OPayload<OEvent>>>,
	expected: Array<OutgoingAction<OEvent>>,
	config?: {
		name: string;
		toWatch: string[];
	},
): Promise<void> {
	return await promise
		.then((data) => {
			// console.error(config);
			const datasClient = datasClients.find((d) => {
				const clientsToCheck = config && config?.toWatch.length > 0 ? config.toWatch : [client.id];
				return d.clients.some((cl) => clientsToCheck.includes(cl.id));
			});

			const sid = datasClient?.sessionID ?? '';
			// console.error(sid, config, data, client, datasClients);
			if (!isTypeOfUndefined(data)) {
				const payloads = expected.map((ex) => {
					if (Object.prototype.hasOwnProperty.call(ex.payload, 'sessionID')) {
						Object.assign(ex.payload, { sessionID: sid });
						return {
							...ex,
						};
					} else if (Object.prototype.hasOwnProperty.call(ex.payload, 'player')) {
						const p = { sessionID: sid };
						Object.assign((<OPayload<'playerChange' | 'roomChange'>>ex.payload).player, p);

						return { ...ex };
					}
					return ex;
				});
				if (data.length !== payloads.length) {
					return;
				}
				// console.error(payloads);
				// console.error(data);
				for (let i = 0; i < data.length; ++i) {
					expect(data[i]).toBeOutgoingPayload(payloads[i].payload);
				}
				// console.error(data);
			}
		})
		// .catch((e) => {
		// 	console.error(e, config, expected);
		// })
		.finally(() => {
			expected.forEach((ex) => {
				client.off(ex.event);
				// console.error(ex);
				client.off('error');
			});
		});
}
