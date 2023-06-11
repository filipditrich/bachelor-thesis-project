import { LoadingOverlay, MantineProvider } from '@mantine/core';
import '@project/styles/globals.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mantineEmotionCache } from './_document.config';

/**
 * Base Application component
 * @returns {JSX.Element}
 * @constructor
 */
const AppConfig = ({ Component, pageProps, ...props }: AppConfigProps) => {
	const router = useRouter();
	const [queryClient] = useState(() => new QueryClient());

	return (
		<Suspense
			fallback={
				<div className="relative h-screen w-screen">
					<LoadingOverlay visible overlayBlur={2} loaderProps={{ variant: 'dots' }} />
				</div>
			}
		>
			<React.Fragment>
				{/* page head*/}
				<Head>
					<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
					<title />
				</Head>

				{/* @mantine/core */}
				<MantineProvider
					withGlobalStyles
					withNormalizeCSS
					emotionCache={mantineEmotionCache}
					theme={{
						primaryColor: 'indigo',
					}}
				>
					<QueryClientProvider client={queryClient}>
						{/* page render */}
						<Component {...pageProps} />
					</QueryClientProvider>
				</MantineProvider>
			</React.Fragment>
		</Suspense>
	);
};

/**
 * Base App page props type
 * @private
 */
type PageProps = {};

/**
 * Base App config props type
 * @private
 */
type AppConfigProps = AppProps & { pageProps: PageProps };

/**
 * AppConfig default export
 * @default
 */
export default AppConfig;
