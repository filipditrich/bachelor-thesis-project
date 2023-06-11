import { useMemo } from 'react';
import { FormatterModule } from './formatter.module';

/**
 * Returns localized and synced formatter module
 * @returns {FormatterModule}
 */
export const useFormat = () => {
	/** formatter module instance */
	const formatterModule = useMemo(
		() => new FormatterModule('cs', 'Europe/Prague'),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
	
	return formatterModule;
};
