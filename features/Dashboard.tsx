import React, { useState, useMemo, useCallback, memo } from 'react';
import { 
  TrendingUp, TrendingDown, ClipboardList, 
  DollarSign, Utensils, ChefHat, 
  AlertTriangle, Users, Clock, RefreshCw, Calendar,
  X, Check, ArrowUpRight, ArrowDownRight, Activity,
  Zap, Target, BarChart3, PieChart, Sparkles
} from 'lucide-react';
import { A7Card, A7Button, A7Modal } from '../components/A7UI';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { useGlobal } from '../Providers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

const DUMMY_CHART_DATA: Record<string, any[]> = {
  today: [
    { name: '08:00', revenue: 400, orders: 5 },
    { name: '10:00', revenue: 900, orders: 8 },
    { name: '12:00', revenue: 2400, orders: 18 },
    { name: '14:00', revenue: 1800, orders: 14 },
    { name: '16:00', revenue: 1200, orders: 10 },
    { name: '18:00', revenue: 3200, orders: 24 },
    { name: '20:00', revenue: 2800, orders: 21 },
  ],
  yesterday: [
    { name: '08:00', revenue: 300, orders: 4 },
    { name: '10:00', revenue: 700, orders: 6 },
    { name: '12:00', revenue: 2100, orders: 16 },
    { name: '14:00', revenue: 1500, orders: 12 },
    { name: '16:00', revenue: 1100, orders: 9 },
    { name: '18:00', revenue: 2900, orders: 22 },
    { name: '20:00', revenue: 2400, orders: 19 },
  ],
  week: [
    { name: 'Mon', revenue: 2400, orders: 45 },
    { name: 'Tue', revenue: 1398, orders: 32 },
    { name: 'Wed', revenue: 9800, orders: 78 },
    { name: 'Thu', revenue: 3908, orders: 52 },
    { name: 'Fri', revenue: 4800, orders: 61 },
    { name: 'Sat', revenue: 13000, orders: 98 },
    { name: 'Sun', revenue: 11000, orders: 85 },
  ],
  month: [
    { name: 'Week 1', revenue: 45000, orders: 320 },
    { name: 'Week 2', revenue: 52000, orders: 380 },
    { name: 'Week 3', revenue: 48000, orders: 350 },
    { name: 'Week 4', revenue: 61000, orders: 420 },
  ]
};

// Memoized Metric Card Component for Performance
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend: string;
  trendValue?: number;
  path: string;
  index: number;
  onClick: () => void;
}

const MetricCard = memo(({ label, value, icon: Icon, color, trend, trendValue, path, index, onClick }: MetricCardProps) => {
  const isPositive = trend.includes('+') || trend === 'Live' || trend === 'Active' || trend === 'Full Shift';
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    onClick();
    navigate(path);
  }, [onClick, navigate, path]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <A7Card 
        className="flex flex-col items-center text-center !p-4 md:!p-6 cursor-pointer group min-h-[160px] md:min-h-[180px] focus-visible:ring-4 ring-[#FFEBEE] outline-none relative overflow-hidden" 
        hoverEffect
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`${label}: ${value}. ${trend}. Click to view details.`}
      >
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-50/0 group-hover:to-red-50/50 transition-all duration-500 pointer-events-none" />
        
        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-4 transition-all duration-300 group-hover:scale-110 group-active:scale-105 shadow-sm group-hover:shadow-md relative z-10 ${color}`}>
          <Icon size={24} className="md:w-7 md:h-7" aria-hidden="true" />
        </div>
        
        <div className="relative z-10 w-full">
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-[#0F172A] break-all tracking-tight leading-tight mb-1">
            {value}
          </p>
          <p className="text-[10px] md:text-[11px] font-black text-[#64748B] uppercase tracking-wider line-clamp-2 mb-3">
            {label}
          </p>
          
          <div className={`flex items-center justify-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${
            isPositive ? 'text-emerald-600' : 
            trend === 'Urgent' || trend === 'Action' ? 'text-rose-600' : 'text-blue-600'
          }`}>
            {isPositive && <TrendingUp size={10} className="md:w-3 md:h-3" aria-hidden="true" />}
            {!isPositive && trendValue !== undefined && trendValue < 0 && <TrendingDown size={10} className="md:w-3 md:h-3" aria-hidden="true" />}
            <span>{trend}</span>
          </div>
        </div>

        {/* Subtle indicator line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
          isPositive ? 'bg-emerald-500' : 'bg-blue-500'
        } opacity-0 group-hover:opacity-100`} />
      </A7Card>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

// Memoized Activity Item Component
interface ActivityItemProps {
  order: any;
  isRecent: boolean;
  onClick: () => void;
}

const ActivityItem = memo(({ order, isRecent, onClick }: ActivityItemProps) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border border-transparent hover:border-[#F1F5F9] hover:bg-[#F8F9FA] active:bg-[#F8F9FA] transition-all cursor-pointer group focus-visible:ring-4 ring-[#FFEBEE] outline-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Order ${order.orderNumber}, ${order.status}, $${order.total.toFixed(2)}`}
    >
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-active:scale-105 shadow-sm ${
        order.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#E63946]'
      }`}>
        <Utensils size={20} className="md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="font-black text-xs md:text-sm text-[#0F172A] tracking-tight truncate">
            #{order.orderNumber}
          </span>
          <span className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${
            order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
            order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
            order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
            'bg-[#FFEBEE] text-[#E63946]'
          }`}>
            {order.status}
          </span>
        </div>
        <p className="text-[10px] md:text-[11px] font-bold text-[#64748B] truncate leading-tight">
          {order.items.map((i: any) => i.name).join(', ')}
        </p>
        <div className="flex items-center justify-between mt-2 md:mt-3 gap-2">
          <p className="text-xs md:text-sm font-black text-[#0F172A] tracking-tighter">
            ${order.total.toFixed(2)}
          </p>
          <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest flex-shrink-0 flex items-center gap-1 ${
            isRecent ? 'text-[#E63946]' : 'text-[#94A3B8]'
          }`}>
            {isRecent && <Activity size={10} className="animate-pulse" aria-hidden="true" />}
            {isRecent ? 'Just now' : new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = 'ActivityItem';

export const Dashboard: React.FC = () => {
  const { orders, tables, staff, inventory, refreshAll, loading } = useGlobal();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // Custom Date States
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refreshAll]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      if (timeRange === 'today') return orderDate.toDateString() === todayStr;
      
      if (timeRange === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      
      if (timeRange === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek;
      }

      if (timeRange === 'month') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        return orderDate >= lastMonth;
      }

      if (timeRange === 'custom') {
        const start = new Date(customRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      
      return true;
    });
  }, [orders, timeRange, customRange]);

  // Calculate previous period orders for comparison
  const previousPeriodOrders = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;
    
    if (timeRange === 'today') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      start = new Date(yesterday);
      start.setHours(0, 0, 0, 0);
      end = new Date(yesterday);
      end.setHours(23, 59, 59, 999);
    } else if (timeRange === 'yesterday') {
      const dayBefore = new Date();
      dayBefore.setDate(now.getDate() - 2);
      start = new Date(dayBefore);
      start.setHours(0, 0, 0, 0);
      end = new Date(dayBefore);
      end.setHours(23, 59, 59, 999);
    } else if (timeRange === 'week') {
      start = new Date();
      start.setDate(now.getDate() - 14);
      end = new Date();
      end.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      start = new Date();
      start.setMonth(now.getMonth() - 2);
      end = new Date();
      end.setMonth(now.getMonth() - 1);
    } else {
      return [];
    }
    
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, timeRange]);

  // Calculate metrics with comparisons
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const activeTablesCount = tables.filter(t => t.status !== 'vacant').length;
    const kitchenCount = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const lowStockCount = inventory.filter(i => i.status !== 'In Stock').length;
    const staffActiveCount = staff.filter(s => s.isActive).length;
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersChange = previousPeriodOrders.length > 0 
      ? ((filteredOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 
      : 0;

    return {
      totalRevenue,
      activeTablesCount,
      kitchenCount,
      lowStockCount,
      staffActiveCount,
      avgOrderValue,
      revenueChange,
      ordersChange,
    };
  }, [filteredOrders, tables, inventory, staff, previousPeriodOrders]);

  const statCards = useMemo(() => [
    { 
      label: timeRange === 'today' ? "Today's Orders" : 
             timeRange === 'custom' ? "Selected Range Orders" : 
             `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Orders`, 
      value: filteredOrders.length, 
      icon: ClipboardList, 
      color: "bg-blue-100 text-blue-600", 
      trend: metrics.ordersChange > 0 ? `+${metrics.ordersChange.toFixed(1)}%` : metrics.ordersChange < 0 ? `${metrics.ordersChange.toFixed(1)}%` : "No change",
      trendValue: metrics.ordersChange,
      path: "/app/pos" 
    },
    { 
      label: "Revenue", 
      value: `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      color: "bg-emerald-100 text-emerald-600", 
      trend: metrics.revenueChange > 0 ? `+${metrics.revenueChange.toFixed(1)}%` : metrics.revenueChange < 0 ? `${metrics.revenueChange.toFixed(1)}%` : "No change",
      trendValue: metrics.revenueChange,
      path: "/app/" 
    },
    { 
      label: "Avg Order Value", 
      value: `$${metrics.avgOrderValue.toFixed(2)}`, 
      icon: Target, 
      color: "bg-purple-100 text-purple-600", 
      trend: "Target: $45",
      path: "/app/pos" 
    },
    { 
      label: "Active Tables", 
      value: metrics.activeTablesCount, 
      icon: Utensils, 
      color: "bg-orange-100 text-orange-600", 
      trend: "Live", 
      path: "/app/tables" 
    },
    { 
      label: "Kitchen Queue", 
      value: metrics.kitchenCount, 
      icon: ChefHat, 
      color: "bg-purple-100 text-purple-600", 
      trend: metrics.kitchenCount > 0 ? "Active" : "Clear",
      path: "/app/kitchen" 
    },
    { 
      label: "Low Stock Items", 
      value: metrics.lowStockCount, 
      icon: AlertTriangle, 
      color: "bg-rose-100 text-rose-600", 
      trend: metrics.lowStockCount > 0 ? "Urgent" : "All Good",
      path: "/app/inventory" 
    },
    { 
      label: "Staff On Duty", 
      value: metrics.staffActiveCount, 
      icon: Users, 
      color: "bg-indigo-100 text-indigo-600", 
      trend: "Active", 
      path: "/app/staff" 
    },
  ], [filteredOrders.length, metrics, timeRange]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const chartDataKey = timeRange === 'custom' ? 'month' : timeRange;
  const chartData = DUMMY_CHART_DATA[chartDataKey] || DUMMY_CHART_DATA.month;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#E63946] animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-sm font-bold text-[#64748B]">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 md:pb-8 lg:pb-12">
      {/* Header Section */}
      <header className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
              {getGreeting()}, Ko Kyaw!
            </h1>
            <p className="text-sm md:text-base text-[#64748B] font-medium flex items-center gap-2 mt-1">
              <Clock size={16} className="flex-shrink-0" aria-hidden="true" /> 
              <span className="truncate">Welcome to the A7 Command Center.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] hidden lg:block" aria-live="polite">
              <span className="sr-only">Last synced at</span>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-11 h-11 min-h-[44px] flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#E63946] hover:border-[#E63946] active:bg-[#F8F9FA] transition-all shadow-sm focus-visible:ring-4 ring-[#FFEBEE] outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Global Data"
              aria-label={isRefreshing ? "Refreshing data" : "Refresh Global Data"}
              aria-busy={isRefreshing}
            >
              <RefreshCw size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Date Range Filter - Always Visible */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-[#FFEBEE] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Calendar size={18} className="text-[#E63946]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">Time Range</p>
              <p className="text-[10px] font-bold text-[#94A3B8] truncate">Select reporting period</p>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="bg-[#F8F9FA] border border-[#E2E8F0] p-1 md:p-1.5 rounded-lg md:rounded-xl flex flex-wrap items-center shadow-sm gap-1 md:gap-0" role="tablist" aria-label="Time range selection">
              {(['today', 'yesterday', 'week', 'month'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  role="tab"
                  aria-selected={timeRange === range}
                  aria-controls="dashboard-content"
                  className={`px-3 md:px-5 py-2 md:py-2.5 min-h-[44px] rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all focus-visible:ring-4 ring-[#FFEBEE] outline-none ${
                    timeRange === range 
                      ? 'bg-[#E63946] text-white shadow-lg shadow-red-100' 
                      : 'text-[#64748B] hover:bg-white active:bg-white md:hover:bg-white'
                  }`}
                >
                  {range}
                </button>
              ))}
              <button
                onClick={() => {
                  if (timeRange !== 'custom') {
                    setTimeRange('custom');
                  } else {
                    setIsCustomModalOpen(true);
                  }
                }}
                role="tab"
                aria-selected={timeRange === 'custom'}
                aria-controls="dashboard-content"
                className={`px-3 md:px-5 py-2 md:py-2.5 min-h-[44px] rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 focus-visible:ring-4 ring-[#FFEBEE] outline-none ${
                  timeRange === 'custom' 
                    ? 'bg-[#E63946] text-white shadow-lg shadow-red-100' 
                    : 'text-[#64748B] hover:bg-white active:bg-white md:hover:bg-white'
                }`}
              >
                <Calendar size={12} className="md:w-[14px] md:h-[14px]" aria-hidden="true" />
                <span className="hidden sm:inline">Custom</span>
                <span className="sm:hidden">C</span>
              </button>
            </div>

            {/* Inline Custom Date Range - Visible when Custom is selected */}
            <AnimatePresence>
              {timeRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto overflow-hidden"
                >
                  <div className="hidden sm:block h-8 w-[1px] bg-[#E2E8F0]" aria-hidden="true"></div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 bg-[#FFEBEE] px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border-2 border-[#E63946]/20 flex-1 sm:flex-initial">
                    <div className="flex items-center gap-2">
                      <label htmlFor="start-date" className="text-[10px] font-black text-[#E63946] uppercase tracking-wider flex-shrink-0">
                        From
                      </label>
                      <input 
                        id="start-date"
                        type="date" 
                        value={customRange.start}
                        onChange={(e) => {
                          setCustomRange(prev => ({ ...prev, start: e.target.value }));
                          setTimeRange('custom');
                        }}
                        className="flex-1 min-h-[44px] px-3 py-2 bg-white border-2 border-[#E63946]/30 rounded-lg text-sm font-black text-[#0F172A] focus:ring-4 ring-[#FFEBEE] focus:border-[#E63946] outline-none transition-all"
                        aria-label="Start date"
                      />
                    </div>
                    <div className="hidden sm:block w-8 h-[1px] sm:h-8 sm:w-[1px] bg-[#E63946]/30" aria-hidden="true"></div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="end-date" className="text-[10px] font-black text-[#E63946] uppercase tracking-wider flex-shrink-0">
                        To
                      </label>
                      <input 
                        id="end-date"
                        type="date" 
                        value={customRange.end}
                        onChange={(e) => {
                          setCustomRange(prev => ({ ...prev, end: e.target.value }));
                          setTimeRange('custom');
                        }}
                        className="flex-1 min-h-[44px] px-3 py-2 bg-white border-2 border-[#E63946]/30 rounded-lg text-sm font-black text-[#0F172A] focus:ring-4 ring-[#FFEBEE] focus:border-[#E63946] outline-none transition-all"
                        aria-label="End date"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCustomModalOpen(true)}
                    className="w-11 h-11 min-h-[44px] sm:w-auto sm:h-auto sm:p-2 flex items-center justify-center sm:rounded-lg rounded-xl bg-[#F8F9FA] hover:bg-white active:bg-white transition-colors text-[#64748B] hover:text-[#E63946] focus-visible:ring-4 ring-[#FFEBEE] outline-none"
                    title="Advanced options"
                    aria-label="Advanced date options"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Stat Grid */}
      <section 
        id="dashboard-content"
        role="region"
        aria-label="Key performance metrics"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6"
      >
        {statCards.map((stat, i) => (
          <MetricCard
            key={`${stat.label}-${i}`}
            {...stat}
            index={i}
            onClick={() => {}}
          />
        ))}
      </section>

      {/* Main Content Grid: Chart (2/3) and Sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <A7Card className="lg:col-span-2 flex flex-col h-64 md:h-72 lg:h-80 xl:min-h-[500px] !p-4 md:!p-6 lg:!p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 lg:mb-10 gap-3 md:gap-4">
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl lg:text-2xl font-black text-[#0F172A] tracking-tight">
                Revenue Performance
              </h2>
              <p className="text-xs md:text-sm font-medium text-[#64748B] truncate">
                Trend analysis for <span className="text-[#E63946] font-bold uppercase">{timeRange}</span>
              </p>
            </div>
            <div className="flex bg-[#F8F9FA] p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-[#E2E8F0] flex-shrink-0">
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-lg md:rounded-xl shadow-sm text-[9px] md:text-[10px] font-black text-[#E63946] uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" aria-hidden="true" />
                Live View
              </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px] md:min-h-[250px] lg:min-h-[350px]" role="img" aria-label={`Revenue chart showing ${timeRange} performance`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E63946" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 900}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 900}} 
                  tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`} 
                />
                <Tooltip 
                  cursor={{ stroke: '#E63946', strokeWidth: 2, strokeDasharray: '6 6' }}
                  contentStyle={{
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '16px',
                    background: '#fff'
                  }}
                  itemStyle={{fontWeight: '900', color: '#E63946', fontSize: '14px'}}
                  labelStyle={{fontWeight: '900', marginBottom: '6px', color: '#0F172A', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em'}}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'NET SALES']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#E63946" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </A7Card>

        {/* Right Sidebar Stack */}
        <aside className="flex flex-col gap-4 md:gap-6 lg:gap-8" aria-label="Quick actions and recent activity">
          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Live Feed / Recent Activity Card */}
          <A7Card className="flex flex-col h-64 md:h-72 lg:flex-1 lg:min-h-[400px] !p-4 md:!p-6 lg:!p-8 bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-black text-[#0F172A] tracking-tight">Recent Activity</h2>
                <p className="text-[9px] md:text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Real-time Stream</p>
              </div>
              <div className="flex h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-50 items-center justify-center flex-shrink-0" aria-hidden="true">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#E63946] animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar space-y-3 md:space-y-4 lg:space-y-5" role="log" aria-live="polite" aria-label="Recent order activity">
              {filteredOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] text-center p-10 opacity-40">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
                    <ClipboardList size={40} />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest text-[#0F172A]">Quiet period</p>
                  <p className="text-xs font-bold mt-2 leading-relaxed">No transactions recorded.</p>
                </div>
              ) : (
                filteredOrders.slice().reverse().map((order) => {
                  const isRecent = (Date.now() - new Date(order.createdAt).getTime()) < 600000;
                  return (
                    <ActivityItem
                      key={order.id}
                      order={order}
                      isRecent={isRecent}
                      onClick={() => navigate('/app/pos')}
                    />
                  );
                })
              )}
            </div>
            
            <div className="pt-4 md:pt-6 mt-3 md:mt-4 border-t border-[#F1F5F9]">
              <A7Button 
                variant="ghost" 
                className="w-full h-12 md:h-14 min-h-[44px] rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] hover:text-[#E63946] active:text-[#E63946] border border-dashed border-[#E2E8F0] hover:bg-red-50 active:bg-red-50 transition-all focus-visible:ring-4 ring-[#FFEBEE] outline-none"
                onClick={() => navigate('/app/orders')}
                aria-label="View full order audit"
              >
                View Full Audit
              </A7Button>
            </div>
          </A7Card>
        </aside>
      </div>

      {/* Custom Date Range Modal */}
      <A7Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Custom Date Range"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="modal-start-date" className="text-xs font-black uppercase text-[#64748B]">
                Start Date
              </label>
              <input 
                id="modal-start-date"
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl font-bold focus:ring-4 ring-[#FFEBEE] outline-none"
                aria-label="Start date"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="modal-end-date" className="text-xs font-black uppercase text-[#64748B]">
                End Date
              </label>
              <input 
                id="modal-end-date"
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl font-bold focus:ring-4 ring-[#FFEBEE] outline-none"
                aria-label="End date"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <A7Button 
              className="flex-1 h-12 md:h-14 min-h-[44px] rounded-xl md:rounded-2xl text-base md:text-lg font-black focus-visible:ring-4 ring-[#FFEBEE] outline-none"
              onClick={() => {
                setTimeRange('custom');
                setIsCustomModalOpen(false);
              }}
              aria-label="Apply custom date range"
            >
              <Check size={18} className="md:w-5 md:h-5" aria-hidden="true" /> Apply Range
            </A7Button>
            <A7Button 
              variant="secondary" 
              className="px-6 md:px-8 h-12 md:h-14 min-h-[44px] rounded-xl md:rounded-2xl focus-visible:ring-4 ring-[#FFEBEE] outline-none"
              onClick={() => setIsCustomModalOpen(false)}
              aria-label="Cancel date range selection"
            >
              <X size={18} className="md:w-5 md:h-5" aria-hidden="true" /> Cancel
            </A7Button>
          </div>
        </div>
      </A7Modal>
    </div>
  );
};
