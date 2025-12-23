
import React, { useState, useEffect } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Button } from '../components/A7UI';
import { 
  Store, Shield, 
  CreditCard, Save, Globe, Mail, 
  Phone, MapPin, CheckCircle2, 
  AlertTriangle, Monitor, Volume2, 
  RefreshCw, Lock, Trash2, 
  // Alias the Settings icon to avoid collision with the component name
  Settings as SettingsIcon, Plus
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/PermissionGuard';

type SettingsTab = 'general' | 'security' | 'payments' | 'hardware';

export const RestaurantSettings: React.FC = () => {
  const { restaurant, settings, updateRestaurant, updateSettings } = useGlobal();
  const { hasPermission } = usePermissions();
  const canManageSettings = hasPermission('manage_settings');
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register: regRest, handleSubmit: handleRest, reset: resetRest } = useForm({
    defaultValues: restaurant
  });

  const { register: regSet, handleSubmit: handleSet, reset: resetSet, watch: watchSet, setValue: setSetValue } = useForm({
    defaultValues: settings
  });

  useEffect(() => {
    resetRest(restaurant);
    resetSet(settings);
  }, [restaurant, settings, resetRest, resetSet]);

  const onSaveGeneral = async (data: any) => {
    setIsSaving(true);
    await updateRestaurant(data);
    setIsSaving(false);
    triggerSuccess();
  };

  const onSaveSettings = async (data: any) => {
    setIsSaving(true);
    // Convert string inputs back to numbers if needed
    const cleaned = {
      ...data,
      taxRate: parseFloat(data.taxRate),
      pinLength: parseInt(data.pinLength),
      kdsRefreshRate: parseInt(data.kdsRefreshRate)
    };
    await updateSettings(cleaned);
    setIsSaving(false);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'general', label: 'Venue Profile', icon: Store },
    { id: 'security', label: 'Safety & Staff', icon: Shield },
    { id: 'payments', label: 'Finances & Tax', icon: CreditCard },
    { id: 'hardware', label: 'Hardware & KDS', icon: Monitor },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#FFEBEE] text-[#E63946] rounded-3xl flex items-center justify-center shadow-inner">
            <SettingsIcon size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">System Settings</h2>
            <p className="text-[#64748B] font-medium text-lg">Control your restaurant ecosystem.</p>
          </div>
        </div>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black text-sm uppercase tracking-widest shadow-sm"
            >
              <CheckCircle2 size={18} /> Settings Synchronized
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="space-y-2 lg:sticky lg:top-24 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between gap-4 px-6 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all group ${
                  isActive 
                    ? 'bg-[#E63946] text-white shadow-xl shadow-red-100 scale-[1.02]' 
                    : 'text-[#64748B] hover:bg-white hover:text-[#0F172A] border border-transparent hover:border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                  <span>{tab.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}

          <div className="mt-8 pt-8 border-t border-slate-200">
             <A7Card className="bg-slate-50 border-dashed !p-6">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2">Build Version</p>
                <p className="text-xs font-bold text-[#0F172A]">Powered by A7 System</p>
                <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#E63946] uppercase hover:underline">
                  <RefreshCw size={12} /> Check for updates
                </button>
             </A7Card>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-3 space-y-8 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'general' && (
                <form onSubmit={handleRest(onSaveGeneral)} className="space-y-8">
                  <A7Card className="space-y-8 !p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 border-b border-[#F1F5F9] pb-6">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Store size={24} /></div>
                       <h3 className="text-xl font-black text-[#0F172A]">Public Profile</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Legal Venue Name</label>
                        <input {...regRest('name')} className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:ring-4 ring-[#E63946]/5 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Operational Timezone</label>
                        <select {...regRest('timezone')} className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white transition-all font-bold appearance-none">
                          <option>Pacific Time (PT)</option>
                          <option>Eastern Time (ET)</option>
                          <option>Central Time (CT)</option>
                          <option>London (GMT)</option>
                          <option>Tokyo (JST)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Support Email</label>
                        <input {...regRest('email')} type="email" className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Business Phone</label>
                        <input {...regRest('phone')} type="tel" className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white font-bold" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Mailing Address</label>
                        <input {...regRest('address')} className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white font-bold" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <PermissionGuard requiredPermission="manage_settings" showError={false}>
                        <A7Button 
                          type="submit" 
                          disabled={isSaving || !canManageSettings} 
                          className="h-16 px-12 rounded-2xl text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!canManageSettings ? 'Requires manage_settings permission' : undefined}
                        >
                          {isSaving ? 'Synchronizing...' : 'Update Profile'}
                        </A7Button>
                      </PermissionGuard>
                    </div>
                  </A7Card>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleSet(onSaveSettings)} className="space-y-8">
                  <A7Card className="space-y-8 !p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 border-b border-[#F1F5F9] pb-6">
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Lock size={24} /></div>
                       <h3 className="text-xl font-black text-[#0F172A]">Staff Access & Security</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div>
                               <p className="font-black text-sm">Auto Clock-Out</p>
                               <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">EndOfDay trigger</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setSetValue('autoClockOut', !watchSet('autoClockOut'))}
                              className={`w-12 h-6 rounded-full transition-all relative ${watchSet('autoClockOut') ? 'bg-[#10B981]' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${watchSet('autoClockOut') ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div>
                               <p className="font-black text-sm">Manager Overrides</p>
                               <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">PIN required for voids</p>
                            </div>
                            <button type="button" className="w-12 h-6 bg-[#10B981] rounded-full relative">
                              <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                            </button>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Access PIN Length</label>
                        <select {...regSet('pinLength')} className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none font-bold">
                          <option value="4">4 Digits (Standard)</option>
                          <option value="6">6 Digits (High Security)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex items-start gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm"><Trash2 size={24} /></div>
                       <div className="flex-1">
                          <h4 className="font-black text-red-800">Factory Reset</h4>
                          <p className="text-sm text-red-700/80 font-medium mt-1">
                             Resetting the terminal will wipe all local caches, orders, and unsynced logs. This should only be used under IT supervision.
                          </p>
                          <A7Button variant="danger" className="mt-6 rounded-xl font-black text-xs uppercase tracking-widest px-8">Wipe This Device</A7Button>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <A7Button type="submit" disabled={isSaving} className="h-16 px-12 rounded-2xl text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest">
                        Apply Security
                      </A7Button>
                    </div>
                  </A7Card>
                </form>
              )}

              {activeTab === 'payments' && (
                <form onSubmit={handleSet(onSaveSettings)} className="space-y-8">
                  <A7Card className="space-y-8 !p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 border-b border-[#F1F5F9] pb-6">
                       <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard size={24} /></div>
                       <h3 className="text-xl font-black text-[#0F172A]">Tax & Payments</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Global Tax Rate (%)</label>
                        <input {...regSet('taxRate')} type="number" step="0.1" className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none font-black text-[#E63946]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Currency Symbol</label>
                        <input {...regSet('currencySymbol')} className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none font-black" />
                      </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Accepted Payment Methods</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {['Cash', 'Credit Card', 'Apple Pay', 'Google Pay'].map(method => (
                            <div key={method} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0]">
                               <span className="font-bold text-xs">{method}</span>
                               <div className="w-5 h-5 rounded-md bg-[#10B981] flex items-center justify-center text-white"><CheckCircle2 size={12} /></div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <A7Button type="submit" disabled={isSaving} className="h-16 px-12 rounded-2xl text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest">
                        <PermissionGuard requiredPermission="manage_settings" showError={false}>
                          <button
                            type="submit"
                            disabled={!canManageSettings || isSaving}
                            className="w-full h-14 bg-[#E63946] text-white rounded-2xl font-black text-base uppercase tracking-wider hover:bg-[#C62828] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            title={!canManageSettings ? 'Requires manage_settings permission' : undefined}
                          >
                            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Financials
                          </button>
                        </PermissionGuard>
                      </A7Button>
                    </div>
                  </A7Card>
                </form>
              )}

              {activeTab === 'hardware' && (
                <form onSubmit={handleSet(onSaveSettings)} className="space-y-8">
                  <A7Card className="space-y-8 !p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 border-b border-[#F1F5F9] pb-6">
                       <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl"><Monitor size={24} /></div>
                       <h3 className="text-xl font-black text-[#0F172A]">Terminals & KDS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div>
                               <p className="font-black text-sm">Kitchen Audio Alerts</p>
                               <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Ding on new orders</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setSetValue('enableKitchenAudio', !watchSet('enableKitchenAudio'))}
                              className={`w-12 h-6 rounded-full transition-all relative ${watchSet('enableKitchenAudio') ? 'bg-[#10B981]' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${watchSet('enableKitchenAudio') ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">KDS Polling Frequency (sec)</label>
                        <input {...regSet('kdsRefreshRate')} type="number" className="w-full px-6 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl outline-none font-bold" />
                      </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-sm font-black uppercase tracking-widest text-[#64748B]">Connected Printers</h4>
                       <div className="space-y-3">
                          <div className="p-6 rounded-2xl bg-white border-2 border-[#10B981] flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Volume2 size={20} /></div>
                                <div>
                                   <p className="font-black text-sm">Main Kitchen Printer</p>
                                   <p className="text-[10px] font-bold text-[#94A3B8]">IP: 192.168.1.55 • EPSON TM-T88VI</p>
                                </div>
                             </div>
                             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full">Active</span>
                          </div>
                          <button className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-[#94A3B8] flex items-center justify-center gap-3 hover:border-[#E63946] hover:text-[#E63946] transition-all">
                             <Plus size={20} /> Add Hardware Device
                          </button>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <A7Button type="submit" disabled={isSaving} className="h-16 px-12 rounded-2xl text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest">
                        Apply Settings
                      </A7Button>
                    </div>
                  </A7Card>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
