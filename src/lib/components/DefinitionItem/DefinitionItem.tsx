import { Text } from '@mantine/core';
import React, { FunctionComponent } from 'react';
import { DefinitionItemTypes as Types } from './DefinitionItem.types';

/**
 * DefinitionItem component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const DefinitionItem: FunctionComponent<Types.Props> = ({ label, children, ...props }) => {
	return (
		<div {...props}>
			<Text weight="bold" color="gray" size="xs">
				{label}
			</Text>
			<Text color="black">{children}</Text>
		</div>
	);
};
