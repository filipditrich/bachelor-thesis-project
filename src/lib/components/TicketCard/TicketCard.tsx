import { Text } from '@mantine/core';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { isDefined, isEmpty } from '@project/lib/utils/common';
import clsx from 'clsx';
import React, { FunctionComponent } from 'react';
import { TicketCardTypes as Types } from './TicketCard.types';

/**
 * TicketCard component
 * @return {JSX.Element}
 * @constructor
 */
export const TicketCard: FunctionComponent<Types.Props> = ({ price, cartedTicket, children, className, ...props }) => {
	const format = useFormat();

	return (
		<div className={clsx('overflow-hidden rounded-lg border border-gray-200', className)} {...props}>
			{/* top bar */}
			{isDefined(cartedTicket.seat) && <div className="h-2 w-full" style={{ backgroundColor: cartedTicket.seat.category.color }} />}

			{/* content */}
			<div className="flex flex-col gap-1 p-3">
				{/* header */}
				<header className="flex items-start justify-between gap-3">
					{/* ticket name */}
					<Text size="md">{cartedTicket.ticket.name}</Text>
					{/* ticket price */}
					<Text size="md" weight="bold">
						{format.formatPrice(price, 'CZK')}
					</Text>
				</header>

				{/* secondary info */}
				<div>
					{/* ticket seating info */}
					{isDefined(cartedTicket.seat) && (
						<Text size="sm" color="dimmed">
							{[cartedTicket.seat.category.name, cartedTicket.seat.fullName].join(', ')}
						</Text>
					)}

					{/* ticket description */}
					{!isEmpty(cartedTicket.ticket.description) && (
						<Text size="xs" color="dimmed">
							{cartedTicket.ticket.description}
						</Text>
					)}
				</div>

				{/* actions footer */}
				{isDefined(children) && <footer className="flex items-center justify-between gap-3">{children}</footer>}
			</div>
		</div>
	);
};
