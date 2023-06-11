import { Loader, LoadingOverlay as MantineLoadingOverlay, Text, useMantineTheme } from '@mantine/core';
import { isEmpty } from '@project/lib/utils/common';
import React, { FunctionComponent } from 'react';
import { LoadingOverlayProps } from './LoadingOverlay.types';

/**
 * LoadingOverlay component
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({ loaderProps, message, visible = false, ...props }) => {
	const theme = useMantineTheme();
	return (
		<MantineLoadingOverlay
			visible={visible}
			className="rounded-2xl"
			overlayOpacity={1}
			overlayColor={theme.colors.gray[1]}
			loader={
				<div className="flex flex-col items-center gap-6">
					{/* loader */}
					<Loader variant="dots" {...loaderProps} />
					{/* loader message */}
					{!isEmpty(message) && (
						<Text weight="bold" size="sm" color="gray">
							{message}
						</Text>
					)}
				</div>
			}
			{...props}
		/>
	);
};
