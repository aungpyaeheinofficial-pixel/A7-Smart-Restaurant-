
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Monitor, Box, Users } from 'lucide-react';

interface QuickActionItem {
  label: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickActionItem[] = [
    { label: 'New Order', icon: Plus, color: 'bg-red-500', path: '/app/pos' },
    { label: 'View KDS', icon: Monitor, color: 'bg-blue-500', path: '/app/kitchen' },
    { label: 'Inventory', icon: Box, color: 'bg-yellow-500', path: '/app/inventory' },
    { label: 'Staffing', icon: Users, color: 'bg-green-500', path: '/app/staff' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center group transition-all"
        >
          <div className={`w-16 h-16 md:w-20 md:h-20 ${action.color} rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl active:scale-95`}>
            <action.icon size={window.innerWidth < 768 ? 24 : 32} strokeWidth={2.5} />
          </div>
          <span className="mt-3 font-black text-sm md:text-base text-[#0F172A] tracking-tight group-hover:text-[#E63946] transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};
