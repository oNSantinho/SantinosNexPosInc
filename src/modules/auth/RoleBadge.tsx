import React from 'react';
import { Role } from '../../types';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap shrink-0">
          {showIcon && <ShieldAlert className="w-3 h-3" />}
          ADMIN
        </span>
      );
    case 'MANAGER':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 whitespace-nowrap shrink-0">
          {showIcon && <ShieldCheck className="w-3 h-3" />}
          GERENTE
        </span>
      );
    case 'CASHIER':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0">
          {showIcon && <Shield className="w-3 h-3" />}
          CAJERO
        </span>
      );
  }
};
