import { VirtualMap } from '@project/lib/features/map/VirtualMap';
import { Extend, ExtendedComponent, HexAlpha, UUID } from '@project/lib/types/common';
import { VenueApiTypes } from '@project/pages/api/venue/schema';

/**
 * SeatingMap component types namespace
 * @export
 */
export namespace SeatingMapTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<
		{
			/** svg container background fill */
			background?: HexAlpha;
			/** height, width required for the `VirtualMap` component */
			height: number;
			width: number;
		},
		typeof VirtualMap
	>;

	/**
	 * Data type
	 * @export
	 */
	export type Data = VenueApiTypes.ApiSchema;

	/**
	 * Data type
	 * @export
	 */
	export type DataExtended = Extend<
		VenueApiTypes.ApiSchema,
		{
			seats: Array<
				Extend<
					VenueApiTypes.Seat,
					{
						category: VenueApiTypes.Category;
						tickets: Array<
							Extend<
								VenueApiTypes.Ticket,
								{
									categories: Array<
										Extend<
											VenueApiTypes.Category,
											{
												price: number;
											}
										>
									>;
								}
							>
						>;
					}
				>
			>;
		}
	>;

	/**
	 * Context types namespace
	 * @export
	 */
	export namespace Context {
		/**
		 * Props type
		 * @export
		 */
		export type Props = {
			/** seating input data */
			data: Data;
			dataExtended: DataExtended;
		};

		/**
		 * State type
		 * @export
		 */
		export type State = Extend<
			{
				selectedSeatId: SelectedSeatIdState;
				/** when seat is selected */
				onSeatSelect: (seatId: UUID) => void;
				/** when seat is unselected */
				onSeatUnselect: () => void;
			},
			Props
		>;

		/**
		 * SelectedSeatIdState type
		 * @export
		 */
		export type SelectedSeatIdState = UUID | null;
	}
}
