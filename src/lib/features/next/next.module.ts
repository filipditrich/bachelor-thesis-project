import { InferGetServerSidePropsType, InferGetStaticPropsType, NextPage } from 'next';
import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	GetStaticProps,
	GetStaticPropsContext,
	GetStaticPropsResult
} from 'next/types';

/**
 * Next.js page component with SSR props
 * @extends {NextPage}
 * @export
 */
export type PageComponent<T> = NextPage<InferPagePropsType<T> extends never ? T : InferPagePropsType<T>>;

/**
 * Combination type of Next.js infer page props type
 * @extends {InferGetServerSidePropsType}
 * @extends {InferGetStaticPropsType}
 * @private
 */
type InferPagePropsType<T> = T extends GetServerSideProps<infer P, any>
	? P
	: T extends (context?: GetServerSidePropsContext<any>) => Promise<GetServerSidePropsResult<infer P>>
		? P
		: T extends GetStaticProps<infer P, any>
			? P
			: T extends (context?: GetStaticPropsContext<any>) => Promise<GetStaticPropsResult<infer P>> | GetStaticPropsResult<infer P>
				? P
				: never;

/**
 * Next.js page component path params
 * @export
 */
export type PageParams<P extends string | null = null> = P extends string ? Record<P, string> : {};

/**
 * Next.js page component URL search params
 */
export type PageQuery<Q extends string | null = null> = Q extends string ? Record<Q, string | undefined> : {};
