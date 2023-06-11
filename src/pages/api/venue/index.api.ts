import { arrayOf, randomIntBetween } from '@project/lib/utils/common';
import { VenueApiTypes } from '@project/pages/api/venue/schema';
import { withErrorMiddleware } from '@project/pages/api/withError.middleware';
import { NextApiHandler } from 'next/types';
import { v4 as uuidv4 } from 'uuid';

/** mock categories */
const CATEGORY_BALCONY: VenueApiTypes.Category = {
	categoryId: uuidv4(),
	name: 'Balcony',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget.',
	color: '#1570EFFF',
};
const CATEGORY_SIDE: VenueApiTypes.Category = {
	categoryId: uuidv4(),
	name: 'Side',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget.',
	color: '#EE46BCFF',
};
const CATEGORY_MIDDLE: VenueApiTypes.Category = {
	categoryId: uuidv4(),
	name: 'Middle',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget.',
	color: '#FB6514FF',
};
const categories = [CATEGORY_BALCONY, CATEGORY_SIDE, CATEGORY_MIDDLE];

/** mock tickets */
const TICKET_REGULAR: VenueApiTypes.Ticket = {
	ticketId: uuidv4(),
	name: 'Regular Ticket',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget. Duis auctor, nisl eget.',
	price: 1990_00,
	categories: [
		{
			categoryId: CATEGORY_MIDDLE.categoryId,
			price: 1990_00,
		},
		{
			categoryId: CATEGORY_SIDE.categoryId,
			price: 1490_00,
		},
		{
			categoryId: CATEGORY_BALCONY.categoryId,
			price: 990_00,
		},
	],
};
const TICKET_VIP: VenueApiTypes.Ticket = {
	ticketId: uuidv4(),
	name: 'VIP Ticket',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget. Duis auctor, nisl eget.',
	price: 2990_00,
	categories: [
		{
			categoryId: CATEGORY_MIDDLE.categoryId,
			price: 2990_00,
		},
		{
			categoryId: CATEGORY_SIDE.categoryId,
			price: 2490_00,
		},
		{
			categoryId: CATEGORY_BALCONY.categoryId,
			price: 1990_00,
		},
	],
};
const TICKET_VIP_PLUS: VenueApiTypes.Ticket = {
	ticketId: uuidv4(),
	name: 'VIP+ Ticket',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget. Duis auctor, nisl eget.',
	price: 3990_00,
	categories: [
		{
			categoryId: CATEGORY_MIDDLE.categoryId,
			price: 3990_00,
		},
	],
};
const tickets = [TICKET_REGULAR, TICKET_VIP, TICKET_VIP_PLUS];

/** mock seats */
const SEATS_MIDDLE = ['B', 'C', 'D', 'E', 'F'].reduce((acc, row) => {
	return acc.concat(
		arrayOf(5).map((key) => {
			const place = key + 7;
			return {
				seatId: uuidv4(),
				row,
				place,
				capacityLeft: 1,
				fullName: `${row}${place}`,
				tickets: ['B', 'C'].includes(row) ? [TICKET_VIP_PLUS.ticketId, TICKET_VIP.ticketId] : [TICKET_REGULAR.ticketId],
				categoryId: CATEGORY_MIDDLE.categoryId,
			};
		}),
	);
}, [] as VenueApiTypes.Seat[]);
const SEATS_LEFT = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].reduce((acc, row) => {
	return acc.concat(
		arrayOf(6).map((key) => {
			const place = key + 1;
			return {
				seatId: uuidv4(),
				row,
				place,
				capacityLeft: 1,
				fullName: `${row}${place}`,
				tickets: ['A', 'B'].includes(row) ? [TICKET_VIP.ticketId] : [TICKET_REGULAR.ticketId],
				categoryId: CATEGORY_SIDE.categoryId,
			};
		}),
	);
}, [] as VenueApiTypes.Seat[]);
const SEATS_RIGHT = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].reduce((acc, row) => {
	return acc.concat(
		arrayOf(6).map((key) => {
			const place = key + 12;
			return {
				seatId: uuidv4(),
				row,
				place,
				capacityLeft: 1,
				fullName: `${row}${place}`,
				tickets: ['A', 'B'].includes(row) ? [TICKET_VIP.ticketId] : [TICKET_REGULAR.ticketId],
				categoryId: CATEGORY_SIDE.categoryId,
			};
		}),
	);
}, [] as VenueApiTypes.Seat[]);
const SEATS_BALCONY = ['H', 'I', 'J', 'K', 'L'].reduce((acc, row) => {
	return acc.concat(
		arrayOf(20).map((key) => {
			const place = key + 1;
			return {
				seatId: uuidv4(),
				row,
				place,
				capacityLeft: randomIntBetween(0, 1),
				fullName: `${row}${place}`,
				tickets: ['H', 'I'].includes(row) && place >= 8 && place <= 14 ? [TICKET_VIP.ticketId] : [TICKET_REGULAR.ticketId],
				categoryId: CATEGORY_BALCONY.categoryId,
			};
		}),
	);
}, [] as VenueApiTypes.Seat[]);
const seats: VenueApiTypes.Seat[] = [...SEATS_LEFT, ...SEATS_MIDDLE, ...SEATS_RIGHT, ...SEATS_BALCONY];

/**
 * Mock API route to provide seating data
 * @param {NextApiRequest} req
 * @param {NextApiResponse<any>} res
 */
const seatingApiHandler: NextApiHandler = async (req, res) => {
	/** import the SVG drawing */
	const drawing = require('@project/pages/api/data/venue-map.svg');

	/** get the data */
	const data: VenueApiTypes.ApiSchema = {
		venueId: uuidv4(),
		name: 'Seating map',
		seats,
		categories,
		tickets,
		drawing,
	};
	/** return data in JSON format */
	res.status(200).json(data);
};

/*
Find:
<g id="seat:(\w+) (\d+)">
                <rect (.*)/>
            </g>
Replace:
<!-- seat $1+$2 -->
<rect id="seat:$1+$2" $3 />

 */

/**
 * Api Handler default export
 * @default
 */
export default withErrorMiddleware(seatingApiHandler);
