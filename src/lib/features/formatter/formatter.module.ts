import { NumberFormat, PriceFormat } from '@project/lib/utils/format';

/**
 * Formatter module
 * @author filipditrich <ditrich@nfctron.com>
 * @export
 */
export class FormatterModule {
	public currentTimeZone;
	public currentLocale;
	
	constructor(locale: string = 'cs', timezone: string = 'Europe/Prague') {
		this.currentLocale = locale;
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
		PriceFormat(currencyIsoChar, this.currentLocale, settings).format(Number(value));
}
