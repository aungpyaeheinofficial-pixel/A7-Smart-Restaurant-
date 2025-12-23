
import React, { useState, useMemo } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Button, A7Badge, A7Modal } from '../components/A7UI';
import { 
  Search, Filter, Eye, Download, Printer, 
  ChevronRight, Clock, MapPin, ShoppingBag, 
  ArrowUpDown, ChevronLeft, ChevronDown, 
  Calendar, ReceiptText, Loader2
} from 'lucide-react';
import { Order } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvExport';
import { usePermissions } from '../hooks/usePermissions';

type SortKey = 'createdAt' | 'total';
type SortDirection = 'asc' | 'desc';

export const OrdersMgmt: React.FC = () => {
  const { orders } = useGlobal();
  const { hasPermission } = usePermissions();
  
  // State for filtering, sorting, and pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const itemsPerPage = 8;
  const canExport = hasPermission('export_data');

  // 1. Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
        o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // 2. Sorting Logic
  const sortedOrders = useMemo(() => {
    const sortable = [...filteredOrders];
    sortable.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredOrders, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, currentPage]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <A7Badge variant="success">Paid</A7Badge>;
      case 'ready': return <A7Badge variant="info">Ready</A7Badge>;
      case 'preparing': return <A7Badge variant="warning">Preparing</A7Badge>;
      case 'pending': return <A7Badge variant="info">New</A7Badge>;
      case 'served': return <A7Badge variant="success">Served</A7Badge>;
      default: return <A7Badge>{status}</A7Badge>;
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    
    try {
      // Prepare CSV data with all order details
      const csvData = sortedOrders.map(order => {
        const itemsList = order.items.map(item => {
          let itemStr = `${item.qty}x ${item.name}`;
          if (item.modifiers && item.modifiers.length > 0) {
            itemStr += ` (${item.modifiers.map(m => m.name).join(', ')})`;
          }
          if (item.notes) {
            itemStr += ` [Note: ${item.notes}]`;
          }
          return itemStr;
        }).join('; ');
        
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        
        return {
          'Order Number': order.orderNumber,
          'Order ID': order.id,
          'Date': formattedDate,
          'Time': formattedTime,
          'Type': order.type,
          'Table ID': order.tableId || 'N/A',
          'Status': order.status,
          'Items': itemsList,
          'Item Count': order.items.length,
          'Subtotal': order.subtotal.toFixed(2),
          'Tax': order.tax.toFixed(2),
          'Tip': order.tip.toFixed(2),
          'Total': order.total.toFixed(2),
        };
      });

      const headers = [
        'Order Number',
        'Order ID',
        'Date',
        'Time',
        'Type',
        'Table ID',
        'Status',
        'Items',
        'Item Count',
        'Subtotal',
        'Tax',
        'Tip',
        'Total'
      ];

      const csvContent = convertToCSV(csvData, headers);
      const filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Order History</h2>
          <p className="text-[#64748B] font-medium text-sm mt-1">Audit, track, and manage all restaurant transactions.</p>
        </div>
        <div className="flex gap-3">
          {canExport && (
            <A7Button 
              variant="secondary" 
              className="rounded-xl px-5 border-2 border-[#E2E8F0]"
              onClick={handleExportCSV}
              disabled={isExporting || sortedOrders.length === 0}
            >
              {isExporting ? (
                <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </A7Button>
          )}
          {canExport && (
            <A7Button variant="secondary" className="rounded-xl px-5 border-2 border-[#E2E8F0]">
              <Printer size={18} strokeWidth={2.5} /> Print Daily Log
            </A7Button>
          )}
        </div>
      </div>

      <A7Card className="!p-0 overflow-hidden bg-white border-[#E2E8F0] shadow-xl rounded-[2rem]">
        {/* Filter Bar */}
        <div className="p-6 border-b border-[#F1F5F9] flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-white">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by order # or items..." 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F8F9FA] border-2 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-[#E63946]/20 focus:ring-4 ring-[#E63946]/5 transition-all font-bold text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                className="w-full pl-10 pr-10 py-3.5 bg-[#F8F9FA] border-2 border-transparent rounded-[1.25rem] text-sm font-black text-[#0F172A] outline-none appearance-none focus:bg-white focus:border-[#E63946]/20 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">New</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
                <option value="paid">Paid</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 px-4 py-3.5 bg-[#F8F9FA] border-2 border-transparent rounded-[1.25rem] text-sm font-black text-[#0F172A] cursor-pointer hover:bg-white hover:border-[#E2E8F0] transition-all">
              <Calendar size={16} className="text-[#94A3B8]" />
              <span>Today: Mar 07, 2025</span>
              <ChevronDown size={14} className="text-[#94A3B8]" />
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8F9FA]/50">
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Order ID</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em] text-center">Type</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Items</th>
                <th 
                  className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em] cursor-pointer hover:text-[#E63946] transition-colors"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center gap-2">
                    Total <ArrowUpDown size={14} className={sortConfig.key === 'total' ? 'text-[#E63946]' : ''} />
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Status</th>
                <th 
                  className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em] cursor-pointer hover:text-[#E63946] transition-colors"
                  onClick={() => requestSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Date & Time <ArrowUpDown size={14} className={sortConfig.key === 'createdAt' ? 'text-[#E63946]' : ''} />
                  </div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center text-[#94A3B8]">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <ShoppingBag size={64} strokeWidth={1} />
                      <div>
                        <p className="text-xl font-black text-[#0F172A]">No Matching Orders</p>
                        <p className="text-sm font-medium mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, idx) => (
                  <tr key={order.id} className={`transition-all group hover:bg-[#F8F9FA] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]/50'}`}>
                    <td className="px-8 py-6">
                      <span className="font-black text-[#0F172A] text-[15px]">#{order.orderNumber}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {order.type === 'dine-in' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                             <MapPin size={10} /> Table {order.tableId}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                             <ShoppingBag size={10} /> Takeout
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-[#64748B] line-clamp-1 max-w-[240px]">
                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-[#0F172A] text-md">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="scale-90 origin-left">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#0F172A]">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[11px] font-bold text-[#94A3B8] uppercase">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="w-10 h-10 inline-flex items-center justify-center bg-white border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-[#E63946] hover:border-[#E63946] hover:shadow-lg shadow-sm transition-all active:scale-95"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="p-6 bg-white border-t border-[#F1F5F9] flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B]">
              Showing <span className="text-[#0F172A] font-black">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[#0F172A] font-black">{Math.min(currentPage * itemsPerPage, sortedOrders.length)}</span> of <span className="text-[#0F172A] font-black">{sortedOrders.length}</span> orders
            </p>
            <div className="flex gap-2">
              <A7Button 
                variant="secondary" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-10 w-10 !p-0 rounded-xl"
              >
                <ChevronLeft size={18} />
              </A7Button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-10 w-10 rounded-xl font-black text-xs transition-all ${
                    currentPage === i + 1 
                      ? 'bg-[#E63946] text-white shadow-lg shadow-red-100' 
                      : 'text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <A7Button 
                variant="secondary" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-10 w-10 !p-0 rounded-xl"
              >
                <ChevronRight size={18} />
              </A7Button>
            </div>
          </div>
        )}
      </A7Card>

      {/* Order Detail Modal */}
      <A7Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Receipt Summary: #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Transaction ID: {selectedOrder.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-bold text-[#0F172A]">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-[1.5rem] p-6 space-y-4 border border-[#E2E8F0]">
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-[#E2E8F0] pb-2">Line Items</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start group">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[10px] font-black text-[#E63946]">
                      {item.qty}
                    </span>
                    <div>
                      <p className="font-black text-[#0F172A] text-sm">{item.name}</p>
                      {item.notes && <p className="text-[10px] text-emerald-600 font-bold italic mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">Note: {item.notes}</p>}
                    </div>
                  </div>
                  <span className="font-black text-[#0F172A] text-sm">${(item.unitPrice * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="px-2 space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <span>Subtotal</span>
                <span>${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <span>Sales Tax (8%)</span>
                <span>${selectedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <span>Gratuity</span>
                <span>${selectedOrder.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-5 mt-4 border-t-2 border-dashed border-[#E2E8F0] items-center">
                <span className="text-xl font-black text-[#0F172A]">Grand Total</span>
                <span className="text-3xl font-black text-[#E63946]">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <A7Button variant="secondary" className="h-14 rounded-2xl border-2 font-black shadow-sm">
                <Printer size={20} /> Duplicate Receipt
              </A7Button>
              <A7Button className="h-14 rounded-2xl font-black shadow-lg shadow-red-100" onClick={() => setSelectedOrder(null)}>
                Dismiss
              </A7Button>
            </div>
          </div>
        )}
      </A7Modal>
    </div>
  );
};
