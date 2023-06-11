import { formatDate as formatDateHelper, FormatDateOptions, NumberFormat, PriceFormat } from '@project/lib/utils/format';
import { cs, enGB } from 'date-fns/locale';

/**
 * Formatter module
 * @author filipditrich <filip.ditirch@plus4u.net>
 * @export
 */
export class FormatterModule {
	public currentTimeZone;
	public currentLocale;
	public currentDateFnsLocale;

	constructor(locale: string = 'en', timezone: string = 'Europe/Prague') {
		this.currentLocale = locale;
		this.currentDateFnsLocale = locale === 'cs' ? cs : enGB;
		this.currentTimeZone = timezone;
	}

	/**
	 * Localized number formatter
	 * @return {any}
	 */
	public formatNumber = (value: number, settings?: Intl.NumberFormatOptions) => NumberFormat(this.currentLocale, settings).format(value);

	/**
	 * Localized price formatter
	 * @return {any}
	 */
	public formatPrice = (value: number, currencyIsoChar: string, settings?: Intl.NumberFormatOptions) =>
		PriceFormat(currencyIsoChar, this.currentLocale, settings).format(Number(value) / 100);

	/**
	 * Localized date formatter
	 * @return {string}
	 */

	public formatDate = (date: Date | number | string, dateFormat: string, options?: FormatDateOptions) =>
		formatDateHelper(date, dateFormat, {
			locale: this.currentDateFnsLocale,
			...options,
		});
}
