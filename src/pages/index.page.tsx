import {
	Alert,
	Anchor,
	AppShell,
	Button,
	Checkbox,
	Container,
	Divider,
	Header,
	PasswordInput,
	Radio,
	ScrollArea,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { ApplePaySmallLogo, MastercardSmallLogo, PaypalSmallLogo } from '@project/icons/index';
import { DefinitionItem } from '@project/lib/components/DefinitionItem';
import { LoadingOverlay } from '@project/lib/components/LoadingOverlay';
import { TicketCard } from '@project/lib/components/TicketCard';
import { apiClient } from '@project/lib/features/api-client/api-client';
import { Cart, CartTypes } from '@project/lib/features/cart/Cart';
import { CartProvider } from '@project/lib/features/cart/Cart/Cart.context';
import { useCart } from '@project/lib/features/cart/Cart/useCart';
import { useFormat } from '@project/lib/features/formatter/useFormat';
import { SeatingMap, SeatingMapTypes } from '@project/lib/features/map/SeatingMap';
import { SeatingMapProvider } from '@project/lib/features/map/SeatingMap/SeatingMap.context';
import { MultiView } from '@project/lib/features/multi-view/MultiView';
import { PageComponent, PageParams, PageQuery } from '@project/lib/features/next/next.module';
import { useApiQuery } from '@project/lib/hooks/useApiQuery';
import { useNow } from '@project/lib/hooks/useNow';
import { ExtendedComponent } from '@project/lib/types/common';
import { isDefined, isEmpty, valOrThrow } from '@project/lib/utils/common';
import { venueApiSchema } from '@project/pages/api/venue/schema';
import {
	IconArrowLeft,
	IconCheck,
	IconClock,
	IconCreditCard,
	IconHelpCircle,
	IconList,
	IconMail,
	IconPhone,
	IconUserCheck,
	TablerIconsProps,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { padStart } from 'lodash';
import { useRouter } from 'next/router';
import React, { createContext, forwardRef, FunctionComponent, ReactNode, Suspense } from 'react';
import Countdown from 'react-countdown';
import { Controller } from 'react-hook-form';

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
	const venueApi = useApiQuery(['venue', {}], async () => apiClient.get('/api/venue'), {
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
	});

	/** create cart instance */
	const cart = useCart({
		async onReservationExpired() {
			await venueApi.refetch();
		},
	});

	/** data initially loading */
	if (!isDefined(venueApi.data)) {
		return (
			<div className="relative h-screen w-screen">
				<LoadingOverlay visible overlayBlur={2} loaderProps={{ variant: 'dots' }} message="The venue is loading. Please wait..." />
			</div>
		);
	}

	return (
		<IndexPageContext.Provider value={{}}>
			{/* content */}
			<CartProvider cart={cart}>
				<SeatingMapProvider data={venueApi.data.raw} dataExtended={venueApi.data.extended}>
					<MultiView provider={cart.multiViewProvider}>
						<AppShell
							padding={0}
							header={
								<Header height={75} p="md">
									<Container size="lg" className="flex h-full items-center justify-center gap-3">
										{/* venue name */}
										<Text size="md" weight="bold" color="indigo">
											{venueApi.data.extended.name}
										</Text>

										{/* manual debug, development purposes only */}
										{false && (
											<div className="ml-auto flex items-center gap-2">
												{/* reload button */}
												<Button variant="light" onClick={() => venueApi.refetch()} loading={venueApi.isRefetching}>
													Reload venue
												</Button>

												{/* test button */}
												<Button variant="subtle" onClick={() => cart.multiViewProvider.changeView(CartTypes.TMultiView.SEATING_MAP)}>
													GOTO: Seating map
												</Button>
												<Button variant="subtle" onClick={() => cart.multiViewProvider.changeView(CartTypes.TMultiView.CHECKOUT)}>
													GOTO: Checkout
												</Button>
											</div>
										)}
									</Container>
								</Header>
							}
							styles={{
								main: {
									backgroundColor: '#F2F4F7',
									paddingBottom: '0 !important',
									position: 'relative',
								},
							}}
						>
							{/* seating map view */}
							<MultiView.View view={CartTypes.TMultiView.SEATING_MAP}>
								<div
									className="flex"
									style={{
										maxHeight: 'calc(100vh - 75px)',
										overflow: 'hidden',
									}}
								>
									{/* seating map */}
									<SeatingMap width={width} height={height - 75} minScaleFactor={2} maxScaleFactor={0.1} />
									{/* cart */}
									<Cart />
								</div>
							</MultiView.View>

							{/* checkout view */}
							<MultiView.View view={CartTypes.TMultiView.CHECKOUT}>
								<ScrollArea>
									<form
										onSubmit={cart.contactForm.handleSubmit(
											(values) => cart.createOrderHandler.handler(values),
											(errors) => {
												console.warn(errors);
											},
										)}
									>
										<Container size="lg" className="flex flex-col gap-3 py-4">
											{/* reservation alert */}
											{isDefined(cart.reservation) && (
												<Countdown
													date={cart.reservation.reservedUntil}
													renderer={({ minutes, seconds, api, milliseconds }) => {
														if (api.isCompleted()) return null;

														const isEndingWarning = minutes === 1 && seconds <= 30;
														const isEndingDanger = minutes === 0 && seconds <= 30;

														return (
															<Alert variant="filled" radius="md" color={isEndingDanger ? 'red' : isEndingWarning ? 'orange' : 'indigo.6'}>
																<div className="flex items-start gap-2">
																	<ThemeIcon variant="light" radius="md" size="xl">
																		<IconClock />
																	</ThemeIcon>
																	{/* texts */}
																	<div className="flex-grow">
																		<Text size="md" color="white" weight="bold">
																			You are nearly at the end!
																		</Text>
																		<Text size="sm" color="white" opacity="75%">
																			We have reserved your tickets but you need to finish your order in time, or we will be forced to cancel your
																			reservation.
																		</Text>
																	</div>

																	{/* countdown */}
																	<Text size="xl" className="ml-auto" weight="bold">
																		{[
																			padStart(minutes.toString(), 2, '0'),
																			padStart(seconds.toString(), 2, '0'),
																			milliseconds > 0 && padStart(milliseconds.toString(), 3, '0'),
																		]
																			.filter(Boolean)
																			.join(':')}
																	</Text>
																</div>
															</Alert>
														);
													}}
												/>
											)}

											{/* navigation */}
											<nav className="flex items-center justify-between gap-3">
												{/* back to cart button */}
												<Button
													variant="subtle"
													leftIcon={<IconArrowLeft size="1rem" />}
													onClick={() => cart.multiViewProvider.changeView(CartTypes.TMultiView.SEATING_MAP)}
												>
													Back to cart
												</Button>

												{/* cancel order button */}
												<Button
													variant="subtle"
													color="gray"
													loading={cart.clearReservationHandler.isProcessing}
													onClick={() => {
														cart.clearReservationHandler.handler().then(() => cart.multiViewProvider.changeView(CartTypes.TMultiView.SEATING_MAP));
													}}
												>
													Cancel order
												</Button>
											</nav>

											{/* checkout */}
											<div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
												{/* form card */}
												<Card className="flex flex-col gap-6 lg:col-span-2">
													{/* contact detail section */}
													<section className="flex flex-col gap-3">
														{/* heading */}
														<SectionHeading
															title="Personal Details"
															summary="Enter your contact details in order to finish your order."
															Icon={IconUserCheck}
														/>

														{/* full name */}
														<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
															{/* first name */}
															<Controller<CartTypes.ContactDetails, 'firstName'>
																name="firstName"
																control={cart.contactForm.control}
																render={({ field, fieldState }) => (
																	<TextInput label="First name" description="Enter your first name" {...field} error={fieldState.error?.message} />
																)}
															/>
															{/* last name */}
															<Controller<CartTypes.ContactDetails, 'lastName'>
																name="lastName"
																control={cart.contactForm.control}
																render={({ field, fieldState }) => (
																	<TextInput label="Last name" description="Enter your last name" {...field} error={fieldState.error?.message} />
																)}
															/>
														</div>

														{/* email + phone */}
														<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
															{/* email */}
															<Controller<CartTypes.ContactDetails, 'email'>
																name="email"
																control={cart.contactForm.control}
																render={({ field, fieldState }) => (
																	<TextInput
																		icon={<IconMail size="1rem" />}
																		label="Email address"
																		description="Enter your email address"
																		{...field}
																		error={fieldState.error?.message}
																	/>
																)}
															/>
															{/* phone */}
															<Controller<CartTypes.ContactDetails, 'phone'>
																name="phone"
																control={cart.contactForm.control}
																render={({ field, fieldState }) => (
																	<TextInput
																		icon={<IconPhone size="1rem" />}
																		label="Phone number"
																		{...field}
																		description="Enter your phone number"
																		error={fieldState.error?.message}
																	/>
																)}
															/>
														</div>

														{/* message */}
														<Controller<CartTypes.ContactDetails, 'message'>
															name="message"
															control={cart.contactForm.control}
															render={({ field, fieldState }) => (
																<Textarea
																	label="Message"
																	description="Got something to say? Leave us a message!"
																	{...field}
																	error={fieldState.error?.message}
																/>
															)}
														/>
													</section>

													{/* divider */}
													<Divider />

													{/* payment method section */}
													<section className="flex flex-col gap-3">
														{/* heading */}
														<SectionHeading
															title="Payment Method"
															summary="Choose your favorite payment method to finish the order."
															Icon={IconCreditCard}
														/>

														{/* payment method */}
														<Radio.Group
															value={cart.paymentMethod}
															onChange={(method) => cart.setPaymentMethod(method as CartTypes.PAYMENT_METHOD)}
															classNames={{
																root: 'grid grid-cols-1 gap-3',
															}}
														>
															{/* credit/debit card */}
															<RadioGroupOption
																isSelected={cart.paymentMethod === CartTypes.PAYMENT_METHOD.CREDIT_DEBIT_CARD}
																value={CartTypes.PAYMENT_METHOD.CREDIT_DEBIT_CARD}
																label="Credit/Debit Card"
																description="User your credit or debit card for the payment"
																icon={<MastercardSmallLogo className="text-xl" />}
															/>
															{/* apple pay */}
															<RadioGroupOption
																isSelected={cart.paymentMethod === CartTypes.PAYMENT_METHOD.APPLE_PAY}
																value={CartTypes.PAYMENT_METHOD.APPLE_PAY}
																label="Apple Pay"
																description="Pay using your Apple Pay wallet"
																icon={<ApplePaySmallLogo className="text-xl" />}
															/>
															{/* paypal pay */}
															<RadioGroupOption
																isSelected={cart.paymentMethod === CartTypes.PAYMENT_METHOD.PAYPAL}
																value={CartTypes.PAYMENT_METHOD.PAYPAL}
																label="PayPal"
																description="Pay using your PayPal account"
																icon={<PaypalSmallLogo className="text-xl" />}
															/>
														</Radio.Group>
													</section>
												</Card>

												{/* order summary card */}
												<Card className="flex flex-col gap-3">
													<header>
														<Text size="md" weight="bold">
															Order Summary
														</Text>
													</header>

													{/* order contents */}
													<div>
														{/* tickets */}
														{cart.cartedTickets.map((cartedTicket) => (
															<OrderSummaryItem
																key={cartedTicket.cartedTicketId}
																quantity={1}
																price={format.formatPrice(cart.getCartedTicketPrice(cartedTicket), 'CZK')}
																label={
																	<span>
																		{/* ticket name */}
																		<span>{cartedTicket.ticket.name}</span>
																		{/* seat details */}
																		{isDefined(cartedTicket.seat) && (
																			<span> ({[cartedTicket.seat.category.name, cartedTicket.seat.fullName].join(', ')})</span>
																		)}
																	</span>
																}
															/>
														))}
														{/* subtotal */}
														<OrderSummaryItem label="Subtotal" price={format.formatPrice(cart.cartTotal, 'CZK')} />
														{/* service fees */}
														<OrderSummaryItem label="Service Fees" price={format.formatPrice(0, 'CZK')} />
													</div>

													{/* divider */}
													<Divider />

													{/* pay button */}
													<Button type="submit" disabled={!cart.contactForm.formState.isValid} loading={cart.contactForm.formState.isSubmitting}>
														Pay {format.formatPrice(cart.cartTotal, 'CZK')}
													</Button>

													{/* terms checkbox */}
													<Controller<CartTypes.ContactDetails, 'acceptTerms'>
														name="acceptTerms"
														control={cart.contactForm.control}
														render={({ field, fieldState }) => (
															<Checkbox
																label={
																	<Text size="xs" color="dimmed">
																		I have read and accept the <Anchor href="#">Terms and Conditions</Anchor> and{' '}
																		<Anchor href="#">Privacy Policy</Anchor>.
																	</Text>
																}
																{...field}
																value={field.value.toString()}
																onChange={(e) => field.onChange(e.target.checked)}
																error={fieldState.error?.message}
															/>
														)}
													/>
												</Card>
											</div>
										</Container>
									</form>
								</ScrollArea>
							</MultiView.View>

							{/* order result view */}
							<MultiView.View view={CartTypes.TMultiView.ORDER_RESULT}>
								{isDefined(cart.createOrderHandler.result) && (
									<Container size="lg" className="flex flex-col gap-3 py-4">
										{/* success alert */}
										<Alert variant="filled" radius="md" color="indigo.6">
											<div className="flex items-start gap-2">
												<ThemeIcon variant="light" radius="md" size="xl">
													<IconCheck />
												</ThemeIcon>
												{/* texts */}
												<div className="flex-grow">
													<Text size="md" color="white" weight="bold">
														Thank you for your payment
													</Text>
													<Text size="sm" color="white" opacity="75%">
														The payment was successful, you can find tickets on your email. See order details below for more information
													</Text>
												</div>

												{/* download PDF button */}
												<Button className="ml-auto" disabled variant="white">
													Download PDF
												</Button>
											</div>
										</Alert>

										{/* cards */}
										<div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
											{/* form card */}
											<Card className="flex flex-col gap-6 lg:col-span-2">
												{/* contact detail section */}
												<section className="flex flex-col gap-3">
													{/* heading */}
													<SectionHeading title="Order Details" summary="Here you can find details of the order." Icon={IconList} />

													{/* order details */}
													<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
														{/* order number */}
														<DefinitionItem label="Order Number">{cart.createOrderHandler.result.orderNumber}</DefinitionItem>
														{/* order status */}
														<DefinitionItem label="Status">{cart.createOrderHandler.result.status}</DefinitionItem>
														{/* order created */}
														<DefinitionItem label="Created">{format.formatDate(cart.createOrderHandler.result.created, 'PPp')}</DefinitionItem>
														{/* total amount */}
														<DefinitionItem label="Total Amount">{format.formatPrice(cart.createOrderHandler.result.amount, 'CZK')}</DefinitionItem>
														{/* payment method */}
														<DefinitionItem label="Payment Method">{cart.createOrderHandler.result.paymentMethod}</DefinitionItem>
														{/* paid */}
														<DefinitionItem label="Paid">{format.formatDate(cart.createOrderHandler.result.paid, 'PPp')}</DefinitionItem>
														{/* tickets */}
														<DefinitionItem className="lg:col-span-3" label="Tickets">
															<div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
																{cart.createOrderHandler.result.tickets.map((ticket) => (
																	<TicketCard key={ticket.cartedTicketId} cartedTicket={ticket} price={cart.getCartedTicketPrice(ticket)} />
																))}
															</div>
														</DefinitionItem>
													</div>
												</section>
											</Card>

											{/* account create card */}
											<Card className="flex flex-col gap-3">
												<header>
													<Text size="md" weight="bold">
														Access this later?
													</Text>
													<Text size="sm" color="dimmed">
														Enter a password below to create an account. Keep track of your orders and access your tickets at any time.
													</Text>
												</header>

												{/* password field */}
												<div>
													<PasswordInput disabled rightSection={<IconHelpCircle size="0.75rem" />} />
													<Text size="xs" color="dimmed">
														8 characters minimum
													</Text>
												</div>

												{/* create account button */}
												<Button fullWidth disabled>
													Create Account
												</Button>
											</Card>
										</div>
									</Container>
								)}
							</MultiView.View>

							{/* order processing overlay */}
							<LoadingOverlay
								visible={cart.createOrderHandler.isProcessing}
								overlayBlur={2}
								loaderProps={{ variant: 'dots', size: 'lg' }}
								message="Your order is being processed. Please wait..."
							/>
						</AppShell>
					</MultiView>
				</SeatingMapProvider>
			</CartProvider>
		</IndexPageContext.Provider>
	);
};
/**
 * Page display name
 * @type {string}
 */
IndexPage.displayName = '@project/pages/Index';

type OrderSummaryItemProps = ExtendedComponent<
	{
		quantity?: number;
		label: ReactNode;
		price: ReactNode;
	},
	'div'
>;
const OrderSummaryItem: FunctionComponent<OrderSummaryItemProps> = ({ label, quantity, price, className, children, ...props }) => {
	const format = useFormat();
	return (
		<div className={clsx('flex items-start justify-between gap-3', className)} {...props}>
			{/* ticket */}
			<Text size="sm" color="dimmed" truncate="end">
				{/* count */}
				{isDefined(quantity) && (
					<React.Fragment>
						<span>{format.formatNumber(quantity)}&times;</span>{' '}
					</React.Fragment>
				)}
				{/* ticket name */}
				{label}
			</Text>

			{/* price */}
			<Text size="sm" weight="bold">
				{price}
			</Text>
		</div>
	);
};

type CardProps = ExtendedComponent<{}, 'div'>;
const Card: FunctionComponent<CardProps> = ({ className, children, ...props }) => (
	<div className={clsx('rounded-lg border border-gray-200 bg-white p-3 shadow-md shadow-gray-100', className)} {...props}>
		{children}
	</div>
);

type TablerIcon = (props: TablerIconsProps) => JSX.Element;
type SectionHeadingProps = ExtendedComponent<
	{
		title: ReactNode;
		summary: ReactNode;
		Icon: TablerIcon;
	},
	'header'
>;
const SectionHeading: FunctionComponent<SectionHeadingProps> = ({ title, summary, Icon, className, children, ...props }) => (
	<header className={clsx('flex items-start gap-3', className)} {...props}>
		{/* icon */}
		<ThemeIcon className="mt-1" variant="light" radius="sm" size="lg">
			<Icon size="1.25rem" />
		</ThemeIcon>
		{/* texts */}
		<div>
			<Text size="md" weight="bold">
				{title}
			</Text>
			<Text size="sm" color="gray.6">
				{summary}
			</Text>
		</div>
	</header>
);

type RadioGroupOptionProps = ExtendedComponent<
	{
		icon?: ReactNode;
		isSelected?: boolean;
	},
	typeof Radio
>;
const RadioGroupOption = forwardRef<any, RadioGroupOptionProps>(({ isSelected, icon, description, label, className, children, ...props }, ref) => (
	<Radio
		ref={ref}
		value={CartTypes.PAYMENT_METHOD.CREDIT_DEBIT_CARD}
		classNames={{
			root: clsx('flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer', isSelected && 'bg-indigo-50 border-indigo-500'),
			body: 'flex w-full',
			labelWrapper: 'w-full',
		}}
		/** @ts-ignore */
		styles={{
			labelWrapper: {
				order: '0 !important',
			},
			label: {
				paddingLeft: '0 !important',
				cursor: 'pointer !important',
			},
		}}
		label={
			<div className="flex items-start gap-2">
				{/* icon */}
				{isDefined(icon) && (
					<ThemeIcon color="gray" size="lg" radius="sm" variant="outline">
						{icon}
					</ThemeIcon>
				)}
				{/* text */}
				<div>
					{/* label */}
					<Text size="sm">{label}</Text>
					{/* description */}
					{!isEmpty(description) && (
						<Text size="xs" color="gray">
							{description}
						</Text>
					)}
				</div>
			</div>
		}
		{...props}
	/>
));

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
export default () => (
	<Suspense fallback={<span>nloading...</span>}>
		<IndexPage />
	</Suspense>
);
