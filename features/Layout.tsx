import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, UtensilsCrossed, ClipboardList, 
  ChefHat, SquareMenu, Package, Users, 
  Settings, LogOut, ChevronLeft, Menu, X,
  BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeepSearch } from '../components/DeepSearch';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { usePermissions } from '../hooks/usePermissions';
import { useGlobal } from '../Providers';
import { MENU_ITEM_PERMISSIONS } from '../utils/permissions';

const SIDEBAR_ITEMS = [
  { path: '/app', label: 'Dashboard', mmLabel: 'ဒက်ရှ်ဘုတ်', icon: LayoutDashboard },
  { path: '/app/pos', label: 'POS Terminal', mmLabel: 'အရောင်းကောင်တာ', icon: UtensilsCrossed },
  { path: '/app/orders', label: 'Orders', mmLabel: 'အော်ဒါများ', icon: ClipboardList },
  { path: '/app/kitchen', label: 'Kitchen KDS', mmLabel: 'မီးဖိုချောင်စနစ်', icon: ChefHat },
  { path: '/app/tables', label: 'Tables', mmLabel: 'စားပွဲစီမံခန့်ခွဲမှု', icon: SquareMenu },
  { path: '/app/menu', label: 'Menu Mgmt', mmLabel: 'မီနူးစီမံခန့်ခွဲမှု', icon: Package },
  { path: '/app/inventory', label: 'Inventory', mmLabel: 'ကုန်ပစ္စည်းစာရင်း', icon: ClipboardList },
  { path: '/app/staff', label: 'Staff & Shifts', mmLabel: 'ဝန်ထမ်းနှင့် အလှည့်ကျစနစ်', icon: Users },
  { path: '/app/reports', label: 'Reports', mmLabel: 'အစီရင်ခံစာများ', icon: BarChart3 },
  { path: '/app/settings', label: 'Settings', mmLabel: 'ဆက်တင်များ', icon: Settings },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { currentUser } = useGlobal();
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('a7_auth');
    navigate('/login');
  };

  // Filter menu items based on permissions
  const visibleMenuItems = SIDEBAR_ITEMS.filter(item => {
    const requiredPermission = MENU_ITEM_PERMISSIONS[item.path];
    return !requiredPermission || hasPermission(requiredPermission);
  });

  const activeItem = visibleMenuItems.find(item => item.path === location.pathname) || visibleMenuItems[0];

  // Close drawer when route changes on mobile
  useEffect(() => {
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname]);

  // Focus trap and ESC key handler for mobile drawer
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    // Focus first element when drawer opens
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const handleNavClick = (path: string) => {
    navigate(path);
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  // Sidebar content component (reused for drawer and sidebar)
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Header */}
      <div className={`h-16 md:h-24 flex items-center justify-between ${isMobile ? 'px-4' : 'px-4 md:px-8'} border-b border-[#F1F5F9]`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-xl font-black text-white">A7</span>
            </div>
            {!isMobile && (
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-[#0F172A] leading-none mb-0.5">Smart</span>
                <span className="text-[10px] font-black text-[#E63946] uppercase tracking-widest leading-none">Restaurant</span>
              </div>
            )}
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center shadow-lg shadow-red-200 mx-auto">
            <span className="text-xl font-black text-white">A</span>
          </div>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="w-11 h-11 min-h-[44px] flex items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors focus-visible:ring-4 ring-[#FFEBEE] outline-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 md:py-8 px-2 md:px-4 space-y-2 overflow-y-auto custom-scrollbar no-scrollbar">
        {visibleMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isFirst = index === 0;
          
          return (
            <button
              key={item.path}
              ref={isFirst && isMobile ? firstFocusableRef : undefined}
              onClick={() => handleNavClick(item.path)}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed && !isMobile ? item.label : undefined}
              className={`w-full flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3 md:gap-4'} px-3 md:px-5 py-3 md:py-4 min-h-[44px] rounded-xl md:rounded-[1.25rem] transition-all duration-300 group relative focus-visible:ring-4 ring-[#FFEBEE] outline-none ${
                isActive 
                  ? 'bg-[#E63946] text-white shadow-xl shadow-red-100' 
                  : 'text-[#64748B] hover:bg-[#FFEBEE] hover:text-[#E63946] active:bg-[#FFEBEE]'
              }`}
            >
              <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${collapsed && !isMobile ? 'mx-auto' : ''}`}>
                <Icon size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {(!collapsed || isMobile) && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className={`font-black text-sm md:text-[13px] tracking-tight truncate leading-tight transition-colors ${isActive ? 'text-white' : 'text-[#0F172A]'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] font-bold mt-0.5 truncate transition-all duration-300 ${isActive ? 'text-white/70' : 'text-[#94A3B8] opacity-60 group-hover:opacity-100 group-hover:text-[#E63946]'}`}>
                    {item.mmLabel}
                  </span>
                </div>
              )}
              {isActive && !collapsed && !isMobile && (
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-6 md:h-8 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-[#F1F5F9] space-y-3 md:space-y-4">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3 md:gap-4'} px-3 md:px-5 py-3 md:py-4 min-h-[44px] text-[#64748B] hover:bg-red-50 hover:text-red-600 active:bg-red-50 rounded-xl md:rounded-[1.25rem] transition-all group focus-visible:ring-4 ring-[#FFEBEE] outline-none`}
          aria-label="Logout"
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={20} className={`group-hover:-translate-x-1 transition-transform flex-shrink-0 ${collapsed && !isMobile ? 'mx-auto' : ''}`} />
          {(!collapsed || isMobile) && (
            <div className="flex flex-col items-start">
              <span className="font-black text-sm md:text-[13px] tracking-tight">Logout</span>
              <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100">ထွက်ရန်</span>
            </div>
          )}
        </button>
        {(!collapsed || isMobile) && (
          <div className="px-3 md:px-5 pb-2">
            <p className="text-[9px] font-black uppercase text-[#94A3B8] tracking-[0.2em] opacity-50">Powered by A7 System</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#0F172A]">
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed left-0 top-0 h-full w-full bg-white flex flex-col z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl"
            style={{
              transform: mobileDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <SidebarContent isMobile={true} />
          </aside>
        </>
      )}

      {/* Desktop/Tablet Sidebar */}
      <aside 
        className={`hidden md:flex bg-white border-r border-[#E2E8F0] flex-col transition-all duration-500 ease-in-out ${
          collapsed ? 'w-16' : 'w-72'
        } sticky top-0 h-screen z-40`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Navbar */}
        <header className="h-16 md:h-24 bg-white/80 backdrop-blur-xl border-b border-[#F1F5F9] sticky top-0 z-30 px-4 md:px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden w-11 h-11 min-h-[44px] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 active:bg-blue-100 transition-all shadow-sm border border-blue-100 focus-visible:ring-4 ring-blue-200 outline-none"
              aria-label="Open navigation menu"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-12 h-12 rounded-full bg-blue-50 text-blue-600 items-center justify-center hover:bg-blue-100 active:bg-blue-100 transition-all shadow-sm border border-blue-100 focus-visible:ring-4 ring-blue-200 outline-none"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft className={`transition-transform duration-500 ease-in-out ${collapsed ? 'rotate-180' : ''}`} size={24} strokeWidth={2.5} />
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-3 md:gap-5 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFEBEE] text-[#E63946] rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-red-50 flex-shrink-0">
                <activeItem.icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg md:text-2xl font-black tracking-tight text-[#0F172A] truncate">{activeItem.label}</h1>
                <p className="text-[10px] md:text-[11px] font-black uppercase text-[#94A3B8] tracking-[0.2em] truncate">{activeItem.mmLabel}</p>
              </div>
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-6 lg:gap-8 flex-shrink-0">
            <div className="hidden lg:block">
              <DeepSearch />
            </div>
            
            <NotificationDropdown />

            <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-8 border-l border-[#F1F5F9]">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-black text-[#0F172A] truncate max-w-[120px] md:max-w-none">{currentUser.name}</p>
                <p className="text-[9px] md:text-[10px] font-black uppercase text-[#E63946] tracking-widest truncate">{currentUser.role}</p>
              </div>
              <div className="relative group cursor-pointer">
                <img 
                  src="https://i.pravatar.cc/150?u=kokyaw" 
                  alt={`${currentUser.name} avatar`}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover ring-2 md:ring-4 ring-white shadow-lg transition-transform group-hover:scale-105" 
                />
                <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 lg:p-8 xl:p-10 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
