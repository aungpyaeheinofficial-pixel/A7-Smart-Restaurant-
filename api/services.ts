
import { Order, OrderStatus, MenuItem, InventoryItem, StaffMember, Category, Table, Restaurant, SystemSettings, DashboardStats } from '../types';

const TOKEN_KEY = 'a7_token';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

function getApiBaseUrl(): string {
  // Overrideable via Vite env (optional).
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  // Dev defaults: backend 7500, frontend 3401.
  if ((import.meta as any).env?.DEV) return 'http://localhost:7500';
  // Prod: use relative URLs (assumes Nginx proxy from /api to backend)
  // If you need direct backend access, set VITE_API_BASE_URL env var
  return '';
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchJson<T>(path: string, opts?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers: {
        Accept: 'application/json',
        ...(opts?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts?.headers ?? {}),
      },
    });
  } catch (err) {
    // Network error (CORS, connection refused, etc.)
    throw new ApiError(0, err instanceof Error ? err.message : 'Failed to fetch', { code: 'NETWORK_ERROR' });
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    // Standardized backend shape: { error: { message, code, details } }
    const errMsg = (data && (data as any).error?.message) || `Request failed (${res.status})`;
    const errCode = (data && (data as any).error?.code) || undefined;
    const errDetails = (data && (data as any).error?.details) || undefined;

    // Auto-clear token on auth failures so PrivateRoute will bounce user to login.
    if (res.status === 401) {
      clearToken();
    }

    throw new ApiError(res.status, errMsg, { code: errCode, details: errDetails });
  }

  return data as T;
}

function parseDate(d: any): Date {
  return d instanceof Date ? d : new Date(d);
}

export const api = {
  auth: {
    hasToken: () => !!getToken(),
    logout: () => clearToken(),
    login: async (email: string, password: string) => {
      const res = await fetchJson<{ token: string; user: { id: string; name: string; role: string; restaurantId: string } }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      setToken(res.token);
      return res.user;
    },
    me: async () => {
      return await fetchJson<{ id: string; name: string; role: string; restaurantId: string }>('/api/v1/auth/me');
    },
  },

  // Dashboard stats are derived client-side in the current app.
  getDashboardStats: async (): Promise<DashboardStats> => {
    const [orders, tables, inventory, staff] = await Promise.all([
      api.getOrders(),
      api.getTables(),
      api.getInventory(),
      api.getStaff(),
    ]);
    return {
      todayOrders: orders.length,
      revenue: orders.reduce((acc, o) => acc + o.total, 0),
      activeTables: tables.filter(t => t.status !== 'vacant').length,
      kitchenOrders: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
      inventoryAlerts: inventory.filter(i => i.status !== 'In Stock').length,
      staffOnDuty: staff.filter(s => s.isActive).length,
      revenueGrowth: 12.5,
    };
  },

  getRestaurant: async () => {
    const r = await fetchJson<any>('/api/v1/restaurant');
    // Map to frontend type
    return {
      id: r.id,
      name: r.name,
      timezone: r.timezone,
      currency: r.currency,
      email: r.email,
      phone: r.phone,
      address: r.address,
    } satisfies Restaurant;
  },

  getSettings: async () => {
    const s = await fetchJson<any>('/api/v1/settings');
    // Backend returns null if not set; keep sane defaults.
    if (!s) {
      return {
        taxRate: 8.0,
        currencySymbol: '$',
        autoClockOut: true,
        pinLength: 4,
        primaryColor: '#E63946',
        enableKitchenAudio: true,
        kdsRefreshRate: 5,
      } satisfies SystemSettings;
    }
    return {
      taxRate: Number(s.taxRate),
      currencySymbol: s.currencySymbol,
      autoClockOut: s.autoClockOut,
      pinLength: s.pinLength,
      primaryColor: s.primaryColor,
      enableKitchenAudio: s.enableKitchenAudio,
      kdsRefreshRate: s.kdsRefreshRate,
    } satisfies SystemSettings;
  },

  updateRestaurant: async (updates: Partial<Restaurant>) => {
    await fetchJson('/api/v1/restaurant', { method: 'PATCH', body: JSON.stringify(updates) });
    return true;
  },

  updateSettings: async (updates: Partial<SystemSettings>) => {
    // Keep app’s convention: settings.taxRate is percent (e.g. 8.0).
    await fetchJson('/api/v1/settings', { method: 'PATCH', body: JSON.stringify(updates) });
    return true;
  },

  getMenu: async () => {
    const data = await fetchJson<any>('/api/v1/menu');
    const categories: Category[] = (data.categories ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon ?? undefined,
    }));
    const items: MenuItem[] = (data.items ?? []).map((i: any) => ({
      id: i.id,
      categoryId: i.categoryId,
      name: i.name,
      description: i.description,
      prices: i.prices,
      cost: i.cost ?? undefined,
      image: i.image ?? undefined,
      taxRate: Number(i.taxRate),
      active: !!i.active,
      is86d: !!i.is86d,
      recipe: i.recipe ?? undefined,
    }));
    return { categories, items };
  },

  createCategory: async (category: Category) => {
    await fetchJson('/api/v1/menu/categories', { method: 'POST', body: JSON.stringify(category) });
    return true;
  },

  createMenuItem: async (item: Omit<MenuItem, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const created = await fetchJson<MenuItem>('/api/v1/menu/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return created;
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
    await fetchJson(`/api/v1/menu/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return true;
  },

  getTables: async () => {
    const tables = await fetchJson<any[]>('/api/v1/tables');
    return (tables ?? []).map((t: any) => ({
      id: t.id,
      label: t.label,
      capacity: t.capacity,
      status: t.status,
      section: t.section ?? undefined,
      serverId: t.serverId ?? undefined,
      currentOrderId: t.currentOrderId ?? undefined,
      x: t.x ?? undefined,
      y: t.y ?? undefined,
    })) as Table[];
  },

  updateTables: async (tables: Table[]) => {
    const updated = await fetchJson<Table[]>('/api/v1/tables', { method: 'PUT', body: JSON.stringify(tables) });
    return updated;
  },

  updateTable: async (id: string, updates: Partial<Table>) => {
    const updated = await fetchJson<Table>(`/api/v1/tables/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return updated;
  },

  getOrders: async () => {
    const orders = await fetchJson<any[]>('/api/v1/orders');
    return (orders ?? []).map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      type: o.type,
      tableId: o.tableId ?? undefined,
      status: o.status,
      items: (o.items ?? []).map((it: any) => ({
        id: it.id,
        menuItemId: it.menuItemId,
        name: it.name,
        qty: it.qty,
        unitPrice: Number(it.unitPrice),
        modifiers: it.modifiers ?? undefined,
        notes: it.notes ?? undefined,
      })),
      subtotal: Number(o.subtotal),
      tax: Number(o.tax),
      tip: Number(o.tip),
      total: Number(o.total),
      createdAt: parseDate(o.createdAt),
    })) as Order[];
  },

  createOrder: async (order: Order) => {
    const payload = {
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt as any).toISOString(),
    };
    return await fetchJson<Order>('/api/v1/orders', { method: 'POST', body: JSON.stringify(payload) });
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    await fetchJson(`/api/v1/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    return true;
  },

  getInventory: async () => {
    const items = await fetchJson<any[]>('/api/v1/inventory');
    return (items ?? []).map((i: any) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      onHand: Number(i.onHand),
      parLevel: Number(i.parLevel),
      unit: i.unit,
      unitCost: Number(i.unitCost),
      status: i.status,
    })) as InventoryItem[];
  },

  createInventoryItem: async (item: InventoryItem) => {
    await fetchJson('/api/v1/inventory', { method: 'POST', body: JSON.stringify(item) });
    return true;
  },

  bulkCreateInventoryItems: async (items: InventoryItem[]) => {
    await fetchJson('/api/v1/inventory/bulk', { method: 'POST', body: JSON.stringify(items) });
    return true;
  },

  updateInventoryItem: async (id: string, updates: Partial<InventoryItem>) => {
    await fetchJson(`/api/v1/inventory/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return true;
  },

  getStaff: async () => {
    const staff = await fetchJson<any[]>('/api/v1/staff');
    return (staff ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      isActive: !!s.isActive,
      avatar: s.avatar,
      lastClockIn: s.lastClockIn ? parseDate(s.lastClockIn) : undefined,
    })) as StaffMember[];
  },

  clockStaff: async (staffId: string) => {
    await fetchJson(`/api/v1/staff/${encodeURIComponent(staffId)}/clock`, { method: 'POST' });
    return true;
  },

  createStaff: async (member: StaffMember) => {
    await fetchJson('/api/v1/staff', { method: 'POST', body: JSON.stringify(member) });
    return true;
  },

  updateStaff: async (staffId: string, updates: Partial<StaffMember>) => {
    await fetchJson(`/api/v1/staff/${encodeURIComponent(staffId)}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return true;
  },
};
