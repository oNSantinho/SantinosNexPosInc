import React from 'react';
import { Sale } from '../../types';
import { Printer, X, CheckCircle2, Store } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">Venta Registrada</h3>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Comprobante #{sale.code}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="overflow-y-auto pr-1">
          <div 
            id="thermal-receipt" 
            className="bg-white text-slate-900 p-6 rounded-2xl font-mono text-xs shadow-inner space-y-4 border border-slate-200"
          >
            {/* Receipt Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
              <div className="flex items-center justify-center gap-1.5 font-sans font-black text-base text-slate-950">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>SantinoNexPOS</span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">Ferretería & Almacén Central</p>
              <p className="text-[10px] text-slate-500">CUIT: 30-71994422-5 • Resp. Inscripto</p>
              <p className="text-[10px] text-slate-500">Av. Libertador 1820, Buenos Aires</p>
            </div>

            {/* Meta Info */}
            <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-400 text-slate-700">
              <div className="flex justify-between">
                <span>TICKET Nº:</span>
                <span className="font-bold text-slate-950">{sale.code}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(sale.createdAt).toLocaleDateString('es-AR')} {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>CAJERO:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="font-bold text-indigo-700">{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-2 pb-3 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                <span>Cant • Descripción</span>
                <span>Importe</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-medium text-[11px]">
                    <span className="truncate pr-2">{item.quantity}x {item.productName}</span>
                    <span className="shrink-0 font-bold">${item.subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    (${item.unitPrice.toLocaleString('es-AR')} c/u • SKU: {item.sku})
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-400">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Subtotal:</span>
                <span>${sale.subtotal.toLocaleString('es-AR')}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-xs text-rose-600">
                  <span>Descuento:</span>
                  <span>-${sale.discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>${sale.total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-400 text-slate-700">
              <div className="flex justify-between">
                <span>FORMA DE PAGO:</span>
                <span className="font-bold">
                  {sale.paymentMethod === 'CASH' && 'Efectivo'}
                  {sale.paymentMethod === 'QR' && 'Mercado Pago QR'}
                  {sale.paymentMethod === 'CARD' && 'Tarjeta Débito/Crédito'}
                  {sale.paymentMethod === 'CREDIT' && 'Cuenta Corriente (Fiado)'}
                </span>
              </div>
              {sale.paymentMethod === 'CASH' && sale.cashReceived && (
                <>
                  <div className="flex justify-between">
                    <span>Abona con:</span>
                    <span>${sale.cashReceived.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>Su Vuelto:</span>
                    <span>${(sale.changeGiven || 0).toLocaleString('es-AR')}</span>
                  </div>
                </>
              )}
              {sale.qrTransactionId && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ID Transacción:</span>
                  <span className="font-mono">{sale.qrTransactionId}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer note */}
            <div className="text-center space-y-2 pt-1">
              <div className="font-mono text-2xl tracking-[0.25em] text-slate-950 font-bold select-none">
                ||| | |||| | ||| |||| | ||
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                ¡Gracias por su compra!
              </p>
              <p className="text-[9px] text-slate-400">
                Conserve este comprobante ante cualquier cambio
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-transform active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Imprimir Ticket / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
