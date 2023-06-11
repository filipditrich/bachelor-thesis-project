import { useMantineTheme } from '@mantine/core';
import { useSeatingMapContext } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { getColor, hexAlpha, modifyColor } from '@project/lib/utils/colors';
import { AppError } from '@project/lib/utils/error';
import clsx from 'clsx';
import Color from 'color';
import React, { ComponentProps, FunctionComponent, useCallback, useMemo } from 'react';
import type { SeatTypes as Types } from './Seat.types';

/**
 * Seat component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const Seat: FunctionComponent<Types.Props> = ({ data, ...props }) => {
	const theme = useMantineTheme();
	const { onSeatSelect, onSeatUnselect, selectedSeatId } = useSeatingMapContext();
	const isSeatSelected = selectedSeatId === data.seatId;
	const isSeatCarted = false;
	const isSeatSoldOut = data.capacityLeft === 0;

	/** seat type 1 fixed radius of 25px ~ 25cm */
	const RADIUS = 25;
	const TEXT_SIZE = RADIUS * 0.65;
	const ICON_SIZE = RADIUS * 0.75;

	/** invalid seat fallback renderer */
	const invalidSeatFallbackRenderer = useCallback(
		(error: AppError) => {
			console.warn(`[Seat] Invalid seat data: ${error}`);
			console.table(data);
			return null;
		},
		[data],
	);

	const getTextColor = (color: string) => getColor(hexAlpha(color), (c) => (c.isDark() ? new Color('#fff') : new Color('#000')));

	/** circle override params */
	const overrideParams = useMemo(() => {
		/** base seat params */
		const primaryFill = hexAlpha(data.tickets[0].categories[0].color);
		const params: ComponentProps<'circle'> = {
			fill: primaryFill,
			stroke: 'none',
			strokeWidth: 0,
			color: getTextColor(primaryFill).hexa(),
		};

		/** selected seat */
		if (isSeatSelected) {
			const seatSelectedFill = modifyColor(primaryFill, (c) => c.lighten(0.85));
			params.fill = seatSelectedFill;
			params.color = getTextColor(seatSelectedFill).hexa();
			params.stroke = primaryFill;
			params.strokeWidth = RADIUS / 10;
		}

		/** sold out seat */
		if (isSeatSoldOut && !isSeatSelected) {
			const seatSoldOutFill = theme.colors.gray[3];
			params.fill = seatSoldOutFill;
			params.color = getTextColor(seatSoldOutFill).fade(0.5).hexa();
			params.stroke = 'none';
			params.strokeWidth = 0;
			params.className += ' cursor-not-allowed';
		}

		/** selected unavailable seat */
		if (isSeatSelected && isSeatSoldOut) {
			const seatSelectedUnavailableFill = theme.colors.gray[3];
			params.fill = seatSelectedUnavailableFill;
			params.stroke = getTextColor(seatSelectedUnavailableFill).fade(0.5).hexa();
			params.strokeWidth = RADIUS / 10;
		}
		// /** unavailable seat */
		// if (!selected && unavailable) params.fill = theme.colors.zinc[5];
		//
		// /** selected unavailable seat */
		// if (selected && unavailable) params.fill = theme.colors.zinc[6];
		//
		// /** carted seat */
		// if (isCarted) {
		// 	params.fill = theme.colors.gray[5];
		// 	params.stroke = theme.colors.java[5];
		// 	params.strokeWidth = RADIUS / 10;
		// 	params.className = 'cursor-not-allowed';
		// }
		//
		// /** active and selected */
		// if (active && selected) {
		// 	params.fill = theme.colors.java[5];
		// }
		//
		// /** active but not selected */
		// if (active && !selected) {
		// 	params.fill = theme.colors.casablanca[5];
		// }
		//
		return params;
	}, [data.tickets, isSeatSelected, isSeatSoldOut, theme.colors.gray]);

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

			{/* TODO: seat SVG detail */}
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
