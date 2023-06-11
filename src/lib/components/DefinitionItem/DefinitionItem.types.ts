import { ExtendedComponent } from '@project/lib/types/common';
import { ReactNode } from 'react';

/**
 * DefinitionItem component types namespace
 * @export
 */
export namespace DefinitionItemTypes {
	/**
	 * Props type
	 * @export
	 */
	export type Props = ExtendedComponent<
		{
			label: ReactNode;
			children: ReactNode;
		},
		'div'
	>;
}
