
import { MenuItem, Category, Order, Table, InventoryItem, StaffMember, Restaurant, SystemSettings } from '../types';

// Initial Mock Data
export const initialRestaurant: Restaurant = {
  id: 'r1',
  name: 'A7 Grill & Bar',
  timezone: 'Pacific Time (PT)',
  currency: 'USD',
  email: 'hello@a7grill.com',
  phone: '+1 (555) 123-4567',
  address: '123 Tech Lane, Silicon Valley, CA'
};

export const initialSettings: SystemSettings = {
  taxRate: 8.0,
  currencySymbol: '$',
  autoClockOut: true,
  pinLength: 4,
  primaryColor: '#E63946',
  enableKitchenAudio: true,
  kdsRefreshRate: 5
};

export const initialCategories: Category[] = [
  { id: 'cat1', name: 'Burgers', icon: '🍔' },
  { id: 'cat2', name: 'Salads', icon: '🥗' },
  { id: 'cat3', name: 'Pizza', icon: '🍕' },
  { id: 'cat4', name: 'Beverages', icon: '☕' },
  { id: 'cat5', name: 'Desserts', icon: '🍰' },
];

export const initialMenuItems: MenuItem[] = [
  { id: 'item1', categoryId: 'cat1', name: 'Classic Burger', description: 'Juicy beef patty with lettuce and tomato', prices: [{ size: 'Standard', amount: 12.99 }], cost: 4.50, taxRate: 0.08, active: true, is86d: false, image: 'https://picsum.photos/seed/burger/400/300' },
  { id: 'item2', categoryId: 'cat2', name: 'Caesar Salad', description: 'Crisp romaine with parmesan and croutons', prices: [{ size: 'Regular', amount: 9.50 }, { size: 'Large', amount: 13.50 }], cost: 2.75, taxRate: 0.08, active: true, is86d: false, image: 'https://picsum.photos/seed/salad/400/300' },
  { id: 'item3', categoryId: 'cat3', name: 'Margherita Pizza', description: 'Fresh basil, mozzarella, and tomato sauce', prices: [{ size: '12"', amount: 14.00 }, { size: '16"', amount: 18.50 }], cost: 3.20, taxRate: 0.08, active: true, is86d: false, image: 'https://picsum.photos/seed/pizza/400/300' },
  { id: 'item4', categoryId: 'cat4', name: 'Iced Latte', description: 'Espresso with cold milk and ice', prices: [{ size: '12oz', amount: 4.50 }, { size: '16oz', amount: 5.50 }], cost: 0.85, taxRate: 0.08, active: true, is86d: false, image: 'https://picsum.photos/seed/latte/400/300' },
  { id: 'item5', categoryId: 'cat5', name: 'Chocolate Cake', description: 'Rich triple chocolate decadence', prices: [{ size: 'Slice', amount: 7.99 }], cost: 1.50, taxRate: 0.08, active: true, is86d: false, image: 'https://picsum.photos/seed/cake/400/300' },
];

export const initialTables: Table[] = [
  { id: 'T1', label: 'T1', capacity: 4, status: 'seated', serverId: 'staff1', currentOrderId: 'order-123', x: 50, y: 50 },
  { id: 'T2', label: 'T2', capacity: 2, status: 'vacant', x: 350, y: 50 },
  { id: 'T3', label: 'T3', capacity: 6, status: 'served', serverId: 'staff2', currentOrderId: 'order-124', x: 50, y: 300 },
  { id: 'T4', label: 'T4', capacity: 4, status: 'cleaning', x: 350, y: 300 },
];

export const initialStaff: StaffMember[] = [
  { id: 'staff1', name: 'Ko Kyaw', role: 'Manager', isActive: true, avatar: 'https://i.pravatar.cc/150?u=kokyaw', lastClockIn: new Date() },
  { id: 'staff2', name: 'Mike Ross', role: 'Server', isActive: true, avatar: 'https://i.pravatar.cc/150?u=mike', lastClockIn: new Date() },
  { id: 'staff3', name: 'John Doe', role: 'Kitchen', isActive: true, avatar: 'https://i.pravatar.cc/150?u=john' },
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv1', name: 'Beef Patties', sku: 'BP-001', onHand: 45, parLevel: 20, unit: 'pcs', unitCost: 1.50, status: 'In Stock' },
  { id: 'inv2', name: 'Brioche Buns', sku: 'BB-001', onHand: 12, parLevel: 25, unit: 'pcs', unitCost: 0.45, status: 'Low Stock' },
  { id: 'inv3', name: 'Tomato Sauce', sku: 'TS-001', onHand: 0, parLevel: 5, unit: 'gallons', unitCost: 12.00, status: 'Out of Stock' },
  { id: 'inv4', name: 'Romaine Lettuce', sku: 'RL-001', onHand: 20, parLevel: 10, unit: 'lbs', unitCost: 2.20, status: 'In Stock' },
  { id: 'inv5', name: 'Parmesan', sku: 'PM-001', onHand: 15, parLevel: 5, unit: 'lbs', unitCost: 8.50, status: 'In Stock' },
];

export const initialOrders: Order[] = [
  {
    id: 'order-123',
    orderNumber: 'A101',
    type: 'dine-in',
    tableId: 'T1',
    status: 'preparing',
    items: [{ id: 'oi1', menuItemId: 'item1', name: 'Classic Burger', qty: 2, unitPrice: 12.99 }],
    subtotal: 25.98,
    tax: 2.08,
    tip: 5.00,
    total: 33.06,
    createdAt: new Date(),
  },
  {
    id: 'order-124',
    orderNumber: 'A102',
    type: 'dine-in',
    tableId: 'T3',
    status: 'served',
    items: [{ id: 'oi2', menuItemId: 'item3', name: 'Margherita Pizza', qty: 1, unitPrice: 14.00 }],
    subtotal: 14.00,
    tax: 1.12,
    tip: 3.00,
    total: 18.12,
    createdAt: new Date(Date.now() - 3600000),
  }
];

class Store {
  restaurant = { ...initialRestaurant };
  settings = { ...initialSettings };
  categories = [...initialCategories];
  menuItems = [...initialMenuItems];
  tables = [...initialTables];
  staff = [...initialStaff];
  inventory = [...initialInventory];
  orders = [...initialOrders];

  updateRestaurant(updates: Partial<Restaurant>) {
    this.restaurant = { ...this.restaurant, ...updates };
  }

  updateSettings(updates: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...updates };
  }

  addCategory(category: Category) {
    this.categories.push(category);
  }

  addOrder(order: Order) {
    this.orders.push(order);
  }

  addInventoryItem(item: InventoryItem) {
    const status: InventoryItem['status'] = item.onHand <= 0 ? 'Out of Stock' : item.onHand <= item.parLevel ? 'Low Stock' : 'In Stock';
    this.inventory.push({ ...item, status });
  }

  bulkAddInventoryItems(items: InventoryItem[]) {
    const processedItems: InventoryItem[] = items.map(item => {
      const status: InventoryItem['status'] = item.onHand <= 0 ? 'Out of Stock' : item.onHand <= item.parLevel ? 'Low Stock' : 'In Stock';
      return { ...item, status };
    });
    this.inventory = [...this.inventory, ...processedItems];
  }

  updateOrder(id: string, updates: Partial<Order>) {
    this.orders = this.orders.map(o => o.id === id ? { ...o, ...updates } : o);
  }

  updateTable(id: string, updates: Partial<Table>) {
    this.tables = this.tables.map(t => t.id === id ? { ...t, ...updates } : t);
  }

  bulkUpdateTables(updatedTables: Table[]) {
    this.tables = updatedTables;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>) {
    this.menuItems = this.menuItems.map(item => item.id === id ? { ...item, ...updates } : item);
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    this.inventory = this.inventory.map(item => {
      if (item.id === id) {
        const newItem = { ...item, ...updates };
        const status: InventoryItem['status'] = newItem.onHand <= 0 ? 'Out of Stock' : newItem.onHand <= newItem.parLevel ? 'Low Stock' : 'In Stock';
        return { ...newItem, status };
      }
      return item;
    });
  }

  addStaffMember(member: StaffMember) {
    this.staff.push(member);
  }

  updateStaffMember(id: string, updates: Partial<StaffMember>) {
    this.staff = this.staff.map(member => member.id === id ? { ...member, ...updates } : member);
  }

  getDashboardStats() {
    return {
      todayOrders: this.orders.length,
      revenue: this.orders.reduce((acc, o) => acc + o.total, 0),
      activeTables: this.tables.filter(t => t.status !== 'vacant').length,
      kitchenOrders: this.orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
      inventoryAlerts: this.inventory.filter(i => i.status !== 'In Stock').length,
      staffOnDuty: this.staff.filter(s => s.isActive).length,
      revenueGrowth: 12.5,
    };
  }
}

export const storeInstance = new Store();
