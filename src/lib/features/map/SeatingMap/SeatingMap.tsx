import { ActionIcon, Alert, Badge, Button, Skeleton, Text } from '@mantine/core';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { Seat } from '@project/lib/features/map/Seat';
import { useSeatingMapContext } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { ExtendedComponent } from '@project/lib/types/common';
import { isDefined, isEmpty, mapHtmlPropsToReact, silenceError, valOrThrow } from '@project/lib/utils/common';
import { InvalidStateError } from '@project/lib/utils/error';
import { IconAlertCircle, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { parseInt } from 'lodash';
import React, { FunctionComponent, ReactNode, useCallback, useMemo } from 'react';
import Sheet from 'react-modal-sheet';
import { ElementNode, Node, parse } from 'svg-parser';
import { VirtualMap } from '../VirtualMap';
import type { SeatingMapTypes as Types } from './SeatingMap.types';

/**
 * SeatingMap component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const SeatingMap: FunctionComponent<Types.Props> = ({ width, height, background = '#292929', ...rest }) => {
	const { dataExtended, onSeatSelect, onSeatUnselect, selectedSeatId } = useSeatingMapContext();

	/** parse the svg */
	const svgData = useMemo(() => {
		const parsed = parse(dataExtended.drawing);
		/** find the root svg element node */
		const root = parsed.children.find((child) => child.type === 'element' && child.tagName === 'svg') as ElementNode;
		/** get width and height prop from the root svg element node */
		const widthProp = silenceError(() => root.properties?.width ?? (root.properties?.viewBox as string)!.split(' ')[2], null);
		const heightProp = silenceError(() => root.properties?.height ?? (root.properties?.viewBox as string)!.split(' ')[3], null);
		/** get the fill props from the root svg element node */
		const fillProp = root.properties?.fill?.toString();
		return {
			parsed,
			root,
			baseWidth: silenceError(() => parseInt(widthProp!.toString()), width),
			baseHeight: silenceError(() => parseInt(heightProp!.toString()), height),
			rootBg: fillProp === 'none' ? background : fillProp,
		};
	}, [background, height, dataExtended.drawing, width]);

	/** node child renderer callback */
	const renderNodeChild = useCallback(
		(childNode: Node | string, key: number) => {
			/** string node, return none */
			if (typeof childNode === 'string') return null;

			/** render node function */
			const renderNode = (node: Node): ReactNode => {
				/** string node, return none */
				if (node.type === 'text') return null;

				/** map node properties */
				node.properties = isDefined(node.properties) ? mapHtmlPropsToReact(node.properties) : {};

				/** render node depending on the svg tag */
				switch (node.tagName) {
					/** svg group */
					case 'g': {
						/** seat group placeholder to render seats */
						const idAttr: string | undefined = node.properties?.id?.toString();
						if (idAttr?.includes('seats:')) {
							/** get seat rendered SVG elements */
							const seatSvgs = node.children.reduce((acc, child) => {
								if (typeof child === 'string' || child.type === 'text') return acc;

								/** parse seat data from the `id` attribute */
								const childIdAttr: string | undefined = child.properties?.id?.toString();
								const parsedSeatFromId = silenceError(() => {
									const parsedSeatIdetifier = childIdAttr?.split(':')[1];
									if (!isDefined(parsedSeatIdetifier)) throw new InvalidStateError(`Seat identifier is not defined: ${childIdAttr}`);
									const parsedSeatRow = parsedSeatIdetifier.split('+')[0];
									if (isEmpty(parsedSeatRow)) throw new InvalidStateError(`Seat row is empty: ${parsedSeatIdetifier.split('+')[0]}`);
									const parsedSeatPlace = parseInt(parsedSeatIdetifier.split('+')[1]);
									if (Number.isNaN(parsedSeatPlace)) throw new InvalidStateError(`Seat number is not a number: ${parsedSeatIdetifier.split('+')[1]}`);
									return { row: parsedSeatRow, place: parsedSeatPlace };
								}, null);

								/** find the seat configuration */
								const seatConfiguration = silenceError(() => {
									if (!isDefined(parsedSeatFromId)) throw new InvalidStateError(`Seat identifier is not parsed: ${parsedSeatFromId}`);
									const seatConfiguration = dataExtended.seats.find(
										(seat) => seat.row === parsedSeatFromId.row && seat.place === parsedSeatFromId.place,
									);
									if (!isDefined(seatConfiguration)) throw new InvalidStateError(`Seat configuration not found: ${parsedSeatFromId}`);
									return seatConfiguration;
								}, null);

								/** no configuration found */
								if (!isDefined(seatConfiguration)) {
									console.log(`[SeatingMap] Seat configuration not found: ${childIdAttr}`);
									return acc.concat(renderNode(child));
								}

								/** TODO: render seat */
								const seatSvg = <Seat {...child.properties} key={seatConfiguration.seatId} data={seatConfiguration} />;

								return acc.concat(seatSvg);
							}, [] as ReactNode[]);

							/** render the seat group */
							return (
								<g key={`g-${idAttr ?? key}`} {...node.properties}>
									{seatSvgs}
								</g>
							);
						}

						/** ordinary svg group */
						return (
							<g key={`g-${idAttr ?? key}`} {...node.properties}>
								{node.children.map(renderNodeChild)}
							</g>
						);
					}
					/** any other svg element */
					default:
						return isEmpty(node.tagName)
							? null
							: React.createElement(
									node.tagName,
									{
										...node.properties,
										key: `svg-${node.properties?.id ?? key}`,
									},
									node.children.map(renderNodeChild),
							  );
				}
			};

			return renderNode(childNode);
		},
		[dataExtended.seats],
	);

	/** memoized svg children content */
	const svgChildren = useMemo(() => svgData.root.children.map(renderNodeChild), [svgData.root, renderNodeChild]);

	return (
		<React.Fragment>
			{/* virtual map */}
			<VirtualMap
				width={width}
				height={height}
				fill={svgData.rootBg}
				minScaleFactor={1.1}
				maxScaleFactor={0.1}
				baseWidth={svgData.baseWidth}
				baseHeight={svgData.baseHeight}
				{...rest}
			>
				{/* check icon */}
				<symbol id="check-icon" viewBox="0 0 512 512">
					<path
						fill="currentColor"
						d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
					/>
				</symbol>
				{/* mapped svg children */}
				{svgChildren}
			</VirtualMap>

			{/* seat detail sheet */}
			<Sheet isOpen={isDefined(selectedSeatId)} onClose={() => onSeatUnselect()} detent="content-height">
				<Sheet.Container>
					{/* sheet header */}
					<Sheet.Header className="flex items-start justify-between gap-2 p-3">
						{/* text */}
						<div>
							<Text weight="bold" color="black">
								Seat detail
							</Text>
							<Text size="sm" color="gray">
								If you wish to buy this seat, add it to the cart using the button below.
							</Text>
						</div>

						{/* close button */}
						<ActionIcon radius="xl" size="md" variant="light" onClick={() => onSeatUnselect()}>
							<IconX size="1rem" />
						</ActionIcon>
					</Sheet.Header>
					{/* content (detail) */}
					<SeatSheetDetail />
				</Sheet.Container>
			</Sheet>
		</React.Fragment>
	);
};

const SeatSheetDetail: FunctionComponent = () => {
	const format = useFormat();
	const { dataExtended, onSeatSelect, onSeatUnselect, selectedSeatId } = useSeatingMapContext();

	const seatConfiguration = useMemo(() => {
		if (!isDefined(selectedSeatId)) return null;
		return dataExtended.seats.find((seat) => seat.seatId === selectedSeatId);
	}, [dataExtended.seats, selectedSeatId]);

	return (
		<Sheet.Content className="flex flex-col gap-3 p-3">
			{isDefined(seatConfiguration) ? (
				<React.Fragment>
					<div className="grid grid-cols-3 gap-2">
						<DefinitionItem label="Category">
							{
								<Badge
									variant="filled"
									styles={{
										root: {
											backgroundColor: seatConfiguration.category.color,
										},
									}}
								>
									<div className="flex items-center gap-1.5">
										<div className="h-[5px] w-[5px] rounded-full bg-white" />
										{seatConfiguration.category.name}
									</div>
								</Badge>
							}
						</DefinitionItem>
						<DefinitionItem label="Row">{seatConfiguration.row}</DefinitionItem>
						<DefinitionItem label="Place">{seatConfiguration.place}</DefinitionItem>
					</div>

					{/* sold out */}
					{seatConfiguration.capacityLeft === 0 && (
						<Alert icon={<IconAlertCircle size="1rem" />} title="This seat is sold out" color="gray" variant="outline">
							<Text>
								Sorry, this seat is sold out. Please select another one.
							</Text>
						</Alert>
					)}

					{/* available tickets */}
					<DefinitionItem className={clsx([seatConfiguration.capacityLeft === 0 && 'opacity-50'])} label="Tickets">
						<div className="flex flex-col gap-3">
							{seatConfiguration.tickets.map((ticket) => {
								const ticketCategory = valOrThrow(
									ticket.categories.find((ticketCategory) => ticketCategory.categoryId === seatConfiguration.category.categoryId),
									'Ticket category not found',
								);
								return (
									<div key={ticket.ticketId} className="flex flex-col gap-2">
										{/* content */}
										<div className="flex items-start justify-between gap-3">
											<div>
												<Text color="black">{ticket.name}</Text>
												{!isEmpty(ticket.description) && (
													<Text color="gray" size="sm">
														{ticket.description}
													</Text>
												)}
											</div>
											{/* TODO: currency */}
											<Text color="black">{format.formatPrice(ticketCategory.price, 'CZK')}</Text>
										</div>
										
										{/* add to cart button */}
										<Button fullWidth size="md">
											Add To Cart
										</Button>
									</div>
								);
							})}
						</div>
					</DefinitionItem>
				</React.Fragment>
			) : (
				<Skeleton height={200} width="100%" radius="md" />
			)}
		</Sheet.Content>
	);
};

type DefinitionItemProps = ExtendedComponent<
	{
		label: ReactNode;
		children: ReactNode;
	},
	'div'
>;
const DefinitionItem: FunctionComponent<DefinitionItemProps> = ({ label, children, ...props }) => {
	return (
		<div {...props}>
			<Text weight="bold" color="gray" size="xs">
				{label}
			</Text>
			<Text color="black">{children}</Text>
		</div>
	);
};
