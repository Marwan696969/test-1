-- ==========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- ==========================================
-- Implementation: Slixy Minimalist E-commerce
-- Requirements: Products management (Admin), Order processing (Users/Admin)
-- Auth: Supabase Auth (Email/Password)
-- 
-- Instructions:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project and open the "SQL Editor"
-- 3. Click "New Query", paste this script, and click "Run"

-- ==========================================
-- 1. PRODUCTS TABLE
-- ==========================================
-- Stores the curated inventory of pieces
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL, -- e.g., 't-shirt', 'hoodie'
    images TEXT[] NOT NULL DEFAULT '{}',
    stock INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- POLICY: Public Visibility
-- Anyone can view our products collection
CREATE POLICY "Public Read Access"
ON public.products FOR SELECT
USING (true);

-- POLICY: Administrative Control
-- Only the project owner (admin) can modify the inventory
-- NOTE: Modify 'mwhbadawi@gmail.com' to match your admin account if different
CREATE POLICY "Admin CRUD Access"
ON public.products FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'mwhbadawi@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'mwhbadawi@gmail.com');


-- ==========================================
-- 2. ORDERS TABLE
-- ==========================================
-- Records customer purchases and fulfillment status
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    email TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of {productId, quantity, productName, productCategory}
    total NUMERIC NOT NULL,
    address TEXT NOT NULL,
    apartment TEXT,
    phone TEXT NOT NULL,
    payment_method TEXT DEFAULT 'cod',
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- POLICY: Customer Privacy
-- Users can only see and manage their own order history
CREATE POLICY "User Personal Order View"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "User Order Creation"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- POLICY: Administrative Oversight
-- Admins can view and update all orders for fulfillment
CREATE POLICY "Admin Oversight Read"
ON public.orders FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'mwhbadawi@gmail.com');

CREATE POLICY "Admin Oversight Update"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'mwhbadawi@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'mwhbadawi@gmail.com');
