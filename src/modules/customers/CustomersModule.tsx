import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Customer } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  DollarSign, 
  X, 
  CheckCircle2, 
  AlertCircle,
  CreditCard
} from 'lucide-react';

export const CustomersModule: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    adjustCustomerBalance,
    addCashMovement,
    currentCashSession,
    currentUser 
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dniOrTaxId: '',
    address: '',
    balance: 0,
    creditLimit: 50000,
    notes: '',
  });

  const isReadOnly = currentUser.role === 'CASHIER';

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.dniOrTaxId && c.dniOrTaxId.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || paymentAmount <= 0) return;

    adjustCustomerBalance(paymentCustomer.id, -paymentAmount, `Pago de deuda recibido`);

    if (currentCashSession && currentCashSession.status === 'OPEN') {
      addCashMovement('INCOME', paymentAmount, `Cobro de cuenta corriente: ${paymentCustomer.name}`);
    }

    setPaymentCustomer(null);
    setPaymentAmount(0);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      dniOrTaxId: '',
      address: '',
      balance: 0,
      creditLimit: 50000,
      notes: '',
    });
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      dniOrTaxId: customer.dniOrTaxId || '',
      address: customer.address || '',
      balance: customer.balance,
      creditLimit: customer.creditLimit,
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const totalDebt = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Directorio de Clientes & Cuentas Corrientes (Fiados)
          </h2>
          <p className="text-xs text-slate-400">
            Control de clientes habituales, límites de crédito y cobranza de deudas.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold">Total Clientes Registrados</p>
          <p className="text-2xl font-black text-white mt-1">{customers.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-950/10">
          <p className="text-xs text-rose-300 font-semibold">Total Deuda en la Calle (Fiados)</p>
          <p className="text-2xl font-black text-rose-400 mt-1">${totalDebt.toLocaleString('es-AR')}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
          <p className="text-xs text-emerald-300 font-semibold">Clientes al Día</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {customers.filter((c) => c.balance <= 0).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-5" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, teléfono o DNI/CUIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            No se encontraron clientes con el término de búsqueda.
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const hasDebt = customer.balance > 0;
            return (
              <div
                key={customer.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{customer.name}</h3>
                      {customer.dniOrTaxId && (
                        <p className="text-xs text-indigo-400 font-mono">DNI/CUIT: {customer.dniOrTaxId}</p>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(customer)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Editar Cliente"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar al cliente "${customer.name}"?`)) {
                              deleteCustomer(customer.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                          title="Eliminar Cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`tel:${customer.phone}`} className="hover:text-indigo-400 font-mono">
                        {customer.phone}
                      </a>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>

                  {customer.notes && (
                    <p className="mt-3 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50 italic">
                      "{customer.notes}"
                    </p>
                  )}
                </div>

                {/* Account Balance & Payment Action */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Saldo Cta. Cte.:</span>
                    <span
                      className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                        hasDebt
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {hasDebt ? `Debe: $${customer.balance.toLocaleString('es-AR')}` : 'Al Día ($0)'}
                    </span>
                  </div>

                  {hasDebt && (
                    <button
                      onClick={() => {
                        setPaymentCustomer(customer);
                        setPaymentAmount(customer.balance);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Registrar Cobro de Deuda
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre Completo / Razón Social</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  placeholder="ej: Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="ej: +54 11 4455-6677"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">DNI / CUIT</label>
                  <input
                    type="text"
                    value={formData.dniOrTaxId}
                    onChange={(e) => setFormData({ ...formData, dniOrTaxId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="ej: 20-33445566-7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Email (Opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Límite de Fiado ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg">
                  {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER PAYMENT MODAL */}
      {paymentCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Registrar Cobro de Deuda
              </h3>
              <button onClick={() => setPaymentCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Cliente: <span className="font-bold text-white">{paymentCustomer.name}</span></p>
              <p className="text-slate-400">Deuda actual: <span className="font-bold text-rose-400">${paymentCustomer.balance.toLocaleString('es-AR')}</span></p>
            </div>

            <form onSubmit={handleDebtPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Monto que entrega el cliente ($)</label>
                <input
                  type="number"
                  min="1"
                  max={paymentCustomer.balance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setPaymentCustomer(null)} className="px-4 py-2 text-slate-400 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg">
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
