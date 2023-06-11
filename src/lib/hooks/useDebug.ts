import { useDisclosure } from '@mantine/hooks';
import { fakePromise, randomIntBetween } from '@project/lib/utils/common';
import { useMemo } from 'react';

/**
 * Flag that decides whether network should be delayed
 * @type {boolean}
 */
export const DELAY_NETWORK = true;

/**
 * Simulates network delay
 * @param {"normal" | "heavy"} type
 * @return {Promise<void>}
 */
export const simulatedNetworkDelay = async (type: 'normal' | 'heavy' = 'normal') => {
	const delay = type === 'normal' ? 1000 : 5000;
	await fakePromise(DELAY_NETWORK ? randomIntBetween(delay * 0.25, delay) : 0);
};

/**
 * UseDebug hook
 * @author filipditrich <ditrich@nfctron.com>
 * @constructor
 */
export const useDebug = (options?: UseDebugOptions) => {
	/** decides whether debug mode is allowed */
	const canDebug = useMemo(() => {
		if (options?.force) return true;
		return true;
	}, [options?.force]);

	/** debug state */
	const [isDebug, { close, open, toggle }] = useDisclosure(options?.initial, options);

	return {
		isDebug,
		canDebug,
		exit: close,
		enter: open,
		toggle,
	};
};

/**
 * UseDebug hook options
 * @export
 */
export type UseDebugOptions = {
	force?: boolean;
	initial?: boolean;
	onOpen?(): void;
	onClose?(): void;
};
