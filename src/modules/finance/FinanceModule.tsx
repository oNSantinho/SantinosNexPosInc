import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  PlusCircle, 
  MinusCircle 
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const { 
    currentCashSession, 
    cashMovements, 
    openCashSession, 
    closeCashSession, 
    addCashMovement,
    currentUser
  } = useAppStore();

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Form states
  const [initialBalanceInput, setInitialBalanceInput] = useState(15000);
  const [sessionNotesInput, setSessionNotesInput] = useState('');
  
  const [actualBalanceInput, setActualBalanceInput] = useState(
    currentCashSession ? currentCashSession.expectedBalance : 0
  );

  const [movementForm, setMovementForm] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: 1000,
    reason: '',
  });

  const isSessionOpen = currentCashSession?.status === 'OPEN';
  const isReadOnly = currentUser.role === 'CASHIER';

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(initialBalanceInput, sessionNotesInput);
    setIsOpenModalOpen(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashSession(actualBalanceInput, sessionNotesInput);
    setIsCloseModalOpen(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashMovement(movementForm.type, movementForm.amount, movementForm.reason);
    setIsMovementModalOpen(false);
    setMovementForm({ type: 'INCOME', amount: 1000, reason: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Control de Dinero & Cierre de Caja
          </h2>
          <p className="text-xs text-slate-400">Supervisa el flujo de dinero, cobros con QR, tarjetas y el arqueo diario.</p>
        </div>

        <div className="flex items-center gap-3">
          {isSessionOpen ? (
            <>
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Ingreso / Egreso
              </button>
              <button
                onClick={() => {
                  setActualBalanceInput(currentCashSession.expectedBalance);
                  setIsCloseModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
              >
                <Lock className="w-4 h-4" />
                Arqueo & Cierre de Caja
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30"
            >
              <Unlock className="w-4 h-4" />
              Abrir Turno de Caja
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      {currentCashSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo Inicial + Ventas Efectivo */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Efectivo en Caja</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              ${(currentCashSession.initialBalance + currentCashSession.cashSales + currentCashSession.incomes - currentCashSession.expenses).toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span>Inicial: ${currentCashSession.initialBalance.toLocaleString('es-AR')}</span>
              <span>• Ventas: ${currentCashSession.cashSales.toLocaleString('es-AR')}</span>
            </p>
          </div>

          {/* Card 2: Ventas QR */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Cobros Digitales con QR</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400">
              ${currentCashSession.qrSales.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Acreditado instantáneo en Mercado Pago</p>
          </div>

          {/* Card 3: Ventas Tarjeta */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Tarjetas Débito / Crédito</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-300">
              ${currentCashSession.cardSales.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Lote Posnet del turno</p>
          </div>

          {/* Card 4: Total Facturado en Turno */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-slate-900">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-indigo-300">Facturación Total Turno</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              ${(currentCashSession.cashSales + currentCashSession.qrSales + currentCashSession.cardSales).toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-2">
              Estado: {isSessionOpen ? '🟢 En curso' : '🔴 Caja Cerrada'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No hay turno de caja abierto</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Debes iniciar un nuevo turno de caja para comenzar a facturar y registrar ingresos/egresos.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg"
          >
            Abrir Caja Ahora
          </button>
        </div>
      )}

      {/* Movement & Audit Log Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          Movimientos de Caja Manuales (Ingresos y Egresos de Fondo)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Hora / Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Motivo / Concepto</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cashMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 text-xs">
                    No se han registrado movimientos de fondo en este turno.
                  </td>
                </tr>
              ) : (
                cashMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          mov.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {mov.type === 'INCOME' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" /> Ingreso
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" /> Egreso
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">{mov.reason}</td>
                    <td className={`p-3 text-right font-bold ${mov.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {mov.type === 'INCOME' ? '+' : '-'}${mov.amount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPEN SESSION MODAL */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                Abrir Turno de Caja
              </h3>
              <button onClick={() => setIsOpenModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Monto Inicial de Cambio ($)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={initialBalanceInput}
                  onChange={(e) => setInitialBalanceInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notas de Apertura</label>
                <input
                  type="text"
                  placeholder="ej: Cambio otorgado por administración"
                  value={sessionNotesInput}
                  onChange={(e) => setSessionNotesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsOpenModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg">
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE SESSION (ARQUEO) MODAL */}
      {isCloseModalOpen && currentCashSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                Arqueo & Cierre de Caja
              </h3>
              <button onClick={() => setIsCloseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Saldo Inicial:</span>
                <span className="font-mono">${currentCashSession.initialBalance.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ventas en Efectivo:</span>
                <span className="font-mono text-emerald-400">+${currentCashSession.cashSales.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ingresos Fondo:</span>
                <span className="font-mono text-emerald-400">+${currentCashSession.incomes.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Egresos Fondo:</span>
                <span className="font-mono text-rose-400">-${currentCashSession.expenses.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>Efectivo Esperado en Caja:</span>
                <span className="text-indigo-400">${currentCashSession.expectedBalance.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Efectivo Real Contado ($)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualBalanceInput}
                  onChange={(e) => setActualBalanceInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-white"
                />
              </div>

              {/* Difference calculation warning */}
              {actualBalanceInput !== currentCashSession.expectedBalance && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    actualBalanceInput > currentCashSession.expectedBalance
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Diferencia de Arqueo:{' '}
                    {actualBalanceInput > currentCashSession.expectedBalance
                      ? `Sobrante +$${(actualBalanceInput - currentCashSession.expectedBalance).toLocaleString('es-AR')}`
                      : `Faltante -$${(currentCashSession.expectedBalance - actualBalanceInput).toLocaleString('es-AR')}`}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Observaciones del Cierre</label>
                <input
                  type="text"
                  placeholder="ej: Arqueo conforme / Cambio guardado en caja fuerte"
                  value={sessionNotesInput}
                  onChange={(e) => setSessionNotesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsCloseModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg">
                  Confirmar Cierre de Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVEMENT MODAL */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Registro de Ingreso / Egreso de Fondo</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tipo de Movimiento</label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="INCOME">Ingreso a Caja (+)</option>
                  <option value="EXPENSE">Egreso / Retiro (-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Monto ($)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementForm.amount}
                  onChange={(e) => setMovementForm({ ...movementForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Motivo / Concepto</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Pago de taxi / Retiro de cambio extra"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm">
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
