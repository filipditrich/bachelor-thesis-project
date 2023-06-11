import { useMantineTheme } from '@mantine/core';
import { useCartContext } from '@project/lib/features/cart/Cart/Cart.context';
import { useSeatingMapContext } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { getFgColor, hexAlpha, modifyColor } from '@project/lib/utils/colors';
import { AppError } from '@project/lib/utils/error';
import clsx from 'clsx';
import React, { ComponentProps, FunctionComponent, useCallback, useMemo } from 'react';
import type { SeatTypes as Types } from './Seat.types';

/**
 * Seat component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const Seat: FunctionComponent<Types.Props> = ({ data, ...props }) => {
	const { onSeatSelect, onSeatUnselect, selectedSeatId } = useSeatingMapContext();
	const { cartedTickets } = useCartContext();
	const theme = useMantineTheme();
	const isSeatSelected = selectedSeatId === data.seatId;
	const isSeatSoldOut = data.capacityLeft === 0;
	const isSeatCarted = cartedTickets.some((ticket) => ticket.seat?.seatId === data.seatId);

	/** seat fixed radius of 25px ~ 25cm */
	const RADIUS = 25;
	const TEXT_SIZE = RADIUS * 0.65;
	const ICON_SIZE = RADIUS * 0.75;

	/** invalid seat fallback renderer */
	const invalidSeatFallbackRenderer = useCallback((error: AppError) => {
		console.warn(`[Seat] Invalid seat data: ${error}`);
		return null;
	}, []);

	/** circle override params */
	const overrideParams = useMemo(() => {
		/** base seat params */
		const primaryFill = hexAlpha(data.tickets[0].categories[0].color);
		const params: ComponentProps<'circle'> = {
			fill: primaryFill,
			stroke: 'none',
			strokeWidth: 0,
			color: getFgColor(primaryFill).hexa(),
		};

		/** selected seat */
		if (isSeatSelected) {
			const seatSelectedFill = modifyColor(primaryFill, (c) => c.lighten(0.85));
			params.fill = seatSelectedFill;
			params.color = getFgColor(seatSelectedFill).hexa();
			params.stroke = primaryFill;
			params.strokeWidth = RADIUS / 10;
		}

		/** carted seat */
		if (isSeatCarted) {
			const seatCartedFill = modifyColor(primaryFill, (c) => c.lighten(0.85));
			params.fill = seatCartedFill;
			params.color = getFgColor(seatCartedFill).hexa();
			params.stroke = primaryFill;
			params.strokeWidth = RADIUS / 10;
			params.className += ' animate-pulse';
		}

		/** sold out seat */
		if (isSeatSoldOut && !isSeatSelected) {
			const seatSoldOutFill = theme.colors.gray[3];
			params.fill = seatSoldOutFill;
			params.color = getFgColor(seatSoldOutFill).fade(0.5).hexa();
			params.stroke = 'none';
			params.strokeWidth = 0;
			params.className += ' cursor-not-allowed';
		}

		/** selected unavailable seat */
		if (isSeatSelected && isSeatSoldOut) {
			const seatSelectedUnavailableFill = theme.colors.gray[3];
			params.fill = seatSelectedUnavailableFill;
			params.stroke = getFgColor(seatSelectedUnavailableFill).fade(0.5).hexa();
			params.strokeWidth = RADIUS / 10;
		}

		return params;
	}, [data.tickets, isSeatCarted, isSeatSelected, isSeatSoldOut, theme.colors.gray]);

	/** check if seat data is correctly defined */
	if (typeof props.x !== 'number') return invalidSeatFallbackRenderer(new AppError(`Seat x position is invalid: ${props.x}`));
	if (typeof props.y !== 'number') return invalidSeatFallbackRenderer(new AppError(`Seat y position is invalid: ${props.y}`));
	const position = { x: props.x + RADIUS, y: props.y + RADIUS };

	return (
		<g>
			{/* seat svg circle */}
			<circle
				r={RADIUS}
				cx={position.x}
				cy={position.y}
				className={clsx(['transition-all', !isSeatSoldOut && 'cursor-pointer', !isSeatSelected && 'hover:opacity-90'])}
				onClick={() => {
					if (isSeatSelected) {
						onSeatUnselect();
					} else {
						onSeatSelect(data.seatId);
					}
				}}
				{...props}
				{...overrideParams}
			/>

			{/* seat SVG detail */}
			<g
				style={{
					pointerEvents: 'none',
					touchAction: 'none',
					color: overrideParams.color,
				}}
			>
				{isSeatCarted ? (
					<use xlinkHref="#check-icon" width={ICON_SIZE} height={ICON_SIZE} x={position.x - ICON_SIZE / 2} y={position.y - ICON_SIZE / 2} />
				) : (
					<text
						x={position.x}
						y={position.y}
						fontSize={TEXT_SIZE}
						dominantBaseline="middle"
						textAnchor="middle"
						fill="currentColor"
						fontWeight="bold"
					>
						{data.place}
					</text>
				)}
			</g>
		</g>
	);
};
