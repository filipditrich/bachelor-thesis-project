import { zodResolver } from '@hookform/resolvers/zod';
import { CartTypes as Types, useCartContactDetailsSchema } from '@project/lib/features/cart/Cart/Cart.types';
import { useMultiView } from '@project/lib/features/multi-view/MultiView';
import { DELAY_NETWORK, simulatedNetworkDelay } from '@project/lib/hooks/useDebug';
import { useHandler } from '@project/lib/hooks/useHandler';
import { useWaitUntil } from '@project/lib/hooks/useNow';
import { fakePromise, isDefined, randomIntBetween, valOrThrow } from '@project/lib/utils/common';
import { subSeconds } from 'date-fns';
import addMinutes from 'date-fns/addMinutes';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

/**
 * Shopping cart management hook
 * @param {CartTypes.UseCart.Options} options
 * @returns {CartTypes.UseCart.Return}
 * @export
 */
export const useCart = (options: Types.UseCart.Options): Types.UseCart.Return => {
	const [cartedTickets, _setCartedTickets] = useState<Types.CartedTicket[]>([]);
	const [reservation, _setReservation] = useState<Types.Reservation | null>(null);
	const [paymentMethod, _setPaymentMethod] = useState<Types.PAYMENT_METHOD>(Types.PAYMENT_METHOD.CREDIT_DEBIT_CARD);

	/** contact detail form */
	const form = useForm<Types.ContactDetails>({
		reValidateMode: 'onChange',
		mode: 'all',
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			message: '',
			acceptTerms: false,
		},
		resolver: zodResolver(useCartContactDetailsSchema),
	});

	/** return carted ticket price */
	const getCartedTicketPrice = (cartedTicket: Types.CartedTicket) => {
		/** ticket without seat */
		if (!isDefined(cartedTicket.seat)) return cartedTicket.ticket.price;
		/** get ticket category */
		const ticketCategory = valOrThrow(
			cartedTicket.ticket.categories.find(({ categoryId }) => categoryId === cartedTicket.seat?.categoryId),
			`Ticket category not found for seat ${cartedTicket.seat.seatId}`,
		);
		/** return ticket category price */
		return ticketCategory.price;
	};

	/** calculates cart total */
	const cartTotal = useMemo(() => cartedTickets.reduce((acc, cartedTicket) => acc + getCartedTicketPrice(cartedTicket), 0), [cartedTickets]);

	/** clear reservation handler */
	const clearReservationHandler = useHandler<Types.UseCart.ClearReservationCb>(
		async () => {
			console.log('[Cart] Clearing reservation...');
			await simulatedNetworkDelay();
			_setReservation(null);
			_setCartedTickets([]);
		},
		{
			deps: [reservation],
		},
	);

	/** add to cart handler */
	const addToCartHandler = useHandler<Types.UseCart.AddToCartCb>(
		async (ticket, seat) => {
			/** create a new reservation if non-existent */
			if (!isDefined(reservation)) {
				console.log('[Cart] Creating reservation...');
				await simulatedNetworkDelay();
				/** TODO: API should be called instead */
				_setReservation({ reservationId: uuidv4(), reservedUntil: addMinutes(new Date(), 5) });
				console.log('[Cart] Reservation created');
			}
			/** create a new carted ticket */
			const newCartedTicket: Types.CartedTicket = { cartedTicketId: uuidv4(), ticket, seat };
			console.log('[Cart] Adding to cart:', newCartedTicket);

			/** TODO: API should be called instead */
			await simulatedNetworkDelay();
			console.log('[Cart] Updating reserved cart');
			/** add to cart */
			_setCartedTickets([...cartedTickets, newCartedTicket]);
			return newCartedTicket.cartedTicketId;
		},
		{
			deps: [reservation, cartedTickets],
		},
	);

	/** remove from cart handler */
	const removeFromCartHandler = useHandler<Types.UseCart.RemoveFromCartCb>(
		async (cartedTicketId) => {
			/** clear reservation if last carted ticket */
			if (cartedTickets.length === 1) {
				console.log('[Cart] Removing last carted ticket, removing reservation...');
				await simulatedNetworkDelay();
				await clearReservationHandler.handler();
			}
			/** TODO: API should be called instead */
			await simulatedNetworkDelay();
			console.log('[Cart] Updating reserved cart');
			/** remove from cart */
			console.log('[Cart] Removing from cart:', cartedTicketId);
			_setCartedTickets((prev) => prev.filter(({ cartedTicketId: _cartedTicketId }) => _cartedTicketId !== cartedTicketId));
		},
		{
			deps: [cartedTickets],
		},
	);

	/** replace carted ticket handler */
	const replaceCartedTicketHandler = useHandler<Types.UseCart.ReplaceCartedTicketCb>(
		async (cartedTicketId, ticket, seat) => {
			console.log('[Cart] Replacing carted ticket:', cartedTicketId);
			/** TODO: API should be called instead */
			await simulatedNetworkDelay();
			console.log('[Cart] Updating reserved cart');
			/** replace carted ticket */
			_setCartedTickets((prev) =>
				prev.map((cartedTicket) =>
					cartedTicket.cartedTicketId === cartedTicketId
						? {
								...cartedTicket,
								ticket,
								seat,
						  }
						: cartedTicket,
				),
			);
		},
		{
			deps: [cartedTickets],
		},
	);

	/** handle expired reservation */
	useWaitUntil(reservation?.reservedUntil, async () => {
		window.alert('Reservation expired, clearing cart...');
		await clearReservationHandler.handler();
		await options.onReservationExpired();
	});

	/** multi view provider */
	const multiViewProvider = useMultiView({
		initialView: Types.TMultiView.SEATING_MAP,
		allowedViews: [
			{
				view: Types.TMultiView.SEATING_MAP,
				enabled: true,
			},
			{
				view: Types.TMultiView.CHECKOUT,
				enabled: cartedTickets.length > 0,
				visible: true,
			},
			{
				view: Types.TMultiView.ORDER_RESULT,
				enabled: true,
			},
		],
	});

	/** create order handler */
	const createOrderHandler = useHandler<Types.UseCart.CreateOrderCb>(
		async (contactDetails) => {
			console.log('[Cart] Creating order...');
			multiViewProvider.changeView(Types.TMultiView.ORDER_RESULT);
			await simulatedNetworkDelay('heavy');
			_setReservation(null);
			_setCartedTickets([]);
			return {
				orderId: uuidv4(),
				orderNumber: randomIntBetween(100000, 999999).toString(),
				status: 'Paid',
				created: subSeconds(new Date(), 64),
				paid: new Date(),
				paymentMethod,
				amount: cartTotal,
				tickets: cartedTickets,
			};
		},
		{
			deps: [cartedTickets, paymentMethod, cartTotal],
		},
	);

	/** check for checkout conditions */
	const canCheckout = useMemo(() => {
		if (cartedTickets.length === 0) return false;
		return true;
	}, [cartedTickets.length]);

	return {
		options,
		cartedTickets,
		cartTotal,
		canCheckout,
		contactForm: form,
		addToCartHandler,
		removeFromCartHandler,
		replaceCartedTicketHandler,
		createOrderHandler,
		paymentMethod,
		setPaymentMethod: _setPaymentMethod,
		reservation,
		clearReservationHandler,
		getCartedTicketPrice,
		multiViewProvider,
	};
};
