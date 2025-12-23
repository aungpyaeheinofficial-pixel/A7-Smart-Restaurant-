import { StaffRole } from '../types';

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

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
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
  Kitchen: [
    'view_kitchen',
    'manage_kitchen',
    'view_orders',
  ],
  Cashier: [
    'view_dashboard',
    'view_pos',
    'create_order',
    'view_orders',
    'view_reports',
    'export_data',
  ],
};

// Menu item permissions mapping
export const MENU_ITEM_PERMISSIONS: Record<string, Permission> = {
  '/app': 'view_dashboard',
  '/app/pos': 'view_pos',
  '/app/orders': 'view_orders',
  '/app/kitchen': 'view_kitchen',
  '/app/tables': 'view_tables',
  '/app/menu': 'view_menu',
  '/app/inventory': 'view_inventory',
  '/app/staff': 'view_staff',
  '/app/reports': 'view_reports',
  '/app/settings': 'view_settings',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: StaffRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: StaffRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: StaffRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get human-readable permission description
 */
export function getPermissionDescription(permission: Permission): string {
  const descriptions: Record<Permission, string> = {
    'view_dashboard': 'View dashboard and analytics',
    'view_pos': 'Access POS terminal',
    'create_order': 'Create new orders',
    'view_orders': 'View order history',
    'manage_orders': 'Modify and manage orders',
    'view_kitchen': 'View kitchen display system',
    'manage_kitchen': 'Manage kitchen orders and status',
    'view_tables': 'View table status',
    'manage_tables': 'Modify table layout and status',
    'view_menu': 'View menu items',
    'manage_menu': 'Add, edit, and delete menu items',
    'view_inventory': 'View inventory levels',
    'manage_inventory': 'Modify inventory items',
    'view_staff': 'View staff members',
    'manage_staff': 'Add, edit, and manage staff',
    'view_reports': 'View reports and analytics',
    'manage_reports': 'Generate and manage reports',
    'view_settings': 'View system settings',
    'manage_settings': 'Modify system settings',
    'export_data': 'Export data and reports',
    'manage_restaurant': 'Full restaurant management access',
  };
  return descriptions[permission] || permission.replace(/_/g, ' ');
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: StaffRole): string {
  const names: Record<StaffRole, string> = {
    'Manager': 'Manager',
    'Server': 'Server',
    'Kitchen': 'Kitchen Staff',
    'Cashier': 'Cashier',
  };
  return names[role] || role;
}

