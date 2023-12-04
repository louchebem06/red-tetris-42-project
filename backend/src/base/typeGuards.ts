type Validator<T> = (value: unknown) => value is T;
function isTypeOfUndefined<T>(value: T | undefined): value is undefined {
	return typeof value === 'undefined';
}

// function isTypeOfNull<T>(value: T | null): value is null {
// 	return typeof value === null;
// }

export { Validator, isTypeOfUndefined };
