export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  isVerified: boolean;
  profilePicture: string;
  status: "active" | "pending_approval" | "inactive";
  age: number;
  createdAt: string;
  updatedAt: string;
  userRoles: { roleId: string; role: { slug: string; name: string } }[];
}

export interface BankAccount {
  id: string;
  ownerId: string;
  accountNumber: string;
  balance: number;
  status: "Active" | "Inactive" | "Dormant" | "Frozen";
  type: "saving" | "fixed" | "checking";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  owner: { firstName: string; lastName: string; email: string; nationalId: string };
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer";
  fromAccount: string | null;
  toAccount: string | null;
  performedBy: string;
  amount: number;
  reference: string;
  status: "completed" | "failed" | "pending";
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  fee: number;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  receiverId: string;
  senderId: string | null;
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: "usr_01_jean_pierre",
    firstName: "Jean Pierre",
    lastName: "Habimana",
    email: "jean.pierre@banka.rw",
    phoneNumber: "+250788123456",
    nationalId: "1199506123456789",
    isVerified: true,
    profilePicture: "https://i.pravatar.cc/150?img=12",
    status: "active",
    age: 30,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-04-01T08:32:00.000Z",
    userRoles: [{ roleId: "role_client_uuid_001", role: { slug: "client", name: "Client" } }],
  },
  {
    id: "usr_02_amina_uwase",
    firstName: "Amina",
    lastName: "Uwase",
    email: "amina.uwase@banka.rw",
    phoneNumber: "+250722987654",
    nationalId: "1198812987654321",
    isVerified: true,
    profilePicture: "https://i.pravatar.cc/150?img=25",
    status: "active",
    age: 37,
    createdAt: "2025-11-01T08:00:00.000Z",
    updatedAt: "2026-04-01T07:55:00.000Z",
    userRoles: [{ roleId: "role_cashier_uuid_002", role: { slug: "cashier", name: "Cashier" } }],
  },
  {
    id: "usr_03_eric_nkuru",
    firstName: "Eric",
    lastName: "Nkurunziza",
    email: "eric.nkurunziza@banka.rw",
    phoneNumber: "+250733456789",
    nationalId: "1199001456789012",
    isVerified: true,
    profilePicture: "https://i.pravatar.cc/150?img=33",
    status: "active",
    age: 36,
    createdAt: "2025-09-15T08:00:00.000Z",
    updatedAt: "2026-04-01T06:45:00.000Z",
    userRoles: [{ roleId: "role_manager_uuid_003", role: { slug: "manager", name: "Manager" } }],
  },
  {
    id: "usr_04_marie_ingabire",
    firstName: "Marie Claire",
    lastName: "Ingabire",
    email: "marie.ingabire@banka.rw",
    phoneNumber: "+250788765432",
    nationalId: "1200203765432109",
    isVerified: false,
    profilePicture: "https://i.pravatar.cc/150?img=47",
    status: "pending_approval",
    age: 24,
    createdAt: "2026-03-28T11:00:00.000Z",
    updatedAt: "2026-03-28T11:00:00.000Z",
    userRoles: [{ roleId: "role_client_uuid_001", role: { slug: "client", name: "Client" } }],
  },
  {
    id: "usr_05_claude_mugisha",
    firstName: "Claude",
    lastName: "Mugisha",
    email: "claude.mugisha@banka.rw",
    phoneNumber: "+250799334455",
    nationalId: "1199710334455667",
    isVerified: true,
    profilePicture: "https://i.pravatar.cc/150?img=58",
    status: "inactive",
    age: 28,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-03-15T12:00:00.000Z",
    userRoles: [{ roleId: "role_client_uuid_001", role: { slug: "client", name: "Client" } }],
  },
];

export const mockAccounts: BankAccount[] = [
  {
    id: "acc_01_jean_saving",
    ownerId: "usr_01_jean_pierre",
    accountNumber: "2026456812345678",
    balance: 2450000.0,
    status: "Active",
    type: "saving",
    createdBy: "usr_03_eric_nkuru",
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-04-01T08:32:00.000Z",
    owner: { firstName: "Jean Pierre", lastName: "Habimana", email: "jean.pierre@banka.rw", nationalId: "1199506123456789" },
  },
  {
    id: "acc_02_jean_fixed",
    ownerId: "usr_01_jean_pierre",
    accountNumber: "2026678912345699",
    balance: 5000000.0,
    status: "Active",
    type: "fixed",
    createdBy: "usr_03_eric_nkuru",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    owner: { firstName: "Jean Pierre", lastName: "Habimana", email: "jean.pierre@banka.rw", nationalId: "1199506123456789" },
  },
  {
    id: "acc_03_marie_saving",
    ownerId: "usr_04_marie_ingabire",
    accountNumber: "2026109876543210",
    balance: 0.0,
    status: "Inactive",
    type: "saving",
    createdBy: "usr_03_eric_nkuru",
    createdAt: "2026-03-28T11:30:00.000Z",
    updatedAt: "2026-03-28T11:30:00.000Z",
    owner: { firstName: "Marie Claire", lastName: "Ingabire", email: "marie.ingabire@banka.rw", nationalId: "1200203765432109" },
  },
  {
    id: "acc_04_claude_saving",
    ownerId: "usr_05_claude_mugisha",
    accountNumber: "2026334455667788",
    balance: 150000.0,
    status: "Dormant",
    type: "saving",
    createdBy: "usr_02_amina_uwase",
    createdAt: "2026-02-05T08:00:00.000Z",
    updatedAt: "2026-02-28T08:00:00.000Z",
    owner: { firstName: "Claude", lastName: "Mugisha", email: "claude.mugisha@banka.rw", nationalId: "1199710334455667" },
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "txn_01",
    type: "deposit",
    fromAccount: null,
    toAccount: "acc_01_jean_saving",
    performedBy: "usr_02_amina_uwase",
    amount: 500000.0,
    reference: "TXN-20260315-D001AB",
    status: "completed",
    description: "Cash deposit at Kigali branch counter",
    balanceBefore: 1950000.0,
    balanceAfter: 2450000.0,
    currency: "RWF",
    fee: 0.0,
    createdAt: "2026-03-15T10:30:00.000Z",
    updatedAt: "2026-03-15T10:30:00.000Z",
  },
  {
    id: "txn_02",
    type: "withdraw",
    fromAccount: "acc_01_jean_saving",
    toAccount: null,
    performedBy: "usr_02_amina_uwase",
    amount: 200000.0,
    reference: "TXN-20260320-W002CD",
    status: "completed",
    description: "Cash withdrawal — school fees payment",
    balanceBefore: 2650000.0,
    balanceAfter: 2450000.0,
    currency: "RWF",
    fee: 0.0,
    createdAt: "2026-03-20T14:15:00.000Z",
    updatedAt: "2026-03-20T14:15:00.000Z",
  },
  {
    id: "txn_03",
    type: "transfer",
    fromAccount: "acc_01_jean_saving",
    toAccount: "acc_02_jean_fixed",
    performedBy: "usr_01_jean_pierre",
    amount: 1000000.0,
    reference: "TXN-20260325-T003EF",
    status: "completed",
    description: "Transfer to fixed deposit account",
    balanceBefore: 3450000.0,
    balanceAfter: 2450000.0,
    currency: "RWF",
    fee: 0.0,
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "txn_04",
    type: "deposit",
    fromAccount: null,
    toAccount: "acc_04_claude_saving",
    performedBy: "usr_02_amina_uwase",
    amount: 150000.0,
    reference: "TXN-20260205-D004GH",
    status: "completed",
    description: "Initial account opening deposit",
    balanceBefore: 0.0,
    balanceAfter: 150000.0,
    currency: "RWF",
    fee: 0.0,
    createdAt: "2026-02-05T08:30:00.000Z",
    updatedAt: "2026-02-05T08:30:00.000Z",
  },
  {
    id: "txn_05",
    type: "withdraw",
    fromAccount: "acc_01_jean_saving",
    toAccount: null,
    performedBy: "usr_02_amina_uwase",
    amount: 100000.0,
    reference: "TXN-20260401-W005IJ",
    status: "failed",
    description: "ATM withdrawal — system timeout",
    balanceBefore: 2450000.0,
    balanceAfter: 2450000.0,
    currency: "RWF",
    fee: 0.0,
    failureReason: "Network timeout during processing",
    createdAt: "2026-04-01T07:45:00.000Z",
    updatedAt: "2026-04-01T07:45:00.000Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif_01",
    type: "DEPOSIT_RECEIVED",
    title: "Deposit Received",
    message: "A deposit of RWF 500,000 has been credited to your account.",
    isRead: true,
    readAt: "2026-03-15T11:00:00.000Z",
    metadata: { transactionId: "txn_01", accountId: "acc_01_jean_saving", amount: 500000 },
    receiverId: "usr_01_jean_pierre",
    senderId: null,
    createdAt: "2026-03-15T10:30:00.000Z",
  },
  {
    id: "notif_02",
    type: "WITHDRAWAL_PROCESSED",
    title: "Withdrawal Processed",
    message: "A withdrawal of RWF 200,000 has been debited from your account.",
    isRead: true,
    readAt: "2026-03-20T15:00:00.000Z",
    metadata: { transactionId: "txn_02", accountId: "acc_01_jean_saving", amount: 200000 },
    receiverId: "usr_01_jean_pierre",
    senderId: null,
    createdAt: "2026-03-20T14:15:00.000Z",
  },
  {
    id: "notif_03",
    type: "TRANSFER_SENT",
    title: "Transfer Successful",
    message: "RWF 1,000,000 transferred from your savings to fixed deposit.",
    isRead: false,
    readAt: null,
    metadata: { transactionId: "txn_03", fromAccountId: "acc_01_jean_saving", toAccountId: "acc_02_jean_fixed", amount: 1000000 },
    receiverId: "usr_01_jean_pierre",
    senderId: null,
    createdAt: "2026-03-25T09:00:00.000Z",
  },
  {
    id: "notif_04",
    type: "ACCOUNT_APPROVED",
    title: "Account Approved",
    message: "Your savings account has been approved and is now active.",
    isRead: true,
    readAt: "2026-01-12T10:00:00.000Z",
    metadata: { accountId: "acc_01_jean_saving", accountType: "saving" },
    receiverId: "usr_01_jean_pierre",
    senderId: "usr_03_eric_nkuru",
    createdAt: "2026-01-12T09:30:00.000Z",
  },
  {
    id: "notif_05",
    type: "WELCOME",
    title: "Welcome to BANKA",
    message: "Welcome, Marie Claire! Your account is pending approval.",
    isRead: false,
    readAt: null,
    metadata: null,
    receiverId: "usr_04_marie_ingabire",
    senderId: null,
    createdAt: "2026-03-28T11:00:00.000Z",
  },
];

export const formatCurrency = (amount: number, currency = "RWF") => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active" || s === "completed") return "badge-active";
  if (s === "pending" || s === "pending_approval") return "badge-pending";
  if (s === "inactive" || s === "frozen" || s === "failed") return "badge-inactive";
  return "badge-dormant";
};

export const getUserById = (id: string) => mockUsers.find((u) => u.id === id);
export const getAccountById = (id: string) => mockAccounts.find((a) => a.id === id);
export const getAccountsByOwner = (ownerId: string) => mockAccounts.filter((a) => a.ownerId === ownerId);
export const getTransactionsByAccount = (accountId: string) =>
  mockTransactions.filter((t) => t.fromAccount === accountId || t.toAccount === accountId);
