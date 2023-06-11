import { isDefined } from '@project/lib/utils/common';
import { InvalidStateError } from '@project/lib/utils/error';
import { StrictMap } from '@project/lib/utils/strict-map';
import { useCallback, useMemo, useState } from 'react';

/**
 * UseMultiView hook implementation for usage with MultiView component
 * @author filipditrich <ditrich@nfctron.com>
 * @returns {UseMultiViewConfig<TView>}
 */
export function useMultiView<TView extends string | number = number>(config: UseMultiViewConfig<TView>) {
	/** active view state */
	const [activeView, setActiveView] = useState<TView>(config.initialView);

	/**
	 * Helper to work with boolean/function returning boolean
	 * @type {UseMultiViewIs<TView>}
	 */
	const is = useCallback<UseMultiViewIs<TView>>(
		(_is = false) => {
			switch (typeof _is) {
				case 'boolean':
					return _is;
				case 'function':
					if (!isDefined(config.allowedViews)) throw new InvalidStateError('[useMultiView] cannot use "is()" method, "allowedViews" is not defined');

					/** return index of the requested view */
					const getIndex = (view: TView) => {
						return config.allowedViews!.findIndex((v) => v.view === view);
					};
					/** return true if the given view is same or after the active view */
					const isSameOrAfter = (view: TView) => {
						if (!isDefined(config.allowedViews))
							throw new InvalidStateError('[useMultiView] cannot use "is()" method, "allowedViews" is not defined');
						return getIndex(view) <= getIndex(activeView);
					};
					return _is(activeView, {
						getIndex,
						isSameOrAfter,
					});
				default:
					return false;
			}
		},
		[activeView, config.allowedViews],
	);
	/**
	 * Returns the next allowed view after the given view
	 * @type {UseMultiViewGetNext<TView>}
	 */
	const getNext = useCallback<UseMultiViewGetNext<TView>>(
		({ prop, view = activeView }) => {
			if (!isDefined(config.allowedViews)) throw new InvalidStateError('[useMultiView] cannot use "viewIs()" method, "allowedViews" is not defined');
			const index = config.allowedViews.findIndex((v) => v.view === view);
			return config.allowedViews.slice(index + 1).find((v) => is(v[prop]))?.view ?? view;
		},
		[is, activeView, config.allowedViews],
	);
	/**
	 * Returns the previous allowed view after the given view
	 * @type {UseMultiViewGetPrev<TView>}
	 */
	const getPrev = useCallback<UseMultiViewGetPrev<TView>>(
		({ prop, view = activeView }) => {
			if (!isDefined(config.allowedViews)) throw new InvalidStateError('[useMultiView] cannot use "viewIs()" method, "allowedViews" is not defined');
			const index = config.allowedViews.findIndex((v) => v.view === view);
			return (
				config.allowedViews
					.slice(0, index)
					.reverse()
					.find((v) => is(v[prop]))?.view ?? view
			);
		},
		[is, activeView, config.allowedViews],
	);
	/**
	 * Returns index of the given view
	 * @type {UseMultiViewGetPosition<TView>}
	 */
	const getPosition = useCallback<UseMultiViewGetPosition<TView>>(
		(view = activeView, human = false) => {
			if (!isDefined(config.allowedViews)) throw new InvalidStateError('[useMultiView] cannot use "viewIs()" method, "allowedViews" is not defined');
			const index = config.allowedViews.filter((v) => v.visible).findIndex((v) => v.view === view);
			return [index + (human ? 1 : 0), config.allowedViews.filter((v) => is(v.visible)).length + (human ? 1 : 0)];
		},
		[activeView, config.allowedViews, is],
	);
	/**
	 * Returns meta information about the given view
	 * @type {UseMultiViewViewIs<TView>}
	 */
	const viewIs = useCallback<UseMultiViewViewIs<TView>>(
		({ view }) => {
			if (!isDefined(config.allowedViews)) throw new InvalidStateError('[useMultiView] cannot use "viewIs()" method, "allowedViews" is not defined');
			const viewConfig = config.allowedViews.find((vc) => vc.view === view);
			const enabled = isDefined(viewConfig) && is(viewConfig.enabled);
			const [pos] = getPosition(view);
			return {
				enabled,
				visible: isDefined(viewConfig) && is(viewConfig.visible),
				selectable: enabled && isDefined(viewConfig) && is(viewConfig.selectable),
				loading: isDefined(viewConfig) && is(viewConfig.loading),
				last: pos === config.allowedViews.length - 1,
				first: pos === 0,
			};
		},
		[config.allowedViews, getPosition, is],
	);

	/** calculates actual progress in 0–100 */
	const progress = useMemo<UseMultiViewProgress<TView>>(() => {
		const [currentIndex, lastIndex] = getPosition(activeView);
		return {
			percent: Math.round(((currentIndex + 1) / lastIndex) * 100),
			currentStepIndex: currentIndex,
			lastStepIndex: lastIndex - 1,
		};
	}, [getPosition, activeView]);

	/** group above helpers to an object */
	const helpers = useMemo<UseMultiViewHelpers<TView>>(
		() => ({
			viewIs,
			getNext,
			getPrev,
			is,
			getPosition,
			progress,
		}),
		[viewIs, getNext, getPrev, is, getPosition, progress],
	);

	/** view change handler */
	const changeView = useCallback(
		(view: TView) => {
			/** change the view */
			setActiveView(view);
			/** call `onViewChange` callback upon active view change */
			config.onViewChange?.(view, helpers);
			/** restore scroll if requested */
			if (config.restoreScroll) window.scrollTo(0, 0);
		},
		[config, helpers],
	);

	/** create core provider object (to be passed to MultiView component as `provider` prop) */
	const provider = useMemo(() => {
		/** steps map with meta */
		const metaMap = (config.allowedViews ?? []).reduce(
			(map, view) => map.set(view.view, viewIs({ view: view.view })),
			new StrictMap<TView, ReturnType<UseMultiViewViewIs<TView>>>(),
		);
		return {
			activeView,
			changeView,
			helpers,
			stepsWithMeta: metaMap,
		};
	}, [activeView, changeView, helpers, config.allowedViews, viewIs]);

	return {
		provider,
		...provider,
	};
}

/**
 * UseMultiView hook config type
 * @export
 */
export type UseMultiViewConfig<TView extends string | number = number> = {
	initialView: TView;
	onViewChange?: (view: TView, helpers: UseMultiViewHelpers<TView>) => void;
	restoreScroll?: boolean;
	allowedViews?: Array<{
		view: TView;
		enabled?: boolean | AllowedViewCheck<TView>;
		visible?: boolean | AllowedViewCheck<TView>;
		selectable?: boolean | AllowedViewCheck<TView>;
		loading?: boolean | AllowedViewCheck<TView>;
	}>;
};

/** hook helper types */
export type AllowedViewCheck<TView extends string | number = number> = (
	activeView: TView,
	helpers: {
		getIndex: (view: TView) => number;
		isSameOrAfter: (view: TView) => boolean;
	},
) => boolean;
export type UseMultiViewProvider<TView extends string | number = number> = {
	activeView: TView;
	changeView: (view: TView) => void;
	stepsWithMeta: StrictMap<TView, ReturnType<UseMultiViewViewIs<TView>>>;
	helpers: {
		viewIs: UseMultiViewViewIs<TView>;
		getNext: UseMultiViewGetNext<TView>;
		getPrev: UseMultiViewGetPrev<TView>;
		is: UseMultiViewIs<TView>;
		getPosition: UseMultiViewGetPosition<TView>;
		progress: UseMultiViewProgress<TView>;
	};
};
export type UseMultiViewHelpers<TView extends string | number = number> = UseMultiViewProvider<TView>['helpers'];
export type UseMultiViewProgress<TView extends string | number = number> = {
	percent: number;
	currentStepIndex: number;
	lastStepIndex: number;
};

/** hook methods */
export type UseMultiViewViewIs<TView extends string | number = number> = (params: { view: TView }) => {
	enabled: boolean;
	visible: boolean;
	selectable: boolean;
	loading: boolean;
	first: boolean;
	last: boolean;
};
type UseMultiViewGetNext<TView extends string | number = number> = (params: {
	prop: keyof Pick<NonNullable<UseMultiViewConfig<TView>['allowedViews']>[number], 'visible' | 'enabled' | 'selectable' | 'loading'>;
	view?: TView;
}) => TView;
type UseMultiViewGetPrev<TView extends string | number = number> = (params: {
	prop: keyof Pick<NonNullable<UseMultiViewConfig<TView>['allowedViews']>[number], 'visible' | 'enabled' | 'selectable' | 'loading'>;
	view?: TView;
}) => TView;
type UseMultiViewGetPosition<TView extends string | number = number> = (view: TView, human?: boolean) => [number, number];
type UseMultiViewIs<TView extends string | number = number> = (_is: boolean | AllowedViewCheck<TView> | undefined) => boolean;
