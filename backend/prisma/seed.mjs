import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurantId = 'r1';

  await prisma.restaurant.upsert({
    where: { id: restaurantId },
    update: {},
    create: {
      id: restaurantId,
      name: 'A7 Grill & Bar',
      timezone: 'Pacific Time (PT)',
      currency: 'USD',
      email: 'hello@a7grill.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Lane, Silicon Valley, CA',
    },
  });

  await prisma.systemSettings.upsert({
    where: { restaurantId },
    update: {},
    create: {
      id: 'settings-1',
      restaurantId,
      taxRate: 0.08,
      currencySymbol: '$',
      autoClockOut: true,
      pinLength: 4,
      primaryColor: '#E63946',
      enableKitchenAudio: true,
      kdsRefreshRate: 5,
    },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'password';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.staffMember.upsert({
    where: { id: 'staff1' },
    update: {},
    create: {
      id: 'staff1',
      restaurantId,
      name: 'Ko Kyaw',
      role: 'Manager',
      isActive: true,
      avatar: 'https://i.pravatar.cc/150?u=kokyaw',
      lastClockIn: new Date(),
      email: 'admin@a7grill.com',
      passwordHash: adminHash,
    },
  });

  await prisma.staffMember.upsert({
    where: { id: 'staff2' },
    update: {},
    create: {
      id: 'staff2',
      restaurantId,
      name: 'Mike Ross',
      role: 'Server',
      isActive: true,
      avatar: 'https://i.pravatar.cc/150?u=mike',
      lastClockIn: new Date(),
    },
  });

  await prisma.staffMember.upsert({
    where: { id: 'staff3' },
    update: {},
    create: {
      id: 'staff3',
      restaurantId,
      name: 'John Doe',
      role: 'Kitchen',
      isActive: true,
      avatar: 'https://i.pravatar.cc/150?u=john',
    },
  });

  const categories = [
    { id: 'cat1', name: 'Burgers', icon: '🍔' },
    { id: 'cat2', name: 'Salads', icon: '🥗' },
    { id: 'cat3', name: 'Pizza', icon: '🍕' },
    { id: 'cat4', name: 'Beverages', icon: '☕' },
    { id: 'cat5', name: 'Desserts', icon: '🍰' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, icon: c.icon, restaurantId },
      create: { ...c, restaurantId },
    });
  }

  const items = [
    {
      id: 'item1',
      categoryId: 'cat1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce and tomato',
      prices: [{ size: 'Standard', amount: 12.99 }],
      cost: 4.5,
      taxRate: 0.08,
      active: true,
      is86d: false,
      image: 'https://picsum.photos/seed/burger/400/300',
    },
    {
      id: 'item2',
      categoryId: 'cat2',
      name: 'Caesar Salad',
      description: 'Crisp romaine with parmesan and croutons',
      prices: [
        { size: 'Regular', amount: 9.5 },
        { size: 'Large', amount: 13.5 },
      ],
      cost: 2.75,
      taxRate: 0.08,
      active: true,
      is86d: false,
      image: 'https://picsum.photos/seed/salad/400/300',
    },
    {
      id: 'item3',
      categoryId: 'cat3',
      name: 'Margherita Pizza',
      description: 'Fresh basil, mozzarella, and tomato sauce',
      prices: [
        { size: '12\"', amount: 14.0 },
        { size: '16\"', amount: 18.5 },
      ],
      cost: 3.2,
      taxRate: 0.08,
      active: true,
      is86d: false,
      image: 'https://picsum.photos/seed/pizza/400/300',
    },
    {
      id: 'item4',
      categoryId: 'cat4',
      name: 'Iced Latte',
      description: 'Espresso with cold milk and ice',
      prices: [
        { size: '12oz', amount: 4.5 },
        { size: '16oz', amount: 5.5 },
      ],
      cost: 0.85,
      taxRate: 0.08,
      active: true,
      is86d: false,
      image: 'https://picsum.photos/seed/latte/400/300',
    },
    {
      id: 'item5',
      categoryId: 'cat5',
      name: 'Chocolate Cake',
      description: 'Rich triple chocolate decadence',
      prices: [{ size: 'Slice', amount: 7.99 }],
      cost: 1.5,
      taxRate: 0.08,
      active: true,
      is86d: false,
      image: 'https://picsum.photos/seed/cake/400/300',
    },
  ];
  for (const it of items) {
    await prisma.menuItem.upsert({
      where: { id: it.id },
      update: { ...it, restaurantId },
      create: { ...it, restaurantId },
    });
  }

  const tables = [
    { id: 'T1', label: 'T1', capacity: 4, status: 'seated', serverId: 'staff1', currentOrderId: 'order-123', x: 50, y: 50 },
    { id: 'T2', label: 'T2', capacity: 2, status: 'vacant', x: 350, y: 50 },
    { id: 'T3', label: 'T3', capacity: 6, status: 'served', serverId: 'staff2', currentOrderId: 'order-124', x: 50, y: 300 },
    { id: 'T4', label: 'T4', capacity: 4, status: 'cleaning', x: 350, y: 300 },
  ];
  for (const t of tables) {
    await prisma.table.upsert({
      where: { id: t.id },
      update: { ...t, restaurantId, serverId: t.serverId ?? null, currentOrderId: t.currentOrderId ?? null },
      create: { ...t, restaurantId, serverId: t.serverId ?? null, currentOrderId: t.currentOrderId ?? null },
    });
  }

  const inventory = [
    { id: 'inv1', name: 'Beef Patties', sku: 'BP-001', onHand: 45, parLevel: 20, unit: 'pcs', unitCost: 1.5, status: 'In_Stock' },
    { id: 'inv2', name: 'Brioche Buns', sku: 'BB-001', onHand: 12, parLevel: 25, unit: 'pcs', unitCost: 0.45, status: 'Low_Stock' },
    { id: 'inv3', name: 'Tomato Sauce', sku: 'TS-001', onHand: 0, parLevel: 5, unit: 'gallons', unitCost: 12.0, status: 'Out_of_Stock' },
    { id: 'inv4', name: 'Romaine Lettuce', sku: 'RL-001', onHand: 20, parLevel: 10, unit: 'lbs', unitCost: 2.2, status: 'In_Stock' },
    { id: 'inv5', name: 'Parmesan', sku: 'PM-001', onHand: 15, parLevel: 5, unit: 'lbs', unitCost: 8.5, status: 'In_Stock' },
  ];
  for (const inv of inventory) {
    await prisma.inventoryItem.upsert({
      where: { id: inv.id },
      update: { ...inv, restaurantId },
      create: { ...inv, restaurantId },
    });
  }

  await prisma.order.upsert({
    where: { id: 'order-123' },
    update: {},
    create: {
      id: 'order-123',
      restaurantId,
      orderNumber: 'A101',
      type: 'dine_in',
      tableId: 'T1',
      status: 'preparing',
      subtotal: 25.98,
      tax: 2.08,
      tip: 5.0,
      total: 33.06,
      createdAt: new Date(),
      items: {
        create: [{ id: 'oi1', menuItemId: 'item1', name: 'Classic Burger', qty: 2, unitPrice: 12.99 }],
      },
    },
  });

  await prisma.order.upsert({
    where: { id: 'order-124' },
    update: {},
    create: {
      id: 'order-124',
      restaurantId,
      orderNumber: 'A102',
      type: 'dine_in',
      tableId: 'T3',
      status: 'served',
      subtotal: 14.0,
      tax: 1.12,
      tip: 3.0,
      total: 18.12,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      items: {
        create: [{ id: 'oi2', menuItemId: 'item3', name: 'Margherita Pizza', qty: 1, unitPrice: 14.0 }],
      },
    },
  });

  await prisma.table.update({ where: { id: 'T1' }, data: { currentOrderId: 'order-123' } });
  await prisma.table.update({ where: { id: 'T3' }, data: { currentOrderId: 'order-124' } });

  console.log('[seed] done');
  console.log(`[seed] admin login: admin@a7grill.com / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


