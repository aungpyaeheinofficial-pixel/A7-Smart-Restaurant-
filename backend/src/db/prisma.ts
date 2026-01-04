import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// Request-scoped storage for restaurantId (thread-safe)
const restaurantContext = new AsyncLocalStorage<string>();

// Base Prisma client
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Extended Prisma client with automatic restaurantId filtering
// This ensures all queries are automatically scoped to the restaurant
export const prisma = basePrisma.$extends({
  name: 'restaurant-scope',
  query: {
    $allOperations({ operation, model, args, query }) {
      // Models that need restaurantId filtering
      const scopedModels = [
        'Category',
        'MenuItem',
        'StaffMember',
        'Table',
        'InventoryItem',
        'Order',
        'SystemSettings',
      ];

      // Only apply filtering to scoped models
      if (model && scopedModels.includes(model)) {
        // Get restaurantId from async context (set by middleware)
        const restaurantId = restaurantContext.getStore();
        
        if (restaurantId) {
          // For findMany, findFirst, findUnique, update, delete operations
          if (['findMany', 'findFirst', 'findUnique', 'update', 'delete', 'count'].includes(operation)) {
            // Automatically add restaurantId filter
            if (args.where) {
              args.where = { ...args.where, restaurantId };
            } else {
              args.where = { restaurantId };
            }
          }
          
          // For create operations, ensure restaurantId is set
          if (operation === 'create' || operation === 'createMany') {
            if (!args.data.restaurantId) {
              args.data = { ...args.data, restaurantId };
            }
          }
        }
      }

      return query(args);
    },
  },
}) as typeof basePrisma;

// Helper to run code with restaurantId context (call this in your middleware)
export function withRestaurantContext<T>(restaurantId: string, fn: () => T): T {
  return restaurantContext.run(restaurantId, fn);
}

// Helper to get current restaurantId (for debugging/logging)
export function getRestaurantContext(): string | undefined {
  return restaurantContext.getStore();
}


