// Create a shared state file that can be used by both contexts
// This avoids circular dependencies between auth-context and wallet-context

// User Type
export interface User {
  id: number;
  username: string;
  email: string;
  walletAddress?: string;
}

// Balance Type
export interface UserBalance {
  id: number;
  userId: number;
  currency: string;
  amount: number;
  updatedAt: string;
}

// Shared state between contexts
export interface SharedState {
  isAuthenticated: boolean;
  user: User | null;
}

// Create an initial state
export const initialSharedState: SharedState = {
  isAuthenticated: false,
  user: null
};