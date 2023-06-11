import { createEmotionCache } from '@mantine/core';
import { createGetInitialProps } from '@mantine/next';
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

/**
 * Emotion cache for @mantine/core. Used primarily to append (not prepend)
 * mantine styles in order to resolve conflicts with TailwindCSS preflight styles.
 * @type {EmotionCache}
 */
export const mantineEmotionCache = createEmotionCache({ key: 'mantine', prepend: false });

/** create document initial props getter via `@mantine/core` */
const getInitialProps = createGetInitialProps(mantineEmotionCache);

/**
 * BaseDocument is only rendered on the server side and not on the client side
 * Used to inject <html lang=""> tag
 * @see https://github.com/vercel/next.js/#custom-document
 */
class DocumentConfig extends Document {
	/**
	 * Document initial props
	 * @param {DocumentContext} context
	 * @see https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#context-object
	 * @returns {Promise<DocumentInitialProps>}
	 */
	static async getInitialProps(context: DocumentContext): Promise<DocumentInitialProps> {
		/** return `@mantine/next` initial props */
		return getInitialProps(context);
	}
	
	render() {
		return (
			<Html lang="cs">
				<Head>
					{/* google fonts */}
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
					      rel="stylesheet" />
					
					{/* favicons */}
					<meta name="theme-color" content="#EC4899" />
					<link rel="icon" href="/static/favicons/favicon.ico" />
					<link rel="apple-touch-icon" sizes="180x180" href="/static/favicons/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
					<link rel="manifest" href="/static/favicons/site.webmanifest" />
					<link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#EC4899" />
					<link rel="shortcut icon" href="/static/favicons/favicon.ico" />
					<meta name="apple-mobile-web-app-title" content="Seating Map" />
					<meta name="application-name" content="Seating Map" />
					<meta name="msapplication-TileColor" content="#EC4899" />
					<meta name="msapplication-config" content="/static/favicons/browserconfig.xml" />
					<meta name="theme-color" content="#EC4899" />
				</Head>
				<body>
				<Main />
				<NextScript />
				</body>
			</Html>
		);
	}
}

/**
 * Document default export
 * @default
 */
export default DocumentConfig;
