import { format } from 'date-fns';

/**
 * Internalized NumberFormat instance
 * @return {Intl.NumberFormat}
 * @constructor
 */
export const NumberFormat = (locale: string, settings?: Intl.NumberFormatOptions) =>
	Intl.NumberFormat(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...settings,
	});

/**
 * Internalized price NumberFormat instance
 * @return {Intl.NumberFormat}
 */
export const PriceFormat = (currencyIsoChar: string, locale: string, settings?: Intl.NumberFormatOptions) => {
	return NumberFormat(locale, {
		...settings,
		style: 'currency',
		currency: currencyIsoChar,
	});
};

/**
 * Date formatter using date-fns library
 * @return {string}
 */
export const formatDate = (date: Date | number | string, dateFormat: string, options?: FormatDateOptions): string =>
	format(typeof date === 'string' ? new Date(date) : date, dateFormat, options);

/**
 * Date formatter options type.
 * See implementation of format function in date-fns for more details.
 * @export
 */
export type FormatDateOptions = {
	locale?: Locale;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	useAdditionalWeekYearTokens?: boolean;
	useAdditionalDayOfYearTokens?: boolean;
};
