
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api/services';
import { Order, MenuItem, Table, StaffMember, InventoryItem, Category, Restaurant, SystemSettings } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotificationMonitor } from './hooks/useNotificationMonitor';

interface GlobalState {
  currentUser: { id: string; role: string; name: string };
  restaurant: Restaurant;
  settings: SystemSettings;
  orders: Order[];
  menu: { items: MenuItem[]; categories: Category[] };
  tables: Table[];
  staff: StaffMember[];
  inventory: InventoryItem[];
  loading: boolean;
  isAuthenticated: boolean;
  refreshAll: () => Promise<void>;
  updateRestaurant: (updates: Partial<Restaurant>) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  createCategory: (category: Category) => Promise<void>;
  createOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, status: Order['status']) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  updateTables: (updatedTables: Table[]) => Promise<void>;
  createInventory: (item: InventoryItem) => Promise<void>;
  bulkCreateInventory: (items: InventoryItem[]) => Promise<void>;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  createStaff: (member: StaffMember) => Promise<void>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  clockStaff: (id: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant>({} as Restaurant);
  const [settings, setSettings] = useState<SystemSettings>({} as SystemSettings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<{ items: MenuItem[]; categories: Category[] }>({ items: [], categories: [] });
  const [tables, setTables] = useState<Table[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; name: string }>({
    id: '',
    name: '',
    role: 'Server',
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(api.auth.hasToken());

  const bootstrapAuth = useCallback(async () => {
    const authed = api.auth.hasToken();
    setIsAuthenticated(authed);
    if (!authed) {
      setLoading(false);
      return false;
    }
    try {
      const me = await api.auth.me();
      setCurrentUser({ id: me.id, name: me.name, role: me.role });
      return true;
    } catch {
      // token cleared by api layer on 401
      setIsAuthenticated(false);
      setCurrentUser({ id: '', name: '', role: 'Server' });
      setLoading(false);
      return false;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!api.auth.hasToken()) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const [res, set, o, m, t, s, i] = await Promise.all([
        api.getRestaurant(),
        api.getSettings(),
        api.getOrders(),
        api.getMenu(),
        api.getTables(),
        api.getStaff(),
        api.getInventory(),
      ]);
      setRestaurant({ ...res });
      setSettings({ ...set });
      setOrders([...o]);
      setMenu({ ...m });
      setTables([...t]);
      setStaff([...s]);
      setInventory([...i]);
    } catch (err) {
      console.error(err);
      setIsAuthenticated(api.auth.hasToken());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    (async () => {
      const ok = await bootstrapAuth();
      if (!ok) return;
      await refreshAll();
      interval = window.setInterval(refreshAll, 10000); // Polling
    })();
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [bootstrapAuth, refreshAll]);

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    await api.updateRestaurant(updates);
    await refreshAll();
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    await api.updateSettings(updates);
    await refreshAll();
  };

  const createCategory = async (category: Category) => {
    await api.createCategory(category);
    await refreshAll();
  };

  const createOrder = async (order: Order) => {
    await api.createOrder(order);
    await refreshAll();
  };

  const updateOrder = async (id: string, status: Order['status']) => {
    await api.updateOrderStatus(id, status);
    await refreshAll();
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    await api.updateMenuItem(id, updates);
    await refreshAll();
  };

  const updateTables = async (updatedTables: Table[]) => {
    await api.updateTables(updatedTables);
    await refreshAll();
  };

  const createInventory = async (item: InventoryItem) => {
    await api.createInventoryItem(item);
    await refreshAll();
  };

  const bulkCreateInventory = async (items: InventoryItem[]) => {
    await api.bulkCreateInventoryItems(items);
    await refreshAll();
  };

  const updateInventory = async (id: string, updates: Partial<InventoryItem>) => {
    await api.updateInventoryItem(id, updates);
    await refreshAll();
  };

  const createStaff = async (member: StaffMember) => {
    await api.createStaff(member);
    await refreshAll();
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    await api.updateStaff(id, updates);
    await refreshAll();
  };

  const clockStaff = async (id: string) => {
    await api.clockStaff(id);
    await refreshAll();
  };

  return (
    <GlobalContext.Provider value={{
      currentUser, restaurant, settings, orders, menu, tables, staff, inventory, loading, isAuthenticated,
      refreshAll, updateRestaurant, updateSettings, createCategory, createOrder, updateOrder, updateMenuItem, updateTables, createInventory, bulkCreateInventory, updateInventory, createStaff, updateStaff, clockStaff
    }}>
      <NotificationProvider>
        <NotificationMonitorWrapper>
          {children}
        </NotificationMonitorWrapper>
      </NotificationProvider>
    </GlobalContext.Provider>
  );
};

// Wrapper component to use the notification monitor hook
const NotificationMonitorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNotificationMonitor();
  return <>{children}</>;
};
