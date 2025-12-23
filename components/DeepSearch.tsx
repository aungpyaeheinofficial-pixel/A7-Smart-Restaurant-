import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../Providers';
import { 
  Search, UtensilsCrossed, ClipboardList, SquareMenu, 
  Package, Users, Tag, X, ArrowRight, Command
} from 'lucide-react';
import { MenuItem, Order, Table, InventoryItem, StaffMember, Category } from '../types';

interface SearchResult {
  type: 'menu' | 'order' | 'table' | 'inventory' | 'staff' | 'category';
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  path: string;
  matchScore: number;
}

export const DeepSearch: React.FC = () => {
  const { menu, orders, tables, inventory, staff } = useGlobal();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search function that scores results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search Menu Items
    menu.items.forEach(item => {
      const nameMatch = item.name.toLowerCase().includes(queryLower);
      const descMatch = item.description?.toLowerCase().includes(queryLower);
      if (nameMatch || descMatch) {
        const category = menu.categories.find(c => c.id === item.categoryId);
        let score = 0;
        if (item.name.toLowerCase().startsWith(queryLower)) score += 10;
        if (nameMatch) score += 5;
        if (descMatch) score += 2;
        
        results.push({
          type: 'menu',
          id: item.id,
          title: item.name,
          subtitle: category?.name || 'Menu Item',
          icon: UtensilsCrossed,
          path: '/app/pos',
          matchScore: score
        });
      }
    });

    // Search Orders
    orders.forEach(order => {
      const orderNumMatch = order.orderNumber.toLowerCase().includes(queryLower);
      const itemMatch = order.items.some(i => i.name.toLowerCase().includes(queryLower));
      if (orderNumMatch || itemMatch) {
        let score = 0;
        if (orderNumMatch) score += 8;
        if (itemMatch) score += 3;
        
        const table = order.tableId ? tables.find(t => t.id === order.tableId) : null;
        results.push({
          type: 'order',
          id: order.id,
          title: `Order #${order.orderNumber}`,
          subtitle: `${order.items.length} items${table ? ` • Table ${table.label}` : ''} • ${order.status}`,
          icon: ClipboardList,
          path: '/app/orders',
          matchScore: score
        });
      }
    });

    // Search Tables
    tables.forEach(table => {
      if (table.label.toLowerCase().includes(queryLower)) {
        let score = 5;
        if (table.label.toLowerCase() === queryLower) score += 5;
        
        results.push({
          type: 'table',
          id: table.id,
          title: `Table ${table.label}`,
          subtitle: `${table.capacity} seats • ${table.status}`,
          icon: SquareMenu,
          path: '/app/tables',
          matchScore: score
        });
      }
    });

    // Search Inventory
    inventory.forEach(item => {
      const nameMatch = item.name.toLowerCase().includes(queryLower);
      const skuMatch = item.sku.toLowerCase().includes(queryLower);
      if (nameMatch || skuMatch) {
        let score = 0;
        if (skuMatch) score += 7;
        if (nameMatch) score += 4;
        
        results.push({
          type: 'inventory',
          id: item.id,
          title: item.name,
          subtitle: `SKU: ${item.sku} • ${item.onHand} ${item.unit} on hand`,
          icon: Package,
          path: '/app/inventory',
          matchScore: score
        });
      }
    });

    // Search Staff
    staff.forEach(member => {
      if (member.name.toLowerCase().includes(queryLower) || 
          member.role.toLowerCase().includes(queryLower)) {
        let score = 0;
        if (member.name.toLowerCase().includes(queryLower)) score += 6;
        if (member.role.toLowerCase().includes(queryLower)) score += 3;
        
        results.push({
          type: 'staff',
          id: member.id,
          title: member.name,
          subtitle: `${member.role} • ${member.isActive ? 'On Duty' : 'Off Duty'}`,
          icon: Users,
          path: '/app/staff',
          matchScore: score
        });
      }
    });

    // Search Categories
    menu.categories.forEach(category => {
      if (category.name.toLowerCase().includes(queryLower)) {
        let score = 4;
        if (category.name.toLowerCase() === queryLower) score += 4;
        
        results.push({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: `${menu.items.filter(i => i.categoryId === category.id).length} items`,
          icon: Tag,
          path: '/app/menu',
          matchScore: score
        });
      }
    });

    // Sort by match score (highest first) and limit to top 10
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }, [query, menu, orders, tables, inventory, staff]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
      
      // Arrow keys for navigation
      if (isOpen && resultsRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
          e.preventDefault();
          handleSelectResult(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectResult = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-[#0F172A] font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'menu': return 'Menu Item';
      case 'order': return 'Order';
      case 'table': return 'Table';
      case 'inventory': return 'Inventory';
      case 'staff': return 'Staff';
      case 'category': return 'Category';
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="relative hidden lg:block group cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors pointer-events-none" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Deep search operations..." 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            // Delay to allow click events on results
            setTimeout(() => {
              if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 200);
          }}
          className="pl-12 pr-20 py-3 bg-[#F1F5F9] border-none rounded-2xl text-sm w-72 focus:ring-4 ring-red-50 focus:bg-white transition-all font-bold placeholder:font-medium placeholder:text-[#94A3B8] outline-none"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black text-[#94A3B8] pointer-events-none">
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E2E8F0] shadow-sm">
            <Command size={10} className="inline" />
          </kbd>
          <span>K</span>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || searchResults.length > 0) && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 max-h-[500px] overflow-hidden flex flex-col">
          {query.trim() ? (
            <>
              {searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-3 border-b border-[#F1F5F9]">
                    <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">
                      {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                    </p>
                  </div>
                  <div 
                    ref={resultsRef}
                    className="overflow-y-auto custom-scrollbar flex-1"
                  >
                    {searchResults.map((result, index) => {
                      const Icon = result.icon;
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelectResult(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all ${
                            isSelected 
                              ? 'bg-[#FFEBEE] border-l-4 border-[#E63946]' 
                              : 'hover:bg-[#F8F9FA] border-l-4 border-transparent'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#E63946] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                          } transition-colors`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-black text-sm text-[#0F172A] truncate">
                                {highlightMatch(result.title, query)}
                              </p>
                              <span className="text-[9px] font-black uppercase text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                {getTypeLabel(result.type)}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          {isSelected && (
                            <ArrowRight size={16} className="text-[#E63946] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search size={32} className="mx-auto text-[#CBD5E1] mb-3" />
                  <p className="text-sm font-black text-[#64748B] mb-1">No results found</p>
                  <p className="text-xs text-[#94A3B8]">Try searching for menu items, orders, tables, or staff</p>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#FFEBEE] rounded-xl flex items-center justify-center">
                  <Search size={18} className="text-[#E63946]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0F172A]">Deep Search</p>
                  <p className="text-xs text-[#64748B]">Search across all operations</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-[#64748B]">
                <p className="font-bold text-[#0F172A] mb-2">Search for:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed size={14} />
                    <span>Menu items and categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} />
                    <span>Orders by number or items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SquareMenu size={14} />
                    <span>Tables by label</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={14} />
                    <span>Inventory by name or SKU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Staff members by name or role</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

