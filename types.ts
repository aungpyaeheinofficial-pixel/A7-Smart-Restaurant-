
export interface Restaurant {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  email: string;
  phone: string;
  address: string;
}

export interface SystemSettings {
  taxRate: number;
  currencySymbol: string;
  autoClockOut: boolean;
  pinLength: number;
  primaryColor: string;
  enableKitchenAudio: boolean;
  kdsRefreshRate: number;
}

export interface ModifierOption {
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  options: ModifierOption[];
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  prices: { size: string; amount: number }[];
  cost?: number; 
  image?: string;
  taxRate: number;
  active: boolean;
  is86d: boolean;
  recipe?: RecipeIngredient[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  modifiers?: { name: string; priceDelta: number }[];
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid';

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine-in' | 'takeout' | 'delivery';
  tableId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  createdAt: Date;
}

export type TableStatus = 'vacant' | 'seated' | 'served' | 'cleaning';

export interface Table {
  id: string;
  label: string;
  capacity: number;
  status: TableStatus;
  serverId?: string;
  currentOrderId?: string;
  x?: number;
  y?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  onHand: number;
  parLevel: number;
  unit: string;
  unitCost: number; // Added for recipe costing
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export type StaffRole = 'Manager' | 'Server' | 'Kitchen' | 'Cashier';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  avatar: string;
  lastClockIn?: Date;
}

export interface DashboardStats {
  todayOrders: number;
  revenue: number;
  activeTables: number;
  kitchenOrders: number;
  inventoryAlerts: number;
  staffOnDuty: number;
  revenueGrowth: number;
}
