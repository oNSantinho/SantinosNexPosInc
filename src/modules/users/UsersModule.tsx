import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Role } from '../../types';
import { RoleBadge } from '../auth/RoleBadge';
import { ShieldCheck, Plus, Trash2, Key, Lock, Check, X, ShieldAlert } from 'lucide-react';

export const UsersModule: React.FC = () => {
  const { users, addUser, deleteUser, currentUser } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CASHIER' as Role,
  });

  const canManage = currentUser.role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      ...formData,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
    });
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'CASHIER' });
  };

  const matrixPermissions = [
    { feature: 'Punto de Venta (POS)', admin: true, manager: true, cashier: true },
    { feature: 'Ver Catálogo y Stock', admin: true, manager: true, cashier: true },
    { feature: 'Crear / Editar / Ajustar Stock', admin: true, manager: true, cashier: false },
    { feature: 'Ver / Gestionar Distribuidores', admin: true, manager: true, cashier: false },
    { feature: 'Apertura / Cierre de Caja Chica', admin: true, manager: true, cashier: true },
    { feature: 'Ver Arqueo Financiero Completo', admin: true, manager: true, cashier: false },
    { feature: 'Crear / Eliminar Usuarios (RBAC)', admin: true, manager: false, cashier: false },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Control de Usuarios y Seguridad Estándar (RBAC)
          </h2>
          <p className="text-xs text-slate-400">Administra el acceso del personal y las políticas de seguridad por rol.</p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className={`glass-panel p-5 rounded-2xl border flex items-center justify-between transition-all ${
              currentUser.id === u.id
                ? 'border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center">
                  {u.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  {u.name}
                  {currentUser.id === u.id && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">TÚ</span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mb-1">{u.email}</p>
                <RoleBadge role={u.role} />
              </div>
            </div>

            {canManage && currentUser.id !== u.id && (
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar al usuario "${u.name}"?`)) {
                    deleteUser(u.id);
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                title="Eliminar Usuario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Security Matrix Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            Matriz de Permisos y Seguridad Estándar
          </h3>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
            JWT & CORS Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Módulo / Permiso</th>
                <th className="p-3 text-center">Administrador</th>
                <th className="p-3 text-center">Gerente</th>
                <th className="p-3 text-center">Cajero</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {matrixPermissions.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">{row.feature}</td>
                  <td className="p-3 text-center">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  </td>
                  <td className="p-3 text-center">
                    {row.manager ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.cashier ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500/80 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Nuevo Usuario</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="ej: Andrés López"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="alopez@nexpos.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Rol de Usuario</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="CASHIER">Cajero (Punto de Venta y Cobro)</option>
                  <option value="MANAGER">Gerente (Stock, Proveedores y Finanzas)</option>
                  <option value="ADMIN">Administrador (Acceso Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
