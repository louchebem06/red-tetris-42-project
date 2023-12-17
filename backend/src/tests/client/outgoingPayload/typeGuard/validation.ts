import IRoomPayload from '../../../../interface/IRoomPayload';
import IRoomJSON from '../../../../interface/IRoomJSON';
import IPlayerPayload from '../../../../interface/IPlayerPayload';
import { IMessageOutgoingPayload as IMOP } from '../../../../interface/IMessagePayload';
import IGameStartPayload from '../../../../interface/IGameStartPayload';

import { Validator, isTypeOfUndefined } from '../../../utils/typeGuards';
import { isPlayer } from '../../../player/typeGuard/validation';
import { isRoom, isArrayOfRooms } from '../../../room/typeGuard/validation';
import { OAPM } from '../types';

type IGSP = IGameStartPayload;

const isPlayerPayload: Validator<IPlayerPayload> = (value): value is IPlayerPayload => {
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const _value = value as IPlayerPayload;
	return 'reason' in _value ? 'reason' in _value && isPlayer(_value['player']) : isPlayer(_value);
};

const isRoomPayload: Validator<IRoomPayload> = (value): value is IRoomPayload => {
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const _value = value as IRoomPayload;
	// console.error(
	// 	'isRoomPayload',
	// 	_value,
	// 	value,
	// 	'reason' in _value
	// 		? isPlayerPayload(_value['player']) && isRoom(_value['room'])
	// 		: isRoom(_value['room']) || isRoom(_value),
	// );
	return 'reason' in _value
		? isPlayerPayload(_value['player']) && isRoom(_value['room'])
		: isRoom(_value['room']) || isRoom(_value);
};

const isRoomArrayPayload: Validator<IRoomJSON[]> = (value): value is IRoomJSON[] => {
	if (!Array.isArray(value)) {
		return false;
	}
	// console.error('isRoomArrayPayload', value);
	return isArrayOfRooms(value);
};

const isIMessageOutgoingPayload: Validator<IMOP> = (value): value is IMOP => {
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const _value = value as IMOP;
	return (
		'date' in _value &&
		'message' in _value &&
		'emitter' in _value &&
		'receiver' in _value &&
		isPlayer(_value['emitter']) &&
		(isPlayer(_value.receiver) || isRoom(_value.receiver) || isTypeOfUndefined(_value.receiver))
	);
};

const isIGameStartPayload: Validator<IGSP> = (value): value is IGSP => {
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const _value = value as IGSP;
	return (
		'roomName' in _value &&
		'reason' in _value &&
		'message' in _value &&
		(_value['reason'] === 'time' || _value['reason'] === 'start')
	);
};

// TODO handler pour IOutgoingMessage && IGameStart
const isOutgoingPayload: Validator<OAPM[keyof OAPM]> = (value): value is OAPM[keyof OAPM] => {
	// console.error('isOutgoingPayload', value);
	return (
		typeof value === 'string' ||
		isPlayerPayload(value) ||
		isRoomPayload(value) ||
		isRoomArrayPayload(value) ||
		isIMessageOutgoingPayload(value) ||
		isIGameStartPayload(value)
	);
};

export {
	isRoom,
	isPlayer,
	isPlayerPayload,
	isRoomPayload,
	isRoomArrayPayload,
	isIMessageOutgoingPayload,
	isIGameStartPayload,
	isOutgoingPayload,
};
