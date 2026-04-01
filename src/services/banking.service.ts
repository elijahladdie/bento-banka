import { mockAccounts, mockNotifications, mockTransactions, mockUsers } from "@/data/mockData";

export function getClientAccounts(userId?: string) {
  return mockAccounts.filter((account) => account.ownerId === userId);
}

export function getActiveClientAccounts(userId?: string) {
  return mockAccounts.filter((account) => account.ownerId === userId && account.status === "Active");
}

export function getClientNotifications(userId?: string) {
  return mockNotifications.filter((notification) => notification.receiverId === userId);
}

export function getClientRecentTransactions(userId?: string) {
  const clientAccounts = getClientAccounts(userId);
  return mockTransactions
    .filter((txn) => clientAccounts.some((account) => account.id === txn.fromAccount || account.id === txn.toAccount))
    .slice(0, 5);
}

export function searchClientUsers(search: string) {
  const normalized = search.toLowerCase();
  return mockUsers.filter(
    (user) =>
      user.userRoles.some((role) => role.role.slug === "client") &&
      `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(normalized)
  );
}
