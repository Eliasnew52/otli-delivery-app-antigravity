export type UserRole = 'admin' | 'client' | 'driver';

export const ROLES: { label: string; value: UserRole; icon: string }[] = [
  { label: 'Client', value: 'client', icon: '🛒' },
  { label: 'Driver', value: 'driver', icon: '🚗' },
  { label: 'Admin', value: 'admin', icon: '⚙️' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  client: 'Client',
  driver: 'Driver',
};
