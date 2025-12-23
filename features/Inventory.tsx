
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Button, A7Badge, A7Modal } from '../components/A7UI';
import { 
  Package, AlertCircle, TrendingDown, Plus, Minus, 
  Search, ArrowRight, ChevronRight, MoreHorizontal,
  Box, ArrowUpRight, ArrowDownLeft, ChevronDown,
  FileSpreadsheet, AlertTriangle, CheckCircle2,
  Trash2, X, Info
} from 'lucide-react';
import { InventoryItem } from '../types';
import { useForm } from 'react-hook-form';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Inventory Dashboard Component
 */
export const Inventory: React.FC = () => {
  const { inventory, updateInventory, createInventory, bulkCreateInventory } = useGlobal();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [receivingItem, setReceivingItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState(0);
  
  const canManageInventory = hasPermission('manage_inventory');

  // Deriving Stats for KPIs
  const stats = useMemo(() => {
    const alerts = inventory.filter(i => i.onHand <= i.parLevel).length;
    const expiring = 2; 
    return {
      restockAlerts: alerts,
      totalSkus: inventory.length,
      expiringSoon: expiring
    };
  }, [inventory]);

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleReceive = async () => {
    if (!receivingItem) return;
    await updateInventory(receivingItem.id, { 
      onHand: receivingItem.onHand + receiveAmount 
    });
    setReceivingItem(null);
    setReceiveAmount(0);
  };

  const handleAddInventoryItem = async (data: any) => {
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: data.name,
      sku: data.sku,
      onHand: parseFloat(data.onHand),
      parLevel: parseFloat(data.parLevel),
      unit: data.unit,
      unitCost: parseFloat(data.unitCost),
      status: 'In Stock'
    };
    await createInventory(newItem);
    setIsAddModalOpen(false);
  };

  const handleBulkImport = async (items: InventoryItem[]) => {
    await bulkCreateInventory(items);
    setIsImportModalOpen(false);
  };

  const getStatusInfo = (onHand: number, parLevel: number) => {
    if (onHand <= 0) return { label: 'OUT OF STOCK', variant: 'error' as const };
    if (onHand <= parLevel) return { label: 'LOW STOCK', variant: 'warning' as const };
    return { label: 'IN STOCK', variant: 'success' as const };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <A7Card className="!p-0 overflow-hidden border-none shadow-sm group" hoverEffect>
          <div className="p-6 bg-[#FFEBEE] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#E63946] uppercase tracking-[0.2em]">Restock Alerts</p>
              <h3 className="text-4xl font-black text-[#E63946]">{stats.restockAlerts}</h3>
            </div>
            <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center text-[#E63946] group-hover:scale-110 transition-transform">
              <AlertCircle size={28} />
            </div>
          </div>
          <div className="px-6 py-3 bg-white/50 border-t border-[#E63946]/10 flex items-center gap-2">
            <span className="text-[10px] font-black text-[#E63946] uppercase">Critical Items</span>
            <ChevronRight size={14} className="text-[#E63946]" />
          </div>
        </A7Card>

        <A7Card className="!p-0 overflow-hidden border-none shadow-sm group" hoverEffect>
          <div className="p-6 bg-[#D1FAE5] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#059669] uppercase tracking-[0.2em]">Total SKUs</p>
              <h3 className="text-4xl font-black text-[#059669]">{stats.totalSkus}</h3>
            </div>
            <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
              <Package size={28} />
            </div>
          </div>
          <div className="px-6 py-3 bg-white/50 border-t border-[#059669]/10 flex items-center gap-2">
            <span className="text-[10px] font-black text-[#059669] uppercase">Catalog View</span>
            <ChevronRight size={14} className="text-[#059669]" />
          </div>
        </A7Card>

        <A7Card className="!p-0 overflow-hidden border-none shadow-sm group" hoverEffect>
          <div className="p-6 bg-[#DBEAFE] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">Expiring Soon</p>
              <h3 className="text-4xl font-black text-[#1D4ED8]">{stats.expiringSoon}</h3>
            </div>
            <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center text-[#1D4ED8] group-hover:scale-110 transition-transform">
              <TrendingDown size={28} />
            </div>
          </div>
          <div className="px-6 py-3 bg-white/50 border-t border-[#1D4ED8]/10 flex items-center gap-2">
            <span className="text-[10px] font-black text-[#1D4ED8] uppercase">Waste Forecast</span>
            <ChevronRight size={14} className="text-[#1D4ED8]" />
          </div>
        </A7Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search inventory by name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl outline-none focus:ring-4 ring-[#E63946]/5 focus:border-[#E63946]/20 transition-all font-bold text-sm"
          />
        </div>
        <div className="flex gap-3">
          {canManageInventory && (
            <>
              <A7Button variant="secondary" className="px-5 rounded-2xl border-2 border-[#E2E8F0]" onClick={() => setIsImportModalOpen(true)}>
                <ArrowDownLeft size={18} strokeWidth={3} /> Bulk Import
              </A7Button>
              <A7Button className="px-6 rounded-2xl shadow-xl shadow-red-100" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={20} strokeWidth={3} /> Add New Item
              </A7Button>
            </>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <A7Card className="!p-0 overflow-hidden bg-white border-[#E2E8F0] shadow-xl rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0]">
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Item Name</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">SKU</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Stock Level</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Par Level</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em]">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#64748B] uppercase tracking-[0.15em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredInventory.map(item => {
                const status = getStatusInfo(item.onHand, item.parLevel);
                return (
                  <tr key={item.id} className="group hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-[#E63946] transition-colors border border-transparent group-hover:border-red-100">
                          <Box size={20} />
                        </div>
                        <span className="font-black text-[#0F172A] text-[15px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-[#64748B] font-mono bg-slate-50 px-2 py-1 rounded-md">{item.sku}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-lg font-black ${item.onHand <= item.parLevel ? 'text-red-600' : 'text-[#0F172A]'}`}>
                          {item.onHand}
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#94A3B8]">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-[#64748B]">{item.parLevel} {item.unit}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="scale-90 origin-left">
                        <A7Badge variant={status.variant}>{status.label}</A7Badge>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <A7Button 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-xl border-2 border-[#E2E8F0] font-black text-[10px] uppercase tracking-widest hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-all"
                          onClick={() => setReceivingItem(item)}
                        >
                          Receive
                        </A7Button>
                        <button className="p-2 text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </A7Card>

      {/* Receive Stock Modal */}
      <A7Modal 
        isOpen={!!receivingItem} 
        onClose={() => { setReceivingItem(null); setReceiveAmount(0); }} 
        title={`Inventory Inbound: ${receivingItem?.name}`}
      >
        <div className="space-y-10 py-4">
          <div className="flex items-center justify-center gap-12 text-center animate-in zoom-in duration-300">
            <div className="space-y-1">
              <p className="text-4xl font-black text-[#94A3B8]">{receivingItem?.onHand}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">On Hand</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
              <ArrowRight size={24} className="text-[#94A3B8]" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-[#E63946]">
                {(receivingItem?.onHand || 0) + receiveAmount}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#E63946]">Updated Stock</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setReceiveAmount(Math.max(0, receiveAmount - 1))} 
              className="w-16 h-16 bg-[#F8F9FA] text-[#0F172A] rounded-2xl hover:bg-[#E2E8F0] transition-all flex items-center justify-center shadow-sm border border-slate-200 active:scale-90"
            >
              <Minus size={24} strokeWidth={3} />
            </button>
            <div className="relative group">
              <input 
                type="number" 
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(parseInt(e.target.value) || 0)}
                className="w-32 text-center text-5xl font-black border-none bg-transparent outline-none text-[#0F172A] selection:bg-red-100"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#E63946] rounded-full opacity-50"></div>
            </div>
            <button 
              onClick={() => setReceiveAmount(receiveAmount + 1)} 
              className="w-16 h-16 bg-[#F8F9FA] text-[#E63946] rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm border border-slate-200 active:scale-90"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <A7Button 
              className="h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest"
              onClick={handleReceive}
              disabled={receiveAmount <= 0}
            >
              <ArrowUpRight size={20} /> Post Inbound
            </A7Button>
            <A7Button 
              variant="secondary" 
              className="h-16 rounded-[1.5rem] font-black border-2 text-lg uppercase tracking-widest" 
              onClick={() => { setReceivingItem(null); setReceiveAmount(0); }}
            >
              Cancel
            </A7Button>
          </div>
        </div>
      </A7Modal>

      {/* Add New Item Modal */}
      <NewInventoryItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddInventoryItem}
      />

      {/* Bulk Import Full-Screen Overlay */}
      <BulkImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSave={handleBulkImport}
      />
    </div>
  );
};

interface NewInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const NewInventoryItemModal: React.FC<NewInventoryItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      onHand: 0,
      parLevel: 0,
      unit: 'pcs',
      unitCost: 0
    }
  });

  React.useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <A7Modal isOpen={isOpen} onClose={onClose} title="Add New Inventory SKU">
      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Item Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Tomato Sauce"
              className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#E63946] transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">SKU / Code</label>
            <input 
              {...register('sku')}
              placeholder="e.g. TS-101"
              className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#E63946] transition-all font-mono text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Initial Stock</label>
            <input 
              type="number" step="0.01"
              {...register('onHand')}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-black text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Par Level</label>
            <input 
              type="number" step="0.01"
              {...register('parLevel')}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-black text-sm text-[#E63946]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Unit</label>
            <div className="relative">
              <select 
                {...register('unit')}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="pcs">pcs</option>
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
                <option value="gallons">gallons</option>
                <option value="liters">liters</option>
                <option value="cases">cases</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Unit Cost ($)</label>
            <input 
              type="number" step="0.01"
              {...register('unitCost')}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-bold text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <A7Button type="submit" className="flex-1 h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest">
            Create Record
          </A7Button>
          <A7Button type="button" variant="secondary" className="px-10 h-16 rounded-[1.5rem] font-bold border-2" onClick={onClose}>
            Cancel
          </A7Button>
        </div>
      </form>
    </A7Modal>
  );
};

/**
 * Bulk Import Component (Excel-Style Smart Grid)
 * Optimized for full-screen mass data entry.
 */
interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: InventoryItem[]) => void;
}

interface GridRow {
  name: string;
  sku: string;
  onHand: string;
  parLevel: string;
  unit: string;
  unitCost: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSave }) => {
  const emptyRow = (): GridRow => ({ name: '', sku: '', onHand: '', parLevel: '', unit: 'pcs', unitCost: '' });
  const [gridData, setGridData] = useState<GridRow[]>(Array(5).fill(null).map(emptyRow));

  // Reset grid when modal opens
  useEffect(() => {
    if (isOpen) setGridData(Array(5).fill(null).map(emptyRow));
  }, [isOpen]);

  const cleanNumericInput = (val: string) => val.replace(/[$,]/g, '');

  const formatToCurrency = (val: string) => {
    const numeric = parseFloat(cleanNumericInput(val));
    return isNaN(numeric) ? val : numeric.toFixed(2);
  };

  const handleCellChange = (rowIndex: number, field: keyof GridRow, value: string) => {
    const newData = [...gridData];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    setGridData(newData);
  };

  const handleBlur = (rowIndex: number, field: keyof GridRow) => {
    if (field === 'unitCost' || field === 'onHand' || field === 'parLevel') {
      const value = gridData[rowIndex][field];
      if (value.trim() !== '') {
        const formatted = field === 'unitCost' ? formatToCurrency(value) : value.trim();
        handleCellChange(rowIndex, field, formatted);
      }
    }
  };

  const addRow = () => setGridData([...gridData, emptyRow()]);
  const removeRow = (idx: number) => setGridData(gridData.filter((_, i) => i !== idx));
  const clearGrid = () => setGridData(Array(5).fill(null).map(emptyRow));

  // Smart Paste Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;

    // Detect if Tab-Separated (Excel) or Newline-Separated
    const rows = pastedText.split(/\r?\n/).filter(row => row.trim() !== '');
    const newItems = rows.map(row => {
      const parts = row.split(/\t/); // Common for Excel TSV
      const data = parts.length > 1 ? parts : row.split(/[,;]/); // Fallback to CSV
      
      return {
        name: data[0] || '',
        sku: data[1] || '',
        onHand: data[2] || '',
        parLevel: data[3] || '',
        unit: data[4] || 'pcs',
        unitCost: data[5] ? formatToCurrency(cleanNumericInput(data[5])) : ''
      };
    });

    if (newItems.length > 0) {
      e.preventDefault();
      // Replace grid with pasted data or append? Typically replace for bulk clean ingest.
      setGridData(newItems);
    }
  };

  // Validation Logic
  const validateRow = (row: GridRow) => {
    const isNumeric = (val: string) => val.trim() !== '' && !isNaN(parseFloat(cleanNumericInput(val)));
    const errors = {
      onHand: row.onHand !== '' && !isNumeric(row.onHand),
      parLevel: row.parLevel !== '' && !isNumeric(row.parLevel),
      unitCost: row.unitCost !== '' && !isNumeric(row.unitCost),
      nameRequired: row.sku !== '' && row.name === ''
    };
    const hasError = Object.values(errors).some(v => v);
    const isEmpty = !row.name && !row.sku && !row.onHand;
    return { errors, hasError, isEmpty };
  };

  const validItems = gridData
    .map(validateRow)
    .filter(res => !res.isEmpty && !res.hasError).length;

  const totalErrors = gridData.filter(r => !validateRow(r).isEmpty && validateRow(r).hasError).length;

  const handleImport = () => {
    const payload: InventoryItem[] = gridData
      .filter(row => !validateRow(row).isEmpty && !validateRow(row).hasError)
      .map((row, i) => ({
        id: `inv-bulk-${Date.now()}-${i}`,
        name: row.name,
        sku: row.sku,
        onHand: parseFloat(cleanNumericInput(row.onHand)),
        parLevel: parseFloat(cleanNumericInput(row.parLevel)),
        unit: row.unit,
        unitCost: parseFloat(cleanNumericInput(row.unitCost)) || 0,
        status: 'In Stock'
      }));
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-screen animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      {/* FULL-SCREEN HEADER */}
      <header className="px-8 py-5 border-b border-[#E5E7EB] bg-white flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <span className="text-2xl font-black text-[#E63946]">A7</span>
             <span className="font-bold text-sm text-[#0F172A] hidden sm:block tracking-tight">INGEST TERMINAL</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-4 bg-[#F9FAFB] px-5 py-3 rounded-2xl border border-[#E5E7EB] max-w-xl">
            <FileSpreadsheet size={18} className="text-[#E63946] flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-black text-[#111827] uppercase tracking-wider">Spreadsheet Smart Paste</p>
              <p className="text-[10px] font-medium text-[#6B7280]">
                Required Columns: Name, SKU, Stock, Par Level, Unit, Unit Cost. Paste (Ctrl+V) anywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <A7Button variant="ghost" onClick={clearGrid} className="text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-widest px-5 h-11">
             Clear Grid
           </A7Button>
           <button 
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
           >
             <X size={28} strokeWidth={2.5} />
           </button>
        </div>
      </header>

      {/* EDITABLE SPREADSHEET AREA */}
      <main 
        className="flex-1 overflow-auto bg-[#F8F9FA] p-8 custom-scrollbar"
        onPaste={handlePaste}
      >
        <div className="max-w-full mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white border border-[#E5E7EB]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10 bg-[#F9FAFB] shadow-sm">
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[25%]">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[15%]">SKU Code</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[12%] text-center">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[12%] text-center">Par Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[12%] text-center">Unit</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#6B7280] uppercase tracking-widest w-[18%] text-right">Unit Cost ($)</th>
                <th className="px-6 py-4 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {gridData.map((row, idx) => {
                const { errors } = validateRow(row);
                return (
                  <tr key={idx} className="group hover:bg-[#F9FAFB] transition-colors bg-white">
                    <td className="p-0 border-r border-[#F3F4F6]">
                      <input 
                        type="text"
                        value={row.name}
                        onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Fresh Tomatoes"
                        className={`w-full px-6 py-4 bg-transparent border-none outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-[#E93B3B] transition-all placeholder:text-slate-300 ${errors.nameRequired ? 'bg-red-50' : ''}`}
                      />
                    </td>
                    <td className="p-0 border-r border-[#F3F4F6]">
                      <input 
                        type="text"
                        value={row.sku}
                        onChange={(e) => handleCellChange(idx, 'sku', e.target.value)}
                        placeholder="SKU-000"
                        className="w-full px-6 py-4 bg-transparent border-none outline-none font-mono text-xs focus:bg-white focus:ring-2 ring-[#E93B3B] transition-all"
                      />
                    </td>
                    <td className="p-0 border-r border-[#F3F4F6]">
                      <input 
                        type="text"
                        value={row.onHand}
                        onChange={(e) => handleCellChange(idx, 'onHand', e.target.value)}
                        onBlur={() => handleBlur(idx, 'onHand')}
                        className={`w-full px-6 py-4 bg-transparent border-none outline-none font-black text-sm text-center focus:bg-white focus:ring-2 ring-[#E93B3B] transition-all ${errors.onHand ? 'bg-[#FEF2F2] text-red-600' : ''}`}
                      />
                    </td>
                    <td className="p-0 border-r border-[#F3F4F6]">
                      <input 
                        type="text"
                        value={row.parLevel}
                        onChange={(e) => handleCellChange(idx, 'parLevel', e.target.value)}
                        onBlur={() => handleBlur(idx, 'parLevel')}
                        className={`w-full px-6 py-4 bg-transparent border-none outline-none font-black text-sm text-center text-[#E63946] focus:bg-white focus:ring-2 ring-[#E93B3B] transition-all ${errors.parLevel ? 'bg-[#FEF2F2]' : ''}`}
                      />
                    </td>
                    <td className="p-0 border-r border-[#F3F4F6]">
                      <div className="relative group/sel">
                        <select 
                          value={row.unit}
                          onChange={(e) => handleCellChange(idx, 'unit', e.target.value)}
                          className="w-full px-6 py-4 bg-transparent border-none outline-none font-bold text-xs appearance-none focus:bg-white transition-all text-center cursor-pointer"
                        >
                          <option value="pcs">pcs</option>
                          <option value="lbs">lbs</option>
                          <option value="oz">oz</option>
                          <option value="gallons">gal</option>
                          <option value="liters">l</option>
                          <option value="cases">case</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-0">
                      <input 
                        type="text"
                        value={row.unitCost}
                        onChange={(e) => handleCellChange(idx, 'unitCost', e.target.value)}
                        onBlur={() => handleBlur(idx, 'unitCost')}
                        className={`w-full px-6 py-4 bg-transparent border-none outline-none font-bold text-sm text-right focus:bg-white focus:ring-2 ring-[#E93B3B] transition-all ${errors.unitCost ? 'bg-[#FEF2F2] text-red-600' : ''}`}
                      />
                    </td>
                    <td className="px-4 text-center">
                      <button 
                        onClick={() => removeRow(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button 
            onClick={addRow}
            className="w-full py-6 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center justify-center gap-3 border-t border-[#F3F4F6] transition-colors"
          >
            <Plus size={18} strokeWidth={3} /> Append New Row
          </button>
        </div>

        {/* Status Indicator Banner */}
        {totalErrors > 0 && (
          <div className="mt-8 flex items-center gap-4 px-6 py-4 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 animate-in slide-in-from-top-4 shadow-xl max-w-4xl">
            <AlertTriangle size={24} />
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-wider">Validation Alert</p>
              <p className="text-xs font-bold opacity-80">We found {totalErrors} row(s) with invalid data. Please correct cells highlighted in red.</p>
            </div>
          </div>
        )}
      </main>

      {/* FULL-SCREEN FOOTER ACTIONS */}
      <footer className="px-8 py-6 bg-white border-t border-[#F1F5F9] flex items-center justify-between shadow-[0_-15px_30px_rgba(0,0,0,0.03)] sticky bottom-0 z-20">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Queue Summary</span>
              <span className="text-2xl font-black text-[#0F172A]">{validItems} Ready SKUs</span>
           </div>
           {totalErrors > 0 && (
             <div className="flex flex-col border-l border-slate-200 pl-8">
                <span className="text-[10px] font-black text-[#EF4444] uppercase tracking-[0.2em]">Critical Issues</span>
                <span className="text-2xl font-black text-[#EF4444]">{totalErrors} Rows</span>
             </div>
           )}
        </div>

        <div className="flex items-center gap-4">
           <A7Button 
            variant="secondary"
            className="px-10 h-16 rounded-[1.5rem] font-black border-2 text-lg uppercase tracking-widest transition-all" 
            onClick={onClose}
          >
            Cancel Ingest
          </A7Button>
          <A7Button 
            className="px-12 h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-red-200 uppercase tracking-[0.1em] min-w-[320px] transition-all"
            onClick={handleImport}
            disabled={validItems === 0 || totalErrors > 0}
          >
            <ArrowDownLeft size={24} strokeWidth={3} /> Post to Inventory
          </A7Button>
        </div>
      </footer>
    </div>
  );
};
