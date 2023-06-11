import { MultiViewProvider } from '@project/lib/features/multi-view/MultiView';
import { UseHandlerReturnType } from '@project/lib/hooks/useHandler';
import { Extend, ExtendedComponent, UUID } from '@project/lib/types/common';
import { VenueApiTypes } from '@project/pages/api/venue/schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

/**
 * Cart component types namespace
 * @export
 */
export namespace CartTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<{}>;

	/**
	 * MultiView enumeration
	 * @export
	 */
	export enum TMultiView {
		SEATING_MAP = 'SEATING_MAP',
		CHECKOUT = 'CHECKOUT',
		ORDER_RESULT = 'ORDER_RESULT',
	}

	/**
	 * CartedTicket type
	 * @export
	 */
	export type CartedTicket = {
		cartedTicketId: UUID;
		ticket: VenueApiTypes.Ticket;
		seat?: Extend<
			{
				category: VenueApiTypes.Category;
			},
			Omit<VenueApiTypes.Seat, 'tickets'>
		>;
	};

	/**
	 * Reservation type
	 */
	export type Reservation = {
		reservationId: UUID;
		reservedUntil: Date;
	};

	/**
	 * ContactDetails type
	 */
	export type ContactDetails = z.infer<typeof useCartContactDetailsSchema>;

	/**
	 * PaymentMethod enumeration
	 * @export
	 */
	export enum PAYMENT_METHOD {
		CREDIT_DEBIT_CARD = 'CREDIT_DEBIT_CARD',
		APPLE_PAY = 'APPLE_PAY',
		PAYPAL = 'PAYPAL',
	}

	export type ContextProps = {
		cart: UseCart.Return;
	};

	export type ContextValue = UseCart.Return;

	/**
	 * UseCart types namespace
	 * @export
	 */
	export namespace UseCart {
		/**
		 * UseCart options type
		 * @export
		 */
		export type Options = {
			onReservationExpired: () => Promise<void>;
		};

		/**
		 * Context state type
		 * @export
		 */
		export type Return = {
			options: Options;
			contactForm: UseFormReturn<ContactDetails>;
			cartTotal: number;
			cartedTickets: CartedTicket[];
			reservation: Reservation | null;
			paymentMethod: PAYMENT_METHOD;
			getCartedTicketPrice: (cartedTicket: CartedTicket) => number;
			addToCartHandler: UseHandlerReturnType<AddToCartCb>;
			removeFromCartHandler: UseHandlerReturnType<RemoveFromCartCb>;
			clearReservationHandler: UseHandlerReturnType<ClearReservationCb>;
			setPaymentMethod: (paymentMethod: PAYMENT_METHOD) => void;
			replaceCartedTicketHandler: UseHandlerReturnType<ReplaceCartedTicketCb>;
			createOrderHandler: UseHandlerReturnType<CreateOrderCb>;
			multiViewProvider: MultiViewProvider<TMultiView>;
			canCheckout: boolean;
		};

		export type AddToCartCb = (ticket: CartedTicket['ticket'], seat?: CartedTicket['seat']) => Promise<UUID>;
		export type RemoveFromCartCb = (cartedTicketId: UUID) => Promise<void>;
		export type ReplaceCartedTicketCb = (cartedTicketId: UUID, ticket: CartedTicket['ticket'], seat?: CartedTicket['seat']) => Promise<void>;
		export type CreateOrderCb = (contactDetails: ContactDetails) => Promise<{
			orderId: UUID;
			orderNumber: string;
			status: string;
			created: Date;
			paid: Date;
			paymentMethod: PAYMENT_METHOD;
			amount: number;
			tickets: CartedTicket[];
		}>;
		export type ClearReservationCb = () => Promise<void>;
	}
}

/**
 * Cart contact details validation schema
 * @export
 */
export const useCartContactDetailsSchema = z.object({
	firstName: z.string().nonempty(),
	lastName: z.string().nonempty(),
	email: z.string().email(),
	phone: z.string().nonempty(),
	message: z.string().optional(),
	acceptTerms: z.boolean().refine((v) => v === true, { message: 'You must accept terms and conditions' }),
});
