import { Payload } from '../type/PayloadsTypes';

export interface IBrodacastFormat {
	event: string;
	data: Payload;
	sid?: string;
	room?: string;
}
