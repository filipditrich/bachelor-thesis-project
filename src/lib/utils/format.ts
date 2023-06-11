/**
 * Internalized NumberFormat instance
 * @return {Intl.NumberFormat}
 * @constructor
 */
export const NumberFormat = (locale: string, settings?: Intl.NumberFormatOptions) =>
	Intl.NumberFormat(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...settings
	});

/**
 * Internalized price NumberFormat instance
 * @return {Intl.NumberFormat}
 */
export const PriceFormat = (currencyIsoChar: string, locale: string, settings?: Intl.NumberFormatOptions) => {
	return NumberFormat(locale, {
		...settings,
		style: 'currency',
		currency: currencyIsoChar
	});
};
