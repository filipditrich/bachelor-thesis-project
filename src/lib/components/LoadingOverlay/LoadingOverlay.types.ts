import { LoadingOverlay as MantineLoadingOverlay } from '@mantine/core';
import { ExtendedComponent } from '@project/lib/types/common';
import { ReactNode } from 'react';

/**
 * LoadingOverlay component props type
 * @export
 */
export type LoadingOverlayProps = ExtendedComponent<{ message?: ReactNode }, typeof MantineLoadingOverlay>;
