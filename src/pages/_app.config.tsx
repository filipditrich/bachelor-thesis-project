import { MantineProvider } from '@mantine/core';
import '@project/styles/globals.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'react-spring-bottom-sheet/dist/style.css';
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
			>
				<QueryClientProvider client={queryClient}>
					{/* page render */}
					<Component {...pageProps} />
				</QueryClientProvider>
			</MantineProvider>
		</React.Fragment>
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
