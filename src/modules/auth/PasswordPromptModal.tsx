import React, { useState } from 'react';
import { User } from '../../types';
import { Lock, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { RoleBadge } from './RoleBadge';

interface PasswordPromptModalProps {
  targetUser: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  targetUser,
  onSuccess,
  onCancel,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = targetUser.password || (targetUser.role === 'ADMIN' ? 'admin' : 'gerente');

    if (inputPassword === correctPassword) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setInputPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm leading-tight">Acceso Restringido</h3>
              <p className="text-[10px] text-slate-400">Verificación de Seguridad</p>
            </div>
          </div>

          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {targetUser.avatarUrl ? (
              <img src={targetUser.avatarUrl} alt={targetUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {targetUser.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{targetUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{targetUser.email}</p>
            </div>
          </div>
          <RoleBadge role={targetUser.role} showIcon={false} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Ingresa la contraseña de {targetUser.role === 'ADMIN' ? 'Administrador' : 'Gerente'}:
            </label>
            <input
              type="password"
              autoFocus
              required
              placeholder="Contraseña..."
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {error && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Contraseña incorrecta. Inténtalo de nuevo.
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5">
              💡 Clave por defecto: <span className="font-mono text-slate-400 font-bold">{targetUser.role === 'ADMIN' ? 'admin' : 'gerente'}</span>
            </p>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
