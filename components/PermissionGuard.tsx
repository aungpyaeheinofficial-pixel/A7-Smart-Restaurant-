import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission | Permission[];
  fallback?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallback = null,
  showError = false,
  errorMessage,
}) => {
  const { hasPermission, hasAnyPermission, role } = usePermissions();

  const hasAccess = Array.isArray(requiredPermission)
    ? hasAnyPermission(requiredPermission)
    : hasPermission(requiredPermission);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showError) {
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission.join(' or ')
      : requiredPermission;
    
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <Shield size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-black text-[#0F172A]">Access Restricted</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {errorMessage || `You need the "${permissions.replace(/_/g, ' ')}" permission to access this feature.`}
          </p>
          <p className="text-xs text-[#94A3B8] font-bold">
            Your current role: <span className="text-[#E63946] uppercase">{role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};

/**
 * Permission Button Wrapper
 * Disables button and shows tooltip if user lacks permission
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPermission: Permission | Permission[];
  children: React.ReactNode;
  showTooltip?: boolean;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  requiredPermission,
  children,
  showTooltip = true,
  className = '',
  disabled,
  ...props
}) => {
  const { hasPermission, hasAnyPermission, role } = usePermissions();

  const hasAccess = Array.isArray(requiredPermission)
    ? hasAnyPermission(requiredPermission)
    : hasPermission(requiredPermission);

  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission.join(' or ')
    : requiredPermission;

  return (
    <div className="relative group">
      <button
        {...props}
        disabled={disabled || !hasAccess}
        className={`${className} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!hasAccess && showTooltip ? `Requires: ${permissions.replace(/_/g, ' ')}` : undefined}
      >
        {children}
      </button>
      {!hasAccess && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Requires: {permissions.replace(/_/g, ' ')}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0F172A]"></div>
        </div>
      )}
    </div>
  );
};

