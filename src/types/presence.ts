export interface Presence {
  online: boolean;
  at: number; // Unix timestamp
  name: string; // User's display name
}

export interface UserStatus {
  id: string;
  name: string;
  online: boolean;
  lastSeen: number;
}
