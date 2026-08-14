import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '../../store/useAppStore';
import { QrCode, CheckCircle2, Loader2, X } from 'lucide-react';

interface QRPaymentModalProps {
  totalAmount: number;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ totalAmount }) => {
  const { 
    qrPaymentState, 
    qrPayload, 
    activeSaleCode, 
    cancelQRPayment, 
    confirmQRPaymentSuccess 
  } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate QR canvas dynamically when payload changes
  useEffect(() => {
    if (canvasRef.current && qrPayload) {
      QRCode.toCanvas(
        canvasRef.current,
        qrPayload,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error al generar código QR:', error);
        }
      );
    }
  }, [qrPayload]);

  // Native lightweight canvas confetti particle burst
  useEffect(() => {
    if (qrPaymentState === 'SUCCESS' && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 400;

      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        alpha: number;
      }> = [];

      const colors = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24'];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2 - 20,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.7) * 14,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
        });
      }

      let animationFrame: number;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeCount = 0;

        particles.forEach((p) => {
          if (p.alpha > 0) {
            activeCount++;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.alpha -= 0.015;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        if (activeCount > 0) {
          animationFrame = requestAnimationFrame(render);
        }
      };

      render();
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [qrPaymentState]);

  if (qrPaymentState === 'IDLE') return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Confetti particle canvas overlay */}
        <canvas
          ref={confettiCanvasRef}
          className="absolute inset-0 pointer-events-none z-20"
        />

        {/* Top header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">Pago con QR Digital</h3>
              <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Pasarela Mercado Pago API</p>
            </div>
          </div>

          <button
            onClick={cancelQRPayment}
            disabled={qrPaymentState === 'SUCCESS'}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content by state */}
        {qrPaymentState === 'WAITING_SCAN' && (
          <div className="text-center space-y-5 relative z-10">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-cyan-500/10">
                <canvas ref={canvasRef} />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Esperando escaneo del cliente en la app de MP...</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total a Cobrar:</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ${totalAmount.toLocaleString('es-AR')}
              </span>
            </div>

            {/* Interactive simulator controls */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">Simulador de Webhook en Tiempo Real:</p>
              <button
                onClick={() => confirmQRPaymentSuccess(`MP-SIM-${Date.now()}`)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simular Cliente Escanea y Aprueba Pago
              </button>
              <button
                onClick={cancelQRPayment}
                className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Cancelar Transacción
              </button>
            </div>
          </div>
        )}

        {/* Success state */}
        {qrPaymentState === 'SUCCESS' && (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-white">¡Pago Aprobado con Éxito!</h4>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                Acreditación instantánea recibida vía Webhook
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Comprobante:</span>
                <span className="font-mono text-white font-bold">{activeSaleCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto Cobrado:</span>
                <span className="font-mono text-emerald-400 font-bold">${totalAmount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pasarela:</span>
                <span className="text-cyan-400 font-semibold">Mercado Pago Dynamic QR</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
