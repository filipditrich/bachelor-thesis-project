import { useContextRequired } from '@project/lib/hooks/useContextRequired';
import React, { createContext } from 'react';
import { animated, Transition, useTransition } from 'react-spring';

import { MultiViewContextProps, MultiViewProps, MultiViewViewProps } from './MultiView.types';

/**
 * MultiView component context
 * @type {React.Context<MultiViewContextProps<any> | undefined>}
 */
const MultiViewContext = createContext<MultiViewContextProps<any> | undefined>(undefined);

/**
 * MultiView component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export function MultiView<V extends string | number>({ provider, children, ...props }: MultiViewProps<V>) {
	return <MultiViewContext.Provider value={provider}>{children}</MultiViewContext.Provider>;
}

/**
 * MultiView/View component
 * @returns {JSX.Element | null}
 * @constructor
 */
function MultiViewView<V extends string | number>({ children, view, ...props }: MultiViewViewProps<V>) {
	const { activeView } = useContextRequired(MultiViewContext);
	const isViewIn = (Array.isArray(view) ? view : [view]).includes(activeView);
	
	const transitions = useTransition(isViewIn, {
		from: { transform: 'translate3d(100%,0,0)', opacity: 0 },
		enter: { transform: 'translate3d(0%,0,0)', opacity: 1 },
		leave: { transform: 'translate3d(-50%,0,0)', opacity: 0 },
	})
	
	
	return transitions((style, render) => render && (
		<animated.div style={style}>
			{children}
		</animated.div>
	));
}

MultiView.View = MultiViewView;
