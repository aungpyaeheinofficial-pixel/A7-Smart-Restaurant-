
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Providers, useGlobal } from './Providers';
import { AppLayout } from './features/Layout';
import { Dashboard } from './features/Dashboard';
import { POSTerminal } from './features/POS';
import { KDS } from './features/KDS';
import { OrdersMgmt } from './features/Orders';
import { TableManagement } from './features/Tables';
import { MenuManagement } from './features/MenuMgmt';
import { Inventory } from './features/Inventory';
import { StaffMgmt } from './features/Staff';
import { RestaurantSettings } from './features/Settings';
import { Reports } from './features/Reports';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, X, Info, Shield } from 'lucide-react';
import { usePermissions } from './hooks/usePermissions';
import { MENU_ITEM_PERMISSIONS } from './utils/permissions';
import { api } from './api/services';

/**
 * ENTERPRISE POS LOGIN COMPONENT
 * Simplified to standard secure credentials only, maintaining the refined 'Big Card' aesthetic.
 */
const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter all credentials');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await api.auth.login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSampleCredentials = () => {
    setEmail('admin@a7grill.com');
    setPassword('password');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F172A]">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=2070")',
          filter: 'brightness(0.25) saturate(0.7)'
        }}
      />
      
      {/* Refined Enterprise Scale Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-[92%] max-w-xl"
      >
        <div className="bg-white/90 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
          
          {/* Balanced Header Section */}
          <div className="px-10 sm:px-14 pt-12 pb-8 text-center">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-[#E63946] rounded-[1.75rem] flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30 mb-6"
            >
              <span className="text-3xl font-black text-white">A7</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tighter mb-1">Restaurant OS</h1>
            <p className="text-[11px] font-black text-[#64748B] uppercase tracking-[0.4em]">Administrative Terminal Access</p>
          </div>

          {/* Login Form Area */}
          <div className="px-10 sm:px-14 pb-16">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-2">Administrator Email</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full pl-14 pr-6 h-16 bg-slate-100 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-[#E63946] focus:ring-8 ring-red-500/5 font-black text-lg transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-2">Security Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E63946] transition-colors" size={20} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security key"
                      className="w-full pl-14 pr-6 h-16 bg-slate-100 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-[#E63946] focus:ring-8 ring-red-500/5 font-black text-lg transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 bg-[#E63946] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-red-500/30 hover:bg-[#C62828] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating System...' : 'Enter Secure Environment'}
                  {!isSubmitting && <ArrowRight size={20} strokeWidth={3} />}
                </button>

                {/* Sample Credentials Hint */}
                <button 
                  type="button"
                  onClick={fillSampleCredentials}
                  className="w-full p-4 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center gap-3 text-blue-600 transition-all group"
                >
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Use Sample Access: <span className="text-blue-800">admin@a7grill.com / password</span></span>
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <p className="text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">
                  © 2025 A7 Systems. All rights reserved.
                </p>
              </div>
            </form>

            {/* Error Notifications */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 p-5 bg-red-50 border-2 border-red-100 rounded-[1.5rem] flex items-center justify-center gap-3 text-red-600"
                >
                  <X size={18} className="flex-shrink-0" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secure Footer Status */}
          <div className="bg-[#F8F9FA] px-10 sm:px-14 py-6 border-t border-[#F1F5F9] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.25em]">Powered by A7 System</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>

        {/* Branding Subtext */}
        <p className="text-center mt-10 text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
          Engineered by A7 Systems
        </p>
      </motion.div>
    </div>
  );
};

/**
 * PRIVATE ROUTE WRAPPER
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasToken = api.auth.hasToken();
  return hasToken ? <>{children}</> : <Navigate to="/login" />;
};

/**
 * PERMISSION-PROTECTED ROUTE WRAPPER
 */
const PermissionRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredPermission: string;
  path: string;
}> = ({ children, requiredPermission, path }) => {
  const { hasPermission } = usePermissions();
  const { currentUser } = useGlobal();

  if (!hasPermission(requiredPermission as any)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <Shield size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-[#0F172A]">Access Denied</h2>
          <p className="text-sm text-[#64748B] max-w-md">
            You don't have permission to access this page. 
            <br />
            <span className="font-bold">Required:</span> {requiredPermission.replace(/_/g, ' ')}
            <br />
            <span className="font-bold">Your Role:</span> {currentUser.role}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-3 bg-[#E63946] text-white rounded-xl font-black text-sm hover:bg-[#C62828] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Providers>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/app/*" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <Routes>
                    <Route 
                      index 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app']} path="/app">
                          <Dashboard />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="pos" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/pos']} path="/app/pos">
                          <POSTerminal />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="orders" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/orders']} path="/app/orders">
                          <OrdersMgmt />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="kitchen" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/kitchen']} path="/app/kitchen">
                          <KDS />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="tables" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/tables']} path="/app/tables">
                          <TableManagement />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="menu" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/menu']} path="/app/menu">
                          <MenuManagement />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="inventory" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/inventory']} path="/app/inventory">
                          <Inventory />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="staff" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/staff']} path="/app/staff">
                          <StaffMgmt />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="reports" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/reports']} path="/app/reports">
                          <Reports />
                        </PermissionRoute>
                      } 
                    />
                    <Route 
                      path="settings" 
                      element={
                        <PermissionRoute requiredPermission={MENU_ITEM_PERMISSIONS['/app/settings']} path="/app/settings">
                          <RestaurantSettings />
                        </PermissionRoute>
                      } 
                    />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/app" />} />
        </Routes>
      </HashRouter>
    </Providers>
  );
};

export default App;
