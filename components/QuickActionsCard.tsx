
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, ChefHat, Package, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuickActionsCard: React.FC = () => {
  const actions = [
    { label: 'New Order', path: '/app/pos', color: 'bg-red-500', icon: ShoppingCart },
    { label: 'View KDS', path: '/app/kitchen', color: 'bg-blue-500', icon: ChefHat },
    { label: 'Inventory', path: '/app/inventory', color: 'bg-amber-500', icon: Package },
    { label: 'Staffing', path: '/app/staff', color: 'bg-emerald-500', icon: Users },
  ];

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#E2E8F0] p-4 md:p-6 lg:p-8">
      <h2 className="text-base md:text-lg font-black text-[#0F172A] mb-4 md:mb-6 lg:mb-8 uppercase tracking-widest">
        Quick Actions
      </h2>
      <nav className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8" aria-label="Quick action navigation">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Link
                to={action.path}
                className="flex flex-col items-center group transition-all focus-visible:ring-4 ring-[#FFEBEE] rounded-xl outline-none"
                aria-label={`${action.label} - Navigate to ${action.label} page`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-active:scale-95 md:group-hover:shadow-xl group-focus:ring-4 group-focus:ring-offset-2 group-focus:ring-[#FFEBEE]`}>
                  <Icon size={20} className="md:w-7 md:h-7 lg:w-[28px] lg:h-[28px]" strokeWidth={3} aria-hidden="true" />
                </div>
                <span className="mt-2 md:mt-3 font-black text-[10px] md:text-[11px] text-[#64748B] uppercase tracking-widest group-hover:text-[#E63946] group-focus:text-[#E63946] transition-colors text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
};
