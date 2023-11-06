import { Payload } from './ISrvToCltEvts';

export interface IBrodacastFormat {
	event: string;
	data: Payload;
	sid?: string;
	room?: string;
}
