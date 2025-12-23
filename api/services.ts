
import { storeInstance } from './store';
import { Order, OrderStatus, MenuItem, InventoryItem, StaffMember, Category, Table, Restaurant, SystemSettings } from '../types';

const LATENCY = 200;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getDashboardStats: async () => {
    await wait(LATENCY);
    return storeInstance.getDashboardStats();
  },

  getRestaurant: async () => {
    await wait(LATENCY);
    return storeInstance.restaurant;
  },

  getSettings: async () => {
    await wait(LATENCY);
    return storeInstance.settings;
  },

  updateRestaurant: async (updates: Partial<Restaurant>) => {
    await wait(LATENCY);
    storeInstance.updateRestaurant(updates);
    return true;
  },

  updateSettings: async (updates: Partial<SystemSettings>) => {
    await wait(LATENCY);
    storeInstance.updateSettings(updates);
    return true;
  },

  getMenu: async () => {
    await wait(LATENCY);
    return {
      categories: storeInstance.categories,
      items: storeInstance.menuItems,
    };
  },

  createCategory: async (category: Category) => {
    await wait(LATENCY);
    storeInstance.addCategory(category);
    return true;
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
    await wait(LATENCY);
    storeInstance.updateMenuItem(id, updates);
    return true;
  },

  getTables: async () => {
    await wait(LATENCY);
    return storeInstance.tables;
  },

  updateTables: async (tables: Table[]) => {
    await wait(LATENCY);
    storeInstance.bulkUpdateTables(tables);
    return true;
  },

  getOrders: async () => {
    await wait(LATENCY);
    return storeInstance.orders;
  },

  createOrder: async (order: Order) => {
    await wait(LATENCY);
    storeInstance.addOrder(order);
    if (order.tableId) {
      storeInstance.updateTable(order.tableId, { 
        status: 'seated', 
        currentOrderId: order.id 
      });
    }
    return order;
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    await wait(LATENCY);
    storeInstance.updateOrder(id, { status });
    const order = storeInstance.orders.find(o => o.id === id);
    if (order?.tableId) {
      if (status === 'served') storeInstance.updateTable(order.tableId, { status: 'served' });
      if (status === 'paid') storeInstance.updateTable(order.tableId, { status: 'cleaning', currentOrderId: undefined });
    }
    return true;
  },

  getInventory: async () => {
    await wait(LATENCY);
    return storeInstance.inventory;
  },

  createInventoryItem: async (item: InventoryItem) => {
    await wait(LATENCY);
    storeInstance.addInventoryItem(item);
    return true;
  },

  bulkCreateInventoryItems: async (items: InventoryItem[]) => {
    await wait(LATENCY);
    storeInstance.bulkAddInventoryItems(items);
    return true;
  },

  updateInventoryItem: async (id: string, updates: Partial<InventoryItem>) => {
    await wait(LATENCY);
    storeInstance.updateInventoryItem(id, updates);
    return true;
  },

  getStaff: async () => {
    await wait(LATENCY);
    return storeInstance.staff;
  },

  clockStaff: async (staffId: string) => {
    await wait(LATENCY);
    const member = storeInstance.staff.find(s => s.id === staffId);
    if (member) {
      const isActive = !member.isActive;
      storeInstance.updateStaffMember(staffId, {
        isActive,
        lastClockIn: isActive ? new Date() : member.lastClockIn
      });
    }
    return true;
  },

  createStaff: async (member: StaffMember) => {
    await wait(LATENCY);
    storeInstance.addStaffMember(member);
    return true;
  },

  updateStaff: async (staffId: string, updates: Partial<StaffMember>) => {
    await wait(LATENCY);
    storeInstance.updateStaffMember(staffId, updates);
    return true;
  }
};
