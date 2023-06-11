import { AxiosResponse } from 'axios';
import {
	QueryKey,
	QueryObserverIdleResult,
	QueryObserverLoadingErrorResult,
	QueryObserverLoadingResult,
	QueryObserverRefetchErrorResult,
	QueryObserverResult,
	QueryObserverSuccessResult,
	RefetchOptions,
	RefetchQueryFilters,
	useQuery,
	UseQueryOptions,
	UseQueryResult,
} from 'react-query';
import { QueryFunctionContext } from 'react-query/types/core/types';

/**
 * Custom implementation of react-query useQuery hook with first-level suspense support
 * @param {TQueryKey} queryKey
 * @param {UseQueryFunction<TQueryFnData, TQueryParams, TQueryKey>} queryFn
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn" | "suspense" | "enabled">} options
 * @returns {UseSuspenseQueryResult<TData, TError>}
 */
export function useSuspenseQuery<
	TQueryFnData = unknown,
	TError extends UseQueryError = UseQueryError,
	TData = TQueryFnData,
	TQueryParams extends Record<any, any> = {},
	TQueryKey extends [QueryKey, TQueryParams] = [QueryKey, TQueryParams],
>(
	queryKey: TQueryKey,
	queryFn: UseQueryFunction<TQueryFnData, TQueryParams, TQueryKey>,
	options?: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryParams, TQueryKey>,
): UseSuspenseQueryResult<TData, TError> {
	const res = useQuery(queryKey, async (props) => (await queryFn({ ...props, params: props.queryKey[1] })).data, {
		...options,
		suspense: true,
	}) as unknown as UseSuspenseQueryResult<TData, TError>;

	return {
		...res,
		dataUpdatedAt: new Date(res.dataUpdatedAt),
	};
}

export type UseSuspenseQueryOptions<
	TQueryFnData = unknown,
	TError extends UseQueryError = UseQueryError,
	TData = TQueryFnData,
	TQueryParams extends Record<any, any> = {},
	TQueryKey extends [QueryKey, TQueryParams] = [QueryKey, TQueryParams],
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn' | 'suspense' | 'enabled'>;

export type UseApiQueryObserverResult<TData = unknown, TError = unknown> = Omit<
	| QueryObserverIdleResult<TData, TError>
	| QueryObserverLoadingErrorResult<TData, TError>
	| QueryObserverLoadingResult<TData, TError>
	| QueryObserverRefetchErrorResult<TData, TError>
	| QueryObserverSuccessResult<TData, TError>,
	'dataUpdatedAt'
> & { dataUpdatedAt: Date };
export type UseSuspenseQueryObserverResult<TData = unknown, TError = unknown> = Omit<QueryObserverSuccessResult<TData, TError>, 'dataUpdatedAt'> & {
	dataUpdatedAt: Date;
};

type UseSuspenseBaseQueryResult<TData, TError> = UseSuspenseQueryObserverResult<TData, TError>;
export type UseSuspenseQueryResult<TData = unknown, TError = unknown> = UseSuspenseBaseQueryResult<TData, TError>;
export type UseQueryRefetch<TData = unknown, TError = unknown, TPageData = unknown> = (
	options?: RefetchOptions & RefetchQueryFilters<TPageData>,
) => Promise<QueryObserverResult<TData, TError>>;
export type UseQueryError = {
	statusCode?: number;
	message?: string;
	errorText?: string;
	type?: string;
};

/**
 * Custom implementation of react-query useQuery hook
 * @param {TQueryKey} queryKey
 * @param {UseQueryFunction<TQueryFnData, TQueryParams, TQueryKey>} queryFn
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">} options
 * @returns {UseQueryResult<TData, TError>}
 */
export function useApiQuery<
	TQueryFnData = unknown,
	TError extends UseQueryError = UseQueryError,
	TData = TQueryFnData,
	TQueryParams extends Record<any, any> = {},
	TQueryKey extends [QueryKey, TQueryParams] = [QueryKey, TQueryParams],
>(
	queryKey: TQueryKey,
	queryFn: UseQueryFunction<TQueryFnData, TQueryParams, TQueryKey>,
	options?: UseApiQueryOptions<TQueryFnData, TError, TData, TQueryParams, TQueryKey>,
): UseApiQueryObserverResult<TData, TError> {
	const res = useQuery(
		queryKey,
		async (props) =>
			(
				await queryFn({
					...props,
					params: props.queryKey[1],
				})
			).data,
		options,
	);
	return {
		...res,
		dataUpdatedAt: new Date(res.dataUpdatedAt),
	};
}

export type UseApiQueryOptions<
	TQueryFnData = unknown,
	TError extends UseQueryError = UseQueryError,
	TData = TQueryFnData,
	TQueryParams extends Record<any, any> = {},
	TQueryKey extends [QueryKey, TQueryParams] = [QueryKey, TQueryParams],
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;

type UseQueryFunction<
	T = unknown,
	TQueryParams extends Record<any, any> = {},
	TQueryKey extends [QueryKey, TQueryParams] = [QueryKey, TQueryParams],
> = (
	context: QueryFunctionContext<TQueryKey> & {
		params: TQueryKey[1];
	},
) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
