import { ExtendedComponent } from '@project/lib/types/common';

/**
 * VirtualMap component types namespace
 * @export
 */
export namespace VirtualMapTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<
		{
			/** whether to enable z-axis rotation or not */
			withRotation?: boolean;
			/** width of the svg container */
			width: number;
			baseWidth: number;
			/** height of the svg container */
			height: number;
			baseHeight: number;
			/** minimum scale factor */
			minScaleFactor?: number;
			/** maximum scale factor */
			maxScaleFactor?: number;
		},
		'svg'
	>;
}
