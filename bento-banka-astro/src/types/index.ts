export type RoleSlug = "client" | "cashier" | "manager";

export type UserStatus = "active" | "inactive" | "suspended" | "pending_approval";
export type AccountStatus = "Active" | "Inactive" | "Dormant";
export type AccountType = "saving" | "fixed";
export type TransactionType = "deposit" | "withdraw" | "transfer";
export type TransactionStatus = "completed" | "failed" | "pending" | "reversed";

export type Role = {
	id?: string;
	name?: string;
	slug: RoleSlug | string;
};

export type UserRole = {
	roleId?: string;
	role: Role;
};

export type User = {
	id: string;
	firstName: string;
	lastName?: string | null;
	email: string;
	preferredLanguage?: "en" | "fr" | "kin";
	phoneNumber?: string | null;
	nationalId?: string;
	profilePicture?: string | null;
	status: UserStatus;
	age?: number;
	createdAt: string;
	updatedAt?: string;
	userRoles: UserRole[];
};

export type Account = {
	id: string;
	ownerId: string;
	accountNumber: string;
	balance: number;
	status: AccountStatus;
	type: AccountType;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	owner?: {
		id?: string;
		firstName: string;
		lastName?: string | null;
		email: string;
		nationalId?: string;
		userRoles?: Array<{
			role?: {
				slug?: string;
			};
		}>;
	};
};

export type Transaction = {
	id: string;
	type: TransactionType;
	fromAccount: string | null;
	toAccount: string | null;
	performedBy: string;
	amount: number;
	reference: string;
	status: TransactionStatus;
	confirmationToken?: string | null;
	description: string;
	balanceBefore: number;
	balanceAfter: number;
	currency: string;
	fee: number;
	createdAt: string;
	updatedAt: string;
};

export type Notification = {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	readAt: string | null;
	userId: string;
	direction: "SENT" | "RECEIVED";
	createdAt: string;
};

export type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
};

export type ApiSuccess<T> = {
	success: boolean;
	message: string;
	data: T;
	pagination?: Pagination;
};

export type ApiError = {
	success: boolean;
	message: string;
	errors?: Array<{ field: string; message: string }>;
};

export type LoginPayload = {
	token: string;
	user: User;
};

export type StatsOverview = {
	activeUsers: number;
	totalAccounts: number;
	transactionCount: number;
	transactionVolume: number;
	pendingApprovals: number;
};

export type StatsTransactionSeries = Array<{
	type: string;
	_sum: { amount: number | null };
	_count: { id: number };
}>;

export type StatsAccountSeries = Array<{
	type: string;
	status: string;
	_count: { id: number };
}>;

export type StatsUserSeries = Array<{
	role: string;
	count: number;
}>;

export type PricingInterval = "month" | "year";

export type PricingApiResponse = {
	data: PricingProduct[];
};

export type PricingProduct = {
	id: string;
	name: string;
	description?: string | null;
	customData?: Record<string, string | undefined> | null;
	prices: PricingPrice[];
};

export type PricingPrice = {
	id: string;
	description?: string | null;
	billingCycle?: {
		interval?: PricingInterval | string;
		frequency?: number | null;
	} | null;
	trialPeriod?: {
		interval?: string;
		frequency?: number | null;
	} | null;
	unitPrice?: {
		amount?: string;
		currencyCode?: string;
	} | null;
	customData?: Record<string, string | undefined> | null;
};

export type PricingFeatureEntry = {
	name: string;
	specificInfo: string;
	title: string;
	subtitle: string;
	features: string[];
};

export type PricingPlan = {
	id: string;
	name: string;
	description: string;
	order: number;
	popular: boolean;
	featureTitle: string;
	featureSubtitle: string;
	featureInfo: string;
	features: string[];
	priceAmount: string;
	currencyCode: string;
	billingInterval: PricingInterval | string;
	billingFrequency: number;
	trialLabel: string | null;
};

export type GlassButtonProps = {
	variant?: "primary" | "secondary" | "danger" | "icon";
	loading?: boolean;
	loadingText?: string;
	fullWidth?: boolean;
	disabled?: boolean;
	class?: string;
};

export type GlassCardProps = {
	heavy?: boolean;
	padding?: "none" | "sm" | "md" | "lg";
	nohover?: boolean;
	class?: string;
};

export type SpinnerProps = {
	size?: number;
};

export type StatCardProps = {
	value: number;
	label: string;
	suffix?: string;
};

export type PricingCardProps = {
	plan: PricingPlan;
	locale: string;
	freeLabel: string;
	billedLabel: string;
	billingMonthLabel: string;
	billingYearLabel: string;
	popularLabel: string;
	trialLabel: string;
	ctaLabel: string;
};

export type PricingIslandProps = {
	locale: string;
	monthlyLabel: string;
	yearlyLabel: string;
	toggleLabel: string;
	popularLabel: string;
	trialLabel: string;
	ctaLabel: string;
	loadingTitle: string;
	loadingBody: string;
	errorTitle: string;
	errorBody: string;
	retryLabel: string;
	freeLabel: string;
	billedLabel: string;
	billingMonthLabel: string;
	billingYearLabel: string;
};

export type PricingSkeletonProps = {
	cardCount?: number;
};

export type PricingToggleProps = {
	interval?: PricingInterval;
};

export interface FormatedPlan {
  name: string;
  description: string;
  priceAmount: number;
  currencyCode: string;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
}