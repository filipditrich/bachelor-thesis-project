import { z } from 'zod';

/**
 * Venue API response schema
 * @export
 */
export const venueApiSchema = z.object({
	/** venue id */
	venueId: z.string().uuid(),
	/** venue name */
	name: z.string(),
	/** seating drawing (SVG) */
	drawing: z.string(),
	/** venue seat data */
	seats: z.array(
		z.object({
			/** seat id */
			seatId: z.string().uuid(),
			/** seat row display label */
			row: z.string(),
			/** seat place number */
			place: z.number(),
			/** seat full display name label */
			fullName: z.string(),
			/** seat available capacity left */
			capacityLeft: z.number(),
			tickets: z.array(z.string().uuid()),
			categoryId: z.string().uuid(),
		}),
	),
	/** venue ticket data */
	tickets: z.array(
		z.object({
			/** ticket id */
			ticketId: z.string().uuid(),
			name: z.string(),
			description: z.string().optional(),
			price: z.number().int(),
			categories: z.array(
				z.object({
					categoryId: z.string().uuid(),
					price: z.number().int(),
				}),
			),
		}),
	),
	/** venue ticket categories */
	categories: z.array(
		z.object({
			/** category id */
			categoryId: z.string().uuid(),
			name: z.string(),
			description: z.string().optional(),
			color: z.string(),
		}),
	),
});

/**
 * Venue API types namespace
 * @export
 */
export namespace VenueApiTypes {
	export type ApiSchema = z.infer<typeof venueApiSchema>;
	export type Seat = ApiSchema['seats'][number];
	export type Ticket = ApiSchema['tickets'][number];
	export type Category = ApiSchema['categories'][number];
}
