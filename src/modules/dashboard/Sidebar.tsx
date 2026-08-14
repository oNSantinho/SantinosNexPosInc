import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Wallet, 
  ShieldCheck, 
  Store, 
  AlertTriangle 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { products, currentUser } = useAppStore();

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const canAccessUsers = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  const menuItems = [
    {
      id: 'pos',
      label: 'Punto de Venta',
      icon: ShoppingCart,
      badge: null,
    },
    {
      id: 'stock',
      label: 'Control de Stock',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'suppliers',
      label: 'Distribuidores',
      icon: Truck,
      badge: null,
    },
    {
      id: 'finance',
      label: 'Control de Dinero & Caja',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'users',
      label: 'Seguridad & Usuarios',
      icon: ShieldCheck,
      badge: canAccessUsers ? null : 'Bloqueado',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      disabled: !canAccessUsers,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-4 min-h-screen">
      <div>
        {/* Brand logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-xl">
            N
          </div>
          <div>
            <h2 className="font-extrabold text-white tracking-wide text-lg leading-tight">NexPOS</h2>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">ERP & Control Total</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) setActiveTab(item.id);
                }}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                    : item.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Business info footer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-2.5 mb-2">
          <Store className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Ferretería & Almacén Central</span>
        </div>
        <p className="text-[11px] text-slate-500">Estado: Operativo 24/7</p>
      </div>
    </aside>
  );
};
