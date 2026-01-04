
import React, { useState, useRef } from 'react';
import { useGlobal } from '../Providers';
import { A7Button, A7Modal } from '../components/A7UI';
import { 
  Edit2, Plus, Search, Trash2, 
  Image as ImageIcon, Upload, ChevronDown, Check, X
} from 'lucide-react';
import { MenuItem, Category, InventoryItem } from '../types';
import { useForm } from 'react-hook-form';
import { usePermissions } from '../hooks/usePermissions';

export const MenuManagement: React.FC = () => {
  const { menu, inventory, updateMenuItem, createMenuItem, createCategory } = useGlobal();
  const { hasPermission } = usePermissions();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const canManageMenu = hasPermission('manage_menu');

  const filteredItems = menu.items.filter(item => 
    (activeCategoryId === 'all' || item.categoryId === activeCategoryId) &&
    (item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle86 = async (item: MenuItem) => {
    await updateMenuItem(item.id, { is86d: !item.is86d });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] -m-8 overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR: Categories */}
        <aside className="w-72 border-r border-[#E2E8F0] bg-[#F8F9FA] flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#64748B] uppercase tracking-widest">Categories</h3>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                activeCategoryId === 'all' 
                ? 'bg-[#E63946] text-white shadow-lg' 
                : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>🍽️</span>
                <span>All Items</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategoryId === 'all' ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                {menu.items.length}
              </span>
            </button>

            {menu.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                  activeCategoryId === cat.id 
                  ? 'bg-[#E63946] text-white shadow-lg' 
                  : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategoryId === cat.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                  {menu.items.filter(i => i.categoryId === cat.id).length}
                </span>
              </button>
            ))}
          </nav>

          {canManageMenu && (
            <A7Button 
              variant="secondary" 
              className="w-full border-dashed border-2 py-3 hover:border-[#E63946] hover:text-[#E63946] transition-all"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Plus size={16} /> Add Category
            </A7Button>
          )}
        </aside>

        {/* MAIN CONTENT: Item List Table */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          <header className="p-6 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E63946]/20 transition-all font-bold text-sm"
              />
            </div>
              {canManageMenu && (
                <A7Button className="h-12 px-6 rounded-2xl shadow-lg shadow-red-100" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={18} strokeWidth={3} /> Add New Item
                </A7Button>
              )}
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">Image</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">Item Detail</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">Price ($)</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">Cost ($)</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">Margin (%)</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest">In Stock</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#64748B] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredItems.map(item => {
                  const price = item.prices[0].amount;
                  const cost = item.cost || 0;
                  const margin = price > 0 ? ((price - cost) / price * 100).toFixed(1) : '0';
                  const category = menu.categories.find(c => c.id === item.categoryId);
                  const isInStock = !item.is86d;

                  return (
                    <tr key={item.id} className="group hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-[#E2E8F0]">
                          <img src={item.image || 'https://picsum.photos/seed/food/400/300'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0F172A]">{item.name}</span>
                          <span className="text-[10px] text-[#94A3B8] font-black uppercase mt-0.5 tracking-wider">{category?.name || 'Uncategorized'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-[#E63946]">
                        <span className="text-sm font-black">$ {price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#64748B]">
                        <span className="text-sm font-bold">$ {cost.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${parseFloat(margin) > 60 ? 'bg-emerald-500' : parseFloat(margin) > 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(100, Math.max(0, parseFloat(margin)))}%` }}
                              />
                           </div>
                           <span className="text-xs font-black text-[#0F172A]">{margin}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <button 
                              type="button"
                              onClick={() => handleToggle86(item)}
                              className={`relative w-11 h-6 rounded-full transition-all duration-300 active:scale-90 ${isInStock ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isInStock ? 'left-6' : 'left-1'}`} />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isInStock ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isInStock ? 'On' : 'Off'}
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageMenu && (
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canManageMenu && (
                            <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL: Simplified Add/Edit Item Form */}
      <NewItemModal 
        isOpen={isAddModalOpen || !!editingItem} 
        onClose={() => {setIsAddModalOpen(false); setEditingItem(null);}} 
        initialData={editingItem}
        categories={menu.categories}
        onSave={async (data) => {
          if (editingItem) {
            await updateMenuItem(editingItem.id, {
              name: data.name,
              description: data.description,
              categoryId: data.categoryId,
              prices: [{ size: 'Standard', amount: parseFloat(data.sellingPrice) }],
              cost: parseFloat(data.unitCost),
              taxRate: parseFloat(data.taxRate) / 100,
              is86d: !data.isInStock,
              image: data.image
            });
          } else {
            await createMenuItem({
              categoryId: data.categoryId,
              name: data.name,
              description: data.description,
              prices: [{ size: 'Standard', amount: parseFloat(data.sellingPrice) }],
              cost: parseFloat(data.unitCost),
              taxRate: parseFloat(data.taxRate) / 100,
              is86d: !data.isInStock,
              image: data.image || undefined,
              active: data.isInStock,
            });
          }
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* MODAL: Add Category */}
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={async (name, icon) => {
          await createCategory({
            id: `cat-${Date.now()}`,
            name,
            icon
          });
          setIsCategoryModalOpen(false);
        }}
      />
    </div>
  );
};

const CategoryModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (name: string, icon: string) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const emojis = ['🍔', '🥗', '🍕', '☕', '🍰', '🍜', '🌮', '🥩', '🍣', '🍹', '🍦', '🥯'];

  if (!isOpen) return null;

  return (
    <A7Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Category Name</label>
          <input 
            type="text"
            placeholder="e.g. Appetizers"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-5 py-3.5 bg-[#F8F9FA] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#E63946]/20 transition-all font-bold"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Choose Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {emojis.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className={`text-2xl p-3 rounded-xl transition-all border-2 ${icon === e ? 'bg-[#FFEBEE] border-[#E63946] scale-110' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <A7Button className="flex-1 h-14 rounded-2xl" disabled={!name} onClick={() => onSave(name, icon)}>
            Create Category
          </A7Button>
          <A7Button variant="secondary" className="px-8 h-14 rounded-2xl" onClick={onClose}>
            Cancel
          </A7Button>
        </div>
      </div>
    </A7Modal>
  );
};

/**
 * Simplified NewItemModal Component
 * Implements a 30/70 visual split with a single form view.
 */
interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: MenuItem | null;
  categories: Category[];
  onSave: (data: any) => void;
}

const NewItemModal: React.FC<NewItemModalProps> = ({ isOpen, onClose, initialData, categories, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      categoryId: initialData.categoryId,
      sellingPrice: initialData.prices[0].amount,
      unitCost: initialData.cost || 0,
      taxRate: initialData.taxRate * 100,
      isInStock: !initialData.is86d,
      image: initialData.image || ''
    } : {
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      sellingPrice: 0,
      unitCost: 0,
      taxRate: 8,
      isInStock: true,
      image: ''
    }
  });

  const isInStock = watch('isInStock');
  const imagePreview = watch('image');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          categoryId: initialData.categoryId,
          sellingPrice: initialData.prices[0].amount,
          unitCost: initialData.cost || 0,
          taxRate: initialData.taxRate * 100,
          isInStock: !initialData.is86d,
          image: initialData.image || ''
        });
      } else {
        reset({ 
          name: '', 
          description: '', 
          categoryId: categories[0]?.id || '', 
          sellingPrice: 0, 
          unitCost: 0, 
          taxRate: 8, 
          isInStock: true,
          image: ''
        });
      }
    }
  }, [isOpen, initialData, reset, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('image', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <A7Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Menu Item" : "Add New Menu Item"}
    >
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-8 md:flex-row min-h-[480px]">
        {/* Left Side: 30% Image Upload & Preview */}
        <div className="w-full md:w-[30%] flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-[#F8F9FA] border-2 border-dashed border-[#E2E8F0] rounded-[2rem] flex flex-col items-center justify-center text-[#94A3B8] hover:bg-white hover:border-[#E63946]/40 transition-all cursor-pointer group relative overflow-hidden"
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2rem]" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <div className="p-2 bg-white rounded-xl text-[#0F172A] shadow-lg">
                      <Upload size={20} />
                   </div>
                   <button 
                    type="button" 
                    onClick={removeImage}
                    className="p-2 bg-[#E93B3B] rounded-xl text-white shadow-lg hover:scale-110 transition-transform"
                   >
                      <X size={20} />
                   </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-[#64748B] group-hover:text-[#E63946]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center px-4 leading-tight">
                  Upload Item Image
                </p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <p className="mt-4 text-[10px] font-bold text-[#94A3B8] text-center italic">PNG, JPG or WebP up to 5MB</p>
        </div>

        {/* Right Side: 70% Form Fields */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Item Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Signature Double Patty Burger" 
              className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#E63946] focus:ring-4 ring-[#E63946]/5 transition-all font-bold text-[#0F172A]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Description</label>
            <textarea 
              {...register('description')}
              rows={2}
              placeholder="Write a short appetizing description..." 
              className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#E63946] transition-all font-medium text-sm text-[#0F172A] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Category</label>
            <div className="relative">
              <select 
                {...register('categoryId')}
                className="w-full px-5 py-3.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#E63946] transition-all font-bold text-sm text-[#0F172A] appearance-none cursor-pointer"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Selling Price ($)</label>
              <input 
                type="number" step="0.01"
                {...register('sellingPrice')}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-black text-sm text-[#E63946]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Unit Cost ($)</label>
              <input 
                type="number" step="0.01"
                {...register('unitCost')}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-bold text-sm text-[#64748B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Tax (%)</label>
              <input 
                type="number" step="0.1"
                {...register('taxRate')}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl outline-none font-bold text-sm text-[#0F172A]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[1.25rem] border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isInStock ? <Check size={16} strokeWidth={3} /> : <ImageIcon size={16} />}
              </div>
              <div>
                <p className="text-xs font-black text-[#0F172A]">In Stock Status</p>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">
                  {isInStock ? "Available on menu" : "Marked as Out of Stock"}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setValue('isInStock', !isInStock)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isInStock ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isInStock ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
             <A7Button 
              type="submit" 
              className="flex-1 h-14 rounded-2xl text-lg font-black bg-[#E93B3B] hover:bg-[#D32F2F] shadow-xl shadow-red-100"
            >
              {initialData ? 'Update Item' : 'Create Item'}
            </A7Button>
            <A7Button 
              type="button" 
              variant="secondary" 
              className="px-10 h-14 rounded-2xl border-2 font-bold" 
              onClick={onClose}
            >
              Cancel
            </A7Button>
          </div>
        </div>
      </form>
    </A7Modal>
  );
};
