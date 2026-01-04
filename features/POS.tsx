
import React, { useState, useMemo } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Button, A7Modal } from '../components/A7UI';
import { 
  Search, ShoppingBag, Trash2, Plus, Minus, 
  CreditCard, Banknote, Smartphone,
  CheckCircle2, Info, ReceiptText, StickyNote,
  Heart, Shield, AlertCircle
} from 'lucide-react';
import { MenuItem, OrderItem, Order } from '../types';
import { usePermissions } from '../hooks/usePermissions';

export const POSTerminal: React.FC = () => {
  const { menu, createOrder, tables, orders } = useGlobal();
  const { hasPermission } = usePermissions();
  const canCreateOrder = hasPermission('create_order');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  
  // UI State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteItem, setEditingNoteItem] = useState<{id: string, name: string, notes?: string} | null>(null);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  // 1. Filter Logic
  const filteredItems = useMemo(() => {
    return menu.items.filter(item => 
      (activeCategory === 'all' || item.categoryId === activeCategory) &&
      (item.name.toLowerCase().includes(search.toLowerCase()) || 
       item.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [menu.items, activeCategory, search]);

  // 2. Cart Logic
  const addToCart = (item: MenuItem, priceOption: { size: string; amount: number }) => {
    const cartItemId = `${item.id}-${priceOption.size}`;
    const existingIndex = cart.findIndex(c => c.id === cartItemId);
    
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].qty += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        id: cartItemId,
        menuItemId: item.id,
        name: `${item.name}${item.prices.length > 1 ? ` (${priceOption.size})` : ''}`,
        qty: 1,
        unitPrice: priceOption.amount,
        notes: ''
      }]);
    }
    setPendingItem(null);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        return { ...c, qty: Math.max(0, c.qty + delta) };
      }
      return c;
    }).filter(c => c.qty > 0));
  };

  const handleUpdateNote = (notes: string) => {
    if (!editingNoteItem) return;
    setCart(cart.map(c => c.id === editingNoteItem.id ? { ...c, notes } : c));
    setIsNoteModalOpen(false);
    setEditingNoteItem(null);
  };

  // 3. Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax + tipAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!canCreateOrder) {
      alert('You do not have permission to create orders. Please contact your manager.');
      return;
    }
    
    try {
      const orderNumber = `A${Math.floor(Math.random() * 900 + 100)}`;
      const timestamp = Date.now();
      
      // Ensure order items have unique IDs and proper structure
      const orderItems = cart.map((item, index) => ({
        id: `oi-${timestamp}-${index}`,
        menuItemId: item.menuItemId,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        modifiers: item.modifiers,
        notes: item.notes || undefined, // Convert empty string to undefined
      }));
      
      const newOrder: Order = {
        id: `order-${timestamp}`,
        orderNumber,
        type: selectedTableId ? 'dine-in' : 'takeout',
        tableId: selectedTableId || undefined,
        status: 'pending',
        items: orderItems,
        subtotal,
        tax,
        tip: tipAmount,
        total,
        createdAt: new Date(),
      };

      await createOrder(newOrder);
      setLastOrderNumber(orderNumber);
      setCart([]);
      setSelectedTableId(null);
      setTipAmount(0);
      setIsPaymentModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      alert(`Failed to create order: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-0 -m-8 overflow-hidden bg-white">
      {/* LEFT PANEL (65% width) - Menu Grid */}
      <div className="flex-[0.65] flex flex-col bg-[#F8F9FA] border-r border-[#E2E8F0]">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-8 py-4 space-y-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={20} />
            <input 
              type="text" 
              placeholder="Search dishes, drinks, appetizers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F1F5F9] border-none rounded-2xl focus:ring-2 ring-[#E63946] transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all ${
                activeCategory === 'all' 
                ? 'bg-[#E63946] text-white shadow-lg shadow-red-100 scale-105' 
                : 'bg-white text-[#64748B] hover:bg-slate-50 border border-[#E2E8F0]'
              }`}
            >
              All Items
            </button>
            {menu.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-black transition-all flex items-center gap-2 ${
                  activeCategory === cat.id 
                  ? 'bg-[#E63946] text-white shadow-lg shadow-red-100 scale-105' 
                  : 'bg-white text-[#64748B] hover:bg-slate-50 border border-[#E2E8F0]'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => !item.is86d && (item.prices.length > 1 ? setPendingItem(item) : addToCart(item, item.prices[0]))}
              disabled={item.is86d}
              className={`group bg-white rounded-[2rem] p-4 border border-transparent shadow-sm transition-all text-left flex flex-col h-full active:scale-95 hover:border-[#E2E8F0] ${
                item.is86d ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div className="relative overflow-hidden rounded-[1.5rem] mb-4 aspect-square w-full bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${!item.is86d && 'group-hover:scale-110'}`} 
                />
                {item.is86d && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] bg-red-600 px-3 py-1.5 rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="flex-1 px-1">
                <h4 className="font-black text-[#0F172A] mb-1 leading-tight">{item.name}</h4>
                <p className="text-[11px] leading-relaxed text-[#64748B] line-clamp-2 font-medium">{item.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between px-1">
                <span className="font-black text-[#E63946] text-lg">
                  ${item.prices[0].amount.toFixed(2)}
                  {item.prices.length > 1 && <span className="text-[10px] text-[#94A3B8] ml-1 font-bold">+</span>}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  item.is86d ? 'bg-slate-200 text-slate-400' : 'bg-[#FFEBEE] text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white group-hover:rotate-90'
                }`}>
                  <Plus size={18} strokeWidth={3} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL (35% width) - Cart & Checkout */}
      <div className="flex-[0.35] flex flex-col h-full bg-white shadow-2xl relative z-10 border-l border-[#E2E8F0]">
        {/* Cart Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-[#F1F5F9]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFEBEE] rounded-2xl flex items-center justify-center">
              <ShoppingBag className="text-[#E63946]" size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#0F172A]">Current Cart</h3>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                {cart.reduce((sum, i) => sum + i.qty, 0)} Items Selected
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={() => setCart([])} 
              className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] text-center space-y-4 opacity-40">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-black text-lg text-[#0F172A]">Order is empty</p>
                <p className="text-xs font-bold">Add dishes from the menu to start</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#0F172A] leading-tight mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-[#64748B]">${item.unitPrice.toFixed(2)}</p>
                      <button 
                        onClick={() => {
                          setEditingNoteItem(item);
                          setIsNoteModalOpen(true);
                        }}
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase transition-colors px-2 py-0.5 rounded-lg ${
                          item.notes ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-[#E63946] hover:bg-red-50'
                        }`}
                      >
                        <StickyNote size={10} /> {item.notes ? 'Edit Note' : 'Add Note'}
                      </button>
                    </div>
                    {item.notes && (
                      <p className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-2xl p-1 shadow-inner border border-[#E2E8F0]/50">
                    <button 
                      onClick={() => updateQty(item.id, -1)} 
                      className="w-8 h-8 flex items-center justify-center text-[#E63946] bg-white rounded-xl shadow-sm hover:bg-red-50 transition-all active:scale-90"
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="font-black text-sm w-6 text-center text-[#0F172A]">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, 1)} 
                      className="w-8 h-8 flex items-center justify-center text-[#E63946] bg-white rounded-xl shadow-sm hover:bg-red-50 transition-all active:scale-90"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Table Selector & Totals */}
        <div className="p-8 bg-[#F8F9FA] border-t border-[#E2E8F0] space-y-6">
          {/* Dine-In Table Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Dine-In Table</p>
              {selectedTableId && (
                <button onClick={() => setSelectedTableId(null)} className="text-[10px] font-black text-[#E63946] uppercase hover:underline">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => table.status === 'vacant' && setSelectedTableId(selectedTableId === table.id ? null : table.id)}
                  className={`h-11 rounded-xl text-xs font-black transition-all border flex flex-col items-center justify-center ${
                    selectedTableId === table.id
                      ? 'bg-[#E63946] text-white border-transparent shadow-lg shadow-red-100 scale-105'
                      : table.status === 'vacant'
                      ? 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#E63946] hover:bg-red-50/30'
                      : 'bg-slate-200 border-transparent text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  disabled={table.status !== 'vacant'}
                >
                  {table.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Breakdown */}
          <div className="space-y-2.5 bg-white p-5 rounded-[2rem] border border-[#E2E8F0] shadow-sm">
            <div className="flex justify-between text-[#64748B] font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#64748B] font-bold text-xs uppercase tracking-widest">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <span>Gratuity</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#F1F5F9]">
              <span className="font-black text-[#0F172A] text-lg">Total</span>
              <span className="text-3xl font-black text-[#E63946]">${total.toFixed(2)}</span>
            </div>
          </div>

          {!canCreateOrder ? (
            <div className="w-full p-6 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Shield size={20} />
                <span className="text-sm font-black uppercase tracking-wider">Permission Required</span>
              </div>
              <p className="text-xs text-amber-600 font-bold">You need "create_order" permission to process payments.</p>
            </div>
          ) : (
            <A7Button 
              className="w-full h-18 rounded-[1.5rem] text-lg font-black shadow-2xl shadow-red-200 uppercase tracking-[0.1em]"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard size={24} strokeWidth={2.5} /> Process Payment
            </A7Button>
          )}
        </div>
      </div>

      {/* Modals: Size Selection, Notes, Payment, Success */}
      {/* (Size Modal) */}
      <A7Modal 
        isOpen={!!pendingItem} 
        onClose={() => setPendingItem(null)} 
        title={`Select Options: ${pendingItem?.name}`}
      >
        <div className="grid grid-cols-1 gap-4">
          {pendingItem?.prices.map((p, i) => (
            <button
              key={i}
              onClick={() => pendingItem && addToCart(pendingItem, p)}
              className="flex items-center justify-between p-6 rounded-[1.5rem] border-2 border-[#E2E8F0] hover:border-[#E63946] hover:bg-red-50/30 transition-all text-left group"
            >
              <div>
                <p className="font-black text-xl text-[#0F172A] group-hover:text-[#E63946] transition-colors">{p.size}</p>
                <p className="text-sm font-bold text-[#64748B]">Chef Recommended</p>
              </div>
              <span className="text-2xl font-black text-[#0F172A]">${p.amount.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </A7Modal>

      {/* (Note Modal) */}
      <A7Modal
        isOpen={isNoteModalOpen}
        onClose={() => {setIsNoteModalOpen(false); setEditingNoteItem(null);}}
        title={`Special Instructions for ${editingNoteItem?.name}`}
      >
        <div className="space-y-6">
          <textarea 
            autoFocus
            defaultValue={editingNoteItem?.notes}
            placeholder="No onions, extra spicy, gluten-free, etc..."
            className="w-full h-48 p-6 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[2rem] outline-none focus:ring-4 ring-[#FFEBEE] font-bold text-lg text-[#0F172A] resize-none"
            id="note-textarea-pos"
          />
          <div className="flex gap-4">
            <A7Button className="flex-1 h-14 rounded-2xl" onClick={() => handleUpdateNote((document.getElementById('note-textarea-pos') as HTMLTextAreaElement).value)}>Update Order</A7Button>
            <A7Button variant="secondary" className="flex-1 h-14 rounded-2xl" onClick={() => {setIsNoteModalOpen(false); setEditingNoteItem(null);}}>Discard</A7Button>
          </div>
        </div>
      </A7Modal>

      {/* (Payment Modal) */}
      <A7Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Complete Transaction"
      >
        <div className="space-y-8 py-2">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Grand Total Due</p>
            <p className="text-6xl font-black text-[#0F172A]">${total.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest text-center">Add a Gratuity?</p>
            <div className="grid grid-cols-4 gap-3">
              {[0, 15, 18, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => setTipAmount(subtotal * (pct/100))}
                  className={`py-4 rounded-2xl border-2 font-black transition-all text-sm ${
                    tipAmount === (subtotal * (pct/100))
                      ? 'bg-[#E63946] border-transparent text-white shadow-xl shadow-red-100 scale-105'
                      : 'border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={handleCheckout}
              className="flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 border-[#E2E8F0] hover:border-[#E63946] hover:bg-red-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#FFEBEE] transition-all group-hover:scale-110">
                <Banknote className="text-[#64748B] group-hover:text-[#E63946]" size={32} />
              </div>
              <p className="font-black uppercase text-[10px] tracking-widest">Cash</p>
            </button>
            <button 
              onClick={handleCheckout}
              className="flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 border-[#E2E8F0] hover:border-[#E63946] hover:bg-red-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#FFEBEE] transition-all group-hover:scale-110">
                <CreditCard className="text-[#64748B] group-hover:text-[#E63946]" size={32} />
              </div>
              <p className="font-black uppercase text-[10px] tracking-widest">Credit Card</p>
            </button>
            <button 
              onClick={handleCheckout}
              className="flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 border-[#E2E8F0] hover:border-[#E63946] hover:bg-red-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center group-hover:bg-[#FFEBEE] transition-all group-hover:scale-110">
                <Smartphone className="text-[#64748B] group-hover:text-[#E63946]" size={32} />
              </div>
              <p className="font-black uppercase text-[10px] tracking-widest">Mobile Pay</p>
            </button>
          </div>
        </div>
      </A7Modal>

      {/* (Success Modal) */}
      <A7Modal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        title="Transaction Completed"
      >
        <div className="text-center py-10 space-y-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-in zoom-in duration-500 shadow-xl shadow-emerald-50">
              <CheckCircle2 size={72} strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-4xl font-black text-[#0F172A]">Success!</h4>
            <p className="text-[#64748B] font-bold text-lg">Order #{lastOrderNumber} sent to kitchen.</p>
            {tipAmount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                <Heart size={14} className="fill-current" /> Tip Included: ${tipAmount.toFixed(2)}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <A7Button variant="secondary" className="rounded-2xl h-16" onClick={() => setIsSuccessModalOpen(false)}>
               <ReceiptText size={20} /> Print Receipt
             </A7Button>
             <A7Button className="rounded-2xl h-16" onClick={() => setIsSuccessModalOpen(false)}>
               New Order
             </A7Button>
          </div>
        </div>
      </A7Modal>
    </div>
  );
};
