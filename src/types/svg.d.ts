/// <reference types="react" />
import { SvgIconComponent } from './components';

/**
 * Declaration of imported SVG files
 */
declare module '*.svg' {
	const value: SvgIconComponent;
	export = value;
}
