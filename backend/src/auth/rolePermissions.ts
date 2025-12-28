export type Permission =
  | 'view_dashboard'
  | 'view_pos'
  | 'create_order'
  | 'view_orders'
  | 'manage_orders'
  | 'view_kitchen'
  | 'manage_kitchen'
  | 'view_tables'
  | 'manage_tables'
  | 'view_menu'
  | 'manage_menu'
  | 'view_inventory'
  | 'manage_inventory'
  | 'view_staff'
  | 'manage_staff'
  | 'view_reports'
  | 'manage_reports'
  | 'view_settings'
  | 'manage_settings'
  | 'export_data'
  | 'manage_restaurant';

export type StaffRole = 'Manager' | 'Server' | 'Kitchen' | 'Cashier';

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  Manager: [
    'view_dashboard',
    'view_pos',
    'create_order',
    'view_orders',
    'manage_orders',
    'view_kitchen',
    'manage_kitchen',
    'view_tables',
    'manage_tables',
    'view_menu',
    'manage_menu',
    'view_inventory',
    'manage_inventory',
    'view_staff',
    'manage_staff',
    'view_reports',
    'manage_reports',
    'view_settings',
    'manage_settings',
    'export_data',
    'manage_restaurant',
  ],
  Server: [
    'view_dashboard',
    'view_pos',
    'create_order',
    'view_orders',
    'view_kitchen',
    'view_tables',
    'manage_tables',
    'view_menu',
  ],
  Kitchen: ['view_kitchen', 'manage_kitchen', 'view_orders'],
  Cashier: ['view_dashboard', 'view_pos', 'create_order', 'view_orders', 'view_reports', 'export_data'],
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}


