import { AppShell, Container, Header } from '@mantine/core';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { PageComponent, PageParams, PageQuery } from '@project/lib/features/next/next.module';
import { useRouter } from 'next/router';
import React, { createContext } from 'react';

/**
 * Index page context
 * @type {React.Context<IndexPageContextProps | undefined>}
 * @export
 */
export const IndexPageContext = createContext<IndexPageContextProps | undefined>(undefined);
type IndexPageContextProps = {};

/**
 * Main index page view component
 * @author filipditrich <ditrich@nfctron.com>
 * @returns {JSX.Element}
 * @constructor
 */
const IndexPage: PageComponent<Props> = ({}) => {
	const router = useRouter();
	const format = useFormat();
	
	return (
		<React.Fragment>
			{/* content */}
			<IndexPageContext.Provider value={{}}>
				<AppShell
					padding={0}
					header={<Header height={60} p="xs">
						TODO: header
					</Header>}
					styles={{
						main: {
							backgroundColor: 'rgba(0,0,0,0.05)',
							// minHeight: 'unset !important',
							paddingBottom: '0 !important'
						}
					}}
				>
					<React.Fragment>
						{/* main container */}
						<Container size="xs" px={0} className="flex flex-col">
							TODO: content
						</Container>
					</React.Fragment>
				</AppShell>
			</IndexPageContext.Provider>
		</React.Fragment>
	);
};

/**
 * Page display name
 * @type {string}
 */
IndexPage.displayName = '@project/pages/Index';

/**
 * Page props type
 * @private
 */
type Props = {};

/**
 * Page params type
 * @private
 */
type Params = PageParams<null>;

/**
 * Page query type
 * @private
 */
type Query = PageQuery<null>;

/**
 * Default page export
 * @default
 */
export default IndexPage;
