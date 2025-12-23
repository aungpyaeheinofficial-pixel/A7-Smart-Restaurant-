import { useEffect, useRef } from 'react';
import { useGlobal } from '../Providers';
import { useNotifications } from '../contexts/NotificationContext';
import { Order, InventoryItem } from '../types';

/**
 * Hook to monitor system events and generate notifications
 */
export const useNotificationMonitor = () => {
  const { orders, inventory } = useGlobal();
  const { addNotification } = useNotifications();
  const previousOrdersRef = useRef<Order[]>([]);
  const previousInventoryRef = useRef<InventoryItem[]>([]);

  useEffect(() => {
    // Monitor new orders
    if (previousOrdersRef.current.length > 0) {
      const newOrders = orders.filter(
        order => !previousOrdersRef.current.some(prev => prev.id === order.id)
      );

      newOrders.forEach(order => {
        addNotification({
          type: 'info',
          title: 'New Order Received',
          message: `Order #${order.orderNumber} - ${order.items.length} item(s) - $${order.total.toFixed(2)}`,
          actionUrl: order.type === 'dine-in' ? '/app/kitchen' : '/app/orders',
          actionLabel: 'View Order',
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        });
      });

      // Monitor order status changes
      orders.forEach(order => {
        const previousOrder = previousOrdersRef.current.find(prev => prev.id === order.id);
        if (previousOrder && previousOrder.status !== order.status) {
          if (order.status === 'ready') {
            addNotification({
              type: 'success',
              title: 'Order Ready',
              message: `Order #${order.orderNumber} is ready for pickup`,
              actionUrl: '/app/orders',
              actionLabel: 'View Order',
              metadata: { orderId: order.id, orderNumber: order.orderNumber },
            });
          } else if (order.status === 'paid') {
            addNotification({
              type: 'success',
              title: 'Order Completed',
              message: `Order #${order.orderNumber} has been paid`,
              actionUrl: '/app/orders',
              actionLabel: 'View Order',
              metadata: { orderId: order.id, orderNumber: order.orderNumber },
            });
          }
        }
      });
    }

    previousOrdersRef.current = [...orders];
  }, [orders, addNotification]);

  useEffect(() => {
    // Monitor low inventory
    if (previousInventoryRef.current.length > 0) {
      inventory.forEach(item => {
        const previousItem = previousInventoryRef.current.find(prev => prev.id === item.id);
        
        // Check if item just went below par level
        if (previousItem && previousItem.onHand > previousItem.parLevel && item.onHand <= item.parLevel) {
          addNotification({
            type: 'warning',
            title: 'Low Stock Alert',
            message: `${item.name} (${item.sku}) is below par level. Current: ${item.onHand} ${item.unit}`,
            actionUrl: '/app/inventory',
            actionLabel: 'View Inventory',
            metadata: { inventoryId: item.id, sku: item.sku },
          });
        }

        // Check if item is out of stock
        if (previousItem && previousItem.onHand > 0 && item.onHand === 0) {
          addNotification({
            type: 'error',
            title: 'Out of Stock',
            message: `${item.name} (${item.sku}) is out of stock`,
            actionUrl: '/app/inventory',
            actionLabel: 'Restock Now',
            metadata: { inventoryId: item.id, sku: item.sku },
          });
        }
      });
    }

    previousInventoryRef.current = [...inventory];
  }, [inventory, addNotification]);
};

