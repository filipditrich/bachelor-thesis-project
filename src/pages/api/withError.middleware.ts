import { AppError } from '@project/lib/utils/error';
import { NextApiHandler } from 'next';

/**
 * Simple withErrorMiddleware error handler
 * @export
 */
export const withErrorMiddleware =
	(handler: NextApiHandler, options?: WithErrorMiddlewareOptions): NextApiHandler =>
	async (req, res) => {
		try {
			/** try running the handler */
			handler(req, res);
		} catch (err: AppError | any) {
			/** log the raw error */
			console.error(err);
			/** respond with formatter error data */
			res.status(err.statusCode || 500).json({
				statusCode: err.statusCode || 500,
				message: err.message || err.name || 'internal_error',
			});
		}
	};

/**
 * Options for the `withErrorMiddleware` middleware
 * @private
 */
type WithErrorMiddlewareOptions = {};
