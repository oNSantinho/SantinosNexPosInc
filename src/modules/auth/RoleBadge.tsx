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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {showIcon && <ShieldAlert className="w-3.5 h-3.5" />}
          ADMINISTRADOR
        </span>
      );
    case 'MANAGER':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
          GERENTE
        </span>
      );
    case 'CASHIER':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {showIcon && <Shield className="w-3.5 h-3.5" />}
          CAJERO
        </span>
      );
  }
};
