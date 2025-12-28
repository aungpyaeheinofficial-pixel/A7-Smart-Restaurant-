import type { InventoryItem, MenuItem, SystemSettings } from '@prisma/client';

export function serializeSettings(s: SystemSettings) {
  return {
    id: s.id,
    restaurantId: s.restaurantId,
    taxRate: Number(s.taxRate),
    currencySymbol: s.currencySymbol,
    autoClockOut: s.autoClockOut,
    pinLength: s.pinLength,
    primaryColor: s.primaryColor,
    enableKitchenAudio: s.enableKitchenAudio,
    kdsRefreshRate: s.kdsRefreshRate,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function serializeMenuItem(i: MenuItem) {
  return {
    id: i.id,
    restaurantId: i.restaurantId,
    categoryId: i.categoryId,
    name: i.name,
    description: i.description,
    prices: i.prices,
    cost: i.cost === null ? null : Number(i.cost),
    image: i.image,
    taxRate: Number(i.taxRate),
    active: i.active,
    is86d: i.is86d,
    recipe: i.recipe,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

export function serializeInventoryItem(i: InventoryItem) {
  return {
    id: i.id,
    restaurantId: i.restaurantId,
    name: i.name,
    sku: i.sku,
    onHand: Number(i.onHand),
    parLevel: Number(i.parLevel),
    unit: i.unit,
    unitCost: Number(i.unitCost),
    status: i.status === 'In_Stock' ? 'In Stock' : i.status === 'Low_Stock' ? 'Low Stock' : 'Out of Stock',
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}


