
import React from 'react';
import { X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const A7Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const base = "font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#E63946] text-white hover:bg-[#C62828] shadow-sm",
    secondary: "border border-[#E2E8F0] text-[#0F172A] bg-white hover:bg-[#F8F9FA]",
    ghost: "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
    success: "bg-[#10B981] text-white hover:bg-[#059669]",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const A7Card: React.FC<{ children: React.ReactNode; className?: string; hoverEffect?: boolean }> = ({ 
  children, 
  className = '',
  hoverEffect = false
}) => (
  <div className={`bg-white rounded-2xl p-6 a7-shadow-md border border-[#E2E8F0] transition-all ${hoverEffect ? 'hover:a7-shadow-lg hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

export const A7Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' }> = ({ 
  children, 
  variant = 'info' 
}) => {
  const styles = {
    success: "bg-[#D1FAE5] text-[#065F46]",
    warning: "bg-[#FEF3C7] text-[#92400E]",
    error: "bg-[#FEE2E2] text-[#991B1B]",
    info: "bg-[#DBEAFE] text-[#1E40AF]",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const A7Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors text-[#64748B]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
