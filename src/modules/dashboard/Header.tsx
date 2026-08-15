import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RoleBadge } from '../auth/RoleBadge';
import { PasswordPromptModal } from '../auth/PasswordPromptModal';
import { UserCheck, Wallet, Lock, User as UserIcon, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, users, setCurrentUser, currentCashSession, setPendingAuthUser } = useAppStore();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isCashOpen = currentCashSession?.status === 'OPEN';

  const handleSelectUser = (u: any) => {
    if (u.id === currentUser.id) {
      setShowUserDropdown(false);
      return;
    }

    // Require password for ADMIN and MANAGER
    if (u.role === 'ADMIN' || u.role === 'MANAGER') {
      setShowUserDropdown(false);
      setPendingAuthUser(u);
    } else {
      setCurrentUser(u);
      setShowUserDropdown(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Path indicator */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight capitalize">
          {activeTab === 'pos' && '🛒 Punto de Venta (POS)'}
          {activeTab === 'stock' && '📦 Control de Stock e Inventario'}
          {activeTab === 'customers' && '👥 Clientes & Cuentas Corrientes (Fiados)'}
          {activeTab === 'suppliers' && '🚚 Gestión de Distribuidores'}
          {activeTab === 'finance' && '💰 Control de Dinero y Arqueo de Caja'}
          {activeTab === 'users' && '🔒 Usuarios y Permisos (RBAC)'}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Cash session status widget */}
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isCashOpen
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          }`}
        >
          {isCashOpen ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Wallet className="w-3.5 h-3.5" />
              <span>Caja Abierta (${currentCashSession?.expectedBalance.toLocaleString('es-AR')})</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Caja Cerrada</span>
            </>
          )}
        </button>

        {/* User Switcher Dropdown for Security RBAC testing */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-left group"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                {currentUser.name}
              </div>
              <RoleBadge role={currentUser.role} showIcon={false} />
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
          </button>

          {/* User selector modal dropdown */}
          {showUserDropdown && (
            <>
              {/* Invisible click-outside backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserDropdown(false)}
              />

              <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800 mb-1.5">
                  <p className="text-xs font-bold text-slate-200">Cambiar Rol / Usuario Activo</p>
                  <p className="text-[11px] text-slate-400">Prueba los permisos y restricciones RBAC</p>
                </div>

                <div className="space-y-1.5">
                  {users.map((u) => {
                    const isSelected = currentUser.id === u.id;
                    const requiresPassword = u.role === 'ADMIN' || u.role === 'MANAGER';
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                          isSelected
                            ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md shadow-indigo-600/10'
                            : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              {u.name}
                              {requiresPassword && (
                                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                              )}
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>

                        <RoleBadge role={u.role} showIcon={false} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
