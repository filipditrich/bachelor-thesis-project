import { SeatingMapTypes } from '@project/lib/features/map/SeatingMap';
import { ExtendedComponent } from '@project/lib/types/common';

/**
 * Seat component types namespace
 * @export
 */
export namespace SeatTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<
		{
			data: Data;
		},
		'circle'
	>;

	/**
	 * Data type
	 * @export
	 */
	export type Data = SeatingMapTypes.DataExtended['seats'][number];
}
