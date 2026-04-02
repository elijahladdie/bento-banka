/**
 * Legacy axios instance — now just re-exports apiClient for backward compat.
 */
import { apiClient } from "./api-client";

const api = apiClient;
export default api;
