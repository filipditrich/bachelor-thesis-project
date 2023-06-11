import { camelCase, isObject } from 'lodash';

/**
 * User defined type guard, which guarantees 'object is T', not undefined, not null
 * @see https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html#user-defined-type-guards
 * @param {T | undefined | null} variable
 * @return {object is T}
 */
export const isDefined = <T>(variable: T | undefined | null): variable is NonNullable<T> => variable !== undefined && variable !== null;

/**
 * Type guard, which guarantees object is defined but empty
 * @param {"" | T | undefined | null} value
 * @return {value is "" | undefined | null}
 */
export const isEmpty = <T>(value: T | undefined | null | ''): value is undefined | null | '' => !isDefined(value) || value === '';

/**
 * Generic type guard
 * @see https://rangle.io/blog/how-to-use-typescript-type-guards/
 * @param varToBeChecked
 * @param {(keyof T)[]} propertiesToCheckFor
 * @return {varToBeChecked is T}
 */
export const isOfType = <T>(varToBeChecked: any, propertiesToCheckFor?: (keyof T)[]): varToBeChecked is T => {
	if (isEmpty(propertiesToCheckFor)) return isDefined(varToBeChecked);
	return !propertiesToCheckFor.map((propToCheck) => (varToBeChecked as T)?.[propToCheck] !== undefined).includes(false);
};

/**
 * Return array of specified length
 * @param {number} length
 * @returns {number[]}
 */
export const arrayOf = (length: number) => Array.from(Array(length).keys());

/**
 * Safely returns min/max values from array of numbers
 * @see https://stackoverflow.com/questions/42623071/maximum-call-stack-size-exceeded-with-math-min-and-math-max
 * @see https://nfctron.atlassian.net/browse/AC-1702
 * @param arr
 * @returns [number, number]
 */
export const arrayMinMax = (arr: number[]): [number, number] =>
	arr.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);

/**
 * Picks specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @return {Pick<T, K>}
 */
export const pickFrom = <T extends object, K extends keyof T>(base: T, ...keys: K[]): Pick<T, K> => {
	const entries = keys.map((key) => [key, base[key]]);
	return Object.fromEntries(entries);
};

/**
 * Omits specified props from provided object
 * @param {T} base
 * @param {K} keys
 * @returns {Omit<T, K>}
 */
export const omitFrom = <T extends object, K extends keyof T>(base: T, ...keys: K[]): Omit<T, K> => {
	const entries = (Object.keys(base) as K[]).filter((k) => !keys.includes(k)).map((key) => [key, base[key]]);
	return Object.fromEntries(entries);
};

/***
 * Extracts all values from the given input with type of returnableType
 * @param {T} data
 * @param {V} returnableType
 * @returns {Array<V>}
 */
export const extractSameTypeFields = <T extends unknown, V extends unknown = string>(data: T, returnableType: V = '' as V): Array<V> => {
	/** returnable input */
	if (typeof data === typeof returnableType) {
		return [data as unknown as V];
	}

	/** object */
	if (typeof data === 'object') {
		/** null is typeof object */
		if (!isDefined(data)) return [];

		/** recursive array */
		if (Array.isArray(data)) {
			return data.reduce((acc, value) => [...acc, ...extractSameTypeFields(value, returnableType)], [] as V[]);
		}

		/** recursive object fields */
		const keys: (keyof T)[] = Object.keys(data as object) as (keyof T)[];
		return keys.reduce((acc, key) => [...acc, ...extractSameTypeFields(data[key], returnableType)], [] as V[]);
	}

	/** other invalid types */
	return [];
};

/**
 * Cleans object from falsy values such as `undefined`, `null`, empty object or empty string and optionally formats the value
 * @param {T} inputObject
 * @param {(val: T[keyof T]) => T[keyof T]} format
 * @returns {T}
 */
export const cleanObject = <T extends Record<string | number | symbol, any>>(inputObject: T, format?: (val: T[keyof T]) => T[keyof T]): T =>
	Object.fromEntries(
		Object.entries(inputObject)
			.filter(([_, value]) => !isEmpty(value))
			.map(([k, value]) => [k, Array.isArray(value) ? value : isObject(value) ? cleanObject(value) : isDefined(format) ? format(value) : value]),
	) as T;

/**
 * Cleans array from falsy values such as `undefined`, `null`, empty object or empty string
 * @param {T[]} inputArray
 * @returns {T[]}
 */
export const cleanArray = <T>(inputArray: T[]): T[] => inputArray.filter((value) => !(isEmpty(value) || !value));

/**
 * Return whether the given haystack contains any items from the given needles
 * @param {Array<T>} haystack
 * @param {T} needles
 * @returns {boolean}
 */
export const includesSome = <T>(haystack: Array<T> | undefined | null, ...needles: Array<T>): boolean =>
	Array.from(needles).some((p) => haystack?.includes(p));

/**
 * Return whether the given haystack contains all items from the given needles
 * @param {Array<T>} haystack
 * @param {T} needles
 * @returns {boolean}
 */
export const includesAll = <T>(haystack: Array<T> | undefined | null, ...needles: Array<T>): boolean =>
	Array.from(needles).every((p) => haystack?.includes(p));

/**
 * Helper to produce an array of enum values.
 * @param enumeration Enumeration object
 * @returns NonFunctional<T[keyof T]>[];
 */
export function enumToArray<T extends object>(enumeration: T): NonFunctional<T[keyof T]>[] {
	return Object.keys(enumeration)
		.filter((key) => Number.isNaN(Number(key)))
		.map((key) => (enumeration as any)[key])
		.filter((val) => typeof val === 'number' || typeof val === 'string');
}

type NonFunctional<T> = T extends Function ? never : T;

/**
 * No-operation function
 * @return {void}
 */
export const noop = (): void => {};

/**
 * Truncates long string to the specified length
 * @param {string} text
 * @param {number | undefined} length
 * @param {string | undefined} suffix
 * @return {string}
 */
export const truncate = (text: string, length?: number, suffix: string = '…'): string =>
	isDefined(length) && text.length > length ? `${text.substring(0, length - suffix.length)}${suffix}` : text;

/**
 * Returns random number from an interval
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const randomNumBetween = (min: number, max: number): number => Math.random() * (max - min + 1) + min;

/**
 * Returns random integer from an interval
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const randomIntBetween = (min: number, max: number): number => Math.floor(randomNumBetween(min, max));

/**
 * Silences error and returns fallback value if error is thrown
 * @param {(...args: any) => R} func
 * @param {F} fallback
 * @returns {R | F}
 */
export const silenceError = <R, F = undefined>(func: (...args: any) => R, fallback?: F): R | F => {
	try {
		return func();
	} catch (e) {
		return fallback as F;
	}
};

/**
 * Resolves generated promise with optional value
 * @param {number} delay
 * @param {() => any} resolver
 * @param value
 * @returns {Promise<unknown>}
 */
export const fakePromise = (delay: number, resolver?: () => any, value?: any) =>
	new Promise((resolve) =>
		setTimeout(
			() => {
				resolver?.();
				resolve(value);
			},
			delay,
			value,
		),
	);

/**
 * Resolved an input promise within a minimum delay time. It may be useful for showing a loading spinner for a minimum amount of time.
 * @param {PromiseLike<T>} promise
 * @param {number} delay
 * @returns {Promise<Awaited<T>>}
 */
export const minimumPromise = async <T>(promise: PromiseLike<T>, delay: number = 500): Promise<Awaited<T>> =>
	(await Promise.all([promise, fakePromise(delay)]))[0];

/**
 * Maps slug-cased prop keys to camel-cased prop keys
 * @param {Record<string, string | number>} props
 * @returns {{[p: string]: string}}
 */
export const mapHtmlPropsToReact = (props: Record<string, string | number>) =>
	Object.fromEntries(Object.entries(props).map(([key, value]) => [camelCase(key), value]));

/**
 * Encodes string to base64
 * @param {string} data
 * @returns {string}
 */
export const encodeBase64 = (data: string) => {
	return Buffer.from(data).toString('base64');
};

/**
 * Descodes base64 string
 * @param {string} data
 * @returns {string}
 */
export const decodeBase64 = (data: string) => {
	return Buffer.from(data, 'base64').toString('ascii');
};
