
import React, { useMemo, useState, useRef } from 'react';
import { useGlobal } from '../Providers';
import { A7Card, A7Button, A7Badge, A7Modal } from '../components/A7UI';
import { Users, Clock, LogOut, LogIn, Shield, UserCheck, Plus, Lock, Camera, X, Upload, ChevronDown } from 'lucide-react';
import { StaffMember, StaffRole } from '../types';
import { useForm } from 'react-hook-form';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Individual Staff Card with Permission Logic & Data Integrity
 */
const StaffCard: React.FC<{ 
  member: StaffMember; 
  currentUser: { id: string; role: string };
  onClock: (id: string) => void;
}> = ({ member, currentUser, onClock }) => {
  const { hasPermission, isManager } = usePermissions();
  
  // Permission Logic: 
  const canManageShift = useMemo(() => {
    const canManageStaff = hasPermission('manage_staff');
    const isSelf = currentUser.id === member.id;
    return canManageStaff || isSelf;
  }, [currentUser, member, hasPermission]);

  // Data Integrity: Calculate Total Today based on Clock In
  const totalToday = useMemo(() => {
    if (!member.isActive || !member.lastClockIn) return "0H 0M";
    
    const start = new Date(member.lastClockIn).getTime();
    const now = Date.now();
    const diffMs = now - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}H ${minutes}M`;
  }, [member.isActive, member.lastClockIn]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'error';
      case 'Server': return 'info';
      case 'Kitchen': return 'success';
      case 'Cashier': return 'warning';
      default: return 'info';
    }
  };

  return (
    <A7Card className={`relative flex flex-col group overflow-hidden transition-all ${!canManageShift ? 'opacity-90' : ''}`} hoverEffect>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${member.isActive ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`}></div>
      
      <div className="flex items-start gap-4 mb-6 pt-2">
        <div className="relative">
          <img 
            src={member.avatar} 
            alt={member.name} 
            className={`w-16 h-16 rounded-2xl object-cover ring-4 ring-[#F8F9FA] transition-all ${member.isActive ? 'scale-105' : 'grayscale-[0.5]'}`} 
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${member.isActive ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-lg text-[#0F172A] truncate">{member.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <A7Badge variant={getRoleColor(member.role)}>{member.role}</A7Badge>
            {currentUser.id === member.id && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">YOU</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div className="bg-[#F8F9FA] p-4 rounded-2xl space-y-3 border border-[#F1F5F9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
              <Clock size={12} /> Last Clock In
            </div>
            <span className="text-sm font-black text-[#0F172A]">
              {member.lastClockIn ? new Date(member.lastClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-[#64748B] uppercase tracking-widest">
               Session Time
            </div>
            <span className={`text-sm font-black ${member.isActive ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {member.isActive && member.lastClockIn ? totalToday : 'NOT STARTED'}
            </span>
          </div>
        </div>
      </div>

      {canManageShift ? (
        <A7Button 
          variant={member.isActive ? 'secondary' : 'primary'}
          className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-black/5"
          onClick={() => onClock(member.id)}
        >
          {member.isActive ? <><LogOut size={16} /> End Shift</> : <><LogIn size={16} /> Start Shift</>}
        </A7Button>
      ) : (
        <div className="w-full h-12 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 gap-2 cursor-not-allowed">
          <Lock size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Manager Protected</span>
        </div>
      )}
    </A7Card>
  );
};

/**
 * Modal to add a new staff member
 */
const NewStaffModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: any) => void }> = ({ isOpen, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      role: 'Server' as StaffRole,
      avatar: 'https://i.pravatar.cc/150?u=' + Math.random().toString(36).substring(7)
    }
  });

  const avatarPreview = watch('avatar');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = () => {
    setValue('avatar', `https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}`);
  };

  if (!isOpen) return null;

  return (
    <A7Modal isOpen={isOpen} onClose={onClose} title="Register New Team Member">
      <form onSubmit={handleSubmit(onSave)} className="space-y-8 py-2">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera size={24} />
              </button>
            </div>
            <button 
              type="button"
              onClick={generateRandomAvatar}
              className="mt-4 text-[10px] font-black text-[#E63946] uppercase tracking-[0.2em] hover:underline"
            >
              Shuffle Avatar
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Full Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Robert Smith"
              className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[1.5rem] outline-none focus:bg-white focus:border-[#E63946] transition-all font-bold text-[#0F172A]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest px-1">Assigned Role</label>
            <div className="relative">
              <select 
                {...register('role')}
                className="w-full px-5 py-4 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[1.5rem] outline-none focus:bg-white focus:border-[#E63946] transition-all font-bold text-[#0F172A] appearance-none cursor-pointer"
              >
                <option value="Manager">Manager</option>
                <option value="Server">Server</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Cashier">Cashier</option>
              </select>
              <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <A7Button type="submit" className="h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-red-100 uppercase tracking-widest">
            Add To Roster
          </A7Button>
          <A7Button type="button" variant="secondary" className="h-16 rounded-[1.5rem] font-bold border-2" onClick={onClose}>
            Cancel
          </A7Button>
        </div>
      </form>
    </A7Modal>
  );
};

export const StaffMgmt: React.FC = () => {
  const { staff, currentUser, clockStaff, createStaff } = useGlobal();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddMember = async (data: any) => {
    const newMember: StaffMember = {
      id: 'staff-' + Date.now(),
      name: data.name,
      role: data.role,
      isActive: false,
      avatar: data.avatar
    };
    await createStaff(newMember);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Staff Management</h2>
          <p className="text-[#64748B] font-medium mt-1">Monitor shifts, attendance, and role permissions.</p>
        </div>
        <div className="flex gap-3">
          <A7Button variant="secondary" className="rounded-2xl border-2 border-[#E2E8F0] px-6 h-12">
            <Shield size={18} strokeWidth={2.5} /> Roles & Permissions
          </A7Button>
          <A7Button 
            className="rounded-2xl px-8 h-12 shadow-xl shadow-red-100"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} strokeWidth={3} /> Add New Member
          </A7Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <A7Card className="!p-6 bg-white flex items-center gap-5 border-none shadow-sm">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
             <UserCheck size={28} />
           </div>
           <div>
             <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Currently Active</p>
             <p className="text-2xl font-black text-[#0F172A]">{staff.filter(s => s.isActive).length} Members</p>
           </div>
        </A7Card>
        <A7Card className="!p-6 bg-white flex items-center gap-5 border-none shadow-sm">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
             <Clock size={28} />
           </div>
           <div>
             <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Avg Shift Length</p>
             <p className="text-2xl font-black text-[#0F172A]">6.4 Hours</p>
           </div>
        </A7Card>
        <A7Card className="!p-6 bg-white flex items-center gap-5 border-none shadow-sm">
           <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
             <Shield size={28} />
           </div>
           <div>
             <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Managers On Duty</p>
             <p className="text-2xl font-black text-[#0F172A]">{staff.filter(s => s.isActive && s.role === 'Manager').length}</p>
           </div>
        </A7Card>
        <A7Card className="!p-6 bg-white flex items-center gap-5 border-none shadow-sm">
           <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
             <Users size={28} />
           </div>
           <div>
             <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total Workforce</p>
             <p className="text-2xl font-black text-[#0F172A]">{staff.length} Employees</p>
           </div>
        </A7Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {staff.map(member => (
          <StaffCard 
            key={member.id} 
            member={member} 
            currentUser={currentUser} 
            onClock={clockStaff} 
          />
        ))}
      </div>

      <NewStaffModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
      />
    </div>
  );
};
