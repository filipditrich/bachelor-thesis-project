import { isDefined } from '@project/lib/utils/common';
import { Context, useContext } from 'react';

/**
 * Hook to return context, but throws an Error if the context is not active
 * @param {React.Context<T>} context
 * @return {NonNullable<T>}
 */
export const useContextRequired = <TContext>(context: Context<TContext>): NonNullable<TContext> => {
	const requiredContext = useContext(context);
	if (!isDefined(requiredContext)) {
		throw new Error(`[${context.displayName}] Context is not active, check your implementation.`);
	}

	return requiredContext;
};
