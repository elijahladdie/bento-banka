export type DbConnection = {
  connected: boolean;
};

export function getDbConnection(): DbConnection {
  return { connected: false };
}
