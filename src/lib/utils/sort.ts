import { Paths, Primitive } from '@project/lib/types/common';
import { get } from 'lodash';

/**
 * Generic sorter function
 * @author filipditrich <filip.ditirch@plus4u.net>
 * @param {T} a
 * @param {T} b
 * @param {SortOptions} options
 * @returns {number}
 */
export const sorter = <T extends Primitive>(a: T, b: T, options: SortOptions): number => {
	let comparison = 0;
	if (typeof a === 'string' && typeof b === 'string') comparison = a.localeCompare(b);
	else if (a instanceof Date && b instanceof Date) comparison = a.getTime() - b.getTime();
	else if (typeof a === 'bigint' && typeof b === 'bigint') comparison = Number(a) - Number(b);
	else comparison = (a as number) - (b as number);

	return options.direction === 'asc' ? comparison : -comparison;
};

/**
 * Generic array of objects sorter
 * @author filipditrich <filip.ditirch@plus4u.net>
 * @param {Paths<T>} prop
 * @param {SortOptions} options
 * @returns {(a: T, b: T) => number}
 */
export const sortBy =
	<T extends Record<string | number | symbol, any>>(prop: Paths<T>, options: SortOptions = {}) =>
	(a: T, b: T): number => {
		const aProp = get(a, prop);
		const bProp = get(b, prop);
		return sorter<T[Paths<T>]>(aProp, bProp, options);
	};

/**
 * Options for sort functions
 * @export
 */
export type SortOptions = {
	direction?: 'asc' | 'desc' | null;
};
