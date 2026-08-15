import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Product, PaymentMethod, Sale } from '../../types';
import { QRPaymentModal } from '../payments/QRPaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { soundEffects } from '../../shared/soundEffects';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  X, 
  Sparkles,
  UserCheck,
  BookOpen,
  Keyboard
} from 'lucide-react';

export const POSModule: React.FC = () => {
  const { 
    products, 
    cart, 
    customers,
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    completeSale, 
    initiateQRPayment,
    currentCashSession
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cashReceivedInput, setCashReceivedInput] = useState<number>(0);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isCashSessionOpen = currentCashSession?.status === 'OPEN';

  // Global Keyboard Shortcuts (F2: Search, F4: Checkout, ESC: Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && isCashSessionOpen) {
          handleCheckout();
        }
      } else if (e.key === 'Escape') {
        if (searchTerm) {
          setSearchTerm('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const changeGiven = paymentMethod === 'CASH' && cashReceivedInput ? Math.max(0, cashReceivedInput - cartTotal) : 0;

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      soundEffects.playErrorBeep();
      return;
    }
    soundEffects.playBeep();
    addToCart(product);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      soundEffects.playErrorBeep();
      return;
    }

    if (!isCashSessionOpen) {
      soundEffects.playErrorBeep();
      alert('Debes abrir el turno de caja antes de realizar ventas.');
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      soundEffects.playErrorBeep();
      alert('Debes seleccionar un cliente para registrar una venta a Cuenta Corriente (Fiado).');
      return;
    }

    if (paymentMethod === 'QR') {
      initiateQRPayment(cartTotal);
      return;
    }

    const sale = completeSale(paymentMethod, cashReceivedInput, selectedCustomerId || undefined);
    if (sale) {
      soundEffects.playCashChime();
      setLastCompletedSale(sale);
      setCashReceivedInput(0);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* LEFT PANEL: Product Grid & Search */}
      <div className="flex-1 flex flex-col space-y-4 min-w-0">
        {/* Search bar & Category Pills */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar producto por nombre, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-20 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-3 top-2 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                <Keyboard className="w-3 h-3" /> F2
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock <= product.minStock;
              const cartItem = cart.find((i) => i.productId === product.id);
              const inCartQty = cartItem?.quantity || 0;

              return (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock || !isCashSessionOpen}
                  className={`group relative text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isOutOfStock
                      ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-800'
                      : inCartQty > 0
                      ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'glass-card hover:border-indigo-500/40'
                  }`}
                >
                  {/* Badge count in cart */}
                  {inCartQty > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-lg animate-in zoom-in">
                      {inCartQty}
                    </span>
                  )}

                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{product.sku}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOutOfStock
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isOutOfStock ? 'Sin Stock' : `${product.stock} ${product.unit}`}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-2 mt-1 leading-snug">
                      {product.name}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-base font-extrabold text-emerald-400">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                    <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: POS Checkout Cart (Fixed bottom action, scrollable middle) */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col h-full max-h-full shadow-2xl shrink-0 overflow-hidden">
        {/* Top Header & Customer Selector (Shrink 0) */}
        <div className="shrink-0">
          {/* Cart Header */}
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-2.5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Carrito de Venta</h3>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Customer selection for sale */}
          <div className="mb-2.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-400" />
              Cliente (Opcional):
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Consumidor Final (Sin Cuenta)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.balance > 0 ? `(Debe: $${c.balance.toLocaleString('es-AR')})` : '(Al Día)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Cart Items List (Takes available height smoothly) */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 my-1">
          {cart.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-2">
              <ShoppingCart className="w-8 h-8 opacity-30" />
              <p className="text-xs">El carrito está vacío.</p>
              <p className="text-[11px] text-slate-600">Presiona [F2] para buscar un producto.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ${item.unitPrice.toLocaleString('es-AR')} c/u
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[55px]">
                  <p className="text-xs font-bold text-emerald-400">${item.subtotal.toLocaleString('es-AR')}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pinned Bottom Payment & Checkout Section (Always Visible, Shrink 0) */}
        <div className="shrink-0 space-y-2.5 pt-2.5 border-t border-slate-800 mt-auto">
          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Método de Cobro
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Efectivo</span>
              </button>

              <button
                onClick={() => setPaymentMethod('QR')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  paymentMethod === 'QR'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pago QR</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tarjeta</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CREDIT')}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  paymentMethod === 'CREDIT'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Fiado</span>
              </button>
            </div>
          </div>

          {/* Cash input & change calculator */}
          {paymentMethod === 'CASH' && (
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Paga con ($):</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Monto..."
                  value={cashReceivedInput || ''}
                  onChange={(e) => setCashReceivedInput(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-white"
                />
              </div>
              {cashReceivedInput > 0 && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Vuelto:</span>
                  <span className="font-bold text-amber-400 font-mono">${changeGiven.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          )}

          {/* Total & Checkout Button with F4 shortcut */}
          <div className="space-y-2 pt-0.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-slate-300">Total a Cobrar:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                ${cartTotal.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !isCashSessionOpen}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {paymentMethod === 'QR' 
                  ? 'Generar Código QR' 
                  : paymentMethod === 'CREDIT' 
                  ? 'Cargar a Cuenta Corriente' 
                  : 'Completar Venta ($)'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-bold">F4</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR PAYMENT MODAL */}
      <QRPaymentModal totalAmount={cartTotal} />

      {/* PRINTABLE THERMAL RECEIPT MODAL */}
      {lastCompletedSale && (
        <ReceiptModal
          sale={lastCompletedSale}
          onClose={() => setLastCompletedSale(null)}
        />
      )}
    </div>
  );
};
