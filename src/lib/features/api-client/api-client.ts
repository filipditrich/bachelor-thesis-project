import { isDefined, isEmpty, isOfType } from '@project/lib/utils/common';
import { ApiRequestError } from '@project/lib/utils/error';
import axios, { AxiosError, AxiosInstance } from 'axios';

export const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
if (isEmpty(API_BASE)) throw new Error('Environmental variable "API_BASE" is not set!');

/** global axios configuration */
export const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE,
});

/** request interceptor */
apiClient.interceptors.request.use(
	(config) => {
		return config;
	},
	(error) => Promise.reject(error),
);

/** response interceptor */
apiClient.interceptors.response.use(
	(res) => {
		return Promise.resolve(res);
	},
	async (error) => {
		try {
			/** response received */
			if (isOfType<AxiosError<CommonAPIErrorResponse>>(error, ['response']) && isDefined(error.response)) {
				/** throw the error */
				throw new ApiRequestError(
					error.response.data.message ||
						error.response.data.errorText ||
						'The server returned an error response and provided no further information about it.',
					error.response.status,
				);
			}

			/** no response but request was made */
			if (isOfType<AxiosError<CommonAPIErrorResponse>>(error, ['response']) && isDefined(error.request)) {
				throw new ApiRequestError('No response received. This most likely means the request has timed out.');
			}

			/** unknown error */
			throw new ApiRequestError('Something happened in setting up the request that triggered an error.');
		} catch (clientError) {
			return Promise.reject(clientError);
		}
	},
);

/**
 * Common API response for failed requests
 */
export interface CommonAPIErrorResponse {
	statusCode?: number;
	message?: string;
	errorText?: string;
	type?: string;
}
