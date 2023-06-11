import { AppError } from '@project/lib/utils/error';
import { DependencyList, useCallback, useMemo, useState } from 'react';

/**
 * Hook to manage callback handlers with processing state
 * @author filipditrich <ditrich@nfctron.com>
 * @param {T} callback
 * @param {UseHandlerOptions} options
 * @returns {UseHandlerReturnType<T>}
 */
export const useHandler = <
	Func extends (...args: any) => unknown | Promise<unknown> = (...args: any) => unknown | Promise<unknown>,
	Args extends Parameters<Func> = Parameters<Func>,
	Return extends Awaited<PromiseLike<ReturnType<Func>>> = Awaited<PromiseLike<ReturnType<Func>>>,
	Throw extends boolean = true,
>(
	callback: Func,
	options: UseHandlerOptions<Func, Args, Return, Throw> = { deps: [], throwOnError: true as Throw },
): UseHandlerReturnType<Func, Args, Return, Throw> => {
	/** inner options */
	const _options = useMemo<UseHandlerOptions<Func, Args, Return, Throw>>(() => {
		return {
			throwOnError: true as Throw,
			...options,
			deps: options.deps ?? [],
		};
	}, [options]);

	/** inner states */
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<AppError | null>(null);
	const [argsState, setArgsState] = useState<Args | null>(null);
	const [successCount, setSuccessCount] = useState(0);
	const [errorCount, setErrorCount] = useState(0);
	const [result, setResult] = useState<Return | null>(null);

	/** main callback handler */
	const callbackHandler = useCallback<UseHandlerReturnType<Func, Args, Return, Throw>['handler']>(
		/* @ts-ignore */
		async (...args: Args) => {
			try {
				setArgsState(args);
				setError(null);
				setIsProcessing(true);
				const res = (await callback(...args)) as Return;
				setResult(res);
				_options.onSuccess?.(res);
				setSuccessCount((prev) => prev + 1);
				return res;
			} catch (e: AppError | any) {
				const err = e instanceof AppError ? e : new AppError(e.name ?? 'callback_handler_error', e.statusCode ?? undefined, e.message ?? null);
				setError(err);
				_options.onError?.(err);
				setErrorCount((prev) => prev + 1);
				if (_options.throwOnError) throw err;
				return err;
			} finally {
				setIsProcessing(false);
			}
		},
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[..._options.deps, _options.throwOnError, _options.onError, _options.onSuccess, callback],
	);

	return {
		handler: callbackHandler,
		isProcessing,
		error,
		args: argsState,
		successCount,
		errorCount,
		result,
		cleanUp: () => {
			setIsProcessing(false);
			setError(null);
			setArgsState(null);
			setSuccessCount(0);
			setErrorCount(0);
			setResult(null);
		},
	};
};

/**
 * Hook return type
 * @export
 */
export type UseHandlerReturnType<
	Func extends (...args: any) => unknown | Promise<unknown> = (...args: any) => unknown | Promise<unknown>,
	Args extends Parameters<Func> = Parameters<Func>,
	Return extends Awaited<PromiseLike<ReturnType<Func>>> = Awaited<PromiseLike<ReturnType<Func>>>,
	Throw extends boolean = true,
> = {
	handler: (...args: Args) => Throw extends true ? Promise<Return> : Promise<Return | AppError>;
	isProcessing: boolean;
	error: AppError | null;
	args: Args | null;
	successCount: number;
	errorCount: number;
	cleanUp: () => void;
	result: Return | null;
};

/**
 * Options for useHandler hook
 * @export
 */
export type UseHandlerOptions<
	Func extends (...args: any) => unknown | Promise<unknown> = (...args: any) => unknown | Promise<unknown>,
	Args extends Parameters<Func> = Parameters<Func>,
	Return extends Awaited<PromiseLike<ReturnType<Func>>> = Awaited<PromiseLike<ReturnType<Func>>>,
	Throw extends boolean = true,
> = {
	deps: DependencyList;
	onError?: (error: AppError) => void;
	onSuccess?: (result: Return) => void;
	throwOnError?: Throw;
};
