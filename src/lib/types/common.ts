import { ComponentProps, Dispatch, JSXElementConstructor, SetStateAction } from 'react';

/**
 * Intersection of two interfaces
 */
export type Common<A, B> = {
	[P in keyof A & keyof B]: A[P] | B[P];
};

/**
 * Literal string union to use autocomplete
 * @see https://github.com/Microsoft/TypeScript/issues/29729
 */
export type LiteralUnion<T extends U, U> = T | (U & {});

/**
 * Type alias for a UUID string
 * @export
 */
export type UUID = string;

/**
 * React useState type
 * @export
 */
export type State<T, D = T> = [T, Dispatch<SetStateAction<D>>];

/**
 * Type alias for 8-bit hexadecimal string
 */
export type HexAlpha = `#${string}`;

/**
 * Type alias for star rating
 */
export type StarRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Keeps only K of T, other keys are optional
 * @export
 */
export type Keep<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

/**
 * Primitive type value
 * @export
 */
export type Primitive = number | string | boolean | bigint | symbol | null | undefined;

/**
 * Type helper to join strings and numbers
 * @see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * @export
 */
export type Join<K, P> = K extends string | number ? (P extends string | number ? `${K}${'' extends P ? '' : '.'}${P}` : never) : never;

/**
 * Type returning string union of all paths of T deeply
 * @see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * @export
 */
export type Paths<T, D extends number = 3> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
	  }[keyof T]
	: '';

/**
 * Type returning string union of all leaves of T
 * @see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * @export
 */
export type Leaves<T, D extends number = 3> = [D] extends [never]
	? never
	: T extends object
	? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
	: '';

/**
 * Helper tuple type to get the previous number (up to max value)
 * @see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * @private
 */
type Prev = [never, 0, 1, 2, 3, ...0[]];

/**
 * Converts union type to intersection type
 * @export
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Type alias for React component/HTML tag props extractor
 * @export
 */
export type ExtendProps<C extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>, TFully extends boolean = false> = TFully extends true
	? ComponentProps<C>
	: Partial<ComponentProps<C>>;

/**
 * Type alias for component props with extended props from different React component/HTML tag
 * @export
 */
export type ExtendedComponent<
	P = {},
	CP extends keyof JSX.IntrinsicElements | JSXElementConstructor<any> = 'div',
	TFully extends boolean = false,
> = Omit<ExtendProps<CP, TFully>, keyof P> & P;

/**
 * Make object deeply partial, all keys in possible nested object are optional
 * @export
 */
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
	  }
	: T;

/**
 * Booleanish type alias
 * @export
 */
export type Booleanish = boolean | 'true' | 'false';

/**
 * Type alias non-conflicting extending of two objects
 * @export
 */
export type Extend<Base, Extend> = UnionToIntersection<Omit<Base, keyof Extend> & Extend>;
