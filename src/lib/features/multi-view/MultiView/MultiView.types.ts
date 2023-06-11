import { PropsWithChildren } from 'react';

import { UseMultiViewProvider } from './useMultiView';

/**
 * MultiView component props type
 * @export
 */
export type MultiViewProps<V extends string | number> = PropsWithChildren<{
	provider: MultiViewProvider<V>;
}>;

/**
 * MultiView component provider type
 * @export
 */
export type MultiViewProvider<V extends string | number> = UseMultiViewProvider<V>;

/**
 * MultiView/View component props type
 * @export
 */
export type MultiViewViewProps<V extends string | number> = PropsWithChildren<{
	view: V | V[];
}>;

/**
 * MultiView component context props type
 * @export
 */
export type MultiViewContextProps<V extends string | number> = MultiViewProvider<V>;
