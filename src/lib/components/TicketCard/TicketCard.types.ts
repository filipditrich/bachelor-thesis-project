import { CartTypes } from '@project/lib/features/cart/Cart';
import { ExtendedComponent } from '@project/lib/types/common';

/**
 * TicketCard component types namespace
 * @export
 */
export namespace TicketCardTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<
		{
			cartedTicket: CartTypes.CartedTicket;
			price: number;
		},
		'div'
	>;
}
