import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Product, PaymentMethod, Sale } from '../../types';
import { QRPaymentModal } from '../payments/QRPaymentModal';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  Printer, 
  AlertTriangle, 
  X, 
  Sparkles 
} from 'lucide-react';

export const POSModule: React.FC = () => {
  const { 
    products, 
    cart, 
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
  const [cashReceivedInput, setCashReceivedInput] = useState<number>(0);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const isCashSessionOpen = currentCashSession?.status === 'OPEN';

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

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (!isCashSessionOpen) {
      alert('Debes abrir el turno de caja antes de realizar ventas.');
      return;
    }

    if (paymentMethod === 'QR') {
      initiateQRPayment(cartTotal);
      return;
    }

    const sale = completeSale(paymentMethod, cashReceivedInput);
    if (sale) {
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
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar producto por nombre, SKU o código de barras (F2)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
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
                  onClick={() => addToCart(product)}
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

      {/* RIGHT PANEL: POS Checkout Cart */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl shrink-0">
        <div>
          {/* Cart Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Carrito de Venta</h3>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
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

          {/* Cart items list */}
          <div className="max-h-[38vh] overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs">El carrito está vacío.</p>
                <p className="text-[11px] text-slate-600">Haz clic en un producto para agregarlo.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ${item.unitPrice.toLocaleString('es-AR')} c/u
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <p className="text-xs font-bold text-emerald-400">${item.subtotal.toLocaleString('es-AR')}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment selector & Checkout action */}
        <div className="space-y-4 pt-4 border-t border-slate-800 mt-2">
          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                onClick={() => setPaymentMethod('QR')}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'QR'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Pago QR</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Cash input & change calculator */}
          {paymentMethod === 'CASH' && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Paga con ($):</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Monto recibido..."
                  value={cashReceivedInput || ''}
                  onChange={(e) => setCashReceivedInput(Number(e.target.value))}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-bold text-white"
                />
              </div>
              {cashReceivedInput > 0 && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Vuelto a Entregar:</span>
                  <span className="font-bold text-amber-400 font-mono">${changeGiven.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          )}

          {/* Total & Checkout Button */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-slate-300">Total a Cobrar:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${cartTotal.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !isCashSessionOpen}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {paymentMethod === 'QR' ? 'Generar Código QR' : 'Completar Venta ($)'}
            </button>
          </div>
        </div>
      </div>

      {/* QR PAYMENT MODAL INTEGRATION */}
      <QRPaymentModal totalAmount={cartTotal} />

      {/* PRINT TICKET SUCCESS MODAL */}
      {lastCompletedSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-white text-lg">¡Venta Registrada!</h3>
              <p className="text-xs text-slate-400">Comprobante: {lastCompletedSale.code}</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300 text-left">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-emerald-400">${lastCompletedSale.total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span className="font-semibold text-indigo-400">{lastCompletedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLastCompletedSale(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Cerrar Ticket
              </button>
              <button
                onClick={() => {
                  alert(`Imprimiendo comprobante ${lastCompletedSale.code}...`);
                  setLastCompletedSale(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
