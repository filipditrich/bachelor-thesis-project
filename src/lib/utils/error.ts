/**
 * Custom App error class
 * @extends Error
 * @export
 */
export class AppError extends Error {
	constructor(public name: string = 'unknown_error', public message: string = 'No further error provided', public status: number = 500) {
		super();
	}
}

/**
 * Not implemented error
 * @extends AppError
 * @export
 */
export class NotImplementedError extends AppError {
	constructor(message?: string) {
		super('not_implemented', message ?? 'Feature not yet implemented, no further error provided', 501);
	}
}

/**
 * Invalid state error
 * @extends AppError
 * @export
 */
export class InvalidStateError extends AppError {
	constructor(message?: string) {
		super('invalid_state', message ?? 'Invalid application state with no further error provided', 400);
	}
}

/**
 * API request error
 * @extends AppError
 * @export
 */
export class ApiRequestError extends AppError {
	constructor(message?: string, status?: number) {
		super('api_request_error', message ?? 'An error occurred while making an API request', status ?? 400);
	}
}
