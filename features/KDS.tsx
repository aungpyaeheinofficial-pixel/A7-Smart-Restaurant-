
import React, { useState, useEffect, useMemo } from 'react';
import { useGlobal } from '../Providers';
import { A7Badge, A7Button, A7Card } from '../components/A7UI';
import { 
  ChefHat, Timer, History, Check, 
  Square, CheckSquare, RotateCcw, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/PermissionGuard';

/**
 * TicketCard Component
 * Manages individual order tickets with timers and item-level completion tracking
 */
const TicketCard: React.FC<{ 
  order: Order; 
  onBump: (id: string) => void;
  currentTime: number;
  canManageKitchen: boolean;
}> = ({ order, onBump, currentTime, canManageKitchen }) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    if (!canManageKitchen) return;
    const newSet = new Set(completedItems);
    if (newSet.has(itemId)) newSet.delete(itemId);
    else newSet.add(itemId);
    setCompletedItems(newSet);
  };

  const elapsedMinutes = Math.floor((currentTime - new Date(order.createdAt).getTime()) / 60000);

  // Timer colors: starts Green, turns Yellow at 15m, Red at 25m
  const timerColor = useMemo(() => {
    if (elapsedMinutes >= 25) return 'text-[#EF4444]'; // Red
    if (elapsedMinutes >= 15) return 'text-[#F59E0B]'; // Yellow
    return 'text-[#10B981]'; // Green
  }, [elapsedMinutes]);

  const timerBg = useMemo(() => {
    if (elapsedMinutes >= 25) return 'bg-red-50';
    if (elapsedMinutes >= 15) return 'bg-amber-50';
    return 'bg-emerald-50';
  }, [elapsedMinutes]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className="w-[360px] flex-shrink-0 h-full"
    >
      <A7Card className="!p-0 border-t-[12px] border-[#E63946] shadow-2xl h-full flex flex-col overflow-hidden bg-white">
        {/* Header: Table # (Large Font), Order #, and Timer */}
        <div className="p-6 border-b border-[#F1F5F9]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-5xl font-black text-[#0F172A] leading-tight">
                {order.type === 'dine-in' ? `T${order.tableId}` : 'TO'}
              </h2>
              <p className="text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">
                ORDER #{order.orderNumber}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xl ${timerBg} ${timerColor} shadow-sm border border-black/5`}>
              <Timer size={20} strokeWidth={3} />
              {elapsedMinutes}m
            </div>
          </div>
        </div>

        {/* Body: List of items with checkboxes */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white">
          {order.items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start gap-4 group cursor-pointer select-none"
              onClick={() => toggleItem(item.id)}
            >
              <div className="mt-1 text-[#E63946]">
                {completedItems.has(item.id) ? (
                  <CheckSquare size={24} strokeWidth={2.5} className="fill-[#E63946] text-white" />
                ) : (
                  <Square size={24} strokeWidth={2.5} className="text-[#E2E8F0] bg-slate-50 rounded-lg" />
                )}
              </div>
              <div className="flex-1">
                {/* Standard Item: Black text */}
                <p className={`text-xl font-bold leading-tight transition-all duration-300 ${completedItems.has(item.id) ? 'line-through text-[#CBD5E1] opacity-60' : 'text-[#0F172A]'}`}>
                  <span className="font-black mr-2 text-2xl">{item.qty}x</span> 
                  {item.name}
                </p>
                {/* Modifier: Orange/Red bold text indented */}
                {item.notes && (
                  <p className={`ml-6 mt-2 text-sm font-black uppercase italic tracking-wider ${completedItems.has(item.id) ? 'text-[#CBD5E1]' : 'text-orange-600'}`}>
                    ↳ {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Large 'BUMP' or 'DONE' button */}
        <div className="p-6 bg-[#F8F9FA] border-t border-[#F1F5F9]">
          <PermissionGuard requiredPermission="manage_kitchen" showError={false}>
            <button
              onClick={() => onBump(order.id)}
              className="w-full py-5 border-4 border-[#E2E8F0] rounded-[2rem] font-black text-lg uppercase tracking-[0.25em] text-[#64748B] bg-white hover:bg-[#10B981] hover:border-[#10B981] hover:text-white hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canManageKitchen}
              title={!canManageKitchen ? 'Requires manage_kitchen permission' : undefined}
            >
              <Check size={24} strokeWidth={4} /> DONE
            </button>
          </PermissionGuard>
        </div>
      </A7Card>
    </motion.div>
  );
};

export const KDS: React.FC = () => {
  const { orders, updateOrder } = useGlobal();
  const { hasPermission } = usePermissions();
  const canManageKitchen = hasPermission('manage_kitchen');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showHistory, setShowHistory] = useState(false);

  // Real-time clock update every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'pending' || o.status === 'preparing')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'ready' || o.status === 'served' || o.status === 'paid')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const handleBump = async (id: string) => {
    await updateOrder(id, 'ready');
  };

  const handleRecall = async (id: string) => {
    await updateOrder(id, 'preparing');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] -m-8 bg-[#F1F5F9] overflow-hidden font-inter">
      {/* Top Bar: Metrics & History Toggle */}
      <div className="bg-white border-b border-[#E2E8F0] px-10 py-5 flex items-center justify-between shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-[1.25rem] flex items-center justify-center text-[#E63946] shadow-inner">
              <ChefHat size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Avg Prep Time</p>
              <p className="text-xl font-black text-[#0F172A]">12m</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-2 border-[#F1F5F9] pl-10">
            <div className="w-12 h-12 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-blue-600 shadow-inner">
              <Timer size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Open Tickets</p>
              <p className="text-xl font-black text-[#0F172A]">{activeOrders.length}</p>
            </div>
          </div>
        </div>

        {/* History/Recall Toggle */}
        <div className="flex bg-[#F1F5F9] p-2 rounded-[1.5rem] border border-[#E2E8F0]">
          <button 
            onClick={() => setShowHistory(false)}
            className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 ${!showHistory ? 'bg-white text-[#E63946] shadow-lg scale-[1.02]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Kitchen Live
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 ${showHistory ? 'bg-white text-blue-600 shadow-lg scale-[1.02]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            History / Recall
          </button>
        </div>
      </div>

      {/* Main Grid: Horizontal scrolling */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-10 flex gap-10 items-stretch custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {(!showHistory ? activeOrders : historyOrders.slice(0, 15)).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center text-slate-400/50 text-center"
            >
              <ChefHat size={120} strokeWidth={1} className="mb-6 animate-bounce-slow" />
              <h3 className="text-3xl font-black text-[#0F172A]">All Clear!</h3>
              <p className="text-lg font-medium mt-2">New orders will appear here automatically.</p>
            </motion.div>
          ) : (
            (!showHistory ? activeOrders : historyOrders.slice(0, 15)).map((order) => (
              <React.Fragment key={order.id}>
                {!showHistory ? (
                  <TicketCard 
                    order={order} 
                    onBump={handleBump} 
                    currentTime={currentTime}
                    canManageKitchen={canManageKitchen}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-[320px] flex-shrink-0"
                  >
                    <A7Card className="!p-6 border-l-[8px] border-emerald-400 bg-white shadow-xl opacity-90 hover:opacity-100 transition-all group">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-3xl font-black text-[#0F172A]">
                           {order.type === 'dine-in' ? `T${order.tableId}` : 'TO'}
                        </h4>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">COMPLETED</span>
                      </div>
                      <div className="space-y-2 mb-8 border-l-2 border-slate-100 pl-4">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm font-bold text-[#64748B]">
                            <span className="text-[#0F172A] font-black mr-2">{item.qty}x</span> 
                            {item.name}
                          </p>
                        ))}
                      </div>
                      <PermissionGuard requiredPermission="manage_kitchen" showError={false}>
                        <A7Button 
                          variant="secondary" 
                          className="w-full rounded-2xl h-14 border-2 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          onClick={() => handleRecall(order.id)}
                          disabled={!canManageKitchen}
                          title={!canManageKitchen ? 'Requires manage_kitchen permission' : undefined}
                        >
                          <RotateCcw size={18} /> RECALL TICKET
                        </A7Button>
                      </PermissionGuard>
                    </A7Card>
                  </motion.div>
                )}
              </React.Fragment>
            ))
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
