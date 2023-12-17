import { Validator } from '../../utils/typeGuards';
import IRoomJSON from '../../../interface/IRoomJSON';

const isRoom: Validator<IRoomJSON> = (value): value is IRoomJSON => {
	if (typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}
	const _value = value as IRoomJSON;
	return (
		'leader' in _value &&
		'name' in _value &&
		'dateCreated' in _value &&
		'players' in _value &&
		'gameState' in _value &&
		'totalPlayers' in _value &&
		'readys' in _value &&
		'totalReady' in _value
	);
};

const isArrayOfRooms: Validator<IRoomJSON[]> = (value): value is IRoomJSON[] => {
	const _value = value as IRoomJSON[];
	// console.error('isArrayOfRooms', _value, value);
	return _value.every(isRoom);
};

export { isRoom, isArrayOfRooms };
