import { useContextRequired } from '@project/lib/hooks/useContextRequired';
import { Extend } from '@project/lib/types/common';
import React, { createContext, FunctionComponent, ReactNode } from 'react';

import { SeatingMapTypes as Types } from './SeatingMap.types';

/**
 * SeatingMap/Context
 * @type {React.Context<SeatingMapTypes.ContextProps | undefined>}
 */
const SeatingMapContext = createContext<Types.Context.State | undefined>(undefined);

/**
 * SeatingMap/Provider
 * @returns {JSX.Element}
 * @constructor
 */
export const SeatingMapProvider: FunctionComponent<Extend<Types.Context.Props, { children: ReactNode }>> = ({ children, ...props }) => {
	const [selectedSeatId, setSelectedSeatId] = React.useState<Types.Context.SelectedSeatIdState>(null);

	return (
		<SeatingMapContext.Provider
			value={{
				...props,
				selectedSeatId,
				onSeatSelect(seatId) {
					setSelectedSeatId(seatId);
				},
				onSeatUnselect() {
					setSelectedSeatId(null);
				},
			}}
		>
			{children}
		</SeatingMapContext.Provider>
	);
};

/**
 * Hook for SeatingMap/Context
 * @export
 */
export const useSeatingMapContext = () => useContextRequired(SeatingMapContext);
