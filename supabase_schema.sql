-- =================================================================
-- SANTINO NEXPOS - DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- =================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS / ROLES (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER')),
    avatar_url TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE DISTRIBUIDORES / PROVEEDORES
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    tax_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    balance NUMERIC DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE CLIENTES (CRM / FIADOS)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    dni_or_tax_id TEXT,
    address TEXT,
    balance NUMERIC DEFAULT 0 NOT NULL,
    credit_limit NUMERIC DEFAULT 50000 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    cost NUMERIC NOT NULL,
    stock NUMERIC DEFAULT 0 NOT NULL,
    min_stock NUMERIC DEFAULT 5 NOT NULL,
    unit TEXT NOT NULL,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    barcode TEXT,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE MOVIMIENTOS DE STOCK (AUDITORÍA)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity NUMERIC NOT NULL,
    previous_stock NUMERIC NOT NULL,
    new_stock NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA DE SESIONES DE CAJA CHICA (ARQUEO)
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id TEXT PRIMARY KEY,
    cashier_id TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    initial_balance NUMERIC NOT NULL,
    cash_sales NUMERIC DEFAULT 0 NOT NULL,
    qr_sales NUMERIC DEFAULT 0 NOT NULL,
    card_sales NUMERIC DEFAULT 0 NOT NULL,
    incomes NUMERIC DEFAULT 0 NOT NULL,
    expenses NUMERIC DEFAULT 0 NOT NULL,
    expected_balance NUMERIC NOT NULL,
    actual_balance NUMERIC,
    difference NUMERIC,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    notes TEXT
);

-- 8. TABLA DE MOVIMIENTOS MANUALES DE CAJA (INGRESOS / RETIROS)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0 NOT NULL,
    total NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'QR', 'CARD', 'TRANSFER', 'CREDIT')),
    cash_received NUMERIC,
    change_given NUMERIC,
    qr_transaction_id TEXT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    cashier_id TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA DE ÍTEMS DE CADA VENTA
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- 11. HABILITAR PERMISOS DE LECTURA Y ESCRITURA PÚBLICA (ANON KEY)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for public anon key" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.cash_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.cash_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for public anon key" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
