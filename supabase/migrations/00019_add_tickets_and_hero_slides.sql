-- Create hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    button_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    event_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ticket_purchases table
CREATE TABLE IF NOT EXISTS public.ticket_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('automatic', 'manual')),
    payment_proof TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for hero_slides
CREATE POLICY "hero_slides_select_public" 
    ON public.hero_slides FOR SELECT 
    USING (is_active = true OR is_admin());

CREATE POLICY "hero_slides_all_admin" 
    ON public.hero_slides FOR ALL 
    USING (is_admin());

-- Setup RLS Policies for tickets
CREATE POLICY "tickets_select_public" 
    ON public.tickets FOR SELECT 
    USING (true);

CREATE POLICY "tickets_all_admin" 
    ON public.tickets FOR ALL 
    USING (is_admin());

-- Setup RLS Policies for ticket_purchases
CREATE POLICY "ticket_purchases_select_own" 
    ON public.ticket_purchases FOR SELECT 
    USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "ticket_purchases_insert_authenticated" 
    ON public.ticket_purchases FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ticket_purchases_all_admin" 
    ON public.ticket_purchases FOR ALL 
    USING (is_admin());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hero_slides_updated_at
    BEFORE UPDATE ON public.hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_purchases_updated_at
    BEFORE UPDATE ON public.ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update tickets available quantity when purchase is approved
CREATE OR REPLACE FUNCTION handle_ticket_purchase_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act when status changes to 'approved'
    IF NEW.status = 'approved' AND (OLD.status = 'pending' OR OLD.status = 'rejected') THEN
        UPDATE public.tickets
        SET available_quantity = available_quantity - NEW.quantity
        WHERE id = NEW.ticket_id;
    -- Handle case where an approved purchase is rejected/cancelled
    ELSIF OLD.status = 'approved' AND (NEW.status = 'rejected' OR NEW.status = 'pending') THEN
        UPDATE public.tickets
        SET available_quantity = available_quantity + OLD.quantity
        WHERE id = NEW.ticket_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_purchase_status_change
    AFTER UPDATE OF status ON public.ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_ticket_purchase_status_change();
