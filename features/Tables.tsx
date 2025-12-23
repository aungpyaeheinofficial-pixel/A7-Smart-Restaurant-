
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Badge, A7Button } from '../components/A7UI';
import { 
  Users, Clock, Coffee, Sparkles, Utensils, Info, 
  Plus, Save, X, Trash2, Move, Layout, Square, Circle, 
  MousePointer2, Layers, Loader2, CheckCircle2, AlertCircle, 
  Copy, Maximize2, MousePointer, PlusSquare, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Order } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard, PermissionButton } from '../components/PermissionGuard';

const GRID_SIZE = 20;

// Helper to snap values to grid
const snap = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

// Helper for unique IDs
const generateId = () => `T-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

interface StatusTheme {
  icon: any;
  color: string;
  bg: string;
  border: string;
  label: string;
  badge: 'info' | 'warning' | 'success' | 'error';
}

const getStatusTheme = (status: string): StatusTheme => {
  switch (status) {
    case 'vacant': 
      return { icon: Coffee, color: '#94A3B8', bg: 'bg-slate-50', border: 'border-t-slate-300', label: 'VACANT', badge: 'info' };
    case 'seated': 
      return { icon: Users, color: '#F59E0B', bg: 'bg-amber-50', border: 'border-t-amber-400', label: 'SEATED', badge: 'warning' };
    case 'served': 
      return { icon: Utensils, color: '#3B82F6', bg: 'bg-blue-50', border: 'border-t-blue-500', label: 'SERVED', badge: 'success' };
    case 'cleaning': 
      return { icon: Sparkles, color: '#F97316', bg: 'bg-orange-50', border: 'border-t-orange-400', label: 'CLEANING', badge: 'warning' };
    default: 
      return { icon: Info, color: '#94A3B8', bg: 'bg-slate-50', border: 'border-t-slate-300', label: 'UNKNOWN', badge: 'info' };
  }
};

const TableCard: React.FC<{ 
  table: Table; 
  order?: Order; 
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (table: Table) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ table, order, isEditMode, onDelete, onDuplicate, onDragEnd, containerRef }) => {
  const theme = getStatusTheme(table.status);
  const elapsed = order ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;

  return (
    <motion.div
      layout={!isEditMode}
      drag={isEditMode}
      dragConstraints={containerRef}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (isEditMode && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const rawX = info.point.x - rect.left - 120;
          const rawY = info.point.y - rect.top - 80;
          onDragEnd(table.id, snap(rawX), snap(rawY));
        }
      }}
      initial={false}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: isEditMode ? (table.x || 0) : 0, 
        y: isEditMode ? (table.y || 0) : 0,
        zIndex: isEditMode ? 10 : 1
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={isEditMode ? { scale: 1.02, cursor: 'grab' } : { y: -5 }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
      style={{ 
        position: isEditMode ? 'absolute' : 'relative',
        width: isEditMode ? '240px' : 'auto'
      }}
    >
      <A7Card 
        className={`relative h-full flex flex-col !p-0 overflow-hidden border-t-4 ${theme.border} shadow-lg transition-shadow hover:shadow-2xl ${isEditMode ? 'border-dashed border-2 ring-2 ring-offset-2 ring-transparent hover:ring-[#E63946]/20' : ''}`}
      >
        {isEditMode && (
          <div className="absolute top-2 right-2 z-20 flex gap-1">
            <button 
              onClick={() => onDuplicate(table)}
              title="Duplicate Table"
              className="p-1.5 bg-white text-slate-600 rounded-lg shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <Copy size={14} />
            </button>
            <button 
              onClick={() => onDelete(table.id)}
              title="Delete Table"
              className="p-1.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="px-5 py-4 flex justify-between items-start">
          <div className={isEditMode ? 'select-none' : ''}>
            <h4 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{table.label}</h4>
            <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Cap: {table.capacity}</p>
          </div>
          <A7Badge variant={theme.badge}>{theme.label}</A7Badge>
        </div>

        <div className="flex-1 px-5 pb-5">
          <AnimatePresence mode="wait">
            {table.status === 'vacant' ? (
              <motion.div 
                key="vacant"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  {isEditMode ? <Move size={20} className="text-[#E63946]" /> : <Coffee size={20} />}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest">
                  {isEditMode ? 'Snap to Grid' : 'Ready'}
                </p>
              </motion.div>
            ) : table.status === 'cleaning' ? (
              <motion.div 
                key="cleaning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-28 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-orange-600"
              >
                <Sparkles size={24} className="animate-pulse mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest">Cleaning</p>
              </motion.div>
            ) : order ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={12} className="animate-spin-slow" />
                  <span className="text-[10px] font-bold">{elapsed}m seated</span>
                </div>
                
                <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E2E8F0] space-y-1.5">
                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-200">
                    <span className="text-[9px] font-black text-[#64748B] uppercase">#{order.orderNumber}</span>
                    <span className="text-xs font-black text-[#E63946]">${order.total.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] font-bold text-[#0F172A] line-clamp-1 italic">
                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {(table.status !== 'vacant' && table.status !== 'cleaning' && !isEditMode) && (
          <div className="px-5 py-3 bg-[#F8F9FA] border-t border-[#F1F5F9] flex items-center gap-2.5">
            <img 
              src={`https://i.pravatar.cc/150?u=${table.serverId || 'none'}`} 
              className="w-8 h-8 rounded-lg border-2 border-white shadow-sm object-cover" 
              alt="Server" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-[#0F172A] truncate">
                {table.serverId === 'staff1' ? 'Ko Kyaw' : 'Mike'}
              </p>
            </div>
          </div>
        )}
      </A7Card>
    </motion.div>
  );
};

export const TableManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const canManageTables = hasPermission('manage_tables');
  const { tables, orders, updateTables } = useGlobal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [snapshot, setSnapshot] = useState<Table[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const syncWithGlobal = useCallback(() => {
    setLocalTables([...tables]);
    setSnapshot([...tables]);
  }, [tables]);

  useEffect(() => {
    if (isEditMode) {
      syncWithGlobal();
    }
  }, [isEditMode, syncWithGlobal]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const addTable = (type: 'square' | 'round') => {
    if (!canManageTables) {
      alert('You do not have permission to manage tables. Please contact your manager.');
      return;
    }
    const newId = generateId();
    const nextNum = localTables.length + 1;
    
    const newTable: Table = {
      id: newId,
      label: `T${nextNum}`,
      capacity: type === 'square' ? 4 : 2,
      status: 'vacant',
      x: snap(100),
      y: snap(100)
    };

    setLocalTables(prev => [...prev, newTable]);
  };

  const duplicateTable = (original: Table) => {
    const newTable: Table = {
      ...original,
      id: generateId(),
      label: `T${localTables.length + 1}`,
      x: snap((original.x || 0) + 40),
      y: snap((original.y || 0) + 40),
      status: 'vacant',
      currentOrderId: undefined,
      serverId: undefined
    };
    setLocalTables(prev => [...prev, newTable]);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setLocalTables(prev => prev.map(t => 
      t.id === id ? { ...t, x, y } : t
    ));
  };

  const deleteTable = (id: string) => {
    setLocalTables(prev => prev.filter(t => t.id !== id));
  };

  const saveLayout = async () => {
    if (!canManageTables) {
      alert('You do not have permission to manage tables. Please contact your manager.');
      return;
    }
    setIsSaving(true);
    try {
      await updateTables(localTables);
      setFeedback({ message: 'Floor plan archived successfully', type: 'success' });
      setIsEditMode(false);
    } catch (err) {
      setFeedback({ message: 'Failed to sync layout', type: 'error' });
      setLocalTables([...snapshot]);
    } finally {
      setIsSaving(false);
    }
  };

  const statuses = ['vacant', 'seated', 'served', 'cleaning'] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto min-h-[85vh] flex flex-col">
      {/* Updated Header Panel per request: Only Add Table, with Live Status subtext */}
      <div className="bg-white p-5 rounded-[2rem] border border-[#E2E8F0] shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBEE] flex items-center justify-center text-[#E63946] shadow-sm">
            {isEditMode ? <Layout size={24} /> : <PlusSquare size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
              {isEditMode ? 'Architect Mode' : 'Add Table'}
            </h2>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">
              {isEditMode ? 'Design layout with 20px grid snapping' : 'Live occupancy & service status'}
            </p>
          </div>
        </div>

        {/* Live Status Summary (When not editing) */}
        {!isEditMode && (
          <div className="hidden lg:flex items-center gap-3">
            {statuses.map(status => {
              const theme = getStatusTheme(status);
              const count = tables.filter(t => t.status === status).length;
              return (
                <div key={status} className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-default group">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }}></div>
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">{theme.label}</span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-[10px] font-black text-[#0F172A] group-hover:bg-[#E63946] group-hover:text-white group-hover:border-transparent transition-colors">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {isEditMode && (
          <div className="flex items-center gap-4 animate-in slide-in-from-right-4">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase flex items-center gap-2">
                <MousePointer size={12} /> Live Snap Active
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6 relative">
        <AnimatePresence>
          {isEditMode && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-72 bg-white rounded-[2.5rem] border border-[#E2E8F0] shadow-xl p-6 flex flex-col gap-6 sticky top-24 h-fit"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Blueprint Tools</p>
                <h3 className="text-lg font-black text-[#0F172A]">Add Elements</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => addTable('square')}
                  className="group flex items-center gap-4 p-4 rounded-3xl bg-slate-50 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 text-left"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#E63946] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Square size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-[#0F172A]">4-Top Table</span>
                    <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Family Seating</span>
                  </div>
                </button>

                <button 
                  onClick={() => addTable('round')}
                  className="group flex items-center gap-4 p-4 rounded-3xl bg-slate-50 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 text-left"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#E63946] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Circle size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-[#0F172A]">2-Top Table</span>
                    <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Cafe / Bar</span>
                  </div>
                </button>

                <button 
                  className="group flex items-center gap-4 p-4 rounded-3xl bg-slate-50 opacity-50 cursor-not-allowed border border-transparent"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Layers size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-[#0F172A]">Divider Wall</span>
                    <span className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Soon</span>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <p className="text-[10px] font-bold text-[#64748B] leading-relaxed">
                   Tip: Use the <Copy size={10} className="inline mx-0.5" /> icon on any placed table to instantly clone it.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          ref={canvasRef}
          className={`flex-1 relative min-h-[700px] transition-all duration-500 rounded-[2.5rem] overflow-hidden ${
            isEditMode 
              ? 'bg-slate-100/50 border-4 border-dashed border-slate-200' 
              : 'bg-white border border-slate-200'
          }`}
          style={{
            backgroundImage: isEditMode ? 'radial-gradient(#CBD5E1 1px, transparent 1px)' : 'none',
            backgroundSize: isEditMode ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'none'
          }}
        >
          {isEditMode && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none z-0" />
          )}

          <div className={isEditMode ? '' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8'}>
            <AnimatePresence>
              {(isEditMode ? localTables : tables).map(table => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  order={orders.find(o => o.id === table.currentOrderId)} 
                  isEditMode={isEditMode}
                  onDelete={deleteTable}
                  onDuplicate={duplicateTable}
                  onDragEnd={handleDragEnd}
                  containerRef={canvasRef}
                />
              ))}
            </AnimatePresence>
          </div>

          {!isEditMode && tables.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <Layout size={64} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-[0.2em] text-sm opacity-50">Floor plan is empty</p>
                <PermissionButton 
                  requiredPermission="manage_tables"
                  variant="secondary" 
                  onClick={() => setIsEditMode(true)} 
                  className="mt-4"
                >
                  Build Layout
                </PermissionButton>
             </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar: Focused on Add Table Function */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-8">
        <div className="bg-[#0F172A] rounded-[2.5rem] p-6 text-white flex items-center justify-between gap-6 shadow-2xl border border-white/10">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isEditMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-[#E63946]'}`}>
              {isEditMode ? <Layout size={28} /> : <PlusSquare size={28} />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditMode ? 'Designer Toolbar' : 'Add Table Function'}
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                {isEditMode ? 'Drag elements to compose your room' : 'Create and manage your floor plan'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isEditMode ? (
              <PermissionButton
                requiredPermission="manage_tables"
                onClick={() => {
                  if (!canManageTables) {
                    alert('You do not have permission to manage tables. Please contact your manager.');
                    return;
                  }
                  setIsEditMode(true);
                }}
                className="px-8 py-3.5 bg-[#E63946] hover:bg-[#C62828] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} strokeWidth={3} /> Add Table
              </PermissionButton>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditMode(false)}
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                >
                  Discard
                </button>
                <button 
                  onClick={saveLayout}
                  disabled={isSaving}
                  className="px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 min-w-[180px] flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                  ) : (
                    <><Save size={16} /> Save Layout</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-black text-sm border-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
