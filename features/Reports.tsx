
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, Label
} from 'recharts';
import { A7Card, A7Button, A7Modal } from '../components/A7UI';
import { useGlobal } from '../Providers';
import { 
  Calendar, Download, Filter, TrendingUp, 
  MoreVertical, ChevronRight, X, Check, Clock, FileText, Loader2,
  MapPin, Phone, Mail, Globe, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionButton } from '../components/PermissionGuard';

type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export const Reports: React.FC = () => {
  const { orders, menu, restaurant } = useGlobal();
  const { hasPermission } = usePermissions();
  const canExport = hasPermission('export_data');
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom Date States
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Filtering Logic
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

  // Derived Analytics Data
  const analytics = useMemo(() => {
    const stats: Record<string, { sales: number; qty: number; color: string; name: string }> = {};
    const colors = ['#E63946', '#10B981', '#3B82F6', '#F59E0B', '#94A3B8', '#8B5CF6', '#EC4899'];
    
    // Initialize with categories
    menu.categories.forEach((cat, index) => {
      stats[cat.id] = { 
        sales: 0, 
        qty: 0, 
        color: colors[index % colors.length],
        name: cat.name 
      };
    });

    let totalItemsCount = 0;
    let totalSalesValue = 0;

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menu.items.find(mi => mi.id === item.menuItemId);
        if (menuItem && stats[menuItem.categoryId]) {
          const itemSales = item.qty * item.unitPrice;
          stats[menuItem.categoryId].sales += itemSales;
          stats[menuItem.categoryId].qty += item.qty;
          totalItemsCount += item.qty;
          totalSalesValue += itemSales;
        }
      });
    });

    const categoryData = Object.values(stats).filter(s => s.sales > 0 || s.qty > 0);
    const salesMixData = categoryData.map(s => ({
      name: s.name,
      value: totalSalesValue > 0 ? Math.round((s.sales / totalSalesValue) * 100) : 0,
      color: s.color
    }));

    return {
      categoryData,
      salesMixData,
      totalItemsCount,
      totalSalesValue,
      orderCount: filteredOrders.length,
      averageOrderValue: filteredOrders.length > 0 ? totalSalesValue / filteredOrders.length : 0
    };
  }, [filteredOrders, menu]);

  const handleExportPDF = () => {
    if (!canExport) {
      alert('You do not have permission to export data. Please contact your manager.');
      return;
    }
    setIsExporting(true);
    // Brief timeout to allow UI to settle before print dialog
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:p-0 print:space-y-6">
      
      {/* PROFESSIONAL PRINT-ONLY HEADER */}
      <div className="hidden print:flex justify-between items-start border-b-4 border-[#E63946] pb-8 mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#E63946] rounded-xl flex items-center justify-center text-white font-black text-2xl">A7</div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">{restaurant.name}</h1>
          </div>
          <div className="flex flex-col gap-1 text-[#64748B] font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-[#E63946]" /> {restaurant.address}</div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-[#E63946]" /> {restaurant.phone}</div>
            <div className="flex items-center gap-2"><Mail size={14} className="text-[#E63946]" /> {restaurant.email}</div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="bg-[#FFEBEE] px-4 py-2 rounded-xl inline-block">
             <span className="text-[#E63946] font-black text-sm uppercase tracking-[0.2em]">Official Revenue Report</span>
          </div>
          <p className="text-xs font-bold text-slate-500">Date Range: <span className="text-[#0F172A]">{timeRange === 'custom' ? `${customRange.start} - ${customRange.end}` : timeRange.toUpperCase()}</span></p>
          <p className="text-[10px] font-bold text-slate-400">Generated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Header (Screen View) */}
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Performance Analytics</h2>
            <p className="text-[#64748B] font-medium flex items-center gap-2 mt-1">
              Reporting Period: <span className="text-[#E63946] font-bold uppercase">{timeRange === 'custom' ? `${customRange.start} to ${customRange.end}` : timeRange}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <A7Button 
              variant="secondary" 
              className="rounded-xl h-11 px-5 border-2 border-[#E2E8F0] bg-white group"
              onClick={handleExportPDF}
              disabled={isExporting || !canExport}
              title={!canExport ? 'Requires export_data permission' : undefined}
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin text-[#E63946]" />
              ) : (
                <FileText size={18} className="group-hover:text-[#E63946] transition-colors" />
              )}
              <span className="ml-1 font-black text-xs uppercase tracking-widest">Export PDF</span>
            </A7Button>
          </div>
        </div>

        {/* Date Range Filter - Always Visible */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFEBEE] rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-[#E63946]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">Time Range</p>
              <p className="text-[10px] font-bold text-[#94A3B8]">Select reporting period</p>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-3">
            <div className="flex bg-[#F8F9FA] border border-[#E2E8F0] p-1 rounded-xl shadow-sm">
              {(['today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                    timeRange === range 
                      ? 'bg-[#E63946] text-white shadow-md' 
                      : 'text-[#64748B] hover:bg-white'
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
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${
                  timeRange === 'custom' 
                    ? 'bg-[#E63946] text-white shadow-md' 
                    : 'text-[#64748B] hover:bg-white'
                }`}
              >
                <Calendar size={14} />
                Custom
              </button>
            </div>

            {/* Inline Custom Date Range - Visible when Custom is selected */}
            {timeRange === 'custom' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-8 w-[1px] bg-[#E2E8F0]"></div>
                <div className="flex items-center gap-3 bg-[#FFEBEE] px-4 py-2.5 rounded-xl border-2 border-[#E63946]/20">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-[#E63946] uppercase tracking-wider">From</label>
                    <input 
                      type="date" 
                      value={customRange.start}
                      onChange={(e) => {
                        setCustomRange(prev => ({ ...prev, start: e.target.value }));
                        setTimeRange('custom');
                      }}
                      className="px-3 py-1.5 bg-white border-2 border-[#E63946]/30 rounded-lg text-sm font-black text-[#0F172A] focus:ring-4 ring-[#FFEBEE] focus:border-[#E63946] outline-none transition-all"
                    />
                  </div>
                  <div className="w-8 h-[1px] bg-[#E63946]/30"></div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-[#E63946] uppercase tracking-wider">To</label>
                    <input 
                      type="date" 
                      value={customRange.end}
                      onChange={(e) => {
                        setCustomRange(prev => ({ ...prev, end: e.target.value }));
                        setTimeRange('custom');
                      }}
                      className="px-3 py-1.5 bg-white border-2 border-[#E63946]/30 rounded-lg text-sm font-black text-[#0F172A] focus:ring-4 ring-[#FFEBEE] focus:border-[#E63946] outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-[#64748B] hover:text-[#E63946]"
                  title="Advanced options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY SUMMARY METRICS BLOCK */}
      <div className="hidden print:grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total Net Revenue</p>
          <p className="text-2xl font-black text-[#E63946]">${analytics.totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Order Volume</p>
          <p className="text-2xl font-black text-[#0F172A]">{analytics.orderCount}</p>
        </div>
        <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Avg Ticket Size</p>
          <p className="text-2xl font-black text-[#0F172A]">${analytics.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#E2E8F0] text-center space-y-1">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Items Processed</p>
          <p className="text-2xl font-black text-[#0F172A]">{analytics.totalItemsCount}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-2">
        {/* Revenue Chart */}
        <A7Card className="lg:col-span-2 !p-8 flex flex-col h-[450px] print:h-[350px] print:col-span-1 print:border print:shadow-none chart-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight print:text-base">Revenue by Category</h3>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Gross sales performance</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            {analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} 
                    tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`} 
                  />
                  <Tooltip 
                    cursor={{fill: '#F8F9FA'}}
                    contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{fontWeight: '900', fontSize: '14px'}}
                    labelStyle={{fontWeight: '700', marginBottom: '4px', color: '#0F172A'}}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={40}>
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">No sales data for this period</p>
              </div>
            )}
          </div>
        </A7Card>

        {/* Mix Chart */}
        <A7Card className="!p-8 flex flex-col h-[450px] print:h-[350px] print:border print:shadow-none chart-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight print:text-base">Product Sales Mix</h3>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Volume Distribution</p>
            </div>
          </div>
          <div className="flex-1 relative">
            {analytics.salesMixData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.salesMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.salesMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label 
                      width={30} 
                      position="center"
                      content={({ viewBox }) => {
                        const { cx, cy } = viewBox as any;
                        return (
                          <g>
                            <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" className="fill-[#0F172A] text-xl font-black">
                              {analytics.totalItemsCount >= 1000 ? (analytics.totalItemsCount/1000).toFixed(1) + 'k' : analytics.totalItemsCount}
                            </text>
                            <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="middle" className="fill-[#94A3B8] text-[9px] font-black uppercase tracking-widest">
                              Items
                            </text>
                          </g>
                        );
                      }}
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    formatter={(value, entry: any) => (
                      <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider ml-1">
                        {value} <span className="text-[#0F172A]">{entry.payload.value}%</span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <PieChart size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs text-center">No distribution data</p>
              </div>
            )}
          </div>
        </A7Card>
      </div>

      {/* History Table */}
      <A7Card className="!p-8 print:border print:shadow-none print:p-6">
        <div className="flex items-center justify-between mb-8 print:mb-6">
          <div>
            <h3 className="text-xl font-black text-[#0F172A] tracking-tight print:text-base">Transaction Audit Log</h3>
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Full breakdown of processed orders</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-[#F1F5F9]">
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Order #</th>
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Date</th>
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Type</th>
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Items</th>
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Total Amount</th>
                <th className="pb-4 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[#94A3B8]">
                    <p className="font-black uppercase tracking-widest text-xs">No records found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 50).map((order) => (
                  <tr key={order.id} className="group hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-5 font-black text-[#0F172A] print:py-3 print:text-xs">#{order.orderNumber}</td>
                    <td className="py-5 text-sm font-bold text-[#64748B] print:py-3 print:text-[10px]">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-5 print:py-3">
                      <span className="px-3 py-1 bg-slate-100 text-[#0F172A] rounded-lg text-[10px] font-black uppercase tracking-widest print:bg-transparent print:p-0">
                        {order.type === 'dine-in' ? `T-${order.tableId}` : order.type}
                      </span>
                    </td>
                    <td className="py-5 print:py-3">
                      <span className="text-[10px] font-bold text-[#64748B] line-clamp-1">{order.items.map(i => i.name).join(', ')}</span>
                    </td>
                    <td className="py-5 font-black text-[#E63946] print:py-3 print:text-xs">${order.total.toFixed(2)}</td>
                    <td className="py-5 print:py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest print:p-0 print:bg-transparent ${
                        order.status === 'preparing' 
                        ? 'bg-orange-100 text-orange-600' 
                        : order.status === 'ready' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredOrders.length > 50 && (
            <p className="mt-8 text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] print:block hidden border-t border-dashed border-slate-200 pt-4">
              * Report truncated to first 50 records. Access Digital OS for full audit.
            </p>
          )}
        </div>
      </A7Card>

      {/* PRINT FOOTER */}
      <div className="hidden print:flex justify-between items-center pt-8 border-t border-[#E2E8F0]">
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Generated via A7 Restaurant Operating System • {restaurant.name}</p>
        <p className="text-[10px] font-bold text-[#94A3B8]">Page 1 of 1</p>
      </div>

      {/* Custom Date Modal (Screen Only) */}
      <A7Modal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="Custom Date Range"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#64748B]">Start Date</label>
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl font-bold focus:ring-4 ring-[#FFEBEE] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#64748B]">End Date</label>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl font-bold focus:ring-4 ring-[#FFEBEE] outline-none"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <A7Button 
              className="flex-1 h-14 rounded-2xl text-lg font-black"
              onClick={() => {
                setTimeRange('custom');
                setIsCustomModalOpen(false);
              }}
            >
              <Check size={20} /> Apply Range
            </A7Button>
            <A7Button 
              variant="secondary" 
              className="px-8 h-14 rounded-2xl"
              onClick={() => setIsCustomModalOpen(false)}
            >
              <X size={20} /> Cancel
            </A7Button>
          </div>
        </div>
      </A7Modal>
    </div>
  );
};
