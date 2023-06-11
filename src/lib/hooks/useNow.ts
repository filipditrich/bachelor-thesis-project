import { useInterval } from '@mantine/hooks';
import { isDefined } from '@project/lib/utils/common';
import React, { useEffect, useState } from 'react';

/**
 * Hook that returns current date
 * @returns {any}
 */
export const useNow = () => {
	const now = React.useRef(new Date());
	return now.current;
};

/**
 * Hook that returns current date in a state with interval update
 * @returns {any}
 */
export const useNowState = (options: { interval: number; autoStart: boolean } = { interval: 60, autoStart: true }) => {
	const [now, setNow] = useState(() => new Date());

	/** update interval each minute */
	const interval = useInterval(() => {
		setNow(new Date());
	}, options.interval * 1000);

	/** handle interval control */
	useEffect(() => {
		if (options.autoStart) interval.start();

		return () => {
			interval.stop();
		};
	}, [interval, options.autoStart]);

	return { now, interval };
};

/**
 * Hook that runs a function when a date is reached
 * @param {Date | null | undefined} date
 * @param {() => Promise<void>} then
 */
export const useWaitUntil = (date: Date | null | undefined, then: () => Promise<void>) => {
	const [isDone, setIsDone] = useState<boolean>(false);

	/** update interval each minute */
	const interval = useInterval(() => {
		if (!isDefined(date)) return false;
		const now = new Date();
		if (now >= date) {
			setIsDone(true);
			interval.stop();
			then().then(() => {
				setIsDone(false);
			});
		}
	}, 1000);

	return {
		isDone,
	};
};
