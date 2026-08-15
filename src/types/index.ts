export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  password?: string; // Clave de acceso para roles privilegiados
  createdAt: string;
}

export type ProductCategory = 
  | 'Ferretería' 
  | 'Almacén' 
  | 'Electrónica' 
  | 'Herramientas' 
  | 'Construcción' 
  | 'Hogar' 
  | 'General';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  taxId: string; // CUIT / RUT / RFC
  phone: string;
  email: string;
  address: string;
  balance: number; // Saldo de deuda/crédito con el distribuidor
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dniOrTaxId?: string;
  address?: string;
  balance: number; // Positivo = Deuda del cliente con el local (Fiado), Negativo = Saldo a favor
  creditLimit: number; // Límite de crédito fiado permitido
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: 'unidades' | 'kg' | 'mts' | 'litros' | 'cajas';
  supplierId?: string;
  supplierName?: string;
  barcode?: string;
  imageUrl?: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'QR' | 'CARD' | 'TRANSFER' | 'CREDIT';

export interface SaleItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  code: string; // e.g. VEN-00104
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  qrTransactionId?: string;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export type CashSessionStatus = 'OPEN' | 'CLOSED';

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export interface CashSession {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialBalance: number;
  cashSales: number;
  qrSales: number;
  cardSales: number;
  incomes: number;
  expenses: number;
  expectedBalance: number;
  actualBalance?: number;
  difference?: number;
  status: CashSessionStatus;
  notes?: string;
}

export type QRPaymentState = 'IDLE' | 'GENERATING' | 'WAITING_SCAN' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
