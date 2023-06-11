import { Alert, Button, Divider, ScrollArea, Text } from '@mantine/core';
import { TicketCard } from '@project/lib/components/TicketCard';
import { useCartContext } from '@project/lib/features/cart/Cart/Cart.context';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { useSeatingMapContext } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { isDefined } from '@project/lib/utils/common';
import { IconClock, IconShoppingCart } from '@tabler/icons-react';
import clsx from 'clsx';
import { padStart } from 'lodash';
import React, { FunctionComponent } from 'react';
import Countdown from 'react-countdown';
import type { CartTypes as Types } from './Cart.types';
import { CartTypes } from './Cart.types';

/**
 * Cart component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const Cart: FunctionComponent<Types.Props> = ({ className, ...rest }) => {
	const { multiViewProvider, cartedTickets, getCartedTicketPrice, removeFromCartHandler, cartTotal, reservation, canCheckout } = useCartContext();
	const { onSeatUnselect } = useSeatingMapContext();
	const format = useFormat();
	const isWidthShrunk = cartedTickets.length === 0;

	return (
		<React.Fragment>
			{/* container */}
			<div
				className={clsx(
					className,
					'flex w-full max-w-0 overflow-hidden bg-[#F2F4F7] pl-0 opacity-0 transition-all',
					!isWidthShrunk && 'max-w-unset p-4 opacity-100',
				)}
				{...rest}
			>
				{/* desktop sheet */}
				<div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
					<header className="flex items-center gap-2">
						<IconShoppingCart size="1.25rem" />
						<Text size="lg" weight="bold">
							Your shopping cart
						</Text>
					</header>

					{/* TODO: reservation alert */}
					{isDefined(reservation) && (
						<Countdown
							date={reservation.reservedUntil}
							renderer={({ minutes, seconds, api, milliseconds }) => {
								if (api.isCompleted()) return null;

								const isEndingWarning = minutes === 1 && seconds <= 30;
								const isEndingDanger = minutes === 0 && seconds <= 30;

								return (
									<Alert
										className="flex-shrink-0"
										variant="light"
										color={isEndingDanger ? 'red' : isEndingWarning ? 'orange' : 'indigo'}
										title={<span>Your tickets are reserved</span>}
									>
										<Text>
											We will reserve your selected tickets for a limited time. After a short period your tickets will be freed to other customers to
											ensure fairness.
										</Text>

										{/* countdown */}
										<div
											className={clsx(
												'mt-3 flex items-center gap-2 rounded-md bg-indigo-500 p-2 text-white',
												isEndingDanger && 'bg-red-500',
												isEndingWarning && 'bg-orange-500',
											)}
										>
											<IconClock size="1rem" />
											<Text>Time left:</Text>
											<Text className="ml-auto" weight="bold">
												{[
													padStart(minutes.toString(), 2, '0'),
													padStart(seconds.toString(), 2, '0'),
													milliseconds > 0 && padStart(milliseconds.toString(), 3, '0'),
												]
													.filter(Boolean)
													.join(':')}
											</Text>
										</div>
									</Alert>
								);
							}}
						/>
					)}

					{/* carted tickets */}
					<ScrollArea className="flex-grow">
						<div className="flex flex-col gap-3">
							{cartedTickets.map((cartedTicket) => {
								return (
									<TicketCard key={cartedTicket.cartedTicketId} cartedTicket={cartedTicket} price={getCartedTicketPrice(cartedTicket)}>
										{/* remove button */}
										<Button
											variant="subtle"
											color="red"
											size="xs"
											loading={removeFromCartHandler.isProcessing}
											onClick={async () => {
												const confirmed = window.confirm('Are you sure you want to remove this ticket from your cart?');
												if (confirmed) await removeFromCartHandler.handler(cartedTicket.cartedTicketId);
											}}
										>
											Remove
										</Button>
									</TicketCard>
								);
							})}
						</div>
					</ScrollArea>

					{/* divider */}
					<Divider />

					{/* cart total footer */}
					<footer>
						{/* total */}
						<div className="flex items-start justify-between gap-3">
							<Text size="lg" weight="bold">
								Your total
							</Text>

							<div className="text-right">
								{/* cart total */}
								<Text size="lg" weight="bold">
									{format.formatPrice(cartTotal, 'CZK')}
								</Text>
								{/* vat notice */}
								<Text size="xs" color="dimmed">
									including VAT
								</Text>
							</div>
						</div>

						{/* checkout button */}
						<Button
							className="mt-3"
							fullWidth
							disabled={!canCheckout}
							onClick={async () => {
								onSeatUnselect();
								multiViewProvider.changeView(CartTypes.TMultiView.CHECKOUT);
							}}
						>
							Checkout now
						</Button>
					</footer>
				</div>
			</div>
		</React.Fragment>
	);
};
