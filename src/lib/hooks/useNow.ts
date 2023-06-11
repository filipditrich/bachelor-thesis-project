import React from 'react';

/**
 * Hook that returns current date
 * @returns {any}
 */
export const useNow = () => {
	const now = React.useRef(new Date());
	return now.current;
};
