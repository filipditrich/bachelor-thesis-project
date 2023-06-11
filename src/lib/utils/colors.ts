import { HexAlpha } from '@nfctron-tickets/types';
import Color from 'color';

/**
 * Returns correct Hex-alpha color string
 * @param {string} color
 * @returns {HexAlpha}
 */
export const hexAlpha = (color: string): HexAlpha => `#${color.replace('#', '').toUpperCase()}`;

/**
 * Converts color to Color via `color` library, chains functions in callback and returns back hex-alpha string
 * @param {HexAlpha} color
 * @param {(clr: Color) => Color} cb
 * @returns {HexAlpha}
 */
export const modifyColor = (color: HexAlpha, cb: (clr: Color) => Color): HexAlpha => cb(Color(color)).hexa() as HexAlpha;

/**
 * Returns value from Color callback
 * @param {HexAlpha} color
 * @param {(clr: Color) => Ret} cb
 * @returns {Ret}
 */
export const getColor = <Ret extends any>(color: HexAlpha, cb: (clr: Color) => Ret) => cb(Color(color));
