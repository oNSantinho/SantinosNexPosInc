import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Product, 
  Supplier, 
  Customer,
  StockMovement, 
  Sale, 
  SaleItem, 
  CashSession, 
  CashMovement, 
  PaymentMethod,
  QRPaymentState
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_CUSTOMERS,
  INITIAL_CASH_SESSION 
} from '../shared/mockData';

export interface CartItem extends SaleItem {
  maxStock: number;
}

interface AppState {
  // Auth & User Management
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  deleteUser: (id: string) => void;

  // Products & Stock
  products: Product[];
  stockMovements: StockMovement[];
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Customers & Accounts Receivable (Fiados)
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  adjustCustomerBalance: (customerId: string, amountChange: number, notes?: string) => void;

  // POS Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Cash Session & Money Control
  currentCashSession: CashSession | null;
  cashMovements: CashMovement[];
  openCashSession: (initialBalance: number, notes?: string) => void;
  closeCashSession: (actualBalance: number, notes?: string) => void;
  addCashMovement: (type: 'INCOME' | 'EXPENSE', amount: number, reason: string) => void;

  // Sales & QR Payment Workflow
  sales: Sale[];
  qrPaymentState: QRPaymentState;
  qrPayload: string | null;
  activeSaleCode: string | null;
  initiateQRPayment: (saleTotal: number) => void;
  cancelQRPayment: () => void;
  confirmQRPaymentSuccess: (qrTxId: string) => void;
  completeSale: (paymentMethod: PaymentMethod, cashReceived?: number, customerId?: string) => Sale | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      setCurrentUser: (user) => set({ currentUser: user }),
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: `usr-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },
      deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      // Products & Stock state
      products: INITIAL_PRODUCTS,
      stockMovements: [
        {
          id: 'mov-1',
          productId: 'prod-1',
          productName: 'Taladro Inalámbrico 20V Stanley',
          type: 'IN',
          quantity: 10,
          previousStock: 0,
          newStock: 10,
          reason: 'Ingreso inicial por compra a proveedor',
          userId: 'usr-1',
          userName: 'Santiago Admin',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
      addProduct: (prodData) => {
        const newProduct: Product = {
          ...prodData,
          id: `prod-${Date.now()}`,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
      },
      updateProduct: (id, prodData) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...prodData, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      adjustStock: (productId, quantity, type, reason) => {
        const state = get();
        const product = state.products.find((p) => p.id === productId);
        if (!product) return;

        let delta = quantity;
        if (type === 'OUT') delta = -Math.abs(quantity);
        if (type === 'IN') delta = Math.abs(quantity);

        const newStock = type === 'ADJUSTMENT' ? quantity : Math.max(0, product.stock + delta);
        const actualDiff = newStock - product.stock;

        const movement: StockMovement = {
          id: `mov-${Date.now()}`,
          productId,
          productName: product.name,
          type,
          quantity: Math.abs(actualDiff),
          previousStock: product.stock,
          newStock,
          reason,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          products: state.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
          stockMovements: [movement, ...state.stockMovements],
        }));
      },

      // Suppliers state
      suppliers: INITIAL_SUPPLIERS,
      addSupplier: (supData) => {
        const newSupplier: Supplier = {
          ...supData,
          id: `sup-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ suppliers: [newSupplier, ...state.suppliers] }));
      },
      updateSupplier: (id, supData) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...supData } : s)),
        }));
      },
      deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) })),

      // Customers & Accounts Receivable
      customers: INITIAL_CUSTOMERS,
      addCustomer: (custData) => {
        const newCustomer: Customer = {
          ...custData,
          id: `cust-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
      },
      updateCustomer: (id, custData) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...custData } : c)),
        }));
      },
      deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
      adjustCustomerBalance: (customerId, amountChange, _notes) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, balance: Math.max(0, c.balance + amountChange) } : c
          ),
        }));
      },

      // POS Cart
      cart: [],
      addToCart: (product) => {
        const state = get();
        const existingIndex = state.cart.findIndex((item) => item.productId === product.id);

        if (existingIndex > -1) {
          const existing = state.cart[existingIndex];
          if (existing.quantity >= product.stock) return;

          const updated = [...state.cart];
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
            subtotal: (existing.quantity + 1) * existing.unitPrice,
          };
          set({ cart: updated });
        } else {
          if (product.stock <= 0) return;
          set({
            cart: [
              ...state.cart,
              {
                productId: product.id,
                sku: product.sku,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
                subtotal: product.price,
                maxStock: product.stock,
              },
            ],
          });
        }
      },
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.productId === productId) {
              const validQty = Math.min(quantity, item.maxStock);
              return {
                ...item,
                quantity: validQty,
                subtotal: validQty * item.unitPrice,
              };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ cart: [] }),

      // Cash Session & Money Control
      currentCashSession: INITIAL_CASH_SESSION,
      cashMovements: [
        {
          id: 'cmov-1',
          sessionId: 'ses-101',
          type: 'INCOME',
          amount: 5000,
          reason: 'Fondo extra de cambio inicial',
          userId: 'usr-3',
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        },
        {
          id: 'cmov-2',
          sessionId: 'ses-101',
          type: 'EXPENSE',
          amount: 3200,
          reason: 'Pago de flete local de emergencia',
          userId: 'usr-3',
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        },
      ],
      openCashSession: (initialBalance, notes) => {
        const user = get().currentUser;
        const newSession: CashSession = {
          id: `ses-${Date.now()}`,
          cashierId: user.id,
          cashierName: user.name,
          openedAt: new Date().toISOString(),
          initialBalance,
          cashSales: 0,
          qrSales: 0,
          cardSales: 0,
          incomes: 0,
          expenses: 0,
          expectedBalance: initialBalance,
          status: 'OPEN',
          notes,
        };
        set({ currentCashSession: newSession });
      },
      closeCashSession: (actualBalance, notes) => {
        const session = get().currentCashSession;
        if (!session) return;

        const diff = actualBalance - session.expectedBalance;
        const closedSession: CashSession = {
          ...session,
          closedAt: new Date().toISOString(),
          actualBalance,
          difference: diff,
          status: 'CLOSED',
          notes,
        };

        set({ currentCashSession: closedSession });
      },
      addCashMovement: (type, amount, reason) => {
        const state = get();
        const session = state.currentCashSession;
        if (!session || session.status !== 'OPEN') return;

        const movement: CashMovement = {
          id: `cmov-${Date.now()}`,
          sessionId: session.id,
          type,
          amount,
          reason,
          userId: state.currentUser.id,
          createdAt: new Date().toISOString(),
        };

        const newIncomes = type === 'INCOME' ? session.incomes + amount : session.incomes;
        const newExpenses = type === 'EXPENSE' ? session.expenses + amount : session.expenses;
        const expected = session.initialBalance + session.cashSales + newIncomes - newExpenses;

        set({
          cashMovements: [movement, ...state.cashMovements],
          currentCashSession: {
            ...session,
            incomes: newIncomes,
            expenses: newExpenses,
            expectedBalance: expected,
          },
        });
      },

      // Sales & QR Payments
      sales: [
        {
          id: 'sale-1',
          code: 'VEN-00101',
          items: [
            {
              productId: 'prod-3',
              sku: 'ELE-003',
              productName: 'Cinta Aisladora 20m 3M Temflex',
              quantity: 2,
              unitPrice: 3200,
              subtotal: 6400,
            },
          ],
          subtotal: 6400,
          discount: 0,
          total: 6400,
          paymentMethod: 'QR',
          qrTransactionId: 'MP-TX-998811',
          cashierId: 'usr-3',
          cashierName: 'Valeria Cajera',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
      ],
      qrPaymentState: 'IDLE',
      qrPayload: null,
      activeSaleCode: null,

      initiateQRPayment: (saleTotal) => {
        const saleCode = `VEN-${Math.floor(10000 + Math.random() * 90000)}`;
        const mpPayload = `00020101021243500016com.mercadopago023000000123456789520459995303032540${saleTotal.toFixed(
          2
        )}5802AR5915SANTINO_NEXPOS6012BUENOS_AIRES62150511${saleCode}6304`;

        set({
          qrPaymentState: 'WAITING_SCAN',
          qrPayload: mpPayload,
          activeSaleCode: saleCode,
        });
      },

      cancelQRPayment: () => {
        set({
          qrPaymentState: 'IDLE',
          qrPayload: null,
          activeSaleCode: null,
        });
      },

      confirmQRPaymentSuccess: (_qrTxId) => {
        set({ qrPaymentState: 'SUCCESS' });
        setTimeout(() => {
          get().completeSale('QR', undefined);
          set({
            qrPaymentState: 'IDLE',
            qrPayload: null,
            activeSaleCode: null,
          });
        }, 1200);
      },

      completeSale: (paymentMethod, cashReceived, customerId) => {
        const state = get();
        if (state.cart.length === 0) return null;

        const total = state.cart.reduce((acc, item) => acc + item.subtotal, 0);
        const saleCode = state.activeSaleCode || `VEN-${Math.floor(10000 + Math.random() * 90000)}`;
        const changeGiven = paymentMethod === 'CASH' && cashReceived ? Math.max(0, cashReceived - total) : 0;

        const customer = customerId ? state.customers.find((c) => c.id === customerId) : undefined;

        const sale: Sale = {
          id: `sale-${Date.now()}`,
          code: saleCode,
          items: state.cart.map(({ maxStock, ...item }) => item),
          subtotal: total,
          discount: 0,
          total,
          paymentMethod,
          cashReceived: paymentMethod === 'CASH' ? cashReceived : undefined,
          changeGiven: paymentMethod === 'CASH' ? changeGiven : undefined,
          qrTransactionId: paymentMethod === 'QR' ? `MP-TX-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
          customerId,
          customerName: customer?.name,
          cashierId: state.currentUser.id,
          cashierName: state.currentUser.name,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        };

        // Decrement stock for all items
        state.cart.forEach((cartItem) => {
          get().adjustStock(
            cartItem.productId,
            cartItem.quantity,
            'OUT',
            `Venta realizada ${saleCode}`
          );
        });

        // Update customer credit debt balance if payment is CREDIT
        if (paymentMethod === 'CREDIT' && customerId) {
          get().adjustCustomerBalance(customerId, total);
        }

        // Update cash session totals
        const session = state.currentCashSession;
        if (session && session.status === 'OPEN') {
          const newCashSales = paymentMethod === 'CASH' ? session.cashSales + total : session.cashSales;
          const newQrSales = paymentMethod === 'QR' ? session.qrSales + total : session.qrSales;
          const newCardSales = paymentMethod === 'CARD' ? session.cardSales + total : session.cardSales;

          const expected = session.initialBalance + newCashSales + session.incomes - session.expenses;

          set({
            currentCashSession: {
              ...session,
              cashSales: newCashSales,
              qrSales: newQrSales,
              cardSales: newCardSales,
              expectedBalance: expected,
            },
          });
        }

        set({
          sales: [sale, ...state.sales],
          cart: [],
        });

        return sale;
      },
    }),
    {
      name: 'santino-nexpos-storage-v1',
      partialize: (state) => ({
        products: state.products,
        stockMovements: state.stockMovements,
        suppliers: state.suppliers,
        customers: state.customers,
        currentCashSession: state.currentCashSession,
        cashMovements: state.cashMovements,
        sales: state.sales,
      }),
    }
  )
);
