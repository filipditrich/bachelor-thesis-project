import { AppShell, Button, Container, Header } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { apiClient } from '@project/lib/features/api-client/api-client';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { SeatingMap, SeatingMapTypes } from '@project/lib/features/map/SeatingMap';
import { SeatingMapProvider } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { PageComponent, PageParams, PageQuery } from '@project/lib/features/next/next.module';
import { useSuspenseQuery } from '@project/lib/hooks/useApiQuery';
import { useNow } from '@project/lib/hooks/useNow';
import { fakePromise, noop, valOrThrow } from '@project/lib/utils/common';
import { venueApiSchema } from '@project/pages/api/venue/schema';
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
 * @author filipditrich <filip.ditirch@plus4u.net>
 * @returns {JSX.Element}
 * @constructor
 */
const IndexPage: PageComponent<Props> = () => {
	const router = useRouter();
	const format = useFormat();
	const { height, width } = useViewportSize();
	const now = useNow();

	/** get seating data from API */
	const venueApi = useSuspenseQuery(
		['venue', {}],
		async () => {
			await fakePromise(1000);
			return apiClient.get('/api/venue');
		},
		{
			select: (data) => {
				const rawData = venueApiSchema.parse(data);
				const extendedData: SeatingMapTypes.DataExtended = {
					...rawData,
					seats: rawData.seats.map((seat) => ({
						...seat,
						category: valOrThrow(
							rawData.categories.find((c) => c.categoryId === seat.categoryId),
							`Category with id ${seat.categoryId} not found`,
						),
						tickets: seat.tickets.map((ticketId) => {
							const ticket = valOrThrow(
								rawData.tickets.find((t) => t.ticketId === ticketId),
								`Ticket with id ${ticketId} not found`,
							);
							return {
								...ticket,
								categories: ticket.categories
									.filter((ticketCategory) => ticketCategory.categoryId === seat.categoryId)
									.map((ticketCategory) => {
										const category = valOrThrow(
											rawData.categories.find((c) => c.categoryId === ticketCategory.categoryId),
											`Category with id ${ticketCategory.categoryId} not found`,
										);
										return {
											...ticketCategory,
											...category,
										};
									}),
							};
						}),
					})),
				};
				return {
					raw: rawData,
					extended: extendedData,
				};
			},
		},
	);

	return (
		<React.Fragment>
			{/* content */}
			<IndexPageContext.Provider value={{}}>
				<AppShell
					padding={0}
					header={
						<Header height={75} p="md">
							<Container size="lg" className="flex items-center gap-3">
								<span>{venueApi.data.extended.name}</span>
								<Button className="ml-auto" onClick={() => venueApi.refetch()} loading={venueApi.isRefetching}>
									Reload
								</Button>
							</Container>
						</Header>
					}
					styles={{
						main: {
							backgroundColor: 'rgba(0,0,0,0.05)',
							paddingBottom: '0 !important',
						},
					}}
				>
					<React.Fragment>
						{/* main container */}
						<SeatingMapProvider data={venueApi.data.raw} dataExtended={venueApi.data.extended}>
							{/* seating map */}
							<SeatingMap width={width} height={height - 75} minScaleFactor={1.5} maxScaleFactor={0.1} />
						</SeatingMapProvider>
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
