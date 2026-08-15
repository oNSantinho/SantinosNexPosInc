import * as XLSX from 'xlsx';
import { CashSession, Sale, CashMovement } from '../types';

export const exportCashSessionToExcel = (
  session: CashSession,
  sales: Sale[],
  movements: CashMovement[]
) => {
  const wb = XLSX.utils.book_new();

  const formattedDate = new Date(session.openedAt).toLocaleDateString('es-AR').replace(/\//g, '-');
  const closeDate = session.closedAt 
    ? new Date(session.closedAt).toLocaleTimeString('es-AR') 
    : 'En curso (No cerrada)';

  // 1. Resumen General del Turno de Caja
  const totalSalesAmount = session.cashSales + session.qrSales + session.cardSales;
  const differenceText = (session.difference || 0) === 0 
    ? '$0 (Caja Cuadrada)' 
    : (session.difference || 0) > 0 
    ? `+$${(session.difference || 0).toLocaleString('es-AR')} (Sobrante)` 
    : `-$${Math.abs(session.difference || 0).toLocaleString('es-AR')} (Faltante)`;

  const summaryData = [
    ['SANTINO NEXPOS - REPORTE DE CIERRE DE CAJA'],
    ['Fecha de Emisión:', new Date().toLocaleString('es-AR')],
    [''],
    ['DATOS DEL TURNO', ''],
    ['ID de Sesión:', session.id],
    ['Cajero a Cargo:', session.cashierName],
    ['Hora de Apertura:', new Date(session.openedAt).toLocaleString('es-AR')],
    ['Hora de Cierre:', closeDate],
    ['Estado de Caja:', session.status === 'CLOSED' ? 'CERRADA DEFINITIVA' : 'ABIERTA'],
    ['Observaciones:', session.notes || 'Sin notas'],
    [''],
    ['ARQUEO FINANCIERO', 'MONTO ($ ARS)'],
    ['(+) Fondo Inicial de Caja:', session.initialBalance],
    ['(+) Ventas en Efectivo:', session.cashSales],
    ['(+) Cobros Mercado Pago QR:', session.qrSales],
    ['(+) Ventas con Tarjeta:', session.cardSales],
    ['(=) TOTAL RECAUDADO EN VENTAS:', totalSalesAmount],
    ['(+) Otros Ingresos Manuales:', session.incomes],
    ['(-) Retiros / Gastos Manuales:', session.expenses],
    ['----------------------------------------', '------------------'],
    ['(=) SALDO TEÓRICO ESPERADO EN CAJA:', session.expectedBalance],
    ['(=) EFECTIVO REAL DECLARADO:', session.actualBalance !== undefined ? session.actualBalance : 'N/A'],
    ['(=) DIFERENCIA DE CAJA:', differenceText],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Cierre');

  // 2. Detalle de Ventas del Turno
  const sessionSales = sales.filter((s) => {
    const saleTime = new Date(s.createdAt).getTime();
    const openTime = new Date(session.openedAt).getTime();
    const closeTime = session.closedAt ? new Date(session.closedAt).getTime() : Date.now();
    return saleTime >= openTime && saleTime <= closeTime;
  });

  const salesRows = sessionSales.map((s) => ({
    'Código Ticket': s.code,
    'Fecha y Hora': new Date(s.createdAt).toLocaleString('es-AR'),
    'Cajero': s.cashierName,
    'Cliente': s.customerName || 'Consumidor Final',
    'Método de Pago': s.paymentMethod === 'CASH' ? 'Efectivo' : s.paymentMethod === 'QR' ? 'Mercado Pago QR' : s.paymentMethod === 'CARD' ? 'Tarjeta' : 'Cuenta Corriente',
    'Cantidad Ítems': s.items.reduce((acc, i) => acc + i.quantity, 0),
    'Subtotal ($)': s.subtotal,
    'Descuento ($)': s.discount,
    'Total Pagado ($)': s.total,
    'Vuelto ($)': s.changeGiven || 0,
    'ID Transacción': s.qrTransactionId || '-',
  }));

  const wsSales = XLSX.utils.json_to_sheet(salesRows.length > 0 ? salesRows : [{ 'Mensaje': 'No se registraron ventas en esta sesión' }]);
  wsSales['!cols'] = [
    { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas del Turno');

  // 3. Detalle de Movimientos de Caja Chica (Ingresos / Egresos)
  const sessionMovements = movements.filter((m) => m.sessionId === session.id);
  const movementsRows = sessionMovements.map((m) => ({
    'ID Movimiento': m.id,
    'Fecha y Hora': new Date(m.createdAt).toLocaleString('es-AR'),
    'Tipo': m.type === 'INCOME' ? 'INGRESO (+)' : 'EGRESO / RETIRO (-)',
    'Monto ($)': m.amount,
    'Motivo / Justificación': m.reason,
    'Usuario': m.userId,
  }));

  const wsMovements = XLSX.utils.json_to_sheet(movementsRows.length > 0 ? movementsRows : [{ 'Mensaje': 'No se registraron movimientos manuales' }]);
  wsMovements['!cols'] = [
    { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsMovements, 'Movimientos de Caja');

  // Exportar y descargar archivo .xlsx
  const filename = `Cierre_Caja_SantinoNexPOS_${formattedDate}_${session.id}.xlsx`;
  XLSX.writeFile(wb, filename);
};
