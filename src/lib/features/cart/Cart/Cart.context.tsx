import { useContextRequired } from '@project/lib/hooks/useContextRequired';
import { Extend } from '@project/lib/types/common';
import React, { createContext, FunctionComponent, ReactNode } from 'react';

import { CartTypes as Types } from './Cart.types';

/**
 * Cart/Context
 * @type {React.Context<CartTypes.ContextValue | undefined>}
 */
const CartContext = createContext<Types.ContextValue | undefined>(undefined);

/**
 * Cart/Provider
 * @returns {JSX.Element}
 * @constructor
 */
export const CartProvider: FunctionComponent<Extend<Types.ContextProps, { children: ReactNode }>> = ({ cart, children, ...props }) => {
	return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

/**
 * Hook for Cart/Context
 * @export
 */
export const useCartContext = () => useContextRequired(CartContext);
